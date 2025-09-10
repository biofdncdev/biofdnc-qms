import { Injectable, signal, ElementRef } from '@angular/core';
import { SupabaseService } from '../../../services/supabase.service';
import { Stroke, StrokePoint, Granularity, Tool } from '../rmd-forms.types';

@Injectable()
export class RmdFormsThRecordService {
  // Date and granularity
  dateValue = signal<string>(new Date().toISOString().slice(0, 10));
  periodStartSig = signal<string>(RmdFormsThRecordService.toMonday(new Date()));
  granularity = signal<Granularity>((localStorage.getItem('th_granularity') as any) || 'day');
  recordedWeeks = signal<string[]>([]);
  
  // Drawing tools
  fullscreen = signal<boolean>(false);
  tool = signal<Tool>('pen');
  showPenMenu = signal<boolean>(false);
  showEraserMenu = signal<boolean>(false);
  penColor = signal<string>('#111827');
  penWidth = signal<number>(3);
  eraserWidth = signal<number>(14);
  
  // Tool options
  penColors = ['#111827', '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'];
  penWidths = [2, 3, 4, 6, 8, 10, 12];
  eraserWidths = [6, 8, 10, 14, 20, 28];
  
  // Canvas state
  private drawing = false;
  private ctxDraw?: CanvasRenderingContext2D | null;
  private pdfCtx?: CanvasRenderingContext2D | null;
  private strokesByDate: Record<string, Stroke[]> = {};
  private legacyStrokes: Stroke[] | null = null;
  private currentStroke: Stroke | null = null;
  
  isAdmin = false;

  constructor(private supabase: SupabaseService) {}

  // Date utilities
  static toMonday(d: Date): string {
    const dt = new Date(d);
    const day = dt.getDay();
    const diff = 0 - day; // Sunday = 0
    dt.setDate(dt.getDate() + diff);
    return dt.toISOString().slice(0, 10);
  }

  static toMonthStart(d: Date): string {
    const dt = new Date(d.getFullYear(), d.getMonth(), 1);
    return dt.toISOString().slice(0, 10);
  }

  computePeriodStart(dateStr: string): string {
    const d = new Date(dateStr);
    switch (this.granularity()) {
      case 'day': return dateStr;
      case 'week': return RmdFormsThRecordService.toMonday(d);
      case 'month': return RmdFormsThRecordService.toMonthStart(d);
    }
  }

  async setDate(v: string, pdfCanvas?: HTMLCanvasElement, drawCanvas?: HTMLCanvasElement, container?: HTMLDivElement): Promise<void> {
    if (!v) return;
    this.dateValue.set(v);
    this.periodStartSig.set(this.computePeriodStart(v));
    if (pdfCanvas && drawCanvas && container) {
      await this.renderPdf(pdfCanvas, drawCanvas, container);
      await this.loadRecord('BF-RMD-PM-IR-07');
    }
  }

  hasRecord(ymd: string): boolean {
    return this.recordedWeeks().includes(ymd);
  }

  periodStart(): string {
    return this.periodStartSig();
  }

  setGranularity(val: Granularity, pdfCanvas?: HTMLCanvasElement, drawCanvas?: HTMLCanvasElement, container?: HTMLDivElement): void {
    this.granularity.set(val);
    localStorage.setItem('th_granularity', val);
    this.periodStartSig.set(this.computePeriodStart(this.dateValue()));
    if (pdfCanvas && drawCanvas && container) {
      this.renderPdf(pdfCanvas, drawCanvas, container);
      this.loadRecord('BF-RMD-PM-IR-07');
    }
  }

  async nudgeDate(delta: number, unit: 'day' | 'week' | 'month', pdfCanvas?: HTMLCanvasElement, drawCanvas?: HTMLCanvasElement, container?: HTMLDivElement): Promise<void> {
    const d = new Date(this.dateValue());
    if (unit === 'day') d.setDate(d.getDate() + delta);
    if (unit === 'week') d.setDate(d.getDate() + delta * 7);
    if (unit === 'month') d.setMonth(d.getMonth() + delta);
    await this.setDate(d.toISOString().slice(0, 10), pdfCanvas, drawCanvas, container);
  }

