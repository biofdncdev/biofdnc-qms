import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecordService } from '../../services/record.service';
import { OrganizationService } from '../../services/organization.service';
import { FormsModule } from '@angular/forms';

interface Cat { id: string; name: string; doc_prefix: string; department_code?: string | null; company_code?: string | null; created_at?: string; updated_at?: string }

@Component({
  selector: 'app-rmd-categories',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="page" style="padding:16px;">
    <h2 style="margin:0 0 12px 0;">규정 카테고리 등록</h2>
    <div class="form" style="display:flex; gap:8px; align-items:flex-end; flex-wrap:wrap; margin-bottom:12px;">
      <div style="display:flex; flex-direction:column;">
        <label>회사코드</label>
        <select [(ngModel)]="form.company_code" style="height:32px; border:1px solid #d1d5db; border-radius:8px; min-width:220px;">
          <option [ngValue]="null">선택</option>
          <option *ngFor="let c of companies()" [ngValue]="c.code">{{ c.code }} · {{ c.name }}</option>
        </select>
      </div>
      <div style="display:flex; flex-direction:column;">
        <label>규정카테고리코드</label>
        <input type="text" [(ngModel)]="form.doc_prefix" placeholder="예: GM" style="height:32px; padding:6px 8px; border:1px solid #d1d5db; border-radius:8px; min-width:140px;" />
      </div>
      <div style="display:flex; flex-direction:column;">
        <label>규정카테고리명</label>
        <input type="text" [(ngModel)]="form.name" placeholder="예: 일반관리기준서" style="height:32px; padding:6px 8px; border:1px solid #d1d5db; border-radius:8px; min-width:260px;" />
      </div>
      <button class="btn" (click)="save()" [disabled]="busy()" style="height:32px; padding:0 12px;">{{ busy() ? '저장중…' : '저장' }}</button>
    </div>

    <div class="list" style="border:1px solid #e5e7eb; border-radius:12px; overflow:hidden;">
      <div style="display:grid; grid-template-columns: 1fr 1fr 1.4fr 90px 80px; gap:0; background:#f8fafc; border-bottom:1px solid #e5e7eb; padding:8px 10px; font-weight:700;">
        <div>회사코드</div><div>규정카테고리코드</div><div>규정카테고리명</div><div>수정</div><div>삭제</div>
      </div>
      <div *ngFor="let c of cats()" style="display:grid; grid-template-columns: 1fr 1fr 1.4fr 90px 80px; gap:0; padding:8px 10px; border-bottom:1px solid #f1f5f9; align-items:center;">
        <div>{{ c.company_code || '-' }}</div>
        <div>{{ c.doc_prefix }}</div>
        <div>{{ c.name }}</div>
        <div style="display:flex; align-items:center; justify-content:center;"><button class="btn secondary" (click)="openEdit(c)" [disabled]="busy()">수정</button></div>
        <div style="display:flex; align-items:center; justify-content:center;"><button class="btn danger" (click)="remove(c)" [disabled]="busy()">삭제</button></div>
      </div>
      <div *ngIf="!cats().length" style="padding:12px; color:#94a3b8;">등록된 카테고리가 없습니다.</div>
    </div>
    
    <!-- Edit modal -->
    <div *ngIf="editOpen()" style="position:fixed; inset:0; background:rgba(0,0,0,0.35); display:flex; align-items:center; justify-content:center; z-index:1000;">
      <div style="background:#fff; border-radius:12px; min-width:520px; padding:16px; box-shadow:0 10px 30px rgba(0,0,0,0.18);">
        <h3 style="margin:0 0 12px 0; font-size:18px;">규정 카테고리 수정</h3>
        <div style="display:flex; gap:8px; align-items:flex-end; flex-wrap:wrap; margin-bottom:12px;">
          <div style="display:flex; flex-direction:column;">
            <label>회사코드</label>
            <select [ngModel]="editForm().company_code" (ngModelChange)="setEditField('company_code',$event)" style="height:32px; border:1px solid #d1d5db; border-radius:8px; min-width:220px;">
              <option [ngValue]="null">선택</option>
              <option *ngFor="let c of companies()" [ngValue]="c.code">{{ c.code }} · {{ c.name }}</option>
            </select>
          </div>
          <div style="display:flex; flex-direction:column;">
            <label>규정카테고리코드</label>
            <input type="text" [ngModel]="editForm().doc_prefix" (ngModelChange)="setEditField('doc_prefix',$event)" style="height:32px; padding:6px 8px; border:1px solid #d1d5db; border-radius:8px; min-width:140px;" />
          </div>
          <div style="display:flex; flex-direction:column; flex:1; min-width:240px;">
            <label>규정카테고리명</label>
            <input type="text" [ngModel]="editForm().name" (ngModelChange)="setEditField('name',$event)" style="height:32px; padding:6px 8px; border:1px solid #d1d5db; border-radius:8px;" />
          </div>
        </div>
        <div style="display:flex; gap:8px; justify-content:flex-end;">
          <button class="btn secondary" (click)="closeEdit()">취소</button>
          <button class="btn" (click)="submitEdit()" [disabled]="busy()">{{ busy() ? '저장중…' : '저장' }}</button>
        </div>
      </div>
    </div>
  </div>
  `,
  styles: [`
    .btn{ 
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background:#3b82f6; 
      color:#fff; 
      border:2px solid #3b82f6; 
      border-radius:8px; 
      cursor:pointer;
      font-weight:500;
      transition: all 0.2s;
      padding: 6px 12px;
      height: 32px;
    }
    .btn:hover:not(:disabled){ 
      background:#2563eb; 
      border-color:#2563eb;
    }
    .btn:disabled{ 
      opacity:0.5; 
      cursor:not-allowed;
    }
    .btn.secondary{ 
      background:#fff; 
      color:#475569; 
      border:2px solid #cbd5e1;
    }
    .btn.secondary:hover:not(:disabled){ 
      background:#f8fafc; 
      border-color:#94a3b8;
    }
    .btn.danger{ 
      background:#fff; 
      color:#dc2626; 
      border:2px solid #fca5a5;
    }
    .btn.danger:hover:not(:disabled){ 
      background:#fef2f2; 
      border-color:#f87171;
    }
    label{ font-size:12px; color:#475569; margin-bottom:4px; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RmdCategoriesComponent {
  cats = signal<Cat[]>([]);
  busy = signal<boolean>(false);
  form: { name: string; doc_prefix: string; company_code: string | null } = { name: '', doc_prefix: '', company_code: null };
  companies = signal<Array<{ code: string; name: string }>>([]);
  constructor(
    private record: RecordService,
    private org: OrganizationService
  ) { this.load(); }
  async load(){
    this.cats.set(await this.record.listRmdCategories());
    try {
      const list = (await (this.org as any).listCompanies?.()) || [];
      this.companies.set(list);
    } catch {
      this.companies.set([]);
    }
  }
  async save(){
    if(!this.form.company_code){ alert('회사코드를 선택해 주세요.'); return; }
    if(!(this.form.doc_prefix||'').trim()){ alert('규정카테고리코드는 필수입니다.'); return; }
    if(!(this.form.name||'').trim()){ alert('규정카테고리명은 필수입니다.'); return; }
    this.busy.set(true);
    try{
      const res = await this.record.upsertRmdCategory({ name: this.form.name.trim(), doc_prefix: this.form.doc_prefix.trim(), company_code: this.form.company_code || null } as any);
      if ((res as any)?.error) console.warn('[save] upsertRmdCategory returned error', (res as any).error);
      this.form = { name:'', doc_prefix:'', company_code: this.form.company_code };
      await this.load();
    }
    finally{ this.busy.set(false); }
  }
  editOpen = signal<boolean>(false);
  editForm = signal<{ id?: string; company_code: string | null; doc_prefix: string; name: string }>({ company_code: null, doc_prefix: '', name: '' });
  openEdit(c: Cat){ this.editForm.set({ id: (c as any).id, company_code: (c as any).company_code || null, doc_prefix: c.doc_prefix, name: c.name }); this.editOpen.set(true); }
  closeEdit(){ this.editOpen.set(false); }
  setEditField(key: 'company_code'|'doc_prefix'|'name', value: any){ const cur = this.editForm(); this.editForm.set({ ...cur, [key]: value }); }
  async submitEdit(){
    const f = this.editForm();
    if(!f.company_code){ alert('회사코드를 선택해 주세요.'); return; }
    if(!(f.doc_prefix||'').trim()){ alert('규정카테고리코드는 필수입니다.'); return; }
    if(!(f.name||'').trim()){ alert('규정카테고리명은 필수입니다.'); return; }
    this.busy.set(true);
    try{
      const res = await this.record.upsertRmdCategory({ id: f.id as any, name: f.name.trim(), doc_prefix: f.doc_prefix.trim(), company_code: f.company_code } as any);
      if ((res as any)?.error) console.warn('[submitEdit] upsertRmdCategory returned error', (res as any).error);
      this.editOpen.set(false);
      await this.load();
    } finally{ this.busy.set(false); }
  }
  async remove(c: Cat){ if(!confirm('삭제할까요?')) return; this.busy.set(true); try{ const res = await this.record.deleteRmdCategory(c.id); if ((res as any)?.error) console.warn('[remove] deleteRmdCategory returned error', (res as any).error); await this.load(); } finally{ this.busy.set(false); } }
}
