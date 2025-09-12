import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../services/supabase.service';

interface Cat { id: string; name: string; doc_prefix: string }

@Component({
  selector: 'app-rmd-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="page" style="padding:16px;">
    <h2 style="margin:0 0 12px 0;">원료제조팀 기록 등록</h2>
    <div class="form" style="display:grid; grid-template-columns: 1fr 1fr; gap:12px; max-width:900px;">
      <div style="display:flex; flex-direction:column;">
        <label>제목</label>
        <input type="text" [(ngModel)]="title" placeholder="기록 제목" style="height:36px; padding:8px 10px; border:1px solid #d1d5db; border-radius:10px;" />
      </div>
      <div style="display:flex; flex-direction:column;">
        <label>카테고리</label>
        <select [(ngModel)]="categoryId" (ngModelChange)="onCategoryChange()" style="height:36px; border:1px solid #d1d5db; border-radius:10px;">
          <option [ngValue]="''">선택</option>
          <option *ngFor="let c of cats()" [ngValue]="c.id">{{ c.doc_prefix }} · {{ c.name }}</option>
        </select>
        <small style="color:#64748b;">카테고리 선택 시 자동 채번을 시도합니다</small>
      </div>
      <div style="display:flex; flex-direction:column; grid-column: span 2;">
        <label>기록번호</label>
        <div style="display:flex; gap:8px; align-items:center;">
          <input type="text" [(ngModel)]="docNo" placeholder="예: BF-RMD-GM-FR-01" style="flex:1; height:36px; padding:8px 10px; border:1px solid #d1d5db; border-radius:10px;" />
          <button class="btn" (click)="autoNumber()" [disabled]="busy() || !categoryId">자동채번</button>
          <span *ngIf="dupError()" style="color:#ef4444; font-weight:600;">중복 번호</span>
        </div>
      </div>
      <div style="grid-column: span 2;">
        <button class="btn primary" (click)="save()" [disabled]="busy() || !docNo || !title || !categoryId">{{ busy() ? '저장중…' : '저장' }}</button>
      </div>
    </div>

    <h3 style="margin:16px 0 8px;">최근 등록</h3>
    <div class="list" style="border:1px solid #e5e7eb; border-radius:12px; overflow:hidden;">
      <div style="display:grid; grid-template-columns: 220px 1fr 200px; gap:0; background:#f8fafc; border-bottom:1px solid #e5e7eb; padding:8px 10px; font-weight:700;">
        <div>기록번호</div><div>제목</div><div>카테고리</div>
      </div>
      <div *ngFor="let r of rows()" style="display:grid; grid-template-columns: 220px 1fr 200px; gap:0; padding:8px 10px; border-bottom:1px solid #f1f5f9; align-items:center;">
        <div>{{ r.doc_no }}</div>
        <div>{{ r.title }}</div>
        <div>{{ r.category_id }}</div>
      </div>
      <div *ngIf="!rows().length" style="padding:12px; color:#94a3b8;">아직 등록된 기록이 없습니다.</div>
    </div>
  </div>
  `,
  styles: [`
    .btn{ background:#2563eb; color:#fff; border:0; border-radius:8px; height:36px; padding:0 12px; cursor:pointer; }
    .btn.primary{ background:#111827; }
    label{ font-size:12px; color:#475569; margin-bottom:4px; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RmdRegisterComponent {
  cats = signal<Cat[]>([]);
  rows = signal<any[]>([]);
  busy = signal<boolean>(false);
  title = '';
  categoryId = '';
  docNo = '';
  dupError = signal<boolean>(false);
  constructor(private supabase: SupabaseService){ this.load(); }
  async load(){ this.cats.set(await this.supabase.listRmdCategories()); this.rows.set(await this.supabase.listRmdRecords()); }
  private findCat(id: string){ return this.cats().find(c => c.id === id); }
  async onCategoryChange(){ this.dupError.set(false); if (!this.categoryId) return; await this.autoNumber(); }
  async autoNumber(){
    const cat = this.findCat(this.categoryId); if (!cat) return;
    const prefix = cat.doc_prefix.endsWith('-FR') ? cat.doc_prefix : `${cat.doc_prefix}`;
    this.docNo = await this.supabase.getNextRecordDocNo(prefix);
    this.dupError.set(await this.supabase.isRecordDocNoTaken(this.docNo));
  }
  async save(){
    this.busy.set(true);
    try{
      const id = crypto.randomUUID();
      // 중복검사
      const taken = await this.supabase.isRecordDocNoTaken(this.docNo);
      if (taken){ this.dupError.set(true); alert('기록번호가 중복됩니다. 다른 번호로 저장하세요.'); return; }
      const row = { id, title: this.title.trim(), category_id: this.categoryId, doc_no: this.docNo.trim() };
      await this.supabase.upsertRmdRecord(row);
      this.title=''; this.categoryId=''; this.docNo=''; this.dupError.set(false);
      await this.load();
    } finally { this.busy.set(false); }
  }
}
