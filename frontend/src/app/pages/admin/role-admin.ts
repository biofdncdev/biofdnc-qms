import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../services/supabase.service';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-role-admin',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatSelectModule, MatButtonModule, MatIconModule, MatDialogModule],
  templateUrl: './role-admin.html',
  styleUrls: ['./role-admin.scss']
})
export class RoleAdminComponent implements OnInit {
  displayedColumns = ['name','email','created_at','updated_at','last_sign_in_at','status','role','actions'];
  rows: any[] = [];
  roles = ['admin','manager','staff','audit','viewer'];
  statuses: Array<'active' | 'inactive'> = ['active','inactive'];
  loading = false;
  pending: Record<string, string> = {};
  nameEdits: Record<string, string> = {};
  statusFilter: 'all' | 'active' | 'inactive' = 'all';

  constructor(private supabase: SupabaseService) {}

  async ngOnInit() {
    await this.load();
  }

  async load() {
    this.loading = true;
    const { data, error } = await this.supabase.listUsers();
    if (!error && data) {
      const rowsRaw = (data as any[]);
      let rows = rowsRaw.map((r: any) => ({
        ...r,
        status: (r && r.status) ? r.status : 'active',
        role: (r && r.role === 'givaudan_audit') ? 'audit' : r.role
      }));
      if (this.statusFilter !== 'all') rows = rows.filter(r => r.status === this.statusFilter);
      this.rows = rows;
    }
    this.loading = false;
  }

  markRole(row: any, role: string) {
    // Store the role directly - it's already in the correct format
    this.pending[row.id] = role;
  }

  getRoleDisplay(role: string): string {
    // Display user-friendly names
    const displayMap: Record<string, string> = {
      'admin': 'admin',
      'manager': 'manager', 
      'staff': 'staff',
      'audit': 'Audit',
      'viewer': 'viewer'
    };
    return displayMap[role] || role;
  }

  markName(row: any, name: string){
    this.nameEdits[row.id] = name;
  }

  async saveChanges() {
    const entries = Object.entries(this.pending);
    for (const [id, role] of entries) {
      await this.supabase.updateUserRole(id, role);
      // 최종수정일시 업데이트
      await this.supabase.getClient().from('users').update({ updated_at: new Date().toISOString() }).eq('id', id);
    }
    const nameEntries = Object.entries(this.nameEdits);
    for (const [id, name] of nameEntries){
      await this.supabase.updateUserName(id, name);
      await this.supabase.getClient().from('users').update({ updated_at: new Date().toISOString() }).eq('id', id);
    }
    this.pending = {};
    this.nameEdits = {};
    await this.load();
    alert('저장이 완료되었습니다.');
  }

  get pendingCount() {
    return Object.keys(this.pending).length + Object.keys(this.nameEdits).length;
  }

  async resetPassword(row: any) {
    // 관리자가 비밀번호를 이메일 주소와 동일하게 초기화
    await this.supabase.setUserPassword(row.id, row.email);
    alert('비밀번호가 이메일 주소로 초기화되었습니다.');
  }

  async deleteUser(row: any) {
    if (!confirm('해당 사용자를 삭제하시겠습니까?')) return;
    await this.supabase.deleteUser(row.id);
    await this.load();
  }

  async forceConfirm(row: any) {
    if (!confirm('이 사용자의 이메일 인증을 관리자 권한으로 완료 처리할까요?')) return;
    
    // 1. 먼저 이메일로 auth user ID 찾기
    let targetId = row.id || await this.supabase.findUserIdByEmail(row.email);
    
    // 2. auth에서 강제 인증 처리
    if (!targetId) {
      // auth user가 없으면 이메일로 직접 인증 시도
      try {
        await this.supabase.forceConfirmByEmail(row.email);
        // 다시 ID 조회
        targetId = await this.supabase.findUserIdByEmail(row.email);
      } catch (e: any) {
        alert('이메일로 사용자를 찾지 못했습니다: ' + (e?.message || e));
        return;
      }
    } else {
      await this.supabase.forceConfirmUser(targetId);
    }
    
    // 3. public.users 프로필 확실히 생성/업데이트
    const now = new Date().toISOString();
    if (targetId) {
      // 프로필이 없으면 생성, 있으면 업데이트
      await this.supabase.ensureUserProfileById(targetId, { email: row.email, name: row.name || row.email });
      
      // 권한 설정 및 last_sign_in_at 명시적 업데이트
      const makeStaff = confirm('권한을 staff로 변경하시겠습니까? 취소를 누르면 viewer로 유지됩니다.');
      const nextRole = makeStaff ? 'staff' : 'viewer';
      
      await this.supabase.getClient().from('users').update({ 
        role: nextRole,
        status: 'active',
        updated_at: now, 
        last_sign_in_at: now  // 이것이 핵심: 인증 완료 표시
      }).eq('id', targetId);
      
      // 로컬 행 즉시 반영
      row.id = targetId;
      row.role = nextRole;
      row.last_sign_in_at = now;
      row.email_confirmed_at = now;
      row._pending_signup = false;
    }
    
    alert('이메일 인증이 완료 처리되었습니다. 사용자에게 로그인 안내를 해주세요.');
    
    // 목록 새로고침으로 서버 상태 반영
    await this.load();
  }

  isConfirmed(row: any){
    return !!(row?.email_confirmed_at || row?.last_sign_in_at);
  }

  async toggleStatus(row: any) {
    const next = row.status === 'inactive' ? 'active' : 'inactive';
    await this.supabase.getClient().from('users').update({ status: next, updated_at: new Date().toISOString() }).eq('id', row.id);
    await this.load();
  }

  async changeStatus(row: any, status: 'active' | 'inactive') {
    if (row.status === status) return;
    await this.supabase.getClient().from('users').update({ status, updated_at: new Date().toISOString() }).eq('id', row.id);
    await this.load();
  }

  async resendConfirm(row: any) {
    try {
      await this.supabase.resendConfirmationEmail(row.email);
      alert('인증 메일을 재발송했습니다. 사용자가 메일함(스팸함 포함)을 확인하도록 안내해 주세요.');
    } catch (e: any) {
      alert('인증 메일 재발송에 실패했습니다: ' + (e?.message || e));
    }
  }

  async sendReset(row: any){
    try{
      await this.supabase.sendPasswordResetEmail(row.email);
      alert('비밀번호 초기화(변경) 메일을 발송했습니다.');
    }catch(e: any){
      alert('비밀번호 초기화 메일 발송 실패: ' + (e?.message || e));
    }
  }

  async deletePendingSignup(row: any) {
    if (!confirm(`정말로 ${row.email}의 가입 요청을 삭제하시겠습니까?`)) return;
    try {
      const client = this.supabase.getClient();
      const emailNorm = String(row.email || '').trim().toLowerCase();

      // 1) Delete signup notifications for this email (case-insensitive)
      const { error: delErr } = await client
        .from('notifications')
        .delete()
        .eq('type', 'signup')
        .ilike('actor_email', emailNorm);
      if (delErr) throw delErr;
      
      // 서버 측 정리: SQL과 동일 동작(알림 + 프로필 삭제)
      await this.supabase.purgeEmailEverywhere(emailNorm);
      alert('가입 요청이 삭제되었습니다.');
      await this.load();
    } catch (e: any) {
      alert('가입 요청 삭제 실패: ' + (e?.message || e));
      // Only reload on error
      await this.load();
    }
  }
}
