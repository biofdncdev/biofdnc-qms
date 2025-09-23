import { Injectable } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseCoreService } from './supabase-core.service';

export interface RecordFileIndexEntry {
  originalName?: string | null;
  uploadedBy?: string | null;
  uploadedAt?: string | null;
}

export interface RecordFileIndexMap { 
  [path: string]: RecordFileIndexEntry 
}

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private recordIndexBucketId = 'rmd_records';
  private compositionTemplatePath = 'composition/template.xlsx';

  constructor(private supabase: SupabaseCoreService) {}

  private get client(): SupabaseClient {
    return this.supabase.getClient();
  }

  // ===== Audit Files =====
  async uploadAuditFile(file: File, path: string) {
    // Ensure a bucket named 'audit_resources' exists in Supabase Storage
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

  // ===== Record Images (Temperature/Humidity) =====
  async uploadRecordImage(blob: Blob, path: string) {
    const { data, error } = await this.client.storage
      .from('rmd_records')
      .upload(path, blob, { upsert: true, contentType: 'image/png' });
    
    if (error) throw error;
    
    const { data: urlData } = this.client.storage
      .from('rmd_records')
      .getPublicUrl(data.path);
    
    return { path: data.path, publicUrl: urlData.publicUrl };
  }

  // ===== Record PDFs Storage =====
  async uploadRecordPdf(file: File, form_id: string) {
    // form_id가 UUID 형식인지 확인 (record_id) 아니면 record_no
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(form_id);
    let record_id = form_id;
    
    // record_no인 경우 record_id를 조회
    if (!isUuid) {
      try {
        const { data } = await this.client
          .from('record_form_meta')
          .select('record_id')
          .eq('record_no', form_id)
          .maybeSingle();
        if (data?.record_id) {
          record_id = data.record_id;
        }
      } catch {}
    }
    
    // 원본 파일명 저장
    const original = file.name || 'document';
    
    // 확장자 분리
    const lastDotIndex = original.lastIndexOf('.');
    const base = lastDotIndex > 0 ? original.substring(0, lastDotIndex) : original;
    const ext = lastDotIndex > 0 ? original.substring(lastDotIndex) : '';
    const extLower = ext.toLowerCase();
    const isPdf = (file as any).type === 'application/pdf' || extLower === '.pdf';
    
    // 저장용 파일명: 타임스탬프 + 랜덤 문자열 + 확장자 (한글 파일명 문제 회피)
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const storageFileName = `${timestamp}_${randomStr}${ext}`;
    
    // 원본 파일명은 그대로 유지 (UI 표시용)
    const cleanFileName = original;
    
    // record_id를 폴더명으로 사용
    const safeFolder = String(record_id).replace(/[^a-zA-Z0-9._-]/g,'-');
    
    // rmd_pdfs: PDF 전용, rmd_records: 그 외 파일 (이미지/오피스/한글 등)
    const pdfsPath = `${safeFolder}/${storageFileName}`;
    
    try {
      if (isPdf) {
        // 1) PDF는 전용 버킷 우선
        const { error: pdfsError, data: pdfsData } = await this.client.storage
          .from('rmd_pdfs')
          .upload(pdfsPath, file, { 
            upsert: true, 
            contentType: (file as any).type || undefined,
            cacheControl: '3600'
          });
        
        if (!pdfsError && pdfsData) {
          const { data: pub } = this.client.storage
            .from('rmd_pdfs')
            .getPublicUrl(pdfsData.path);
          
          // Persist cross-device metadata
          try { 
            const { data: u } = await this.client.auth.getUser(); 
            const who = (u as any)?.user?.email || (u as any)?.user?.id || null; 
            await this.updateRecordFileIndexEntry(record_id, pdfsData.path, { 
              originalName: cleanFileName, 
              uploadedBy: who, 
              uploadedAt: new Date().toISOString() 
            }); 
          } catch {}
          
          return { 
            path: pdfsData.path, 
            publicUrl: pub.publicUrl, 
            bucket: 'rmd_pdfs', 
            originalName: cleanFileName 
          } as any;
        }
        
        // 실패 시 일반 버킷으로
        const recordsPath = `pdfs/${safeFolder}/${storageFileName}`;
        const { error, data } = await this.client.storage
          .from('rmd_records')
          .upload(recordsPath, file, { 
            upsert: true, 
            contentType: (file as any).type || undefined, 
            cacheControl: '3600' 
          });
        
        if (error) {
          console.error('파일 업로드 실패:', pdfsError || error);
          throw pdfsError || error;
        }
        
        const { data: pub } = this.client.storage
          .from('rmd_records')
          .getPublicUrl(data.path);
        
        try { 
          const { data: u } = await this.client.auth.getUser(); 
          const who = (u as any)?.user?.email || (u as any)?.user?.id || null; 
          await this.updateRecordFileIndexEntry(record_id, data.path, { 
            originalName: cleanFileName, 
            uploadedBy: who, 
            uploadedAt: new Date().toISOString() 
          }); 
        } catch {}
        
        return { 
          path: data.path, 
          publicUrl: pub.publicUrl, 
          bucket: 'rmd_records', 
          originalName: cleanFileName 
        } as any;
        
      } else {
        // 2) 비-PDF는 바로 rmd_records에 저장
        const recordsPath = `pdfs/${safeFolder}/${storageFileName}`;
        const { error, data } = await this.client.storage
          .from('rmd_records')
          .upload(recordsPath, file, { 
            upsert: true, 
            contentType: (file as any).type || undefined, 
            cacheControl: '3600' 
          });
        
        if (error) {
          console.error('파일 업로드 실패 (records):', error);
          throw error;
        }
        
        const { data: pub } = this.client.storage
          .from('rmd_records')
          .getPublicUrl(data.path);
        
        try { 
          const { data: u } = await this.client.auth.getUser(); 
          const who = (u as any)?.user?.email || (u as any)?.user?.id || null; 
          await this.updateRecordFileIndexEntry(record_id, data.path, { 
            originalName: cleanFileName, 
            uploadedBy: who, 
            uploadedAt: new Date().toISOString() 
          }); 
        } catch {}
        
        return { 
          path: data.path, 
          publicUrl: pub.publicUrl, 
          bucket: 'rmd_records', 
          originalName: cleanFileName 
        } as any;
      }
      
    } catch (uploadError: any) {
      console.error('파일 업로드 중 예외 발생:', uploadError);
      // 더 구체적인 에러 메시지 제공
      if (uploadError?.message?.includes('Invalid URL')) {
        throw new Error('파일명에 사용할 수 없는 문자가 있습니다. 파일명을 변경해주세요.');
      }
      throw uploadError;
    }
  }
  
  async listRecordPdfs(form_id: string) {
    const results: any[] = [];
    
    // form_id가 UUID 형식인지 확인 (record_id) 아니면 record_no
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(form_id);
    let record_id = form_id;
    
    // record_no인 경우 record_id를 조회
    if (!isUuid) {
      try {
        const { data } = await this.client
          .from('record_form_meta')
          .select('record_id')
          .eq('record_no', form_id)
          .maybeSingle();
        if (data?.record_id) {
          record_id = data.record_id;
        }
      } catch {}
    }
    
    // Load cross-device index using record_id
    let index: Record<string, any> = {};
    try { 
      index = await this.getRecordFileIndex(record_id);
    } catch { 
      index = {};
    }
    
    // rmd_pdfs 버킷에서 record_id 폴더 확인 (with timeout and retry)
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      try {
        const { data: list, error } = await this.client.storage
          .from('rmd_pdfs')
          .list(record_id, { limit: 100 });
        
        clearTimeout(timeoutId);
        
        if (!error && list) {
          const items = (Array.isArray(list)? list: []);
          const pdfItems = await Promise.all(items.map(async (o:any)=>{
            const full = `${record_id}/${o.name}`;
            const { data } = this.client.storage.from('rmd_pdfs').getPublicUrl(full);
            const metadata = index[full];
            return { 
              name: o.name, 
              originalName: metadata?.originalName || null,
              path: full, 
              url: data.publicUrl, 
              bucket: 'rmd_pdfs',
              uploadedBy: metadata?.uploadedBy || null,
              uploadedAt: metadata?.uploadedAt || null,
            };
          }));
          results.push(...pdfItems);
        }
      } catch (timeoutError) {
        clearTimeout(timeoutId);
        console.warn('Timeout fetching from rmd_pdfs bucket, skipping...');
      }
    } catch(e: any) {
      // Log error but continue
      if (e?.message?.includes('504') || e?.message?.includes('timeout')) {
        console.warn('Gateway timeout when fetching PDFs, continuing with rmd_records...');
      }
    }
    
    // rmd_records 버킷의 pdfs 폴더에서 record_id 폴더 확인 (with timeout)
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      try {
        const { data: list, error } = await this.client.storage
          .from('rmd_records')
          .list(`pdfs/${record_id}`, { limit: 100 });
        
        clearTimeout(timeoutId);
        
        if (!error && list) {
          const items = (Array.isArray(list)? list: []);
          const pdfItems = await Promise.all(items.map(async (o:any)=>{
            const full = `pdfs/${record_id}/${o.name}`;
            const { data } = this.client.storage.from('rmd_records').getPublicUrl(full);
            const metadata = index[full];
            return { 
              name: o.name, 
              originalName: metadata?.originalName || null,
              path: full, 
              url: data.publicUrl, 
              bucket: 'rmd_records',
              uploadedBy: metadata?.uploadedBy || null,
              uploadedAt: metadata?.uploadedAt || null,
            };
          }));
          results.push(...pdfItems);
        }
      } catch (timeoutError) {
        clearTimeout(timeoutId);
        console.warn('Timeout fetching from rmd_records bucket, skipping...');
      }
    } catch(e: any) {
      // Log error but continue
      if (e?.message?.includes('504') || e?.message?.includes('timeout')) {
        console.warn('Gateway timeout when fetching from rmd_records, returning partial results...');
      }
    }
    
    return results;
  }
  
  async deleteRecordPdf(path: string, bucket?: string) {
    // 버킷이 명시되지 않은 경우 경로에서 추론
    // rmd_pdfs를 기본으로, pdfs/로 시작하면 rmd_records
    const targetBucket = bucket || (path.startsWith('pdfs/') ? 'rmd_records' : 'rmd_pdfs');
    
    const { error } = await this.client.storage
      .from(targetBucket)
      .remove([path]);
    
    if (error) {
      // 첫 번째 버킷에서 실패하면 다른 버킷 시도
      const alternateBucket = targetBucket === 'rmd_pdfs' ? 'rmd_records' : 'rmd_pdfs';
      const alternatePath = targetBucket === 'rmd_pdfs' ? `pdfs/${path}` : path.replace('pdfs/', '');
      
      const { error: altError } = await this.client.storage
        .from(alternateBucket)
        .remove([alternatePath]);
      
      if (altError) {
        // 둘 다 실패한 경우에만 에러 로그
        console.error('PDF 삭제 실패:', error);
        throw error; // 원래 에러를 throw
      }
    }
    
    return { ok: true } as any;
  }

  // ===== Document Templates =====
  async uploadCompositionTemplate(file: File) {
    const { data, error } = await this.client.storage
      .from('doc_templates')
      .upload(this.compositionTemplatePath, file, { 
        upsert: true, 
        contentType: file.type || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
    
    if (error) throw error;
    
    // Prefer signed URL in case bucket is not public
    try {
      const { data: signed } = await this.client.storage
        .from('doc_templates')
        .createSignedUrl(this.compositionTemplatePath, 3600);
      
      return { 
        path: data.path, 
        url: signed?.signedUrl || this.client.storage
          .from('doc_templates')
          .getPublicUrl(this.compositionTemplatePath).data.publicUrl 
      };
    } catch {
      const { data: pub } = this.client.storage
        .from('doc_templates')
        .getPublicUrl(this.compositionTemplatePath);
      return { path: this.compositionTemplatePath, url: pub.publicUrl };
    }
  }
  
  async getCompositionTemplate() {
    try {
      // Check existence by listing the folder
      const { data: list } = await this.client.storage
        .from('doc_templates')
        .list('composition', { search: 'template.xlsx', limit: 1 });
      
      const exists = Array.isArray(list) && list.some(o => (o as any).name === 'template.xlsx');
      if (!exists) return { exists: false } as any;
      
      const { data: signed } = await this.client.storage
        .from('doc_templates')
        .createSignedUrl(this.compositionTemplatePath, 3600);
      
      return { 
        exists: true, 
        url: signed?.signedUrl || this.client.storage
          .from('doc_templates')
          .getPublicUrl(this.compositionTemplatePath).data.publicUrl 
      } as any;
    } catch {
      return { exists: false } as any;
    }
  }
  
  async deleteCompositionTemplate() {
    await this.client.storage
      .from('doc_templates')
      .remove([this.compositionTemplatePath]);
    return { ok: true } as any;
  }

  // ===== Product Exports =====
  async uploadProductExport(blob: Blob, path: string) {
    const contentType = (blob as any).type || 'application/octet-stream';
    const { data, error } = await this.client.storage
      .from('product_exports')
      .upload(path, blob, { upsert: true, contentType });
    
    if (error) throw error;
    
    try {
      const { data: signed } = await this.client.storage
        .from('product_exports')
        .createSignedUrl(path, 3600);
      
      return { 
        path: data.path, 
        url: signed?.signedUrl || this.client.storage
          .from('product_exports')
          .getPublicUrl(path).data.publicUrl 
      } as any;
    } catch {
      const { data: pub } = this.client.storage
        .from('product_exports')
        .getPublicUrl(path);
      return { path: path, url: pub.publicUrl } as any;
    }
  }

  // ===== Helper Methods for Cross-device File Metadata Index =====
  private buildRecordIndexPath(formId: string) {
    const safe = String(formId).replace(/[^a-zA-Z0-9._-]/g,'-');
    return `index/${safe}.json`;
  }

  async getRecordFileIndex(formId: string): Promise<RecordFileIndexMap> {
    const path = this.buildRecordIndexPath(formId);
    
    try {
      // Try to download the index file directly
      const { data, error } = await this.client.storage
        .from(this.recordIndexBucketId)
        .download(path);
      
      // If file doesn't exist (404) or any error, return empty object
      if (error || !data) {
        // This is normal for new records without index yet
        return {} as RecordFileIndexMap;
      }
      
      const text = await (data as any).text();
      const json = JSON.parse(text || '{}');
      return (json && typeof json === 'object') ? json as RecordFileIndexMap : {} as RecordFileIndexMap;
    } catch(e) {
      // Silently fail - index is optional for functionality
      // This could be a 404 (file not found) which is normal
      return {} as RecordFileIndexMap;
    }
  }

  async saveRecordFileIndex(formId: string, index: RecordFileIndexMap): Promise<void> {
    const path = this.buildRecordIndexPath(formId);
    const blob = new Blob([JSON.stringify(index || {}, null, 0)], { type: 'application/json' });
    
    await this.client.storage
      .from(this.recordIndexBucketId)
      .upload(path, blob, { 
        upsert: true, 
        cacheControl: '60', 
        contentType: 'application/json' 
      } as any);
  }

  async updateRecordFileIndexEntry(formId: string, filePath: string, entry: RecordFileIndexEntry): Promise<void> {
    const index = await this.getRecordFileIndex(formId);
    const prev = (index as any)[filePath] || {};
    (index as any)[filePath] = { ...prev, ...entry } as RecordFileIndexEntry;
    await this.saveRecordFileIndex(formId, index);
  }

  extractFormIdFromPath(path: string): string | null {
    // rmd_pdfs: `${formId}/${name}`; rmd_records: `pdfs/${formId}/${name}`
    const p = String(path || '');
    if (!p) return null;
    
    if (p.startsWith('pdfs/')) {
      const rest = p.substring('pdfs/'.length);
      const idx = rest.indexOf('/');
      return idx > 0 ? rest.substring(0, idx) : null;
    }
    
    const idx = p.indexOf('/');
    return idx > 0 ? p.substring(0, idx) : null;
  }
}
