import { Component, computed, ElementRef, HostListener, inject, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RMD_FORM_CATEGORIES, RmdFormCategory, RmdFormItem } from './rmd-forms-data';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-rmd-forms',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styleUrls: ['../../standard/rmd/rmd-page.component.scss'],
  styles: [
    `:host .page{ display:grid; grid-template-columns: 280px 0.9fr minmax(420px, 46%); gap:16px; align-items:start; }
     :host aside.left{ grid-column:1; position:sticky; top:12px; align-self:start; }
     :host section.center{ grid-column:2; min-width:0; max-height: calc(100vh - 96px); overflow-y:auto; padding-right:8px; }
     :host main.right{ grid-column:3; min-width:0; max-height: calc(100vh - 96px); overflow-y:auto; padding-right:8px; }
     :host .filters .f-title{ display:block; margin:10px 0 6px; font-weight:600; }
     :host .results{ display:flex; flex-direction:column; gap:8px; margin-bottom:16px; }
     :host .record-item{ padding:12px; border:1px solid #e5e7eb; border-radius:10px; background:#fff; cursor:pointer; }
     :host .record-item:hover{ border-color:#cbd5e1; background:#f8fafc; }
     :host .record-head{ display:flex; gap:12px; align-items:center; }
     :host .record-id{ font-family:monospace; font-size:12px; color:#475569; }
     :host .record-title{ font-weight:600; }
     :host .meta{ margin-top:6px; display:flex; gap:6px; flex-wrap:wrap; }
     :host .chip{ font-size:12px; padding:2px 8px; border-radius:999px; background:#f1f5f9; color:#334155; }
     :host .detail-form{ display:grid; grid-template-columns: 1fr 1fr; gap:12px; margin-bottom:12px; }
     :host .detail-form label{ font-size:12px; color:#475569; display:block; margin-bottom:4px; }
     :host .section-title{ font-weight:700; margin:4px 0 8px; }
     :host .section-row{ display:flex; align-items:center; justify-content:space-between; gap:12px; }
     :host .saved-badge{ font-size:12px; color:#16a34a; margin-left:8px; }
     :host .pdf-zone{ margin-top:14px; }
     :host .pdf-actions{ display:flex; gap:8px; align-items:center; }
     :host .pdf-view{ margin-top:10px; width:100%; height:70vh; border:1px solid #e5e7eb; border-radius:8px; background:#fff; }
     :host .dropbox{ margin-top:8px; border:2px dashed #cbd5e1; border-radius:10px; padding:12px; display:flex; align-items:center; gap:8px; cursor:pointer; background:#f8fafc; }
     :host .dropbox.dragover{ background:#eef2ff; border-color:#93c5fd; }
     :host .file-pill{ display:inline-flex; align-items:center; gap:6px; padding:4px 10px; border-radius:999px; background:#e2e8f0; }
     :host .file-pill button{ border:0; background:transparent; color:#ef4444; cursor:pointer; }
    `
  ],
  template: `
  <div class="page">
    <aside class="left" style="flex:0 0 280px; max-width:280px;">
      <div class="sticky">
        <h2>Record <small class="sub">원료제조팀</small></h2>
        <div class="search">
          <input type="search" placeholder="키워드로 검색" [ngModel]="query()" (ngModelChange)="query.set($event)">
          <button class="clear" *ngIf="query()" (click)="query.set('')">×</button>
        </div>
        <div class="filters">
          <label class="f-title">담당부서로 검색</label>
          <select [ngModel]="dept()" (ngModelChange)="dept.set($event); onFiltersChanged()">
            <option value="">전체</option>
            <option *ngFor="let d of departments" [value]="d">{{ d }}</option>
          </select>
          <label class="f-title">담당자로 검색</label>
          <input type="text" [ngModel]="owner()" (ngModelChange)="owner.set($event); onFiltersChanged()" placeholder="이름/이메일">
          <label class="f-title">기록방법으로 검색</label>
          <select [ngModel]="method()" (ngModelChange)="method.set($event); onFiltersChanged()">
            <option value="">전체</option>
            <option *ngFor="let m of methods" [value]="m">{{ m }}</option>
          </select>
          <label class="f-title">기록주기로 검색</label>
          <select [ngModel]="period()" (ngModelChange)="period.set($event); onFiltersChanged()">
            <option value="">전체</option>
            <option *ngFor="let p of periods" [value]="p">{{ p }}</option>
          </select>
          <label class="inline"><input type="checkbox" [ngModel]="overdueOnly()" (ngModelChange)="overdueOnly.set($event); onFiltersChanged()"> 기록주기가 지난 것만</label>
          <label class="f-title">연결된 규정으로 검색</label>
          <select [ngModel]="standard()" (ngModelChange)="standard.set($event); onFiltersChanged()">
            <option value="">전체</option>
            <option *ngFor="let s of standardItems" [value]="s">{{ s }}</option>
          </select>
          <label class="f-title">규정 카테고리로 검색</label>
          <select [ngModel]="standardCategory()" (ngModelChange)="standardCategory.set($event); onFiltersChanged()">
            <option value="">전체</option>
            <option *ngFor="let c of categoriesOnly" [value]="c">{{ c }}</option>
          </select>
        </div>
      </div>
    </aside>

    <section class="center">
      <section class="results">
        <div class="record-item" *ngFor="let r of filteredFlat()" (click)="open(r)">
          <div class="record-head">
            <span class="record-id">{{ r.id }}</span>
            <span class="record-title">{{ r.title }}</span>
          </div>
          <div class="meta">
            <span class="chip">부서: {{ r.department || '원료제조팀' }}</span>
            <span class="chip" *ngIf="r.owner">담당자: {{ r.owner }}</span>
            <span class="chip" *ngIf="r.method">방법: {{ r.method }}</span>
            <span class="chip" *ngIf="r.period">주기: {{ r.period }}</span>
            <span class="chip" *ngIf="r.standard">규정: {{ r.standard }}</span>
            <span class="chip">카테고리: {{ r.standardCategory }}</span>
          </div>
        </div>
      </section>
    </section>

    <main class="right">
      <div class="toolbar">
        <h3 *ngIf="selected(); else choose"> {{ selected()?.title }} </h3>
        <div class="spacer"></div>
      </div>
      <ng-template #choose><h3>좌측에서 항목을 선택하세요.</h3></ng-template>
      <section class="content">
        <div *ngIf="selected() as sel">
          <div class="section-row">
            <div class="section-title">기록 정보</div>
            <div>
              <button class="primary" [disabled]="isSavingMeta" (click)="saveMeta(sel)">{{ isSavingMeta ? '저장중…' : '저장' }}</button>
              <span class="saved-badge" *ngIf="metaJustSaved">저장됨</span>
            </div>
          </div>
          <div class="detail-form" (ngModelChange)="persistMeta(sel)">
            <div>
              <label>담당부서</label>
              <select [(ngModel)]="sel.department" (ngModelChange)="persistMeta(sel)">
                <option *ngFor="let d of departments" [value]="d">{{ d }}</option>
              </select>
            </div>
            <div>
              <label>담당자</label>
              <input type="text" [(ngModel)]="sel.owner" (ngModelChange)="persistMeta(sel)" placeholder="이름/이메일">
            </div>
            <div>
              <label>기록방법</label>
              <select [(ngModel)]="sel.method" (ngModelChange)="persistMeta(sel)">
                <option *ngFor="let m of methods" [value]="m">{{ m }}</option>
              </select>
            </div>
            <div>
              <label>기록주기</label>
              <select [(ngModel)]="sel.period" (ngModelChange)="persistMeta(sel)">
                <option *ngFor="let p of periods" [value]="p">{{ p }}</option>
              </select>
            </div>
            <div>
              <label>연결된 규정</label>
              <select [(ngModel)]="sel.standard" (ngModelChange)="persistMeta(sel)">
                <option value="">선택</option>
                <option *ngFor="let s of standardItems" [value]="s">{{ s }}</option>
              </select>
            </div>
            <div>
              <label>규정 카테고리</label>
              <select [(ngModel)]="sel.standardCategory" (ngModelChange)="persistMeta(sel)">
                <option *ngFor="let c of categoriesOnly" [value]="c">{{ c }}</option>
              </select>
            </div>
          </div>
          <div class="pdf-zone">
            <div class="section-title">첨부 PDF</div>
            <div class="pdf-actions">
              <div class="dropbox" [class.dragover]="dragOver"
                   (click)="fileInput.click()"
                   (dragover)="$event.preventDefault(); dragOver=true"
                   (dragleave)="dragOver=false"
                   (drop)="onDrop($event)">
                <span>여기로 드래그하거나 클릭하여 PDF 첨부</span>
                <input #fileInput type="file" accept="application/pdf" (change)="onPdfPick($event)" style="display:none" />
              </div>
              <div *ngIf="recordPdfs.length" style="margin-top:8px; display:flex; gap:8px; flex-wrap:wrap;">
                <a class="file-pill" *ngFor="let p of recordPdfs" [href]="p.url" target="_blank" rel="noopener">
                  <span>{{ p.name }}</span>
                  <button type="button" title="삭제" (click)="$event.preventDefault(); removePdf(p)">×</button>
                </a>
              </div>
            </div>
            <iframe *ngIf="selectedPdfPath" class="pdf-view" [src]="selectedPdfPath"></iframe>
          </div>
          <ng-container *ngIf="sel.id==='BF-RMD-PM-IR-07'; else genericInfo">
            <div class="th-toolbar">
              <div class="group">
                <button class="nav pill" title="이전 월" (click)="nudgeDate(-1,'month')"><span class="chev">‹</span><span class="lab">월</span></button>
                <button class="nav pill" title="이전 주" (click)="nudgeDate(-1,'week')"><span class="chev">‹</span><span class="lab">주</span></button>
                <button class="nav pill" title="이전 일" (click)="nudgeDate(-1,'day')"><span class="chev">‹</span><span class="lab">일</span></button>
                <input class="date" type="date" [ngModel]="dateValue()" (ngModelChange)="setDate($event)" />
                <button class="nav pill" title="다음 일" (click)="nudgeDate(1,'day')"><span class="lab">일</span><span class="chev">›</span></button>
                <button class="nav pill" title="다음 주" (click)="nudgeDate(1,'week')"><span class="lab">주</span><span class="chev">›</span></button>
                <button class="nav pill" title="다음 월" (click)="nudgeDate(1,'month')"><span class="lab">월</span><span class="chev">›</span></button>
              </div>
              <div class="group admin">
                <label class="label">기록주기</label>
                <select class="gran" [ngModel]="granularity()" (ngModelChange)="setGranularity($event)" [disabled]="!isAdmin">
                  <option value="month">월</option>
                  <option value="week">주</option>
                  <option value="day">일</option>
                </select>
              </div>
              <div class="group buttons">
                <div class="group tools">
                  <button class="secondary" [class.active]="tool()==='pen'" (click)="togglePenMenu()">펜</button>
                  <div class="tool-menu" *ngIf="showPenMenu()">
                    <div class="row">
                      <span>색상</span>
                      <button class="swatch" *ngFor="let c of penColors"
                        [style.background]="c"
                        (click)="setPenColor(c)"
                        [style.boxShadow]="penColor()===c ? ('0 0 0 4px ' + c + '55') : 'none'"
                        [style.transform]="penColor()===c ? 'scale(1.08)' : 'scale(1)'"
                        [attr.aria-label]="c"></button>
                    </div>
                    <div class="row">
                      <span>굵기</span>
                      <select [ngModel]="penWidth()" (ngModelChange)="setPenWidth($event)">
                        <option *ngFor="let w of penWidths" [value]="w">{{w}}px</option>
                      </select>
                    </div>
                  </div>
                  <button class="secondary" [class.active]="tool()==='eraser'" (click)="toggleEraserMenu()">지우개</button>
                  <div class="tool-menu" *ngIf="showEraserMenu()">
                    <div class="row">
                      <span>굵기</span>
                      <select [ngModel]="eraserWidth()" (ngModelChange)="setEraserWidth($event)">
                        <option *ngFor="let w of eraserWidths" [value]="w">{{w}}px</option>
                      </select>
                    </div>
                  </div>
                </div>
                <button class="secondary" (click)="closeToolMenus(); clearToday()">지우기</button>
                <button class="secondary" (click)="closeToolMenus(); loadRecord()">불러오기</button>
                <button class="primary" (click)="closeToolMenus(); saveRecord()">저장</button>
                <button class="secondary" (click)="closeToolMenus(); printRecord()">인쇄</button>
                <button class="secondary" (click)="toggleFullscreen()">전체화면</button>
              </div>
            </div>
            <div class="pdf-annotator" #container [class.fullscreen]="fullscreen()">
              <button *ngIf="fullscreen()" class="fs-exit" (click)="toggleFullscreen()">닫기</button>
              <canvas #pdfCanvas></canvas>
              <canvas #drawCanvas
                (pointerdown)="onPointerDown($event)" (pointermove)="onPointerMove($event)" (pointerup)="onPointerUp()" (pointercancel)="onPointerUp()"
                (touchstart)="$event.preventDefault()" (touchmove)="$event.preventDefault()" (touchend)="$event.preventDefault()"></canvas>
            </div>
          </ng-container>
          <ng-template #genericInfo>
            <p>문서번호: {{ sel.id }}</p>
            <p>문서명: {{ sel.title }}</p>
            <p class="muted">문서 스캔 또는 PDF 양식을 연결해 주세요.</p>
          </ng-template>
        </div>
      </section>
    </main>
  </div>
  `,
})
export class RmdFormsComponent {
  categories: RmdFormCategory[] = RMD_FORM_CATEGORIES;
  query = signal('');
  selected = signal<RmdFormItem | null>(null);
  // Filters
  departments: string[] = ['원료제조팀','식물세포배양팀','품질팀','연구팀','경영지원팀'];
  methods: string[] = ['ERP','QMS','NAS','OneNote','Paper'];
  periods: string[] = ['일','주','월','년','갱신주기'];
  standardItems: string[] = [
    '원료제조팀 규정 1','원료제조팀 규정 2','원료제조팀 규정 3'
  ];
  categoriesOnly: string[] = this.categories.map(c=>c.category);
  dept = signal<string>('');
  owner = signal<string>('');
  method = signal<string>('');
  period = signal<string>('');
  overdueOnly = signal<boolean>(false);
  standard = signal<string>('');
  standardCategory = signal<string>('');
  constructor(private supabase: SupabaseService){}

