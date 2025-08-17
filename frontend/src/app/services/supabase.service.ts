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

  async listUsers() {
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
}
