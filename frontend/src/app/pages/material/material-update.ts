import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as XLSX from 'xlsx';
import JSZip from 'jszip';
import { ErpDataService } from '../../services/erp-data.service';

type SyncError = { key: string; column?: string; message: string };

@Component({
  selector: 'app-material-update',
  standalone: true,
  imports: [CommonModule],
  template: `
  <div class="page">
    <header class="top"><h2>Material <span class="sub">업데이트</span></h2></header>
    <section class="uploader">
      <input #fileInput type="file" class="hidden-input" accept=".xlsx,.xls,.csv" (change)="onFile($event)" />
      <div class="dropzone" [class.dragover]="dragOver()" (dragover)="onDragOver($event)" (dragleave)="onDragLeave($event)" (drop)="onDrop($event)" (click)="fileInput.click()">
        <div class="dz-inner">
          <div class="file-chip" *ngIf="fileName(); else nofile" (click)="$event.stopPropagation()">
            <span class="file-name" [title]="fileName()">{{ fileName() }}</span>
            <button class="chip-close" type="button" aria-label="지우기" (click)="clear(fileInput)">×</button>
          </div>
          <ng-template #nofile><span>여기로 파일을 드래그앤드롭 하거나 클릭하여 선택하세요.</span></ng-template>
        </div>
      </div>
      <div class="controls">
        <button class="btn" (click)="onUpdateClick()">업데이트</button>
        <button class="btn ghost" [disabled]="!busy()" (click)="cancel()">취소</button>
        <button class="btn ghost" [disabled]="busy()" (click)="clear(fileInput)">지우기</button>
        <div class="spinner" *ngIf="busy()"></div>
      </div>
      <div *ngIf="!busy() && pendingRows().length" style="color:#374151; font-size:12px;">감지된 행: {{ pendingRows().length }}건</div>
      <div class="progress-wrap" *ngIf="stats().total">
        <div class="progress"><div class="bar" [style.width.%]="progress()*100"></div></div>
        <div class="progress-text">{{ processed() }} / {{ stats().total }} ({{ (progress()*100) | number:'1.0-0' }}%)</div>
      </div>
    </section>

    <section class="status" *ngIf="ran()">
      <div class="grid">
        <div><b>총 처리 대상</b> {{ stats().total }} 건</div>
        <div><b>스킵</b> {{ stats().skipped }} 건</div>
        <div><b>업데이트</b> {{ stats().updated }} 건</div>
        <div><b>신규생성</b> {{ stats().inserted }} 건</div>
        <div><b>에러</b> {{ errors().length }} 건</div>
      </div>
    </section>

    <section *ngIf="errors().length" class="errors">
      <h3>에러 목록</h3>
      <table class="compact">
        <thead><tr><th>키(자재명/코드)</th><th>컬럼</th><th>메시지</th></tr></thead>
        <tbody>
          <tr *ngFor="let e of errors()"><td>{{ e.key }}</td><td>{{ e.column||'-' }}</td><td class="wrap">{{ e.message }}</td></tr>
        </tbody>
      </table>
    </section>
  </div>
  `,
  styles: [`
    .page{ padding:12px 16px; }
    .top{ display:flex; align-items:center; justify-content:space-between; margin-bottom:12px; }
    .top h2{ margin:0; font-size:24px; font-weight:800; }
    .top h2 .sub{ font-size:16px; font-weight:700; color:#6b7280; margin-left:8px; }
    .btn{ height:32px; padding:0 12px; border-radius:8px; border:1px solid #d1d5db; background:#111827; color:#fff; cursor:pointer; }
    .btn.ghost{ background:#fff; color:#111827; }
    .status .grid{ display:grid; grid-template-columns: repeat(5, minmax(120px, 1fr)); gap:8px; }
    .uploader{ display:flex; flex-direction:column; gap:12px; margin-bottom:12px; }
    .dropzone{ border:2px dashed #cbd5e1; border-radius:12px; padding:22px; text-align:center; color:#6b7280; transition: background-color .2s ease, border-color .2s ease; cursor:pointer; }
    .dropzone.dragover{ background:#f1f5f9; border-color:#93c5fd; }
    .dz-inner{ font-size:13px; display:flex; justify-content:center; }
    .file-chip{ display:inline-flex; align-items:center; gap:6px; background:#eef2ff; border:1px solid #c7d2fe; color:#1e3a8a; padding:6px 10px; border-radius:999px; max-width:90%; }
    .file-name{ overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:70vw; }
    .chip-close{ border:none; background:transparent; color:#1e3a8a; cursor:pointer; font-size:16px; line-height:1; padding:0 2px; }
    .controls{ display:flex; align-items:center; gap:10px; }
    .progress-wrap{ display:flex; align-items:center; gap:8px; }
    .progress{ flex:1; height:8px; background:#f1f5f9; border-radius:999px; overflow:hidden; }
    .progress .bar{ height:100%; background:#2563eb; width:0; transition: width .2s ease; }
    .progress-text{ min-width:160px; text-align:right; color:#374151; font-size:12px; }
    .spinner{ width:18px; height:18px; border:2px solid #cbd5e1; border-top-color:#111827; border-radius:50%; animation:spin 0.9s linear infinite; }
    table{ width:100%; border-collapse:collapse; }
    th, td{ border-bottom:1px solid #eef2f7; padding:6px 8px; }
    td.wrap{ white-space:normal; word-break:break-word; }
    .hidden-input{ display:none; }
  `]
})
export class MaterialUpdateComponent implements OnInit {
  pendingRows = signal<any[]>([]); busy = signal(false); private cancelRequested=false; ran=signal(false); errors=signal<SyncError[]>([]);
  stats = signal({ total:0, updated:0, skipped:0, inserted:0 }); processed=signal(0); dragOver=signal(false); fileName=signal('');
  private erpHeaderSet = new Set<string>();
  // ERP에서 유일키는 '자재번호' 하나만 사용
  private keyColumns = ['자재번호'];