  filtered = computed(() => {
    const q = this.query().trim().toLowerCase();
    const base = this.categories.map(cat => ({
      ...cat,
      items: cat.items.filter(i => {
        const byKeyword = !q || i.id.toLowerCase().includes(q) || i.title.toLowerCase().includes(q);
        const byDept = !this.dept() || ((i as any).department || '원료제조팀') === this.dept();
        const byOwner = !this.owner() || ((i as any).owner || '').toLowerCase().includes(this.owner().toLowerCase());
        const byMethod = !this.method() || (i as any).method === this.method();
        const byPeriod = !this.period() || (i as any).period === this.period();
        const byStandard = !this.standard() || ((i as any).standard || '').toLowerCase().includes(this.standard().toLowerCase());
        const stdCat = ((i as any).standardCategory || cat.category) as string;
        const byStdCat = !this.standardCategory() || stdCat.toLowerCase() === this.standardCategory().toLowerCase();
        // overdueOnly flag is placeholder; in real data you'd check due dates
        const byOverdue = !this.overdueOnly() || !!(i as any).overdue;
        return byKeyword && byDept && byOwner && byMethod && byPeriod && byStandard && byStdCat && byOverdue;
      })
    })).filter(cat => cat.items.length > 0);
    return base;
  });

  onFiltersChanged(){ /* signals trigger recompute automatically */ }

