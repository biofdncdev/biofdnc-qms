import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

// HMR 시에도 SupabaseClient 인스턴스를 유지하기 위한 타입 정의
type G = typeof globalThis & { __supabase?: SupabaseClient };

/**
 * Core Supabase Service
 * 
 * Supabase 클라이언트 인스턴스 관리만 담당합니다.
 * 모든 비즈니스 로직은 도메인별 서비스로 분리되었습니다.
 * 
 * @see AuthService - 인증 및 사용자 관리
 * @see ErpDataService - 제품, 자재, 원료 관리 (ERP 연동 예정)
 * @see RecordService - 기록 및 문서 관리
 * @see StorageService - 파일 저장소 관리
 * @see AuditService - 감사 관리
 * @see OrganizationService - 조직 및 부서 관리
 */
@Injectable({
  providedIn: 'root',
})
export class SupabaseCoreService {
  private _client?: SupabaseClient;

  constructor() {}

  /**
   * Supabase 클라이언트 인스턴스를 반환합니다.
   * 싱글톤 패턴으로 구현되어 있으며, HMR(Hot Module Replacement)을 지원합니다.
   * 
   * @returns SupabaseClient 인스턴스
   */
  getClient(): SupabaseClient {
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
            // URL에서 세션 자동 감지 비활성화 (회원가입 페이지에서 레이트리밋 중복 요청 방지)
            detectSessionInUrl: false,
            // 페이지 로드 시 자동 세션 새로고침 비활성화 (rate limit 방지)
            storageKey: 'qms-auth',
            flowType: 'pkce',
          },
        }
      );
    }
    
    this._client = g.__supabase;
    return this._client;
  }
}