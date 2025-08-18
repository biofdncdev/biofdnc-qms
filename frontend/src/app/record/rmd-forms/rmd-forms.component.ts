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
  template: `
  <div class="page">
    <aside class="left">
      <div class="sticky">
        <h2>원료제조팀 지시·기록서</h2>
        <div class="search">
          <input type="search" placeholder="지시·기록서 제목 검색" [ngModel]="query()" (ngModelChange)="query.set($event)">
          <button class="clear" *ngIf="query()" (click)="query.set('')">×</button>
        </div>
      </div>
      <ng-container *ngFor="let cat of filtered()">
        <hr />
        <h4 class="cat">{{ cat.category }}</h4>
        <button class="item" *ngFor="let it of cat.items" (click)="open(it)">{{ it.id }}. {{ it.title }}</button>
      </ng-container>
    </aside>

    <main class="right">
      <div class="toolbar">
        <h3 *ngIf="selected(); else choose"> {{ selected()?.title }} </h3>
        <div class="spacer"></div>
      </div>
      <ng-template #choose><h3>좌측에서 항목을 선택하세요.</h3></ng-template>
      <section class="content">
        <div *ngIf="selected() as sel">
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
  constructor(private supabase: SupabaseService){}

  filtered = computed(() => {
    const q = this.query().trim().toLowerCase();
    if (!q) return this.categories;
    return this.categories.map(cat => ({
      ...cat,
      items: cat.items.filter(i => i.id.toLowerCase().includes(q) || i.title.toLowerCase().includes(q))
    })).filter(cat => cat.items.length > 0);
  });

  async open(it: RmdFormItem){
    this.selected.set(it);
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
        const pdfjs = await import('pdfjs-dist');
        (pdfjs as any).GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.6.82/build/pdf.worker.min.mjs';
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
}
