import { Component, OnInit, signal, Directive, ElementRef, HostListener, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ErpDataService } from '../../services/erp-data.service';
import { AuthService } from '../../services/auth.service';

@Directive({
  selector: 'textarea[autoGrow]',
  standalone: true
})
export class AutoGrowDirective implements AfterViewInit {
  constructor(private elementRef: ElementRef<HTMLTextAreaElement>) {}
  ngAfterViewInit() { this.adjustHeight(); this.applyBaseStyles(); }
  @HostListener('input') onInput(){ this.adjustHeight(); }
  private applyBaseStyles(){
    const el = this.elementRef.nativeElement;
    el.style.overflow = 'hidden';
    el.style.resize = 'none';
  }
  private adjustHeight(){
    const el = this.elementRef.nativeElement;
    // Reset then grow to fit current content
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }
}

@Component({
  selector: 'app-ingredient-form',
  standalone: true,
  imports: [CommonModule, FormsModule, AutoGrowDirective],
  template: `
  <div class="form-page">
    <div class="page-head">
      <h2>Ingredient <span class="sub">성분등록</span></h2>
      <div class="spacer"></div>
      <button class="btn" (click)="createNew()">신규</button>
      <button class="btn primary" (click)="save()">저장</button>
      <button class="btn danger" *ngIf="id() && isAdmin()" (click)="deleteIngredient()">삭제</button>
    </div>

    <div class="content-layout">
      <!-- 왼쪽: 성분 검색 -->
      <aside class="search-panel">
        <div class="search-header">
          <svg class="search-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          <h3>성분 검색</h3>
        </div>
        <input class="search-input" [(ngModel)]="ingQuery" (focus)="onIngSearchFocus()" (keydown.arrowDown)="moveIngPointer(1)" (keydown.arrowUp)="moveIngPointer(-1)" (keydown.enter)="onIngEnterOrSearch($event)" (keydown.escape)="onIngEsc($event)" placeholder="INCI/성분명/CAS 검색 (공백=AND)" spellcheck="false" autocapitalize="none" autocomplete="off" autocorrect="off" />
        <ul class="search-results" *ngIf="ingResults.length">
          <li *ngFor="let r of ingResults; let i = index" [class.selected]="i===ingPointer" (click)="pickIngredient(r)">
            <div class="result-inci">{{ r.inci_name }}</div>
            <div class="result-details">
              {{ r.korean_name || '-' }}<span *ngIf="r.old_korean_name"> ({{ r.old_korean_name }})</span> · {{ r.cas_no || '-' }}
            </div>
          </li>
        </ul>
        <div class="search-empty" *ngIf="ingSearchExecuted && ingQuery && !ingResults.length">
          검색 결과가 없습니다
        </div>
      </aside>

      <!-- 오른쪽: 성분 정보 입력 -->
      <main class="form-main">
        <section class="form-body">
          <div class="grid">
            <label>화장품성분사전 성분코드</label>
            <input [(ngModel)]="model.ingredient_code" />
            <label>성분명</label>
            <textarea rows="1" autoGrow class="hl-green" [(ngModel)]="model.korean_name"></textarea>
            <label>구명칭</label>
            <textarea rows="1" autoGrow [(ngModel)]="model.old_korean_name"></textarea>
            <label>INCI Name</label>
            <textarea rows="1" autoGrow class="hl-green" [(ngModel)]="model.inci_name"></textarea>
            <label>중국성분명</label>
            <textarea rows="1" autoGrow [(ngModel)]="model.chinese_name"></textarea>
            <label>CAS No.</label>
            <input [(ngModel)]="model.cas_no" />
            <label>EINECS No.</label>
            <input [(ngModel)]="model.einecs_no" />
            <label>기원 및 정의</label>
            <textarea rows="1" autoGrow class="wide" [(ngModel)]="model.origin_definition" spellcheck="false"></textarea>
            <label>기능(KR)</label>
            <textarea rows="1" autoGrow class="wide" [(ngModel)]="model.function_kr"></textarea>
            <label>기능(EN)</label>
            <textarea rows="1" autoGrow class="wide" [(ngModel)]="model.function_en"></textarea>
            <label>Scientific Name</label>
            <textarea rows="1" autoGrow [(ngModel)]="model.scientific_name"></textarea>
            <label>원산지/ABS</label>
            <textarea rows="1" autoGrow [(ngModel)]="model.origin_abs"></textarea>
            <label>명칭변경이력</label>
            <textarea rows="1" autoGrow class="wide" [(ngModel)]="model.name_change_history" spellcheck="false"></textarea>
            <label>비고</label>
            <textarea rows="1" autoGrow class="wide" [(ngModel)]="model.remarks" spellcheck="false"></textarea>
          </div>
          <div class="meta" *ngIf="meta">
            <div>처음 생성: {{ meta.created_at | date:'yyyy-MM-dd HH:mm' }} · {{ meta.created_by_name || meta.created_by_email || meta.created_by || '-' }}</div>
            <div class="meta-row">
              <span>마지막 수정: {{ meta.updated_at | date:'yyyy-MM-dd HH:mm' }} · {{ meta.updated_by_name || meta.updated_by_email || meta.updated_by || '-' }}</span>
              <button class="btn mini" (click)="toggleHistory()">수정 이력</button>
            </div>
            <div class="history" *ngIf="showHistory">
              <div class="history-item" *ngFor="let h of changeLogs; let i = index">
                {{ i+1 }}. {{ h.time }} · {{ h.user }}
              </div>
              <div class="empty" *ngIf="!changeLogs?.length">이력이 없습니다.</div>
            </div>
          </div>
        </section>
      </main>
    </div>

    <div class="notice" *ngIf="notice()">{{ notice() }}</div>
  </div>
  `,
  styles: [`
  .form-page{ padding:10px 12px; }
  .page-head{ display:flex; align-items:center; gap:8px; margin-bottom:10px; }
  .page-head .sub{ font-size:14px; font-weight:700; margin-left:6px; color:#6b7280; }
  .page-head h2{ margin:0; font-size:20px; font-weight:800; }
  .page-head .spacer{ flex:1; }
  .btn{ height:28px; padding:0 10px; border-radius:8px; border:1px solid #d1d5db; background:#fff; cursor:pointer; font-size:12px; }
  .btn.primary{ background:#111827; color:#fff; border-color:#111827; }
  .btn.ghost{ background:#fff; color:#111827; }
  .notice{ margin:8px 0 0; padding:8px 10px; border:1px solid #bbf7d0; background:#ecfdf5; color:#065f46; border-radius:10px; font-size:12px; }
  
  /* Layout: 왼쪽 검색창 + 오른쪽 폼 */
  .content-layout{ display:grid; grid-template-columns:320px 1fr; gap:12px; }
  
  /* 왼쪽 검색 패널 */
  .search-panel{ background:#f9fafb; border:1px solid #e5e7eb; border-radius:12px; padding:12px; max-height:calc(100vh - 140px); overflow:hidden; display:flex; flex-direction:column; }
  .search-header{ display:flex; align-items:center; gap:8px; margin-bottom:10px; }
  .search-header .search-icon{ color:#6b7280; }
  .search-header h3{ margin:0; font-size:14px; font-weight:700; color:#111827; }
  .search-input{ width:100%; box-sizing:border-box; border:2px solid #3b82f6; border-radius:8px; padding:8px 12px; font-size:13px; background:#fff; margin-bottom:8px; }
  .search-input:focus{ outline:none; border-color:#2563eb; box-shadow:0 0 0 3px rgba(59,130,246,0.1); }
  .search-results{ list-style:none; margin:0; padding:0; overflow-y:auto; flex:1; }
  .search-results li{ padding:8px 10px; cursor:pointer; border-radius:6px; margin-bottom:4px; background:#fff; border:1px solid #e5e7eb; transition:all 0.15s; }
  .search-results li:hover{ background:#f0f9ff; border-color:#93c5fd; }
  .search-results li.selected{ background:#dbeafe; border-color:#3b82f6; }
  .result-inci{ font-weight:700; font-size:12px; color:#111827; margin-bottom:2px; }
  .result-details{ font-size:11px; color:#6b7280; }
  .search-empty{ text-align:center; padding:20px; color:#9ca3af; font-size:12px; }
  
  /* 오른쪽 폼 영역 */
  .form-main{ overflow:auto; max-height:calc(100vh - 140px); }
  .form-body{ border:1px solid #eef2f7; border-radius:12px; padding:12px; overflow:hidden; }
  /* Two columns per row: label+input, label+input */
  .grid{ display:grid; grid-template-columns:120px minmax(0,1fr) 120px minmax(0,1fr); gap:10px 14px; align-items:center; }
  .grid label{ font-size:11px; color:#111827; text-align:right; }
  input, textarea{ width:100%; border:1px solid #e5e7eb; border-radius:8px; padding:5px 7px; font-size:12px; color:#111827; box-sizing:border-box; }
  textarea{ white-space:normal; word-break:break-word; resize:none; overflow:hidden; min-height:28px; }
  /* Only textareas with .wide span remaining columns */
  .grid textarea.wide{ grid-column: 2 / span 3; }
  /* Highlight for INCI Name and 국문명 */
  .hl-green{ background:#ecfdf5; border-color:#bbf7d0; }
  .meta{ margin-top:12px; padding:8px 10px; border-top:1px dashed #e5e7eb; color:#6b7280; font-size:12px; }
  .meta .meta-row{ display:flex; align-items:center; gap:8px; }
  .history{ margin-top:8px; padding:8px 10px; background:#f9fafb; border:1px solid #e5e7eb; border-radius:8px; }
  .history-item{ font-size:11px; color:#374151; }
  
  /* 반응형: 작은 화면에서는 세로 배치 */
  @media (max-width: 1024px) {
    .content-layout{ grid-template-columns:1fr; }
    .search-panel{ max-height:300px; }
  }
  `]
})
export class IngredientFormComponent implements OnInit {
  id = signal<string | null>(null);
  model: any = {};
  meta: any = null;
  notice = signal<string | null>(null);
  showHistory = false;
  changeLogs: Array<{ user: string; time: string }> = [];
  private backParams: { q?: string; op?: 'AND'|'OR'; page?: number; size?: number } | null = null;
  // Bottom search states
  ingQuery: string = '';
  ingResults: Array<{ id: string; inci_name: string; korean_name?: string; old_korean_name?: string; cas_no?: string }> = [];
  ingPointer = -1;
  ingSearchExecuted = false; // Track if search has been executed
  userRole = signal<string | null>(null); // Current user's role
  
  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    // Ctrl+S (Windows/Linux) or Cmd+S (Mac) to save
    if ((event.ctrlKey || event.metaKey) && event.key === 's') {
      event.preventDefault();
      this.save();
    }
  }
  
  constructor(
    private route: ActivatedRoute, 
    private router: Router, 
    private erpData: ErpDataService,
    private auth: AuthService,
    private cdr: ChangeDetectorRef
  ) {}
  async ngOnInit(){
    // Load current user role
    try {
      const user = await this.auth.getCurrentUser();
      if (user?.id) {
        const { data: profile } = await this.auth.getUserProfile(user.id);
        this.userRole.set(profile?.role || null);
      }
    } catch {
      this.userRole.set(null);
    }

    // Remember list query params to preserve search state on back/cancel
    const qp = this.route.snapshot.queryParamMap;
    const q = qp.get('q') || undefined;
    const op = (qp.get('op') as ('AND'|'OR'|null)) || undefined;
    const page = Number(qp.get('page'));
    const size = Number(qp.get('size'));
    this.backParams = {
      q,
      op: op === 'AND' || op === 'OR' ? op : undefined,
      page: !Number.isNaN(page) && page > 0 ? page : undefined,
      size: !Number.isNaN(size) && size > 0 ? size : undefined,
    };

    const id = this.route.snapshot.queryParamMap.get('id');
    if (id) {
      this.id.set(id);
      const { data } = await this.erpData.getIngredient(id);
      this.model = data || {};
      this.meta = {
        created_at: data?.created_at,
        created_by: data?.created_by,
        created_by_name: data?.created_by_name,
        updated_at: data?.updated_at,
        updated_by: data?.updated_by,
        updated_by_name: data?.updated_by_name,
      };
      // Fallback: if names are missing, resolve emails from users table
      await this.resolveActorEmails();
      try{ this.changeLogs = await this.erpData.getIngredientChangeLogs(id); }catch{ this.changeLogs = []; }
    }
    // Preload search results when query exists from URL
    if ((this.backParams?.q || '').trim()) {
      this.ingQuery = (this.backParams?.q || '').trim();
      this.runIngQuickSearch();
    }
  }
  toggleHistory(){ this.showHistory = !this.showHistory; }
  async save(){
    const { data: user } = await this.auth.getClient().auth.getUser();
    const now = new Date().toISOString();
    
    // Trim all string fields in the model directly first
    const stringFields = [
      'ingredient_code', 'inci_name', 'korean_name', 'old_korean_name', 'chinese_name', 
      'cas_no', 'einecs_no', 'origin_definition', 'function_kr', 
      'function_en', 'scientific_name', 'origin_abs', 'name_change_history', 'remarks'
    ];
    
    // Apply trim to model
    stringFields.forEach(field => {
      if (typeof this.model[field] === 'string') {
        this.model[field] = this.model[field].trim();
      }
    });
    
    // Force immediate UI update with trimmed values
    this.cdr.detectChanges();
    
    // Check for duplicates before saving
    const ingredientCode = (this.model.ingredient_code || '').trim();
    const koreanName = (this.model.korean_name || '').trim();
    const inciName = (this.model.inci_name || '').trim();
    
    // 1. Check ingredient_code duplicate - show confirmation dialog
    if (ingredientCode) {
      const { data: codeCheck } = await this.erpData.checkIngredientCodeExists(ingredientCode, this.id() || undefined);
      if (codeCheck && codeCheck.exists) {
        const confirmed = confirm(`동일한 성분코드를 가진 성분이 이미 존재합니다.\n성분코드: ${ingredientCode}\n\n그래도 저장하시겠습니까?`);
        if (!confirmed) {
          return; // User cancelled, don't save
        }
      }
    }
    
    // 2. Check korean_name or inci_name individual duplicates - show confirmation dialog
    let koreanNameDuplicate = false;
    let inciNameDuplicate = false;
    
    if (koreanName) {
      const { data: koreanCheck } = await this.erpData.checkKoreanNameExists(koreanName, this.id() || undefined);
      koreanNameDuplicate = koreanCheck && koreanCheck.exists;
    }
    
    if (inciName) {
      const { data: inciCheck } = await this.erpData.checkInciNameExists(inciName, this.id() || undefined);
      inciNameDuplicate = inciCheck && inciCheck.exists;
    }
    
    if (koreanNameDuplicate || inciNameDuplicate) {
      let message = '중복된 정보가 있습니다.\n\n';
      if (koreanNameDuplicate) message += `성분명: ${koreanName}\n`;
      if (inciNameDuplicate) message += `INCI Name: ${inciName}\n`;
      message += '\n그래도 저장하시겠습니까?';
      
      const confirmed = confirm(message);
      if (!confirmed) {
        return; // User cancelled, don't save
      }
    }
    
    // 3. Check korean_name + inci_name combination - must be unique (cannot proceed)
    if (koreanName && inciName) {
      const { data: nameCheck } = await this.erpData.checkIngredientNameExists(koreanName, inciName, this.id() || undefined);
      if (nameCheck && nameCheck.exists) {
        alert(`이미 등록된 성분입니다.\n성분명: ${koreanName}\nINCI Name: ${inciName}\n\n성분명과 INCI Name 조합은 유니크해야 합니다.`);
        return;
      }
    }
    
    const row: any = { ...this.model };
    if (!row.id) row.id = crypto.randomUUID();
    if (!this.id()) {
      row.created_at = now;
      row.created_by = user.user?.id || null;
      row.created_by_name = user.user?.email || null;
    }
    row.updated_at = now;
    row.updated_by = user.user?.id || null;
    row.updated_by_name = user.user?.email || null;
    const { data: saved } = await this.erpData.upsertIngredient(row);
    // Stay on the form; update local state and URL (id) if needed
    const applied = saved || row;
    
    // Ensure all string fields are trimmed in the applied data as well
    stringFields.forEach(field => {
      if (typeof applied[field] === 'string') {
        applied[field] = applied[field].trim();
      }
    });
    
    // Update each field individually to ensure NgModel binding updates
    Object.keys(applied).forEach(key => {
      this.model[key] = applied[key];
    });
    
    this.id.set(applied.id || row.id);
    this.meta = {
      created_at: applied.created_at,
      created_by: applied.created_by,
      created_by_name: applied.created_by_name,
      updated_at: applied.updated_at,
      updated_by: applied.updated_by,
      updated_by_name: applied.updated_by_name,
    };
    
    // Force change detection again after DB save
    this.cdr.detectChanges();
    
    await this.resolveActorEmails();
    // Append change log entry (updated_by_name and time)
    try{
      const uid = user.user?.email || user.user?.id || 'user';
      const logs = Array.isArray(this.changeLogs) ? this.changeLogs.slice() : [];
      // Use local time (KST) string rather than UTC
      logs.push({ user: uid, time: this.formatLocalDateTime(new Date()) });
      this.changeLogs = logs;
      if (this.id()) await this.erpData.setIngredientChangeLogs(this.id()!, logs);
    }catch{}
    // Optionally reflect id in URL without leaving the form
    try { this.router.navigate([], { relativeTo: this.route, queryParams: { id: this.id() }, replaceUrl: true }); } catch {}
    // Show success notice
    this.notice.set('저장되었습니다.');
    setTimeout(() => this.notice.set(null), 2500);
  }
  private formatLocalDateTime(d: Date){
    const pad = (n:number)=> String(n).padStart(2,'0');
    const yyyy = d.getFullYear();
    const mm = pad(d.getMonth()+1);
    const dd = pad(d.getDate());
    const hh = pad(d.getHours());
    const mi = pad(d.getMinutes());
    const ss = pad(d.getSeconds());
    return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
  }
  createNew(){
    // Clear the form for new ingredient entry
    this.model = {};
    this.meta = null;
    this.id.set(null);
    this.ingQuery = '';
    this.ingResults = [];
    // Update URL to remove id parameter
    this.router.navigate([], { relativeTo: this.route, queryParams: {}, replaceUrl: true });
    this.notice.set(null);
  }
  
  cancel(){
    const queryParams: any = {};
    if (this.backParams?.q) queryParams.q = this.backParams.q;
    if (this.backParams?.op) queryParams.op = this.backParams.op;
    if (this.backParams?.page) queryParams.page = this.backParams.page;
    if (this.backParams?.size) queryParams.size = this.backParams.size;
    if (Object.keys(queryParams).length){
      this.router.navigate(['/app/ingredient'], { queryParams });
    } else {
      this.router.navigate(['/app/ingredient']);
    }
  }

  isAdmin(): boolean {
    return this.userRole() === 'admin';
  }

  async deleteIngredient(){
    if (!this.id()) return;
    
    const confirmed = confirm('이 성분을 삭제하시겠습니까?\n삭제 후에는 복구할 수 없습니다.');
    if (!confirmed) return;

    try {
      await this.erpData.deleteIngredient(this.id()!);
      this.notice.set('삭제되었습니다.');
      setTimeout(() => {
        // Navigate back to list
        const queryParams: any = {};
        if (this.backParams?.q) queryParams.q = this.backParams.q;
        if (this.backParams?.op) queryParams.op = this.backParams.op;
        if (this.backParams?.page) queryParams.page = this.backParams.page;
        if (this.backParams?.size) queryParams.size = this.backParams.size;
        if (Object.keys(queryParams).length){
          this.router.navigate(['/app/ingredient'], { queryParams });
        } else {
          this.router.navigate(['/app/ingredient']);
        }
      }, 1000);
    } catch (error: any) {
      alert('삭제 중 오류가 발생했습니다: ' + (error?.message || '알 수 없는 오류'));
    }
  }

  private async resolveActorEmails(){
    try{
      if (this.meta?.created_by && !this.meta?.created_by_name) {
        const { data: profile } = await this.auth.getUserProfile(this.meta.created_by);
        if (profile?.email) { this.meta.created_by_email = profile.email; if (!this.meta.created_by_name) this.meta.created_by_name = profile.email; }
        else if (profile?.name) { this.meta.created_by_name = profile.name; }
      }
      if (this.meta?.updated_by && !this.meta?.updated_by_name) {
        const { data: profile } = await this.auth.getUserProfile(this.meta.updated_by);
        if (profile?.email) { this.meta.updated_by_email = profile.email; if (!this.meta.updated_by_name) this.meta.updated_by_name = profile.email; }
        else if (profile?.name) { this.meta.updated_by_name = profile.name; }
      }
    } catch {}
  }

  // Bottom search bar behaviors (like product picker)
  debouncedIngTimer: any = null;
  debouncedIngSearch(){ if (this.debouncedIngTimer) clearTimeout(this.debouncedIngTimer); this.debouncedIngTimer = setTimeout(()=> this.runIngQuickSearch(), 250); }
  async runIngQuickSearch(){
    const q = (this.ingQuery||'').trim();
    if (!q){ this.ingResults = []; this.ingPointer = -1; this.ingSearchExecuted = false; return; }
    const { data } = await this.erpData.listIngredients({ page: 1, pageSize: 20, keyword: q, keywordOp: 'AND' }) as any;
    const rows = Array.isArray(data) ? data : [];
    this.ingResults = rows.map((r:any)=> ({ id: r.id, inci_name: r.inci_name, korean_name: r.korean_name, old_korean_name: r.old_korean_name, cas_no: r.cas_no }));
    this.ingPointer = -1; // Don't auto-select first item
    this.ingSearchExecuted = true; // Mark that search has been executed
  }
  moveIngPointer(delta:number){ 
    const max=this.ingResults.length; 
    if (!max) return; 
    if (this.ingPointer < 0) { 
      // Not in list yet - only go down (into list)
      if (delta > 0) this.ingPointer = 0;
      return; 
    }
    // In list - calculate new position
    const newPos = this.ingPointer + delta;
    if (newPos < 0) {
      // Going up from first item - return to search input
      this.ingPointer = -1;
    } else if (newPos >= max) {
      // Stay at last item
      this.ingPointer = max - 1;
    } else {
      this.ingPointer = newPos;
    }
  }
  onIngEnter(ev: Event){ if ((ev as any)?.preventDefault) (ev as any).preventDefault(); if (this.ingPointer>=0){ const row=this.ingResults[this.ingPointer]; if (row) this.pickIngredient(row); } }
  onIngSearchEnter(ev: Event){ if ((ev as any)?.preventDefault) (ev as any).preventDefault(); this.runIngQuickSearch(); }
  onIngEnterOrSearch(ev: Event){ 
    if ((ev as any)?.preventDefault) (ev as any).preventDefault(); 
    // Only select item if pointer is on an item (>=0)
    if (this.ingPointer >= 0 && this.ingResults[this.ingPointer]) { 
      this.pickIngredient(this.ingResults[this.ingPointer]); 
      return; 
    }
    // Otherwise, run search
    this.runIngQuickSearch(); 
  }
  onIngSearchFocus(){ 
    // When search input is focused, reset pointer to search field
    this.ingPointer = -1; 
  }
  onIngEsc(ev: Event){ if ((ev as any)?.preventDefault) (ev as any).preventDefault(); this.ingQuery=''; this.ingResults=[]; this.ingPointer=-1; this.ingSearchExecuted=false; }
  async pickIngredient(row: { id: string }){
    try{
      const { data } = await this.erpData.getIngredient(row.id);
      if (data){
        this.model = data;
        this.id.set(row.id);
        this.meta = {
          created_at: data.created_at,
          created_by: data.created_by,
          created_by_name: data.created_by_name,
          updated_at: data.updated_at,
          updated_by: data.updated_by,
          updated_by_name: data.updated_by_name,
        } as any;
        await this.resolveActorEmails();
        try{ this.changeLogs = await this.erpData.getIngredientChangeLogs(row.id); }catch{ this.changeLogs = []; }
        // Clear search state after selection
        this.ingQuery = '';
        this.ingResults = [];
        this.ingPointer = -1;
        this.ingSearchExecuted = false;
        // Reflect selected id in URL
        try { this.router.navigate([], { relativeTo: this.route, queryParams: { id: this.id() }, replaceUrl: true }); } catch {}
      }
    }catch{}
  }
}


