import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as XLSX from 'xlsx';
import JSZip from 'jszip';
import { PartnerService } from '../../services/partner.service';

type PartnerRow = {
  internal_code: string;
  name_kr?: string;
  type?: string;
  biz_reg_no?: string;
  representative?: string;
  phone?: string;
  fax?: string;
  email?: string;
  address?: string;
  manager?: string;
  manager_phone?: string;
  manager_email?: string;
  remark?: string;
};

@Component({
  selector: 'app-partner-upload',
  standalone: true,
  imports: [CommonModule],
  template: `
  <div class="page">
    <header class="top">
      <h2>Partner <span class="sub">일괄 등록</span></h2>
      <div class="actions">
        <button class="btn ghost" (click)="downloadTemplate()">템플릿 다운로드</button>
      </div>
    </header>

    <section class="uploader">
      <div class="labels"><b>거래처 리스트 업로드</b></div>
      <input #fileInput type="file" class="hidden-input" accept=".csv,.xlsx,.xls" (change)="onFile($event)" />
      <div class="dropzone" [class.dragover]="dragging()"
           (dragover)="onDragOver($event)"
           (dragleave)="onDragLeave($event)"
           (drop)="onDrop($event)"
           (click)="fileInput.click()">
        <div class="dz-inner">
          <div class="file-chip" *ngIf="fileName(); else nofile" (click)="$event.stopPropagation()">
            <span class="file-name" [title]="fileName()">{{ fileName() }}</span>
            <button class="chip-close" type="button" aria-label="지우기" (click)="clear(fileInput)">×</button>
          </div>
          <ng-template #nofile><span>CSV 또는 Excel 파일을 드래그앤드롭하거나 클릭하여 선택하세요.</span></ng-template>
        </div>
      </div>
      <div class="controls">
        <button class="btn" [disabled]="!rowCount() || busy()" (click)="run()">업데이트</button>
        <button class="btn ghost" [disabled]="!busy()" (click)="cancel()">취소</button>
        <button class="btn ghost" [disabled]="busy()" (click)="clear(fileInput)">지우기</button>
        <div class="spinner" *ngIf="busy()"></div>
      </div>
      <div class="summary" *ngIf="rowCount() && !busy()">
        총 {{ rowCount() }}건 준비됨 · 신규 {{ previewStats().insert }} · 업데이트 {{ previewStats().update }} · 오류 {{ previewStats().error }}
      </div>
      <div class="progress-wrap" *ngIf="busy()">
        <div class="progress"><div class="bar" [style.width.%]="progress()*100"></div></div>
        <div class="progress-text">{{ processed() }} / {{ total() }} ({{ (progress()*100) | number:'1.0-0' }}%)</div>
      </div>
    </section>

    <section class="result" *ngIf="done()">
      <div class="grid">
        <div><b>총 대상</b> {{ total() }} 건</div>
        <div><b>신규</b> {{ stats().inserted }} 건</div>
        <div><b>업데이트</b> {{ stats().updated }} 건</div>
        <div><b>스킵</b> {{ stats().skipped }} 건</div>
        <div><b>오류</b> {{ errors().length }} 건</div>
      </div>
    </section>

    <section class="errors" *ngIf="errors().length">
      <h3>오류 목록</h3>
      <div class="table-wrap">
        <table class="compact">
          <thead><tr><th>거래처코드</th><th>컬럼</th><th>메시지</th></tr></thead>
          <tbody>
            <tr *ngFor="let e of errors()">
              <td>{{ e.internal_code || '-' }}</td>
              <td>{{ e.column || '-' }}</td>
              <td class="wrap">{{ e.message }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
  `,
  styles: [`
  .page{ padding:12px 16px; }
  .top{ display:flex; align-items:center; justify-content:space-between; margin-bottom:12px; }
  .top h2{ margin:0; font-size:24px; font-weight:800; }
  .top h2 .sub{ margin-left:8px; font-size:16px; font-weight:700; color:#64748b; }
  .actions{ display:flex; align-items:center; gap:8px; }
  .btn{ height:32px; padding:0 12px; border-radius:8px; border:1px solid #0f172a; background:#111827; color:#fff; cursor:pointer; font-weight:600; }
  .btn.ghost{ background:#fff; color:#111827; border-color:#cbd5f5; }
  .uploader{ display:flex; flex-direction:column; gap:12px; margin-bottom:40px; }
  .labels{ font-size:13px; color:#334155; }
  .dropzone{ border:2px dashed #cbd5e1; border-radius:12px; padding:24px; text-align:center; color:#6b7280; cursor:pointer; transition: background .2s ease, border-color .2s ease; }
  .dropzone.dragover{ background:#eff6ff; border-color:#60a5fa; color:#1e3a8a; }
  .dz-inner{ font-size:13px; display:flex; justify-content:center; }
  .file-chip{ display:inline-flex; align-items:center; gap:6px; background:#eef2ff; border:1px solid #c7d2fe; color:#1e3a8a; padding:6px 10px; border-radius:999px; max-width:80%; }
  .file-name{ overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:360px; }
  .chip-close{ border:none; background:transparent; color:inherit; font-size:16px; cursor:pointer; padding:0 4px; }
  .controls{ display:flex; align-items:center; gap:10px; }
  .spinner{ width:18px; height:18px; border:2px solid #cbd5e1; border-top-color:#111827; border-radius:50%; animation:spin .9s linear infinite; }
  @keyframes spin{ from{ transform:rotate(0deg); } to{ transform:rotate(360deg); } }
  .summary{ font-size:12px; color:#475569; }
  .progress-wrap{ display:flex; align-items:center; gap:8px; }
  .progress{ flex:1; height:8px; background:#f1f5f9; border-radius:999px; overflow:hidden; }
  .progress .bar{ height:100%; background:#2563eb; transition: width .2s ease; }
  .progress-text{ min-width:140px; text-align:right; font-size:12px; color:#475569; }
  .grid{ display:grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap:12px; border:1px solid #e2e8f0; padding:12px; border-radius:12px; background:#f8fafc; }
  .errors{ margin-top:24px; }
  .errors h3{ margin:0 0 8px; font-size:16px; }
  .table-wrap{ max-height:360px; overflow:auto; border:1px solid #e2e8f0; border-radius:10px; }
  table{ width:100%; border-collapse:collapse; background:#fff; }
  th, td{ border-bottom:1px solid #f1f5f9; padding:6px 8px; text-align:left; font-size:13px; }
  td.wrap{ white-space:normal; word-break:break-word; }
  .hidden-input{ display:none; }
  `]
})
export class PartnerUploadComponent {
  private cancelRequested = false;
  private parsedRows: PartnerRow[] = [];
  private readonly requiredHeaders = new Map<string, string>([
    ['거래처내부코드','internal_code'],
    ['거래처코드','internal_code'],
    ['거래처명','name_kr'],
    ['거래처유형','type'],
    ['사업자등록번호','biz_reg_no'],
    ['대표자','representative'],
    ['대표전화','phone'],
    ['팩스','fax'],
    ['대표이메일','email'],
    ['주소','address'],
    ['관리자','manager'],
    ['관리자연락처','manager_phone'],
    ['관리자이메일','manager_email'],
    ['비고','remark']
  ]);

