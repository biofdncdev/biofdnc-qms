import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

// HMR 시에도 SupabaseClient 인스턴스를 유지하기 위한 타입 정의
type G = typeof globalThis & { __supabase?: SupabaseClient };

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private _client?: SupabaseClient;

  constructor() {}

  private ensureClient(): SupabaseClient {
    if (this._client) return this._client;

    const g = globalThis as G;
    if (!g.__supabase) {
      if (!environment.supabaseUrl || !environment.supabaseKey) {
        throw new Error('Supabase environment variables are missing');
      }
      g.__supabase = createClient(
        environment.supabaseUrl,
        environment.supabaseKey,
        {
          auth: {
            // F5 새로고침에서는 로그인 유지, 브라우저/탭 종료 시에는 로그아웃 되도록 sessionStorage 사용
            storage: (globalThis as any).sessionStorage,
            persistSession: true,
            // 일부 브라우저/확장프로그램의 Web Locks 충돌을 피하기 위해 자동 리프레시 비활성화
            // (세션 만료 시 재로그인 필요)
            autoRefreshToken: false,
            detectSessionInUrl: true,
          },
        }
      );
    }
    this._client = g.__supabase;
    return this._client;
  }

  getClient() {
    return this.ensureClient();
  }

  // Auth helpers
  async signIn(email: string, password: string) {
    return this.ensureClient().auth.signInWithPassword({ email, password });
  }

  async signOut() {
    // 모든 탭/기기에서 로그아웃
    await this.ensureClient().auth.signOut({ scope: 'global' });
  }

  async getCurrentUser(): Promise<User | null> {
    const { data } = await this.ensureClient().auth.getUser();
    return data.user ?? null;
  }

  // Profiles
  async getUserProfile(id: string) {
    return this.ensureClient()
      .from('users')
      .select('id,name,email,role,status,created_at,updated_at,last_sign_in_at,is_online')
      .eq('id', id)
      .single();
  }

  async ensureUserProfile(user: User) {
    // 더 이상 자동 생성하지 않음: 탈퇴 직후 즉시 재생성되는 문제 방지
    return;
  }

  async listUsers() {
    // Prefer admin view including email confirmation
    try {
      const { data, error } = await this.ensureClient().rpc('admin_list_users_with_confirm');
      if (!error && data) return { data, error: null } as any;
    } catch {}
    return this.ensureClient()
      .from('users')
      .select('id,name,email,role,status,created_at,updated_at,last_sign_in_at,is_online')
      .order('created_at', { ascending: false });
  }

  async updateUserRole(id: string, role: string) {
    return this.ensureClient().from('users').update({ role }).eq('id', id);
  }

  async updateLoginState(id: string, isOnline: boolean) {
    return this.ensureClient()
      .from('users')
      .update({ is_online: isOnline, last_sign_in_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq('id', id);
  }

  // Admin utilities
  async setUserPassword(id: string, newPassword: string) {
    // Requires supabase service role (admin) on the backend or RPC; if using anon client, implement via edge function.
    // Here we call a Postgres RPC defined on the server: admin_reset_password(user_id, new_password)
    return this.ensureClient().rpc('admin_reset_password', { user_id: id, new_password: newPassword });
  }

  async deleteUser(id: string) {
    // Requires RPC to delete user both from auth and public.users
    return this.ensureClient().rpc('admin_delete_user', { user_id: id });
  }

  async forceConfirmUser(userId: string) {
    return this.ensureClient().rpc('admin_force_confirm', { user_id: userId });
  }

  // Ingredients - paginated list with keyword search
  async listIngredients(params: {
    page?: number; // 1-based
    pageSize?: number; // 20/50/100
    keyword?: string;
    keywordOp?: 'AND' | 'OR';
  }) {
    const page = Math.max(1, params?.page ?? 1);
    const pageSize = Math.min(100, Math.max(1, params?.pageSize ?? 15));

    // New unified search logic (same as product list):
    // - Split by whitespace, ignore blanks, AND-only
    // - Build server-side AND-of-OR superset across common columns
    // - Concatenate all fields per row and filter client-side to guarantee correctness
    const kwRaw = params?.keyword || '';
    const kwTrim = kwRaw.trim();
    const words = kwTrim ? kwTrim.split(/\s+/).map(s => s.trim()).filter(Boolean).slice(0, 10) : [];
    const op = 'AND' as const;

    if (words.length > 0) {
      const from = (page - 1) * pageSize; const to = from + pageSize - 1; // for fallback when needed
      // Build superset query: AND-of-OR over typical searchable columns
      const cols = ['inci_name','korean_name','chinese_name','cas_no','scientific_name','function_en','function_kr','einecs_no','old_korean_name','origin_abs','remarks','created_by_name','updated_by_name'];
      const quotePattern = (w: string) => `"*${String(w).replace(/\"/g, '\\"')}*"`;
      const makeGroup = (w: string) => cols.map(c => `${c}.ilike.${quotePattern(w)}`).join(',');
      const logic = `and(${words.map(w => `or(${makeGroup(w)})`).join(',')})`;
      const MAX_FETCH = 20000;
      const { data: superset } = await this.ensureClient()
        .from('ingredients')
        .select('*')
        .or(logic)
        .order('inci_name', { ascending: true })
        .limit(MAX_FETCH) as any;
      const rows: any[] = Array.isArray(superset) ? superset : [];
      const buildText = (row: Record<string, any>) => Object.values(row)
        .filter(v => typeof v === 'string' || typeof v === 'number')
        .map(v => String(v))
        .join(' ')
        .replace(/\s+/g, ' ')
        .toLowerCase();
      const filtered = rows.filter(r => {
        const hay = buildText(r);
        return words.every(w => hay.includes(w.toLowerCase()));
      });
      const start = (page - 1) * pageSize; const end = start + pageSize;
      return { data: filtered.slice(start, end), count: filtered.length } as any;
    }

    // No keyword: use default paginated list

    try {
      const { data, error } = await this.ensureClient().rpc('ingredients_search', {
        _page: page,
        _page_size: pageSize,
        _keyword: kwTrim,
        _op: op,
      });
      if (!error) {
        const count = Array.isArray(data) && data.length ? (data[0] as any).total_count as number : 0;
        // If RPC returned empty for multi-token queries, run manual fallback to be safe
        if (words.length > 1 && (!data || (Array.isArray(data) && data.length === 0))) {
          const manual = await this.manualIngredientSearch({ page, pageSize, words, op });
          return manual as any;
        }
        return { data, count } as any;
      }
      // If RPC responded with an error, fall through to fallback query
      console.warn('ingredients_search RPC returned error; using fallback', error);
    } catch (e) {
      // Fallback to direct query when RPC is unavailable on the target project
      console.warn('ingredients_search RPC failed; falling back to direct query', e);
    }
    // Perform fallback query (also used when RPC returned error)
    const from = (page - 1) * pageSize; const to = from + pageSize - 1;
    const cols = ['inci_name','korean_name','chinese_name','cas_no','scientific_name','function_en','function_kr','einecs_no','old_korean_name','origin_abs','remarks','created_by_name','updated_by_name'];
    const kw = kwTrim;
    let q = this.ensureClient().from('ingredients').select('*', { count: 'exact' }).order('inci_name', { ascending: true }).range(from, to);
    if (kw){
      const words = kw.split(/\s+/).map(s=>s.trim()).filter(Boolean);
      if (words.length){
        const makeGroup = (w: string) => cols.map(c => `${c}.ilike.*${w}*`).join(',');
        if (op === 'AND'){
          const logic = `and(${words.map(w => `or(${makeGroup(w)})`).join(',')})`;
          q = q.or(logic);
        } else {
          const logic = `or(${words.map(w => makeGroup(w)).join(',')})`;
          q = q.or(logic);
        }
      }
    }
    // For multi-token AND, fetch superset by OR and filter in memory for correctness
    if (op === 'AND' && words.length > 1) {
      const manual = await this.manualIngredientSearch({ page, pageSize, words, op });
      return manual as any;
    }

    const { data, count } = await q as any;
    return { data: data || [], count: count || 0 } as any;
  }

  private async manualIngredientSearch(params: { page: number; pageSize: number; words: string[]; op: 'AND' | 'OR'; }){
    const { page, pageSize, words, op } = params;
    // Build OR superset query
    const cols = ['inci_name','korean_name','chinese_name','cas_no','scientific_name','function_en','function_kr','einecs_no','old_korean_name','origin_abs','remarks','created_by_name','updated_by_name'];
    const quotePattern = (w: string) => `"*${String(w).replace(/\"/g, '\\"')}*"`;
    const makeGroup = (w: string) => cols.map(c => `${c}.ilike.${quotePattern(w)}`).join(',');
    const logic = op === 'OR'
      ? `or(${words.map(w => makeGroup(w)).join(',')})`
      : `or(${words.map(w => makeGroup(w)).join(',')})`;
    let q = this.ensureClient().from('ingredients').select('*').order('inci_name', { ascending: true });
    q = q.or(logic);
    // Cap to avoid huge payloads
    const MAX_FETCH = 2000;
    const { data: superset } = await q.limit(MAX_FETCH) as any;
    const rows: any[] = Array.isArray(superset) ? superset : [];
    const toHay = (r: any) => [r.inci_name,r.korean_name,r.chinese_name,r.cas_no,r.scientific_name,r.function_en,r.function_kr,r.einecs_no,r.old_korean_name,r.origin_abs,r.remarks,r.created_by_name,r.updated_by_name]
      .filter(Boolean).join(' ').toLowerCase();
    const filtered = rows.filter(r => {
      const hay = toHay(r);
      if (op === 'AND') return words.every(w => hay.includes(w.toLowerCase()));
      return words.some(w => hay.includes(w.toLowerCase()));
    });
    // Manual pagination
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const pageRows = filtered.slice(start, end);
    return { data: pageRows, count: filtered.length };
  }

  async getIngredient(id: string){
    return this.ensureClient()
      .from('ingredients')
      .select('*')
      .eq('id', id)
      .single();
  }

  async upsertIngredient(row: any){
    return this.ensureClient()
      .from('ingredients')
      .upsert(row, { onConflict: 'id' })
      .select('*')
      .single();
  }

  async selfDelete(confirmEmail: string) {
    const client = this.ensureClient();
    const { data: ures } = await client.auth.getUser();
    const uid = ures.user?.id;
    if (!uid) throw new Error('No session');
    // 1) RLS로 직접 삭제 (항상 보장)
    await client.from('user_roles').delete().eq('user_id', uid);
    await client.from('users').delete().eq('id', uid);
    // 2) RPC가 설정되어 있으면 Auth 계정 삭제 시도(선택적)
    try { await client.rpc('self_delete_user', { confirm_email: confirmEmail }); } catch {}
    return { ok: true } as any;
  }

  // Notifications
  async listNotifications() {
    return this.ensureClient()
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });
  }

  async countUnreadNotifications() {
    const { count } = await this.ensureClient()
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .is('read_at', null);
    return count || 0;
  }

  async markAllNotificationsRead() {
    // prefer RPC if available
    try {
      await this.ensureClient().rpc('mark_all_notifications_read');
      return;
    } catch {
      // fallback to direct update (policy allows admin only)
      await this.ensureClient().from('notifications').update({ read_at: new Date().toISOString() }).is('read_at', null);
    }
  }

  async addSignupNotification(payload: { email: string; name?: string | null }) {
    const title = '신규 가입 요청';
    const message = `${payload.name || payload.email} 님이 가입을 요청했습니다. 권한을 확인해 주세요.`;
    return this.ensureClient()
      .from('notifications')
      .insert({
        type: 'signup',
        title,
        message,
        link: '/app/admin/roles',
        actor_email: payload.email,
        actor_name: payload.name || null,
      });
  }

  // Resend confirmation email for signups
  async resendConfirmationEmail(email: string) {
    const client = this.ensureClient();
    const redirectTo = `${location.origin}/login`;
    // 1) 가입 인증 메일 재발송만 시도
    const { error } = await client.auth.resend({ type: 'signup', email, options: { emailRedirectTo: redirectTo } as any });
    if (!error) return { ok: true } as any;
    // 2) 부득이한 경우에만 매직링크(소유권 확인)로 대체. 비밀번호 재설정은 절대 보내지 않음.
    const { error: otpErr } = await client.auth.signInWithOtp({ email, options: { emailRedirectTo: redirectTo } });
    if (!otpErr) return { ok: true, via: 'otp' } as any;
    throw error;
  }

  async addDeleteRequestNotification(payload: { email: string }) {
    const title = '회원탈퇴 요청';
    const message = `${payload.email} 사용자가 회원탈퇴를 요청했습니다.`;
    return this.ensureClient()
      .from('notifications')
      .insert({
        type: 'delete_request',
        title,
        message,
        link: '/app/admin/roles',
        actor_email: payload.email,
      });
  }

  // Audit - assessment master
  async getGivaudanAssessment(number: number) {
    return this.ensureClient()
      .from('audit_items')
      .select('*')
      .eq('number', number)
      .single();
  }

  // Audit - per-item progress
  async getGivaudanProgress(number: number, audit_date?: string | null) {
    return this.ensureClient()
      .from('audit_progress')
      .select('*')
      .eq('number', number)
      .maybeSingle();
  }
  async getGivaudanProgressByDate(number: number, audit_date: string) {
    return this.ensureClient()
      .from('audit_progress')
      .select('*')
      .eq('number', number)
      .eq('audit_date', audit_date)
      .maybeSingle();
  }

  // List all progress rows to hydrate UI on initial load
  async listAllGivaudanProgress(audit_date?: string | null) {
    return this.ensureClient()
      .from('audit_progress')
      .select('*')
      .order('number', { ascending: true });
  }
  async listGivaudanProgressByDate(audit_date: string) {
    return this.ensureClient()
      .from('audit_progress')
      .select('*')
      .eq('audit_date', audit_date)
      .order('number', { ascending: true });
  }

  async getAuditDateCreatedAt(audit_date: string){
    const { data } = await this.ensureClient()
      .from('audit_progress')
      .select('updated_at')
      .eq('audit_date', audit_date)
      .order('updated_at', { ascending: true })
      .limit(1)
      .maybeSingle();
    return (data as any)?.updated_at as string | undefined;
  }

  async deleteGivaudanProgressByDate(audit_date: string){
    return this.ensureClient()
      .from('audit_progress')
      .delete()
      .eq('audit_date', audit_date);
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
    return this.ensureClient()
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
  }>){
    if (!Array.isArray(rows) || rows.length===0) return { data: [], error: null } as any;
    const client = this.ensureClient();
    const BATCH = 50;
    let lastError: any = null;
    for (let i=0;i<rows.length;i+=BATCH){
      const part = rows.slice(i, i+BATCH);
      const { error } = await client
        .from('audit_progress')
        .upsert(part, { onConflict: 'number,audit_date', ignoreDuplicates: false, defaultToNull: false }) as any; // return=minimal
      if (error) lastError = error;
    }
    if (lastError) throw lastError;
    return { data: [], error: null } as any;
  }

  async listSavedAuditDates(){
    const { data } = await this.ensureClient()
      .from('audit_progress')
      .select('audit_date')
      .not('audit_date','is', null)
      .order('audit_date', { ascending: false });
    const set = new Set<string>();
    for (const r of (Array.isArray(data) ? data : [])){
      const d = (r as any)?.audit_date; if (d) set.add(String(d));
    }
    return Array.from(set);
  }

  // Audit items upsert from JSON (best-effort)
  async upsertAuditItems(items: Array<{ number: number; titleKo: string; titleEn?: string | null }>) {
    if (!Array.isArray(items) || items.length === 0) return { ok: true } as any;
    const rows = items
      .map(it => ({ number: Number(it.number), title_ko: it.titleKo ?? null, title_en: it.titleEn ?? null }))
      .filter(r => Number.isFinite(r.number));
    const client = this.ensureClient();
    const BATCH = 400; // 권장 범위 내 기본값
    const CONCURRENCY = 3; // 2~4 권장

    const batches: any[][] = [];
    for (let i = 0; i < rows.length; i += BATCH) batches.push(rows.slice(i, i + BATCH));

    const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));
    const upsertBatch = async (part: any[]) => {
      let attempt = 0;
      while (true) {
        attempt++;
        const { error } = await client.from('audit_items').upsert(part, { onConflict: 'number' });
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

    // Run with limited concurrency
    let idx = 0; let lastErr: any = null;
    const workers: Promise<void>[] = new Array(CONCURRENCY).fill(0).map(async () => {
      while (idx < batches.length) {
        const my = idx++;
        const part = batches[my];
        try { await upsertBatch(part); } catch (e) { lastErr = e; }
      }
    });
    await Promise.all(workers);
    if (lastErr) {
      console.warn('upsertAuditItems failed (ignored):', lastErr);
      return { ok: false, error: lastErr } as any;
    }
    return { ok: true } as any;
  }

  async listAuditItems(){
    const { data, error } = await this.ensureClient()
      .from('audit_items')
      .select('number,title_ko,title_en')
      .order('number', { ascending: true });
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  }

  // Audit companies CRUD
  async listAuditCompanies(){
    const { data } = await this.ensureClient().from('audit_companies').select('*').order('name', { ascending: true });
    return Array.isArray(data) ? data : [];
  }
  async addAuditCompany(row: { name: string; note?: string | null }){
    return this.ensureClient().from('audit_companies').insert(row).select('*').single();
  }
  async updateAuditCompany(id: string, row: Partial<{ name: string; note: string }>) {
    return this.ensureClient().from('audit_companies').update(row).eq('id', id).select('*').single();
  }
  async deleteAuditCompany(id: string){
    return this.ensureClient().from('audit_companies').delete().eq('id', id);
  }

  // Audit - resources
  async listGivaudanResources(number: number) {
    return this.ensureClient()
      .from('audit_resources')
      .select('*')
      .eq('number', number)
      .order('created_at', { ascending: true });
  }

  async addGivaudanResource(row: any) {
    return this.ensureClient()
      .from('audit_resources')
      .insert(row)
      .select()
      .single();
  }

  async updateGivaudanResource(id: string, row: any) {
    return this.ensureClient()
      .from('audit_resources')
      .update(row)
      .eq('id', id)
      .select()
      .single();
  }

  async deleteGivaudanResource(id: string) {
    return this.ensureClient()
      .from('audit_resources')
      .delete()
      .eq('id', id);
  }

  async uploadAuditFile(file: File, path: string) {
    // Ensure a bucket named 'audit_resources' exists in Supabase Storage
    const { data, error } = await this.ensureClient()
      .storage
      .from('audit_resources')
      .upload(path, file, { upsert: true });
    if (error) throw error;
    const { data: urlData } = this.ensureClient().storage.from('audit_resources').getPublicUrl(data.path);
    return { path: data.path, publicUrl: urlData.publicUrl };
  }

  // Record images (Temperature/Humidity)
  async uploadRecordImage(blob: Blob, path: string) {
    const client = this.ensureClient();
    const { data, error } = await client.storage.from('rmd_records').upload(path, blob, { upsert: true, contentType: 'image/png' });
    if (error) throw error;
    const { data: urlData } = client.storage.from('rmd_records').getPublicUrl(data.path);
    return { path: data.path, publicUrl: urlData.publicUrl };
  }

  async getThRecord(formId: string, weekStart: string) {
    return this.ensureClient()
      .from('rmd_th_record')
      .select('*')
      .eq('form_id', formId)
      .eq('week_start', weekStart)
      .maybeSingle();
  }

  async upsertThRecord(row: { form_id: string; week_start: string; image_url?: string | null; strokes?: any; }) {
    return this.ensureClient()
      .from('rmd_th_record')
      .upsert(row, { onConflict: 'form_id,week_start' })
      .select()
      .maybeSingle();
  }

  async getLatestThRecord(formId: string){
    return this.ensureClient()
      .from('rmd_th_record')
      .select('*')
      .eq('form_id', formId)
      .order('week_start', { ascending: false })
      .limit(1)
      .maybeSingle();
  }

  async listThWeeks(formId: string){
    return this.ensureClient()
      .from('rmd_th_record')
      .select('week_start')
      .eq('form_id', formId)
      .order('week_start', { ascending: true });
  }

  // Sales (Rice Bran Water H and others)
  async createSalesOrder(row: { product_key: string; order_no?: string | null; order_date?: string | null; order_qty?: number | null; created_by?: string | null; created_by_name?: string | null; }){
    return this.ensureClient().from('sales_orders').insert(row).select('*').single();
  }
  async updateSalesOrder(id: string, row: Partial<{ order_no: string; order_date: string; order_qty: number; }>) {
    return this.ensureClient().from('sales_orders').update(row).eq('id', id).select('*').single();
  }
  async listSalesOrders(product_key: string){
    return this.ensureClient().from('sales_orders').select('*, deliveries:sales_deliveries(*)').eq('product_key', product_key).order('created_at', { ascending: true });
  }
  async addSalesDelivery(row: { order_id: string; due_date?: string | null; qty?: number | null; outsource_date?: string | null; outsource_qty?: number | null; }){
    return this.ensureClient().from('sales_deliveries').insert(row).select('*').single();
  }
  async updateSalesDelivery(id: string, row: Partial<{ due_date: string; qty: number; outsource_date: string; outsource_qty: number; }>) {
    return this.ensureClient().from('sales_deliveries').update(row).eq('id', id).select('*').single();
  }
  async deleteSalesDelivery(id: string){
    return this.ensureClient().from('sales_deliveries').delete().eq('id', id);
  }
  async logDeliveryChange(row: { delivery_id: string; field: string; old_value?: string | null; new_value?: string | null; changed_by?: string | null; changed_by_name?: string | null; }){
    return this.ensureClient().from('sales_delivery_changes').insert(row);
  }
  async listDeliveryChanges(delivery_id: string){
    return this.ensureClient().from('sales_delivery_changes').select('*').eq('delivery_id', delivery_id).order('changed_at', { ascending: true });
  }

  // Products
  async listProducts(params: { page?: number; pageSize?: number; keyword?: string; keywordOp?: 'AND'|'OR' }){
    const page = Math.max(1, params?.page ?? 1);
    const pageSize = Math.min(100, Math.max(1, params?.pageSize ?? 15));
    const from = (page - 1) * pageSize; const to = from + pageSize - 1;
    const kw = (params?.keyword || '').trim();
    // Split by whitespace, ignore empty tokens, limit to 5 keywords
    const words = kw ? kw.split(/\s+/).map(s => s.trim()).filter(Boolean).slice(0, 10) : [];

    // If no keywords, fall back to normal paginated list
    if (words.length === 0) {
      return this.ensureClient()
        .from('products')
        .select('*', { count: 'exact' })
        .order('name_kr', { ascending: true })
        .range(from, to) as any;
    }

    // Build a targeted superset using server-side filters: AND-of-OR across common searchable columns
    const searchableCols = [
      'product_code','main_code','name_kr','name_en','asset_category','item_category','item_midcategory','item_status',
      'spec','main_spec','specification','unit','remarks','keywords_alias','main_name'
    ];
    const makeGroup = (w: string) => searchableCols.map(c => `${c}.ilike.*${w}*`).join(',');
    const andGroups = words.map(w => `or(${makeGroup(w)})`).join(',');
    const logic = `and(${andGroups})`;

    // Fetch a large enough superset to avoid truncation
    const supersetLimit = 20000;
    const { data: superset } = await this.ensureClient()
      .from('products')
      .select('*')
      .or(logic)
      .order('name_kr', { ascending: true })
      .limit(supersetLimit) as any;

    const rows: any[] = Array.isArray(superset) ? superset : [];
    const buildText = (row: Record<string, any>) => {
      return Object.values(row)
        .filter(v => typeof v === 'string' || typeof v === 'number')
        .map(v => String(v))
        .join(' ')
        .replace(/\s+/g, ' ')
        .toLowerCase();
    };

    const filtered = words.length === 0
      ? rows
      : rows.filter(r => {
          const hay = buildText(r);
          return words.every(w => hay.includes(w.toLowerCase()));
        });

    // Pagination after filtering
    const start = (page - 1) * pageSize; const end = start + pageSize;
    return { data: filtered.slice(start, end), count: filtered.length } as any;
  }
  async quickSearchProducts(keyword: string){
    const kw = (keyword||'').trim();
    if (!kw) return { data: [] as any[] } as any;
    const words = kw.split(/\s+/).map(s=>s.trim()).filter(Boolean);
    const cols = ['product_code','name_kr','name_en','cas_no','spec','specification','keywords_alias','special_notes'];
    // Server-side AND-of-OR: every token must match at least one of the searchable columns
    const makeGroup = (w:string)=> cols.map(c=> `${c}.ilike.*${w}*`).join(',');
    const andLogic = `and(${words.map(w=> `or(${makeGroup(w)})`).join(',')})`;
    const { data } = await this.ensureClient()
      .from('products')
      .select('id, product_code, name_kr, name_en, cas_no, spec, specification, keywords_alias, special_notes')
      .or(andLogic)
      .limit(500) as any;
    const rows = Array.isArray(data) ? data : [];
    return { data: rows.slice(0, 200) } as any;
  }
  async getProduct(id: string){ return this.ensureClient().from('products').select('*').eq('id', id).single(); }
  async upsertProduct(row: any){ return this.ensureClient().from('products').upsert(row, { onConflict: 'id' }).select('*').single(); }
  async deleteProduct(id: string){ return this.ensureClient().from('products').delete().eq('id', id); }

  // BOM map: persist selected material per ingredient
  async getBomMaterialSelection(product_code: string){
    const { data } = await this.ensureClient().from('product_bom_material_map').select('*').eq('product_code', product_code) as any;
    return Array.isArray(data) ? data : [];
  }
  async setBomMaterialSelection(row: { product_code: string; ingredient_name: string; selected_material_id?: string | null; selected_material_number?: string | null; note?: string | null; }){
    return this.ensureClient().from('product_bom_material_map').upsert(row, { onConflict: 'product_code,ingredient_name' }).select('*').single();
  }

  // Materials by specification exact (case-insensitive)
  async listMaterialsBySpecificationExact(spec: string){
    const client = this.ensureClient();
    // use ilike for case-insensitive exact by wrapping with ^ and $ is not supported; compare lower
    const { data } = await client.from('materials').select('*').or(`specification.ilike.${spec}`).limit(2000) as any;
    // Ensure exact (case-insensitive) on client side
    const s = (spec||'').trim().toLowerCase();
    return (Array.isArray(data)? data: []).filter(r => (r?.specification||'').toString().trim().toLowerCase() === s);
  }

  // Product verification logs (persisted in products.verify_logs JSONB)
  async getProductVerifyLogs(id: string){
    try{
      const { data, error } = await this.ensureClient().from('products').select('verify_logs').eq('id', id).single();
      if (error) throw error;
      const logs = (data && (data as any).verify_logs) || [];
      return Array.isArray(logs) ? logs : [];
    }catch(e){
      console.warn('getProductVerifyLogs failed (column may not exist yet); falling back to empty', e);
      return [] as any[];
    }
  }
  async setProductVerifyLogs(id: string, logs: Array<{ user: string; time: string }>){
    try{
      const { error } = await this.ensureClient().from('products').update({ verify_logs: logs }).eq('id', id);
      if (error) throw error;
      return true;
    }catch(e){
      console.warn('setProductVerifyLogs failed (column may not exist yet); ignoring', e);
      return false;
    }
  }

  // Product materials verification logs (persisted in products.materials_verify_logs JSONB if exists)
  async getProductMaterialsVerifyLogs(id: string){
    try{
      const { data, error } = await this.ensureClient().from('products').select('materials_verify_logs').eq('id', id).single();
      if (error) throw error;
      const logs = (data && (data as any).materials_verify_logs) || [];
      return Array.isArray(logs) ? logs : [];
    }catch(e){
      console.warn('getProductMaterialsVerifyLogs failed (column may not exist yet); falling back to empty', e);
      return [] as any[];
    }
  }
  async setProductMaterialsVerifyLogs(id: string, logs: Array<{ user: string; time: string }>){
    try{
      const { error } = await this.ensureClient().from('products').update({ materials_verify_logs: logs }).eq('id', id);
      if (error) throw error;
      return true;
    }catch(e){
      console.warn('setProductMaterialsVerifyLogs failed (column may not exist yet); ignoring', e);
      return false;
    }
  }

  // Product compositions
  async listProductCompositions(product_id: string){
    return this.ensureClient().from('product_compositions').select('*, ingredient:ingredients(*)').eq('product_id', product_id).order('created_at', { ascending: true });
  }
  async addProductComposition(row: { product_id: string; ingredient_id: string; percent?: number | null; note?: string | null; }){
    return this.ensureClient().from('product_compositions').insert(row).select('*').single();
  }
  async updateProductComposition(id: string, row: Partial<{ percent: number; note: string; }>) {
    return this.ensureClient().from('product_compositions').update(row).eq('id', id).select('*').single();
  }
  async deleteProductComposition(id: string){ return this.ensureClient().from('product_compositions').delete().eq('id', id); }

  // Ingredient quick search for composition picking
  async searchIngredientsBasic(keyword: string){
    const kw = (keyword||'').trim();
    if (!kw) return { data: [] as any[] } as any;
    const or = `inci_name.ilike.*${kw}*,korean_name.ilike.*${kw}*`;
    const { data } = await this.ensureClient()
      .from('ingredients')
      .select('id, inci_name, korean_name')
      .or(or)
      .order('inci_name', { ascending: true })
      .limit(50) as any;
    return { data: Array.isArray(data)? data: [] } as any;
  }

  // Fetch ingredients by exact INCI names
  async getIngredientsByNames(names: string[]){
    const list = Array.from(new Set((names||[]).filter(Boolean)));
    if (!list.length) return { data: [] as any[] } as any;
    const { data } = await this.ensureClient()
      .from('ingredients')
      .select('id, inci_name, korean_name, chinese_name, cas_no')
      .in('inci_name', list) as any;
    return { data: Array.isArray(data)? data: [] } as any;
  }

  // Count how many times each ingredient is used in product compositions for a given set of ingredient IDs
  async getCompositionCountsForIngredients(ingredientIds: string[]){
    const ids = Array.from(new Set((ingredientIds||[]).filter(Boolean)));
    if (!ids.length) return {} as Record<string, number>;
    const { data } = await this.ensureClient()
      .from('product_compositions')
      .select('ingredient_id')
      .in('ingredient_id', ids) as any;
    const counts: Record<string, number> = {};
    for (const row of (data||[])){
      const k = row?.ingredient_id as string; if (!k) continue;
      counts[k] = (counts[k]||0) + 1;
    }
    return counts;
  }

  // Product column map (for Korean labels)
  async getProductColumnMap(){
    const { data } = await this.ensureClient().from('product_column_map').select('*').order('display_order', { ascending: true }) as any;
    return Array.isArray(data) ? data : [];
  }

  // Document templates (Composition)
  private compositionTemplatePath = 'composition/template.xlsx';
  async uploadCompositionTemplate(file: File){
    const client = this.ensureClient();
    const { data, error } = await client.storage.from('doc_templates').upload(this.compositionTemplatePath, file, { upsert: true, contentType: file.type || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    if (error) throw error;
    // Prefer signed URL in case bucket is not public
    try{
      const { data: signed } = await client.storage.from('doc_templates').createSignedUrl(this.compositionTemplatePath, 3600);
      return { path: data.path, url: signed?.signedUrl || client.storage.from('doc_templates').getPublicUrl(this.compositionTemplatePath).data.publicUrl };
    }catch{
      const { data: pub } = client.storage.from('doc_templates').getPublicUrl(this.compositionTemplatePath);
      return { path: this.compositionTemplatePath, url: pub.publicUrl };
    }
  }
  async getCompositionTemplate(){
    const client = this.ensureClient();
    try{
      // Check existence by listing the folder
      const { data: list } = await client.storage.from('doc_templates').list('composition', { search: 'template.xlsx', limit: 1 });
      const exists = Array.isArray(list) && list.some(o => (o as any).name === 'template.xlsx');
      if (!exists) return { exists: false } as any;
      const { data: signed } = await client.storage.from('doc_templates').createSignedUrl(this.compositionTemplatePath, 3600);
      return { exists: true, url: signed?.signedUrl || client.storage.from('doc_templates').getPublicUrl(this.compositionTemplatePath).data.publicUrl } as any;
    }catch{
      return { exists: false } as any;
    }
  }
  async deleteCompositionTemplate(){
    const client = this.ensureClient();
    await client.storage.from('doc_templates').remove([this.compositionTemplatePath]);
    return { ok: true } as any;
  }

  // Product document exports (generated Excel/PDF files)
  async uploadProductExport(blob: Blob, path: string){
    const client = this.ensureClient();
    const contentType = (blob as any).type || 'application/octet-stream';
    const { data, error } = await client.storage.from('product_exports').upload(path, blob, { upsert: true, contentType });
    if (error) throw error;
    try{
      const { data: signed } = await client.storage.from('product_exports').createSignedUrl(path, 3600);
      return { path: data.path, url: signed?.signedUrl || client.storage.from('product_exports').getPublicUrl(path).data.publicUrl } as any;
    }catch{
      const { data: pub } = client.storage.from('product_exports').getPublicUrl(path);
      return { path: path, url: pub.publicUrl } as any;
    }
  }

  // Materials
  async listMaterials(params: { page?: number; pageSize?: number; keyword?: string; keywordOp?: 'AND' | 'OR' }){
    const page = Math.max(1, params?.page ?? 1);
    const pageSize = Math.min(100, Math.max(1, params?.pageSize ?? 15));
    const from = (page - 1) * pageSize; const to = from + pageSize - 1;
    const kw = (params?.keyword || '').trim();
    if (!kw){
      return this.ensureClient().from('materials').select('*', { count: 'exact' }).order('material_name', { ascending: true }).range(from, to) as any;
    }
    const words = kw.split(/\s+/).map(s=>s.trim()).filter(Boolean);
    // Use actual columns of public.materials
    const cols = [
      'material_number','material_name','english_name','manufacturer',
      'spec','standard_unit','specification',
      'cas_no','search_keyword','material_notes','item_description'
    ];
    const makeGroup = (w:string)=> cols.map(c=> `${c}.ilike.*${w}*`).join(',');
    const andLogic = `and(${words.map(w=> `or(${makeGroup(w)})`).join(',')})`;
    return this.ensureClient().from('materials').select('*', { count: 'exact' }).or(andLogic).order('material_name', { ascending: true }).range(from, to) as any;
  }
  async upsertMaterial(row: any){ return this.ensureClient().from('materials').upsert(row, { onConflict: 'id' }).select('*').single(); }
  async deleteMaterial(id: string){ return this.ensureClient().from('materials').delete().eq('id', id); }
  async getMaterial(id: string){ return this.ensureClient().from('materials').select('*').eq('id', id).single(); }
  async getMaterialColumnMap(){
    const { data } = await this.ensureClient().from('material_column_map').select('*').order('display_order', { ascending: true }) as any;
    return Array.isArray(data) ? data : [];
  }

  // Batch fetch materials by IDs
  async getMaterialsByIds(ids: string[]){
    const list = Array.from(new Set((ids||[]).filter(Boolean)));
    if (!list.length) return [] as any[];
    const { data } = await this.ensureClient().from('materials').select('*').in('id', list) as any;
    return Array.isArray(data) ? data : [];
  }

  // Material sync by Excel - mirror of product sync
  async syncMaterialsByExcel(payload: { sheet: any[]; headerMap?: Record<string,string> }){
    const rows = payload?.sheet || [];
    if (!rows.length) return { ok: true, total: 0, updated: 0, skipped: 0, inserted: 0, errors: [] } as any;
    // Build mapping map: ERP label -> DB column from material_column_map
    const maps = await this.getMaterialColumnMap();
    const dbMap: Record<string,string> = {};
    for (const m of maps){ if (m?.sheet_label_kr && m?.db_column) dbMap[String(m.sheet_label_kr)] = String(m.db_column); }
    // Built-in fallback mapping so the feature works even before DB seeding
    const builtin: Record<string,string> = {
      '자재상태':'material_status', '품목자산분류':'item_asset_class', '자재소분류':'material_sub_class',
      '등록일':'created_on_erp', '등록자':'created_by_erp', '최종수정일':'modified_on_erp', '최종수정자':'modified_by_erp',
      'Lot 관리':'is_lot_managed', '자재대분류':'material_large_class', '관리부서':'managing_department',
      '자재번호':'material_number', '자재내부코드':'material_internal_code', '자재명':'material_name',
      '규격':'spec', '기준단위':'standard_unit', '내외자구분':'domestic_foreign_class', '중요도':'importance',
      '관리자':'manager', '제조사':'manufacturer', '자재중분류':'material_middle_class', '영문명':'english_name',
      '출고구분':'shipping_class', '대표자재':'representative_material', 'BOM등록':'is_bom_registered',
      '제품별공정소요자재':'material_required_for_process_by_product', 'Serial 관리':'is_serial_managed',
      '단가등록여부':'is_unit_price_registered', '유통기한구분':'expiration_date_class', '유통기간':'distribution_period',
      '품목설명':'item_description', '기본구매처':'default_supplier', '수탁거래처':'consignment_supplier',
      '부가세구분':'vat_class', '판매단가에 부가세포함여부':'is_vat_included_in_sales_price', '첨부파일':'attachment_file',
      '자재세부분류':'material_detail_class', '검색어(이명(異명))':'search_keyword', '사양':'specification',
      '자재특이사항':'material_notes', 'CAS NO':'cas_no', 'MOQ':'moq', '포장단위':'packaging_unit',
      'Manufacturer':'manufacturer', 'Country of Manufacture':'country_of_manufacture',
      'Source of Origin(Method)':'source_of_origin_method', 'Plant Part':'plant_part', 'Country of Origin':'country_of_origin',
      '중국원료신고번호(NMPA)':'nmpa_registration_number', '알러젠성분':'allergen_ingredient', 'Furocoumarines':'furocoumarines',
      '효능':'efficacy', '특허':'patent', '논문':'paper', '임상':'clinical_trial', '사용기한':'use_by_date',
      '보관장소':'storage_location', '보관방법':'storage_method', '안정성 및 유의사항':'safety_and_precautions',
      'Note on storage':'note_on_storage', 'Safety & Handling':'safety_and_handling',
      'NOTICE (COA3 영문)':'notice_coa3_english', 'NOTICE (COA3 국문)':'notice_coa3_korean'
    };
    const labelToDb: Record<string,string> = Object.assign({}, dbMap, builtin, payload?.headerMap || {});

    const normalized: Array<{ key: string; row: any }> = [];
    const errors: Array<{ key:string; column?: string; message:string }> = [];
    const colsInUpload = new Set<string>();
    const toDateText = (val:any) => {
      if (val===undefined || val===null) return null;
      const s = String(val).trim(); if (!s) return null; return s;
    };
    for (const r of rows){
      const obj: any = {};
      for (const [erp, value] of Object.entries(r)){
        const dbcol = labelToDb[erp];
        if (!dbcol) continue;
        let v: any = toDateText(value);
        obj[dbcol] = v;
        colsInUpload.add(dbcol);
      }
      // Unique key is ERP '자재번호' only
      const key = obj.material_number || (r as any)['자재번호'] || '';
      if (!key) { errors.push({ key: '-', message: '자재번호가 없습니다.' }); continue; }
      obj.material_number = key;
      normalized.push({ key, row: obj });
    }
    if (!normalized.length) return { ok: true, total: rows.length, updated: 0, skipped: rows.length, inserted: 0, errors } as any;

    // Fetch existing rows to decide upsert vs update
    const keys = normalized.map(n => n.key);
    const { data: existingList } = await this.ensureClient().from('materials').select('*').in('material_number', keys) as any;
    const candidates: any[] = Array.isArray(existingList) ? existingList : [];
    // Map existing rows by potential keys
    const mapByKey: Record<string, any> = {};
    for (const ex of candidates){
      const k1 = ex.material_number; if (k1) mapByKey[k1] = ex;
    }

    let updated = 0, skipped = 0, inserted = 0;
    const toUpsert: any[] = [];
    const REQUIRED = new Set<string>(['material_number','material_name']);
    for (const n of normalized){
      const existing = mapByKey[n.key];
      if (!existing){
        const row = { ...n.row };
        if (!row.material_name) row.material_name = n.key; // 최소 보장
        toUpsert.push(row); inserted++;
        continue;
      }
      // Compare only uploaded columns; skip if all same
      let changed = false; const diff: any = { material_number: existing.material_number };
      for (const col of colsInUpload){
        const newVal = (n.row as any)[col]; if (newVal === undefined) continue;
        const oldVal = (existing as any)[col];
        const oldNorm = (oldVal===undefined || oldVal===null || String(oldVal).trim()==='') ? null : oldVal;
        const newNorm = (newVal===undefined || newVal===null || (typeof newVal==='string' && newVal.trim()==='')) ? null : newVal;
        if (JSON.stringify(oldNorm) !== JSON.stringify(newNorm)) { diff[col] = newNorm; changed = true; }
      }
      if (changed){ toUpsert.push(diff); updated++; } else { skipped++; }
    }

    if (toUpsert.length){
      const client = this.ensureClient();
      const { error } = await client.from('materials').upsert(toUpsert, { onConflict: 'material_number', ignoreDuplicates: false, defaultToNull: false });
      if (error){
        const B = 200;
        for (let i=0;i<toUpsert.length;i+=B){
          const part = toUpsert.slice(i,i+B);
          const { error: e2 } = await client.from('materials').upsert(part, { onConflict: 'material_number', ignoreDuplicates: false, defaultToNull: false });
          if (e2){ errors.push({ key: part[0]?.material_internal_code || part[0]?.material_number || part[0]?.material_name || '-', message: e2.message || String(e2) }); }
        }
      }
    }
    return { ok: true, total: rows.length, updated, skipped, inserted, errors } as any;
  }

  // Excel sync implementation with diffing and error reporting
  async syncProductsByExcel(payload: { sheet: any[]; headerMap?: Record<string,string> }){
    const rows = payload?.sheet || [];
    const errors: Array<{ product_code: string; column?: string; message: string }> = [];
    if (!rows.length) return { ok: true, total: 0, updated: 0, skipped: 0, inserted: 0, errors } as any;

    // Build mapping: DB mapping first, then fallback to built-ins, then caller overrides
    const { data: mapRows } = await this.ensureClient().from('product_column_map').select('sheet_label_kr, db_column');
    const dbMap: Record<string,string> = {};
    (mapRows||[]).forEach(m => { if (m?.sheet_label_kr && m?.db_column) dbMap[m.sheet_label_kr] = m.db_column; });
    const builtin: Record<string,string> = {
      '품번': 'product_code', '품목코드': 'product_code', '대표품번': 'main_code', '품명': 'name_kr', '대표품명': 'name_kr', '영문명': 'name_en', '품목설명': 'remarks',
      // Registration / meta (accept multiple label variants)
      '등록일': 'reg_date', '등록일자': 'reg_date',
      '등록자': 'reg_user',
      '최종수정일': 'last_update_date', '최종수정일자': 'last_update_date',
      '최종수정자': 'last_update_user',
      '품목상태':'item_status','품목대분류':'item_category','품목중분류':'item_midcategory','품목소분류':'item_subcategory','기준단위':'unit','규격':'spec','대표규격':'main_spec',
      '검색어(이명(異名))':'keywords_alias','사양':'specification','품목특이사항':'special_notes','CAS NO':'cas_no','MOQ':'moq','포장단위':'package_unit','Manufacturer':'manufacturer',
      'Country of Manufacture':'country_of_manufacture','Source of Origin(Method)':'source_of_origin_method','Plant Part':'plant_part','Country of Origin':'country_of_origin',
      '중국원료신고번호(NMPA)':'nmpa_no','알러젠성분':'allergen','Furocoumarines':'furocoumarins','효능':'efficacy','특허':'patent','논문':'paper','임상':'clinical',
      '사용기한':'expiration_date','보관위치':'storage_location','보관방법1':'storage_method1','안정성 및 유의사항1':'stability_note1','Note on storage1':'storage_note1','Safety & Handling1':'safety_handling1',
      'NOTICE (COA3 영문)1':'notice_coa3_en_1','NOTICE (COA3 국문)1':'notice_coa3_kr_1','NOTICE (Composition 국문)1':'notice_comp_kr_1','NOTICE (Composition 영문)1':'notice_comp_en_1','CAUTION (Origin)1':'caution_origin_1',
      '유기농 인증':'cert_organic','KOSHER 인증':'cert_kosher','HALAL 인증':'cert_halal','VEGAN 인증':'cert_vegan','ISAAA 인증':'cert_isaaa','RSPO 인증':'cert_rspo','REACH 인증':'cert_reach',
      'Expiration Date':'expiration_date2','보관방법2':'storage_method2','안정성 및 유의사항2':'stability_note2','Note on storage2':'storage_note2','Safety & Handling2':'safety_handling2',
      'NOTICE (COA3 영문)2':'notice_coa3_en_2','NOTICE (COA3 국문)2':'notice_coa3_kr_2','NOTICE (Composition 국문)2':'notice_comp_kr_2','NOTICE (Composition 영문)2':'notice_comp_en_2','CAUTION (Origin)2':'caution_origin_2'
    };
    const map: Record<string,string> = Object.assign({}, dbMap, builtin, payload?.headerMap || {});

    // Determine header that provides product_code
    const codeHeaders = Object.keys(map).filter(k => map[k] === 'product_code');
    let updated = 0, skipped = 0, inserted = 0;

    // Normalize upload rows and collect columns present
    const normalized: Array<{ product_code: string; row: any }> = [];
    const colsInUpload = new Set<string>(['product_code']);
    const DATE_COLS = new Set(['reg_date','last_update_date']);
    const isEmpty = (val:any) => val===undefined || val===null || (typeof val==='string' && val.trim()==='');
    const toDateText = (val:any) => {
      if (val===undefined || val===null) return null;
      // numbers: Excel serial -> ISO date
      if (typeof val === 'number' && isFinite(val)){
        // treat reasonable serial range only
        if (val > 20000 && val < 80000){
          const epoch = new Date(Date.UTC(1899, 11, 30)); // Excel epoch (with 1900 leap bug adjustment)
          const ms = epoch.getTime() + Math.round(val * 86400000);
          const d = new Date(ms);
          return d.toISOString().slice(0,10);
        }
      }
      // strings: unify separators . or / to - and trim
      const s = String(val).trim();
      if (!s) return null;
      const norm = s.replace(/[.\/]/g, '-');
      // simple YYYY-MM-DD extraction
      const m = norm.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
      if (m){
        const y = m[1]; const mm = ('0'+m[2]).slice(-2); const dd = ('0'+m[3]).slice(-2);
        return `${y}-${mm}-${dd}`;
      }
      // fallback: return as-is
      return s;
    };
    for (const r of rows){
      const codeRaw = codeHeaders.map(h => r[h]).find(v => v!==undefined && v!==null && String(v).trim()!=='');
      const code = codeRaw ? String(codeRaw).trim() : '';
      if (!code) { skipped++; continue; }
      const obj: any = { product_code: code };
      for (const [erp, dbcol] of Object.entries(map)){
        if (r[erp] === undefined) continue;
        const raw = r[erp];
        // Normalize values; handle date columns specially
        let v: any = DATE_COLS.has(dbcol) ? toDateText(raw) : raw;
        // treat blank/whitespace as null
        v = (v===undefined || v===null || (typeof v==='string' && v.trim()==='')) ? null : v;
        // Do not let a blank value overwrite a non-blank value when multiple ERP headers map to same DB column
        const existed = obj.hasOwnProperty(dbcol) ? obj[dbcol] : undefined;
        if (isEmpty(v) && !isEmpty(existed)) {
          // keep existing non-empty value
        } else {
          obj[dbcol] = v;
        }
        colsInUpload.add(dbcol);
      }
      normalized.push({ product_code: code, row: obj });
    }
    if (!normalized.length) return { ok: true, total: rows.length, updated, skipped, inserted, errors } as any;

    // Fetch existing rows (only necessary columns + attrs for row_hash)
    const codes = normalized.map(n => n.product_code);
    const selectCols = Array.from(new Set<string>([...Array.from(colsInUpload), 'attrs'])).join(',');
    const { data: existingList } = await this.ensureClient().from('products').select(selectCols).in('product_code', codes) as any;
    const codeToExisting: Record<string, any> = {};
    for (const ex of (existingList || [])) codeToExisting[ex.product_code] = ex;

    const toUpsert: any[] = [];
    // Simple stable signature of a row for fast skip
    const signatureOf = (row:any) => {
      const keys = Array.from(colsInUpload).filter(k=>k!=='product_code').sort();
      const parts = keys.map(k => `${k}:${row[k]===undefined||row[k]===null?'':String(row[k])}`);
      // djb2
      let h = 5381; const s = parts.join('|');
      for (let i=0;i<s.length;i++){ h = ((h << 5) + h) ^ s.charCodeAt(i); }
      // to unsigned string to reduce size
      return (h >>> 0).toString(36);
    };

    for (const n of normalized){
      const existing = codeToExisting[n.product_code];
      if (!existing){
        const row = { ...n.row };
        if (!row.name_kr) row.name_kr = n.product_code;
        if (!row.asset_category) row.asset_category = 'unspecified';
        const sig = signatureOf(row);
        const prevAttrs = (row as any).attrs || {};
        row.attrs = { ...prevAttrs, row_hash: sig };
        toUpsert.push(row);
        inserted++;
        continue;
      }
      // Fast path: skip if signature unchanged
      const newSig = signatureOf(n.row);
      const oldSig = (existing as any)?.attrs?.row_hash || null;
      if (oldSig && newSig === oldSig){ skipped++; continue; }

      // Compute diff only on columns present in upload when signature changed
      const diff: any = { product_code: n.product_code };
      const REQUIRED = new Set<string>(['name_kr','asset_category']);
      let changed = false;
      for (const col of colsInUpload){
        if (col==='product_code') continue;
        const newVal = (n.row as any)[col];
        if (newVal === undefined) continue;
        const oldVal = (existing as any)[col];
        const oldNorm = (oldVal===undefined || oldVal===null || String(oldVal).trim()==='') ? null : oldVal;
        const newNorm = (newVal===undefined || newVal===null || (typeof newVal==='string' && newVal.trim()==='')) ? null : newVal;
        // Do not overwrite required columns with null (treat blanks as "no change")
        if (newNorm === null && REQUIRED.has(col as string)) { continue; }
        // Update when value differs OR when DB is null and upload provides a value (including date fill-ins)
        if (JSON.stringify(oldNorm) !== JSON.stringify(newNorm)) { (diff as any)[col] = newNorm; changed = true; }
      }
      // Safety: always include required fields so accidental INSERT by upsert won't violate NOT NULL
      const fallbackName = (existing && (existing as any).name_kr) || (n.row as any).name_kr || n.product_code;
      const fallbackCat = (existing && (existing as any).asset_category) || (n.row as any).asset_category || 'unspecified';
      (diff as any).name_kr = fallbackName;
      (diff as any).asset_category = fallbackCat;
      if (changed){
        const prevAttrs = (existing as any)?.attrs || {};
        diff.attrs = { ...prevAttrs, row_hash: newSig };
        toUpsert.push(diff); updated++;
      } else { skipped++; }
    }

    if (toUpsert.length){
      const client = this.ensureClient();
      // Batch upsert
      const { error } = await client.from('products').upsert(toUpsert, { onConflict: 'product_code', ignoreDuplicates: false, defaultToNull: false });
      if (error){
        // Fallback to smaller chunks to isolate failing rows
        const B = 200;
        for (let i=0;i<toUpsert.length;i+=B){
          const part = toUpsert.slice(i,i+B);
          const { error: e2 } = await client.from('products').upsert(part, { onConflict: 'product_code' });
          if (e2){ errors.push({ product_code: part[0]?.product_code || '-', message: e2.message || String(e2) }); }
        }
      }
    }

    return { ok: true, total: rows.length, updated, skipped, inserted, errors } as any;
  }
}
