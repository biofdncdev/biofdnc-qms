import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

type ProductRow = { [key:string]: any } & {
  id: string;
  product_code?: string; // 품번
  main_code?: string;    // 대표품번
  name_kr?: string;      // 품명
  name_en?: string;      // 영문명
  item_category?: string; // 품목대분류
  item_midcategory?: string; // 품목중분류
  item_status?: string;  // 품목상태
  asset_category?: string; // 품목자산분류
  spec?: string;         // 규격
  unit?: string;         // 기준단위
  remarks?: string;
};

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule],
  template: `
  <div class="page" (click)="showColMenu=false">
    <header class="top top-sticky">
      <h2>Product</h2>
      <div class="actions">
        <button class="btn ghost" (click)="onAdd()">추가</button>
        <button class="btn ghost" [disabled]="!selectedId" (click)="openEdit()">수정</button>
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
        <select [(ngModel)]="keywordOp" (ngModelChange)="load()">
          <option value="AND">AND</option>
          <option value="OR">OR</option>
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
              <td *ngFor="let c of visibleColumns()" class="wrap" [ngStyle]="getColStyle(c)">{{ r[c] }}</td>
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
  .btn.ghost{ background:#fff; color:#111827; }
  .page-size label{ margin-right:6px; color:#6b7280; }
  .page-size select{ height:30px; border-radius:8px; border:1px solid #e5e7eb; padding:0 8px; }
  .filters{ background:#fff; border:1px solid #e5e7eb; border-radius:12px; padding:12px 14px; margin:14px 0 18px; }
  .col-picker{ position:relative; }
  .col-picker .menu{ position:fixed; right:26px; top:88px; width:280px; max-height:340px; overflow:auto; background:#fff; border:1px solid #e5e7eb; border-radius:10px; box-shadow:0 12px 24px rgba(0,0,0,0.12); padding:8px; z-index:1000; }
  .col-picker .menu-head{ display:flex; align-items:center; gap:8px; margin-bottom:6px; }
  .col-picker .menu-head .spacer{ flex:1; }
  .col-picker .mini{ height:24px; padding:0 8px; border-radius:6px; border:1px solid #e5e7eb; background:#fff; font-size:11px; cursor:pointer; }
  .col-picker .menu-list{ display:flex; flex-direction:column; gap:6px; }
  .col-picker .menu-item{ display:flex; align-items:center; gap:8px; font-size:12px; }
  .filters-sticky{ position:sticky; top:60px; z-index:5; }
  .grid{ display:grid; grid-template-columns:64px 1fr 52px 120px; gap:8px; align-items:center; }
  .grid input, select{ height:30px; padding:4px 6px; border:1px solid #e5e7eb; border-radius:8px; font-size:12px; }
  .chip{ display:inline-block; padding:4px 10px; background:#f3f4f6; border:1px solid #e5e7eb; border-radius:24px; color:#374151; text-align:center; }
  .table-wrap{ overflow:auto; border:1px solid #eef2f7; border-radius:8px; max-height:calc(100% - 200px); position:relative; margin-top:6px; }
  table{ width:100%; border-collapse:collapse; background:#fff; }
  table.wide{ width:max-content; table-layout:fixed; }
  table.compact th, table.compact td{ padding:6px 8px; line-height:1.2; }
  thead th{ position:sticky; top:0; z-index:3; background:#f8fafc; }
  th, td{ border-bottom:1px solid #f1f5f9; border-right:1px solid #f1f5f9; }
  td.wrap{ white-space:normal; word-break:break-word; }
  .empty{ text-align:center; color:#94a3b8; }
  th{ position:relative; }
  .resize-handle{ position:absolute; right:0; top:0; height:100%; width:6px; cursor:col-resize; }
  `]
})
export class ProductListComponent implements OnInit {
  rows = signal<ProductRow[]>([]);
  loading = false; page = 1; pageSize = 15; total = 0; pages = 1;
  keyword = ''; keywordOp: 'AND' | 'OR' = 'AND';
  columns: string[] = []; allColumns: string[] = []; extraCols: string[] = [];
  private readonly baseColumns = [
    'product_code',      // 품번
    'main_code',         // 대표품번
    'name_kr',           // 품명
    'name_en',           // 영문명
    'item_category',     // 품목대분류
    'item_status',       // 품목상태
    'asset_category',    // 품목자산분류
    'remarks'            // 비고
  ];
  private readonly storageKey = 'product.columns.v1';
  private colWidths: Record<string, number | undefined> = {}; private resizing: { col: string; startX: number; startW: number } | null = null;
  hoverId: string | null = null; selectedId: string | null = null; showColMenu = false; private hiddenCols = new Set<string>();

  constructor(private supabase: SupabaseService, private router: Router) {}
  ngOnInit(){ const saved = this.loadSavedLayout(); this.columns = saved.order.length? saved.order.slice(): this.baseColumns.slice(); this.colWidths = saved.widths || {}; this.hiddenCols = new Set(saved.hidden||[]); this.load(); }