  ngOnInit(){
    // Load meta from DB; fallback to localStorage
    queueMicrotask(async ()=>{
      try{
        const all = await this.supabase.listAllFormMeta();
        const byId: Record<string, any> = {};
        for(const row of all as any[]){ if(row?.form_id) byId[row.form_id] = row; }
        for(const cat of this.categories){ for(const it of cat.items as any[]){ const m = byId[it.id]; if(m) Object.assign(it, m); } }
      }catch{
        try{
          const raw = localStorage.getItem('rmd_forms_meta');
          if(raw){ const map = JSON.parse(raw) as Record<string, any>; for(const cat of this.categories){ for(const it of cat.items as any[]){ const m = map[it.id]; if(m) Object.assign(it, m); } } }
        }catch{}
      }
      // Deep-link open by id (e.g., ?open=ISO-9001)
      try{
        const params = new URLSearchParams(location.search);
        const openId = params.get('open');
        if (openId){
          const target = this.filteredFlat().find(r => r.id === openId);
          if (target){ this.open(target); }
        }
      }catch{}
    });
  }

  persistMeta(it: any){
    try{
      const raw = localStorage.getItem('rmd_forms_meta');
      const map = raw ? JSON.parse(raw) : {};
      map[it.id] = { department: it.department, owner: it.owner, method: it.method, period: it.period, standard: it.standard, standardCategory: it.standardCategory };
      localStorage.setItem('rmd_forms_meta', JSON.stringify(map));
    }catch{}
    // Debounced DB upsert
    this.scheduleUpsert(it);
  }