  constructor(private erpData: ErpDataService) {}
  async ngOnInit(){
    try{ const maps = await this.erpData.getMaterialColumnMap(); for(const m of maps){ if(m?.sheet_label_kr) this.erpHeaderSet.add(String(m.sheet_label_kr)); } }catch{}
  }

  onUpdateClick(){
    try{
      console.log('[MaterialUpdate] update button clicked', { rows: this.pendingRows().length, busy: this.busy() });
    }catch{}
    if (this.busy()) return;
    if (!this.pendingRows().length){ alert('업데이트할 데이터가 없습니다. 파일을 선택해 주세요.'); return; }
    this.run();
  }

  async onFile(ev: Event){ const input=ev.target as HTMLInputElement; const file=input.files && input.files[0]; if(!file) return; await this.loadFile(file); }

  private async loadFile(file: File){
    this.fileName.set(file.name);
    try{
      const isCSV = (file.name||'').toLowerCase().endsWith('.csv') || (file.type && file.type.includes('csv'));
      if (isCSV){ const text = await file.text(); const wb = XLSX.read(text, { type:'string', raw:true } as any); const ws = wb.Sheets[wb.SheetNames[0]]; const rows:any[][] = XLSX.utils.sheet_to_json(ws, { header:1 }) as any[][]; await this.afterRowsLoaded(rows); return; }
      const ab = await file.arrayBuffer();
      const rows = await this.readWorkbookRowsFromArrayBuffer(ab);
      await this.afterRowsLoaded(rows);
    }catch(e:any){ this.pendingRows.set([]); this.errors.set([{ key:'-', column:'-', message:'파일 읽기 오류: '+(e?.message||e)}]); this.ran.set(true);} }