  async load(){
    this.loading = true;
    const { data, count } = await this.supabase.listProducts({ page: this.page, pageSize: this.pageSize, keyword: this.keyword, keywordOp: this.keywordOp }) as any;
    const rows = (data as ProductRow[]) || [];
    // Detect extra columns in DB and show them as optional columns
    const baseSet = new Set(['id', ...this.baseColumns]);
    const allCols = rows.reduce<string[]>((acc, r) => { Object.keys(r || {}).forEach(k => { if(!acc.includes(k)) acc.push(k); }); return acc; }, []);
    this.extraCols = allCols.filter(c => !baseSet.has(c));
    const desired = [...this.baseColumns, ...this.extraCols];
    this.columns = this.mergeOrder(this.columns, desired);
    this.allColumns = desired.slice();
    this.rows.set(rows);
    this.total = count || 0;
    this.pages = Math.max(1, Math.ceil(this.total / this.pageSize));
    this.loading = false;
  }
  go(p:number){ this.page = Math.min(Math.max(1,p), this.pages); this.load(); } onPageSize(ps:number){ this.pageSize = Number(ps)||15; this.page=1; this.load(); } reset(){ this.keyword=''; this.keywordOp='AND'; this.page=1; this.pageSize=15; this.load(); }
  onKeywordChange(value:string){
    this.keyword = value || '';
    this.page = 1;
    if (/\s$/.test(this.keyword)) { return; }
    this.debouncedLoad();
  }
  onEscClear(){ this.keyword=''; this.page=1; this.load(); }
  toggleSelect(id:string){ this.selectedId = this.selectedId===id? null: id; } openEdit(id?:string){ const t = id||this.selectedId; if(!t) return; this.router.navigate(['/app/product/form'], { queryParams: { id: t } }); }
  onAdd(){ this.router.navigate(['/app/product/form']); }
  onWheel(ev: WheelEvent){ if (ev.shiftKey) { const wrap = ev.currentTarget as HTMLElement; wrap.scrollLeft += (ev.deltaY || ev.deltaX); ev.preventDefault(); } }

  headerLabel(col:string){
    switch(col){
      case 'product_code': return '품번';
      case 'main_code': return '대표품번';
      case 'name_kr': return '품명';
      case 'name_en': return '영문명';
      case 'item_category': return '품목대분류';
      case 'item_midcategory': return '품목중분류';
      case 'item_status': return '품목상태';
      case 'asset_category': return '품목자산분류';
      case 'spec': return '규격';
      case 'unit': return '기준단위';
      case 'remarks': return '비고';
      default: return col;
    }
  }
  visibleColumns(){ return this.columns.filter(c => !this.hiddenCols.has(c)); }
  isVisible(c:string){ return !this.hiddenCols.has(c); }
  setVisible(c:string, checked:boolean){ if (checked) this.hiddenCols.delete(c); else this.hiddenCols.add(c); this.saveLayout(); }
  toggleColMenu(){ this.showColMenu = !this.showColMenu; } selectAllCols(){ this.hiddenCols.clear(); this.saveLayout(); } clearAllCols(){ this.hiddenCols = new Set(this.allColumns); this.saveLayout(); }
  onReorder(e:CdkDragDrop<string[]>) { const vis = this.visibleColumns(); const moved = vis[e.previousIndex]; const target = vis[e.currentIndex]; const from = this.columns.indexOf(moved); const to = this.columns.indexOf(target); moveItemInArray(this.columns, from, to); this.saveLayout(); }
  getColStyle(col:string){ const w = this.colWidths[col]; return w ? { width: w + 'px', maxWidth: w + 'px' } : {}; }
  startResize(ev:MouseEvent, col:string){ ev.preventDefault(); ev.stopPropagation(); const th=(ev.currentTarget as HTMLElement).closest('th') as HTMLElement|null; const startW = th? th.getBoundingClientRect().width: (this.colWidths[col]||120); this.resizing={col,startX:ev.clientX,startW}; const move=(e:MouseEvent)=>{ if(!this.resizing) return; const dx=e.clientX-this.resizing.startX; this.colWidths[this.resizing.col]=Math.max(10, Math.min(2000, Math.round(this.resizing.startW+dx))); }; const up=()=>{ document.removeEventListener('mousemove',move); document.removeEventListener('mouseup',up); if(this.resizing){ this.saveLayout(); } this.resizing=null; }; document.addEventListener('mousemove',move); document.addEventListener('mouseup',up); }
  private mergeOrder(saved:string[], desired:string[]){ const set=new Set(desired); const kept=saved.filter(c=>set.has(c)); for(const c of desired){ if(!kept.includes(c)) kept.push(c); } return kept; }
  private saveLayout(){ const payload={ order:this.columns, widths:this.colWidths, hidden:Array.from(this.hiddenCols)}; try{ localStorage.setItem(this.storageKey, JSON.stringify(payload)); }catch{} }
  private loadSavedLayout(){ try{ const raw=localStorage.getItem(this.storageKey); if(!raw) return { order:[],widths:{},hidden:[] }; const d=JSON.parse(raw); return { order:Array.isArray(d.order)? d.order:[], widths:d.widths||{}, hidden:Array.isArray(d.hidden)? d.hidden:[] }; }catch{ return { order:[],widths:{},hidden:[] }; }
  }
  // Debounce for live typing
  private debounceTimer:any=null; private debouncedLoad(delayMs:number=300){ if(this.debounceTimer) clearTimeout(this.debounceTimer); this.debounceTimer=setTimeout(()=>this.load(), delayMs); }
}


