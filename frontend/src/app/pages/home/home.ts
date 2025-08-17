import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
  <section class="landing center">
    <div class="container">
      <div class="hero">
        <h1>BIO‑FD&C Quality Management System</h1>
        <p class="subtitle">조직의 품질 활동을 체계적으로 관리하여 일관성과 추적성을 확보합니다.</p>
      </div>

      <div class="policy card">
        <h3>품질 정책 및 목표</h3>
        <p>조직의 품질에 대한 의지와 방향을 명확히 하고, 이를 달성하기 위한 구체적인 목표를 설정합니다.</p>
      </div>

      <div class="grid">
        <div class="card">
          <h3>품질 매뉴얼</h3>
          <p>조직의 품질 관리 시스템을 설명하는 문서로, 품질 정책, 목표, 절차, 역할 및 책임을 포함합니다.</p>
        </div>
        <div class="card">
          <h3>절차서 및 작업 지침서</h3>
          <p>각 부서나 기능에 맞춘 구체적인 절차와 작업 지침을 문서화하여 일관된 작업 수행과 품질 관리를 지원합니다.</p>
        </div>
        <div class="card">
          <h3>기록 및 문서 관리</h3>
          <p>품질 활동의 이력을 기록하고 관리하여 추적성과 책임성을 유지합니다. 감사나 고객 요구 대응에 필수적입니다.</p>
        </div>
        <div class="card">
          <h3>내부 감사 및 검토</h3>
          <p>정기적으로 내부 감사를 실시하여 적합성과 효과성을 평가하고, 개선 사항을 식별·반영합니다.</p>
        </div>
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