  private upsertTimer?: any;
  private scheduleUpsert(it: any){
    clearTimeout(this.upsertTimer);
    this.upsertTimer = setTimeout(async () => {
      try{
        await this.supabase.upsertFormMeta({
          form_id: it.id,
          department: it.department || null,
          owner: it.owner || null,
          method: it.method || null,
          period: it.period || null,
          standard: it.standard || null,
          standard_category: it.standardCategory || null,
        });
      }catch{}
    }, 300);
  }

  // ===== PDF handling =====
  recordPdfs: Array<{ name: string; path: string; url: string }> = [];
  selectedPdfPath: string = '';
  isSavingMeta = false;
  metaJustSaved = false;
  dragOver = false;

  async saveMeta(sel: any){
    try{
      this.isSavingMeta = true; this.metaJustSaved = false;
      await this.supabase.upsertFormMeta({
        form_id: sel.id,
        department: sel.department || null,
        owner: sel.owner || null,
        method: sel.method || null,
        period: sel.period || null,
        standard: sel.standard || null,
        standard_category: sel.standardCategory || null,
      });
      this.metaJustSaved = true;
      setTimeout(()=> this.metaJustSaved = false, 1500);
    }finally{ this.isSavingMeta = false; }
  }

  private async refreshPdfList(){
    const sel = this.selected(); if(!sel) return;
    this.recordPdfs = await this.supabase.listRecordPdfs(sel.id);
    if (this.recordPdfs.length && !this.selectedPdfPath){ this.selectedPdfPath = this.recordPdfs[0].url; }
  }
  async onPdfPick(ev: Event){
    const input = ev.target as HTMLInputElement; const f = input?.files?.[0]; if(!f || !this.selected()) return;
    await this.supabase.uploadRecordPdf(f, this.selected()!.id);
    await this.refreshPdfList();
  }
  async onDrop(ev: DragEvent){
    ev.preventDefault(); this.dragOver = false; const file = ev.dataTransfer?.files?.[0]; if(!file || !this.selected()) return;
    if (file.type !== 'application/pdf') return;
    await this.supabase.uploadRecordPdf(file, this.selected()!.id);
    await this.refreshPdfList();
  }
  async removePdf(p: { path: string }){
    try{ await this.supabase.deleteRecordPdf(p.path); }catch{}
    await this.refreshPdfList();
  }

