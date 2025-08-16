import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

// HMR 시에도 SupabaseClient 인스턴스를 유지하기 위한 타입 정의
type G = typeof globalThis & { __supabase?: SupabaseClient };

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private _client: SupabaseClient;

  constructor() {
    const g = globalThis as G;
    if (!g.__supabase) {
      // globalThis에 클라이언트가 없으면 최초 한 번만 생성합니다.
      g.__supabase = createClient(
        environment.supabaseUrl,
        environment.supabaseKey, // 기존 environment 파일과 키 이름 일치
        {
          auth: {
            storage: localStorage, // window.localStorage -> localStorage
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
          },
        }
      );
    }
    // 생성되었거나 이미 존재하는 클라이언트를 서비스 인스턴스에 할당합니다.
    this._client = g.__supabase;
  }

  getClient() {
    return this._client;
  }

  // Auth helpers
  async signIn(email: string, password: string) {
    return this._client.auth.signInWithPassword({ email, password });
  }

  async signOut() {
    return this._client.auth.signOut();
  }

  async getCurrentUser(): Promise<User | null> {
    const { data } = await this._client.auth.getUser();
    return data.user ?? null;
  }

  // Profiles
  async getUserProfile(id: string) {
    return this._client.from('users').select('id,name,email,role,created_at,updated_at,last_sign_in_at,is_online').eq('id', id).single();
  }

  async listUsers() {
    return this._client.from('users').select('id,name,email,role,created_at,updated_at,last_sign_in_at,is_online').order('created_at', { ascending: false });
  }

  async updateUserRole(id: string, role: string) {
    return this._client.from('users').update({ role }).eq('id', id);
  }

  async updateLoginState(id: string, isOnline: boolean) {
    return this._client.from('users').update({ is_online: isOnline, last_sign_in_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', id);
  }
}
