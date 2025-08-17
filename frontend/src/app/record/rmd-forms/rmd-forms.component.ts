import { Component, computed, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RMD_FORM_CATEGORIES, RmdFormCategory, RmdFormItem } from './rmd-forms-data';

@Component({
  selector: 'app-rmd-forms',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styleUrls: ['../../standard/rmd/rmd-page.component.scss'],
  template: `
  <div class="page">
    <aside class="left">
      <div class="sticky">
        <h2>원료제조팀 지시·기록서</h2>
        <div class="search">
          <input type="search" placeholder="지시·기록서 제목 검색" [ngModel]="query()" (ngModelChange)="query.set($event)">
          <button class="clear" *ngIf="query()" (click)="query.set('')">×</button>
        </div>
      </div>
      <ng-container *ngFor="let cat of filtered()">
        <hr />
        <h4 class="cat">{{ cat.category }}</h4>
        <button class="item" *ngFor="let it of cat.items" (click)="open(it)">{{ it.id }}. {{ it.title }}</button>
      </ng-container>
    </aside>

    <main class="right">
      <div class="toolbar">
        <h3 *ngIf="selected(); else choose"> {{ selected()?.title }} </h3>
        <div class="spacer"></div>
      </div>
      <ng-template #choose><h3>좌측에서 항목을 선택하세요.</h3></ng-template>
      <section class="content">
        <div *ngIf="selected()">
          <p>문서번호: {{ selected()?.id }}</p>
          <p>문서명: {{ selected()?.title }}</p>
          <p class="muted">실제 양식 문서는 추후 연결/업로드가 필요합니다.</p>
        </div>
      </section>
    </main>
  </div>
  `,
})
export class RmdFormsComponent {
  categories: RmdFormCategory[] = RMD_FORM_CATEGORIES;
  query = signal('');
  selected = signal<RmdFormItem | null>(null);

  filtered = computed(() => {
    const q = this.query().trim().toLowerCase();
    if (!q) return this.categories;
    return this.categories.map(cat => ({
      ...cat,
      items: cat.items.filter(i => i.id.toLowerCase().includes(q) || i.title.toLowerCase().includes(q))
    })).filter(cat => cat.items.length > 0);
  });

  open(it: RmdFormItem){ this.selected.set(it); }
}