  filteredFlat = computed<RmdFormItem[]>(() => {
    const cats = this.filtered();
    const flat: RmdFormItem[] = [];
    for(const cat of cats){
      for(const it of cat.items){
        flat.push({ ...(it as any), standardCategory: (it as any).standardCategory || cat.category, department: (it as any).department || '원료제조팀' });
      }
    }
    return flat.sort((a,b)=> a.id.localeCompare(b.id));
  });

  async open(it: RmdFormItem){
    this.selected.set(it);
    await this.refreshPdfList();
    if (it.id === 'BF-RMD-PM-IR-07'){
      try{
        const today = new Date().toISOString().slice(0,10);
        // View가 렌더된 다음에 날짜/렌더/불러오기를 실행 (container가 아직 없을 수 있음)
        setTimeout(async () => {
          await this.setDate(today);
          const list = await this.supabase.listThWeeks(it.id);
          this.recordedWeeks = signal<string[]>((list.data||[]).map((r:any)=> r.week_start));
        }, 0);
      }catch{}
    }
  }
  // ===== Temperature/Humidity PDF Annotator =====
  @ViewChild('container', { static: false }) containerRef?: ElementRef<HTMLDivElement>;
  @ViewChild('pdfCanvas', { static: false }) pdfCanvasRef?: ElementRef<HTMLCanvasElement>;
  @ViewChild('drawCanvas', { static: false }) drawCanvasRef?: ElementRef<HTMLCanvasElement>;

  // selected date from calendar
  dateValue = signal<string>(new Date().toISOString().slice(0,10));
  // computed period start based on granularity
  periodStartSig = signal<string>(RmdFormsComponent.toMonday(new Date()));
  granularity = signal<'day'|'week'|'month'>( (localStorage.getItem('th_granularity') as any) || 'day');
  isAdmin = false;
  recordedWeeks = signal<string[]>([]);
  fullscreen = signal<boolean>(false);
  tool = signal<'pen'|'eraser'>('pen');
  showPenMenu = signal<boolean>(false);
  showEraserMenu = signal<boolean>(false);
  penColors = ['#111827','#ef4444','#f59e0b','#10b981','#3b82f6','#8b5cf6'];
  penWidths = [2,3,4,6,8,10,12];
  eraserWidths = [6,8,10,14,20,28];
  penColor = signal<string>('#111827');
  penWidth = signal<number>(3);
  eraserWidth = signal<number>(14);
  private drawing = false;
  private ctxDraw?: CanvasRenderingContext2D | null;
  private pdfCtx?: CanvasRenderingContext2D | null;
  private strokesByDate: Record<string, { points: {x:number;y:number;}[]; width:number; color:string; }[]> = {};
  private legacyStrokes: { points: {x:number;y:number;}[]; width:number; color:string; }[] | null = null;
  private currentStroke: { points: {x:number;y:number;}[]; width:number; color:string; } | null = null;

  // Week starts on Sunday as requested
  static toMonday(d: Date){ const dt = new Date(d); const day = dt.getDay(); const diff = 0 - day; dt.setDate(dt.getDate()+diff); return dt.toISOString().slice(0,10); }
  static toMonthStart(d: Date){ const dt = new Date(d.getFullYear(), d.getMonth(), 1); return dt.toISOString().slice(0,10); }
  private computePeriodStart(dateStr: string){
    const d = new Date(dateStr);
    switch(this.granularity()){
      case 'day': return dateStr;
      case 'week': return RmdFormsComponent.toMonday(d);
      case 'month': return RmdFormsComponent.toMonthStart(d);
    }
  }

  async setDate(v: string){
    if(!v) return;
    this.dateValue.set(v);
    this.periodStartSig.set(this.computePeriodStart(v));
    await this.renderPdf();
    await this.loadRecord();
  }
  hasRecord(ymd: string){ return this.recordedWeeks().includes(ymd); }
  periodStart(){ return this.periodStartSig(); }
  setGranularity(val: 'day'|'week'|'month'){ this.granularity.set(val); localStorage.setItem('th_granularity', val); this.periodStartSig.set(this.computePeriodStart(this.dateValue())); this.renderPdf(); this.loadRecord(); }
  async nudgeDate(delta: number, unit: 'day'|'week'|'month'){
    const d = new Date(this.dateValue());
    if (unit==='day') d.setDate(d.getDate()+delta);
    if (unit==='week') d.setDate(d.getDate()+delta*7);
    if (unit==='month') d.setMonth(d.getMonth()+delta);
    await this.setDate(d.toISOString().slice(0,10));
  }
  // Removed jumpRecord in favor of explicit day/week/month nudges

