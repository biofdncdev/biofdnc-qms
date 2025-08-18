import { Component, HostListener, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../../services/supabase.service';

interface AuditItem { id: number; titleKo: string; titleEn: string; done: boolean; status: 'pending'|'on-hold'|'na'|'impossible'|'in-progress'|'done'; note: string; departments: string[]; doneBy?: string; doneAt?: string; }
interface ResourceItem { id?: string; number?: number; name: string; type?: string; url?: string | null; file_url?: string | null; done?: boolean; }
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
          <div class="filterbar">
            <label>팀 필터</label>
            <select class="dept-select" [ngModel]="''" (ngModelChange)="addFilterTeam($event)">
              <option value="" disabled>팀 추가…</option>
              <option *ngFor="let d of departments" [value]="d" [disabled]="filterTeams.includes(d)">{{ d }}</option>
            </select>
            <div class="chips" *ngIf="filterTeams.length">
              <span class="chip" *ngFor="let d of filterTeams" [ngClass]="teamClass(d)">{{ d }}
                <button class="remove" (click)="removeFilterTeam(d)">×</button>
              </span>
            </div>
          </div>
          <div class="item" *ngFor="let it of visibleItems()" [class.open]="openItemId===it.id">
            <div class="id">{{ it.id | number:'2.0-0' }}</div>
            <div class="text" (click)="toggleDetails(it)">
              <div class="ko">{{ it.titleKo }}</div>
              <div class="en">{{ it.titleEn }}</div>
            </div>
            <div class="state">
              <select class="status-select" [(ngModel)]="it.status" (ngModelChange)="saveProgress(it)" (change)="saveProgress(it)" [ngClass]="statusClass(it.status)" [ngStyle]="statusStyle(it.status)">
                <option *ngFor="let s of statusOptions" [value]="s.value">{{ s.emoji }} {{ s.label }}</option>
              </select>
              <select class="dept-select" [ngModel]="''" (ngModelChange)="addDept(it, $event)" title="담당 부서 추가">
                <option value="" disabled>담당 부서 추가…</option>
                <option *ngFor="let d of departments" [value]="d" [disabled]="it.departments.includes(d)">{{ d }}</option>
              </select>
              <div class="chips" *ngIf="it.departments?.length">
                <span class="chip" *ngFor="let d of it.departments" [ngClass]="teamClass(d)">{{ displayDeptName(d) }}
                  <button class="remove" (click)="removeDept(it, d); $event.stopPropagation()">×</button>
                </span>
              </div>
              <span class="save-badge" *ngIf="saving[it.id]==='saving'">저장중…</span>
              <span class="save-badge saved after-status" *ngIf="saving[it.id]==='saved'">저장됨</span>
              <div class="note">
                <textarea spellcheck="false" [(ngModel)]="it.note" (blur)="saveProgress(it)" rows="2" placeholder="비고 / Notes"></textarea>
              </div>
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
                
              </div>
            </div>
          </div>
        </div>
      </section>

      <aside class="resources">
        <ng-container *ngIf="openItemId; else emptySel">
          <div class="re-head sticky">
            <h3>{{ pad2(openItemId!) }} 자료 / Resources</h3>
            <button (click)="addResourceByAside()">항목 추가</button>
          </div>
          <div class="resource-card" *ngFor="let r of resources">
            <div class="col">
              <input class="re-input" [(ngModel)]="r.name" (blur)="saveResource(r)" placeholder="자료명" />
              <div class="re-row">
                <input class="re-input" [(ngModel)]="r.url" (blur)="saveResource(r)" placeholder="링크(규정/지시기록서/외부)" />
                <button (click)="openLink(r.url)" [disabled]="!r.url">열기</button>
              </div>
              <div class="re-row">
                <input type="file" (change)="uploadFor(r, $event)" />
                <button (click)="openLink(r.file_url)" [disabled]="!r.file_url">파일 열기</button>
                <button class="danger" (click)="clearFile(r)" [disabled]="!r.file_url">파일 삭제</button>
                <button class="danger" (click)="removeResource(r)">항목 삭제</button>
              </div>
            </div>
          </div>
        </ng-container>
        <ng-template #emptySel>
          <h3>대응 자료 / Resources</h3>
          <p class="hint">좌측에서 점검항목을 선택하면 관련 자료가 표시됩니다.</p>
        </ng-template>
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

    .layout{ display:grid; grid-template-columns: minmax(0,1fr) 320px; gap:16px; }
    @media (max-width: 1100px){ .layout{ grid-template-columns: 1fr; } }

    .checklist{ background:#fff; border:1px solid #eee; border-radius:12px; padding:10px; height: calc(100vh - 160px); overflow:auto; box-shadow:0 8px 22px rgba(2,6,23,.06); }
    .group h3{ margin:8px 6px 12px; }
    .filterbar{ display:flex; align-items:center; gap:10px; margin:6px; flex-wrap:wrap; }
    .item{ display:grid; grid-template-columns: 54px 1fr 1.6fr; gap:12px; padding:10px; border-radius:10px; border:1px solid #f1f5f9; margin:8px; background:linear-gradient(180deg,rgba(241,245,249,.35),rgba(255,255,255,1)); position:relative; align-items:start; }
    .id{ font-weight:700; color:#475569; display:flex; align-items:center; justify-content:center; }
    .ko{ font-weight:600; margin-bottom:2px; }
    .en{ color:#64748b; font-size:.92em; }
    /* Left controls: 2x2 grid (row1: status + saved, row2: dept-select + chips + notes below) */
    .state{ display:grid; grid-template-columns: auto 1fr; grid-template-rows:auto auto auto; align-items:start; column-gap:12px; row-gap:8px; }
    .state .status-select{ grid-row:1; grid-column:1; }
    .state .after-status{ grid-row:1; grid-column:2; }
    .state .dept-select{ grid-row:2; grid-column:1; }
    .state .chips{ grid-row:2; grid-column:2; margin-top:0; }
    .state .note{ grid-row:3; grid-column: 1 / span 2; }
    .state .meta{ color:#475569; font-size:.85em; }
    .status-swatch{ width:12px; height:12px; border-radius:50%; border:2px solid #fff; box-shadow:0 0 0 1px #e5e7eb; }
    select{ padding:6px 8px; border:1px solid #e5e7eb; border-radius:8px; appearance:none; -webkit-appearance:none; -moz-appearance:none; }
    .status-select, .dept-select{ width: 150px; }
    /* 상태별 색상 (진행중=초록, 보류=주황, 해당없음=회색) */
    .state select.status-pending{ background:#fff7ed; border-color:#f59e0b; color:#92400e; }
    .state select.status-in-progress{ background:#ecfdf5; border-color:#10b981; color:#065f46; }
    .state select.status-on-hold{ background:#fff7ed; border-color:#fb923c; color:#9a3412; }
    .state select.status-na{ background:#f1f5f9; border-color:#cbd5e1; color:#334155; }
    .state select.status-impossible{ background:#fee2e2; border-color:#ef4444; color:#991b1b; }
    .state select.status-done{ background:#dbeafe; border-color:#3b82f6; color:#1e40af; }
    .save-badge{ margin-left:6px; font-size:.85em; color:#64748b; }
    .save-badge.saved{ color:#16a34a; }
    textarea{ width:100%; max-width: none; border:1px solid #e5e7eb; border-radius:10px; padding:8px; resize:vertical; }
    .note textarea{ width: min(500px, 100%); max-width:100%; box-sizing:border-box; }

    .item .details{ grid-column: 1 / -1; overflow:hidden; }
    .item.open .details{ animation: slideDown .22s ease-out; }
    .details-inner{ display:grid; grid-template-columns: 1.4fr .8fr 1fr; gap:16px; padding:10px 6px 12px; }
    .assessment .row{ display:flex; gap:10px; margin:4px 0; }
    .assessment .q{ margin-top:8px; font-weight:600; }
    .assessment .t{ color:#475569; margin:6px 0; }
    .assessment .acc{ background:#f8fafc; border:1px dashed #e2e8f0; border-radius:8px; padding:8px; }
    .assign select{ min-height: 100px; }
    .chips{ margin-top:8px; display:flex; flex-wrap:wrap; gap:8px; }
    .chip{ background:#f8fafc; color:#334155; padding:4px 8px; border-radius:999px; font-weight:600; font-size:.85em; display:inline-flex; align-items:center; gap:4px; border:1px solid #e2e8f0; transition: background-color .15s ease, border-color .15s ease, color .15s ease; }
    .chip:hover{ border-color:#cbd5e1; }
    .chip .remove{ background:transparent; border:0; color:inherit; cursor:pointer; line-height:1; padding:0 2px; border-radius:8px; }
    .chip .remove:hover{ background:#e2e8f0; }
    .chip.team-rmd{ background:#e0f2fe; color:#075985; border-color:#bae6fd; } /* 원료제조팀: Sky */
    .chip.team-cell{ background:#dcfce7; color:#047857; border-color:#bbf7d0; } /* 식물세포배양팀: Emerald */
    .chip.team-qc{ background:#cffafe; color:#155e75; border-color:#a5f3fc; } /* 품질팀: Cyan */
    .chip.team-rnd{ background:#ede9fe; color:#6d28d9; border-color:#ddd6fe; } /* 연구팀: Violet */
    .chip.team-admin{ background:#fef3c7; color:#b45309; border-color:#fde68a; } /* 경영지원팀: Amber */
    /* 내부 resources 편집 섹션 제거로 관련 스타일 삭제 */

    @keyframes slideDown { from{ opacity:0; transform: translateY(-6px); } to{ opacity:1; transform:none; } }

    .checkbox{ display:inline-flex; align-items:center; gap:6px; cursor:pointer; }
    .checkbox input{ display:none; }
    .checkbox .box{ width:22px; height:22px; border-radius:6px; background:#0f172a; display:inline-flex; align-items:center; justify-content:center; }
    .checkbox .tick{ color:#22c55e; font-weight:800; font-size:14px; line-height:1; }
    .checkbox.small .box{ width:18px; height:18px; }
    .checkbox.small .tick{ font-size:12px; }

    .resources{ background:#fff; border:1px solid #eee; border-radius:16px; padding:16px; box-shadow:0 10px 24px rgba(2,6,23,.06); height: calc(100vh - 160px); overflow:auto; width:100%; box-sizing:border-box; }
    .resources .sticky{ position:sticky; top:0; background:#fff; padding-bottom:8px; }
    .re-head{ display:flex; align-items:center; justify-content:space-between; }
    .resource-card{ border:1px solid #e5e7eb; border-radius:12px; padding:12px; margin:12px 6px; background:linear-gradient(180deg,#f8fafc,#ffffff); box-shadow:0 4px 14px rgba(2,6,23,.05); }
    .resource-card .col{ display:flex; flex-direction:column; gap:8px; }
    .re-row{ display:flex; align-items:center; gap:8px; }
    .re-input{ width:100%; padding:6px 8px; border:1px solid #e5e7eb; border-radius:8px; }
    .hint{ color:#64748b; margin:8px 0 0 4px; }
    .resource-card button{ padding:6px 10px; border-radius:8px; background:#2563eb; color:#fff; border:0; }

    .preview-backdrop{ position:fixed; inset:0; background:rgba(2,6,23,.45); display:flex; align-items:center; justify-content:center; }
    .preview{ width:min(880px,92vw); max-height:80vh; background:#fff; border-radius:16px; box-shadow:0 20px 60px rgba(0,0,0,.2); overflow:hidden; display:flex; flex-direction:column; }
    .preview header{ display:flex; align-items:center; justify-content:space-between; padding:12px 14px; border-bottom:1px solid #eee; font-weight:700; }
    .preview .body{ padding:16px; overflow:auto; }
  `]
})
export class AuditGivaudanComponent {
  constructor(private supabase: SupabaseService){}
  userDisplay = '사용자';
  currentUserId: string | null = null;
  async ngOnInit(){
    try{
      const u = await this.supabase.getCurrentUser();
      if(u){
        const { data } = await this.supabase.getUserProfile(u.id);
        this.userDisplay = data?.name || data?.email || '사용자';
        this.currentUserId = u.id;
      }
      // Hydrate items with saved progress on initial load
      const { data: all } = await this.supabase.listAllGivaudanProgress();
      if (Array.isArray(all)) {
        const next = this.items().map(it => {
          const row = all.find(r => r.number === it.id);
          if (!row) return it as any;
          return {
            ...it,
            status: row.status || it.status,
            note: row.note || it.note,
            departments: row.departments || [],
          } as any;
        });
        this.items.set(next as any);
      }
    }catch{}
  }

  dates: AuditDate[] = [ { value: '2025-09-16', label: '2025-09-16' } ];
  selectedDate = signal(this.dates[0].value);

  items = signal<AuditItem[]>(Array.from({ length: 214 }, (_, i) => ({
    id: i+1,
    titleKo: `점검 항목 ${i+1}`,
    titleEn: `Inspection item ${i+1}`,
    done: false,
    status: 'pending',
    note: '',
    departments: []
  })));

  resources: ResourceItem[] = [];

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
  filterTeams: string[] = [];

  async toggleDetails(it: any){
    if(this.openItemId === it.id){ return; }
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
        updated_by: this.currentUserId,
        updated_by_name: this.userDisplay,
      };
      const { error } = await this.supabase.upsertGivaudanProgress(payload) as any;
      if (error) throw error;
      this.setSaving(it.id, 'saved');
      setTimeout(()=>this.setSaving(it.id,'idle'), 1200);
    }catch(e){
      console.error('Failed to save progress', e);
      this.setSaving(it.id,'idle');
    }
  }

  visibleItems(){
    const arr = this.items();
    if(this.filterTeams.length===0) return arr;
    return arr.filter((it:any)=> it.departments?.some((d:string)=> this.filterTeams.includes(d)));
  }

  addFilterTeam(dept: string){ if(!dept) return; if(!this.filterTeams.includes(dept)) this.filterTeams = [...this.filterTeams, dept]; }
  removeFilterTeam(dept: string){ this.filterTeams = this.filterTeams.filter(d=>d!==dept); }

  addDept(it: any, dept: string){
    if(!dept) return;
    if(!it.departments) it.departments = [];
    if(!it.departments.includes(dept)){
      it.departments.push(dept);
      this.saveProgress(it);
    }
  }
  removeDept(it: any, dept: string){
    it.departments = (it.departments||[]).filter((d:string)=>d!==dept);
    this.saveProgress(it);
  }

  async addResource(it: any){
    const row = { number: it.id, name: '새 자료', type: 'Manual', url: null, file_url: null };
    const { data } = await this.supabase.addGivaudanResource(row);
    this.resources = [...(this.resources || []), data as ResourceItem];
  }

  async addResourceByAside(){
    if(!this.openItemId) return;
    const row = { number: this.openItemId, name: '새 자료', type: 'Manual', url: null, file_url: null };
    const { data } = await this.supabase.addGivaudanResource(row);
    this.resources = [...(this.resources || []), data as ResourceItem];
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

  openResource(r: ResourceItem){ this.preview(r); }
  saveResource(r: ResourceItem){ /* placeholder for future update call */ }
  openLink(url?: string | null){ if(!url) return; window.open(url, '_blank'); }
  clearFile(r: ResourceItem){ r.file_url = null; }

  @HostListener('document:keydown.escape') onEsc(){
    if(this.previewing){ this.previewing=false; return; }
    if(this.openItemId!=null){ this.openItemId=null; }
  }

  // UI helpers
  saving: Record<number, 'idle'|'saving'|'saved'> = {};
  private setSaving(id: number, state: 'idle'|'saving'|'saved') { this.saving[id] = state; }
  statusOptions = [
    { value: 'pending', label: '준비중 / Pending', emoji: '' },
    { value: 'in-progress', label: '진행중 / In progress', emoji: '' },
    { value: 'on-hold', label: '보류 / On hold', emoji: '' },
    { value: 'na', label: '해당없음 / N.A.', emoji: '' },
    { value: 'impossible', label: '불가 / Not possible', emoji: '' },
    { value: 'done', label: '완료 / Done', emoji: '' },
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
        case 'in-progress': return { background:'#ecfdf5', borderColor:'#10b981', color:'#065f46' } as any;
        case 'on-hold': return { background:'#f3f4f6', borderColor:'#9ca3af', color:'#374151' } as any;
        case 'na': return { background:'#f8fafc', borderColor:'#cbd5e1', color:'#475569' } as any;
        case 'impossible': return { background:'#fee2e2', borderColor:'#ef4444', color:'#991b1b' } as any;
        case 'done': return { background:'#dbeafe', borderColor:'#3b82f6', color:'#1e40af' } as any;
        default: return {} as any;
      }
    } catch { return {} as any; }
  }

  teamClass(team: string){
    return {
      'team-rmd': team==='원료제조팀',
      'team-cell': team==='식물세포배양팀',
      'team-qc': team==='품질팀',
      'team-rnd': team==='연구팀',
      'team-admin': team==='경영지원팀',
    } as any;
  }
  statusColor(status: string){
    switch(status){
      case 'pending': return '#f59e0b';
      case 'in-progress': return '#10b981';
      case 'on-hold': return '#fb923c';
      case 'na': return '#94a3b8';
      case 'impossible': return '#ef4444';
      case 'done': return '#3b82f6';
      default: return '#e5e7eb';
    }
  }

  displayDeptName(name: string){
    try{
      return name.replace(/팀$/,'');
    }catch{ return name; }
  }

  pad2(n: number){ return String(n).padStart(2,'0'); }
}
