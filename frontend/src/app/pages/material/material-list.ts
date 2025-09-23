import { Component, OnInit, signal, ViewChild, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { DragDropModule, CdkDragDrop, moveItemInArray, CdkDragMove } from '@angular/cdk/drag-drop';
import { Router } from '@angular/router';
import { ErpDataService } from '../../services/erp-data.service';
import { TabService } from '../../services/tab.service';

type MaterialRow = { [key:string]: any } & { id: string };

@Component({
  selector: 'app-material-list',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule, ScrollingModule],
  template: `
  <div class="page" (click)="showColMenu=false">
    <header class="top top-sticky">
      <h2>Material</h2>
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
          <div class="menu" *ngIf="showColMenu" cdkScrollable #menuEl (wheel)="onMenuWheel($event)">
            <div class="menu-head">
              <b>표시할 열</b>
              <span class="spacer"></span>
              <button class="mini" (click)="selectAllCols()">모두 선택</button>
              <button class="mini" (click)="clearAllCols()">모두 해제</button>
            </div>
            <div class="menu-list" cdkDropList (cdkDropListDropped)="onReorderMenu($event)" #menuList>
              <label class="menu-item" *ngFor="let c of orderedMenuColumns(); let i = index" cdkDrag (cdkDragMoved)="onMenuDragMove($event)" (cdkDragEnded)="onMenuDragEnd()">
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
  .page{ padding:12px 16px; font-size:13px; box-sizing:border-box; height:100%; overflow:hidden; display:flex; flex-direction:column; }
  .top{ position: sticky; top: 0; z-index: 20; background:#fff; display:flex; align-items:center; justify-content:space-between; margin-bottom:8px; }
  .top h2{ font-size:24px; font-weight:800; margin:0; }
  .top-sticky{ position:sticky; top:12px; z-index:100; background:#fff; padding:8px 0; }
  .actions{ display:flex; gap:8px; align-items:center; }
  .btn{ height:30px; padding:0 12px; border-radius:8px; border:1px solid #d1d5db; background:#fff; cursor:pointer; }
  .btn.ghost{ background:#fff; color:#111827; }
  .page-size label{ margin-right:6px; color:#6b7280; }
  .page-size select{ height:30px; border-radius:8px; border:1px solid #e5e7eb; padding:0 8px; }
  .filters{ background:#fff; border:1px solid #e5e7eb; border-radius:12px; padding:12px 14px; margin:14px 0 18px; }
  .col-picker{ position:relative; }
  .col-picker .menu{ position:absolute; right:0; top:calc(100% + 6px); width:280px; max-height:340px; overflow:auto; background:#fff; border:1px solid #e5e7eb; border-radius:10px; box-shadow:0 12px 24px rgba(0,0,0,0.12); padding:8px; z-index:1000; }
  .col-picker .menu-head{ display:flex; align-items:center; gap:8px; margin-bottom:6px; }
  .col-picker .menu-head .spacer{ flex:1; }
  .col-picker .mini{ height:24px; padding:0 8px; border-radius:6px; border:1px solid #e5e7eb; background:#fff; font-size:11px; cursor:pointer; }
  .col-picker .menu-list{ display:flex; flex-direction:column; gap:0; }
  .col-picker .menu-item{ display:flex; align-items:center; gap:8px; font-size:12px; padding:2px 8px; margin:2px 0; border-radius:6px; border:1px solid transparent; background:#fff; }
  .col-picker .menu-list.cdk-drop-list-dragging .menu-item{ transition: transform .18s ease; }
  .col-picker .menu-item.cdk-drag-preview{ box-shadow:0 10px 24px rgba(0,0,0,0.18); border-color:#93c5fd; background:#f8fbff; transform:rotate(1deg); pointer-events:none; }
  .col-picker .menu-item.cdk-drag-placeholder{ opacity:0; }
  .filters-sticky{ position:sticky; top:52px; z-index:15; background:#fff; }
  .grid{ display:grid; grid-template-columns:64px 1fr 52px 120px; gap:8px; align-items:center; }
  .grid input, select{ height:30px; padding:4px 6px; border:1px solid #e5e7eb; border-radius:8px; font-size:12px; }
  .chip{ display:inline-block; padding:4px 10px; background:#f3f4f6; border:1px solid #e5e7eb; border-radius:24px; color:#374151; text-align:center; }
  .table{ flex:1; min-height:0; display:flex; flex-direction:column; }
  .table-wrap{ flex:1; overflow:auto; border:1px solid #eef2f7; border-radius:8px; position:relative; margin-top:6px; }
  table{ width:100%; border-collapse:collapse; background:#fff; }
  table.wide{ width:max-content; table-layout:fixed; }
  table.compact th, table.compact td{ padding:6px 8px; line-height:1.2; }
  thead th{ position:sticky; top:0; z-index:10; background:#f8fafc; }
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
export class MaterialListComponent implements OnInit {
  rows = signal<MaterialRow[]>([]);
  loading = false; page = 1; pageSize = 15; total = 0; pages = 1;
  keyword = ''; keywordOp: 'AND' | 'OR' = 'AND';
  @ViewChild('tableWrap') tableWrapRef!: ElementRef<HTMLDivElement>;
  private autoScrollInterval: any = null; private dragStartIndex: number | null = null;
  columns: string[] = []; allColumns: string[] = []; extraCols: string[] = [];
  private readonly baseColumns = [ 'material_status', 'material_name', 'spec' ];
  private readonly storageKey = 'material.columns.v1';
  private readonly stateKey = 'material.list.state.v1';
  private firstInit = false;
  private colLabelMap = new Map<string,string>();
  private mappedColumns: string[] = [];
  private readonly fallbackLabels: Record<string,string> = {
    material_status:'자재상태', item_asset_class:'품목자산분류', material_sub_class:'자재소분류', created_on_erp:'등록일', created_by_erp:'등록자',
    modified_on_erp:'최종수정일', modified_by_erp:'최종수정자', is_lot_managed:'Lot 관리', material_large_class:'자재대분류', managing_department:'관리부서',
    material_number:'자재번호', material_internal_code:'자재내부코드', material_name:'자재명', spec:'규격', standard_unit:'기준단위',
    domestic_foreign_class:'내외자구분', importance:'중요도', manager:'관리자', manufacturer:'제조사', material_middle_class:'자재중분류',
    english_name:'영문명', shipping_class:'출고구분', representative_material:'대표자재', is_bom_registered:'BOM등록',
    material_required_for_process_by_product:'제품별공정소요자재', is_serial_managed:'Serial 관리', is_unit_price_registered:'단가등록여부',
    expiration_date_class:'유통기한구분', distribution_period:'유통기간', item_description:'품목설명', default_supplier:'기본구매처',
    consignment_supplier:'수탁거래처', vat_class:'부가세구분', is_vat_included_in_sales_price:'판매단가에 부가세포함여부', attachment_file:'첨부파일',
    material_detail_class:'자재세부분류', search_keyword:'검색어(이명(異名))', specification:'사양', material_notes:'자재특이사항', cas_no:'CAS NO',
    moq:'MOQ', packaging_unit:'포장단위', country_of_manufacture:'Country of Manufacture', source_of_origin_method:'Source of Origin(Method)',
    plant_part:'Plant Part', country_of_origin:'Country of Origin', nmpa_registration_number:'중국원료신고번호(NMPA)', allergen_ingredient:'알러젠성분',
    furocoumarines:'Furocoumarines', efficacy:'효능', patent:'특허', paper:'논문', clinical_trial:'임상', use_by_date:'사용기한',
    storage_location:'보관장소', storage_method:'보관방법', safety_and_precautions:'안정성 및 유의사항', note_on_storage:'Note on storage',
    safety_and_handling:'Safety & Handling', notice_coa3_english:'NOTICE (COA3 영문)', notice_coa3_korean:'NOTICE (COA3 국문)'
  };
  private colWidths: Record<string, number | undefined> = {}; private resizing: { col: string; startX: number; startW: number } | null = null;
  hoverId: string | null = null; selectedId: string | null = null; showColMenu = false; private hiddenCols = new Set<string>();
  @ViewChild('menuEl') menuElRef!: ElementRef<HTMLDivElement>; @ViewChild('menuList') menuListRef!: ElementRef<HTMLDivElement>;
  private menuAutoScrollInterval: any = null;

  constructor(private erpData: ErpDataService, private router: Router, private tabBus: TabService) {}
  ngOnInit(){
    const saved = this.loadSavedLayout();
    this.columns = saved.order.length ? saved.order.slice() : this.baseColumns.slice();
    this.colWidths = saved.widths || {};
    this.hiddenCols = new Set(saved.hidden || []);
    this.firstInit = (saved.order.length === 0 && (!saved.hidden || saved.hidden.length === 0));
    const st = this.loadState();
    if (st){ this.keyword = st.keyword ?? this.keyword; this.page = st.page ?? this.page; this.pageSize = st.pageSize ?? this.pageSize; this._pendingScroll = st.scroll || null; }
    this.load();
    this.loadColumnLabels();
  }

  async load(){
    this.loading = true;
    const { data, count } = await this.erpData.listMaterials({ page: this.page, pageSize: this.pageSize, keyword: this.keyword, keywordOp: this.keywordOp }) as any;
    const rows = (data as MaterialRow[]) || [];
    const baseSet = new Set(['id', ...this.baseColumns]);
    // Collect columns from current page rows
    const rowCols = rows.reduce<string[]>((acc, r) => { Object.keys(r || {}).forEach(k => { if(!acc.includes(k)) acc.push(k); }); return acc; }, []);
    // Also include mapped columns from material_column_map so users can turn them on even when no data is present yet
    const unionCols = Array.from(new Set<string>([...rowCols, ...this.mappedColumns]));
    this.extraCols = unionCols.filter(c => !baseSet.has(c));
    const desired = [...this.baseColumns, ...this.extraCols];
    this.columns = this.mergeOrder(this.columns, desired);
    this.allColumns = desired.slice();
    if (this.firstInit && this.hiddenCols.size === 0) {
      for (const c of this.extraCols) { this.hiddenCols.add(c); }
      for (const c of this.columns) { if (!this.baseColumns.includes(c) && !this.extraCols.includes(c)) { this.hiddenCols.add(c); } }
      this.saveLayout(); this.firstInit = false;
    }
    this.rows.set(rows);
    this.total = count || 0; this.pages = Math.max(1, Math.ceil(this.total / this.pageSize)); this.loading = false;
    setTimeout(()=>{ if (this._pendingScroll){ const wrap=this.tableWrapRef?.nativeElement; if(wrap){ wrap.scrollLeft=this._pendingScroll.left||0; wrap.scrollTop=this._pendingScroll.top||0; } this._pendingScroll=null; } },0);
    this.saveState();
  }
  go(p:number){ this.page = Math.min(Math.max(1,p), this.pages); this.saveState(); this.load(); }
  onPageSize(ps:number){ this.pageSize = Number(ps)||15; this.page=1; this.saveState(); this.load(); }
  reset(){ this.keyword=''; this.keywordOp='AND'; this.page=1; this.pageSize=15; this.saveState(); this.load(); }
  onKeywordChange(value:string){ this.keyword = value || ''; this.page = 1; if (/\s$/.test(this.keyword)) { return; } this.saveState(); this.debouncedLoad(); }
  onEscClear(){ this.keyword=''; this.page=1; this.saveState(); this.load(); }
  toggleSelect(id:string){ this.selectedId = this.selectedId===id? null: id; }
  openEdit(id?:string){ const t=id||this.selectedId; if(!t) return; this.saveState(); const navUrl=`/app/material/form?id=${encodeURIComponent(t)}`; this.tabBus.requestOpen('자재등록','/app/material/form',navUrl); }
  onAdd(){ this.saveState(); this.tabBus.requestOpen('자재등록','/app/material/form','/app/material/form'); }
  onWheel(ev: WheelEvent){ if (ev.shiftKey) { const wrap = ev.currentTarget as HTMLElement; wrap.scrollLeft += (ev.deltaY || ev.deltaX); ev.preventDefault(); } }

  onDragMove(event: CdkDragMove){ const wrap=this.tableWrapRef?.nativeElement; if(!wrap) return; const rect=wrap.getBoundingClientRect(); const x=event.pointerPosition.x; const edge=40; const speed=20; let dx=0; if(x<rect.left+edge) dx=-speed; else if(x>rect.right-edge) dx=speed; if(dx!==0){ if(!this.autoScrollInterval){ this.autoScrollInterval=setInterval(()=>{ wrap.scrollLeft += dx; },16); } } else { this.onDragEnd(); } }
  onDragEnd(){ if(this.autoScrollInterval){ clearInterval(this.autoScrollInterval); this.autoScrollInterval=null; } }
  onHeaderEnter(index:number){ this.dragStartIndex = this.dragStartIndex ?? index; }
  headerLabel(col:string){ const fallback=this.fallbackLabels[col]; const mapped=this.colLabelMap.get(col); if (fallback) return fallback; return (mapped && mapped.trim()) || col; }
  visibleColumns(){ return this.columns.filter(c => !this.hiddenCols.has(c)); }
  isVisible(c:string){ return !this.hiddenCols.has(c); }
  setVisible(c:string, checked:boolean){ if(checked) this.hiddenCols.delete(c); else this.hiddenCols.add(c); this.saveLayout(); }
  toggleColMenu(){ this.showColMenu = !this.showColMenu; } selectAllCols(){ this.hiddenCols.clear(); this.saveLayout(); } clearAllCols(){ this.hiddenCols = new Set(this.allColumns); this.saveLayout(); }
  orderedMenuColumns(){ const order=this.columns.slice(); const set=new Set(order); for(const c of this.allColumns){ if(!set.has(c)) order.push(c); } return order.filter(c=>this.allColumns.includes(c)); }
  onReorderMenu(e:CdkDragDrop<string[]>) { const ordered=this.orderedMenuColumns(); const moved=ordered[e.previousIndex]; const target=ordered[e.currentIndex]; const from=this.columns.indexOf(moved); const to=this.columns.indexOf(target); if(from>=0&&to>=0&&from!==to){ moveItemInArray(this.columns, from, to); this.saveLayout(); } }
  onMenuDragMove(event: CdkDragMove){ const container=this.menuElRef?.nativeElement||this.menuListRef?.nativeElement; if(!container) return; const rect=container.getBoundingClientRect(); const y=event.pointerPosition.y; const edge=30; const speed=12; let dy=0; if(y<rect.top+edge) dy=-speed; else if(y>rect.bottom-edge) dy=speed; if(dy!==0){ if(!this.menuAutoScrollInterval){ this.menuAutoScrollInterval=setInterval(()=>{ container.scrollTop += dy; },16); } } else { this.onMenuDragEnd(); } }
  onMenuWheel(ev: WheelEvent){ const container=this.menuElRef?.nativeElement||this.menuListRef?.nativeElement; if(!container) return; container.scrollTop += (ev.deltaY || ev.deltaX); ev.preventDefault(); }
  onMenuDragEnd(){ if(this.menuAutoScrollInterval){ clearInterval(this.menuAutoScrollInterval); this.menuAutoScrollInterval=null; } }

  @HostListener('document:keydown.escape', ['$event']) onEscCloseMenu(ev:any){ if(this.showColMenu){ this.showColMenu=false; ev.preventDefault?.(); } }
  onReorder(e:CdkDragDrop<string[]>) { const vis=this.visibleColumns(); const prevIndex=typeof e.previousIndex==='number'? e.previousIndex : (this.dragStartIndex ?? 0); const currIndex=typeof e.currentIndex==='number'? e.currentIndex : prevIndex; const moved=vis[prevIndex]; const target=vis[currIndex]; const from=this.columns.indexOf(moved); const to=this.columns.indexOf(target); if(from>=0&&to>=0&&from!==to){ moveItemInArray(this.columns, from, to); this.saveLayout(); } this.dragStartIndex=null; }
  onDragStart(i:number){ this.dragStartIndex=i; }
  getColStyle(col:string){ const w=this.colWidths[col]; return w? { width:w+'px', maxWidth:w+'px' } : {}; }
  startResize(ev:MouseEvent, col:string){ ev.preventDefault(); ev.stopPropagation(); const th=(ev.currentTarget as HTMLElement).closest('th') as HTMLElement|null; const startW=th? th.getBoundingClientRect().width: (this.colWidths[col]||120); this.resizing={col,startX:ev.clientX,startW}; const move=(e:MouseEvent)=>{ if(!this.resizing) return; const dx=e.clientX-this.resizing.startX; this.colWidths[this.resizing.col]=Math.max(10, Math.min(2000, Math.round(this.resizing.startW+dx))); }; const up=()=>{ document.removeEventListener('mousemove',move); document.removeEventListener('mouseup',up); if(this.resizing){ this.saveLayout(); } this.resizing=null; }; document.addEventListener('mousemove',move); document.addEventListener('mouseup',up); }
  private mergeOrder(saved:string[], desired:string[]){ const set=new Set(desired); const kept=saved.filter(c=>set.has(c)); for(const c of desired){ if(!kept.includes(c)) kept.push(c); } return kept; }
  private saveLayout(){ const payload={ order:this.columns, widths:this.colWidths, hidden:Array.from(this.hiddenCols)}; try{ localStorage.setItem(this.storageKey, JSON.stringify(payload)); }catch{} }
  private loadSavedLayout(){ try{ const raw=localStorage.getItem(this.storageKey); if(!raw) return { order:[],widths:{},hidden:[] }; const d=JSON.parse(raw); return { order:Array.isArray(d.order)? d.order:[], widths:d.widths||{}, hidden:Array.isArray(d.hidden)? d.hidden:[] }; }catch{ return { order:[],widths:{},hidden:[] }; }
  }
  private _pendingScroll: { left:number; top:number } | null = null;
  private saveState(){ try{ const wrap=this.tableWrapRef?.nativeElement; const state={ keyword:this.keyword, page:this.page, pageSize:this.pageSize, scroll:{ left:wrap?.scrollLeft||0, top:wrap?.scrollTop||0 } }; sessionStorage.setItem(this.stateKey, JSON.stringify(state)); }catch{} }
  private loadState(){ try{ const raw=sessionStorage.getItem(this.stateKey); if(!raw) return null; return JSON.parse(raw); }catch{ return null; } }
  private debounceTimer:any=null; private debouncedLoad(delayMs:number=300){ if(this.debounceTimer) clearTimeout(this.debounceTimer); this.debounceTimer=setTimeout(()=>this.load(), delayMs); }

  private async loadColumnLabels(){
    try{
      const rows = await this.erpData.getMaterialColumnMap();
      this.colLabelMap.clear();
      const cols: string[] = [];
      for(const r of rows){
        const key=r?.db_column as string; const label=(r?.sheet_label_kr||'') as string;
        if (key){ cols.push(key); }
        if(key && label && label.trim() && label.trim()!==key){ this.colLabelMap.set(key, label.trim()); }
      }
      this.mappedColumns = Array.from(new Set(cols));
    }catch{}
  }
}


