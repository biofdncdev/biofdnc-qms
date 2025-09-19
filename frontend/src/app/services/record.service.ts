import { Injectable } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseService } from './supabase.service';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root',
})
export class RecordService {
  constructor(
    private supabase: SupabaseService,
    private storage: StorageService
  ) {}

  private get client(): SupabaseClient {
    return this.supabase.getClient();
  }

  // ===== RMD Form Metadata =====
  async getFormMeta(form_id: string) {
    // Try legacy by record_no first; fallback to form_id if exists
    try {
      const { data, error } = await this.client
        .from('record_form_meta')
        .select('*')
        .eq('record_no', form_id)
        .maybeSingle();
      if (!error && data) return { data, error: null } as any;
    } catch {}
    
    return this.client
      .from('record_form_meta')
      .select('*')
      .eq('form_id', form_id)
      .maybeSingle();
  }
  
  async upsertFormMeta(row: { 
    record_no?: string; 
    record_name?: string; 
    department?: string | null; 
    owner?: string | null; 
    method?: string | null; 
    period?: string | null; 
    standard?: string | null; 
    standard_category?: string | null; 
    certs?: string[] | null; 
    features?: any; 
    use_departments?: string[] | null; 
  }) {
    const payload: any = { ...row };
    
    // Ensure record_id for new records
    if (row.record_no) {
      // Check if record exists
      const { data: existing } = await this.client
        .from('record_form_meta')
        .select('record_id')
        .eq('record_no', row.record_no)
        .maybeSingle();
      
      if (existing?.record_id) {
        payload.record_id = existing.record_id;
      } else {
        // Always generate record_id for new records
        payload.record_id = crypto.randomUUID();
      }
    }
    
    try { 
      const { data: u } = await this.client.auth.getUser(); 
      payload.updated_by = u.user?.id || null; 
    } catch {}
    
    // Try full upsert first
    try {
      const res: any = await this.client
        .from('record_form_meta')
        .upsert(payload)
        .select('*')
        .maybeSingle();
      if (!res?.error) return res;
    } catch {}
    
    // Fallback: remove optional columns and retry
    const fallback: any = { ...payload };
    delete fallback.features;
    delete fallback.use_departments;
    
    // Ensure record_id is always present
    if (!fallback.record_id && row.record_no) {
      fallback.record_id = crypto.randomUUID();
    }
    
    try {
      const res2: any = await this.client
        .from('record_form_meta')
        .upsert(fallback)
        .select('*')
        .maybeSingle();
      if (res2?.error) { 
        console.warn('[RecordService] upsertFormMeta fallback failed', res2?.error); 
      }
      return res2;
    } catch(e) {
      console.error('[RecordService] upsertFormMeta failed', e);
      throw e;
    }
  }

  async updateFormMetaByRecordNo(prevRecordNo: string, changes: { 
    record_no?: string; 
    record_name?: string; 
    department?: string | null; 
    owner?: string | null; 
    method?: string | null; 
    period?: string | null; 
    standard?: string | null; 
    standard_category?: string | null; 
    certs?: string[] | null; 
    features?: any; 
    use_departments?: string[] | null; 
  }) {
    const payload: any = { ...changes };
    try { 
      const { data: u } = await this.client.auth.getUser(); 
      payload.updated_by = u.user?.id || null; 
    } catch {}
    
    const res = await this.client
      .from('record_form_meta')
      .update(payload)
      .eq('record_no', prevRecordNo)
      .select('*')
      .maybeSingle();
    return res;
  }
  
  async deleteFormMeta(recordNo: string) {
    const { data, error } = await this.client
      .from('record_form_meta')
      .delete()
      .eq('record_no', recordNo);
    if (error) throw error;
    return data;
  }
  
  async listAllFormMeta() {
    try {
      const { data, error } = await this.client
        .from('record_form_meta')
        .select('record_id,record_no,record_name,department,owner,method,period,standard,standard_category,features,use_departments,certs');
      if (!error && Array.isArray(data)) return data;
      throw error;
    } catch {
      // Fallback for older schemas without features/use_departments
      try {
        const { data } = await this.client
          .from('record_form_meta')
          .select('record_id,record_no,record_name,department,owner,method,period,standard,standard_category,certs');
        return Array.isArray(data) ? data : [];
      } catch { 
        return [] as any[]; 
      }
    }
  }

