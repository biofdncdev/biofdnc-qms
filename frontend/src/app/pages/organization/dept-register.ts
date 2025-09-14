import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../services/supabase.service';

interface Dept { id: string; name: string; code: string; company_code?: string }

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
      <div style="display:flex; flex-direction:column; min-width:220px;">
        <label>회사코드 선택</label>
        <select [(ngModel)]="selectedCompanyCode" (change)="onSelectCompany()" style="height:32px; padding:6px 8px; border:1px solid #d1d5db; border-radius:8px;">
          <option [ngValue]="''">회사코드 선택</option>
          <option *ngFor="let c of companies()" [ngValue]="c.code">{{ c.code }} · {{ c.name }}</option>
        </select>
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
        <div><button class="btn" (click)="openCompanyEdit(c)" [disabled]="busyCompany()">수정</button></div>
        <div><button class="btn danger" (click)="removeCompany(c)" [disabled]="busyCompany()">삭제</button></div>
      </div>
      <div *ngIf="!companies().length" style="padding:12px; color:#94a3b8;">등록된 회사가 없습니다.</div>
    </div>

    <div class="list" style="border:1px solid #e5e7eb; border-radius:12px; overflow:hidden; max-width:880px; margin-top:16px;">
      <div style="display:grid; grid-template-columns: 120px 120px 1fr 90px 80px; gap:0; background:#f8fafc; border-bottom:1px solid #e5e7eb; padding:8px 10px; font-weight:700;">
        <div>회사코드</div><div>부서코드</div><div>부서명</div><div>수정</div><div>삭제</div>
      </div>
      <div *ngFor="let d of depts()" style="display:grid; grid-template-columns: 120px 120px 1fr 90px 80px; gap:0; padding:8px 10px; border-bottom:1px solid #f1f5f9; align-items:center;">
        <div>{{ d.company_code ? d.company_code : '-' }}</div>
        <div>{{ d.code }}</div>
        <div>{{ d.name }}</div>
        <div><button class="btn" (click)="edit(d)" [disabled]="busyDept()">수정</button></div>
        <div><button class="btn danger" (click)="remove(d)" [disabled]="busyDept()">삭제</button></div>
      </div>
      <div *ngIf="!depts().length" style="padding:12px; color:#94a3b8;">등록된 부서가 없습니다.</div>
    </div>
    
    <!-- Company edit modal -->
    <div *ngIf="companyModalOpen()" style="position:fixed; inset:0; background:rgba(0,0,0,0.35); display:flex; align-items:center; justify-content:center; z-index:1000;">
      <div style="background:#fff; border-radius:12px; min-width:360px; padding:16px; box-shadow:0 10px 30px rgba(0,0,0,0.18);">
        <h3 style="margin:0 0 12px 0; font-size:18px;">회사 정보 수정</h3>
        <div style="display:flex; gap:8px; align-items:flex-end; flex-wrap:wrap; margin-bottom:12px;">
          <div style="display:flex; flex-direction:column;">
            <label>회사코드</label>
            <input type="text" [ngModel]="companyModal().code" (ngModelChange)="companyModal.set({ id: companyModal().id, code: $event, name: companyModal().name })" style="height:32px; padding:6px 8px; border:1px solid #d1d5db; border-radius:8px; width:120px;" />
          </div>
          <div style="display:flex; flex-direction:column; min-width:220px;">
            <label>회사명</label>
            <input type="text" [ngModel]="companyModal().name" (ngModelChange)="companyModal.set({ id: companyModal().id, code: companyModal().code, name: $event })" style="height:32px; padding:6px 8px; border:1px solid #d1d5db; border-radius:8px;" />
          </div>
        </div>
        <div style="display:flex; gap:8px; justify-content:flex-end;">
          <button class="btn secondary" (click)="closeCompanyEdit()">취소</button>
          <button class="btn" (click)="submitCompanyEdit()" [disabled]="busyCompany()">{{ busyCompany() ? '저장중…' : '저장' }}</button>
        </div>
      </div>
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
  selectedCompanyCode = '';
  busyDept = signal<boolean>(false);
  busyCompany = signal<boolean>(false);
  constructor(private supabase: SupabaseService){ this.load(); }
  async load(){ this.depts.set(await this.supabase.listDepartments()); try{ const list = (await (this.supabase as any).listCompanies?.()) || []; this.companies.set(list); }catch{ this.companies.set([]); } }
  onSelectCompany(){
    // Reflect selection into inputs for save payload and display
    const code = this.selectedCompanyCode || '';
    this.companyCode = code;
    const found = (this.companies() || []).find(c => c.code === code);
    this.companyName = found?.name || this.companyName;
  }
  async save(){
    // Require dept code, dept name, and company selection
    if (!this.selectedCompanyCode && !(this.companyCode||'').trim()){
      alert('회사코드를 선택해 주세요.');
      return;
    }
    if(!(this.code||'').trim()) { alert('부서코드는 필수입니다.'); return; }
    if(!(this.name||'').trim()) { alert('부서명은 필수입니다.'); return; }
    this.busyDept.set(true);
    try{
      const cc = (this.selectedCompanyCode || this.companyCode || '').trim();
      const cn = cc ? (((this.companies() || []).find(c => c.code === cc)?.name) || (this.companyName||'').trim() || null) : null;
      await this.supabase.upsertDepartment({
        name: this.name.trim(),
        code: this.code.trim(),
        company_code: cc || null,
        company_name: cn,
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
  // ===== Company edit modal =====
  companyModalOpen = signal<boolean>(false);
  companyModal = signal<{ id?: string; code: string; name: string }>({ code: '', name: '' });
  openCompanyEdit(c: { id?: string; code: string; name: string }){
    this.companyModal.set({ id: (c as any).id, code: c.code, name: c.name });
    this.companyModalOpen.set(true);
  }
  closeCompanyEdit(){ this.companyModalOpen.set(false); }
  async submitCompanyEdit(){
    const payload = this.companyModal();
    const cc = (payload.code||'').trim(); const nn = (payload.name||'').trim();
    if (!cc || !nn){ alert('회사코드와 회사명은 필수입니다.'); return; }
    this.busyCompany.set(true);
    try{
      await (this.supabase as any).upsertCompany?.(payload);
      this.companyModalOpen.set(false);
      await this.load();
    } finally { this.busyCompany.set(false); }
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
