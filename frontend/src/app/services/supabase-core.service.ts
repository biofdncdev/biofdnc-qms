import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

// HMR 시에도 SupabaseClient 인스턴스를 유지하기 위한 타입 정의
type G = typeof globalThis & { __supabase?: SupabaseClient };

/**
 * Core Supabase service that manages the Supabase client instance.
 * All feature-specific operations are delegated to specialized services.
 */
@Injectable({
  providedIn: 'root',
})
export class SupabaseCoreService {
  private _client?: SupabaseClient;

  constructor() {}

  /**
   * Gets or creates the Supabase client instance.
   * Uses a singleton pattern with global state to survive HMR.
   */
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

  /**
   * Gets the Supabase client instance.
   * Used by other services to access the database.
   */
  getClient(): SupabaseClient {
    return this.ensureClient();
  }

  /**
   * Direct database access for simple queries.
   * Complex operations should use specialized services.
   */
  get db() {
    return {
      from: (table: string) => this.ensureClient().from(table),
      rpc: (fn: string, args?: any) => this.ensureClient().rpc(fn, args),
    };
  }

  /**
   * Direct storage access for file operations.
   * Complex operations should use StorageService.
   */
  get storage() {
    return this.ensureClient().storage;
  }

  /**
   * Direct auth access for authentication operations.
   * Complex operations should use AuthService.
   */
  get auth() {
    return this.ensureClient().auth;
  }
}
