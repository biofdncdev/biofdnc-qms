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
  displayedColumns = ['name','email','created_at','updated_at','last_sign_in_at','is_online','status','role','actions'];
  rows: any[] = [];
  roles = ['admin','manager','staff','viewer'];
  loading = false;
  pending: Record<string, string> = {};
  statusFilter: 'all' | 'active' | 'inactive' = 'all';

  constructor(private supabase: SupabaseService) {}

  async ngOnInit() {
    await this.load();
  }

  async load() {
    this.loading = true;
    const { data, error } = await this.supabase.listUsers();
    if (!error && data) {
      let rows = data.map(r => ({ ...r, status: r.status ?? 'active' }));
      if (this.statusFilter !== 'all') rows = rows.filter(r => r.status === this.statusFilter);
      this.rows = rows;
    }
    this.loading = false;
  }

  markRole(row: any, role: string) {
    this.pending[row.id] = role;
  }

  async saveChanges() {
    const entries = Object.entries(this.pending);
    for (const [id, role] of entries) {
      await this.supabase.updateUserRole(id, role);
      // 최종수정일시 업데이트
      await this.supabase.getClient().from('users').update({ updated_at: new Date().toISOString() }).eq('id', id);
    }
    this.pending = {};
    await this.load();
    alert('저장이 완료되었습니다.');
  }

  get pendingCount() {
    return Object.keys(this.pending).length;
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

  async toggleStatus(row: any) {
    const next = row.status === 'inactive' ? 'active' : 'inactive';
    await this.supabase.getClient().from('users').update({ status: next, updated_at: new Date().toISOString() }).eq('id', row.id);
    await this.load();
  }
}