  private async afterRowsLoaded(rows:any[][]){
    if(!rows || rows.length<2){ this.pendingRows.set([]); return; }
    // Prefer fixed pattern: header at 2nd row (index 1) like Product update
    let headerIdx=-1; let best=-1; let bestKeyHits=-1;
    try{
      const fixed = (rows[1]||[]).map(v=>(v??'').toString().trim()).filter(Boolean);
      // 1행 병합 타이틀이 있는 양식: 2행을 헤더로 간주(열이 여러 개 존재)
      if (fixed.length >= 3) headerIdx = 1;
    }catch{}
    const scanLimit=Math.min(rows.length,50);
    for(let i=0;i<scanLimit && headerIdx<0;i++){
      const cells=(rows[i]||[]).map(v=>(v??'').toString().trim()).filter(Boolean);
      if(!cells.length) continue; const score=cells.reduce((a,c)=>a+(this.erpHeaderSet.has(c)?1:0),0);
      const keyHits=cells.reduce((a,c)=>a+(this.keyColumns.includes(c)?1:0),0);
      if(keyHits>0){
        // Prefer rows with more key columns; tie-breaker by ERP label score; then by earliest index
        if (keyHits>bestKeyHits || (keyHits===bestKeyHits && score>=best)){
          bestKeyHits=keyHits; best=score; headerIdx=i;
        }
      }
    }
    if(headerIdx<0){
      this.pendingRows.set([]);
      this.stats.set({ total:0, updated:0, skipped:0, inserted:0 });
      this.errors.set([{ key:'-', column:'-', message:'엑셀에서 컬럼명 행을 찾지 못했습니다. 파일 상단(1~5행)에 ERP 컬럼명이 있는지 확인해 주세요.' }]);
      this.ran.set(true);
      return;
    }
    const header=(rows[headerIdx]||[]).map(v=>(v??'').toString().trim());
    const payload:any[]=[]; console.log('[MaterialUpdate] header at row', headerIdx+1);
    for(let i=headerIdx+1;i<rows.length;i++){
      const r=rows[i]||[]; const obj:any={};
      for(let c=0;c<header.length;c++){ const key=header[c]; if(!key) continue; obj[key]=r[c]; }
      const hasAnyKey = this.keyColumns.some(k=> obj[k]);
      const isEmpty = !hasAnyKey && Object.values(obj).every(v=>v===undefined||v===null||String(v).trim()==='');
      if(isEmpty) continue; payload.push(obj);
    }
    this.pendingRows.set(payload); this.ran.set(false); this.errors.set([]); this.stats.set({ total: payload.length, updated: 0, skipped: 0, inserted: 0 });
  }

  private async readWorkbookRowsFromArrayBuffer(ab:ArrayBuffer){
    // 1) normal read
    try{
      const wb=XLSX.read(new Uint8Array(ab), { type:'array', cellStyles:false, dense:true } as any);
      const ws=wb.Sheets[wb.SheetNames[0]]; return XLSX.utils.sheet_to_json(ws,{header:1}) as any[][];
    }catch{}
    // 2) sanitize by stripping styles/theme and fixing rels/content-types (some ERP exports fail otherwise)
    try{
      const zip = await JSZip.loadAsync(ab as ArrayBuffer);
      // remove styles and theme
      zip.remove('xl/styles.xml');
      zip.remove('xl/theme/theme1.xml');
      // scrub content types
      const ctPath = '[Content_Types].xml';
      const ctFile = zip.file(ctPath);
      if (ctFile){
        let ct = await ctFile.async('string');
        ct = ct.replace(/<Override[^>]*PartName="\/xl\/styles.xml"[^>]*\/>/g, '')
               .replace(/<Override[^>]*PartName="\/xl\/theme\/theme1.xml"[^>]*\/>/g, '');
        zip.file(ctPath, ct);
      }
      // scrub rels
      const relPath = 'xl/_rels/workbook.xml.rels';
      const relFile = zip.file(relPath);
      if (relFile){
        let rel = await relFile.async('string');
        rel = rel.replace(/<Relationship[^>]*Type="[^"]*\/styles"[^>]*\/>/g, '')
                 .replace(/<Relationship[^>]*Type="[^"]*\/theme"[^>]*\/>/g, '');
        zip.file(relPath, rel);
      }
      const rebuilt = await zip.generateAsync({ type: 'uint8array' });
      const wb2 = XLSX.read(rebuilt, { type: 'array', cellStyles: false, dense: true } as any);
      const ws2 = wb2.Sheets[wb2.SheetNames[0]]; return XLSX.utils.sheet_to_json(ws2, { header: 1 }) as any[][];
    }catch{}
    // 3) minimal XML parse
    const zip=await JSZip.loadAsync(ab as ArrayBuffer); const list=Object.keys(zip.files); const sheetPath=list.find(p=>p.match(/^xl\/worksheets\/sheet\d+\.xml$/))||list.find(p=>p.startsWith('xl/worksheets/')&&p.endsWith('.xml')); if(!sheetPath) return [];
    const sstPath=list.find(p=>p==='xl/sharedStrings.xml'); const sst:string[]=[]; if(sstPath){ const sstXml=await zip.file(sstPath)!.async('string'); const doc=new DOMParser().parseFromString(sstXml,'application/xml'); const items=Array.from(doc.getElementsByTagName('si')); for(const si of items){ let txt=''; const tNodes=si.getElementsByTagName('t'); for(const t of Array.from(tNodes)) txt+=(t.textContent||''); sst.push(txt); } }
    const xml=await zip.file(sheetPath)!.async('string'); const doc=new DOMParser().parseFromString(xml,'application/xml'); const rows:any[][]=[]; const cells=Array.from(doc.getElementsByTagName('c')); const colToIdx=(col:string)=>{ let n=0; for(const ch of col){ n=n*26+(ch.charCodeAt(0)-64);} return n-1; };
    for(const c of cells){ const r=c.getAttribute('r')||''; const m=r.match(/([A-Z]+)(\d+)/); if(!m) continue; const col=colToIdx(m[1]); const rowIdx=parseInt(m[2],10)-1; const t=c.getAttribute('t')||''; const vNode=c.getElementsByTagName('v')[0]; const v=vNode? vNode.textContent: ''; let val:any=v||''; if(t==='s') val=sst[parseInt(v||'0',10)]||''; rows[rowIdx]=rows[rowIdx]||[]; rows[rowIdx][col]=val; }
    for(let i=0;i<rows.length;i++){ const arr=rows[i]; if(!arr) continue; for(let j=0;j<arr.length;j++) if(arr[j]===undefined) arr[j]=''; }
    return rows;
  }

