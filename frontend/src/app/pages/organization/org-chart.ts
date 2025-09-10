import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-org-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
  <section class="page org-chart">
    <h2>조직도</h2>
    <p>조직도는 추후 설계에 맞춰 시각화 구성 예정입니다.</p>
  </section>
  `
})
export class OrgChartComponent {}