  async getRecordIdFromRecordNo(record_no: string): Promise<string | null> {
    try {
      const { data } = await this.client
        .from('record_form_meta')
        .select('record_id')
        .eq('record_no', record_no)
        .maybeSingle();
      return data?.record_id || null;
    } catch {
      return null;
    }
  }

  // ===== Temperature/Humidity Records =====
  async getThRecord(formId: string, weekStart: string) {
    // Try by record_id first (UUID format)
    if (formId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      const res = await this.client
        .from('rmd_th_record')
        .select('*')
        .eq('record_id', formId)
        .eq('week_start', weekStart)
        .maybeSingle();
      if (res.data) return res;
    }
    // Fallback to form_id (record_no) for backward compatibility
    return this.client
      .from('rmd_th_record')
      .select('*')
      .eq('form_id', formId)
      .eq('week_start', weekStart)
      .maybeSingle();
  }

  async upsertThRecord(row: { 
    form_id: string; 
    week_start: string; 
    image_url?: string | null; 
    strokes?: any; 
  }) {
    const payload: any = { ...row };
    
    // If form_id looks like a UUID, use it as record_id
    if (row.form_id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      payload.record_id = row.form_id;
      // Also keep form_id for backward compatibility
    }
    
    return this.client
      .from('rmd_th_record')
      .upsert(payload, { 
        onConflict: payload.record_id ? 'record_id,week_start' : 'form_id,week_start' 
      })
      .select()
      .maybeSingle();
  }

