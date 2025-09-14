import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../services/supabase.service';

interface Dept { id: string; name: string; code: string }

@Component({
  selector: 'app-dept-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="page" style="padding:16px;">
    <h2 style="margin:0 0 12px 0;">회사ㆍ부서 코드 등록</h2>
    <div style="display:flex; gap:8px; align-items:flex-end; flex-wrap:wrap; margin-bottom:12px;">
      <div style="display:flex; flex-direction:column;">
        <label>회사코드</label>
        <input type="text" [(ngModel)]="companyCode" placeholder="예: BF" style="height:32px; padding:6px 8px; border:1px solid #d1d5db; border-radius:8px; width:120px;" />
      </div>
      <div style="display:flex; flex-direction:column; min-width:260px;">
        <label>회사명</label>
        <input type="text" [(ngModel)]="companyName" placeholder="예: 회사명" style="height:32px; padding:6px 8px; border:1px solid #d1d5db; border-radius:8px;" />
      </div>
      <button class="btn" (click)="saveCompany()" [disabled]="busyCompany()" style="height:32px; padding:0 12px;">{{ busyCompany() ? '저장중…' : '저장' }}</button>
    </div>

    <div style="display:flex; gap:8px; align-items:flex-end; flex-wrap:wrap; margin-bottom:12px;">
      <div style="display:flex; flex-direction:column;">
        <label>부서코드</label>
        <input type="text" [(ngModel)]="code" placeholder="예: RM" style="height:32px; padding:6px 8px; border:1px solid #d1d5db; border-radius:8px; width:120px;" />
      </div>
      <div style="display:flex; flex-direction:column;">
        <label>부서명</label>
        <input type="text" [(ngModel)]="name" placeholder="예: 원료제조팀" style="height:32px; padding:6px 8px; border:1px solid #d1d5db; border-radius:8px;" />
      </div>
      <button class="btn" (click)="save()" [disabled]="busyDept()" style="height:32px; padding:0 12px;">{{ busyDept() ? '저장중…' : '저장' }}</button>
      
    </div>

    <div class="list" style="border:1px solid #e5e7eb; border-radius:12px; overflow:hidden; max-width:880px;">
      <div style="display:grid; grid-template-columns: 120px 1fr 90px 80px; gap:0; background:#f8fafc; border-bottom:1px solid #e5e7eb; padding:8px 10px; font-weight:700;">
        <div>회사코드</div><div>회사명</div><div>수정</div><div>삭제</div>
      </div>
      <div *ngFor="let c of companies()" style="display:grid; grid-template-columns: 120px 1fr 90px 80px; gap:0; padding:8px 10px; border-bottom:1px solid #f1f5f9; align-items:center;">
        <div>{{ c.code }}</div>
        <div>{{ c.name }}</div>
        <div><button class="btn" (click)="editCompany(c)" [disabled]="busyCompany()">수정</button></div>
        <div><button class="btn danger" (click)="removeCompany(c)" [disabled]="busyCompany()">삭제</button></div>
      </div>
      <div *ngIf="!companies().length" style="padding:12px; color:#94a3b8;">등록된 회사가 없습니다.</div>
    </div>

    <div class="list" style="border:1px solid #e5e7eb; border-radius:12px; overflow:hidden; max-width:880px; margin-top:16px;">
      <div style="display:grid; grid-template-columns: 120px 1fr 90px 80px; gap:0; background:#f8fafc; border-bottom:1px solid #e5e7eb; padding:8px 10px; font-weight:700;">
        <div>부서코드</div><div>부서명</div><div>수정</div><div>삭제</div>
      </div>
      <div *ngFor="let d of depts()" style="display:grid; grid-template-columns: 120px 1fr 90px 80px; gap:0; padding:8px 10px; border-bottom:1px solid #f1f5f9; align-items:center;">
        <div>{{ d.code }}</div>
        <div>{{ d.name }}</div>
        <div><button class="btn" (click)="edit(d)" [disabled]="busyDept()">수정</button></div>
        <div><button class="btn danger" (click)="remove(d)" [disabled]="busyDept()">삭제</button></div>
      </div>
      <div *ngIf="!depts().length" style="padding:12px; color:#94a3b8;">등록된 부서가 없습니다.</div>
    </div>
  </div>
  `,
  styles: [`
    .btn{ background:#2563eb; color:#fff; border:0; border-radius:8px; cursor:pointer; }
    .btn.secondary{ background:#111827; }
    .btn.danger{ background:#ef4444; }
    label{ font-size:12px; color:#475569; margin-bottom:4px; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeptRegisterComponent {
  depts = signal<Dept[]>([]);
  companies = signal<Array<{ id?: string; code: string; name: string }>>([]);
  name = '';
  code = '';
  companyCode = '';
  companyName = '';
  busyDept = signal<boolean>(false);
  busyCompany = signal<boolean>(false);
  constructor(private supabase: SupabaseService){ this.load(); }
  async load(){ this.depts.set(await this.supabase.listDepartments()); try{ const list = (await (this.supabase as any).listCompanies?.()) || []; this.companies.set(list); }catch{ this.companies.set([]); } }
  async save(){
    if(!(this.name||'').trim() || !(this.code||'').trim()) return;
    this.busyDept.set(true);
    try{
      await this.supabase.upsertDepartment({
        name: this.name.trim(),
        code: this.code.trim(),
        company_code: (this.companyCode||'').trim() || null,
        company_name: (this.companyName||'').trim() || null,
      } as any);
      this.name=''; this.code='';
      await this.load();
    } finally{ this.busyDept.set(false); }
  }
  async remove(d: Dept){
    const text = prompt('삭제 확인을 위해 다음 문구를 입력하세요: 삭제');
    if ((text||'').trim() !== '삭제') return;
    this.busyDept.set(true);
    try{
      await this.supabase.deleteDepartment(d.id);
      await this.load();
    } finally { this.busyDept.set(false); }
  }
  async edit(d: Dept){
    const name = prompt('부서명을 입력하세요', (d as any).name);
    if (name === null) return;
    const code = prompt('부서코드를 입력하세요', (d as any).code || '');
    if (code === null) return;
    const companyCode = prompt('회사코드를 입력하세요', (d as any).company_code || this.companyCode || '');
    if (companyCode === null) return;
    const companyName = prompt('회사명을 입력하세요', (d as any).company_name || this.companyName || '');
    if (companyName === null) return;
    const nn = (name||'').trim(); const cc = (code||'').trim();
    const ccode = (companyCode||'').trim(); const cname = (companyName||'').trim();
    if (!nn || !cc){ alert('부서명과 부서코드는 필수입니다.'); return; }
    this.busyDept.set(true);
    try{
      await this.supabase.upsertDepartment({ id: (d as any).id, name: nn, code: cc, company_code: ccode || null, company_name: cname || null } as any);
      await this.load();
    } finally { this.busyDept.set(false); }
  }
  async editCompany(c: { id?: string; code: string; name: string }){
    const name = prompt('회사명을 입력하세요', c.name);
    if (name === null) return;
    const code = prompt('회사코드를 입력하세요', c.code || '');
    if (code === null) return;
    const nn = (name||'').trim(); const cc = (code||'').trim();
    if (!nn || !cc){ alert('회사명과 회사코드는 필수입니다.'); return; }
    this.busyCompany.set(true);
    try{
      await (this.supabase as any).upsertCompany?.({ id: (c as any).id, name: nn, code: cc });
      await this.load();
    } finally{ this.busyCompany.set(false); }
  }
  async saveCompany(){
    const cc = (this.companyCode||'').trim();
    const nn = (this.companyName||'').trim();
    if (!cc || !nn){ alert('회사코드와 회사명은 필수입니다.'); return; }
    this.busyCompany.set(true);
    try{
      await (this.supabase as any).upsertCompany?.({ code: cc, name: nn });
      await this.load();
    } finally{ this.busyCompany.set(false); }
  }
  async removeCompany(c: { id?: string; code: string; name: string }){
    // 회사 삭제는 현재 단계에서 미지원: 메시지만
    alert('회사 삭제는 현재 지원되지 않습니다. 부서에서 회사코드 사용을 중지해 주세요.');
  }
  
}