  closeToolMenus(){ this.showPenMenu.set(false); this.showEraserMenu.set(false); }

  togglePenMenu(){ this.tool.set('pen'); this.showPenMenu.set(!this.showPenMenu()); this.showEraserMenu.set(false); }
  toggleEraserMenu(){ this.tool.set('eraser'); this.showEraserMenu.set(!this.showEraserMenu()); this.showPenMenu.set(false); }
  setPenColor(c: string){ this.penColor.set(c); this.ctxDraw && (this.ctxDraw.strokeStyle = c); }
  setPenWidth(w: number){ this.penWidth.set(+w); this.ctxDraw && (this.ctxDraw.lineWidth = +w); }
  setEraserWidth(w: number){ this.eraserWidth.set(+w); }

  ngAfterViewInit(){
    queueMicrotask(async ()=>{
      try{ const u = await this.supabase.getCurrentUser(); if(u){ const { data } = await this.supabase.getUserProfile(u.id); this.isAdmin = (data?.role==='admin'||data?.role==='manager'); } }catch{}
      this.periodStartSig.set(this.computePeriodStart(this.dateValue()));
      await this.renderPdf();
      await this.loadRecord();
    });
  }

  @HostListener('window:resize') onResize(){ if(this.fullscreen()) this.renderPdf(); }

  private async renderPdf(){
    if (!this.selected() || this.selected()!.id !== 'BF-RMD-PM-IR-07') return;
    const container = this.containerRef?.nativeElement; if(!container) return;
    const pdfCanvas = this.pdfCanvasRef?.nativeElement; const drawCanvas = this.drawCanvasRef?.nativeElement;
    if(!pdfCanvas || !drawCanvas) return;

    // Target size: fit within container (or viewport if fullscreen) while preserving A4 ratio (sqrt(2) ≈ 1.414)
    let width: number; let height: number;
    if (this.fullscreen()) {
      const vw = Math.max(320, (globalThis.innerWidth || 1024) - 32);
      const vh = Math.max(320, (globalThis.innerHeight || 768) - 32);
      width = Math.min(vw, Math.floor(vh / 1.414));
      height = Math.floor(width * 1.414);
    } else {
      width = Math.min(900, container.clientWidth || 900);
      height = Math.floor(width * 1.414);
    }
    [pdfCanvas, drawCanvas].forEach(c=>{ c.width = width; c.height = height; c.style.width = width+'px'; c.style.height = height+'px'; });
    this.pdfCtx = pdfCanvas.getContext('2d');
    this.ctxDraw = drawCanvas.getContext('2d');
    if (this.ctxDraw){
      this.ctxDraw.lineCap='round'; this.ctxDraw.lineJoin='round';
      this.ctxDraw.strokeStyle = this.penColor();
      this.ctxDraw.lineWidth = this.penWidth();
    }

    // Try to draw from image first for best performance on iPad; fallback to PDF
    const imageCandidates = [
      '/forms/th-record-sheet.png',
      '/forms/Temperature%20and%20Humidity%20Record%20Sheet.png',
      '/asset/th-record-sheet.png',
      '/asset/Temperature%20and%20Humidity%20Record%20Sheet.png',
      '/forms/th-record-sheet.jpg',
      '/asset/th-record-sheet.jpg'
    ];
    let drawn = false;
    for(const url of imageCandidates){
      try{
        // eslint-disable-next-line no-await-in-loop
        await this.drawImageBackground(url, pdfCanvas);
        drawn = true; break;
      }catch{ /* try next */ }
    }
    if(!drawn){
      try{
        const pdfjs = await this.ensurePdfjs();
        (pdfjs as any).GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.6.82/build/pdf.worker.min.js';
        const pdfPaths = [
          '/asset/th-record-sheet.pdf',
          '/asset/Temperature%20and%20Humidity%20Record%20Sheet.pdf'
        ];
        let ok = false;
        for(const p of pdfPaths){
          try{
            // eslint-disable-next-line no-await-in-loop
            const loadingTask = (pdfjs as any).getDocument(p);
            // eslint-disable-next-line no-await-in-loop
            const pdf = await loadingTask.promise; ok = true;
            const page = await pdf.getPage(1);
            const viewport = page.getViewport({ scale: width / page.getViewport({ scale: 1 }).width });
            const ctx = this.pdfCtx!;
            await page.render({ canvasContext: ctx as any, viewport }).promise;
            break;
          }catch{ /* try next */ }
        }
        if(!ok) throw new Error('no pdf');
      }catch{
        const ctx = this.pdfCtx!; ctx.fillStyle = '#f1f5f9'; ctx.fillRect(0,0,pdfCanvas.width,pdfCanvas.height);
        ctx.fillStyle = '#64748b'; ctx.fillText('양식 배경을 찾을 수 없습니다. /forms/th-record-sheet.png 또는 /asset/th-record-sheet.pdf 를 배치하세요.', 20, 30);
      }
    }
    // Clear drawing layer for new week
    this.clearCanvas(false);
  }

