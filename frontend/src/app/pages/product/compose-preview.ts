import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ErpDataService } from '../../services/erp-data.service';

@Component({
  selector: 'app-compose-preview',
  standalone: true,
  imports: [CommonModule],
  template: `
  <div class="sheet" id="sheet">
    <div class="content">
      <header class="head">
        <div class="line1">
          <div class="motto">Life Science for Happiness</div>
          <div class="brand">BIO-FD&C</div>
        </div>
        <h1>CERTIFICATE OF COMPOSITION</h1>
      </header>
      <section class="product">
        <div class="label">Product Name</div>
        <div class="value">{{ name || code || '-' }}</div>
      </section>
      <section class="table">
        <table>
          <thead>
            <tr>
              <th class="col-no">No.</th>
              <th>INCI Name</th>
              <th>한글성분명</th>
              <th class="col-pct">조성비(%)</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let r of lines; let idx = index">
              <td class="col-no">{{ idx + 1 }}</td>
              <td>{{ r.inci }}</td>
              <td>{{ r.kor }}</td>
              <td class="col-pct">{{ formatPct(r.pct) }}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3" class="total-label">Total</td>
              <td class="col-pct">{{ formatPct(totalPct) }}</td>
            </tr>
          </tfoot>
        </table>
      </section>
    </div>
    <section class="sign">
      <div class="approved">Approved by :</div>
      <div class="signbox"></div>
      <div class="corp">(주)바이오에프디엔씨</div>
    </section>
    <footer class="foot">
      <div class="addr">21990  Smart Valley A-509,510,511, Songdomirae-ro 30, Yeonsu-Gu, Incheon, Korea<br/>T. 82 32) 811-2027   F. 82 32) 822-2027   dsshin@biofdnc.com</div>
      <div class="page">page1</div>
    </footer>
  </div>
  <div class="toolbar no-print">
    <button class="btn" (click)="windowPrint()">PDF로 저장/인쇄</button>
  </div>
  `,
  styles: [`
    :host{ display:block; padding: 12px; background:#f3f4f6; font-family: 'Noto Sans KR', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Inter', 'Apple SD Gothic Neo', 'Malgun Gothic', Arial, sans-serif; }
    .no-print{ position:fixed; right:12px; top:12px; }
    .btn{ height:32px; padding:0 12px; border:1px solid #d1d5db; border-radius:6px; background:#fff; cursor:pointer; }
    /* A4 portrait with Word-like margins using mm for print-parity */
    .sheet{ width: 210mm; height: 297mm; margin: 0 auto; background:#fff; padding: 25mm; box-shadow: 0 10px 24px rgba(0,0,0,.08); display:flex; flex-direction:column; box-sizing: border-box; position: relative; }
    .content{ flex:1; display:block; }
    .head{ display:block; }
    .head .line1{ display:flex; justify-content:space-between; align-items:center; font-size:11pt; color:#111827; }
    .head .brand{ font-weight:700; }
    /* Title up and add more gap below; avoid negative margins */
    .head h1{ margin: 28mm 0 16mm; text-align:center; font-size:21pt; font-weight:800; letter-spacing:0.3px; }
    /* Product box placed 100px (~26.5mm) below title */
    .product{ border:0.4mm dotted #9ca3af; border-radius:2mm; padding: 6mm; text-align:center; margin: 10mm 0 10mm; }
    .product .label{ color:#6b7280; font-weight:700; font-size:11pt; }
    .product .value{ font-size:13pt; font-weight:800; margin-top:2mm; }
    /* Table spacing tuned for readability; header slightly stronger */
    .table table{ width:100%; border-collapse:collapse; }
    .table th, .table td{ border:0.35mm dotted #9ca3af; padding: 3.5mm 3mm; font-size:10.5pt; line-height:1.35; }
    .table thead th{ background:#fafafa; font-weight:700; }
    .table .col-no{ width: 12mm; text-align:center; }
    .table .col-pct{ width: 24mm; text-align:right; }
    tfoot .total-label{ text-align:center; font-weight:700; }
    .table{ margin-top: 6mm; }
    /* Golden-ratio-ish vertical rhythm: generous whitespace before signature; footer pinned */
    .sign{ margin-top: auto; text-align:center; padding-top: 14mm; margin-bottom: 20mm; }
    .sign .approved{ display:inline-block; margin-right:10px; }
    .sign .signbox{ display:inline-block; width:60mm; height:22mm; border-bottom:0.3mm solid #d1d5db; vertical-align:bottom; }
    .sign .corp{ margin-top: 6mm; font-weight:700; }
    .foot{ display:flex; justify-content:space-between; color:#6b7280; font-size:9.5pt; padding-top: 8mm; position:absolute; left:25mm; right:25mm; bottom:25mm; }
    .foot .addr{ max-width: 150mm; }
    @page{ size: A4 portrait; margin: 0; }
    @media print{
      :host{ padding:0; background:#fff; }
      .sheet{ box-shadow:none; width:210mm; height:297mm; margin:0; padding:25mm; position:relative; }
      .no-print{ display:none; }
      *{ -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  `]
})
export class ComposePreviewComponent implements OnInit {
  code: string | null = null;
  name: string | null = null;
  lines: Array<{ inci: string; kor: string; pct: number }> = [];
  totalPct = 0;

