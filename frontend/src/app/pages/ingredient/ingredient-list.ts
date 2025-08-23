import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TabService } from '../../services/tab.service';
import { SupabaseService } from '../../services/supabase.service';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';


type IngredientRow = { [key: string]: any } & {
  id: string;
  inci_name?: string; korean_name?: string; chinese_name?: string;
  cas_no?: string; scientific_name?: string; function_en?: string; function_kr?: string;
  remarks?: string;
};

@Component({
  selector: 'app-ingredient-list',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule],
  template: `
  <div class="page" (click)="showColMenu=false">
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
        <div class="col-picker" (click)="$event.stopPropagation()">
          <button class="btn ghost" (click)="toggleColMenu()">열</button>
          <div class="menu" *ngIf="showColMenu">
            <div class="menu-head">
              <b>표시할 열</b>
              <span class="spacer"></span>
              <button class="mini" (click)="selectAllCols()">모두 선택</button>
              <button class="mini" (click)="clearAllCols()">모두 해제</button>
            </div>
            <div class="menu-list">
              <label class="menu-item" *ngFor="let c of allColumns">
                <input type="checkbox" [checked]="isVisible(c)" (change)="setVisible(c, $event.target.checked)" />
                <span>{{ headerLabel(c) }}</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </header>

    <section class="filters filters-sticky" (keyup.enter)="load()">
      <div class="grid">
        <span class="chip">키워드</span>
        <input [(ngModel)]="keyword" (ngModelChange)="onKeywordChange($event)" (keydown.escape)="onEscClear()" placeholder="통합 검색 (띄어쓰기로 여러 키워드)" spellcheck="false" autocapitalize="none" autocomplete="off" autocorrect="off" />
        <span class="chip">연산</span>
        <select disabled>
          <option>AND</option>
        </select>
      </div>
    </section>

    <section class="table">
      <div class="table-wrap" (wheel)="onWheel($event)">
        <table class="wide compact">
          <thead>
            <tr cdkDropList cdkDropListOrientation="horizontal" (cdkDropListDropped)="onReorder($event)">
              <th *ngFor="let c of visibleColumns()" cdkDrag [ngStyle]="getColStyle(c)" [class]="'col-'+c">
                {{ headerLabel(c) }}
                <span class="resize-handle" (mousedown)="startResize($event, c)"></span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let r of rows()" [class.hovered]="hoverId===r.id" [class.selected]="selectedId===r.id"
                (mouseenter)="hoverId=r.id" (mouseleave)="hoverId=null"
                (click)="toggleSelect(r.id)" (dblclick)="openEdit(r.id)">
              <td *ngFor="let c of visibleColumns()" [class.nowrap]="c==='cas_no'" class="wrap" [ngStyle]="getColStyle(c)">{{ r[c] }}</td>
            </tr>
            <tr *ngIf="!loading && rows().length === 0"><td class="empty" [attr.colspan]="visibleColumns().length">데이터가 없습니다.</td></tr>
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
  .top-sticky{ position:sticky; top:12px; z-index:100; background:#fff; padding:8px 0; }
  .actions{ display:flex; gap:8px; align-items:center; }
  .btn{ height:30px; padding:0 12px; border-radius:8px; border:1px solid #d1d5db; background:#fff; cursor:pointer; }
  .btn.primary{ background:#111827; color:#fff; border-color:#111827; }
  .btn.ghost{ background:#fff; color:#111827; }
  .page-size label{ margin-right:6px; color:#6b7280; }
  .page-size select{ height:30px; border-radius:8px; border:1px solid #e5e7eb; padding:0 8px; }

  .col-picker{ position:relative; }
  .col-picker .menu{ position:absolute; right:0; top:calc(100% + 6px); width:280px; max-height:340px; overflow:auto; background:#fff; border:1px solid #e5e7eb; border-radius:10px; box-shadow:0 12px 24px rgba(0,0,0,0.12); padding:8px; z-index:1000; }
  .col-picker .menu-head{ display:flex; align-items:center; gap:8px; margin-bottom:6px; }
  .col-picker .menu-head .spacer{ flex:1; }
  .col-picker .mini{ height:24px; padding:0 8px; border-radius:6px; border:1px solid #e5e7eb; background:#fff; font-size:11px; cursor:pointer; }
  .col-picker .menu-list{ display:flex; flex-direction:column; gap:6px; }
  .col-picker .menu-item{ display:flex; align-items:center; gap:8px; font-size:12px; }

  .filters{ background:#fff; border:1px solid #e5e7eb; border-radius:12px; padding:12px 14px; margin:14px 0 18px; }
  .filters-sticky{ position:sticky; top:60px; z-index:10; }
  .grid{ display:grid; grid-template-columns:64px 1fr 52px 120px; gap:8px; align-items:center; }
  .grid input, select{ height:30px; padding:4px 6px; border:1px solid #e5e7eb; border-radius:8px; font-size:12px; }
  .chip{ display:inline-block; padding:4px 10px; background:#f3f4f6; border:1px solid #e5e7eb; border-radius:24px; color:#374151; text-align:center; }

  /* 표 컨테이너는 최대 높이만 제한하여 브라우저 우측 스크롤바가 생기지 않도록 조정 */
  .table-wrap{ overflow:auto; border:1px solid #eef2f7; border-radius:8px; max-height:calc(100% - 200px); position:relative; margin-top:6px; }
  table{ width:100%; border-collapse:collapse; background:#fff; }
  table.wide{ width:max-content; table-layout:fixed; }
  table.compact th, table.compact td{ padding:6px 8px; line-height:1.2; }
  thead th{ position:sticky; top:0; z-index:3; background:#f8fafc; }
  th, td{ border-bottom:1px solid #f1f5f9; border-right:1px solid #f1f5f9; }
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
  th{ position:relative; }
  .resize-handle{ position:absolute; right:0; top:0; height:100%; width:6px; cursor:col-resize; }
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
  columns: string[] = [];
  private readonly baseColumns: string[] = ['inci_name','korean_name','chinese_name','cas_no','function_en','function_kr','remarks'];
  private readonly storageKey = 'ingredient.columns.v2';
  private colWidths: Record<string, number | undefined> = {};
  private resizing: { col: string; startX: number; startW: number } | null = null;
  hoverId: string | null = null;
  selectedId: string | null = null;

  // Column visibility
  allColumns: string[] = [];
  private hiddenCols = new Set<string>();
  showColMenu = false;

  constructor(private supabase: SupabaseService, private router: Router, private route: ActivatedRoute, private tabBus: TabService) {}

  ngOnInit(){
    // Initialize filters from URL query params to preserve state on back navigation
    const qp = this.route.snapshot.queryParamMap;
    const qKeyword = qp.get('q');
    const qOp = qp.get('op') as ('AND' | 'OR') | null;
    const qPage = Number(qp.get('page'));
    const qSize = Number(qp.get('size'));
    if (qKeyword !== null) this.keyword = qKeyword;
    if (qOp === 'AND' || qOp === 'OR') this.keywordOp = qOp;
    if (!Number.isNaN(qPage) && qPage > 0) this.page = qPage;
    if (!Number.isNaN(qSize) && qSize > 0) this.pageSize = qSize;

    const saved = this.loadSavedLayout();
    this.columns = saved.order.length ? saved.order.slice() : this.baseColumns.slice();
    this.colWidths = saved.widths || {};
    this.hiddenCols = new Set<string>(saved.hidden || []);
    this.load();
  }

  async load(){
    this.loading = true;
    const normalizedKeyword = (this.keyword || '').trim().replace(/\s+/g, ' ');
    const { data, count } = await this.supabase.listIngredients({ page: this.page, pageSize: this.pageSize, keyword: normalizedKeyword, keywordOp: this.keywordOp });
    const rows = (data as IngredientRow[]) || [];
    // 추출된 컬럼 중 기본 컬럼 제외 나머지를 extraCols로 구성
    const base = new Set(['id','created_by','updated_by','created_at','updated_at','created_by_name','updated_by_name', ...this.baseColumns]);
    const allCols = rows.reduce<string[]>((acc, r) => { Object.keys(r).forEach(k => { if(!acc.includes(k)) acc.push(k); }); return acc; }, []);
    this.extraCols = allCols.filter(c => !base.has(c));
    // Merge columns with saved order and extras
    const desired = [...this.baseColumns, ...this.extraCols];
    this.columns = this.mergeOrder(this.columns, desired);
    this.allColumns = desired.slice();
    this.rows.set(rows);
    this.total = count || 0;
    this.pages = Math.max(1, Math.ceil(this.total / this.pageSize));
    this.loading = false;
    this.syncQueryParams(normalizedKeyword);
  }

  go(p: number){ this.page = Math.min(Math.max(1, p), this.pages); this.load(); }
  onPageSize(ps: number){ this.pageSize = Number(ps) || 15; this.page = 1; this.load(); }
  reset(){ this.keyword=''; this.keywordOp='AND'; this.page=1; this.pageSize=15; this.load(); }
  onOpChange(op: 'AND' | 'OR'){ this.keywordOp = op; this.page = 1; this.load(); }
  onKeywordChange(value: string){
    this.keyword = value || '';
    this.page = 1;
    // If user just typed a space, keep current results; wait until next token starts
    if (/\s$/.test(this.keyword)) {
      this.syncQueryParams((this.keyword || '').trim().replace(/\s+/g, ' '));
      return;
    }
    this.debouncedLoad();
  }
  onEscClear(){
    this.keyword = '';
    this.page = 1;
    this.load();
  }
  toggleSelect(id: string){ this.selectedId = this.selectedId === id ? null : id; }
  openEdit(id?: string){ const target = id || this.selectedId; if(!target) return; this.onEdit(target); }
  onAdd(){ this.navigateToForm(); }
  onEdit(id?: string){ const target = id || this.selectedId; if(!target) return; this.navigateToForm(target); }
  private navigateToForm(id?: string){
    const queryParams: any = {};
    if (id) queryParams.id = id;
    const normalizedKeyword = (this.keyword || '').trim().replace(/\s+/g, ' ');
    if (normalizedKeyword) queryParams.q = normalizedKeyword;
    if (this.keywordOp) queryParams.op = this.keywordOp;
    if (this.page) queryParams.page = String(this.page);
    if (this.pageSize) queryParams.size = String(this.pageSize);
    const qs = new URLSearchParams(queryParams as any).toString();
    const navUrl = '/app/ingredient/form' + (qs ? ('?' + qs) : '');
    // Keep a single tab for 성분등록 regardless of selected id
    this.tabBus.requestOpen('성분등록', '/app/ingredient/form', navUrl);
  }

  onWheel(ev: WheelEvent){ if (ev.shiftKey) { const wrap = ev.currentTarget as HTMLElement; wrap.scrollLeft += (ev.deltaY || ev.deltaX); ev.preventDefault(); } }

  // Column helpers
  headerLabel(col: string){
    switch(col){
      case 'inci_name': return 'INCI';
      case 'korean_name': return '국문명';
      case 'chinese_name': return '중국명';
      case 'cas_no': return 'CAS No';
      case 'function_en': return '기능(EN)';
      case 'function_kr': return '기능(KR)';
      case 'remarks': return '비고';
      case 'einecs_no': return 'EINECS No.';
      case 'old_korean_name': return '국문명(구명칭)';
      case 'scientific_name': return '학명';
      case 'origin_abs': return 'ABS원산지';
      default: return col;
    }
  }

  visibleColumns(){ return this.columns.filter(c => !this.hiddenCols.has(c)); }
  isVisible(c: string){ return !this.hiddenCols.has(c); }
  setVisible(c: string, checked: boolean){
    if (checked) this.hiddenCols.delete(c); else this.hiddenCols.add(c);
    this.saveLayout();
  }
  toggleColMenu(){ this.showColMenu = !this.showColMenu; }
  selectAllCols(){ this.hiddenCols.clear(); this.saveLayout(); }
  clearAllCols(){ this.hiddenCols = new Set(this.allColumns); this.saveLayout(); }

  onReorder(event: CdkDragDrop<string[]>) {
    const vis = this.visibleColumns();
    const moved = vis[event.previousIndex];
    const target = vis[event.currentIndex];
    const from = this.columns.indexOf(moved);
    const to = this.columns.indexOf(target);
    moveItemInArray(this.columns, from, to);
    this.saveLayout();
  }

  getColStyle(col: string){
    const w = this.colWidths[col];
    return w ? { width: w + 'px', maxWidth: w + 'px' } : {};
  }

  startResize(ev: MouseEvent, col: string){
    ev.preventDefault(); ev.stopPropagation();
    const target = ev.currentTarget as HTMLElement;
    const th = target.closest('th') as HTMLElement | null;
    const startW = th ? th.getBoundingClientRect().width : (this.colWidths[col] || 100);
    this.resizing = { col, startX: ev.clientX, startW };
    const move = (e: MouseEvent) => {
      if (!this.resizing) return;
      const dx = e.clientX - this.resizing.startX;
      const newW = Math.max(10, Math.min(2000, Math.round(this.resizing.startW + dx)));
      this.colWidths[this.resizing.col] = newW;
    };
    const up = () => {
      document.removeEventListener('mousemove', move);
      document.removeEventListener('mouseup', up);
      if (this.resizing){ this.saveLayout(); }
      this.resizing = null;
    };
    document.addEventListener('mousemove', move);
    document.addEventListener('mouseup', up);
  }

  private mergeOrder(savedOrder: string[], desired: string[]): string[] {
    const setDesired = new Set(desired);
    const kept = savedOrder.filter(c => setDesired.has(c));
    for (const c of desired){ if (!kept.includes(c)) kept.push(c); }
    return kept;
  }

  private saveLayout(){
    const payload = { order: this.columns, widths: this.colWidths, hidden: Array.from(this.hiddenCols) } as any;
    try{ localStorage.setItem(this.storageKey, JSON.stringify(payload)); } catch {}
  }

  private loadSavedLayout(): { order: string[]; widths: Record<string, number>; hidden: string[] }{
    try{
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) return { order: [], widths: {}, hidden: [] };
      const data = JSON.parse(raw);
      return { order: Array.isArray(data.order) ? data.order : [], widths: data.widths || {}, hidden: Array.isArray(data.hidden) ? data.hidden : [] };
    } catch { return { order: [], widths: {}, hidden: [] }; }
  }

  // Debounced load for live search as user types
  private debounceTimer: any = null;
  private debouncedLoad(delayMs: number = 300){
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => this.load(), delayMs);
  }

  // Reflect current filters into the URL so that history/back preserves state
  private syncQueryParams(currentKeyword?: string){
    try{
      const kw = currentKeyword !== undefined ? currentKeyword : (this.keyword || '');
      const q: any = { q: kw || null, op: this.keywordOp, page: this.page, size: this.pageSize };
      Object.keys(q).forEach(k => (q[k] === null || q[k] === undefined || q[k] === '') && delete q[k]);
      this.router.navigate([], { relativeTo: this.route, queryParams: q, replaceUrl: true });
    } catch {}
  }
}


