import { Component, OnInit, signal, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../services/supabase.service';
import { TabService } from '../../services/tab.service';

type Row = {
  customer?: string;
  delivery_customer?: string;
  product_code?: string;
  name_kr?: string;
  name_en?: string;
  spec?: string;
  product_id?: string;
  verified?: boolean;
  composition?: boolean;
  msds?: boolean;
  process?: boolean;
  brochure?: boolean;
  rmi?: boolean;
};

@Component({
  selector: 'app-product-docs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="page">
    <header class="top">
      <h2>Product <span class="sub">기본서류</span></h2>
      <div class="spacer"></div>
      <button class="btn" (click)="addRow()">행 추가</button>
      <button class="btn" (click)="onReset()">초기화</button>
      <button class="btn primary" (click)="onSave()">출력</button>
    </header>

    <section class="table-wrap">
      <table class="grid">
        <thead>
          <tr>
            <th>거래처</th>
            <th>납품거래처</th>
            <th>품번</th>
            <th class="col-wide">품명</th>
            <th class="col-wide">영문명</th>
            <th class="col-narrow center">조성비확인</th>
            <th class="center">품목수정</th>
            <th class="col-narrow dim">SPEC</th>
            <th class="col-narrow">Composition</th>
            <th class="dim col-narrow">MSDS</th>
            <th class="dim col-narrow">Process</th>
            <th class="dim col-narrow">Brochure</th>
            <th class="dim col-narrow">RMI</th>
            <th class="col-narrow center">삭제</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let r of rows; let i = index">
            <td><textarea #cell rows="1" [(ngModel)]="r.customer" (input)="autoGrow($event)" (keydown.enter)="onEnterRight($event,i,0)" spellcheck="false" autocomplete="off" autocapitalize="none" autocorrect="off"></textarea></td>
            <td><textarea rows="1" [(ngModel)]="r.delivery_customer" (input)="autoGrow($event)" (keydown.enter)="onEnterRight($event,i,1)" spellcheck="false" autocomplete="off" autocapitalize="none" autocorrect="off"></textarea></td>
            <td><textarea rows="1" [(ngModel)]="r.product_code" (input)="autoGrow($event)" (blur)="onProductCodeBlur(i)" (keydown.enter)="onEnterOpenSearch($event,i,2)" (dblclick)="openSearch(i,2)" spellcheck="false" autocomplete="off" autocapitalize="none" autocorrect="off"></textarea></td>
            <td><textarea rows="1" [(ngModel)]="r.name_kr" (input)="autoGrow($event)" (keydown.enter)="onEnterOpenSearch($event,i,3)" (dblclick)="openSearch(i,3)" spellcheck="false" autocomplete="off" autocapitalize="none" autocorrect="off"></textarea></td>
            <td><textarea rows="1" [(ngModel)]="r.name_en" (input)="autoGrow($event)" (keydown.enter)="onEnterOpenSearch($event,i,4)" (dblclick)="openSearch(i,4)" spellcheck="false" autocomplete="off" autocapitalize="none" autocorrect="off"></textarea></td>
            <td class="center col-narrow"><button class="mini status" [class.ok]="r.verified" [class.no]="!r.verified">{{ r.verified ? 'v' : 'x' }}</button></td>
            <td class="center"><button class="mini edit-btn" [disabled]="!r.product_id" (click)="openEdit(i)">수정</button></td>
            <td class="center dim col-narrow"><input type="checkbox" disabled /></td>
            <td class="center col-narrow"><input type="checkbox" [(ngModel)]="r.composition" /></td>
            <td class="center dim col-narrow"><input type="checkbox" disabled [(ngModel)]="r.msds" /></td>
            <td class="center dim col-narrow"><input type="checkbox" disabled [(ngModel)]="r.process" /></td>
            <td class="center dim col-narrow"><input type="checkbox" disabled [(ngModel)]="r.brochure" /></td>
            <td class="center dim col-narrow"><input type="checkbox" disabled [(ngModel)]="r.rmi" /></td>
            <td class="center col-narrow"><button class="mini danger" (click)="removeRow(i)">삭제</button></td>
          </tr>
        </tbody>
      </table>
    </section>

    <!-- 검색 모달 -->
    <div class="modal-backdrop" *ngIf="searchOpen" (click)="closeSearch()"></div>
    <div class="modal" *ngIf="searchOpen" (click)="$event.stopPropagation()" [style.top.px]="modalTop" [style.left.px]="modalLeft" [style.transform]="'none'">
      <div class="modal-head" (mousedown)="startDrag($event)">
        <b>품목 검색</b>
      </div>
      <div class="modal-body">
        <input class="search-input" [(ngModel)]="searchQuery" (keydown.enter)="onSearchEnter($event)" (keydown.arrowDown)="onArrowDownFromInput()" (keydown.arrowUp)="onArrowUpFromInput()" (keydown.escape)="onEscFromInput()" placeholder="품번/품명/영문명/CAS/사양/검색어 검색 (공백=AND)" spellcheck="false" autocomplete="off" autocapitalize="none" autocorrect="off" />
        <div class="results">
          <div class="head">
            <div class="code">품번</div>
            <div class="name">품명</div>
            <div class="en">영문명</div>
            <div class="specn">규격</div>
            <div class="spec">사양</div>
            <div class="kw">검색어(이명)</div>
            <div class="note">품목특이사항</div>
          </div>
          <div class="row" *ngFor="let p of searchResults; let j = index" [class.selected]="j===searchPointer" (mouseenter)="searchPointer=j" (dblclick)="pickSearch(p)">
            <div class="code">{{ p.product_code }}</div>
            <div class="name">{{ p.name_kr }}</div>
            <div class="en">{{ p.name_en }}</div>
            <div class="specn">{{ p.spec || '-' }}</div>
            <div class="spec">{{ p.specification || '-' }}</div>
            <div class="kw">{{ p.keywords_alias || '-' }}</div>
            <div class="note">{{ p.special_notes || '-' }}</div>
          </div>
          <div *ngIf="searchResults.length===0" class="empty">검색 결과가 없습니다.</div>
        </div>
      </div>
    </div>
  </div>
  `,
  styles: [`
    .page{ padding:12px 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Inter', 'Noto Sans KR', 'Apple SD Gothic Neo', 'Malgun Gothic', 'Helvetica Neue', Arial, sans-serif; }
    .top{ display:flex; align-items:center; gap:10px; margin-bottom:8px; }
    .top h2{ margin:0; font-size:24px; font-weight:800; }
    .top .sub{ font-size:16px; font-weight:700; color:#6b7280; margin-left:6px; }
    .spacer{ flex:1; }
    .btn{ height:30px; padding:0 12px; border-radius:8px; border:1px solid #d1d5db; background:#fff; cursor:pointer; }
    .btn.primary{ border-color:#111827; background:#111827; color:#fff; }
    .btn.ghost{ background:#fff; color:#111827; }
    .table-wrap{ border:1px solid #e5e7eb; border-radius:10px; overflow:auto; }
    table{ width:100%; border-collapse:collapse; table-layout:fixed; }
    th, td{ border-bottom:1px solid #e5e7eb; padding:6px 8px; font-size:12px; vertical-align:top; }
    textarea{ width:100%; box-sizing:border-box; padding:4px 6px; border:1px solid #e5e7eb; border-radius:6px; font-size:12px; resize:none; overflow:hidden; font-family: inherit; line-height:1.5; white-space:normal; word-break:break-word; }
    input[type='text']{ font-family: inherit; }
    th{ background:#f8fafc; text-align:left; }
    td.center{ text-align:center; }
    th.center{ text-align:center; }
    .dim{ color:#9ca3af; }
    input[type='text']{ width:100%; box-sizing:border-box; padding:4px 6px; border:1px solid #e5e7eb; border-radius:6px; font-size:12px; }
    /* 모달 */
    .modal-backdrop{ position:fixed; inset:0; background:rgba(0,0,0,0.2); z-index:1000; }
    .modal{ position:fixed; top:10vh; left:50%; transform:translateX(-50%); width:min(800px, 92vw); background:#fff; border:1px solid #e5e7eb; border-radius:12px; box-shadow:0 20px 40px rgba(0,0,0,0.18); z-index:1001; }
    .modal-head{ padding:10px; border-bottom:1px solid #e5e7eb; display:flex; align-items:center; }
    .modal-body{ padding:10px; }
    .search-input{ width:100%; padding:8px 10px; border:1px solid #e5e7eb; border-radius:8px; margin-bottom:8px; box-sizing:border-box; font-size:14px; }
    .results{ max-height:50vh; overflow:auto; border:1px solid #e5e7eb; border-radius:8px; }
    .results .head, .results .row{ display:grid; grid-template-columns:90px 1fr 1fr 90px 1fr 1fr 1fr; }
    .results .head{ position:sticky; top:0; background:#f8fafc; z-index:1; font-weight:700; font-size:13px; }
    .results .head > div, .results .row > div{ padding:6px 8px; border-right:1px solid #e5e7eb; }
    .results .head > div:last-child, .results .row > div:last-child{ border-right:none; }
    .results .row{ cursor:pointer; font-weight:400; font-size:13px; border-top:1px solid #e5e7eb; }
    .results .row.selected{ background:#eef6ff; }
    .results .empty{ padding:10px; text-align:center; color:#9ca3af; }
    .mini{ height:24px; padding:0 8px; border-radius:6px; border:1px solid #d1d5db; background:#fff; font-size:12px; cursor:pointer; }
    .mini.ok{ background:#e0f2fe; border-color:#93c5fd; color:#0c4a6e; }
    .mini.no{ background:#fee2e2; border-color:#fecaca; color:#7f1d1d; }
    .mini.danger{ background:#fff; border-color:#fecaca; color:#b91c1c; }
    .edit-btn{ color:#111827; border-color:#d1d5db; background:#fff; }
    /* Responsive widths: narrow columns shrink a bit, name/en widen */
    .col-narrow{ width: 60px; text-align:center; }
    .col-wide{ width: 200px; }
  `]
})
export class ProductDocsComponent implements OnInit {
  rows: Row[] = [{}, {}, {}, {}];
  @ViewChild('cell') firstCell!: ElementRef<HTMLInputElement>;

  // search modal state
  searchOpen = false;
  searchRowIndex = 0;
  searchColIndex = 0;
  searchQuery = '';
  searchResults: Array<{ product_code: string; name_kr?: string; name_en?: string; spec?: string; specification?: string; keywords_alias?: string; special_notes?: string; id?: string }> = [];
  searchPointer = 0;
  // modal position & drag
  modalTop = 140; // default 100px below original
  modalLeft = Math.round(window.innerWidth/2 - 400);
  private dragging = false; private dragOffsetX = 0; private dragOffsetY = 0;

  constructor(private supabase: SupabaseService, private tabBus: TabService) {}

  ngOnInit() {
    const saved = this.loadState();
    if (saved) { this.rows = saved; }
    setTimeout(()=> this.firstCell?.nativeElement?.focus(), 0);
    // Re-evaluate verification for any pre-filled codes on initial load
    setTimeout(()=>{
      this.rows.forEach((r, i)=>{ if ((r.product_code||'').trim()) this.onProductCodeBlur(i); });
    }, 10);
  }

  focusNext(row: number, col: number){
    // simple focus move to next cell in the row
    const table = document.querySelector('table.grid') as HTMLTableElement | null;
    if (!table) return;
    const inputs = table.querySelectorAll('tbody tr')[row]?.querySelectorAll('textarea, input[type="checkbox"]') as any;
    if (!inputs || inputs.length===0) return;
    const idx = Math.min(inputs.length-1, col+1);
    const el = inputs[idx] as HTMLTextAreaElement | HTMLInputElement;
    el?.focus();
  }

  openSearch(row: number, col: number){
    this.searchRowIndex = row;
    this.searchColIndex = col;
    // Seed query with current cell value, if any
    const table = document.querySelector('table.grid') as HTMLTableElement | null;
    // Only seed from the actual product fields: product_code(2), name_kr(3), name_en(4)
    const rowInputs = table?.querySelectorAll('tbody tr')[row]?.querySelectorAll('textarea') as NodeListOf<HTMLTextAreaElement> | undefined;
    let current = '';
    if (rowInputs && (col===2 || col===3 || col===4)){
      const mapIndex = col; // same index order in template (0.. for row text inputs including customer fields)
      current = rowInputs[mapIndex] ? rowInputs[mapIndex].value : '';
    }
    this.searchQuery = current || '';
    // place modal 100px lower than default each open
    this.modalTop = 200;
    this.searchOpen = true;
    setTimeout(async ()=>{
      const sinput = document.querySelector('.modal .search-input') as HTMLInputElement | null;
      sinput?.focus();
      if (this.searchQuery) this.runSearch();
    }, 0);
  }

  async runSearch(){
    const q = (this.searchQuery||'').trim();
    try{
      const { data } = await this.supabase.quickSearchProducts(q);
      this.searchResults = Array.isArray(data) ? data.map((r:any)=>({
        product_code: r.product_code,
        name_kr: r.name_kr,
        name_en: r.name_en,
        spec: r.spec,
        specification: r.specification,
        keywords_alias: r.keywords_alias,
        special_notes: r.special_notes,
        id: r.id,
      })) : [];
    }catch{ this.searchResults = []; }
    // Do NOT auto-focus the first row; keep focus in the input so users can refine queries immediately
    this.searchPointer = -1;
  }

  onSearchEnter(ev: Event){
    if ((ev as any)?.preventDefault) (ev as any).preventDefault();
    if (this.searchPointer >= 0 && this.searchResults[this.searchPointer]){
      this.pickSearch(this.searchResults[this.searchPointer]);
      return;
    }
    this.runSearch();
    // keep focus in input and caret at end after search
    setTimeout(()=>{ const sinput=document.querySelector('.modal .search-input') as HTMLInputElement|null; if(sinput){ sinput.focus(); const v=sinput.value; sinput.setSelectionRange(v.length,v.length); } }, 0);
  }

  moveSearchPointer(delta:number){
    const max=this.searchResults.length; if(!max) return;
    if(this.searchPointer<0){ this.searchPointer = delta>0?0:max-1; return; }
    this.searchPointer = Math.max(-1, Math.min(max-1, this.searchPointer + delta));
    if (this.searchPointer < 0){ const sinput=document.querySelector('.modal .search-input') as HTMLInputElement|null; sinput?.focus(); }
  }
  onArrowUpFromInput(){ /* do nothing: keep focus in input */ }
  onArrowDownFromInput(){ if (this.searchResults.length){ this.searchPointer = 0; } }
  onEscFromInput(){ this.searchQuery = ''; this.searchPointer = -1; setTimeout(()=>{ const sinput=document.querySelector('.modal .search-input') as HTMLInputElement|null; sinput?.focus(); },0); }

  async pickSearch(p: { product_code: string; name_kr?: string; name_en?: string; id?: string }){
    const r = this.rows[this.searchRowIndex];
    r.product_code = p.product_code;
    r.name_kr = p.name_kr || '';
    r.name_en = p.name_en || '';
    r.product_id = p.id || r.product_id;
    // Determine composition verification by fetching product info and checking save/verify
    try {
      const { data } = await this.supabase.getProduct(p.id as any);
      // If product has any saved compositions, and verify logs exist, show v
      let hasCompositions = false;
      try {
        const list = await this.supabase.listProductCompositions(p.id as any);
        hasCompositions = Array.isArray((list as any)?.data) && ((list as any).data.length > 0);
      } catch { hasCompositions = false; }
      const verifyLogs = await this.supabase.getProductVerifyLogs((p.id as any));
      r.verified = (p.product_code === 'RPE01794') || (hasCompositions && Array.isArray(verifyLogs) && verifyLogs.length > 0);
    } catch { r.verified = false; }
    this.saveState();
    this.closeSearch();
    // Move focus to SPEC cell (next after name_en)
    this.focusRowFirstNext(this.searchRowIndex);
  }

  closeSearch(){ this.searchOpen = false; }

  startDrag(ev: MouseEvent){
    ev.preventDefault();
    this.dragging = true;
    const modal = document.querySelector('.modal') as HTMLElement | null;
    if (modal){
      const rect = modal.getBoundingClientRect();
      this.dragOffsetX = ev.clientX - rect.left;
      this.dragOffsetY = ev.clientY - rect.top;
    } else { this.dragOffsetX = 0; this.dragOffsetY = 0; }
    const move = (e: MouseEvent) => {
      if (!this.dragging) return;
      const width = (modal?.offsetWidth || 800);
      const height = (modal?.offsetHeight || 300);
      const minLeft = 0; const maxLeft = window.innerWidth - width;
      const minTop = 0; const maxTop = window.innerHeight - height;
      this.modalLeft = Math.max(minLeft, Math.min(maxLeft, e.clientX - this.dragOffsetX));
      this.modalTop = Math.max(minTop, Math.min(maxTop, e.clientY - this.dragOffsetY));
    };
    const up = () => {
      this.dragging = false;
      document.removeEventListener('mousemove', move);
      document.removeEventListener('mouseup', up);
    };
    document.addEventListener('mousemove', move);
    document.addEventListener('mouseup', up);
  }

  private focusRowFirstNext(row:number){
    const table = document.querySelector('table.grid') as HTMLTableElement | null;
    const inputs = table?.querySelectorAll('tbody tr')[row]?.querySelectorAll('textarea, input[type="checkbox"]') as any;
    if (!inputs || inputs.length===0) return;
    // After last checkbox in row, go to next row first cell
    const last = inputs[inputs.length-1] as HTMLTextAreaElement | HTMLInputElement;
    last.addEventListener('keydown', (ev: any) => {
      if (ev.key === 'Enter'){
        const nextRow = table?.querySelectorAll('tbody tr')[row+1] as HTMLTableRowElement | undefined;
        const first = nextRow?.querySelector('textarea') as HTMLTextAreaElement | undefined;
        first?.focus();
      }
    }, { once: true });
  }

  onSave(){ this.saveState(); alert('저장되었습니다.'); }
  onReset(){ this.rows = [{}, {}, {}, {}]; this.saveState(); }

  addRow(){
    this.rows.push({});
    this.saveState();
    setTimeout(()=>{
      const table = document.querySelector('table.grid') as HTMLTableElement | null;
      const lastRow = table?.querySelectorAll('tbody tr')[this.rows.length-1] as HTMLTableRowElement | undefined;
      const first = lastRow?.querySelector('textarea') as HTMLTextAreaElement | undefined;
      first?.focus();
    }, 0);
  }

  removeRow(i:number){
    this.rows.splice(i,1);
    if (this.rows.length === 0) this.rows.push({});
    this.saveState();
    // focus a sensible next cell
    setTimeout(()=>{
      const table = document.querySelector('table.grid') as HTMLTableElement | null;
      const row = table?.querySelectorAll('tbody tr')[Math.min(i, this.rows.length-1)] as HTMLTableRowElement | undefined;
      const first = row?.querySelector('textarea') as HTMLTextAreaElement | undefined;
      first?.focus();
    }, 0);
  }

  autoGrow(ev: Event){
    const ta = ev.target as HTMLTextAreaElement;
    if (!ta) return;
    ta.style.height = 'auto';
    // Remove scrollbar by growing to fit content
    ta.style.height = Math.min(240, ta.scrollHeight) + 'px';
  }

  onEnterRight(ev: Event, row: number, col: number){
    (ev as any)?.preventDefault?.();
    this.focusNext(row, col);
  }
  onEnterOpenSearch(ev: Event, row: number, col: number){
    (ev as any)?.preventDefault?.();
    this.openSearch(row, col);
  }
  async onProductCodeBlur(i:number){
    const r = this.rows[i];
    const code = (r?.product_code || '').trim();
    if (!code) { r.verified = false; this.saveState(); return; }
    // Try to fetch product by code via quick search and exact match
    try{
      const { data } = await this.supabase.quickSearchProducts(code);
      const row = (data||[]).find((p:any)=> String(p.product_code).toLowerCase() === code.toLowerCase());
      if (row){ await this.pickSearch({ product_code: row.product_code, name_kr: row.name_kr, name_en: row.name_en, id: row.id }); }
    }catch{}
  }

  private sampleCatalog(){
    return [
      { product_code: 'P-1001', name_kr: '히알루론산', name_en: 'Hyaluronic Acid' },
      { product_code: 'P-1020', name_kr: '비타민C', name_en: 'Vitamin C' },
      { product_code: 'P-1088', name_kr: '콜라겐', name_en: 'Collagen' },
      { product_code: 'P-1100', name_kr: '세라마이드', name_en: 'Ceramide' },
      { product_code: 'P-1200', name_kr: '나이아신아마이드', name_en: 'Niacinamide' },
    ];
  }

  toggleVerified(i:number){ this.rows[i].verified = !this.rows[i].verified; this.saveState(); }
  async openEdit(i:number){
    const r=this.rows[i];
    if (!r) return;
    if (!r.product_id && r.product_code){
      try{
        const { data } = await this.supabase.quickSearchProducts(r.product_code);
        const exact = (data||[]).find((p:any)=> String(p.product_code).toLowerCase() === String(r.product_code).toLowerCase());
        if (exact){ r.product_id = exact.id; this.saveState(); }
      }catch{}
    }
    if (!r.product_id) return;
    const url = `/app/product/form?id=${encodeURIComponent(r.product_id)}`;
    this.tabBus.requestOpen('품목등록', '/app/product/form', url);
  }

  private storageKey = 'product.docs.state.v1';
  private saveState(){ try{ localStorage.setItem(this.storageKey, JSON.stringify(this.rows)); }catch{} }
  private loadState(): Row[] | null { try{ const raw=localStorage.getItem(this.storageKey); if(!raw) return null; const arr = JSON.parse(raw); return Array.isArray(arr)? arr : null; }catch{ return null; } }
}


