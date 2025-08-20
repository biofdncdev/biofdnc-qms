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
            autoRefreshToken: true,
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
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const cols = ['inci_name','korean_name','chinese_name','cas_no','scientific_name','function_en','function_kr','einecs_no','old_korean_name','origin_abs'];

    let q = this.ensureClient()
      .from('ingredients')
      .select('*', { count: 'exact' })
      .order('inci_name', { ascending: true })
      .range(from, to);

    const kw = (params?.keyword || '').trim();
    const op = (params?.keywordOp || 'AND').toUpperCase() as 'AND'|'OR';
    if (kw) {
      const words = kw.split(/[\s,]+/).map(s => s.trim()).filter(Boolean);
      if (words.length) {
        if (op === 'AND') {
          for (const w of words) {
            const pieces = cols.map(c => `${c}.ilike.%${w}%`).join(',');
            q = q.or(pieces);
          }
        } else {
          const pieces = words.flatMap(w => cols.map(c => `${c}.ilike.%${w}%`)).join(',');
          q = q.or(pieces);
        }
      }
    }

    return q;
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

  // Givaudan Audit - assessment master
  async getGivaudanAssessment(number: number) {
    return this.ensureClient()
      .from('givaudan_audit_assessment')
      .select('*')
      .eq('number', number)
      .single();
  }

  // Givaudan Audit - per-item progress
  async getGivaudanProgress(number: number) {
    return this.ensureClient()
      .from('givaudan_audit_progress')
      .select('*')
      .eq('number', number)
      .maybeSingle();
  }

  // List all progress rows to hydrate UI on initial load
  async listAllGivaudanProgress() {
    return this.ensureClient()
      .from('givaudan_audit_progress')
      .select('*')
      .order('number', { ascending: true });
  }

  async upsertGivaudanProgress(row: {
    number: number;
    note?: string | null;
    status?: string | null;
    departments?: string[] | null;
    updated_by?: string | null;
    updated_by_name?: string | null;
  }) {
    return this.ensureClient()
      .from('givaudan_audit_progress')
      .upsert(row, { onConflict: 'number' })
      .select()
      .single();
  }

  // Givaudan Audit - resources
  async listGivaudanResources(number: number) {
    return this.ensureClient()
      .from('givaudan_audit_resources')
      .select('*')
      .eq('number', number)
      .order('created_at', { ascending: true });
  }

  async addGivaudanResource(row: any) {
    return this.ensureClient()
      .from('givaudan_audit_resources')
      .insert(row)
      .select()
      .single();
  }

  async updateGivaudanResource(id: string, row: any) {
    return this.ensureClient()
      .from('givaudan_audit_resources')
      .update(row)
      .eq('id', id)
      .select()
      .single();
  }

  async deleteGivaudanResource(id: string) {
    return this.ensureClient()
      .from('givaudan_audit_resources')
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
}
