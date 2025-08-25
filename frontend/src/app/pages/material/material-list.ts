import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-material-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="page">
    <header class="top">
      <h2>Material <span class="sub">자재조회</span></h2>
      <div class="spacer"></div>
      <input class="search" [(ngModel)]="q" (keydown.enter)="search()" placeholder="자재명/코드 검색" />
      <button class="btn" (click)="search()">검색</button>
    </header>

    <section class="list">
      <div class="empty" *ngIf="rows().length===0">자재 데이터가 없습니다.</div>
      <table class="grid" *ngIf="rows().length">
        <thead><tr><th>코드</th><th>자재명</th><th>규격</th></tr></thead>
        <tbody>
          <tr *ngFor="let r of rows()">
            <td>{{ r.code }}</td>
            <td>{{ r.name }}</td>
            <td>{{ r.spec || '-' }}</td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
  `,
  styles: [`
  .page{ padding:12px 16px; }
  .top{ display:flex; align-items:center; gap:8px; margin-bottom:8px; }
  .top h2{ margin:0; font-size:22px; font-weight:800; }
  .top .sub{ font-size:14px; font-weight:700; color:#6b7280; margin-left:6px; }
  .spacer{ flex:1; }
  .search{ width:260px; padding:6px 8px; border:1px solid #e5e7eb; border-radius:8px; font-size:12px; }
  .btn{ height:28px; padding:0 10px; border-radius:8px; border:1px solid #d1d5db; background:#fff; cursor:pointer; font-size:12px; }
  .list{ border:1px solid #e5e7eb; border-radius:10px; overflow:auto; }
  table{ width:100%; border-collapse:collapse; table-layout:fixed; }
  th, td{ border-bottom:1px solid #e5e7eb; padding:6px 8px; font-size:12px; }
  th{ background:#f8fafc; text-align:left; }
  .empty{ padding:16px; color:#9ca3af; }
  `]
})
export class MaterialListComponent implements OnInit {
  q = '';
  private sample = [
    { code: 'MAT-1001', name: '박스(중)', spec: '50x30x25' },
    { code: 'MAT-2002', name: '라벨(로고)', spec: '50x20mm' },
  ];
  rows = signal<Array<{ code: string; name: string; spec?: string }>>([]);
  ngOnInit(){ this.rows.set(this.sample.slice()); }
  search(){
    const w = (this.q||'').trim().toLowerCase();
    if (!w){ this.rows.set(this.sample.slice()); return; }
    this.rows.set(this.sample.filter(r => (r.code+' '+r.name+' '+(r.spec||'')).toLowerCase().includes(w)));
  }
}


