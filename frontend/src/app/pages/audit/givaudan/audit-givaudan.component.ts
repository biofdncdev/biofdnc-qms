import { Component, HostListener, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../../services/supabase.service';

interface AuditItem { id: number; titleKo: string; titleEn: string; done: boolean; status: 'pending'|'on-hold'|'na'|'impossible'|'in-progress'|'done'; note: string; doneBy?: string; doneAt?: string; }
interface AuditDate { value: string; label: string; }

@Component({
  selector: 'app-audit-givaudan',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="audit-page">
    <header class="audit-header">
      <div class="title">GIVAUDAN Audit</div>
      <div class="controls">
        <label>Audit Date</label>
        <select [ngModel]="selectedDate()" (ngModelChange)="setDate($event)">
          <option *ngFor="let d of dates" [value]="d.value">{{ d.label }}</option>
        </select>
      </div>
    </header>

    <div class="layout">
      <section class="checklist">
        <div class="group">
          <h3>요구사항 / Requirements</h3>
          <div class="item" *ngFor="let it of items()" (click)="toggleDetails(it)" [class.open]="openItemId===it.id">
            <div class="id">{{ it.id | number:'2.0-0' }}</div>
            <div class="text">
              <div class="ko">{{ it.titleKo }}</div>
              <div class="en">{{ it.titleEn }}</div>
            </div>
            <div class="state">
              <label class="checkbox">
                <input type="checkbox" [(ngModel)]="it.done" (ngModelChange)="markDone(it)">
                <span class="box"><span class="tick" *ngIf="it.done">✔</span></span>
              </label>
              <div class="meta" *ngIf="it.doneBy">{{ it.doneBy }} · {{ it.doneAt }}</div>
              <span class="status-swatch" [style.background]="statusColor(it.status)"></span>
              <select [(ngModel)]="it.status" (ngModelChange)="saveProgress(it)" (change)="saveProgress(it)" [ngClass]="statusClass(it.status)" [ngStyle]="statusStyle(it.status)">
                <option *ngFor="let s of statusOptions" [value]="s.value">{{ s.emoji }} {{ s.label }}</option>
              </select>
              <select class="dept-select" multiple [(ngModel)]="it.departments" (ngModelChange)="saveProgress(it)" title="담당 부서 선택">
                <option *ngFor="let d of departments" [value]="d">{{ d }}</option>
              </select>
              <div class="chips" *ngIf="it.departments?.length">
                <span class="chip" *ngFor="let d of it.departments">{{ d }}</span>
              </div>
              <span class="save-badge" *ngIf="saving[it.id]==='saving'">저장중…</span>
              <span class="save-badge saved" *ngIf="saving[it.id]==='saved'">저장됨</span>
            </div>
            <div class="note">
              <textarea [(ngModel)]="it.note" (blur)="saveProgress(it)" rows="2" placeholder="비고 / Notes"></textarea>
            </div>
            <div class="details" *ngIf="openItemId===it.id" (click)="$event.stopPropagation()">
              <div class="details-inner">
                <div class="assessment">
                  <h4>평가 내용 / Assessment</h4>
                  <div class="ass-body">
                    <div class="row"><b>No.</b> <span>{{ assessment?.number }}</span></div>
                    <div class="row"><b>Category</b> <span>{{ assessment?.category_no }}</span></div>
                    <div class="row"><b>Title</b> <span>{{ assessment?.title }}</span></div>
                    <div class="q">{{ assessment?.question }}</div>
                    <div class="t">{{ assessment?.translation }}</div>
                    <div class="acc">{{ assessment?.acceptance_criteria }}</div>
                  </div>
                </div>
                <div class="assign">
                  <label>담당 부서</label>
                  <select multiple [(ngModel)]="it.departments" (ngModelChange)="saveProgress(it)">
                    <option *ngFor="let d of departments" [value]="d">{{ d }}</option>
                  </select>
                  <div class="chips">
                    <span class="chip" *ngFor="let d of it.departments">{{ d }}</span>
                  </div>
                </div>
                <div class="resources-edit">
                  <div class="re-head">
                    <h4>대응 자료 / Resources</h4>
                    <button (click)="addResource(it); $event.stopPropagation()">추가</button>
                  </div>
                  <div class="re-list">
                    <div class="re-item" *ngFor="let r of resources">
                      <div class="info">
                        <div class="name">{{ r.name }}</div>
                        <div class="type">{{ r.type }}</div>
                      </div>
                      <div class="act">
                        <input type="file" (change)="uploadFor(r, $event)" />
                        <button (click)="openResource(r); $event.stopPropagation()">Open</button>
                        <button class="danger" (click)="removeResource(r); $event.stopPropagation()">삭제</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <aside class="resources">
        <h3>대응 자료 / Resources</h3>
        <div class="resource-card" *ngFor="let r of resources">
          <div class="info">
            <div class="name">{{ r.name }}</div>
            <div class="type">{{ r.type }}</div>
          </div>
          <div class="actions">
            <label class="checkbox small">
              <input type="checkbox" [(ngModel)]="r.done">
              <span class="box"><span class="tick" *ngIf="r.done">✔</span></span>
            </label>
            <button (click)="preview(r)">Open</button>
          </div>
        </div>
      </aside>
    </div>

    <div class="preview-backdrop" *ngIf="previewing" (click)="previewing=false">
      <div class="preview" (click)="$event.stopPropagation()">
        <header>
          <div class="name">{{ previewItem?.name }}</div>
          <button (click)="previewing=false">×</button>
        </header>
        <div class="body">
          <p>미리보기(Popup) 예시 콘텐츠입니다. 실제 연결은 규정/지시·기록서/사진 파일로 교체됩니다.</p>
        </div>
      </div>
    </div>
  </div>
  `,
  styles: [`
    .audit-page{ padding:16px; }
    .audit-header{ display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; }
    .title{ font-weight:800; font-size:20px; }
    .controls{ display:flex; align-items:center; gap:8px; }
    .controls select{ padding:8px 10px; border-radius:8px; border:1px solid #e5e7eb; }

    .layout{ display:grid; grid-template-columns: 1fr 320px; gap:16px; }
    @media (max-width: 1100px){ .layout{ grid-template-columns: 1fr; } }

    .checklist{ background:#fff; border:1px solid #eee; border-radius:12px; padding:10px; height: calc(100vh - 160px); overflow:auto; box-shadow:0 8px 22px rgba(2,6,23,.06); }
    .group h3{ margin:8px 6px 12px; }
    .item{ display:grid; grid-template-columns: 54px 1fr 280px 1fr; gap:8px; padding:10px; border-radius:10px; border:1px solid #f1f5f9; margin:8px; background:linear-gradient(180deg,rgba(241,245,249,.35),rgba(255,255,255,1)); position:relative; }
    .id{ font-weight:700; color:#475569; display:flex; align-items:center; justify-content:center; }
    .ko{ font-weight:600; margin-bottom:2px; }
    .en{ color:#64748b; font-size:.92em; }
    .state{ display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
    .state .meta{ color:#475569; font-size:.85em; }
    .status-swatch{ width:12px; height:12px; border-radius:50%; border:2px solid #fff; box-shadow:0 0 0 1px #e5e7eb; }
    select{ padding:6px 8px; border:1px solid #e5e7eb; border-radius:8px; appearance:none; -webkit-appearance:none; -moz-appearance:none; }
    .dept-select{ min-width: 160px; max-width: 220px; }
    /* 상태별 색상 */
    .state select.status-pending{ background:#fff7ed; border-color:#f59e0b; color:#92400e; }
    .state select.status-in-progress{ background:#eff6ff; border-color:#60a5fa; color:#1d4ed8; }
    .state select.status-on-hold{ background:#f3f4f6; border-color:#9ca3af; color:#374151; }
    .state select.status-na{ background:#f8fafc; border-color:#cbd5e1; color:#475569; }
    .state select.status-impossible{ background:#fee2e2; border-color:#ef4444; color:#991b1b; }
    .state select.status-done{ background:#dbeafe; border-color:#3b82f6; color:#1e40af; }
    .save-badge{ margin-left:6px; font-size:.85em; color:#64748b; }
    .save-badge.saved{ color:#16a34a; }
    textarea{ width:100%; max-width: 360px; border:1px solid #e5e7eb; border-radius:10px; padding:8px; resize:vertical; }

    .item .details{ grid-column: 1 / -1; overflow:hidden; }
    .item.open .details{ animation: slideDown .22s ease-out; }
    .details-inner{ display:grid; grid-template-columns: 1.4fr .8fr 1fr; gap:16px; padding:10px 6px 12px; }
    .assessment .row{ display:flex; gap:10px; margin:4px 0; }
    .assessment .q{ margin-top:8px; font-weight:600; }
    .assessment .t{ color:#475569; margin:6px 0; }
    .assessment .acc{ background:#f8fafc; border:1px dashed #e2e8f0; border-radius:8px; padding:8px; }
    .assign select{ min-height: 100px; }
    .chips{ margin-top:8px; display:flex; flex-wrap:wrap; gap:6px; }
    .chip{ background:#eef2ff; color:#3730a3; padding:4px 8px; border-radius:999px; font-weight:600; font-size:.85em; }
    .re-head{ display:flex; align-items:center; justify-content:space-between; }
    .re-item{ display:flex; align-items:center; justify-content:space-between; border:1px solid #eef2f7; border-radius:10px; padding:8px 10px; margin:6px 0; }
    .re-item .act button{ margin-left:6px; }
    .re-item .act .danger{ background:#ef4444; color:#fff; }

    @keyframes slideDown { from{ opacity:0; transform: translateY(-6px); } to{ opacity:1; transform:none; } }

    .checkbox{ display:inline-flex; align-items:center; gap:6px; cursor:pointer; }
    .checkbox input{ display:none; }
    .checkbox .box{ width:22px; height:22px; border-radius:6px; background:#0f172a; display:inline-flex; align-items:center; justify-content:center; }
    .checkbox .tick{ color:#22c55e; font-weight:800; font-size:14px; line-height:1; }
    .checkbox.small .box{ width:18px; height:18px; }
    .checkbox.small .tick{ font-size:12px; }

    .resources{ background:#fff; border:1px solid #eee; border-radius:12px; padding:12px; box-shadow:0 8px 22px rgba(2,6,23,.06); height: calc(100vh - 160px); overflow:auto; }
    .resource-card{ display:flex; align-items:center; justify-content:space-between; border:1px solid #f1f5f9; border-radius:12px; padding:10px 12px; margin:8px 4px; }
    .resource-card .name{ font-weight:700; }
    .resource-card .type{ color:#64748b; font-size:.9em; }
    .resource-card button{ padding:6px 10px; border-radius:8px; background:#4f46e5; color:#fff; border:0; }

    .preview-backdrop{ position:fixed; inset:0; background:rgba(2,6,23,.45); display:flex; align-items:center; justify-content:center; }
    .preview{ width:min(880px,92vw); max-height:80vh; background:#fff; border-radius:16px; box-shadow:0 20px 60px rgba(0,0,0,.2); overflow:hidden; display:flex; flex-direction:column; }
    .preview header{ display:flex; align-items:center; justify-content:space-between; padding:12px 14px; border-bottom:1px solid #eee; font-weight:700; }
    .preview .body{ padding:16px; overflow:auto; }
  `]
})
export class AuditGivaudanComponent {
  constructor(private supabase: SupabaseService){}
  userDisplay = '사용자';
  async ngOnInit(){
    try{ const u = await this.supabase.getCurrentUser(); if(u){ const { data } = await this.supabase.getUserProfile(u.id); this.userDisplay = data?.name || data?.email || '사용자'; } }catch{}
  }

  dates: AuditDate[] = [ { value: '2025-09-16', label: '2025-09-16' } ];
  selectedDate = signal(this.dates[0].value);

  items = signal<AuditItem[]>(Array.from({ length: 214 }, (_, i) => ({
    id: i+1,
    titleKo: `점검 항목 ${i+1}`,
    titleEn: `Inspection item ${i+1}`,
    done: false,
    status: 'pending',
    note: ''
  })));

  resources = [
    { name: 'BF-RMD-QC-IR-02 시험 의뢰/성적서 양식', type: 'Form / IR', done: false },
    { name: 'BF-RMD-PM-IR-02 제조 지시·기록서', type: 'IR', done: false },
    { name: '표준 작업절차(SOP) 문서', type: 'Regulation', done: false },
    { name: 'ERP 스크린샷 (입고/출고 로그)', type: 'External', done: false },
  ];

  setDate(value: string){ this.selectedDate.set(value); }

  markDone(it: AuditItem){
    if(it.done){
      const now = new Date();
      const y = now.getFullYear(); const m = (now.getMonth()+1).toString().padStart(2,'0'); const d = now.getDate().toString().padStart(2,'0');
      const hh = now.getHours().toString().padStart(2,'0'); const mm = now.getMinutes().toString().padStart(2,'0');
      it.doneBy = this.userDisplay; it.doneAt = `${y}-${m}-${d} ${hh}:${mm}`;
    } else { it.doneBy = undefined; it.doneAt = undefined; }
  }

  previewing = false; previewItem: any=null;
  preview(r: any){ this.previewItem = r; this.previewing = true; }

  // Slide open state and assessment/progress
  openItemId: number | null = null;
  assessment: any = null;
  departments = ['원료제조팀','식물세포배양팀','품질팀','연구팀','경영지원팀'];

  async toggleDetails(it: any){
    if(this.openItemId === it.id){ this.openItemId = null; return; }
    this.openItemId = it.id;
    // Load assessment master
    const { data } = await this.supabase.getGivaudanAssessment(it.id);
    this.assessment = data;
    // Load progress
    const { data: prog } = await this.supabase.getGivaudanProgress(it.id);
    if (prog){
      it.status = (prog.status as any) || it.status;
      it.note = prog.note || it.note;
      it.departments = prog.departments || [];
    }
    // Load resources
    const { data: res } = await this.supabase.listGivaudanResources(it.id);
    this.resources = res || [];
  }

  async saveProgress(it: any){
    try{
      this.setSaving(it.id, 'saving');
      const payload = {
        number: it.id,
        note: it.note || null,
        status: it.status || null,
        departments: it.departments || [],
        updated_by: this.userDisplay,
        updated_by_name: this.userDisplay,
      };
      await this.supabase.upsertGivaudanProgress(payload);
      this.setSaving(it.id, 'saved');
      setTimeout(()=>this.setSaving(it.id,'idle'), 1200);
    }catch{}
  }

  async addResource(it: any){
    const row = { number: it.id, name: '새 자료', type: 'Manual', url: null, file_url: null };
    const { data } = await this.supabase.addGivaudanResource(row);
    this.resources = [...(this.resources || []), data];
  }

  async removeResource(r: any){
    await this.supabase.deleteGivaudanResource(r.id);
    this.resources = (this.resources || []).filter((x:any)=>x.id!==r.id);
  }

  async uploadFor(r: any, ev: any){
    const file: File | undefined = ev?.target?.files?.[0];
    if(!file) return;
    const ext = file.name.split('.').pop();
    const path = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
    const { publicUrl } = await this.supabase.uploadAuditFile(file, path);
    r.file_url = publicUrl;
  }

  openResource(r: any){ this.preview(r); }

  @HostListener('document:keydown.escape') onEsc(){
    if(this.previewing){ this.previewing=false; return; }
    if(this.openItemId!=null){ this.openItemId=null; }
  }

  // UI helpers
  saving: Record<number, 'idle'|'saving'|'saved'> = {};
  private setSaving(id: number, state: 'idle'|'saving'|'saved') { this.saving[id] = state; }
  statusOptions = [
    { value: 'pending', label: '준비중 / Pending', emoji: '🟧' },
    { value: 'in-progress', label: '진행중 / In progress', emoji: '🟦' },
    { value: 'on-hold', label: '보류 / On hold', emoji: '⬜' },
    { value: 'na', label: '해당없음 / N.A.', emoji: '⬜' },
    { value: 'impossible', label: '불가 / Not possible', emoji: '🟥' },
    { value: 'done', label: '완료 / Done', emoji: '🟦' },
  ];
  statusClass(status: string){
    return {
      'status-pending': status==='pending',
      'status-in-progress': status==='in-progress',
      'status-on-hold': status==='on-hold',
      'status-na': status==='na',
      'status-impossible': status==='impossible',
      'status-done': status==='done',
    };
  }
  statusStyle(status: string){
    try{
      switch(status){
        case 'pending': return { background:'#fff7ed', borderColor:'#f59e0b', color:'#92400e' } as any;
        case 'in-progress': return { background:'#eff6ff', borderColor:'#60a5fa', color:'#1d4ed8' } as any;
        case 'on-hold': return { background:'#f3f4f6', borderColor:'#9ca3af', color:'#374151' } as any;
        case 'na': return { background:'#f8fafc', borderColor:'#cbd5e1', color:'#475569' } as any;
        case 'impossible': return { background:'#fee2e2', borderColor:'#ef4444', color:'#991b1b' } as any;
        case 'done': return { background:'#dbeafe', borderColor:'#3b82f6', color:'#1e40af' } as any;
        default: return {} as any;
      }
    } catch { return {} as any; }
  }
  statusColor(status: string){
    switch(status){
      case 'pending': return '#f59e0b';
      case 'in-progress': return '#60a5fa';
      case 'on-hold': return '#9ca3af';
      case 'na': return '#cbd5e1';
      case 'impossible': return '#ef4444';
      case 'done': return '#3b82f6';
      default: return '#e5e7eb';
    }
  }
}
