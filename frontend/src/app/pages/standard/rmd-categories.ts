import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../services/supabase.service';

interface Cat { id: string; name: string; doc_prefix: string; department_code?: string | null; created_at?: string; updated_at?: string }

@Component({
  selector: 'app-rmd-categories',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="page" style="padding:16px;">
    <h2 style="margin:0 0 12px 0;">규정 카테고리 등록</h2>
    <div class="form" style="display:flex; gap:8px; align-items:flex-end; flex-wrap:wrap; margin-bottom:12px;">
      <div style="display:flex; flex-direction:column;">
        <label>회사·부서코드</label>
        <select [(ngModel)]="form.department_code" style="height:32px; border:1px solid #d1d5db; border-radius:8px; min-width:220px;">
          <option [ngValue]="null">선택</option>
          <option *ngFor="let d of depts()" [ngValue]="d.code">{{ d.company ? (d.company + '-') : '' }}{{ d.code }} {{ d.name }}</option>
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
        <div>회사·부서코드</div><div>규정카테고리코드</div><div>규정카테고리명</div><div>수정</div><div>삭제</div>
      </div>
      <div *ngFor="let c of cats()" style="display:grid; grid-template-columns: 1fr 1fr 1.4fr 90px 80px; gap:0; padding:8px 10px; border-bottom:1px solid #f1f5f9; align-items:center;">
        <div>{{ formatCompanyDept(c.department_code) }}</div>
        <div>{{ c.doc_prefix }}</div>
        <div>{{ c.name }}</div>
        <div><button class="btn" (click)="openEdit(c)" [disabled]="busy()">수정</button></div>
        <div><button class="btn danger" (click)="remove(c)" [disabled]="busy()">삭제</button></div>
      </div>
      <div *ngIf="!cats().length" style="padding:12px; color:#94a3b8;">등록된 카테고리가 없습니다.</div>
    </div>
    
    <!-- Edit modal -->
    <div *ngIf="editOpen()" style="position:fixed; inset:0; background:rgba(0,0,0,0.35); display:flex; align-items:center; justify-content:center; z-index:1000;">
      <div style="background:#fff; border-radius:12px; min-width:520px; padding:16px; box-shadow:0 10px 30px rgba(0,0,0,0.18);">
        <h3 style="margin:0 0 12px 0; font-size:18px;">규정 카테고리 수정</h3>
        <div style="display:flex; gap:8px; align-items:flex-end; flex-wrap:wrap; margin-bottom:12px;">
          <div style="display:flex; flex-direction:column;">
            <label>회사·부서코드</label>
            <select [ngModel]="editForm().department_code" (ngModelChange)="setEditField('department_code',$event)" style="height:32px; border:1px solid #d1d5db; border-radius:8px; min-width:220px;">
              <option [ngValue]="null">선택</option>
              <option *ngFor="let d of depts()" [ngValue]="d.code">{{ d.company ? (d.company + '-') : '' }}{{ d.code }} {{ d.name }}</option>
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
    .btn{ background:#2563eb; color:#fff; border:0; border-radius:8px; cursor:pointer; }
    .btn.danger{ background:#ef4444; }
    label{ font-size:12px; color:#475569; margin-bottom:4px; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RmdCategoriesComponent {
  cats = signal<Cat[]>([]);
  busy = signal<boolean>(false);
  form: { name: string; doc_prefix: string; department_code: string | null } = { name: '', doc_prefix: '', department_code: null };
  depts = signal<Array<{ code: string; name: string; company?: string }>>([]);
  constructor(private supabase: SupabaseService){ this.load(); }
  async load(){
    this.cats.set(await this.supabase.listRmdCategories());
    const ds = await this.supabase.listDepartments();
    this.depts.set((ds||[]).map((d:any)=>({ code: d.code, name: d.name, company: d.company_code || null })));
  }
  async save(){
    if(!this.form.department_code){ alert('회사·부서코드를 선택해 주세요.'); return; }
    if(!(this.form.doc_prefix||'').trim()){ alert('규정카테고리코드는 필수입니다.'); return; }
    if(!(this.form.name||'').trim()){ alert('규정카테고리명은 필수입니다.'); return; }
    this.busy.set(true);
    try{
      await this.supabase.upsertRmdCategory({ name: this.form.name.trim(), doc_prefix: this.form.doc_prefix.trim(), department_code: this.form.department_code || null } as any);
      this.form = { name:'', doc_prefix:'', department_code: null };
      await this.load();
    }
    finally{ this.busy.set(false); }
  }
  formatCompanyDept(code: string | null | undefined){
    if (!code) return '-';
    const d = (this.depts() || []).find(x => x.code === code);
    return (d && d.company) ? `${d.company}-${code}` : code;
  }
  editOpen = signal<boolean>(false);
  editForm = signal<{ id?: string; department_code: string | null; doc_prefix: string; name: string }>({ department_code: null, doc_prefix: '', name: '' });
  openEdit(c: Cat){ this.editForm.set({ id: (c as any).id, department_code: c.department_code || null, doc_prefix: c.doc_prefix, name: c.name }); this.editOpen.set(true); }
  closeEdit(){ this.editOpen.set(false); }
  setEditField(key: 'department_code'|'doc_prefix'|'name', value: any){ const cur = this.editForm(); this.editForm.set({ ...cur, [key]: value }); }
  async submitEdit(){
    const f = this.editForm();
    if(!f.department_code){ alert('회사·부서코드를 선택해 주세요.'); return; }
    if(!(f.doc_prefix||'').trim()){ alert('규정카테고리코드는 필수입니다.'); return; }
    if(!(f.name||'').trim()){ alert('규정카테고리명은 필수입니다.'); return; }
    this.busy.set(true);
    try{
      await this.supabase.upsertRmdCategory({ id: f.id as any, name: f.name.trim(), doc_prefix: f.doc_prefix.trim(), department_code: f.department_code } as any);
      this.editOpen.set(false);
      await this.load();
    } finally{ this.busy.set(false); }
  }
  async remove(c: Cat){ if(!confirm('삭제할까요?')) return; this.busy.set(true); try{ await this.supabase.deleteRmdCategory(c.id); await this.load(); } finally{ this.busy.set(false); } }
}
