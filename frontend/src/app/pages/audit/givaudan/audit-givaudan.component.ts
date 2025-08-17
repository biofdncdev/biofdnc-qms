import { Component, signal } from '@angular/core';
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
          <div class="item" *ngFor="let it of items()">
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
              <select [(ngModel)]="it.status">
                <option value="pending">준비중 / Pending</option>
                <option value="in-progress">진행중 / In progress</option>
                <option value="on-hold">보류 / On hold</option>
                <option value="na">해당없음 / N.A.</option>
                <option value="impossible">불가 / Not possible</option>
                <option value="done">완료 / Done</option>
              </select>
            </div>
            <div class="note">
              <textarea [(ngModel)]="it.note" rows="2" placeholder="비고 / Notes"></textarea>
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
    .item{ display:grid; grid-template-columns: 54px 1fr 280px 1fr; gap:8px; padding:10px; border-radius:10px; border:1px solid #f1f5f9; margin:8px; background:linear-gradient(180deg,rgba(241,245,249,.35),rgba(255,255,255,1)); }
    .id{ font-weight:700; color:#475569; display:flex; align-items:center; justify-content:center; }
    .ko{ font-weight:600; margin-bottom:2px; }
    .en{ color:#64748b; font-size:.92em; }
    .state{ display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
    .state .meta{ color:#475569; font-size:.85em; }
    select{ padding:6px 8px; border:1px solid #e5e7eb; border-radius:8px; }
    textarea{ width:100%; border:1px solid #e5e7eb; border-radius:10px; padding:8px; resize:vertical; }

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
}