  // Tool menus
  closeToolMenus(): void {
    this.showPenMenu.set(false);
    this.showEraserMenu.set(false);
  }

  togglePenMenu(): void {
    this.tool.set('pen');
    this.showPenMenu.set(!this.showPenMenu());
    this.showEraserMenu.set(false);
  }

  toggleEraserMenu(): void {
    this.tool.set('eraser');
    this.showEraserMenu.set(!this.showEraserMenu());
    this.showPenMenu.set(false);
  }

  setPenColor(c: string): void {
    this.penColor.set(c);
    if (this.ctxDraw) this.ctxDraw.strokeStyle = c;
  }

  setPenWidth(w: number): void {
    this.penWidth.set(+w);
    if (this.ctxDraw) this.ctxDraw.lineWidth = +w;
  }

  setEraserWidth(w: number): void {
    this.eraserWidth.set(+w);
  }

  // Canvas rendering
  async renderPdf(pdfCanvas: HTMLCanvasElement, drawCanvas: HTMLCanvasElement, container: HTMLDivElement): Promise<void> {
    // Target size: fit within container (or viewport if fullscreen)
    let width: number;
    let height: number;
    if (this.fullscreen()) {
      const vw = Math.max(320, (globalThis.innerWidth || 1024) - 32);
      const vh = Math.max(320, (globalThis.innerHeight || 768) - 32);
      width = Math.min(vw, Math.floor(vh / 1.414));
      height = Math.floor(width * 1.414);
    } else {
      width = Math.min(900, container.clientWidth || 900);
      height = Math.floor(width * 1.414);
    }
    
    [pdfCanvas, drawCanvas].forEach(c => {
      c.width = width;
      c.height = height;
      c.style.width = width + 'px';
      c.style.height = height + 'px';
    });
    
    this.pdfCtx = pdfCanvas.getContext('2d');
    this.ctxDraw = drawCanvas.getContext('2d');
    
    if (this.ctxDraw) {
      this.ctxDraw.lineCap = 'round';
      this.ctxDraw.lineJoin = 'round';
      this.ctxDraw.strokeStyle = this.penColor();
      this.ctxDraw.lineWidth = this.penWidth();
    }

    // Try to draw from image first
    const imageCandidates = [
      '/forms/th-record-sheet.png',
      '/asset/th-record-sheet.png',
    ];
    
    let drawn = false;
    for (const url of imageCandidates) {
      try {
        await this.drawImageBackground(url, pdfCanvas);
        drawn = true;
        break;
      } catch {
        // Try next
      }
    }
    
    if (!drawn && this.pdfCtx) {
      // Fallback: draw empty background
      this.pdfCtx.fillStyle = '#f1f5f9';
      this.pdfCtx.fillRect(0, 0, pdfCanvas.width, pdfCanvas.height);
      this.pdfCtx.fillStyle = '#64748b';
      this.pdfCtx.fillText('양식 배경을 찾을 수 없습니다.', 20, 30);
    }
    
    this.clearCanvas(drawCanvas, false);
  }

