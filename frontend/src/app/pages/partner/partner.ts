import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-partner',
  standalone: true,
  imports: [CommonModule],
  template: `
  <div class="page">
    <header class="page-header">
      <h2>Partner</h2>
        <p>구매 · 판매 · 유통 · 브랜드사 등 모든 거래처를 한 곳에서 관리합니다.</p>
    </header>

    <section class="card-grid">
      <article class="card">
        <h3>거래처 현황</h3>
        <p>전체 거래처, 유형별 비율, 최근 업데이트 현황 등을 집계합니다.</p>
      </article>
      <article class="card">
        <h3>업무 바로가기</h3>
        <ul>
          <li>거래처 일괄 등록</li>
          <li>CSV 템플릿 다운로드</li>
          <li>협력사 평가 및 등급 관리</li>
        </ul>
      </article>
      <article class="card">
        <h3>최근 알림</h3>
        <p>승인 대기, 계약 만료 예정, 주요 변경 사항을 빠르게 확인할 수 있습니다.</p>
      </article>
    </section>
  </div>
  `,
  styles: [`
  .page { padding: 18px 24px; font-family: 'Inter', 'Pretendard Variable', 'Noto Sans KR', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif; color: #111827; display: flex; flex-direction: column; gap: 24px; }
  .page-header h2 { font-size: 28px; font-weight: 800; margin: 0 0 8px; }
  .page-header p { margin: 0; color: #4b5563; font-size: 14px; }
  .card-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px; }
  .card { border: 1px solid #e5e7eb; border-radius: 16px; padding: 18px; background: #fff; box-shadow: 0 8px 24px rgba(15, 23, 42, 0.04); display: flex; flex-direction: column; gap: 10px; }
  .card h3 { margin: 0; font-size: 18px; font-weight: 700; }
  .card p { margin: 0; font-size: 13px; color: #4b5563; line-height: 1.5; }
  .card ul { margin: 0; padding-left: 18px; display: flex; flex-direction: column; gap: 6px; font-size: 13px; color: #4b5563; }
  .card li { line-height: 1.4; }

  @media (max-width: 720px) {
    .page { padding: 16px; }
    .page-header h2 { font-size: 24px; }
  }
  `]
})
export class PartnerComponent {}

