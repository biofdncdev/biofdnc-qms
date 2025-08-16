import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  template: `
  <div class="profile" *ngIf="profile">
    <h3>내 프로필</h3>
    <div>이름: {{ profile.name || '-' }}</div>
    <div>이메일: {{ profile.email }}</div>
    <div>권한: {{ profile.role }}</div>
    <div>가입일시: {{ profile.created_at | date:'yyyy-MM-dd HH:mm' }}</div>
    <div>최종수정일시: {{ profile.updated_at ? (profile.updated_at | date:'yyyy-MM-dd HH:mm') : '-' }}</div>
    <div>마지막 로그인: {{ profile.last_sign_in_at ? (profile.last_sign_in_at | date:'yyyy-MM-dd HH:mm') : '-' }}</div>
  </div>
  `,
})
export class ProfileComponent implements OnInit {
  profile: any;
  constructor(private supabase: SupabaseService) {}
  async ngOnInit() {
    const user = await this.supabase.getCurrentUser();
    if (user) {
      const { data } = await this.supabase.getUserProfile(user.id);
      this.profile = data;
    }
  }
}