  fileName = signal('');
  dragging = signal(false);
  rowCount = signal(0);
  busy = signal(false);
  processed = signal(0);
  total = signal(0);
  done = signal(false);
  errors = signal<Array<{ internal_code?: string; column?: string; message: string }>>([]);
  stats = signal({ inserted: 0, updated: 0, skipped: 0 });
  previewStats = signal({ insert: 0, update: 0, error: 0 });

  constructor(private partners: PartnerService) {}

  onDragOver(ev: DragEvent){ ev.preventDefault(); this.dragging.set(true); }
  onDragLeave(ev: DragEvent){ ev.preventDefault(); this.dragging.set(false); }
  onDrop(ev: DragEvent){
    ev.preventDefault(); this.dragging.set(false);
    const file = ev.dataTransfer?.files?.[0];
    if (file) this.handleFile(file);
  }

  onFile(ev: Event){
    const input = ev.target as HTMLInputElement;
    const file = input.files && input.files[0];
    if (file) this.handleFile(file);
  }

  private async handleFile(file: File){
    this.fileName.set(file.name);
    try{
      const rows = await this.readWorkbook(file);
      this.parseRows(rows);
    }catch(e:any){
      console.error(e);
      this.errors.set([{ message: '파일을 읽는 중 오류가 발생했습니다: ' + (e?.message || e) }]);
      this.done.set(true);
    }
  }