  async getLatestThRecord(formId: string) {
    // Try by record_id first (UUID format)
    if (formId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      const res = await this.client
        .from('rmd_th_record')
        .select('*')
        .eq('record_id', formId)
        .order('week_start', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (res.data) return res;
    }
    // Fallback to form_id for backward compatibility
    return this.client
      .from('rmd_th_record')
      .select('*')
      .eq('form_id', formId)
      .order('week_start', { ascending: false })
      .limit(1)
      .maybeSingle();
  }

  async listThWeeks(formId: string) {
    // Try by record_id first (UUID format)
    if (formId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      const res = await this.client
        .from('rmd_th_record')
        .select('week_start')
        .eq('record_id', formId)
        .order('week_start', { ascending: true });
      if (res.data && res.data.length > 0) return res;
    }
    // Fallback to form_id for backward compatibility
    return this.client
      .from('rmd_th_record')
      .select('week_start')
      .eq('form_id', formId)
      .order('week_start', { ascending: true });
  }

  async uploadRecordImage(blob: Blob, path: string) {
    return this.storage.uploadRecordImage(blob, path);
  }

  // ===== RMD Standard Categories & Records =====
  async listRmdCategories() {
    try {
      const { data, error } = await this.client
        .from('rmd_standard_categories')
        .select('*')
        .order('doc_prefix', { ascending: true });
      if (!error && Array.isArray(data)) return data;
      throw error;
    } catch {
      try {
        const { data } = await this.client
          .from('standard_categories')
          .select('*')
          .order('doc_prefix', { ascending: true });
        return Array.isArray(data) ? data : [];
      } catch { 
        return [] as any[]; 
      }
    }
  }
  
  async upsertRmdCategory(row: { 
    id?: string; 
    name: string; 
    doc_prefix: string; 
    department_code?: string | null 
  }) {
    const now = new Date().toISOString();
    const payload: any = { ...row, updated_at: now };
    if (!payload.id) payload.id = crypto.randomUUID();
    
    try {
      return await this.client
        .from('rmd_standard_categories')
        .upsert(payload, { onConflict: 'id' })
        .select('*')
        .single();
    } catch {
      // Fallback to renamed table
      return await this.client
        .from('standard_categories')
        .upsert(payload, { onConflict: 'id' })
        .select('*')
        .single();
    }
  }
  
  async deleteRmdCategory(id: string) {
    try { 
      return await this.client.from('rmd_standard_categories').delete().eq('id', id); 
    } catch { 
      return await this.client.from('standard_categories').delete().eq('id', id); 
    }
  }

  // ===== RMD Records CRUD =====
  async listRmdRecords() {
    const { data } = await this.client
      .from('rmd_records')
      .select('*')
      .order('created_at', { ascending: false });
    return Array.isArray(data) ? data : [];
  }
  
  async isRecordDocNoTaken(doc_no: string) {
    try {
      const { data } = await this.client
        .from('record_form_meta')
        .select('record_no')
        .eq('record_no', doc_no)
        .maybeSingle();
      if ((data as any)?.record_no) return true;
    } catch {}
    
    // Fallback for older schemas with form_id
    try {
      const { data } = await this.client
        .from('record_form_meta')
        .select('form_id')
        .eq('form_id', doc_no)
        .maybeSingle();
      if ((data as any)?.form_id) return true;
    } catch {}
    
    return false;
  }
  
  async getNextRecordDocNo(docPrefix: string) {
    const prefix = `${docPrefix}-`;
    const used: string[] = [];
    
    // Try record_no first
    try {
      const { data } = await this.client
        .from('record_form_meta')
        .select('record_no')
        .ilike('record_no', `${prefix}%`) as any;
      used.push(...((Array.isArray(data)? data: []).map((r:any)=>r.record_no||'')));
    } catch {}
    
    // Fallback to form_id
    try {
      const { data } = await this.client
        .from('record_form_meta')
        .select('form_id')
        .ilike('form_id', `${prefix}%`) as any;
      used.push(...((Array.isArray(data)? data: []).map((r:any)=>r.form_id||'')));
    } catch {}
    
    const nums = used.map(str => {
      const m = String(str || '').match(/^(.*?-FR-)(\d{2})$/);
      return m ? Number(m[2]) : 0;
    }).filter(n => Number.isFinite(n));
    
    const max = nums.length ? Math.max(...nums) : 0;
    const next = Math.min(99, max + 1);
    const seq = String(next).padStart(2, '0');
    return `${prefix}${seq}`;
  }
  
  async reserveRecordNumber(doc_no: string) { 
    /* no-op in legacy mode */ 
  }
  
  async upsertRmdRecord(row: { 
    id: string; 
    title: string; 
    category_id: string; 
    doc_no: string; 
  }) {
    const taken = await this.isRecordDocNoTaken(row.doc_no);
    if (taken) { 
      throw new Error('이미 사용 중인 기록번호입니다.'); 
    }
    
    const base: any = { 
      record_no: row.doc_no, 
      record_name: row.title, 
      category_id: row.category_id 
    };
    
    try { 
      const { data: u } = await this.client.auth.getUser(); 
      base.updated_by = u.user?.id || null; 
    } catch {}
    
    try {
      const res: any = await this.client
        .from('record_form_meta')
        .upsert(base, { onConflict: 'record_no' })
        .select('*')
        .maybeSingle();
      if (res?.error) throw res.error;
      return res;
    } catch {
      const payload2: any = { ...base, form_id: row.doc_no };
      const res2: any = await this.client
        .from('record_form_meta')
        .upsert(payload2, { onConflict: 'form_id' })
        .select('*')
        .maybeSingle();
      return res2;
    }
  }
  
  async deleteRmdRecord(id: string) {
    return this.client.from('rmd_records').delete().eq('id', id);
  }

  // ===== Record PDFs =====
  async uploadRecordPdf(file: File, form_id: string) {
    return this.storage.uploadRecordPdf(file, form_id);
  }
  
  async listRecordPdfs(form_id: string) {
    return this.storage.listRecordPdfs(form_id);
  }
  
  async deleteRecordPdf(path: string, bucket?: string) {
    return this.storage.deleteRecordPdf(path, bucket);
  }

  async updateRecordFileIndexEntry(recordId: string, path: string, data: any) {
    const { data: user } = await this.client.auth.getUser();
    return this.client
      .from('record_file_index')
      .upsert({
        record_id: recordId,
        path: path,
        ...data,
        updated_by: user?.user?.id || null,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
  }
}
