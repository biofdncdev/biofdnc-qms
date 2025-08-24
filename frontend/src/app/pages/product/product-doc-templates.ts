import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComposePreviewComponent } from './compose-preview';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-product-doc-templates',
  standalone: true,
  imports: [CommonModule, ComposePreviewComponent],
  template: `
  <div class="page">
    <header class="top">
      <h2>Product <span class="sub">서류양식</span></h2>
      <div class="spacer"></div>
    </header>
    <section class="split">
      <aside class="left">
        <div class="group">
          <div class="g-title">기본서류</div>
          <button class="item dim" disabled>SPEC</button>
          <button class="item" [class.active]="active==='composition'" (click)="select('composition')">Composition</button>
        </div>
        <div class="group">
          <div class="g-title">시험서류</div>
          <button class="item dim" disabled>COA</button>
        </div>
        <div class="group">
          <div class="g-title">인증서류</div>
          <button class="item dim" disabled>Source of Origin</button>
          <button class="item dim" disabled>REACH Statement</button>
          <button class="item dim" disabled>Animal Testing Certification</button>
          <button class="item dim" disabled>CITES Certification</button>
        </div>
      </aside>
      <main class="right">
        <ng-container [ngSwitch]="active">
          <div *ngSwitchCase="'composition'" class="card">
            <h3>Composition 서류양식</h3>
            <p class="hint">예제 파일 첨부: 이미지(JPG/PNG) 또는 Excel(XLS/XLSX/CSV)을 드래그앤드롭 하세요.</p>
            <div class="dropzone" [class.over]="dragOver" (dragover)="onDragOver($event)" (dragleave)="onDragLeave($event)" (drop)="onDrop($event)">
              <div class="dz-inner">
                <div class="dz-desc">파일을 여기에 놓거나</div>
                <label class="file-btn">
                  파일 선택
                  <input type="file" (change)="onPick($event)" accept="image/*,.xls,.xlsx,.csv" />
                </label>
              </div>
              <div class="dz-files" *ngIf="templateUrl || pendingFile || lastUploadedName">
                <div class="dz-file" *ngIf="templateUrl">
                  <div class="name"><a [href]="templateUrl" target="_blank">서버 저장된 템플릿</a></div>
                  <button class="x" title="삭제" (click)="removeServer($event)">×</button>
                </div>
                <div class="dz-file" *ngIf="pendingFile || lastUploadedName">
                  <div class="name">{{ pendingFile?.name || lastUploadedName }}</div>
                  <button class="x" *ngIf="pendingFile" title="제거" (click)="removePending($event)">×</button>
                </div>
              </div>
            </div>
            <div class="actions">
              <button class="mini primary" (click)="saveTemplate()" [disabled]="!pendingFile">저장하기</button>
              <span class="msg" *ngIf="notice">{{ notice }}</span>
            </div>

            <div class="logs" *ngIf="logs.length">
              <div class="log-title">저장 로그</div>
              <ul>
                <li *ngFor="let l of logs">{{ l.time }} · {{ l.user || 'unknown' }}</li>
              </ul>
            </div>

            <div class="preview-title">PDF 미리보기 (HTML) (양식)</div>
            <div class="preview-wrap">
              <app-compose-preview></app-compose-preview>
            </div>
          </div>
          <div *ngSwitchDefault class="card dim">
            <p>좌측에서 항목을 선택해 주세요. (Composition만 활성화됨)</p>
          </div>
        </ng-container>
      </main>
    </section>
  </div>
  `,
  styles: [`
    .page{ padding:12px 16px; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','Inter','Noto Sans KR','Apple SD Gothic Neo','Malgun Gothic','Helvetica Neue',Arial,sans-serif; }
    .top{ display:flex; align-items:center; margin-bottom:8px; }
    .top h2{ margin:0; font-size:24px; font-weight:800; }
    .top .sub{ font-size:16px; font-weight:700; color:#6b7280; margin-left:6px; }
    .top .spacer{ flex:1; }
    .split{ display:grid; grid-template-columns: 280px 1fr; gap:16px; }
    .left{ border:1px solid #e5e7eb; border-radius:10px; padding:10px; background:#fff; }
    .group{ margin-bottom:12px; }
    .g-title{ font-weight:700; font-size:13px; margin-bottom:6px; color:#111827; }
    .item{ display:block; width:100%; text-align:left; padding:8px 10px; border:1px solid #d1d5db; border-radius:8px; background:#fff; cursor:pointer; font-size:12px; margin-bottom:6px; }
    .item.active{ background:#eef6ff; border-color:#93c5fd; }
    .item.dim{ color:#9ca3af; border-color:#e5e7eb; cursor:not-allowed; }
    .item.dim[disabled]{ pointer-events:none; }
    .right{ min-height:360px; border:1px solid #e5e7eb; border-radius:10px; background:#fff; padding:12px; }
    .card{ padding:8px; }
    .card h3{ margin:0 0 8px; font-size:16px; }
    .card.dim{ color:#9ca3af; }
    .hint{ color:#6b7280; font-size:12px; margin:0 0 8px; }
    .dropzone{ border:2px dashed #cbd5e1; border-radius:12px; padding:16px; text-align:center; color:#6b7280; background:#f8fafc; position:relative; }
    .dropzone.over{ background:#eef6ff; border-color:#93c5fd; color:#0c4a6e; }
    .dz-inner{ display:flex; gap:10px; justify-content:center; align-items:center; flex-wrap:wrap; }
    .dz-desc{ opacity:.9; }
    .file-btn{ display:inline-block; padding:6px 10px; border:1px solid #d1d5db; border-radius:8px; background:#fff; color:#111827; cursor:pointer; font-size:12px; }
    .file-btn input{ display:none; }
    .dz-files{ margin-top:10px; display:flex; gap:8px; flex-wrap:wrap; justify-content:center; }
    .dz-file{ position:relative; border:1px solid #e5e7eb; background:#fff; border-radius:8px; padding:6px 28px 6px 8px; font-size:12px; }
    .dz-file .name{ max-width:320px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    .dz-file .x{ position:absolute; right:6px; top:4px; border:none; background:transparent; cursor:pointer; color:#9ca3af; font-size:14px; }
    .dz-file .x:hover{ color:#ef4444; }
    .actions{ margin-top:10px; display:flex; align-items:center; gap:10px; }
    .mini{ height:28px; padding:0 10px; border-radius:8px; border:1px solid #d1d5db; background:#fff; cursor:pointer; font-size:12px; }
    .mini.primary{ background:#111827; color:#fff; border-color:#111827; }
    .msg{ color:#0c4a6e; font-size:12px; }
    .logs{ margin-top:12px; }
    .log-title{ font-weight:700; font-size:12px; color:#374151; margin-bottom:4px; }
    .logs ul{ list-style:none; margin:0; padding:0; }
    .logs li{ font-size:12px; color:#6b7280; padding:2px 0; }
    .preview-title{ margin-top:12px; font-weight:700; font-size:12px; color:#374151; }
    .preview-wrap{ margin-top:8px; border:1px solid #e5e7eb; border-radius:10px; padding:10px; background:#f9fafb; overflow:auto; }
    .preview-wrap .no-print{ display:none !important; }
    @media (max-width: 820px){ .split{ grid-template-columns:1fr; } }
  `]
})
export class ProductDocTemplatesComponent {
  active: 'composition' | null = 'composition';
  dragOver = false;
  pendingFile: File | null = null;
  lastUploadedName: string | null = null;
  private templateKey = 'product.template.composition.xlsx';
  private logsKey = 'product.template.composition.logs';
  templateUrl: string | null = null;
  notice: string | null = null;
  logs: Array<{ user: string | null; time: string }> = [];