  onPointerDown(ev: PointerEvent){
    if (!this.drawCanvasRef) return;
    const canvas = this.drawCanvasRef.nativeElement; this.drawing = true; canvas.setPointerCapture(ev.pointerId);
    const {x,y} = this.localPoint(canvas, ev);
    this.closeToolMenus();
    if (this.tool()==='eraser' && this.ctxDraw){
      const w = this.eraserWidth();
      this.ctxDraw.save();
      this.ctxDraw.globalCompositeOperation = 'destination-out';
      this.ctxDraw.lineWidth = w; this.ctxDraw.strokeStyle = 'rgba(0,0,0,1)';
      this.currentStroke = { points:[{x,y}], width: w, color: 'eraser' } as any;
    } else {
      if (this.ctxDraw){ this.ctxDraw.globalCompositeOperation = 'source-over'; this.ctxDraw.lineWidth = this.penWidth(); this.ctxDraw.strokeStyle = this.penColor(); }
      this.currentStroke = { points:[{x,y}], width: this.ctxDraw?.lineWidth||3, color: this.ctxDraw?.strokeStyle as string || '#111827' };
    }
  }
  onPointerMove(ev: PointerEvent){ if(!this.drawing || !this.drawCanvasRef || !this.ctxDraw || !this.currentStroke) return; const canvas=this.drawCanvasRef.nativeElement; const {x,y}=this.localPoint(canvas,ev); const pts=this.currentStroke.points; const last=pts[pts.length-1]; if(Math.hypot(x-last.x,y-last.y)<0.8) return; pts.push({x,y}); this.ctxDraw.beginPath(); this.ctxDraw.moveTo(last.x,last.y); this.ctxDraw.lineTo(x,y); this.ctxDraw.stroke(); }
  onPointerUp(){ if(!this.drawing) return; this.drawing=false; if(this.currentStroke){ if(this.ctxDraw){ this.ctxDraw.restore?.(); } const key=this.dateValue(); if(!this.strokesByDate[key]) this.strokesByDate[key]=[]; this.strokesByDate[key].push(this.currentStroke); this.currentStroke=null; } }
  private localPoint(canvas: HTMLCanvasElement, ev: PointerEvent){ const rect = canvas.getBoundingClientRect(); return { x: (ev.clientX - rect.left) * (canvas.width/rect.width), y: (ev.clientY - rect.top) * (canvas.height/rect.height) }; }

  clearCanvas(resetStrokes: boolean = true){ if(this.ctxDraw && this.drawCanvasRef){ this.ctxDraw.clearRect(0,0,this.drawCanvasRef.nativeElement.width,this.drawCanvasRef.nativeElement.height); } if(resetStrokes){ this.strokesByDate[this.dateValue()] = []; } }

  // 지우기: 오늘 날짜의 스트로크만 제거하고 이전 누적은 유지(주/월 단위 대비)
  clearToday(){ this.clearCanvas(true); }

  async saveRecord(){
    const ymd = this.periodStart();
    try{
      // Double-confirm if a record already exists for this date
      const chk = await this.supabase.getThRecord(this.selected()!.id, ymd);
      if (chk.data) {
        const first = globalThis.confirm('해당 날짜에 기존 기록이 있습니다. 덮어쓰시겠습니까?');
        if (!first) return;
        const second = globalThis.confirm('정말로 덮어쓰기 하시겠습니까? 이 작업은 되돌릴 수 없습니다.');
        if (!second) return;
      }

      const merged = document.createElement('canvas');
      const pdfC = this.pdfCanvasRef!.nativeElement; const drawC = this.drawCanvasRef!.nativeElement;
      merged.width = pdfC.width; merged.height = pdfC.height; const mctx = merged.getContext('2d')!;
      mctx.drawImage(pdfC, 0, 0); mctx.drawImage(drawC, 0, 0);
      const blob: Blob = await new Promise(res=> merged.toBlob(b=>res(b!), 'image/png'));
      const path = `th/${ymd}.png`;
      let publicUrl: string | null = null;
      try{
        const up = await this.supabase.uploadRecordImage(blob, path);
        publicUrl = up.publicUrl;
      }catch(err:any){
        // Storage 업로드가 실패해도 DB에는 필기(strokes)만 저장되도록 진행합니다.
      }
      // If we loaded legacy array-only strokes and 사용자가 새로 그린 게 없으면 보존을 위해 현재 날짜 키에 넣어 저장
      if (this.legacyStrokes && Object.keys(this.strokesByDate).length === 0){
        this.strokesByDate[this.dateValue()] = this.legacyStrokes;
      }
      await this.supabase.upsertThRecord({ form_id: this.selected()!.id, week_start: ymd, image_url: publicUrl, strokes: this.strokesByDate });
      // 성공 토스트: 기본 alert 제거
    }catch(e){ console.error(e); alert('저장 실패'); }
  }