  async run(){
    if(!this.pendingRows().length){ alert('업데이트할 데이터가 없습니다. 파일의 컬럼명 행을 찾지 못했을 수 있어요. 파일 상단에 ERP 컬럼명이 있는지 확인해 주세요.'); return; }
    this.busy.set(true); this.processed.set(0); this.cancelRequested=false;
    try{
      const rows=this.pendingRows().slice(); const CHUNK=300; const MAX_PAR=3; const chunks:any[][]=[]; for(let i=0;i<rows.length;i+=CHUNK) chunks.push(rows.slice(i,i+CHUNK));
      console.log('[MaterialUpdate] start sync', { total: rows.length, chunks: chunks.length });
      const agg:any={ total:rows.length, updated:0, skipped:0, inserted:0 }; const errs:SyncError[]=[]; let next=0;
      const runWorker=async()=>{ while(next<chunks.length && !this.cancelRequested){ const idx=next++; const part=chunks[idx]; try{ const res=await this.erpData.syncMaterialsByExcel({ sheet: part }); agg.updated+=(res.updated||0); agg.skipped+=(res.skipped||0); agg.inserted+=(res.inserted||0); if(Array.isArray(res.errors)) errs.push(...res.errors); }catch(e:any){ console.error('[MaterialUpdate] worker error', e); errs.push({ key:'-', message:e?.message||String(e) }); } finally { this.processed.set(Math.min(rows.length, this.processed()+part.length)); } } };
      const workers=Array.from({length:Math.min(MAX_PAR,chunks.length)},()=>runWorker()); await Promise.all(workers);
      this.errors.set(errs); this.stats.set({ total:this.pendingRows().length, updated:agg.updated||0, skipped:agg.skipped||0, inserted:agg.inserted||0 }); this.ran.set(true);
      const sumMsg = `총 ${agg.updated+agg.skipped+agg.inserted}건 처리 / 업데이트 ${agg.updated} · 신규 ${agg.inserted} · 스킵 ${agg.skipped}${errs.length? ` · 에러 ${errs.length}`:''}`;
      alert(sumMsg);
    } finally { this.busy.set(false); }
  }

  onDragOver(ev:DragEvent){ ev.preventDefault(); this.dragOver.set(true); }
  onDragLeave(ev:DragEvent){ ev.preventDefault(); this.dragOver.set(false); }
  onDrop(ev:DragEvent){ ev.preventDefault(); this.dragOver.set(false); const file=ev.dataTransfer && ev.dataTransfer.files && ev.dataTransfer.files[0]; if(file){ this.loadFile(file); } }

  progress(){ const total=this.stats().total || this.pendingRows().length || 0; if(!total) return 0; return this.processed()/total; }
  clear(fileInput:HTMLInputElement){ this.pendingRows.set([]); this.errors.set([]); this.stats.set({ total:0, updated:0, skipped:0, inserted:0 }); this.processed.set(0); this.fileName.set(''); if(fileInput) fileInput.value=''; }
  cancel(){ this.cancelRequested=true; }
}


