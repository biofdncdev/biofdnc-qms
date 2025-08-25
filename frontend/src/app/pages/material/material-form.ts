import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-material-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="form-page">
    <div class="page-head">
      <h2>Material <span class="sub">자재등록</span></h2>
      <div class="spacer"></div>
      <button class="btn primary" (click)="save()">저장</button>
      <button class="btn ghost" (click)="cancel()">취소</button>
    </div>

    <section class="form-body">
      <div class="grid">
        <label>자재명</label>
        <input [(ngModel)]="model.material_name" />
        <label>규격</label>
        <input [(ngModel)]="model.spec" />
        <label>자재상태</label>
        <input [(ngModel)]="model.material_status" />
        <label>기본구매처</label>
        <input [(ngModel)]="model.default_supplier" />
        <label>CAS NO</label>
        <input [(ngModel)]="model.cas_no" />
        <label>비고</label>
        <textarea rows="3" [(ngModel)]="model.material_notes"></textarea>
      </div>
    </section>
  </div>
  `,
  styles: [`
  .form-page{ padding:10px 12px; }
  .page-head{ display:flex; align-items:center; gap:8px; }
  .page-head .sub{ font-size:14px; font-weight:700; margin-left:6px; color:#6b7280; }
  .page-head h2{ margin:0; font-size:20px; font-weight:800; }
  .page-head .spacer{ flex:1; }
  .btn{ height:28px; padding:0 10px; border-radius:8px; border:1px solid #d1d5db; background:#fff; cursor:pointer; font-size:12px; }
  .btn.primary{ background:#111827; color:#fff; border-color:#111827; }
  .btn.ghost{ background:#fff; color:#111827; }
  .form-body{ border:1px solid #eef2f7; border-radius:12px; padding:12px; margin-top:10px; }
  .grid{ display:grid; grid-template-columns:120px minmax(0,1fr) 120px minmax(0,1fr); gap:10px 14px; align-items:center; }
  .grid label{ font-size:11px; color:#111827; text-align:right; }
  input, textarea{ width:100%; border:1px solid #e5e7eb; border-radius:8px; padding:5px 7px; font-size:12px; color:#111827; box-sizing:border-box; }
  textarea{ white-space:normal; word-break:break-word; resize:vertical; overflow:auto; min-height:28px; }
  `]
})
export class MaterialFormComponent implements OnInit {
  id = signal<string | null>(null);
  model: any = {};
  constructor(private route: ActivatedRoute, private router: Router, private supabase: SupabaseService) {}
  async ngOnInit(){
    const id = this.route.snapshot.queryParamMap.get('id');
    if (id){
      this.id.set(id);
      try{ const { data } = await this.supabase.getMaterial(id); if(data) this.model = data; }catch{}
    } else {
      this.model = { id: crypto.randomUUID() } as any;
    }
  }
  async save(){
    try{ await this.supabase.upsertMaterial(this.model); alert('저장되었습니다.'); }catch(e:any){ alert('저장 실패: '+(e?.message||e)); }
  }
  cancel(){ this.router.navigate(['/app/material']); }
}


