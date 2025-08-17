import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
  <section class="landing">
    <div class="hero">
      <h1>BIO‑FD&C Quality Management System</h1>
      <p>
        End‑to‑end quality operations for BIO‑FD&C. Manage documents, audits, training, CAPA, and more –
        all in one streamlined workspace.
      </p>
      <div class="cta">
        <a routerLink="/app/profile" class="btn primary">내 프로필</a>
        <a routerLink="/app/admin/roles" class="btn" *ngIf="isAdmin">사용자 관리</a>
      </div>
    </div>
    <div class="feature-grid">
      <div class="card">
        <h3>Documents</h3>
        <p>표준문서와 기록을 버전으로 관리하고 승인 워크플로로 추적합니다.</p>
      </div>
      <div class="card">
        <h3>Training</h3>
        <p>변경된 표준에 따라 필요한 교육 이수를 자동으로 배정합니다.</p>
      </div>
      <div class="card">
        <h3>Audits</h3>
        <p>내/외부 감사 계획과 결과, 시정조치를 중앙에서 관리합니다.</p>
      </div>
    </div>
  </section>
  `,
  styleUrls: ['./home.scss']
})
export class HomeComponent implements OnInit {
  isAdmin = false;

  constructor(private supabase: SupabaseService) {}

  async ngOnInit() {
    const u = await this.supabase.getCurrentUser();
    if (u) {
      const { data } = await this.supabase.getUserProfile(u.id);
      this.isAdmin = (data?.role === 'admin' || data?.role === 'manager');
    }
  }
}
