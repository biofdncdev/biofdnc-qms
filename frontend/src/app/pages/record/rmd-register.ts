import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RecordFeaturesSelectorComponent } from './features/record-features-selector';
import { RecordFeaturesTextPipe } from './features/record-features.pipe';
import { getDefaultRecordFeatures, normalizeRecordFeatures } from './features/record-features.registry';
import { SupabaseService } from '../../services/supabase.service';

interface Cat { id: string; name: string; doc_prefix: string }

@Component({
  selector: 'app-rmd-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RecordFeaturesSelectorComponent, RecordFeaturesTextPipe],
  template: `
  <div class="page" style="padding:16px;">
    <h2 style="margin:0 0 12px 0;">기록 등록</h2>
    <div class="form" style="display:grid; grid-template-columns: 1fr 1fr; gap:12px; max-width:900px;">
      <div style="display:flex; flex-direction:column; grid-column: span 1;">
        <label>규정카테고리 선택</label>
        <select [(ngModel)]="categoryId" (ngModelChange)="onCategoryChange()" style="height:36px; border:1px solid #d1d5db; border-radius:10px;">
          <option [ngValue]="''">선택</option>
          <option *ngFor="let c of cats()" [ngValue]="c.id">{{ formatCatDisplay(c) }}</option>
        </select>
        <small style="color:#64748b;">규정카테고리 선택 시 자동 채번이 가능합니다</small>
      </div>
      <div style="display:flex; flex-direction:column; grid-column: span 1;">
        <label>기록명</label>
        <input type="text" [(ngModel)]="title" placeholder="기록명" style="height:36px; padding:8px 10px; border:1px solid #d1d5db; border-radius:10px;" />
      </div>
      <div style="display:flex; flex-direction:column; grid-column: span 2;">
        <label>기록번호</label>
        <div style="display:flex; gap:8px; align-items:center;">
          <input type="text" [(ngModel)]="docNo" placeholder="예: BF-RMD-GM-FR-01" style="flex:1; height:36px; padding:8px 10px; border:1px solid #d1d5db; border-radius:10px;" />
          <button class="btn" (click)="autoNumber()" [disabled]="busy() || !categoryId">자동채번</button>
          <span *ngIf="dupError()" style="color:#ef4444; font-weight:600;">중복 번호</span>
        </div>
      </div>
      <!-- Features selection (modular) -->
      <div style="grid-column: span 2;">
        <record-features-selector [features]="features"></record-features-selector>
      </div>
      <div style="grid-column: span 2;">
        <button class="btn primary" (click)="save()" [disabled]="busy() || !docNo || !title || !categoryId">{{ busy() ? '저장중…' : '저장' }}</button>
      </div>
    </div>

    <h3 style="margin:16px 0 8px;">기록 등록</h3>
    <div class="list" style="border:1px solid #e5e7eb; border-radius:12px; overflow:hidden;">
      <div style="display:grid; grid-template-columns: 220px 1fr 1fr 1fr 90px 80px; gap:0; background:#f8fafc; border-bottom:1px solid #e5e7eb; padding:8px 10px; font-weight:700;">
        <div>기록번호</div><div>규정카테고리명</div><div>기록명</div><div>포함 기능</div><div>수정</div><div>삭제</div>
      </div>
      <div *ngFor="let r of rows()" style="display:grid; grid-template-columns: 220px 1fr 1fr 1fr 90px 80px; gap:0; padding:8px 10px; border-bottom:1px solid #f1f5f9; align-items:center;">
        <div>{{ r.doc_no }}</div>
        <div>{{ findCat(r.category_id)?.name || '-' }}</div>
        <div>{{ r.title }}</div>
        <div>{{ r.features | recordFeaturesText }}</div>
        <div><button class="btn" (click)="openEdit(r)" [disabled]="busy()">수정</button></div>
        <div><button class="btn danger" (click)="remove(r)" [disabled]="busy()">삭제</button></div>
      </div>
      <div *ngIf="!rows().length" style="padding:12px; color:#94a3b8;">아직 등록된 기록이 없습니다.</div>
    </div>
  </div>
  `,
  styles: [`
    .btn{ background:#2563eb; color:#fff; border:0; border-radius:8px; height:36px; padding:0 12px; cursor:pointer; }
    .btn.primary{ background:#111827; }
    .btn.danger{ background:#ef4444; }
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
  features = getDefaultRecordFeatures();
  constructor(private supabase: SupabaseService){ this.load(); }
  async load(){ this.cats.set(await this.supabase.listRmdCategories()); this.rows.set(await this.supabase.listRmdRecords()); }
  findCat(id: string){ return this.cats().find(c => c.id === id); }
  async onCategoryChange(){ this.dupError.set(false); if (!this.categoryId) return; await this.autoNumber(); }
  async autoNumber(){
    const cat = this.findCat(this.categoryId); if (!cat) return;
    // Build prefix: company_code-dept_code-category_code-FR-
    const prefix = await this.supabase.getRecordPrefixForCategory(cat);
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
      const row = { id, title: this.title.trim(), category_id: this.categoryId, doc_no: this.docNo.trim(), features: { ...this.features } } as any;
      await this.supabase.upsertRmdRecord(row);
      this.title=''; this.categoryId=''; this.docNo=''; this.features=getDefaultRecordFeatures(); this.dupError.set(false);
      await this.load();
    } finally { this.busy.set(false); }
  }
  formatCatDisplay(c: Cat){
    // Expect SupabaseService to enrich cats with department/company when needed; fallback to doc_prefix-name
    const anyC: any = c as any;
    const left = [anyC.company_code, anyC.department_code, anyC.doc_prefix].filter(Boolean).join('-') || `${c.doc_prefix}`;
    const right = [anyC.company_name, anyC.department_name, c.name].filter(Boolean).join('-') || c.name;
    return `${left} ${right}`;
  }
  editOpen = signal<boolean>(false);
  editRow = signal<any | null>(null);
  openEdit(r: any){ this.editRow.set({ ...r }); this.editOpen.set(true); }
  closeEdit(){ this.editOpen.set(false); }
  async submitEdit(){
    const r = this.editRow(); if (!r) return;
    // Validate uniqueness when doc_no changed
    if ((r.doc_no||'').trim() !== (this.rows().find(x=>x.id===r.id)?.doc_no||'')){
      const taken = await this.supabase.isRecordDocNoTaken((r.doc_no||'').trim());
      if (taken){ alert('이미 사용된 기록번호입니다. 다른 번호를 입력하세요.'); return; }
    }
    this.busy.set(true);
    try{
      await this.supabase.upsertRmdRecord({ id: r.id, title: (r.title||'').trim(), category_id: r.category_id, doc_no: (r.doc_no||'').trim(), features: normalizeRecordFeatures(r.features) } as any);
      this.editOpen.set(false);
      await this.load();
    } finally { this.busy.set(false); }
  }
  async remove(r: any){ if(!confirm('삭제할까요?')) return; this.busy.set(true); try{ await this.supabase.deleteRmdRecord(r.id); await this.load(); } finally{ this.busy.set(false); } }
}
