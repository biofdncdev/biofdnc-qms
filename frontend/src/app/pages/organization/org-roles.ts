import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-org-roles',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
  <section class="page org-roles">
    <h2>업무분장</h2>
    <div class="subnav">
      <a routerLink="/app/organization/roles?dept=rm" class="chip">원료제조</a>
      <a routerLink="/app/organization/roles?dept=qa" class="chip">품질보증</a>
    </div>
    <p>좌측 상단의 탭에 추가되어 빠르게 이동할 수 있습니다.</p>
  </section>
  `
})
export class OrgRolesComponent {}


