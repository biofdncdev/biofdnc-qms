import { Component, OnInit, signal, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="form-page">
    <div class="page-head">
      <h2>Product <span class="sub">품목등록</span></h2>
    </div>

    <!-- 탭: 일반사항/부가정보/불순물/조성성분/첨부파일 -->
    <nav class="tabs">
      <button class="tab" [class.active]="activeTab==='composition'" (click)="activeTab='composition'">조성성분</button>
      <button class="tab" [class.active]="activeTab==='extra'" (click)="activeTab='extra'">부가정보</button>
      <button class="tab" [class.active]="activeTab==='impurity'" (click)="activeTab='impurity'">불순물 또는 잔류물질</button>
      <button class="tab" [class.active]="activeTab==='files'" (click)="activeTab='files'">첨부파일</button>
    </nav>


    <!-- 중단: 조성성분 편집 영역 (메인) -->
    <section *ngIf="activeTab==='composition'" class="comp-layout">
      <!-- 좌측: 일반사항 요약 표시 -->
      <aside class="left-placeholder">
        <section class="form-body ro left-card">
          <div class="grid-ro">
            <div class="field"><label>등록상태</label><div class="ro-display">{{ model.item_status }}</div></div>
            <div class="field"><label>품목자산분류</label><div class="ro-display">{{ model.asset_category }}</div></div>
            <div class="field"><label>품번</label><div class="ro-display">{{ model.product_code }}</div></div>
            <div class="field"><label>품명</label><div class="ro-display">{{ model.name_kr }}</div></div>
            <div class="field"><label>영문명</label><div class="ro-display">{{ model.name_en }}</div></div>
            <div class="field"><label>규격</label><div class="ro-display">{{ model.spec }}</div></div>
            <div class="field"><label>CAS</label><div class="ro-display">{{ model.cas_no }}</div></div>
            <div class="field"><label>기준단위</label><div class="ro-display">{{ model.unit }}</div></div>
            <div class="field"><label>세부품목</label><div class="ro-display">{{ model.item_subdivision }}</div></div>
            <div class="field"><label>사양</label><div class="ro-display">{{ model.specification }}</div></div>
            <div class="field"><label>MOQ</label><div class="ro-display">{{ model.moq }}</div></div>
            <div class="field"><label>포장단위</label><div class="ro-display">{{ model.package_unit }}</div></div>
            <div class="field col-span-2"><label>검색어(이명)</label><div class="ro-display">{{ model.keywords_alias }}</div></div>
          </div>
          <div class="product-picker">
            <label class="picker-label">품목 선택</label>
            <input class="picker-input" [(ngModel)]="productQuery" (input)="debouncedProductSearch()" (keydown.arrowDown)="moveProductPointer(1)" (keydown.arrowUp)="moveProductPointer(-1)" (keydown.enter)="onProductEnter($event)" (keydown.escape)="onProductEsc($event)" placeholder="품번/품명 검색" />
            <ul class="picker-list" *ngIf="productResults.length">
              <li *ngFor="let p of productResults; let i = index" [class.selected]="i===productPointer" (click)="pickProduct(p)">{{ p.product_code }} · {{ p.name_kr }} · {{ p.spec || p.specification || '-' }}</li>
            </ul>
          </div>
        </section>
      </aside>
      <!-- 우측 메인 테이블 -->
      <div class="right-main comp-wrap">
        <div class="toolbar">
          <div class="title">조성성분</div>
          <div class="spacer"></div>
          <span class="status" [class.saved]="saved" [class.unsaved]="!saved">{{ saved? '저장됨' : '저장되지 않음' }}</span>
          <button class="btn" (click)="saveCompositions()">저장</button>
          <button class="btn primary" (click)="openPicker()">성분 추가</button>
        </div>
        <div class="table-scroll" #compTableRef>
          <table class="grid">
            <thead>
              <tr>
                <th class="col-no">No.</th>
                <th class="col-inci">INCI Name</th>
                <th class="col-kor">한글성분명</th>
                <th class="col-cn">중국성분명</th>
                <th class="col-cas">CAS No.</th>
                <th class="col-pct">조성비(%)</th>
                <th class="col-act"></th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let c of compositions; let i = index" [class.selected]="selectedComp===c" (click)="selectedComp=c">
                <td class="col-no">{{ i+1 }}</td>
                <td class="col-inci">{{ c.inci_name }}</td>
                <td class="col-kor">{{ c.korean_name }}</td>
                <td class="col-cn">{{ c.chinese_name || '' }}</td>
                <td class="col-cas">{{ c.cas_no || '' }}</td>
                <td class="col-pct"><input type="number" step="0.01" [(ngModel)]="c.percent" (ngModelChange)="onPercentChange()" /></td>
                <td class="col-act"><button class="mini" (click)="$event.stopPropagation(); removeRow(c)">삭제</button></td>
              </tr>
              <tr *ngIf="compositions.length===0"><td colspan="7" class="empty">성분을 추가해 주세요.</td></tr>
            </tbody>
            <tfoot>
              <tr>
                <td colspan="6" class="sum-label">합계</td>
                <td class="sum" [class.ok]="percentSum()===100" [class.bad]="percentSum()!==100">{{ percentSum() | number:'1.0-2' }}%</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <!-- 피커 모달 -->
        <div class="modal-backdrop" *ngIf="pickerOpen" (click)="closePicker()"></div>
        <div class="modal" *ngIf="pickerOpen" (click)="$event.stopPropagation()" [style.top.px]="modalTop" [style.left.px]="modalLeft" [style.transform]="'none'">
          <div class="modal-head" (mousedown)="startDrag($event)">
            <b>성분 선택</b>
            <div class="spacer"></div>
          </div>
          <div class="modal-body">
            <div class="search-bar">
              <input [(ngModel)]="pickerQuery" (input)="debouncedPickerSearch()" (keydown.arrowDown)="movePickerPointer(1)" (keydown.arrowUp)="movePickerPointer(-1)" (keydown.enter)="onPickerEnter($event)" placeholder="INCI/국문명 검색" />
            </div>
            <div class="table-scroll small">
              <table class="grid">
                <thead><tr><th>INCI Name</th><th>한글성분명</th><th>중국성분명</th><th>CAS No.</th><th class="col-act"></th></tr></thead>
                <tbody>
                  <tr *ngFor="let r of pickerRows; let i = index" [class.selected]="i===pickerPointer" (dblclick)="addPicked(r)">
                    <td>{{ r.inci_name }}</td>
                    <td>{{ r.korean_name }}</td>
                    <td>{{ r.chinese_name || '' }}</td>
                    <td>{{ r.cas_no || '' }}</td>
                    <td class="col-act"><button class="mini" (click)="addPicked(r)">추가</button></td>
                  </tr>
                  <tr *ngIf="pickerRows.length===0"><td colspan="5" class="empty">검색 결과가 없습니다.</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>

    <div class="notice" *ngIf="notice()">{{ notice() }}</div>
  </div>
  `,
  styles: [`
    .page-head{ display:flex; align-items:center; justify-content:flex-start; margin-bottom:6px; }
    .page-head h2{ margin:0; font-size:20px; font-weight:800; }
    .page-head .sub{ font-size:14px; font-weight:700; margin-left:6px; color:#6b7280; }
    .tabs{ display:flex; gap:6px; border-bottom:1px solid #e5e7eb; margin:16px 0 8px; }
    .tab{ height:30px; padding:0 12px; border:1px solid #e5e7eb; border-bottom:none; border-top-left-radius:8px; border-top-right-radius:8px; background:#f9fafb; cursor:pointer; font-size:12px; }
    .tab.active{ background:#fff; border-color:#d1d5db; font-weight:700; }
    .form-page{ padding:10px 12px; }
    .form-header{ display:flex; align-items:center; justify-content:space-between; position:sticky; top:10px; background:#fff; z-index:5; padding:6px 0; }
    .actions{ display:flex; gap:8px; align-items:center; }
    .btn{ height:28px; padding:0 10px; border-radius:8px; border:1px solid #d1d5db; background:#fff; cursor:pointer; font-size:12px; }
    .btn.primary{ background:#111827; color:#fff; border-color:#111827; }
    .btn.ghost{ background:#fff; color:#111827; }
    .btn.danger{ background:#fee2e2; color:#b91c1c; border-color:#fecaca; font-weight:700; }
    .form-body{ border:none; border-radius:12px; padding:8px; margin-bottom:10px; }
    /* 상단 참조 정보: 최대한 콤팩트 */
    .form-body.ro{ font-size:12px; }
    .form-body.ro .grid-ro{ display:grid; grid-template-columns: repeat(2, minmax(100px, 1fr)); gap:6px 10px; }
    .grid-ro .col-span-2{ grid-column: 1 / -1; }
    .ro .field{ display:flex; flex-direction:column; gap:4px; }
    .ro .field label{ font-size:11px; color:#6b7280; }
    .ro input, .ro textarea{ height:26px; padding:3px 6px; font-size:12px; }
    .ro .ro-display{ min-height:26px; padding:4px 6px; border:1px solid #e5e7eb; border-radius:8px; background:#f9fafb; font-size:12px; line-height:1.3; white-space:normal; word-break:break-word; color:#6b7280; }
    .ro-note{ margin-top:6px; font-size:11px; color:#6b7280; }
    .row-3{ display:grid; grid-template-columns: repeat(3, minmax(220px, 1fr)); gap:10px; align-items:end; }
    .row-1{ display:grid; grid-template-columns:1fr; gap:12px; margin-top:10px; }
    .field{ display:flex; flex-direction:column; gap:6px; }
    input, textarea{ width:100%; box-sizing:border-box; border:1px solid #e5e7eb; border-radius:8px; padding:6px 8px; font-size:13px; }
    .meta{ margin-top:8px; padding:6px 8px; border-top:1px dashed #e5e7eb; color:#6b7280; font-size:11px; }
    .notice{ margin:8px 0 0; padding:8px 10px; border:1px solid #bbf7d0; background:#ecfdf5; color:#065f46; border-radius:10px; font-size:12px; }
    /* 중단 조성성분 영역을 메인으로 보이도록 간격 조정 */
    .comp-actions{ display:flex; align-items:center; gap:10px; margin:6px 0 8px; }
    .sum-check b.ok{ color:#059669; }
    .sum-check b.bad{ color:#b91c1c; }
    .ing-search{ border:none; border-radius:12px; padding:8px; margin-top:10px; }
    .ing-search .search-bar{ display:flex; gap:6px; }
    .ing-search .results{ list-style:none; margin:6px 0 0; padding:0; max-height:220px; overflow:auto; border:1px solid #eef2f7; border-radius:8px; }
    .ing-search .results li{ display:flex; gap:10px; align-items:center; padding:5px 8px; cursor:pointer; }
    .ing-search .results li.hover{ background:#f3f4f6; }
    .ing-search .results .inci{ min-width:200px; font-weight:600; }
    .ing-search .results .kor{ color:#4b5563; }
    .comp-layout{ display:grid; grid-template-columns: 360px 1fr; gap:30px; align-items:stretch; margin:24px 0 16px; }
    .left-placeholder{ min-height:420px; max-width:380px; display:flex; }
    .left-card{ background:#fff; border:1px solid #e5e7eb; border-radius:12px; box-shadow:0 8px 20px rgba(0,0,0,0.06); flex:1; }
    .right-main{ min-height:420px; min-width:0; }
    .comp-wrap .toolbar{ display:flex; align-items:center; gap:10px; margin-bottom:8px; }
    .comp-wrap .toolbar .title{ font-weight:700; }
    .comp-wrap .toolbar .spacer{ flex:1; }
    .status{ font-size:12px; }
    .status.saved{ color:#2563eb; }
    .status.unsaved{ color:#f97316; }
    .grid{ width:100%; border-collapse:collapse; table-layout:fixed; }
    .grid th, .grid td{ border:1px solid #e5e7eb; padding:6px 8px; font-size:12px; }
    .grid thead th{ background:#f9fafb; position:sticky; top:0; z-index:1; }
    .grid tr.selected td{ background:#eef6ff; }
    .grid .col-no{ width:40px; text-align:center; }
    .grid .col-pct{ width:120px; }
    .grid .col-act{ width:56px; text-align:center; }
    .grid input[type='number']{ width:100%; box-sizing:border-box; padding:4px 6px; }
    .table-scroll{ max-height:60vh; overflow:auto; border:1px solid #e5e7eb; border-radius:8px; }
    .table-scroll.small{ max-height:50vh; }
    table tfoot .sum{ text-align:right; font-weight:700; }
    table tfoot .sum.ok{ color:#059669; }
    table tfoot .sum.bad{ color:#b91c1c; }
    tr.selected{ background:#f0f9ff; }
    .empty{ text-align:center; color:#9ca3af; }
    .modal-backdrop{ position:fixed; inset:0; background:rgba(0,0,0,0.25); z-index:1000; }
    .modal{ position:fixed; top:20vh; left:50%; transform:translateX(-50%); width:min(920px, 92vw); background:#fff; border:1px solid #e5e7eb; border-radius:12px; box-shadow:0 20px 40px rgba(0,0,0,0.18); z-index:1001; }
    .modal-head{ display:flex; align-items:center; gap:8px; padding:10px; border-bottom:1px solid #e5e7eb; }
    .modal-body{ padding:10px; }
    .modal .search-bar{ display:flex; gap:8px; margin-bottom:8px; }
    .modal .grid td:first-child{ white-space:normal; word-break:break-word; }
    .product-picker{ margin-top:10px; }
    .product-picker .picker-label{ display:block; font-size:11px; color:#6b7280; margin-bottom:4px; }
    .product-picker .picker-input{ width:100%; box-sizing:border-box; border:1px solid #e5e7eb; border-radius:8px; padding:6px 8px; font-size:12px; }
    .product-picker .picker-list{ list-style:none; margin:6px 0 0; padding:0; max-height:180px; overflow:auto; border:1px solid #eef2f7; border-radius:8px; }
    .product-picker .picker-list li{ padding:6px 8px; cursor:pointer; }
    .product-picker .picker-list li.selected{ background:#eef6ff; }
    .product-picker .picker-list li:hover{ background:#f3f4f6; }
  `]
})
export class ProductFormComponent implements OnInit {
  id = signal<string | null>(null);
  model: any = {};
  meta: any = null;
  // Tabs
  activeTab: 'general' | 'extra' | 'impurity' | 'composition' | 'files' = 'composition';
  compositions: Array<{ id?: string; product_id?: string; ingredient_id: string; percent?: number | null; note?: string | null; inci_name?: string; korean_name?: string; chinese_name?: string; cas_no?: string }> = [];
  notice = signal<string | null>(null);
  private saveTimer: any = null;
  ingredientSuggest: Array<Array<{ id: string; inci_name: string; korean_name?: string }>> = [];
  // Ingredient search states
  ingQuery: string = '';
  ingResults: Array<{ id: string; inci_name: string; korean_name?: string }> = [];
  ingPageIndex = 0;
  pointer = 0;
  recommendLabel: string | null = null;
  // Composition table selection
  selectedComp: any = null;
  // Picker modal
  pickerOpen = false;
  pickerQuery = '';
  pickerRows: Array<{ id: string; inci_name: string; korean_name?: string; chinese_name?: string; cas_no?: string }> = [];
  private pickerTimer: any = null;
  saved = true;
  pickerPointer = 0;
  // Product picker
  productQuery = '';
  productResults: Array<{ id: string; product_code: string; name_kr?: string; spec?: string; specification?: string }> = [];
  productPointer = 0;
  modalTop = 0;
  modalLeft = Math.round(window.innerWidth/2 - 460); // 920px 모달 가정, 중앙 정렬 좌표로 시작
  dragging = false; private dragOffsetX = 0; private dragOffsetY = 0;

  constructor(private route: ActivatedRoute, private router: Router, private supabase: SupabaseService) {}
  async ngOnInit(){
    const id = this.route.snapshot.queryParamMap.get('id');
    if (id) {
      this.id.set(id);
      const { data } = await this.supabase.getProduct(id);
      this.model = data || {};
      this.meta = {
        created_at: data?.created_at,
        created_by: data?.created_by,
        created_by_name: data?.created_by_name,
        updated_at: data?.updated_at,
        updated_by: data?.updated_by,
        updated_by_name: data?.updated_by_name,
      };
      const { data: comps } = await this.supabase.listProductCompositions(id) as any;
      // map for new UI fields
      this.compositions = (comps || []).map((c:any)=>({
        ...c,
        inci_name: (c.ingredient && c.ingredient.inci_name) || '',
        korean_name: (c.ingredient && c.ingredient.korean_name) || '',
        cas_no: (c.ingredient && c.ingredient.cas_no) || '',
      }));
      this.ingredientSuggest = this.compositions.map(()=>[]);
    }
  }
  addComposition(){ this.compositions.push({ ingredient_id: '', percent: null, note: '' }); }
  addCompositionAndFocus(){ this.addComposition(); setTimeout(()=>{ const last = document.querySelector('input[type="number"]') as HTMLInputElement|null; last?.focus(); }, 0); }
  async removeComposition(row: any){ if (row?.id){ await this.supabase.deleteProductComposition(row.id); } this.compositions = this.compositions.filter(r => r !== row); }
  // Auto-save only remarks when changed
  onRemarksChange(_: any){
    if (this.saveTimer) clearTimeout(this.saveTimer);
    this.saveTimer = setTimeout(() => this.saveRemarks(), 600);
  }
  private async saveRemarks(){
    if (!this.id()) return; // existing product only
    const { data } = await this.supabase.upsertProduct({ id: this.id()!, remarks: this.model.remarks ?? null });
    if (data) this.model = { ...this.model, ...data };
    this.notice.set('비고가 저장되었습니다.'); setTimeout(()=>this.notice.set(null), 1800);
  }
  async onDelete(){
    if (!this.id()) return;
    const ok = confirm('이 제품을 삭제하시겠습니까? 조성성분도 함께 삭제됩니다.');
    if (!ok) return;
    await this.supabase.deleteProduct(this.id()!);
    this.router.navigate(['/app/product']);
  }

  // Excel upload removed from this screen per request

  // INCI autocomplete handlers
  async onInciInput(index:number, ev:any){
    const q = (ev?.target?.value || '').trim();
    if (!q){ this.ingredientSuggest[index] = []; return; }
    const { data } = await this.supabase.searchIngredientsBasic(q);
    this.ingredientSuggest[index] = data || [];
  }
  async onInciChange(index:number, value:string){
    const picked = (this.ingredientSuggest[index] || []).find(s => s.inci_name === value);
    if (picked){
      this.compositions[index].ingredient_id = picked.id;
      (this.compositions as any)[index].inci_name = picked.inci_name;
      (this.compositions as any)[index].korean_name = picked.korean_name || '';
    }
  }

  // Percent sum helper for validation banner
  percentSum(){ return Math.round((this.compositions.reduce((a,c)=> a + (Number(c.percent)||0), 0)) * 100) / 100; }

  // Ingredient search panel logic
  private ingDebounce: any = null;
  onIngQueryChange(value:string){ this.ingQuery = value || ''; this.pointer = 0; if (this.ingDebounce) clearTimeout(this.ingDebounce); this.ingDebounce = setTimeout(()=> this.runIngSearch(), 250); }
  async runIngSearch(){
    const q = (this.ingQuery||'').trim();
    if (!q){ this.ingResults = []; this.ingPageIndex = 0; this.recommendLabel = null; return; }
    const { data } = await this.supabase.searchIngredientsBasic(q);
    this.ingResults = Array.isArray(data) ? data : [];
    this.ingPageIndex = 0;
    // Recommend: among current result IDs, show the most used ingredient in product compositions
    try{
      const counts = await this.supabase.getCompositionCountsForIngredients(this.ingResults.map(r=>r.id));
      let bestId: string | null = null; let bestCnt = -1;
      for (const r of this.ingResults){ const c = (counts as any)[r.id] || 0; if (c > bestCnt){ bestCnt = c; bestId = r.id; } }
      const best = this.ingResults.find(r=>r.id===bestId);
      this.recommendLabel = best ? `${best.inci_name}${best.korean_name? ' ('+best.korean_name+')':''}` : null;
    }catch{ this.recommendLabel = null; }
  }
  ingPage(){ const start = this.ingPageIndex * 5; return this.ingResults.slice(start, start+5); }
  get ingPages(){ return Math.max(1, Math.ceil(this.ingResults.length / 5)); }
  prevIngPage(){ this.ingPageIndex = Math.max(0, this.ingPageIndex-1); this.pointer = 0; }
  nextIngPage(){ this.ingPageIndex = Math.min(this.ingPages-1, this.ingPageIndex+1); this.pointer = 0; }
  moveSearchPointer(delta:number){ const max = this.ingPage().length; this.pointer = Math.max(0, Math.min(max-1, this.pointer + delta)); }
  pickPointer(){ const row = this.ingPage()[this.pointer]; if (row) this.addIngredientToComposition(row); }
  addIngredientToComposition(row: { id: string; inci_name: string; korean_name?: string }){
    this.compositions.push({ ingredient_id: row.id, percent: null, note: '', inci_name: row.inci_name, korean_name: row.korean_name||'' });
    setTimeout(()=>{
      const inputs = Array.from(document.querySelectorAll('input[type="number"]')) as HTMLInputElement[];
      const last = inputs[inputs.length-1]; last?.focus();
    }, 0);
    this.saved = false;
  }

  // Composition table handlers
  openPicker(){
    this.pickerOpen = true;
    this.pickerQuery = '';
    this.pickerRows = [];
    this.pickerPointer = 0;
    setTimeout(()=>{
      const modalInput = document.querySelector('.modal input') as HTMLInputElement | null;
      modalInput?.focus();
      this.updateModalTop();
    }, 0);
  }
  private updateModalTop(){
    try{
      const table = (document.querySelector('.table-scroll') as HTMLElement);
      if (table){
        const rect = table.getBoundingClientRect();
        const desired = rect.bottom + 50; // 50px 아래
        // Clamp to viewport bottom with small margin
        const maxTop = Math.max(10, window.innerHeight - 100);
        this.modalTop = Math.min(desired, maxTop);
      } else { this.modalTop = 200; }
    }catch{ this.modalTop = 200; }
  }

  // Drag handlers for modal
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
      // viewport 내에서만 이동하도록 보정
      const newLeft = e.clientX - this.dragOffsetX;
      const newTop = e.clientY - this.dragOffsetY;
      const modal = document.querySelector('.modal') as HTMLElement | null;
      const width = modal?.offsetWidth || 920;
      const height = modal?.offsetHeight || 300;
      const minLeft = 0; const maxLeft = window.innerWidth - width;
      const minTop = 0; const maxTop = window.innerHeight - height;
      this.modalLeft = Math.max(minLeft, Math.min(maxLeft, newLeft));
      this.modalTop = Math.max(minTop, Math.min(maxTop, newTop));
    };
    const up = () => {
      this.dragging = false;
      document.removeEventListener('mousemove', move);
      document.removeEventListener('mouseup', up);
    };
    document.addEventListener('mousemove', move);
    document.addEventListener('mouseup', up);
  }
  closePicker(){ this.pickerOpen = false; }
  async runPickerSearch(){
    const q = (this.pickerQuery||'').trim();
    if (!q){
      // default showcase list (top 5) when no query
      const top5 = ['1,2-Hexanediol','Butylene Glycol','Ethylhexylglycerin','Sodium Hyaluronate','Water'];
      try{
        const { data } = await this.supabase.getIngredientsByNames(top5);
        this.pickerRows = data || [];
      }catch{ this.pickerRows = []; }
      return;
    }
    // reuse existing ingredient search; ideally include chinese_name, cas_no
    const { data } = await this.supabase.listIngredients({ page: 1, pageSize: 20, keyword: q, keywordOp: 'AND' }) as any;
    this.pickerRows = (data||[]).map((r:any)=>({ id: r.id, inci_name: r.inci_name, korean_name: r.korean_name, chinese_name: r.chinese_name, cas_no: r.cas_no }));
  }
  debouncedPickerSearch(){ if (this.pickerTimer) clearTimeout(this.pickerTimer); this.pickerTimer = setTimeout(()=> this.runPickerSearch(), 250); }
  addPicked(row:any){
    this.compositions.push({ ingredient_id: row.id, percent: null, note: '', inci_name: row.inci_name, korean_name: row.korean_name||'', cas_no: row.cas_no||'', chinese_name: row.chinese_name||'' } as any);
    // keep picker open; reset search to allow adding more items immediately
    this.pickerQuery = '';
    this.pickerRows = [];
    this.pickerPointer = 0;
    setTimeout(()=>{
      const modalInput = document.querySelector('.modal input') as HTMLInputElement | null;
      modalInput?.focus();
    }, 0);
    this.saved = false;
  }
  movePickerPointer(delta:number){ const max = this.pickerRows.length; if (!max) return; this.pickerPointer = Math.max(0, Math.min(max-1, this.pickerPointer + delta)); }
  onPickerEnter(ev: any){ if (ev?.preventDefault) ev.preventDefault(); const row = this.pickerRows[this.pickerPointer]; if (row) this.addPicked(row); }
  removeRow(row:any){ this.compositions = this.compositions.filter(r => r !== row); if (this.selectedComp===row) this.selectedComp=null; }
  removeSelected(){ if (!this.selectedComp) return; this.compositions = this.compositions.filter(r => r !== this.selectedComp); this.selectedComp = null; }
  onPercentChange(){ this.saved = false; }

  // Product search/pick handlers
  private productTimer: any = null;
  debouncedProductSearch(){
    if (this.productTimer) clearTimeout(this.productTimer);
    this.productTimer = setTimeout(() => this.runProductSearch(), 250);
  }
  async runProductSearch(){
    const q = (this.productQuery||'').trim();
    if (!q){ this.productResults = []; this.productPointer = 0; return; }
    const { data } = await this.supabase.quickSearchProducts(q);
    this.productResults = data || [];
    this.productPointer = 0;
  }
  async pickProduct(p: any){
    // load selected product
    try{
      const { data } = await this.supabase.getProduct(p.id);
      if (data){ this.model = data; this.id.set(p.id); this.saved = true; this.productResults = []; this.productQuery = `${p.product_code} · ${p.name_kr||''}`; }
    }catch{}
  }

  // Keyboard helpers for product picker
  moveProductPointer(delta:number){ const max = this.productResults.length; if (!max) return; this.productPointer = Math.max(0, Math.min(max-1, this.productPointer + delta)); }
  onProductEnter(ev:any){ if (ev?.preventDefault) ev.preventDefault(); const row = this.productResults[this.productPointer]; if (row) this.pickProduct(row); }
  onProductEsc(ev:any){ if (ev?.preventDefault) ev.preventDefault(); this.productQuery = ''; this.productResults = []; this.productPointer = 0; }

  async saveCompositions(){
    if (!this.id()) { alert('품목이 선택되지 않았습니다. 좌측에서 품목을 검색하여 선택해 주세요.'); this.saved = false; return; }
    try{
      for (const c of this.compositions){
        if (c.id){ await this.supabase.updateProductComposition(c.id, { percent: Number(c.percent)||0 }); }
        else if (c.ingredient_id){ await this.supabase.addProductComposition({ product_id: this.id()!, ingredient_id: c.ingredient_id, percent: Number(c.percent)||0 }); }
      }
      // Re-fetch compositions sorted by percent desc
      const { data: comps } = await this.supabase.listProductCompositions(this.id()!) as any;
      const mapped = (comps || []).map((c:any)=>({
        ...c,
        inci_name: (c.ingredient && c.ingredient.inci_name) || '',
        korean_name: (c.ingredient && c.ingredient.korean_name) || '',
        cas_no: (c.ingredient && c.ingredient.cas_no) || '',
      }));
      mapped.sort((a:any,b:any)=> (Number(b.percent)||0) - (Number(a.percent)||0));
      this.compositions = mapped as any;
      this.saved = true;
    }catch{ this.saved = false; }
  }
}


