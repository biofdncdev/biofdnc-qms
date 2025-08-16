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
            storage: localStorage,
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
    return this.ensureClient().auth.signOut();
  }

  async getCurrentUser(): Promise<User | null> {
    const { data } = await this.ensureClient().auth.getUser();
    return data.user ?? null;
  }

  // Profiles
  async getUserProfile(id: string) {
    return this.ensureClient().from('users').select('id,name,email,role,created_at,updated_at,last_sign_in_at,is_online').eq('id', id).single();
  }

  async listUsers() {
    return this.ensureClient().from('users').select('id,name,email,role,created_at,updated_at,last_sign_in_at,is_online').order('created_at', { ascending: false });
  }

  async updateUserRole(id: string, role: string) {
    return this.ensureClient().from('users').update({ role }).eq('id', id);
  }

  async updateLoginState(id: string, isOnline: boolean) {
    return this.ensureClient().from('users').update({ is_online: isOnline, last_sign_in_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', id);
  }
}
