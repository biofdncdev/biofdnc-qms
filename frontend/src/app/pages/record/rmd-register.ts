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
  imports: [CommonModule, FormsModule, RecordFeaturesTextPipe],
  template: `
  <div class="page" style="padding:16px;">
    <h2 style="margin:0 0 12px 0;">기록 등록</h2>
    <div class="form" style="display:grid; grid-template-columns: 1fr 1fr; gap:16px; max-width:1100px; align-items:end;">
      <div style="display:flex; flex-direction:column; grid-column: span 1;">
        <label>규정카테고리 선택</label>
        <select [(ngModel)]="categoryId" (ngModelChange)="onCategoryChange()" style="height:36px; border:1px solid #d1d5db; border-radius:10px;">
          <option [ngValue]="''">선택</option>
          <option *ngFor="let c of cats()" [ngValue]="c.id">{{ formatCatDisplay(c) }}</option>
        </select>
        
      </div>
      <div style="display:flex; flex-direction:column; grid-column: span 1;">
        <label>기록명</label>
        <input type="text" [(ngModel)]="title" placeholder="기록명" style="height:36px; padding:8px 10px; border:1px solid #d1d5db; border-radius:10px;" />
      </div>
      <div style="display:flex; flex-direction:column; grid-column: span 2;">
        <label>기록번호</label>
        <div style="display:flex; gap:8px; align-items:center;">
          <input type="text" [(ngModel)]="docNo" placeholder="예: BF-RM-GM-FR-01" style="flex:1; height:36px; padding:8px 10px; border:1px solid #d1d5db; border-radius:10px;" />
          <button class="btn" (click)="autoNumber()" [disabled]="busy() || !categoryId">자동채번</button>
          <span *ngIf="dupError()" style="color:#ef4444; font-weight:600;">중복 번호</span>
        </div>
      </div>
      <!-- Features & Departments at same visual level -->
      <div style="grid-column: span 2; display:grid; grid-template-columns: 1fr 1fr; gap:16px;">
        <div style="display:flex; flex-direction:column; gap:6px;">
          <label style="font-size:13px; color:#475569;">담당부서</label>
          <input type="text" [value]="selectedOwnerDeptLabel()" readonly style="height:36px; padding:8px 10px; border:1px solid #d1d5db; border-radius:10px; background:#f8fafc;" />
        </div>
        <div style="display:flex; flex-direction:column; gap:6px;">
          <label style="font-size:13px; color:#475569;">이 기록을 사용할 부서 선택</label>
          <div style="display:flex; gap:16px; flex-wrap:wrap; align-items:center; color:#475569;">
            <label *ngFor="let d of depts()" style="display:flex; gap:6px; align-items:center; font-size:13px; color:inherit;">
              <input type="checkbox" [checked]="selectedDeptCodes.has(d.code)" (change)="toggleDept(d.code, $any($event.target).checked)" />
              {{ d.company ? (d.company + '-') : '' }}{{ d.code }} {{ d.name }}
            </label>
          </div>
        </div>
      </div>
      <div style="grid-column: span 2;">
        <button class="btn primary" (click)="save()" [disabled]="busy() || !docNo || !title || !categoryId">{{ busy() ? '저장중…' : '저장' }}</button>
      </div>
    </div>

    <div style="display:flex; align-items:center; justify-content:space-between; margin:16px 0 8px; gap:12px;">
      <h3 style="margin:0;">기록 등록 현황</h3>
      <div style="display:flex; gap:8px; align-items:center;">
        <input type="text" [(ngModel)]="search" placeholder="검색어" style="height:32px; padding:6px 8px; border:1px solid #d1d5db; border-radius:8px; min-width:220px;" />
      </div>
    </div>
    <div class="list" style="border:1px solid #e5e7eb; border-radius:12px; overflow:hidden;">
      <div style="display:grid; grid-template-columns: 220px 1fr 1fr 1fr 1fr 1fr 90px 80px; gap:0; background:#f8fafc; border-bottom:1px solid #e5e7eb; padding:8px 10px; font-weight:700;">
        <div (click)="toggleSort('doc_no')" style="cursor:pointer;">기록번호 {{ sort.icon('doc_no') }}</div>
        <div (click)="toggleSort('category')" style="cursor:pointer;">규정카테고리명 {{ sort.icon('category') }}</div>
        <div (click)="toggleSort('title')" style="cursor:pointer;">기록명 {{ sort.icon('title') }}</div>
        <div>포함 기능</div>
        <div (click)="toggleSort('departments')" style="cursor:pointer;">사용 부서 {{ sort.icon('departments') }}</div>
        <div (click)="toggleSort('owner_departments')" style="cursor:pointer;">담당 부서 {{ sort.icon('owner_departments') }}</div>
        <div>수정</div><div>삭제</div>
      </div>
      <div *ngFor="let r of filteredRows()" style="display:grid; grid-template-columns: 220px 1fr 1fr 1fr 1fr 1fr 90px 80px; gap:0; padding:8px 10px; border-bottom:1px solid #f1f5f9; align-items:center;">
        <div>{{ r.doc_no }}</div>
        <div>{{ findCat(r.category_id)?.name || '-' }}</div>
        <div>{{ r.title }}</div>
        <div>{{ r.features | recordFeaturesText }}</div>
        <div>{{ formatDepartments(r.departments) }}</div>
        <div>{{ formatDepartments(r.owner_departments) }}</div>
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
    label{ font-size:13px; color:#475569; margin-bottom:4px; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RmdRegisterComponent {
  cats = signal<Cat[]>([]);
  rows = signal<any[]>([]);
  search = '';
  busy = signal<boolean>(false);
  title = '';
  categoryId = '';
  docNo = '';
  dupError = signal<boolean>(false);
  features = getDefaultRecordFeatures();
  depts = signal<Array<{ code: string; name: string; company?: string }>>([]);
  selectedDeptCodes = new Set<string>();
  ownerDeptCodes = new Set<string>();
  owners = signal<Array<{ id: string; name: string; email?: string }>>([]); // kept for future use
  selectedOwnerIds = new Set<string>(); // hidden from UI
  constructor(private supabase: SupabaseService){ this.load(); }
  async load(){
    this.cats.set(await this.supabase.listRmdCategories());
    // defensive: reload twice in case of eventual consistency
    const list1 = await this.supabase.listRmdRecords();
    const list2 = await this.supabase.listRmdRecords();
    this.rows.set(Array.isArray(list1) && list1.length ? list1 : list2);
    try{
      const ds = await this.supabase.listDepartments();
      this.depts.set((ds||[]).map((d:any)=>({ code: d.code, name: d.name, company: d.company_code || null })));
    }catch{ this.depts.set([]); }
    try{ const us = await this.supabase.listActiveStaffManagers(); this.owners.set(us.map((u:any)=>({ id: u.id, name: u.name || u.email, email: u.email }))); }catch{ this.owners.set([]); }
  }
  findCat(id: string){ return this.cats().find(c => c.id === id); }
  onCategoryChange(){
    // 카테고리 변경 시 자동채번하지 않고, 입력값과 중복표시만 초기화
    this.dupError.set(false);
    this.docNo = '';
  }
  async autoNumber(){
    const cat = this.findCat(this.categoryId); if (!cat) return;
    this.busy.set(true);
    try{
      const prefix = await this.supabase.getRecordPrefixForCategory(cat);
      const nextNo = await this.supabase.getNextRecordDocNo(prefix);
      this.docNo = nextNo;
      this.dupError.set(false);
    } finally {
      this.busy.set(false);
    }
  }
  async save(){
    this.busy.set(true);
    try{
      const id = crypto.randomUUID();
      // 중복검사
      const taken = await this.supabase.isRecordDocNoTaken(this.docNo);
      if (taken){ this.dupError.set(true); alert('기록번호가 중복됩니다. 다른 번호로 저장하세요.'); return; }
      const row = { id, title: this.title.trim(), category_id: this.categoryId, doc_no: this.docNo.trim(), features: { ...this.features }, departments: Array.from(this.selectedDeptCodes), owner_departments: this.computeOwnerDeptByCategory() } as any;
      await this.supabase.upsertRmdRecord(row);
      this.title=''; this.categoryId=''; this.docNo=''; this.features=getDefaultRecordFeatures(); this.selectedDeptCodes.clear(); this.ownerDeptCodes.clear(); this.selectedOwnerIds.clear(); this.dupError.set(false);
      await this.load();
    } catch (e: any) {
      alert('저장 중 오류: ' + (e?.message || e));
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
      await this.supabase.upsertRmdRecord({ id: r.id, title: (r.title||'').trim(), category_id: r.category_id, doc_no: (r.doc_no||'').trim(), features: normalizeRecordFeatures(r.features), departments: (r.departments||[]) } as any);
      this.editOpen.set(false);
      await this.load();
    } finally { this.busy.set(false); }
  }
  async remove(r: any){ if(!confirm('삭제할까요?')) return; this.busy.set(true); try{ await this.supabase.deleteRmdRecord(r.id); await this.load(); } finally{ this.busy.set(false); } }
  toggleDept(code: string, checked: any){
    if (checked){ this.selectedDeptCodes.add(code); } else { this.selectedDeptCodes.delete(code); }
  }
  toggleOwnerDept(code: string, checked: any){ if (checked){ this.ownerDeptCodes.add(code); } else { this.ownerDeptCodes.delete(code); } }
  toggleOwner(id: string, checked: any){ if (checked){ this.selectedOwnerIds.add(id); } else { this.selectedOwnerIds.delete(id); } }
  // Helpers for table rendering
  formatDepartments(list: string[]){
    const arr = Array.isArray(list) ? list : [];
    return arr.length ? arr.join(', ') : '-';
  }
  formatOwners(list: string[]){
    const arr = Array.isArray(list) ? list : [];
    if (!arr.length) return '-';
    const map = new Map<string,string>(this.owners().map(u=>[u.id, u.name] as any));
    return arr.map(id => map.get(id) || id).join(', ');
  }
  // Owner dept derives from selected category's department by default
  computeOwnerDeptByCategory(): string[]{
    const cat = this.findCat(this.categoryId);
    const dept = (cat as any)?.department_code || '';
    return dept ? [dept] : Array.from(this.ownerDeptCodes);
  }
  selectedOwnerDeptLabel(){
    const codes = this.computeOwnerDeptByCategory();
    if (!codes.length) return '';
    const map = new Map(this.depts().map(d=>[d.code, `${d.company?d.company+'-':''}${d.code} ${d.name}`] as any));
    return codes.map(c=>map.get(c)||c).join(', ');
  }
  filteredRows(){
    const q = (this.search||'').trim().toLowerCase();
    let base = this.rows();
    if (q){
      base = base.filter(r =>
        String(r.doc_no||'').toLowerCase().includes(q) ||
        String(r.title||'').toLowerCase().includes(q) ||
        String(this.findCat(r.category_id)?.name||'').toLowerCase().includes(q) ||
        (Array.isArray(r.departments)? r.departments.join(',') : '').toLowerCase().includes(q)
      );
    }
    // sort
    const s = this.sort;
    if (s.key && s.dir){
      const dir = s.dir === 'asc' ? 1 : -1;
      base = [...base].sort((a,b)=>{
        const va = s.value(a); const vb = s.value(b);
        if (va===vb) return 0; return (va>vb?1:-1) * dir;
      });
    }
    return base;
  }
  sort = {
    key: '' as 'doc_no'|'category'|'title'|'departments'|'owner_departments'|'',
    dir: '' as 'asc'|'desc'|'',
    icon: (k: string) => this.sort.key!==k ? '' : (this.sort.dir==='asc' ? '▲' : this.sort.dir==='desc' ? '▼' : ''),
    value: (r: any) => {
      switch(this.sort.key){
        case 'doc_no': return String(r.doc_no||'');
        case 'category': return String(this.findCat(r.category_id)?.name||'');
        case 'title': return String(r.title||'');
        case 'departments': return String((Array.isArray(r.departments)? r.departments.join(',') : ''));
        case 'owner_departments': return String((Array.isArray(r.owner_departments)? r.owner_departments.join(',') : ''));
        default: return '';
      }
    }
  };
  toggleSort(k: 'doc_no'|'category'|'title'|'departments'|'owner_departments'){
    if (this.sort.key !== k){ this.sort.key = k; this.sort.dir = 'asc'; return; }
    this.sort.dir = this.sort.dir === 'asc' ? 'desc' : (this.sort.dir === 'desc' ? '' : 'asc');
    if (!this.sort.dir) this.sort.key = '' as any;
  }
}
