import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../../services/supabase.service';

@Component({
  selector: 'app-audit-companies',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="page">
    <div class="head">
      <h2>Audit <small class="sub">업체 등록</small></h2>
      <div class="toolbar">
        <button class="btn" (click)="addRow()">추가</button>
        <button class="btn info" style="margin-left:8px" (click)="saveAll()" [disabled]="saving">{{ saving? '저장중...' : '저장' }}</button>
      </div>
    </div>

    <div class="table">
      <div class="row head">
        <div class="col name">업체명</div>
        <div class="col note">비고</div>
        <div class="col act"></div>
      </div>
      <div class="row" *ngFor="let r of rows; let i = index">
        <div class="col name"><input [(ngModel)]="r.name" placeholder="{{i+1}}. 업체명" /></div>
        <div class="col note"><input [(ngModel)]="r.note" placeholder="비고" /></div>
        <div class="col act">
          <button class="btn danger" (click)="remove(i)">삭제</button>
        </div>
      </div>
      <div *ngIf="rows.length===0" class="empty">업체를 추가해 주세요.</div>
    </div>
  </div>
  `,
  styles: [`
    .page{ padding:16px; }
    .head{ display:flex; align-items:center; justify-content:space-between; margin-bottom:10px; }
    .head h2{ font-weight:800; }
    .head h2 .sub{ font-weight:500; color:#64748b; margin-left:6px; font-size:.85em; }
    .table{ border:1px solid #e5e7eb; border-radius:12px; overflow:hidden; }
    .row{ display:grid; grid-template-columns: 1.2fr 1.8fr 120px; border-top:1px solid #f1f5f9; }
    .row.head{ background:#f9fafb; font-weight:700; }
    .row:first-child{ border-top:none; }
    .col{ padding:8px 10px; display:flex; align-items:center; }
    input{ width:100%; box-sizing:border-box; border:1px solid #d1d5db; border-radius:8px; padding:6px 8px; }
    .empty{ padding:12px; text-align:center; color:#94a3b8; }
    .toolbar{ margin-bottom:8px; }
  `]
})
export class AuditCompaniesComponent implements OnInit {
  rows: Array<{ id?: string; name: string; note?: string | null }> = [];
  saving = false;
  constructor(private supabase: SupabaseService){}
  async ngOnInit(){ this.rows = await this.supabase.listAuditCompanies(); }
  addRow(){ this.rows.push({ name: '', note: '' }); }
  remove(i: number){ const row = this.rows[i]; if (row?.id){ this.supabase.deleteAuditCompany(row.id as string); } this.rows.splice(i,1); }
  async saveAll(){
    this.saving = true;
    for (const r of this.rows){
      if (!r.name || !r.name.trim()) continue;
      if (r.id){ await this.supabase.updateAuditCompany(r.id, { name: r.name.trim(), note: (r.note || undefined) }); }
      else { const { data } = (await this.supabase.addAuditCompany({ name: r.name.trim(), note: r.note || null })) as any; r.id = (data as any)?.id; }
    }
    this.saving = false;
    this.rows = await this.supabase.listAuditCompanies();
  }
}