  private async drawImageBackground(url: string, canvas: HTMLCanvasElement): Promise<void> {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject();
      img.src = url;
    });
    const ctx = this.pdfCtx;
    if (ctx) {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    }
  }

  // Drawing methods
  onPointerDown(ev: PointerEvent, canvas: HTMLCanvasElement): void {
    if (!canvas || !this.ctxDraw) return;
    this.drawing = true;
    canvas.setPointerCapture(ev.pointerId);
    const { x, y } = this.localPoint(canvas, ev);
    this.closeToolMenus();
    
    if (this.tool() === 'eraser') {
      const w = this.eraserWidth();
      this.ctxDraw.save();
      this.ctxDraw.globalCompositeOperation = 'destination-out';
      this.ctxDraw.lineWidth = w;
      this.ctxDraw.strokeStyle = 'rgba(0,0,0,1)';
      this.currentStroke = { points: [{ x, y }], width: w, color: 'eraser' };
    } else {
      this.ctxDraw.globalCompositeOperation = 'source-over';
      this.ctxDraw.lineWidth = this.penWidth();
      this.ctxDraw.strokeStyle = this.penColor();
      this.currentStroke = {
        points: [{ x, y }],
        width: this.ctxDraw.lineWidth || 3,
        color: (this.ctxDraw.strokeStyle as string) || '#111827'
      };
    }
  }

  onPointerMove(ev: PointerEvent, canvas: HTMLCanvasElement): void {
    if (!this.drawing || !this.ctxDraw || !this.currentStroke) return;
    const { x, y } = this.localPoint(canvas, ev);
    const pts = this.currentStroke.points;
    const last = pts[pts.length - 1];
    if (Math.hypot(x - last.x, y - last.y) < 0.8) return;
    pts.push({ x, y });
    this.ctxDraw.beginPath();
    this.ctxDraw.moveTo(last.x, last.y);
    this.ctxDraw.lineTo(x, y);
    this.ctxDraw.stroke();
  }

  onPointerUp(): void {
    if (!this.drawing) return;
    this.drawing = false;
    if (this.currentStroke) {
      if (this.ctxDraw) {
        this.ctxDraw.restore?.();
      }
      const key = this.dateValue();
      if (!this.strokesByDate[key]) this.strokesByDate[key] = [];
      this.strokesByDate[key].push(this.currentStroke);
      this.currentStroke = null;
    }
  }

  private localPoint(canvas: HTMLCanvasElement, ev: PointerEvent): StrokePoint {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (ev.clientX - rect.left) * (canvas.width / rect.width),
      y: (ev.clientY - rect.top) * (canvas.height / rect.height)
    };
  }

  clearCanvas(canvas: HTMLCanvasElement, resetStrokes: boolean = true): void {
    if (this.ctxDraw && canvas) {
      this.ctxDraw.clearRect(0, 0, canvas.width, canvas.height);
    }
    if (resetStrokes) {
      this.strokesByDate[this.dateValue()] = [];
    }
  }

  clearToday(canvas: HTMLCanvasElement): void {
    this.clearCanvas(canvas, true);
  }

  // Save/Load
  async saveRecord(formId: string, pdfCanvas: HTMLCanvasElement, drawCanvas: HTMLCanvasElement): Promise<void> {
    const ymd = this.periodStart();
    try {
      const chk = await this.supabase.getThRecord(formId, ymd);
      if (chk.data) {
        const first = globalThis.confirm('해당 날짜에 기존 기록이 있습니다. 덮어쓰시겠습니까?');
        if (!first) return;
        const second = globalThis.confirm('정말로 덮어쓰기 하시겠습니까? 이 작업은 되돌릴 수 없습니다.');
        if (!second) return;
      }

      const merged = document.createElement('canvas');
      merged.width = pdfCanvas.width;
      merged.height = pdfCanvas.height;
      const mctx = merged.getContext('2d')!;
      mctx.drawImage(pdfCanvas, 0, 0);
      mctx.drawImage(drawCanvas, 0, 0);
      
      const blob: Blob = await new Promise(res => merged.toBlob(b => res(b!), 'image/png'));
      const path = `th/${ymd}.png`;
      let publicUrl: string | null = null;
      
      try {
        const up = await this.supabase.uploadRecordImage(blob, path);
        publicUrl = up.publicUrl;
      } catch (err: any) {
        // Storage 업로드가 실패해도 DB에는 strokes만 저장
      }
      
      // If we loaded legacy array-only strokes and 사용자가 새로 그린 게 없으면 보존
      if (this.legacyStrokes && Object.keys(this.strokesByDate).length === 0) {
        this.strokesByDate[this.dateValue()] = this.legacyStrokes;
      }
      
      await this.supabase.upsertThRecord({
        form_id: formId,
        week_start: ymd,
        image_url: publicUrl,
        strokes: this.strokesByDate
      });
    } catch (e) {
      console.error(e);
      alert('저장 실패');
    }
  }

  async loadRecord(formId: string): Promise<void> {
    try {
      const ymd = this.periodStart();
      const { data } = await this.supabase.getThRecord(formId, ymd);
      if (data?.strokes) {
        const raw = data.strokes as any;
        // Backward-compat: older 데이터는 배열로 저장됨
        if (Array.isArray(raw)) {
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
        if (this.ctxDraw) {
          const canvas = document.querySelector('canvas[id*="draw"]') as HTMLCanvasElement;
          if (canvas) this.clearCanvas(canvas, true);
        }
      }
    } catch {
      // Silent fail
    }
  }

  private redrawFromMap(): void {
    if (!this.ctxDraw) return;
    const canvas = document.querySelector('canvas[id*="draw"]') as HTMLCanvasElement;
    if (!canvas) return;
    
    this.clearCanvas(canvas, false);
    const start = new Date(this.periodStart());
    const end = new Date(this.dateValue());
    const gather: Stroke[] = [];
    
    const pushDay = (d: Date) => {
      const key = d.toISOString().slice(0, 10);
      const arr = this.strokesByDate[key] || [];
      for (const s of arr) {
        gather.push(s);
      }
    };
    
    if (this.granularity() === 'day') {
      pushDay(end);
    } else if (this.granularity() === 'week' || this.granularity() === 'month') {
      const cur = new Date(start);
      while (cur <= end) {
        pushDay(cur);
        cur.setDate(cur.getDate() + 1);
      }
    }
    
    // Include legacy strokes
    if (this.legacyStrokes) {
      for (const s of this.legacyStrokes) {
        gather.push(s);
      }
    }
    
    for (const s of gather) {
      this.ctxDraw.strokeStyle = s.color;
      this.ctxDraw.lineWidth = s.width;
      const pts = s.points;
      for (let i = 1; i < pts.length; i++) {
        this.ctxDraw.beginPath();
        this.ctxDraw.moveTo(pts[i - 1].x, pts[i - 1].y);
        this.ctxDraw.lineTo(pts[i].x, pts[i].y);
        this.ctxDraw.stroke();
      }
    }
  }

  printRecord(pdfCanvas: HTMLCanvasElement, drawCanvas: HTMLCanvasElement): void {
    const merged = document.createElement('canvas');
    merged.width = pdfCanvas.width;
    merged.height = pdfCanvas.height;
    const mctx = merged.getContext('2d')!;
    mctx.drawImage(pdfCanvas, 0, 0);
    mctx.drawImage(drawCanvas, 0, 0);
    
    const url = merged.toDataURL('image/png');
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`<img src="${url}" style="width:100%" onload="window.print(); window.onafterprint=window.close;" />`);
  }

  toggleFullscreen(container?: HTMLDivElement): void {
    const on = !this.fullscreen();
    this.fullscreen.set(on);
    if (!container) return;
    
    if (on) {
      container.requestFullscreen?.();
      document.body.style.overflow = 'hidden';
    } else {
      document.exitFullscreen?.();
      document.body.style.overflow = '';
    }
    
    // Recalculate size
    setTimeout(() => {
      const pdfCanvas = container.querySelector('canvas[id*="pdf"]') as HTMLCanvasElement;
      const drawCanvas = container.querySelector('canvas[id*="draw"]') as HTMLCanvasElement;
      if (pdfCanvas && drawCanvas) {
        this.renderPdf(pdfCanvas, drawCanvas, container);
      }
    }, 50);
  }

  async checkAdmin(): Promise<void> {
    try {
      const u = await this.supabase.getCurrentUser();
      if (u) {
        const { data } = await this.supabase.getUserProfile(u.id);
        this.isAdmin = (data?.role === 'admin' || data?.role === 'manager');
      }
    } catch {}
  }

  async loadWeeks(formId: string): Promise<void> {
    const list = await this.supabase.listThWeeks(formId);
    this.recordedWeeks.set((list.data || []).map((r: any) => r.week_start));
  }
}
