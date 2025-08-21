import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';

type IngredientRow = { [key: string]: any } & {
  id: string;
  inci_name?: string; korean_name?: string; chinese_name?: string;
  cas_no?: string; scientific_name?: string; function_en?: string; function_kr?: string;
  remarks?: string;
};

@Component({
  selector: 'app-ingredient-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="page">
    <header class="top top-sticky">
      <h2>Ingredient</h2>
      <div class="actions">
        <button class="btn ghost" (click)="onAdd()">추가</button>
        <button class="btn ghost" [disabled]="!selectedId" (click)="onEdit()">수정</button>
        <button class="btn ghost" (click)="load()">조회</button>
        <button class="btn ghost" (click)="reset()">초기화</button>
        <div class="page-size">
          <label>표시 개수</label>
          <select [(ngModel)]="pageSize" (ngModelChange)="onPageSize($event)">
            <option [value]="15">15</option>
            <option [value]="50">50</option>
            <option [value]="100">100</option>
          </select>
        </div>
      </div>
    </header>

    <section class="filters filters-sticky" (keyup.enter)="load()">
      <div class="grid">
        <span class="chip">키워드</span>
        <input [(ngModel)]="keyword" (keydown.escape)="keyword=''" placeholder="통합 검색 (띄어쓰기로 여러 키워드)" />
        <span class="chip">연산</span>
        <select [(ngModel)]="keywordOp">
          <option value="AND">AND</option>
          <option value="OR">OR</option>
        </select>
      </div>
    </section>

    <section class="table">
      <div class="table-wrap" (wheel)="onWheel($event)">
        <table class="wide compact">
          <thead>
            <tr>
              <th class="col-inci">INCI</th>
              <th class="col-kr">국문명</th>
              <th class="col-cn">중국명</th>
              <th class="col-cas">CAS No</th>
              <th class="col-fen">기능(EN)</th>
              <th class="col-fkr">기능(KR)</th>
              <th class="col-remarks">비고</th>
              <th class="extra" *ngFor="let c of extraCols">{{ c }}</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let r of rows()" [class.hovered]="hoverId===r.id" [class.selected]="selectedId===r.id"
                (mouseenter)="hoverId=r.id" (mouseleave)="hoverId=null"
                (click)="toggleSelect(r.id)" (dblclick)="openEdit(r.id)">
              <td class="wrap">{{ r.inci_name }}</td>
              <td class="wrap">{{ r.korean_name }}</td>
              <td class="wrap">{{ r.chinese_name }}</td>
              <td class="nowrap">{{ r.cas_no }}</td>
              <td class="wrap">{{ r.function_en }}</td>
              <td class="wrap">{{ r.function_kr }}</td>
              <td class="wrap col-remarks">{{ r.remarks }}</td>
              <td class="wrap extra" *ngFor="let c of extraCols">{{ r[c] }}</td>
            </tr>
            <tr *ngIf="!loading && rows().length === 0"><td class="empty" [attr.colspan]="7+extraCols.length">데이터가 없습니다.</td></tr>
          </tbody>
        </table>
      </div>
    </section>

    <footer class="pager">
      <div class="stat">총 {{ total }} 건</div>
      <div class="controls">
        <button class="btn" [disabled]="page<=1" (click)="go(1)">« 처음</button>
        <button class="btn" [disabled]="page<=1" (click)="go(page-1)">‹ 이전</button>
        <span class="page-indicator">{{ page }} / {{ pages }}</span>
        <button class="btn" [disabled]="page>=pages" (click)="go(page+1)">다음 ›</button>
        <button class="btn" [disabled]="page>=pages" (click)="go(pages)">마지막 »</button>
      </div>
    </footer>
  </div>
  `,
  styles: [`
  .page{ padding:12px 16px; font-size:13px; box-sizing:border-box; height:100%; overflow:hidden; }
  .top{ display:flex; align-items:center; justify-content:space-between; margin-bottom:8px; }
  .top h2{ font-size:24px; font-weight:800; margin:0; }
  .top-sticky{ position:sticky; top:12px; z-index:5; background:#fff; padding:8px 0; }
  .actions{ display:flex; gap:8px; align-items:center; }
  .btn{ height:30px; padding:0 12px; border-radius:8px; border:1px solid #d1d5db; background:#fff; cursor:pointer; }
  .btn.primary{ background:#111827; color:#fff; border-color:#111827; }
  .btn.ghost{ background:#fff; color:#111827; }
  .page-size label{ margin-right:6px; color:#6b7280; }
  .page-size select{ height:30px; border-radius:8px; border:1px solid #e5e7eb; padding:0 8px; }

  .filters{ background:#fff; border:1px solid #e5e7eb; border-radius:12px; padding:12px 14px; margin:14px 0 18px; }
  .filters-sticky{ position:sticky; top:60px; z-index:5; }
  .grid{ display:grid; grid-template-columns:64px 1fr 52px 120px; gap:8px; align-items:center; }
  .grid input, select{ height:30px; padding:4px 6px; border:1px solid #e5e7eb; border-radius:8px; font-size:12px; }
  .chip{ display:inline-block; padding:4px 10px; background:#f3f4f6; border:1px solid #e5e7eb; border-radius:24px; color:#374151; text-align:center; }

  /* 표 컨테이너는 최대 높이만 제한하여 브라우저 우측 스크롤바가 생기지 않도록 조정 */
  .table-wrap{ overflow:auto; border:1px solid #eef2f7; border-radius:8px; max-height:calc(100% - 200px); position:relative; margin-top:6px; }
  table{ width:100%; border-collapse:collapse; background:#fff; }
  table.wide{ width:max-content; table-layout:fixed; }
  table.compact th, table.compact td{ padding:6px 8px; line-height:1.2; }
  thead th{ position:sticky; top:0; z-index:3; background:#f8fafc; }
  th, td{ border-bottom:1px solid #f1f5f9; }
  /* 반응형 고정폭(상한) + 줄바꿈 */
  .col-inci{ width:clamp(200px, 26vw, 300px); max-width:300px; }
  .col-kr{ width:clamp(200px, 26vw, 300px); max-width:300px; }
  .col-fen{ width:clamp(200px, 28vw, 300px); max-width:300px; }
  .col-fkr{ width:clamp(160px, 20vw, 260px); max-width:260px; }
  .col-cn{ width:clamp(140px, 14vw, 200px); max-width:200px; }
  .col-cas{ width:clamp(100px, 10vw, 140px); max-width:140px; }
  .col-remarks{ width:clamp(160px, 20vw, 260px); max-width:260px; }
  th.extra, td.extra{ width:clamp(140px, 16vw, 220px); max-width:220px; }
  td.wrap{ white-space:normal; word-break:break-word; }
  td.nowrap{ white-space:nowrap; }
  .empty{ text-align:center; color:#94a3b8; }
  tr.hovered{ box-shadow: inset 0 0 0 9999px rgba(99,102,241,0.06); }
  tr.selected{ box-shadow: inset 0 0 0 9999px rgba(59,130,246,0.10); outline: 2px solid rgba(37,99,235,0.35); }
  .pager{ display:flex; align-items:center; justify-content:space-between; margin-top:8px; }
  .controls{ display:flex; align-items:center; gap:8px; }
  .page-indicator{ min-width:64px; text-align:center; font-weight:800; }
  `]
})
export class IngredientListComponent implements OnInit {
  rows = signal<IngredientRow[]>([]);
  loading = false;
  page = 1;
  pageSize = 15;
  total = 0;
  pages = 1;
  keyword = '';
  keywordOp: 'AND' | 'OR' = 'AND';
  extraCols: string[] = [];
  hoverId: string | null = null;
  selectedId: string | null = null;

  constructor(private supabase: SupabaseService, private router: Router) {}

  ngOnInit(){ this.load(); }

  async load(){
    this.loading = true;
    const { data, count } = await this.supabase.listIngredients({ page: this.page, pageSize: this.pageSize, keyword: this.keyword, keywordOp: this.keywordOp });
    const rows = (data as IngredientRow[]) || [];
    // 추출된 컬럼 중 기본 컬럼 제외 나머지를 extraCols로 구성
    const base = new Set(['id','inci_name','korean_name','chinese_name','cas_no','function_en','function_kr','remarks']);
    const allCols = rows.reduce<string[]>((acc, r) => { Object.keys(r).forEach(k => { if(!acc.includes(k)) acc.push(k); }); return acc; }, []);
    this.extraCols = allCols.filter(c => !base.has(c));
    this.rows.set(rows);
    this.total = count || 0;
    this.pages = Math.max(1, Math.ceil(this.total / this.pageSize));
    this.loading = false;
  }

  go(p: number){ this.page = Math.min(Math.max(1, p), this.pages); this.load(); }
  onPageSize(ps: number){ this.pageSize = Number(ps) || 15; this.page = 1; this.load(); }
  reset(){ this.keyword=''; this.keywordOp='AND'; this.page=1; this.pageSize=15; this.load(); }
  toggleSelect(id: string){ this.selectedId = this.selectedId === id ? null : id; }
  openEdit(id?: string){ const target = id || this.selectedId; if(!target) return; this.onEdit(target); }
  onAdd(){ this.navigateToForm(); }
  onEdit(id?: string){ const target = id || this.selectedId; if(!target) return; this.navigateToForm(target); }
  private navigateToForm(id?: string){
    const extras = id ? { queryParams: { id } } : {} as any;
    this.router.navigate(['/app/ingredient/form'], extras);
  }

  onWheel(ev: WheelEvent){ if (ev.shiftKey) { const wrap = ev.currentTarget as HTMLElement; wrap.scrollLeft += (ev.deltaY || ev.deltaX); ev.preventDefault(); } }
}