  constructor(private erpData: ErpDataService){}

  ngOnInit(): void {
    const url = new URL(location.href);
    this.code = url.searchParams.get('code');
    this.name = url.searchParams.get('name');
    const productId = url.searchParams.get('product_id');
    if (productId) this.loadCompositions(productId);
    const auto = url.searchParams.get('auto') || url.searchParams.get('pdf');
    if (auto === '1' || auto === 'true'){
      setTimeout(()=> this.windowPrint(), 200);
    }
    // Build filename-friendly document title to be used by print-to-PDF dialogs
    const today = (()=>{ const d=new Date(); const p=(n:number)=> String(n).padStart(2,'0'); return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}`; })();
    const customer = url.searchParams.get('customer') || '';
    const delivery = url.searchParams.get('delivery') || '';
    const docType = 'Composition';
    const parts = [today, this.code||'', this.name||'', docType, customer, delivery].filter(Boolean).join(' ');
    try{ document.title = parts + '.pdf'; }catch{}
  }

  windowPrint(){
    const sheet = document.getElementById('sheet');
    if (!sheet){ window.print(); return; }
    const html = this.buildPrintHtml(sheet.outerHTML);
    // Prefer hidden iframe to avoid popup blockers and render reliably
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc){
      const w = window.open('', '_blank');
      if (!w){ return; }
      w.document.open(); w.document.write(html); w.document.close();
      setTimeout(()=>{ try{ w.focus(); w.print(); } catch{} }, 50);
      return;
    }
    doc.open(); doc.write(html); doc.close();
    setTimeout(()=>{ try{ iframe.contentWindow?.focus(); iframe.contentWindow?.print(); } finally { setTimeout(()=> iframe.remove(), 200); } }, 60);
  }

  private buildPrintHtml(inner: string){
    // Print-only document CSS aligned with screen CSS for 1:1 layout
    const css = `
      @page { size: A4 portrait; margin: 0; }
      html, body { padding: 0; margin: 0; background: #fff; }
      * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .sheet { width: 210mm; height: 297mm; margin: 0 auto; padding: 25mm; box-shadow: none; position: relative; box-sizing: border-box; }
      .head{ display:block; }
      .head .line1{ display:flex; justify-content:space-between; align-items:center; font-size:11pt; color:#111827; }
      .head h1{ margin: 28mm 0 16mm; text-align:center; font-size:21pt; font-weight:800; letter-spacing:0.3px; }
      .product{ border:0.4mm dotted #9ca3af; border-radius:2mm; padding: 6mm; text-align:center; margin: 10mm 0 10mm; }
      .product .label{ color:#6b7280; font-weight:700; font-size:11pt; }
      .product .value{ font-size:13pt; font-weight:800; margin-top:2mm; }
      .table{ margin-top: 6mm; }
      .table table{ width:100%; border-collapse:collapse; }
      .table th, .table td{ border:0.35mm dotted #9ca3af; padding: 3.5mm 3mm; font-size:10.5pt; line-height:1.35; }
      .table thead th{ background:#fafafa; font-weight:700; }
      .table .col-no{ width: 12mm; text-align:center; }
      .table .col-pct{ width: 24mm; text-align:right; }
      tfoot .total-label{ text-align:center; font-weight:700; }
      .sign{ margin-top: 14mm; text-align:center; }
      .sign .approved{ display:inline-block; margin-right:10px; }
      .sign .signbox{ display:inline-block; width:60mm; height:22mm; border-bottom:0.3mm solid #d1d5db; vertical-align:bottom; }
      .sign .corp{ margin-top: 6mm; font-weight:700; }
      .foot{ position:absolute; left:25mm; right:25mm; bottom:25mm; display:flex; justify-content:space-between; color:#6b7280; font-size:9.5pt; padding-top:8mm; box-sizing:border-box; }
      .foot .addr{ max-width: 150mm; }
    `;
    return `<!doctype html><html><head><meta charset="utf-8"><title>Composition</title>
      <style>${css}</style></head><body>${inner}</body></html>`;
  }

  async loadCompositions(productId: string){
    try{
      const { data } = await this.erpData.listProductCompositions(productId) as any;
      const list: Array<{ inci: string; kor: string; pct: number }> = (data||[]).map((c:any)=>({
        inci: (c?.ingredient?.inci_name)||'',
        kor: (c?.ingredient?.korean_name)||'',
        pct: Number(c?.percent)||0,
      }));
      this.lines = list;
      this.totalPct = list.reduce((s: number, r) => s + (Number.isFinite(r.pct)? r.pct : 0), 0);
    }catch{
      this.lines = [];
      this.totalPct = 0;
    }
  }

  formatPct(v: number){
    const n = Number(v);
    if (!Number.isFinite(n)) return '0';
    // Show up to 2 decimals, trim trailing zeros
    return n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  }
}


