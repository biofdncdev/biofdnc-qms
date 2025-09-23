import { Injectable } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseCoreService } from './supabase-core.service';

@Injectable({
  providedIn: 'root',
})
export class AuditService {
  constructor(private supabase: SupabaseCoreService) {}

  private get client(): SupabaseClient {
    return this.supabase.getClient();
  }

  // ===== Audit Assessment Master =====
  async getGivaudanAssessment(number: number) {
    return this.client
      .from('audit_items')
      .select('*')
      .eq('number', number)
      .single();
  }


  async upsertAuditItems(items: Array<{ 
    number: number; 
    titleKo: string; 
    titleEn?: string | null 
  }>) {
    if (!Array.isArray(items) || items.length === 0) return { ok: true } as any;
    
    const rows = items
      .map(it => ({ 
        number: Number(it.number), 
        title_ko: it.titleKo ?? null, 
        title_en: it.titleEn ?? null 
      }))
      .filter(r => Number.isFinite(r.number));
    
    const BATCH = 400;
    const CONCURRENCY = 3;
    const batches: any[][] = [];
    for (let i = 0; i < rows.length; i += BATCH) {
      batches.push(rows.slice(i, i + BATCH));
    }

    const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));
    const upsertBatch = async (part: any[]) => {
      let attempt = 0;
      while (true) {
        attempt++;
        const { error } = await this.client
          .from('audit_items')
          .upsert(part, { onConflict: 'number' });
        if (!error) return;
        
        const msg = (error as any)?.message || '';
        const status = (error as any)?.code || (error as any)?.status;
        if (attempt >= 3 || !(status === '429' || String(status).startsWith('5'))) {
          throw error;
        }
        const delay = 400 * Math.pow(2, attempt - 1);
        await sleep(delay);
      }
    };

    let idx = 0; 
    let lastErr: any = null;
    const workers: Promise<void>[] = new Array(CONCURRENCY).fill(0).map(async () => {
      while (idx < batches.length) {
        const my = idx++;
        const part = batches[my];
        try { 
          await upsertBatch(part); 
        } catch (e) { 
          lastErr = e; 
        }
      }
    });
    
    await Promise.all(workers);
    
    if (lastErr) {
      console.warn('upsertAuditItems failed (ignored):', lastErr);
      return { ok: false, error: lastErr } as any;
    }
    return { ok: true } as any;
  }

  // ===== Audit Progress =====
  async getGivaudanProgress(number: number, audit_date?: string | null) {
    return this.client
      .from('audit_progress')
      .select('*')
      .eq('number', number)
      .maybeSingle();
  }
  
  async getGivaudanProgressByDate(number: number, audit_date: string) {
    return this.client
      .from('audit_progress')
      .select('*')
      .eq('number', number)
      .eq('audit_date', audit_date)
      .maybeSingle();
  }

  async listAllGivaudanProgress(audit_date?: string | null) {
    return this.client
      .from('audit_progress')
      .select('*')
      .order('number', { ascending: true });
  }
  
  async listGivaudanProgressByDate(audit_date: string) {
    return this.client
      .from('audit_progress')
      .select('*')
      .eq('audit_date', audit_date)
      .order('number', { ascending: true });
  }

  async getAuditDateCreatedAt(audit_date: string) {
    const { data } = await this.client
      .from('audit_progress')
      .select('updated_at')
      .eq('audit_date', audit_date)
      .order('updated_at', { ascending: true })
      .limit(1)
      .maybeSingle();
    return (data as any)?.updated_at as string | undefined;
  }

  async deleteGivaudanProgressByDate(audit_date: string) {
    return this.client
      .from('audit_progress')
      .delete()
      .eq('audit_date', audit_date);
  }

  // ===== Audit Items Management =====
  async listAuditItems(): Promise<any> {
    const { data, error } = await this.client
      .from('audit_items')
      .select('number,title_ko,title_en,is_active,category_no,question,translation')
      .order('number', { ascending: true });
    
    if (error) throw error;
    // Ensure is_active has a default value
    return (data || []).map((item: any) => ({
      ...item,
      is_active: item.is_active !== false // Default to true if undefined
    }));
  }

  async getActiveAuditItems(): Promise<any> {
    const { data, error } = await this.client
      .from('audit_items')
      .select('*')
      .eq('is_active', true)
      .order('number', { ascending: true });
    
    if (error) throw error;
    return data || [];
  }

  async updateAuditItem(number: number, updates: any): Promise<any> {
    const { data, error } = await this.client
      .from('audit_items')
      .update(updates)
      .eq('number', number)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async toggleAuditItemActive(number: number, isActive: boolean): Promise<any> {
    const { data, error } = await this.client
      .from('audit_items')
      .update({ is_active: isActive })
      .eq('number', number)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async upsertGivaudanProgress(row: {
    number: number;
    note?: string | null;
    status?: string | null;
    departments?: string[] | null;
    owners?: string[] | null;
    companies?: string[] | null;
    comments?: Array<{ user: string; time: string; text: string }> | null;
    company?: string | null;
    updated_by?: string | null;
    updated_by_name?: string | null;
    audit_date?: string | null;
  }) {
    return this.client
      .from('audit_progress')
      .upsert(row, { onConflict: 'number,audit_date', ignoreDuplicates: false });
  }

  async upsertGivaudanProgressMany(rows: Array<{
    number: number;
    note?: string | null;
    status?: string | null;
    departments?: string[] | null;
    owners?: string[] | null;
    companies?: string[] | null;
    comments?: Array<{ user: string; time: string; text: string }> | null;
    company?: string | null;
    updated_by?: string | null;
    updated_by_name?: string | null;
    audit_date?: string | null;
  }>) {
    if (!Array.isArray(rows) || rows.length===0) {
      return { data: [], error: null } as any;
    }
    
    const BATCH = 50;
    let lastError: any = null;
    
    for (let i=0; i<rows.length; i+=BATCH) {
      const part = rows.slice(i, i+BATCH);
      const { error } = await this.client
        .from('audit_progress')
        .upsert(part, { 
          onConflict: 'number,audit_date', 
          ignoreDuplicates: false, 
          defaultToNull: false 
        }) as any;
      if (error) lastError = error;
    }
    
    if (lastError) throw lastError;
    return { data: [], error: null } as any;
  }

  async listSavedAuditDates() {
    const { data } = await this.client
      .from('audit_progress')
      .select('audit_date')
      .not('audit_date','is', null)
      .order('audit_date', { ascending: false });
    
    const set = new Set<string>();
    for (const r of (Array.isArray(data) ? data : [])) {
      const d = (r as any)?.audit_date; 
      if (d) set.add(String(d));
    }
    return Array.from(set);
  }

  // ===== Audit Date Meta =====
  async upsertAuditDateMeta(audit_date: string, meta: { 
    company?: string | null; 
    memo?: string | null 
  }) {
    try {
      const { data, error } = await this.client
        .from('audit_date_meta')
        .upsert({
          audit_date,
          company: meta.company ?? null,
          memo: meta.memo ?? '',
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'audit_date'
        })
        .select()
        .single();
      
      if (error) {
        console.error('[upsertAuditDateMeta] Error:', error);
        return { error } as any;
      }
      
      return { data, error: null } as any;
    } catch(err) { 
      console.error('[upsertAuditDateMeta] Unexpected error:', err);
      return { error: err } as any; 
    }
  }

  async getAuditDateMeta(audit_date: string): Promise<{ 
    company?: string | null; 
    memo?: string | null 
  } | null> {
    try {
      const { data, error } = await this.client
        .from('audit_date_meta')
        .select('company, memo')
        .eq('audit_date', audit_date)
        .maybeSingle();
      
      // Ignore errors if table doesn't exist or no rows found
      if (error && error.code !== 'PGRST116' && !error.message?.includes('audit_date_meta')) {
        console.error('[getAuditDateMeta] Error:', error);
      }
      
      if (data) {
        return { company: data.company ?? null, memo: data.memo ?? '' };
      }
      
      return null;
    } catch { 
      return null; 
    }
  }

  async listAllAuditDateMeta(): Promise<Array<{ 
    audit_date: string; 
    company?: string | null; 
    memo?: string | null 
  }>> {
    try {
      const { data, error } = await this.client
        .from('audit_date_meta')
        .select('audit_date, company, memo')
        .order('audit_date', { ascending: false });
      
      // If table doesn't exist, return empty array
      if (error && error.message?.includes('audit_date_meta')) {
        console.warn('[listAllAuditDateMeta] Table not found, returning empty array');
        return [];
      }
      
      if (!data) return [];
      
      return data.map(row => ({
        audit_date: String(row.audit_date),
        company: row.company ?? null,
        memo: row.memo ?? ''
      }));
    } catch { 
      return []; 
    }
  }

  // ===== Audit Companies =====
  async listAuditCompanies() {
    const { data } = await this.client
      .from('audit_companies')
      .select('*')
      .order('name', { ascending: true });
    return Array.isArray(data) ? data : [];
  }
  
  async addAuditCompany(row: { name: string; note?: string | null }) {
    return this.client
      .from('audit_companies')
      .insert(row)
      .select('*')
      .single();
  }
  
  async updateAuditCompany(id: string, row: Partial<{ name: string; note: string }>) {
    return this.client
      .from('audit_companies')
      .update(row)
      .eq('id', id)
      .select('*')
      .single();
  }
  
  async deleteAuditCompany(id: string) {
    return this.client
      .from('audit_companies')
      .delete()
      .eq('id', id);
  }

  // ===== Audit Resources =====
  async listGivaudanResources(number: number) {
    return this.client
      .from('audit_resources')
      .select('*')
      .eq('number', number)
      .order('created_at', { ascending: true });
  }

  async addGivaudanResource(row: any) {
    return this.client
      .from('audit_resources')
      .insert(row)
      .select()
      .single();
  }

  async updateGivaudanResource(id: string, row: any) {
    return this.client
      .from('audit_resources')
      .update(row)
      .eq('id', id)
      .select()
      .single();
  }

  async deleteGivaudanResource(id: string) {
    return this.client
      .from('audit_resources')
      .delete()
      .eq('id', id);
  }

  async uploadAuditFile(file: File, path: string) {
    const { data, error } = await this.client
      .storage
      .from('audit_resources')
      .upload(path, file, { upsert: true });
    
    if (error) throw error;
    
    const { data: urlData } = this.client.storage
      .from('audit_resources')
      .getPublicUrl(data.path);
    
    return { path: data.path, publicUrl: urlData.publicUrl };
  }
}