  private async readWorkbook(file: File): Promise<any[][]>{
    const name = (file.name||'').toLowerCase();
    if (name.endsWith('.csv')){
      const text = await file.text();
      const wb = XLSX.read(text, { type: 'string', raw: true } as any);
      const ws = wb.Sheets[wb.SheetNames[0]];
      return XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];
    }
    // Excel to array
    const ab = await file.arrayBuffer();
    try{
      const wb = XLSX.read(ab, { type: 'array', cellStyles: false, dense: true } as any);
      const ws = wb.Sheets[wb.SheetNames[0]];
      return XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];
    }catch{
      const zip = await JSZip.loadAsync(ab as ArrayBuffer);
      zip.remove('xl/styles.xml');
      zip.remove('xl/theme/theme1.xml');
      const rebuilt = await zip.generateAsync({ type: 'uint8array' });
      const wb = XLSX.read(rebuilt, { type: 'array', dense: true } as any);
      const ws = wb.Sheets[wb.SheetNames[0]];
      return XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];
    }
  }

  private parseRows(rows: any[][]){
    if (!rows || rows.length < 2){
      this.parsedRows = [];
      this.rowCount.set(0);
      return;
    }
    const headerRowIndex = rows.findIndex(r => Array.isArray(r) && r.some(cell => !!this.requiredHeaders.get(String(cell ?? '').trim())));
    const header = (rows[headerRowIndex >=0 ? headerRowIndex : 0] || []).map(h => String(h ?? '').trim());
    const map: Record<string, string> = {};
    header.forEach((h, idx) => {
      const key = this.requiredHeaders.get(h);
      if (key) map[key] = String(idx);
    });

    if (!map['internal_code']){
      this.errors.set([{ message: '헤더에서 거래처내부코드(또는 거래처코드)를 찾을 수 없습니다.' }]);
      this.rowCount.set(0);
      return;
    }

    const data: PartnerRow[] = [];
    let insert = 0, update = 0, err = 0;
    const startRow = headerRowIndex >= 0 ? headerRowIndex + 1 : 1;
    for (let i = startRow; i < rows.length; i++){
      const r = rows[i] || [];
      const val = (idx: string|undefined) => idx !== undefined ? String(r[Number(idx)] ?? '').trim() : '';
      const internal_code = val(map['internal_code']);
      if (!internal_code){ continue; }
      const row: PartnerRow = {
        internal_code,
        name_kr: val(map['name_kr']),
        type: val(map['type']),
        biz_reg_no: val(map['biz_reg_no']),
        representative: val(map['representative']),
        phone: val(map['phone']),
        fax: val(map['fax']),
        email: val(map['email']),
        address: val(map['address']),
        manager: val(map['manager']),
        manager_phone: val(map['manager_phone']),
        manager_email: val(map['manager_email']),
        remark: val(map['remark'])
      };
      data.push(row);
      // 기본 추정: 신규로 가정
      insert++;
    }
    this.parsedRows = data;
    this.rowCount.set(data.length);
    this.previewStats.set({ insert, update, error: err });
    this.errors.set([]);
    this.done.set(false);
  }

  progress(){ const t = this.total(); return t ? this.processed() / t : 0; }

  async run(){
    if (!this.parsedRows.length) return;
    this.busy.set(true);
    this.cancelRequested = false;
    this.done.set(false);
    this.processed.set(0);
    this.total.set(this.parsedRows.length);
    const errs: Array<{ internal_code?: string; column?: string; message: string }> = [];
    const result = { inserted: 0, updated: 0, skipped: 0 };
    try{
      const CHUNK = 200;
      for (let i=0; i < this.parsedRows.length && !this.cancelRequested; i += CHUNK){
        const part = this.parsedRows.slice(i, i + CHUNK);
        try{
          const res = await this.partners.upsertPartners(part);
          result.inserted += res.inserted || 0;
          result.updated += res.updated || 0;
          result.skipped += res.skipped || 0;
          if (Array.isArray(res.errors)) errs.push(...res.errors);
        }catch(e:any){
          errs.push({ message: e?.message || String(e) });
        }
        this.processed.set(Math.min(this.parsedRows.length, this.processed() + part.length));
      }
    } finally {
      this.busy.set(false);
      this.stats.set(result);
      this.errors.set(errs);
      this.done.set(true);
    }
  }

  cancel(){ this.cancelRequested = true; }

  clear(input: HTMLInputElement){
    this.fileName.set('');
    if (input) input.value = '';
    this.parsedRows = [];
    this.rowCount.set(0);
    this.done.set(false);
    this.errors.set([]);
    this.stats.set({ inserted: 0, updated: 0, skipped: 0 });
    this.previewStats.set({ insert: 0, update: 0, error: 0 });
  }

  downloadTemplate(){
    const header = Array.from(this.requiredHeaders.keys());
    const rows = [header, header.map(() => '')];
    const ws = XLSX.utils.aoa_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '거래처');
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'partner-template.xlsx';
    a.click();
    URL.revokeObjectURL(url);
  }
}

