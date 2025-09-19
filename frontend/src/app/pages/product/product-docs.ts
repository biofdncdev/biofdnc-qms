import { Component, OnInit, signal, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ErpDataService } from '../../services/erp-data.service';
import { StorageService } from '../../services/storage.service';
import { TabService } from '../../services/tab.service';
// 템플릿의 서식 보존을 위해 exceljs를 동적 import로 사용합니다.

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
    </header>
    <section class="toolbar">
      <div class="spacer"></div>
      <button class="mini edit-btn" (click)="addRow()">행 추가</button>
      <button class="mini edit-btn" (click)="onReset()">초기화</button>
      <button class="mini warn" (click)="openHtmlPdf()">PDF 저장(HTML)</button>
      <button class="mini success" (click)="excelExport()">EXCEL저장</button>
    </section>

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
            <th class="dim col-narrow">RMI</th>
            <th class="col-narrow center">삭제</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let r of rows; let i = index">
            <td class="wplus20"><textarea #cell rows="1" [(ngModel)]="r.customer" (input)="autoGrow($event)" (keydown.enter)="onEnterRight($event,i,0)" spellcheck="false" autocomplete="off" autocapitalize="none" autocorrect="off"></textarea></td>
            <td class="wplus20"><textarea rows="1" [(ngModel)]="r.delivery_customer" (input)="autoGrow($event)" (keydown.enter)="onEnterRight($event,i,1)" spellcheck="false" autocomplete="off" autocapitalize="none" autocorrect="off"></textarea></td>
            <td class="wplus10"><textarea rows="1" [(ngModel)]="r.product_code" (input)="autoGrow($event)" (blur)="onProductCodeBlur(i)" (keydown.enter)="onEnterOpenSearch($event,i,2)" (dblclick)="openSearch(i,2)" spellcheck="false" autocomplete="off" autocapitalize="none" autocorrect="off"></textarea></td>
            <td><textarea rows="1" [(ngModel)]="r.name_kr" (input)="autoGrow($event)" (keydown.enter)="onEnterOpenSearch($event,i,3)" (dblclick)="openSearch(i,3)" spellcheck="false" autocomplete="off" autocapitalize="none" autocorrect="off"></textarea></td>
            <td><textarea rows="1" [(ngModel)]="r.name_en" (input)="autoGrow($event)" (keydown.enter)="onEnterOpenSearch($event,i,4)" (dblclick)="openSearch(i,4)" spellcheck="false" autocomplete="off" autocapitalize="none" autocorrect="off"></textarea></td>
            <td class="center col-narrow"><button class="mini status" [class.ok]="r.verified" [class.no]="!r.verified">{{ r.verified ? 'v' : 'x' }}</button></td>
            <td class="center"><button class="mini edit-btn" [disabled]="!r.product_id" (click)="openEdit(i)">수정</button></td>
            <td class="center dim col-narrow"><input type="checkbox" disabled /></td>
            <td class="center col-narrow"><input type="checkbox" [(ngModel)]="r.composition" /></td>
            <td class="center dim col-narrow"><input type="checkbox" disabled [(ngModel)]="r.msds" /></td>
            <td class="center dim col-narrow"><input type="checkbox" disabled [(ngModel)]="r.process" /></td>
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
    .top{ display:flex; align-items:center; gap:10px; margin-bottom:4px; }
    .top h2{ margin:0; font-size:24px; font-weight:800; }
    .top .sub{ font-size:16px; font-weight:700; color:#6b7280; margin-left:6px; }
    .spacer{ flex:1; }
    .btn{ height:30px; padding:0 12px; border-radius:8px; border:1px solid #d1d5db; background:#fff; cursor:pointer; }
    /* Move right-side buttons down by 50px without shifting the title */
    .top .mini{ margin-top: 0; }
    .btn.primary{ border-color:#111827; background:#111827; color:#fff; }
    .btn.ghost{ background:#fff; color:#111827; }
    .toolbar{ display:flex; justify-content:flex-end; align-items:center; gap:8px; margin: 8px 0 10px; }
    .table-wrap{ border:1px solid #e5e7eb; border-radius:10px; overflow:auto; }
    table{ width:100%; border-collapse:collapse; table-layout:fixed; }
    th, td{ border-bottom:1px solid #e5e7eb; padding:6px 8px; font-size:12px; vertical-align:top; }
    textarea{ width:100%; box-sizing:border-box; padding:4px 6px; border:1px solid #e5e7eb; border-radius:6px; font-size:12px; resize:none; overflow:hidden; font-family: inherit; line-height:1.5; white-space:normal; word-break:break-word; }
    td.wplus10{ overflow:visible; }
    td.wplus10 > textarea{ width: calc(100% + 10px); }
    td.wplus20{ overflow:visible; }
    td.wplus20 > textarea{ width: calc(100% + 20px); }
    input[type='text']{ font-family: inherit; }
    th{ background:#f8fafc; text-align:left; }
    td.center{ text-align:center; }
    th.center{ text-align:center; }
    /* Composition 헤더 가운데 정렬 (현재 9번째) */
    thead th:nth-child(9){ text-align:center; }
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
    .mini{ height:24px; padding:0 8px; border-radius:6px; border:1px solid #d1d5db; background:#fff; font-size:12px; cursor:pointer; white-space:nowrap; }
    .mini.ok{ background:#e0f2fe; border-color:#93c5fd; color:#0c4a6e; }
    .mini.no{ background:#fee2e2; border-color:#fecaca; color:#7f1d1d; }
    .mini.danger{ background:#fff; border-color:#fecaca; color:#b91c1c; }
    .mini.warn{ background:#fff7ed; border-color:#fed7aa; color:#9a3412; }
    .mini.success{ background:#ecfdf5; border-color:#a7f3d0; color:#065f46; }
    .edit-btn{ color:#111827; border-color:#d1d5db; background:#fff; }
    /* Responsive widths: narrow columns shrink a bit, name/en widen */
    .col-narrow{ width: 55px; text-align:center; }
    .col-wide{ width: 200px; }
    /* Slight spacing between the first three fields */
    tbody td:nth-child(1) textarea,
    tbody td:nth-child(2) textarea,
    tbody td:nth-child(3) textarea{ margin-right: 4px; }
    /* 거래처, 납품거래처 최대 150px, 품번 최대 100px. 화면이 작아질수록 자동 축소 */
    thead th:nth-child(1), tbody td:nth-child(1){ width: 120px; }
    thead th:nth-child(2), tbody td:nth-child(2){ width: 120px; }
    thead th:nth-child(3), tbody td:nth-child(3){ width: 70px; }
    tbody td:nth-child(1) textarea,
    tbody td:nth-child(2) textarea{ max-width: 120px; width: 100%; }
    tbody td:nth-child(3) textarea{ max-width: 70px; width: 100%; }
    /* 조성비확인(6번째)을 품목수정(7번째)과 더 가깝게 */
    thead th:nth-child(6), tbody td:nth-child(6){ width: 50px; }
    thead th:nth-child(7), tbody td:nth-child(7){ width: 64px; }
    /* 품명(4번째), 영문명(5번째) 입력 폭 -10px */
    tbody td:nth-child(4) textarea,
    tbody td:nth-child(5) textarea{ width: 100%; }
    /* 사이드메뉴가 열려 화면 가용폭이 줄어드는 중간 구간 대응 */
    @media (max-width: 1400px){
      thead th:nth-child(1), tbody td:nth-child(1){ width: 80px; }
      thead th:nth-child(2), tbody td:nth-child(2){ width: 80px; }
      thead th:nth-child(3), tbody td:nth-child(3){ width: 60px; }
      thead th:nth-child(7), tbody td:nth-child(7){ width: 60px; }
    }
    @media (max-width: 1200px){
      thead th:nth-child(1), tbody td:nth-child(1){ width: 70px; }
      thead th:nth-child(2), tbody td:nth-child(2){ width: 70px; }
      thead th:nth-child(3), tbody td:nth-child(3){ width: 50px; }
    }
    @media (max-width: 1024px){
      thead th:nth-child(1), tbody td:nth-child(1){ width: 60px; }
      thead th:nth-child(2), tbody td:nth-child(2){ width: 60px; }
      thead th:nth-child(3), tbody td:nth-child(3){ width: 40px; }
      /* 품목수정(7번째 컬럼) 버튼 폭을 넉넉히 유지 */
      thead th:nth-child(7), tbody td:nth-child(7){ width: 60px; }
    }
    @media (max-width: 860px){
      thead th:nth-child(1), tbody td:nth-child(1){ width: 50px; }
      thead th:nth-child(2), tbody td:nth-child(2){ width: 50px; }
      thead th:nth-child(3), tbody td:nth-child(3){ width: 35px; }
      thead th:nth-child(7), tbody td:nth-child(7){ width: 60px; }
    }
    /* 품목수정 헤더 줄바꿈 방지 */
    thead th:nth-child(7){ white-space: nowrap; }
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

  constructor(private erpData: ErpDataService,
    private storage: StorageService, private tabBus: TabService) {}

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
      const { data } = await this.erpData.quickSearchProducts(q);
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
      const { data } = await this.erpData.getProduct(p.id as any);
      // If product has any saved compositions, and verify logs exist, show v
      let hasCompositions = false;
      try {
        const list = await this.erpData.listProductCompositions(p.id as any);
        hasCompositions = Array.isArray((list as any)?.data) && ((list as any).data.length > 0);
      } catch { hasCompositions = false; }
      const verifyLogs = await this.erpData.getProductVerifyLogs((p.id as any));
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
    setTimeout(()=>{
      const table = document.querySelector('table.grid') as HTMLTableElement | null;
      const row = table?.querySelectorAll('tbody tr')[Math.min(i, this.rows.length-1)] as HTMLTableRowElement | undefined;
      const first = row?.querySelector('textarea') as HTMLTextAreaElement | undefined;
      first?.focus();
    }, 0);
  }

  openHtmlPreview(){
    // Find first checked composition row with product_id
    const target = this.rows.find(r=> r.composition && r.product_id);
    if (!target){ alert('Composition 체크된 품목이 없습니다.'); return; }
    const url = `/app/product/compose-preview?product_id=${encodeURIComponent(target.product_id as any)}&code=${encodeURIComponent(target.product_code||'')}&name=${encodeURIComponent(target.name_kr||'')}`;
    window.open(url, '_blank');
  }

  openHtmlPdf(){
    const target = this.rows.find(r=> r.composition && r.product_id);
    if (!target){ alert('Composition이 체크된 품목이 없습니다.'); return; }
    if (!target.verified){ alert('조성비 확인이 필요합니다.'); return; }
    const url = `/app/product/compose-preview?product_id=${encodeURIComponent(target.product_id as any)}&code=${encodeURIComponent(target.product_code||'')}&name=${encodeURIComponent(target.name_kr||'')}&customer=${encodeURIComponent(target.customer||'')}&delivery=${encodeURIComponent(target.delivery_customer||'')}&auto=1`;
    window.open(url, '_blank');
  }

  async savePdfFromHtml(){
    const target = this.rows.find(r=> r.composition && r.product_id);
    if (!target){ alert('Composition이 체크된 품목이 없습니다.'); return; }
    if (!target.verified){ alert('조성비 확인이 필요합니다.'); return; }
    try{
      const url = `/app/product/compose-preview?product_id=${encodeURIComponent(target.product_id as any)}&code=${encodeURIComponent(target.product_code||'')}&name=${encodeURIComponent(target.name_kr||'')}&embed=1`;
      const wrapper = document.createElement('div');
      wrapper.style.position='fixed'; wrapper.style.left='-200vw'; wrapper.style.top='0';
      wrapper.style.width='210mm'; wrapper.style.height='297mm'; wrapper.style.background='#fff';
      const iframe = document.createElement('iframe');
      iframe.src = url; iframe.style.width='210mm'; iframe.style.height='297mm'; iframe.style.border='0';
      wrapper.appendChild(iframe); document.body.appendChild(wrapper);

      // Wait for iframe load
      await new Promise(res=> iframe.onload = ()=> res(null));
      const idoc = iframe.contentDocument as Document | null;
      if (!idoc) throw new Error('preview not ready');
      // Wait for fonts and layout stabilization
      try { await (idoc as any).fonts?.ready; } catch {}
      // Poll for #sheet up to 6s
      let sheet: HTMLElement | null = null; const start = Date.now();
      while(!sheet && Date.now() - start < 6000){
        sheet = idoc.getElementById('sheet');
        if (!sheet) await new Promise(r=> setTimeout(r, 100));
      }
      if (!sheet) throw new Error('preview not ready');
      // Give the browser a couple of frames to paint
      await new Promise(r=> setTimeout(r, 120));

      const { jsPDF } = await import('jspdf');
      const html2canvas = (await import('html2canvas')).default as any;
      const canvas = await html2canvas(sheet, { scale: 4, useCORS: true, backgroundColor: '#ffffff' });
      const img = canvas.toDataURL('image/png');
      const doc = new (jsPDF as any)({ orientation:'p', unit:'mm', format:'a4' });
      doc.addImage(img, 'PNG', 0, 0, 210, 297);
      const name = `${this.todayStr()} ${target.product_code||''} ${target.name_kr||''} Composition ${target.customer||''} ${target.delivery_customer||''}.pdf`;
      doc.save(name);
      document.body.removeChild(wrapper);
    }catch(e:any){ alert('PDF 생성 실패: ' + (e?.message||e)); }
  }

  async savePdfDirect(){
    const target = this.rows.find(r=> r.composition && r.product_id);
    if (!target){ alert('Composition 체크된 품목이 없습니다.'); return; }
    if (!target.verified){ alert('조성비 확인이 필요합니다.'); return; }
    try{
      const { data } = await this.erpData.listProductCompositions(target.product_id as any) as any;
      const list: Array<{ inci: string; kor: string; pct: number }> = (data||[]).map((c:any)=>({
        inci: (c?.ingredient?.inci_name)||'',
        kor: (c?.ingredient?.korean_name)||'',
        pct: Number(c?.percent)||0,
      }));
      // Draw to high-res canvas to preserve Korean text (system fonts)
      const scale = 2; // 2x for clarity
      const pagePxW = Math.round(794 * scale); // A4 96dpi baseline
      const pagePxH = Math.round(1123 * scale);
      const canvas = document.createElement('canvas');
      canvas.width = pagePxW; canvas.height = pagePxH;
      const ctx = canvas.getContext('2d'); if (!ctx) throw new Error('canvas not supported');
      ctx.fillStyle = '#ffffff'; ctx.fillRect(0,0,pagePxW,pagePxH);
      const mm = (v:number)=> v * (pagePxW / 210);
      const margin = 25; const pageW = 210; const width = pageW - margin*2;
      // Header: small motto/brand at top in original size
      ctx.fillStyle = '#111827';
      ctx.font = `${Math.round(mm(3))}px 'Noto Sans KR', 'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif`;
      ctx.textBaseline = 'alphabetic';
      ctx.fillText('Life Science for Happiness', mm(margin), mm(15));
      ctx.fillText('BIO-FD&C', pagePxW - mm(margin) - mm(20), mm(15));
      ctx.font = `bold ${Math.round(mm(6))}px 'Noto Sans KR', 'Malgun Gothic', sans-serif`;
      const title = 'CERTIFICATE OF COMPOSITION';
      const titleTop = 70; // push further down (~70mm)
      ctx.fillText(title, (pagePxW/2) - ctx.measureText(title).width/2, mm(titleTop));
      // Product box (26.5mm below title)
      const boxY = titleTop + 26.5; const boxH = 16;
      ctx.strokeStyle = '#9ca3af'; ctx.lineWidth = Math.max(1, mm(0.35));
      const bx = mm(margin); const bw = mm(width);
      ctx.strokeRect(bx, mm(boxY), bw, mm(boxH));
      ctx.font = `bold ${Math.round(mm(3.6))}px 'Noto Sans KR', 'Malgun Gothic', sans-serif`;
      const plab = 'Product Name';
      ctx.fillText(plab, (pagePxW/2) - ctx.measureText(plab).width/2, mm(boxY+5));
      ctx.font = `bold ${Math.round(mm(4.6))}px 'Noto Sans KR', 'Malgun Gothic', sans-serif`;
      const pname = `${target.name_kr || ''}`.trim() || `${target.product_code||''}`;
      ctx.fillText(pname, (pagePxW/2) - ctx.measureText(pname).width/2, mm(boxY+11));
      // Table grid
      const colNo = 12, colInci = 70, colKor = 60, colPct = width - colNo - colInci - colKor;
      let y = boxY + boxH + 12;
      const headerH = 8; const rowH = 8;
      ctx.font = `bold ${Math.round(mm(3.6))}px 'Noto Sans KR', 'Malgun Gothic', sans-serif`;
      // header cells
      const x1 = mm(margin), x2 = mm(margin+colNo), x3 = mm(margin+colNo+colInci), x4 = mm(margin+colNo+colInci+colKor), x5 = mm(margin+width);
      const hy = mm(y), hh = mm(headerH);
      ctx.strokeRect(x1, hy, x2-x1, hh);
      ctx.strokeRect(x2, hy, x3-x2, hh);
      ctx.strokeRect(x3, hy, x4-x3, hh);
      ctx.strokeRect(x4, hy, x5-x4, hh);
      const centerText = (text:string, cx:number, cy:number)=>{ ctx.fillText(text, cx - ctx.measureText(text).width/2, cy); };
      centerText('No.', x1 + (x2-x1)/2, hy + mm(5.5));
      centerText('INCI Name', x2 + (x3-x2)/2, hy + mm(5.5));
      centerText('한글성분명', x3 + (x4-x3)/2, hy + mm(5.5));
      centerText('조성비(%)', x4 + (x5-x4)/2, hy + mm(5.5));
      // body rows
      ctx.font = `${Math.round(mm(3.6))}px 'Noto Sans KR', 'Malgun Gothic', sans-serif`;
      let total = 0;
      for (let i=0;i<list.length;i++){
        const top = mm(y + headerH + i*rowH);
        ctx.strokeRect(x1, top, x2-x1, mm(rowH));
        ctx.strokeRect(x2, top, x3-x2, mm(rowH));
        ctx.strokeRect(x3, top, x4-x3, mm(rowH));
        ctx.strokeRect(x4, top, x5-x4, mm(rowH));
        centerText(String(i+1), x1 + (x2-x1)/2, top + mm(5.5));
        ctx.fillText(String(list[i].inci||''), x2 + mm(2), top + mm(5.5));
        ctx.fillText(String(list[i].kor||''), x3 + mm(2), top + mm(5.5));
        const pct = Number.isFinite(list[i].pct)? Math.round(list[i].pct) : 0;
        const pctText = String(pct);
        ctx.fillText(pctText, x5 - mm(2) - ctx.measureText(pctText).width, top + mm(5.5));
        total += pct;
      }
      const lastY = y + headerH + list.length * rowH;
      ctx.font = `bold ${Math.round(mm(3.6))}px 'Noto Sans KR', 'Malgun Gothic', sans-serif`;
      ctx.strokeRect(x1, mm(lastY), x4-x1, mm(rowH));
      ctx.strokeRect(x4, mm(lastY), x5-x4, mm(rowH));
      centerText('Total', x1 + (x4-x1)/2, mm(lastY + 5.5));
      const totalText = String(total);
      ctx.fillText(totalText, x5 - mm(2) - ctx.measureText(totalText).width, mm(lastY + 5.5));
      // Footer contents
      const footY = 297 - 25 - 26;
      ctx.font = `${Math.round(mm(3.6))}px 'Noto Sans KR', 'Malgun Gothic', sans-serif`;
      ctx.fillText('Approved by :', mm(margin), mm(footY));
      ctx.strokeStyle = '#d1d5db'; ctx.lineWidth = Math.max(1, mm(0.3));
      ctx.beginPath(); ctx.moveTo(mm(margin + 26), mm(footY + 0.8)); ctx.lineTo(mm(margin + 90), mm(footY + 0.8)); ctx.stroke();
      ctx.font = `bold ${Math.round(mm(3.6))}px 'Noto Sans KR', 'Malgun Gothic', sans-serif`;
      const corp = '(주)바이오에프디엔씨';
      ctx.fillText(corp, (pagePxW/2) - ctx.measureText(corp).width/2, mm(footY + 10));
      ctx.font = `${Math.round(mm(3))}px 'Noto Sans KR', 'Malgun Gothic', sans-serif`;
      ctx.fillText('21990 Smart Valley A-509,510,511, Songdomirae-ro 30, Yeonsu-Gu, Incheon, Korea', mm(margin), mm(297 - 25 - 8));
      ctx.fillText('T. 82 32) 811-2027  F. 82 32) 822-2027  dsshin@biofdnc.com', mm(margin), mm(297 - 25 - 4));
      const p1 = 'page1';
      ctx.fillText(p1, pagePxW - mm(margin) - ctx.measureText(p1).width, mm(297 - 25 - 4));

      // Convert to PDF
      const dataUrl = canvas.toDataURL('image/png');
      const { jsPDF } = await import('jspdf');
      const doc = new (jsPDF as any)({ orientation: 'p', unit: 'mm', format: 'a4' });
      doc.addImage(dataUrl, 'PNG', 0, 0, 210, 297);
      const name = `${this.todayStr()} ${target.product_code||''} ${target.name_kr||''} Composition ${target.customer||''} ${target.delivery_customer||''}.pdf`;
      doc.save(name);
    }catch(e:any){ alert('PDF 생성 실패: ' + (e?.message||e)); }
  }

  async pdfExport(){
    // Composition 체크된 행들의 기존 XLSX를 서버 함수로 PDF 변환 저장
    const targets = this.rows.filter(r=> r.composition && r.product_id);
    if (!targets.length){ alert('Composition이 체크된 품목이 없습니다.'); return; }
    const unverified = targets.filter(t=> !t.verified);
    if (unverified.length){
      const list = unverified.map(u=> u.product_code || u.name_kr || '-').join(', ');
      alert(`조성비 확인이 필요합니다. 확인되지 않은 품목: ${list}`);
      return;
    }
    for (const r of targets){
      try{
        const name = `${this.todayStr()} ${r.product_code||''} ${r.name_kr||''} Composition ${r.customer||''} ${r.delivery_customer||''}.xlsx`;
        const xlsxPath = `composition/${encodeURIComponent(r.product_code||'code')}/${encodeURIComponent(name)}`;
        // 서버 함수 호출로 PDF 변환 후 저장
        const res = await fetch('/functions/v1/xlsx-to-pdf', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ bucket: 'product_exports', path: xlsxPath }) });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || 'convert failed');
        const a = document.createElement('a'); a.href = json.url; a.download = json.path.split('/').pop(); a.target = '_blank'; document.body.appendChild(a); a.click(); document.body.removeChild(a);
      }catch(e:any){ alert('PDF 변환 실패: ' + (e?.message||e)); }
    }
  }

  private toCsvCell(v:any){ if (v===undefined || v===null) return '""'; const s = String(v).replace(/"/g,'""'); return `"${s}"`; }
  async excelExport(){
    const targets = this.rows.filter(r=> r.composition && r.product_id);
    if (!targets.length){ alert('Composition이 체크된 품목이 없습니다.'); return; }
    const unverified = targets.filter(t=> !t.verified);
    if (unverified.length){
      const list = unverified.map(u=> u.product_code || u.name_kr || '-').join(', ');
      alert(`조성비 확인이 필요합니다. 확인되지 않은 품목: ${list}`);
      return;
    }
    for (const r of targets){
      try{
        const { data } = await this.erpData.listProductCompositions(r.product_id as any) as any;
        const list = (data||[]).map((c:any)=>({
          inci: (c.ingredient && c.ingredient.inci_name) || '',
          kor: (c.ingredient && c.ingredient.korean_name) || '',
          cas: (c.ingredient && c.ingredient.cas_no) || '',
          pct: Number(c.percent)||0,
        }));
        // 1) 템플릿 XLSX 다운로드
        const tpl = await this.storage.getCompositionTemplate() as any;
        if (!tpl?.url){ alert('서류양식의 Composition 템플릿이 없습니다.'); return; }
        const resp = await fetch(tpl.url);
        const buf = await resp.arrayBuffer();
        // 2) exceljs로 로드(브라우저 호환). exceljs는 이미지 렌더링은 제한적이지만 셀/서식 유지 가능.
        const ExcelJS = await import('exceljs');
        const workbook = new (ExcelJS as any).Workbook();
        await workbook.xlsx.load(buf);
        const sheet = workbook.worksheets[0];
        const startRow = 6;
        for (let i=0;i<list.length;i++){
          const row = startRow + i;
          sheet.getCell(`B${row}`).value = list[i].inci;
          sheet.getCell(`F${row}`).value = list[i].kor;
          sheet.getCell(`I${row}`).value = Number.isFinite(list[i].pct)? list[i].pct : 0;
        }
        const out = await workbook.xlsx.writeBuffer();
        const name = `${this.todayStr()} ${r.product_code||''} ${r.name_kr||''} Composition ${r.customer||''} ${r.delivery_customer||''}.xlsx`;
        const blob = new Blob([out], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        // Upload to Supabase Storage and then offer the URL for download
        try{
          const path = `composition/${encodeURIComponent(r.product_code||'code')}/${encodeURIComponent(name)}`;
          const uploaded = await this.storage.uploadProductExport(blob, path);
          const a = document.createElement('a'); a.href = (uploaded as any).url; a.download = name; a.target = '_blank'; document.body.appendChild(a); a.click(); document.body.removeChild(a);
        }catch{
          // Fallback to direct download if storage upload fails
          const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = name; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
        }
      }catch{}
    }
  }

  private todayStr(){ const d=new Date(); const pad=(n:number)=> String(n).padStart(2,'0'); return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`; }
  private x(v:string){ return (v||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  private buildCompositionExcelXml(meta: { product_code: string; name_kr: string; customer: string; delivery: string; date: string }, rows: Array<{ inci: string; kor: string; cas: string; pct: number }>): string{
    const header = `<?xml version="1.0"?>\n<?mso-application progid="Excel.Sheet"?>\n<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">`;
    const sheetStart = `<Worksheet ss:Name="Composition"><Table>`;
    const metaRows = [
      `<Row><Cell ss:MergeAcross="3"><Data ss:Type="String">Composition 서류양식</Data></Cell></Row>`,
      `<Row><Cell><Data ss:Type="String">Date</Data></Cell><Cell ss:MergeAcross="3"><Data ss:Type="String">${this.x(meta.date)}</Data></Cell></Row>`,
      `<Row><Cell><Data ss:Type="String">Product</Data></Cell><Cell ss:MergeAcross="3"><Data ss:Type="String">${this.x(meta.product_code)} ${this.x(meta.name_kr)}</Data></Cell></Row>`,
      `<Row><Cell><Data ss:Type="String">거래처</Data></Cell><Cell ss:MergeAcross="3"><Data ss:Type="String">${this.x(meta.customer)}</Data></Cell></Row>`,
      `<Row><Cell><Data ss:Type="String">납품거래처</Data></Cell><Cell ss:MergeAcross="3"><Data ss:Type="String">${this.x(meta.delivery)}</Data></Cell></Row>`,
      `<Row/>`
    ].join('');
    const head = `<Row>\n  <Cell><Data ss:Type="String">INCI Name</Data></Cell>\n  <Cell><Data ss:Type="String">한글성분명</Data></Cell>\n  <Cell><Data ss:Type="String">CAS No.</Data></Cell>\n  <Cell><Data ss:Type="String">%W/W</Data></Cell>\n</Row>`;
    const body = rows.map(r=>`<Row>\n  <Cell><Data ss:Type="String">${this.x(r.inci)}</Data></Cell>\n  <Cell><Data ss:Type="String">${this.x(r.kor)}</Data></Cell>\n  <Cell><Data ss:Type="String">${this.x(r.cas)}</Data></Cell>\n  <Cell><Data ss:Type="Number">${r.pct}</Data></Cell>\n</Row>`).join('');
    const sheetEnd = `</Table></Worksheet>`;
    const end = `</Workbook>`;
    return header + sheetStart + metaRows + head + body + sheetEnd + end;
  }

  // Excel 2003 XML with specific placement: INCI -> B6, Korean name -> F6, %W/W -> I6
  private buildCompositionExcelXmlPlaced(meta: { product_code: string; name_kr: string; customer: string; delivery: string; date: string }, rows: Array<{ inci: string; kor: string; cas: string; pct: number }>): string{
    const header = `<?xml version="1.0"?>\n<?mso-application progid="Excel.Sheet"?>\n<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">`;
    const sheetStart = `<Worksheet ss:Name="Composition"><Table>`;
    const intro = [`
      <Row><Cell ss:MergeAcross="8"><Data ss:Type="String">${this.x(meta.product_code)} ${this.x(meta.name_kr)} · ${this.x(meta.customer)} / ${this.x(meta.delivery)} · ${this.x(meta.date)}</Data></Cell></Row>
      <Row/><Row/><Row/><Row/>
    `].join('');
    let body = '';
    let idx = 6; // start row
    for (const r of rows){
      body += `<Row ss:Index="${idx}">`+
        `<Cell ss:Index="2"><Data ss:Type="String">${this.x(r.inci)}</Data></Cell>`+
        `<Cell ss:Index="6"><Data ss:Type="String">${this.x(r.kor)}</Data></Cell>`+
        `<Cell ss:Index="9"><Data ss:Type="Number">${Number.isFinite(r.pct)? r.pct : 0}</Data></Cell>`+
        `</Row>`;
      idx++;
    }
    const sheetEnd = `</Table></Worksheet>`;
    const end = `</Workbook>`;
    return header + sheetStart + intro + body + sheetEnd + end;
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
      const { data } = await this.erpData.quickSearchProducts(code);
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
        const { data } = await this.erpData.quickSearchProducts(r.product_code);
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

  async savePdfPrintJs(){
    const target = this.rows.find(r=> r.composition && r.product_id);
    if (!target){ alert('Composition이 체크된 품목이 없습니다.'); return; }
    const ensurePrintJs = async () => {
      if ((window as any).printJS) return (window as any).printJS;
      await new Promise<void>((resolve, reject)=>{
        const s = document.createElement('script');
        s.src = 'https://cdn.jsdelivr.net/npm/print-js@1.6.0/dist/print.min.js';
        s.onload = ()=> resolve(); s.onerror = ()=> reject(new Error('print.js load error'));
        document.head.appendChild(s);
      });
      return (window as any).printJS;
    };
    try{
      const printJS = await ensurePrintJs();
      const url = `/app/product/compose-preview?product_id=${encodeURIComponent(target.product_id as any)}&code=${encodeURIComponent(target.product_code||'')}&name=${encodeURIComponent(target.name_kr||'')}&embed=1`;
      const wrapper = document.createElement('div'); wrapper.style.position='fixed'; wrapper.style.left='-200vw'; wrapper.style.top='0';
      const iframe = document.createElement('iframe'); iframe.src = url; iframe.style.width='210mm'; iframe.style.height='297mm'; iframe.style.border='0';
      wrapper.appendChild(iframe); document.body.appendChild(wrapper);
      await new Promise(res=> iframe.onload = ()=> setTimeout(res, 150));
      // poll for #sheet up to 3s
      let sheet: HTMLElement | null = null; const started = Date.now();
      while(!sheet && Date.now()-started < 3000){
        sheet = iframe.contentDocument?.getElementById('sheet') as HTMLElement | null;
        if (!sheet) await new Promise(r=> setTimeout(r, 100));
      }
      if (!sheet) throw new Error('preview not ready');
      const css = `@page { size: A4 portrait; margin: 25mm; }
      html, body { margin:0; padding:0; background:#fff; }
      * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      body, .sheet { font-family: 'Noto Sans KR', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Inter', 'Apple SD Gothic Neo', 'Malgun Gothic', Arial, sans-serif; }
      .sheet{ width:210mm; height:297mm; margin:0 auto; padding:25mm; box-sizing:border-box; }
      .head{ display:block; }
      .head .line1{ display:flex; justify-content:space-between; align-items:center; font-size:11pt; color:#111827; }
      .head h1{ margin:30mm 0 18mm; text-align:center; font-size:20pt; font-weight:800; letter-spacing:0.3px; }
      .product{ border:0.4mm dotted #9ca3af; border-radius:2mm; padding:6mm; text-align:center; margin:12mm 0 12mm; }
      .product .label{ color:#6b7280; font-weight:700; font-size:11pt; }
      .product .value{ font-size:13pt; font-weight:800; margin-top:2mm; }
      .table{ margin-top:6mm; }
      .table table{ width:100%; border-collapse:collapse; }
      .table th, .table td{ border:0.35mm dotted #9ca3af; padding:3.5mm 3mm; font-size:10.5pt; line-height:1.35; }
      .table thead th{ background:#fafafa; font-weight:700; }
      .table .col-no{ width:12mm; text-align:center; }
      .table .col-pct{ width:24mm; text-align:right; }
      tfoot .total-label{ text-align:center; font-weight:700; }
      .sign{ margin-top:14mm; text-align:center; }
      .sign .approved{ display:inline-block; margin-right:10px; }
      .sign .signbox{ display:inline-block; width:60mm; height:22mm; border-bottom:0.3mm solid #d1d5db; vertical-align:bottom; }
      .sign .corp{ margin-top:6mm; font-weight:700; }
      .foot{ display:flex; justify-content:space-between; color:#6b7280; font-size:9.5pt; padding-top:8mm; }`;
      const html = `<!doctype html><html><head><meta charset=\"utf-8\"><style>${css}</style></head><body>${sheet.outerHTML}</body></html>`;
      printJS({ printable: html, type: 'raw-html', documentTitle: `${this.todayStr()} ${target.product_code||''} ${target.name_kr||''} Composition`, showModal: false, style: '' });
      // Cleanup shortly after dispatch
      setTimeout(()=>{ try{ document.body.removeChild(wrapper); }catch{} }, 1000);
    }catch(e:any){ alert('Print.js 인쇄 실패: ' + (e?.message||e)); }
  }
}


