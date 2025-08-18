import { Component, computed, ElementRef, inject, signal, ViewChild } from '@angular/core';
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
              <label>시작일</label>
              <input type="date" [ngModel]="weekStart()" (ngModelChange)="setWeekStart($event)" />
              <button (click)="clearCanvas()">지우기</button>
              <button (click)="loadRecord()">불러오기</button>
              <button (click)="saveRecord()">저장</button>
              <button (click)="printRecord()">인쇄</button>
              <button (click)="toggleFullscreen()">전체화면</button>
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

  open(it: RmdFormItem){ this.selected.set(it); }
  // ===== Temperature/Humidity PDF Annotator =====
  @ViewChild('container', { static: false }) containerRef?: ElementRef<HTMLDivElement>;
  @ViewChild('pdfCanvas', { static: false }) pdfCanvasRef?: ElementRef<HTMLCanvasElement>;
  @ViewChild('drawCanvas', { static: false }) drawCanvasRef?: ElementRef<HTMLCanvasElement>;

  weekStart = signal<string>(RmdFormsComponent.toMonday(new Date()));
  fullscreen = signal<boolean>(false);
  private drawing = false;
  private ctxDraw?: CanvasRenderingContext2D | null;
  private pdfCtx?: CanvasRenderingContext2D | null;
  private strokes: { points: {x:number;y:number;}[]; width:number; color:string; }[] = [];
  private currentStroke: { points: {x:number;y:number;}[]; width:number; color:string; } | null = null;

  static toMonday(d: Date){ const dt = new Date(d); const day = dt.getDay(); const diff = (day===0? -6 : 1 - day); dt.setDate(dt.getDate()+diff); return dt.toISOString().slice(0,10); }

  setWeekStart(v: string){ if(!v) return; this.weekStart.set(RmdFormsComponent.toMonday(new Date(v))); this.renderPdf(); }

  ngAfterViewInit(){
    queueMicrotask(()=> this.renderPdf());
  }

  private async renderPdf(){
    if (!this.selected() || this.selected()!.id !== 'BF-RMD-PM-IR-07') return;
    const container = this.containerRef?.nativeElement; if(!container) return;
    const pdfCanvas = this.pdfCanvasRef?.nativeElement; const drawCanvas = this.drawCanvasRef?.nativeElement;
    if(!pdfCanvas || !drawCanvas) return;

    const width = Math.min(900, container.clientWidth || 900);
    const height = Math.floor(width * 1.414); // A4 비율 근사
    [pdfCanvas, drawCanvas].forEach(c=>{ c.width = width; c.height = height; c.style.width = width+'px'; c.style.height = height+'px'; });
    this.pdfCtx = pdfCanvas.getContext('2d');
    this.ctxDraw = drawCanvas.getContext('2d');
    if (this.ctxDraw){ this.ctxDraw.lineCap='round'; this.ctxDraw.lineJoin='round'; this.ctxDraw.strokeStyle = '#111827'; this.ctxDraw.lineWidth = 2.5; }

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
    const {x,y} = this.localPoint(canvas, ev); this.currentStroke = { points:[{x,y}], width: this.ctxDraw?.lineWidth||2.5, color: this.ctxDraw?.strokeStyle as string || '#111827' };
  }
  onPointerMove(ev: PointerEvent){ if(!this.drawing || !this.drawCanvasRef || !this.ctxDraw || !this.currentStroke) return; const canvas=this.drawCanvasRef.nativeElement; const {x,y}=this.localPoint(canvas,ev); const pts=this.currentStroke.points; const last=pts[pts.length-1]; if(Math.hypot(x-last.x,y-last.y)<0.8) return; pts.push({x,y}); this.ctxDraw.beginPath(); this.ctxDraw.moveTo(last.x,last.y); this.ctxDraw.lineTo(x,y); this.ctxDraw.stroke(); }
  onPointerUp(){ if(!this.drawing) return; this.drawing=false; if(this.currentStroke){ this.strokes.push(this.currentStroke); this.currentStroke=null; } }
  private localPoint(canvas: HTMLCanvasElement, ev: PointerEvent){ const rect = canvas.getBoundingClientRect(); return { x: (ev.clientX - rect.left) * (canvas.width/rect.width), y: (ev.clientY - rect.top) * (canvas.height/rect.height) }; }

  clearCanvas(resetStrokes: boolean = true){ if(this.ctxDraw && this.drawCanvasRef){ this.ctxDraw.clearRect(0,0,this.drawCanvasRef.nativeElement.width,this.drawCanvasRef.nativeElement.height); } if(resetStrokes) this.strokes = []; }

  async saveRecord(){
    try{
      const merged = document.createElement('canvas');
      const pdfC = this.pdfCanvasRef!.nativeElement; const drawC = this.drawCanvasRef!.nativeElement;
      merged.width = pdfC.width; merged.height = pdfC.height; const mctx = merged.getContext('2d')!;
      mctx.drawImage(pdfC, 0, 0); mctx.drawImage(drawC, 0, 0);
      const blob: Blob = await new Promise(res=> merged.toBlob(b=>res(b!), 'image/png'));
      const ymd = this.weekStart();
      const path = `th/${ymd}.png`;
      const { publicUrl } = await this.supabase.uploadRecordImage(blob, path);
      await this.supabase.upsertThRecord({ form_id: this.selected()!.id, week_start: ymd, image_url: publicUrl, strokes: this.strokes });
      alert('저장되었습니다');
    }catch(e){ console.error(e); alert('저장 실패'); }
  }

  async loadRecord(){
    try{
      const ymd = this.weekStart();
      const { data } = await this.supabase.getThRecord(this.selected()!.id, ymd);
      if(data?.strokes){ this.strokes = data.strokes; this.redrawStrokes(); }
      if(!data){ alert('기록이 없습니다'); }
    }catch{ alert('불러오기 실패'); }
  }

  private redrawStrokes(){ if(!this.ctxDraw || !this.drawCanvasRef) return; this.clearCanvas(false); for(const s of this.strokes){ this.ctxDraw!.strokeStyle = s.color; this.ctxDraw!.lineWidth = s.width; const pts=s.points; for(let i=1;i<pts.length;i++){ this.ctxDraw!.beginPath(); this.ctxDraw!.moveTo(pts[i-1].x, pts[i-1].y); this.ctxDraw!.lineTo(pts[i].x, pts[i].y); this.ctxDraw!.stroke(); } } }

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
