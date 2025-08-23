import { Component, OnInit, signal, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import { DragDropModule, CdkDragDrop, moveItemInArray, CdkDragMove } from '@angular/cdk/drag-drop';

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
  imports: [CommonModule, FormsModule, DragDropModule, ScrollingModule],
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
            <div class="menu-list" cdkDropList (cdkDropListDropped)="onReorderMenu($event)">
              <label class="menu-item" *ngFor="let c of orderedMenuColumns(); let i = index" cdkDrag>
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
      <div class="table-wrap" cdkScrollable (wheel)="onWheel($event)" #tableWrap>
        <table class="wide compact">
          <thead>
            <tr cdkDropList cdkDropListOrientation="horizontal" (cdkDropListDropped)="onReorder($event)">
              <th *ngFor="let c of visibleColumns(); let i = index" cdkDrag cdkDragLockAxis="x" (cdkDragStarted)="onDragStart(i)" (cdkDragMoved)="onDragMove($event)" (cdkDragEnded)="onDragEnd()" [ngStyle]="getColStyle(c)" [class]="'col-'+c">
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
  /* Place menu right under the button (like Ingredient list) */
  .col-picker .menu{ position:absolute; right:0; top:calc(100% + 6px); width:280px; max-height:340px; overflow:auto; background:#fff; border:1px solid #e5e7eb; border-radius:10px; box-shadow:0 12px 24px rgba(0,0,0,0.12); padding:8px; z-index:1000; }
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
  .pager{ display:flex; align-items:center; justify-content:space-between; margin-top:8px; }
  .controls{ display:flex; align-items:center; gap:8px; }
  .page-indicator{ min-width:64px; text-align:center; font-weight:800; }
  `]
})
export class ProductListComponent implements OnInit {
  rows = signal<ProductRow[]>([]);
  loading = false; page = 1; pageSize = 15; total = 0; pages = 1;
  keyword = ''; keywordOp: 'AND' | 'OR' = 'AND';
  @ViewChild('tableWrap') tableWrapRef!: ElementRef<HTMLDivElement>;
  private autoScrollInterval: any = null;
  private dragStartIndex: number | null = null;
  columns: string[] = []; allColumns: string[] = []; extraCols: string[] = [];
  // 기본 표시 열: 품목자산분류, 품번, 품명
  private readonly baseColumns = [
    'asset_category',    // 품목자산분류
    'product_code',      // 품번
    'name_kr'            // 품명
  ];
  // 저장 키 버전을 올려 이전 사용자 설정과 분리 (새 기본 표시 열을 강제 적용)
  private readonly storageKey = 'product.columns.v2';
  private firstInit = false;
  private colLabelMap = new Map<string,string>();
  private readonly fallbackLabels: Record<string,string> = {
    // Required / basics
    product_code: '품번',
    name_kr: '품명',
    asset_category: '품목자산분류',
    // Registration / meta
    item_status: '등록상태',
    reg_date: '등록일자',
    reg_user: '등록자',
    last_update_date: '최종수정일자',
    last_update_user: '최종수정자',
    domestic_overseas: '내외국구분',
    item_subcategory: '품목소분류',
    importance: '중요도',
    managing_department: '관리부서',
    manager: '관리자',
    item_category: '품목대분류',
    item_midcategory: '품목중분류',
    shipping_type: '출하형태',
    is_main_item: '대표품목',
    is_set_item: '세트품목',
    is_bom_registered: 'BOM등록여부',
    has_process_materials: '재공품재료사용',
    lot_control: 'Lot관리',
    serial_control: 'Serial관리',
    inspection_target: '검사대상',
    shelf_life_type: '유통기간형태',
    shelf_life_period: '유통기간',
    sm_asset_grp: 'SM자산그룹',
    default_supplier: '기본구매처',
    vat_type: '부가세유형',
    sale_price_includes_vat: '판매가격에부가세포함여부',
    attachment: '첨부파일',
    image_url: '이미지',
    main_name: '대표품명',
    main_code: '대표품번',
    main_spec: '대표규격',
    spec: '규격',
    name_en: '영문명',
    remarks: '품목설명',
    unit: '기준단위',
    item_subdivision: '세부품목',
    keywords_alias: '검색어(이명)',
    specification: '사양',
    special_notes: '품목특이사항',
    // Scientific / compliance
    cas_no: 'CAS',
    moq: 'MOQ',
    package_unit: '포장단위',
    manufacturer: 'Manufacturer',
    country_of_manufacture: 'Country of Manufacture',
    source_of_origin_method: 'Source of Origin(Method)',
    plant_part: 'Plant Part',
    country_of_origin: 'Country of Origin',
    nmpa_no: '중국원료신고번호(NMPA)',
    allergen: '알러젠성분',
    furocoumarins: 'Furocoumarines',
    efficacy: '효능',
    patent: '특허',
    paper: '논문',
    clinical: '임상',
    expiration_date: '사용기한',
    storage_location: '보관위치',
    storage_method1: '보관방법1',
    stability_note1: '안정성 및 유의사항1',
    storage_note1: 'Note on storage1',
    safety_handling1: '안전 및 취급 주의사항1',
    notice_coa3_en_1: 'NOTICE(COA3 영문)1',
    notice_coa3_kr_1: 'NOTICE(COA3 국문)1',
    notice_comp_kr_1: 'NOTICE(Composition 국문)1',
    notice_comp_en_1: 'NOTICE(Composition 영문)1',
    caution_origin_1: 'CAUTION(Origin)1',
    cert_kosher: 'KOSHER 인증',
    cert_halal: 'HALAL 인증',
    cert_vegan: 'VEGAN 인증',
    cert_isaaa: 'ISAAA 인증',
    cert_rspo: 'RSPO 인증',
    cert_reach: 'REACH 인증',
    expiration_date2: 'Expiration Date2',
    storage_method2: '보관방법2',
    stability_note2: '안정성 및 유의사항2',
    storage_note2: 'Note on storage2',
    safety_handling2: '안전 및 취급 주의사항2',
    notice_coa3_en_2: 'NOTICE(COA3 영문)2',
    notice_coa3_kr_2: 'NOTICE(COA3 국문)2',
    notice_comp_kr_2: 'NOTICE(Composition 국문)2',
    notice_comp_en_2: 'NOTICE(Composition 영문)2',
    caution_origin_2: 'CAUTION(Origin)2'
  };
  private colWidths: Record<string, number | undefined> = {}; private resizing: { col: string; startX: number; startW: number } | null = null;
  hoverId: string | null = null; selectedId: string | null = null; showColMenu = false; private hiddenCols = new Set<string>();

  constructor(private supabase: SupabaseService, private router: Router) {}
  ngOnInit(){
    const saved = this.loadSavedLayout();
    this.columns = saved.order.length ? saved.order.slice() : this.baseColumns.slice();
    this.colWidths = saved.widths || {};
    this.hiddenCols = new Set(saved.hidden || []);
    // 첫 초기화 여부: 사용자가 저장한 레이아웃이 없는 경우
    this.firstInit = (saved.order.length === 0 && (!saved.hidden || saved.hidden.length === 0));
    this.load();
    this.loadColumnLabels();
  }

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
    // 최초 진입 시에는 기본 열 외의 추가 열은 숨김 처리하여 요청한 3개만 보이도록 함
    if (this.firstInit && this.hiddenCols.size === 0) {
      for (const c of this.extraCols) { this.hiddenCols.add(c); }
      // baseColumns 외에 과거에 저장된 열이 columns에 있더라도 숨김 처리
      for (const c of this.columns) { if (!this.baseColumns.includes(c) && !this.extraCols.includes(c)) { this.hiddenCols.add(c); } }
      this.saveLayout();
      this.firstInit = false;
    }
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

  // Auto-scroll table container while dragging a header near edges
  onDragMove(event: CdkDragMove){
    const wrap = this.tableWrapRef?.nativeElement; if (!wrap) return;
    const rect = wrap.getBoundingClientRect();
    const x = event.pointerPosition.x;
    const edge = 40; // px threshold
    const speed = 20; // px per tick
    // Determine scroll direction
    let dx = 0;
    if (x < rect.left + edge) dx = -speed;
    else if (x > rect.right - edge) dx = speed;
    if (dx !== 0){
      if (!this.autoScrollInterval){
        this.autoScrollInterval = setInterval(()=>{ wrap.scrollLeft += dx; }, 16);
      }
    } else {
      this.onDragEnd();
    }
  }
  onDragEnd(){ if (this.autoScrollInterval){ clearInterval(this.autoScrollInterval); this.autoScrollInterval = null; } }
  onHeaderEnter(index:number){
    // When dragging across hidden columns via scroll, ensure current hover index is updated
    // so that dropping reorders relative to the newly entered header
    this.dragStartIndex = this.dragStartIndex ?? index;
  }

  headerLabel(col:string){
    // Use dynamic mapping if available
    // Prefer ERP fallback first for stability; DB mapping can override only if meaningful
    const fallback = this.fallbackLabels[col];
    const mapped = this.colLabelMap.get(col);
    if (fallback) return fallback;
    return (mapped && mapped.trim()) || col;
  }
  visibleColumns(){ return this.columns.filter(c => !this.hiddenCols.has(c)); }
  isVisible(c:string){ return !this.hiddenCols.has(c); }
  setVisible(c:string, checked:boolean){ if (checked) this.hiddenCols.delete(c); else this.hiddenCols.add(c); this.saveLayout(); }
  toggleColMenu(){ this.showColMenu = !this.showColMenu; } selectAllCols(){ this.hiddenCols.clear(); this.saveLayout(); } clearAllCols(){ this.hiddenCols = new Set(this.allColumns); this.saveLayout(); }
  orderedMenuColumns(){
    // Show columns in the same order as currently arranged left-to-right
    const order = this.columns.slice();
    const set = new Set(order);
    // Include any columns not in order at the end (safety)
    for (const c of this.allColumns){ if (!set.has(c)) order.push(c); }
    return order.filter(c => this.allColumns.includes(c));
  }
  onReorderMenu(e: CdkDragDrop<string[]>) {
    const ordered = this.orderedMenuColumns();
    const moved = ordered[e.previousIndex];
    const target = ordered[e.currentIndex];
    const from = this.columns.indexOf(moved);
    const to = this.columns.indexOf(target);
    if (from >= 0 && to >= 0 && from !== to){
      moveItemInArray(this.columns, from, to);
      this.saveLayout();
    }
  }
  onReorder(e:CdkDragDrop<string[]>) {
    const vis = this.visibleColumns();
    const prevIndex = typeof e.previousIndex === 'number' ? e.previousIndex : (this.dragStartIndex ?? 0);
    const currIndex = typeof e.currentIndex === 'number' ? e.currentIndex : prevIndex;
    const moved = vis[prevIndex];
    const target = vis[currIndex];
    const from = this.columns.indexOf(moved);
    const to = this.columns.indexOf(target);
    if (from >= 0 && to >= 0 && from !== to) {
      moveItemInArray(this.columns, from, to);
      this.saveLayout();
    }
    this.dragStartIndex = null;
  }
  onDragStart(i:number){ this.dragStartIndex = i; }
  getColStyle(col:string){ const w = this.colWidths[col]; return w ? { width: w + 'px', maxWidth: w + 'px' } : {}; }
  startResize(ev:MouseEvent, col:string){ ev.preventDefault(); ev.stopPropagation(); const th=(ev.currentTarget as HTMLElement).closest('th') as HTMLElement|null; const startW = th? th.getBoundingClientRect().width: (this.colWidths[col]||120); this.resizing={col,startX:ev.clientX,startW}; const move=(e:MouseEvent)=>{ if(!this.resizing) return; const dx=e.clientX-this.resizing.startX; this.colWidths[this.resizing.col]=Math.max(10, Math.min(2000, Math.round(this.resizing.startW+dx))); }; const up=()=>{ document.removeEventListener('mousemove',move); document.removeEventListener('mouseup',up); if(this.resizing){ this.saveLayout(); } this.resizing=null; }; document.addEventListener('mousemove',move); document.addEventListener('mouseup',up); }
  private mergeOrder(saved:string[], desired:string[]){ const set=new Set(desired); const kept=saved.filter(c=>set.has(c)); for(const c of desired){ if(!kept.includes(c)) kept.push(c); } return kept; }
  private saveLayout(){ const payload={ order:this.columns, widths:this.colWidths, hidden:Array.from(this.hiddenCols)}; try{ localStorage.setItem(this.storageKey, JSON.stringify(payload)); }catch{} }
  private loadSavedLayout(){ try{ const raw=localStorage.getItem(this.storageKey); if(!raw) return { order:[],widths:{},hidden:[] }; const d=JSON.parse(raw); return { order:Array.isArray(d.order)? d.order:[], widths:d.widths||{}, hidden:Array.isArray(d.hidden)? d.hidden:[] }; }catch{ return { order:[],widths:{},hidden:[] }; }
  }
  // Debounce for live typing
  private debounceTimer:any=null; private debouncedLoad(delayMs:number=300){ if(this.debounceTimer) clearTimeout(this.debounceTimer); this.debounceTimer=setTimeout(()=>this.load(), delayMs); }

  private async loadColumnLabels(){
    try{
      const rows = await this.supabase.getProductColumnMap();
      this.colLabelMap.clear();
      for(const r of rows){
        const key = r?.db_column as string;
        const label = (r?.sheet_label_kr ?? '') as string;
        // Ignore empty labels and labels that are just the DB column name to avoid overriding fallback
        if (key && label && label.trim() && label.trim() !== key) {
          this.colLabelMap.set(key, label.trim());
        }
      }
    }catch{}
  }
}


