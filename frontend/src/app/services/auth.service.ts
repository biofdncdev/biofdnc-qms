import { Injectable } from '@angular/core';
import { SupabaseClient, User } from '@supabase/supabase-js';
import { SupabaseCoreService } from './supabase-core.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private supabase: SupabaseCoreService) {}

  private get client(): SupabaseClient {
    return this.supabase.getClient();
  }

  // For components that need direct client access
  getClient(): SupabaseClient {
    return this.client;
  }

  // ===== Authentication =====
  async signIn(email: string, password: string) {
    return this.client.auth.signInWithPassword({ email, password });
  }

  async signOut() {
    // 모든 탭/기기에서 로그아웃
    await this.client.auth.signOut({ scope: 'global' });
  }

  async getCurrentUser(): Promise<User | null> {
    const { data } = await this.client.auth.getUser();
    return data.user ?? null;
  }

  async sendPasswordResetEmail(email: string) {
    const e = String(email || '').trim().toLowerCase();
    if (!e) throw new Error('email is required');
    const redirectTo = this.getPublicAppUrl() + '/forgot-credentials';
    return this.client.auth.resetPasswordForEmail(e, { redirectTo });
  }

  async resendConfirmationEmail(email: string) {
    const redirectTo = this.getPublicAppUrl() + '/login';
    // 1) 가입 인증 메일 재발송만 시도
    const { error } = await this.client.auth.resend({ 
      type: 'signup', 
      email, 
      options: { emailRedirectTo: redirectTo } as any 
    });
    if (!error) return { ok: true } as any;
    
    // 2) 부득이한 경우에만 매직링크(소유권 확인)로 대체
    const { error: otpErr } = await this.client.auth.signInWithOtp({ 
      email, 
      options: { emailRedirectTo: redirectTo } 
    });
    if (!otpErr) return { ok: true, via: 'otp' } as any;
    throw error;
  }

  async selfDelete(confirmEmail: string) {
    const { data: ures } = await this.client.auth.getUser();
    const uid = ures.user?.id;
    if (!uid) throw new Error('No session');
    
    // 1) RLS로 직접 삭제 (항상 보장)
    await this.client.from('user_roles').delete().eq('user_id', uid);
    await this.client.from('users').delete().eq('id', uid);
    
    // 2) RPC가 설정되어 있으면 Auth 계정 삭제 시도(선택적)
    try { 
      await this.client.rpc('self_delete_user', { confirm_email: confirmEmail }); 
    } catch {}
    
    return { ok: true } as any;
  }

  // ===== User Profiles =====
  async getUserProfile(id: string) {
    return this.client
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
    // Try admin RPC first (behind feature flag)
    const useAdminRpc = (globalThis as any).environment?.useAdminListUsersRpc;
    if (useAdminRpc) {
      try {
        const { data, error } = await this.client.rpc('admin_list_users_with_confirm');
        if (!error && data) return { data, error: null } as any;
      } catch (e) {
        console.log('admin_list_users_with_confirm failed, falling back to users table', e);
      }
    }
    
    // Fallback to direct users table query
    const { data, error } = await this.client
      .from('users')
      .select('id,name,email,role,status,created_at,updated_at,last_sign_in_at,is_online')
      .order('created_at', { ascending: false });

    const base = Array.isArray(data) ? data : [];

    // Merge pending signups from notifications
    try {
      const { data: notis } = await this.client
        .from('notifications')
        .select('actor_email, actor_name, created_at, type')
        .eq('type', 'signup')
        .order('created_at', { ascending: false });
      
      const existingEmails = new Set(base.map((r: any) => (r?.email || '').toLowerCase()));
      const confirmedEmails = new Set(base
        .filter((r: any) => r?.last_sign_in_at || r?.email_confirmed_at)
        .map((r: any) => (r?.email || '').toLowerCase()));
      
      const pendingRows: any[] = [];
      for (const n of (notis || [])) {
        const email = String((n as any)?.actor_email || '').toLowerCase();
        if (!email || existingEmails.has(email)) continue;
        if (confirmedEmails.has(email)) continue;
        
        existingEmails.add(email);
        pendingRows.push({
          id: null,
          name: (n as any)?.actor_name || (n as any)?.actor_email,
          email: (n as any)?.actor_email,
          created_at: (n as any)?.created_at,
          updated_at: null,
          last_sign_in_at: null,
          is_online: false,
          status: 'active',
          role: 'viewer',
          email_confirmed_at: null,
          _pending_signup: true,
        });
      }
      return { data: [...pendingRows, ...base], error: null };
    } catch (e) {
      return { data: base, error: error || null };
    }
  }

  async updateUserRole(id: string, role: string) {
    return this.client.from('users').update({ role }).eq('id', id);
  }

  async updateUserName(id: string, name: string) {
    // Keep auth metadata in sync
    try { 
      await this.client.auth.updateUser({ data: { name } }); 
    } catch {}
    return this.client.from('users').update({ name }).eq('id', id);
  }

  async updateLoginState(id: string, isOnline: boolean) {
    return this.client
      .from('users')
      .update({ 
        is_online: isOnline, 
        last_sign_in_at: new Date().toISOString(), 
        updated_at: new Date().toISOString() 
      })
      .eq('id', id);
  }

  // ===== Admin Functions =====
  async setUserPassword(id: string, newPassword: string) {
    return this.client.rpc('admin_reset_password', { 
      user_id: id, 
      new_password: newPassword 
    });
  }

  async deleteUser(id: string) {
    return this.client.rpc('admin_delete_user', { user_id: id });
  }

  async forceConfirmUser(userId: string) {
    return this.client.rpc('admin_force_confirm', { user_id: userId });
  }

  async forceConfirmByEmail(email: string) {
    return this.client.rpc('admin_force_confirm_by_email', { p_email: email });
  }

  async ensureUserProfileById(userId: string, fallback?: { email: string; name?: string }) {
    try { 
      await this.client.rpc('ensure_user_profile', { user_id: userId }); 
      return; 
    } catch {}
    
    if (fallback?.email) {
      const now = new Date().toISOString();
      try {
        await this.client.from('users').upsert({
          id: userId,
          email: fallback.email,
          name: fallback.name || fallback.email,
          role: 'viewer',
          status: 'active',
          created_at: now,
          updated_at: now,
          last_sign_in_at: now,
        }, { onConflict: 'id', ignoreDuplicates: false });
      } catch {}
    }
  }

  async findUserIdByEmail(email: string) {
    const e = String(email || '').trim().toLowerCase();
    if (!e) return null as any;
    
    const useAdminRpc = (globalThis as any).environment?.useAdminListUsersRpc;
    if (useAdminRpc) {
      try {
        const { data } = await this.client.rpc('admin_list_users_with_confirm');
        const row = (Array.isArray(data) ? data : [])
          .find((r: any) => String(r?.email || '').toLowerCase() === e);
        return row?.id || null;
      } catch {}
    }
    return null as any;
  }

  async purgeEmailEverywhere(email: string) {
    const emailNorm = String(email || '').trim().toLowerCase();
    if (!emailNorm) return { ok: true } as any;
    
    try {
      const { error } = await this.client.rpc('admin_delete_signup_request', { p_email: email });
      if (error) {
        console.warn('RPC admin_delete_signup_request failed, falling back to direct delete', error);
        const norm = (s: any) => String(s || '').trim().toLowerCase();
        
        // 1) Delete signup notifications
        try {
          const { data: list } = await this.client
            .from('notifications')
            .select('id, actor_email, type')
            .eq('type', 'signup');
          const ids = (Array.isArray(list) ? list : [])
            .filter((n: any) => norm(n?.actor_email) === emailNorm)
            .map((n: any) => n.id)
            .filter(Boolean);
          if (ids.length) {
            await this.client.from('notifications').delete().in('id', ids as any);
          }
        } catch {}
        
        // 2) Delete public.users rows
        try {
          const { data: ulist } = await this.client
            .from('users')
            .select('id, email');
          const uids = (Array.isArray(ulist) ? ulist : [])
            .filter((u: any) => norm(u?.email) === emailNorm)
            .map((u: any) => u.id)
            .filter(Boolean);
          if (uids.length) {
            await this.client.from('users').delete().in('id', uids as any);
          }
        } catch {}
      }
    } catch (e) {
      console.warn('Error calling admin_delete_signup_request', e);
    }
    
    return { ok: true } as any;
  }

  // ===== Notifications =====
  async listNotifications() {
    return this.client
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });
  }

  async countUnreadNotifications() {
    const { count } = await this.client
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .is('read_at', null);
    return count || 0;
  }

  async markAllNotificationsRead() {
    try {
      await this.client.rpc('mark_all_notifications_read');
      return;
    } catch {
      // fallback to direct update
      await this.client
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .is('read_at', null);
    }
  }

  async addSignupNotification(payload: { email: string; name?: string | null }) {
    const title = '신규 가입 요청';
    const message = `${payload.name || payload.email} 님이 가입을 요청했습니다. 권한을 확인해 주세요.`;
    return this.client
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

  async addDeleteRequestNotification(payload: { email: string }) {
    const title = '회원탈퇴 요청';
    const message = `${payload.email} 사용자가 회원탈퇴를 요청했습니다.`;
    return this.client
      .from('notifications')
      .insert({
        type: 'delete_request',
        title,
        message,
        link: '/app/admin/roles',
        actor_email: payload.email,
      });
  }

  // ===== User Departments Management =====
  async getUserDepartments(userId: string) {
    return this.client
      .from('user_departments')
      .select('*')
      .eq('user_id', userId)
      .order('department_code');
  }

  async setUserDepartments(userId: string, departments: Array<{ department_code: string; has_approval_authority: boolean }>) {
    // Delete existing departments for this user
    await this.client
      .from('user_departments')
      .delete()
      .eq('user_id', userId);

    // Insert new departments if any
    if (departments.length > 0) {
      return this.client
        .from('user_departments')
        .insert(departments.map(d => ({
          user_id: userId,
          department_code: d.department_code,
          has_approval_authority: d.has_approval_authority
        })));
    }

    return { data: null, error: null };
  }

  // ===== Helper Methods =====
  private getPublicAppUrl(): string {
    // Use explicit deployment URL to avoid localhost links
    return 'https://biofdnc-qms.vercel.app';
  }
}
