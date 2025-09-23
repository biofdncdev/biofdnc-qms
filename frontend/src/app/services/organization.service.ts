import { Injectable } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseCoreService } from './supabase-core.service';

@Injectable({
  providedIn: 'root',
})
export class OrganizationService {
  constructor(private supabase: SupabaseCoreService) {}

  private get client(): SupabaseClient {
    return this.supabase.getClient();
  }

  // ===== Departments =====
  async listDepartments() {
    const { data } = await this.client
      .from('departments')
      .select('id,name,code,company_code,company_name')
      .order('name', { ascending: true });
    
    try { 
      (window as any).__app_cached_departments = Array.isArray(data)? data: []; 
    } catch {}
    
    return Array.isArray(data) ? data : [];
  }
  
  async upsertDepartment(row: { 
    id?: string; 
    name: string; 
    code: string; 
    company_code?: string | null; 
    company_name?: string | null 
  }) {
    const payload: any = { ...row, updated_at: new Date().toISOString() };
    if (!payload.id) payload.id = crypto.randomUUID();
    
    return this.client
      .from('departments')
      .upsert(payload, { onConflict: 'id' })
      .select('*')
      .single();
  }
  
  async deleteDepartment(id: string) {
    return this.client.from('departments').delete().eq('id', id);
  }

  async countDepartmentUsage(params: { code: string; name: string }) {
    let total = 0;
    
    try {
      const { count } = await this.client
        .from('record_form_meta')
        .select('form_id', { count: 'exact', head: true })
        .eq('department', params.name);
      total += count || 0;
    } catch {}
    
    try {
      // departments is string[]
      const { count } = await this.client
        .from('audit_progress')
        .select('number', { count: 'exact', head: true })
        .contains('departments', [params.name]);
      total += count || 0;
    } catch {}
    
    return total;
  }

  // ===== Companies =====
  async listCompanies() {
    try {
      const { data } = await this.client
        .from('companies')
        .select('*')
        .order('code', { ascending: true }) as any;
      return Array.isArray(data) ? data : [];
    } catch {
      // Fallback: derive company list from departments if companies table is unavailable
      try {
        const { data } = await this.client
          .from('departments')
          .select('company_code,company_name') as any;
        
        const rows = Array.isArray(data) ? data : [];
        const map: Record<string, { id?: string; code: string; name: string | null }> = {};
        
        for (const r of rows) {
          const code = (r as any)?.company_code; 
          if (!code) continue;
          const name = (r as any)?.company_name || null;
          if (!map[code]) map[code] = { code, name };
          if (name) map[code].name = name;
        }
        
        return Object.values(map);
      } catch { 
        return [] as any[]; 
      }
    }
  }
  
  async upsertCompany(row: { id?: string; code: string; name: string }) {
    const payload: any = { ...row, updated_at: new Date().toISOString() };
    if (!payload.id) payload.id = crypto.randomUUID();
    
    try {
      return await this.client
        .from('companies')
        .upsert(payload, { onConflict: 'id' })
        .select('*')
        .single();
    } catch {
      // Fallback: update departments rows that reference this company_code
      try { 
        await this.client
          .from('departments')
          .update({ company_name: payload.name })
          .eq('company_code', payload.code); 
      } catch {}
      
      return { data: payload } as any;
    }
  }
}