  constructor(private supabase: SupabaseService) {
    this.loadTemplateStatus();
    this.loadLogs();
  }

  async loadTemplateStatus(){
    try{ const { exists, url } = await this.supabase.getCompositionTemplate() as any; this.templateUrl = exists ? (url as string) : null; }catch{ this.templateUrl = null; }
  }

  loadLogs(){ try{ const raw = localStorage.getItem(this.logsKey); this.logs = raw ? JSON.parse(raw) : []; }catch{ this.logs = []; } }
  saveLogs(){ try{ localStorage.setItem(this.logsKey, JSON.stringify(this.logs)); }catch{} }

  select(key: 'composition'){ this.active = key; }

  onDragOver(ev: DragEvent){ ev.preventDefault(); this.dragOver = true; }
  onDragLeave(ev: DragEvent){ ev.preventDefault(); this.dragOver = false; }
  onDrop(ev: DragEvent){
    ev.preventDefault(); this.dragOver = false;
    const list = ev.dataTransfer?.files; if (!list || list.length===0) return;
    const f = list[0]; // only one template
    this.setPending(f);
  }
  onPick(ev: Event){
    const input = ev.target as HTMLInputElement | null;
    const f = input?.files?.[0];
    if (!f) return; this.setPending(f); if (input) input.value = '';
  }
  setPending(file: File){ this.pendingFile = file; this.lastUploadedName = file?.name || null; this.notice = null; }
  removePending(e?: Event){ if (e) e.stopPropagation(); this.pendingFile = null; }
  async removeServer(e?: Event){ e?.stopPropagation(); await this.deleteTemplate(); }

  async saveTemplate(){
    if (!this.pendingFile) { this.notice = '저장할 템플릿 파일이 없습니다.'; return; }
    try{
      const res = await this.supabase.uploadCompositionTemplate(this.pendingFile);
      this.templateUrl = (res as any)?.url || null;
      this.lastUploadedName = this.pendingFile?.name || this.lastUploadedName;
      this.pendingFile = null;
      const user = await this.supabase.getCurrentUser();
      const now = new Date(); const pad=(n:number)=> String(n).padStart(2,'0');
      const time = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
      this.logs = [{ user: user?.email || user?.id || 'unknown', time }, ...this.logs].slice(0, 50);
      this.saveLogs();
      this.notice = '저장되었습니다.';
    }catch(e:any){ this.notice = '저장 중 오류: ' + (e?.message||e); }
  }

  async deleteTemplate(){
    try{ await this.supabase.deleteCompositionTemplate(); this.templateUrl = null; this.notice = '삭제되었습니다.'; }
    catch(e:any){ this.notice = '삭제 실패: ' + (e?.message||e); }
  }
}