  async loadRecord(){
    try{
      const ymd = this.periodStart();
      const { data } = await this.supabase.getThRecord(this.selected()!.id, ymd);
      if(data?.strokes){
        const raw = data.strokes as any;
        // Backward-compat: older 데이터는 배열(strokes[])로 저장됨
        if (Array.isArray(raw)){
          this.legacyStrokes = raw as any;
          this.strokesByDate = {};
        } else {
          this.legacyStrokes = null;
          this.strokesByDate = raw || {};
        }
        this.redrawFromMap();
      } else {
        this.strokesByDate = {};
        this.legacyStrokes = null;
        this.clearCanvas(true);
      }
      // 기록이 없으면 아무 메시지도 표시하지 않고 빈 양식을 유지합니다.
    }catch{ /* Silent fail; keep current canvas */ }
  }

  private redrawFromMap(){
    if(!this.ctxDraw || !this.drawCanvasRef) return; this.clearCanvas(false);
    const start = new Date(this.periodStart());
    const end = new Date(this.dateValue());
    const gather: { points:{x:number;y:number;}[]; width:number; color:string; }[] = [];
    const pushDay = (d: Date)=>{
      const key = d.toISOString().slice(0,10);
      const arr = this.strokesByDate[key] || [];
      for(const s of arr){ gather.push(s); }
    };
    if(this.granularity()==='day'){
      pushDay(end);
    } else if(this.granularity()==='week' || this.granularity()==='month'){
      const cur = new Date(start);
      while(cur <= end){ pushDay(cur); cur.setDate(cur.getDate()+1); }
    }
    // If legacy array-only strokes exist, 주간/월간 어디서든 표시되도록 누적에 포함
    if (this.legacyStrokes){ for(const s of this.legacyStrokes){ gather.push(s); } }
    for(const s of gather){ this.ctxDraw!.strokeStyle = s.color; this.ctxDraw!.lineWidth = s.width; const pts=s.points; for(let i=1;i<pts.length;i++){ this.ctxDraw!.beginPath(); this.ctxDraw!.moveTo(pts[i-1].x, pts[i-1].y); this.ctxDraw!.lineTo(pts[i].x, pts[i].y); this.ctxDraw!.stroke(); } }
  }

  printRecord(){
    const merged = document.createElement('canvas'); const pdfC = this.pdfCanvasRef!.nativeElement; const drawC = this.drawCanvasRef!.nativeElement; merged.width=pdfC.width; merged.height=pdfC.height; const mctx=merged.getContext('2d')!; mctx.drawImage(pdfC,0,0); mctx.drawImage(drawC,0,0);
    const url = merged.toDataURL('image/png'); const w = window.open('', '_blank'); if(!w) return; w.document.write(`<img src="${url}" style="width:100%" onload="window.print(); window.onafterprint=window.close;" />`);
  }

  toggleFullscreen(){
    const on = !this.fullscreen(); this.fullscreen.set(on);
    const el = this.containerRef?.nativeElement; if(!el) return;
    if(on){
      el.requestFullscreen?.();
      // iOS PWA/Safari 대안: 그냥 화면을 fixed로 만들어 유사 전체화면
      document.body.style.overflow = 'hidden';
    }else{
      document.exitFullscreen?.();
      document.body.style.overflow = '';
    }
    // 크기 다시 계산
    setTimeout(()=> this.renderPdf(), 50);
  }
  private async drawImageBackground(url: string, canvas: HTMLCanvasElement){
    const img = new Image();
    img.crossOrigin = 'anonymous';
    await new Promise<void>((resolve, reject)=>{ img.onload=()=>resolve(); img.onerror=()=>reject(); img.src=url; });
    const ctx = this.pdfCtx!; ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  }

  private static async imageExists(url: string){
    try{ const res = await fetch(url, { method: 'HEAD' }); return res.ok; } catch { return false; }
  }

  private loadScript(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = url;
      s.async = true;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error('script load failed'));
      document.head.appendChild(s);
    });
  }

  private async ensurePdfjs(): Promise<any> {
    const g: any = globalThis as any;
    if (g.pdfjsLib) return g.pdfjsLib;
    await this.loadScript('https://cdn.jsdelivr.net/npm/pdfjs-dist@4.6.82/build/pdf.min.js');
    return g.pdfjsLib;
  }
}
