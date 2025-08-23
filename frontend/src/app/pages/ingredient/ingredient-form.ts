import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-ingredient-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="form-page">
    <header class="form-header">
      <h2>Ingredient <span class="sub">성분등록</span></h2>
      <div class="actions">
        <button class="btn primary" (click)="save()">저장</button>
        <button class="btn ghost" (click)="cancel()">취소</button>
      </div>
    </header>

    <div class="notice" *ngIf="notice()">{{ notice() }}</div>

    <section class="form-body">
      <div class="grid">
        <label>INCI</label>
        <input [(ngModel)]="model.inci_name" />
        <label>국문명</label>
        <input [(ngModel)]="model.korean_name" />
        <label>중국명</label>
        <input [(ngModel)]="model.chinese_name" />
        <label>CAS No</label>
        <input [(ngModel)]="model.cas_no" />
        <label>기능(EN)</label>
        <textarea rows="3" [(ngModel)]="model.function_en"></textarea>
        <label>기능(KR)</label>
        <textarea rows="3" [(ngModel)]="model.function_kr"></textarea>
        <label>Scientific Name</label>
        <input [(ngModel)]="model.scientific_name" />
        <label>EINECS No</label>
        <input [(ngModel)]="model.einecs_no" />
        <label>이전국문명</label>
        <input [(ngModel)]="model.old_korean_name" />
        <label>원산/ABS</label>
        <textarea rows="2" [(ngModel)]="model.origin_abs"></textarea>
        <label>비고</label>
        <textarea rows="3" [(ngModel)]="model.remarks"></textarea>
      </div>
      <div class="meta" *ngIf="meta">
        <div>처음 생성: {{ meta.created_at | date:'yyyy-MM-dd HH:mm' }} · {{ meta.created_by_name || meta.created_by_email || meta.created_by || '-' }}</div>
        <div>마지막 수정: {{ meta.updated_at | date:'yyyy-MM-dd HH:mm' }} · {{ meta.updated_by_name || meta.updated_by_email || meta.updated_by || '-' }}</div>
      </div>
    </section>
  </div>
  `,
  styles: [`
  .form-page{ padding:12px 16px; }
  .form-header{ display:flex; align-items:center; justify-content:space-between; position:sticky; top:12px; background:#fff; z-index:5; padding:8px 0; }
  .form-header h2{ margin:0; font-size:20px; font-weight:800; }
  .form-header .sub{ font-size:14px; font-weight:700; margin-left:6px; color:#6b7280; }
  .actions{ display:flex; gap:8px; }
  .btn{ height:30px; padding:0 12px; border-radius:8px; border:1px solid #d1d5db; background:#fff; cursor:pointer; }
  .btn.primary{ background:#111827; color:#fff; border-color:#111827; }
  .btn.ghost{ background:#fff; color:#111827; }
  .notice{ margin:8px 0 0; padding:8px 10px; border:1px solid #bbf7d0; background:#ecfdf5; color:#065f46; border-radius:10px; font-size:12px; }
  .form-body{ border:1px solid #eef2f7; border-radius:12px; padding:12px; }
  .grid{ display:grid; grid-template-columns:120px 1fr; gap:10px 14px; align-items:center; }
  input, textarea{ width:100%; border:1px solid #e5e7eb; border-radius:8px; padding:6px 8px; font-size:13px; }
  .meta{ margin-top:12px; padding:8px 10px; border-top:1px dashed #e5e7eb; color:#6b7280; font-size:12px; }
  `]
})
export class IngredientFormComponent implements OnInit {
  id = signal<string | null>(null);
  model: any = {};
  meta: any = null;
  notice = signal<string | null>(null);
  private backParams: { q?: string; op?: 'AND'|'OR'; page?: number; size?: number } | null = null;
  constructor(private route: ActivatedRoute, private router: Router, private supabase: SupabaseService) {}
  async ngOnInit(){
    // Remember list query params to preserve search state on back/cancel
    const qp = this.route.snapshot.queryParamMap;
    const q = qp.get('q') || undefined;
    const op = (qp.get('op') as ('AND'|'OR'|null)) || undefined;
    const page = Number(qp.get('page'));
    const size = Number(qp.get('size'));
    this.backParams = {
      q,
      op: op === 'AND' || op === 'OR' ? op : undefined,
      page: !Number.isNaN(page) && page > 0 ? page : undefined,
      size: !Number.isNaN(size) && size > 0 ? size : undefined,
    };

    const id = this.route.snapshot.queryParamMap.get('id');
    if (id) {
      this.id.set(id);
      const { data } = await this.supabase.getIngredient(id);
      this.model = data || {};
      this.meta = {
        created_at: data?.created_at,
        created_by: data?.created_by,
        created_by_name: data?.created_by_name,
        updated_at: data?.updated_at,
        updated_by: data?.updated_by,
        updated_by_name: data?.updated_by_name,
      };
      // Fallback: if names are missing, resolve emails from users table
      await this.resolveActorEmails();
    }
  }
  async save(){
    const { data: user } = await this.supabase.getClient().auth.getUser();
    const now = new Date().toISOString();
    const row: any = { ...this.model };
    if (!row.id) row.id = crypto.randomUUID();
    if (!this.id()) {
      row.created_at = now;
      row.created_by = user.user?.id || null;
      row.created_by_name = user.user?.email || null;
    }
    row.updated_at = now;
    row.updated_by = user.user?.id || null;
    row.updated_by_name = user.user?.email || null;
    const { data: saved } = await this.supabase.upsertIngredient(row);
    // Stay on the form; update local state and URL (id) if needed
    const applied = saved || row;
    this.model = applied;
    this.id.set(applied.id || row.id);
    this.meta = {
      created_at: applied.created_at,
      created_by: applied.created_by,
      created_by_name: applied.created_by_name,
      updated_at: applied.updated_at,
      updated_by: applied.updated_by,
      updated_by_name: applied.updated_by_name,
    };
    await this.resolveActorEmails();
    // Optionally reflect id in URL without leaving the form
    try { this.router.navigate([], { relativeTo: this.route, queryParams: { id: this.id() }, replaceUrl: true }); } catch {}
    // Show success notice
    this.notice.set('저장되었습니다.');
    setTimeout(() => this.notice.set(null), 2500);
  }
  cancel(){
    const queryParams: any = {};
    if (this.backParams?.q) queryParams.q = this.backParams.q;
    if (this.backParams?.op) queryParams.op = this.backParams.op;
    if (this.backParams?.page) queryParams.page = this.backParams.page;
    if (this.backParams?.size) queryParams.size = this.backParams.size;
    if (Object.keys(queryParams).length){
      this.router.navigate(['/app/ingredient'], { queryParams });
    } else {
      this.router.navigate(['/app/ingredient']);
    }
  }

  private async resolveActorEmails(){
    try{
      if (this.meta?.created_by && !this.meta?.created_by_name) {
        const { data: profile } = await this.supabase.getUserProfile(this.meta.created_by);
        if (profile?.email) { this.meta.created_by_email = profile.email; if (!this.meta.created_by_name) this.meta.created_by_name = profile.email; }
        else if (profile?.name) { this.meta.created_by_name = profile.name; }
      }
      if (this.meta?.updated_by && !this.meta?.updated_by_name) {
        const { data: profile } = await this.supabase.getUserProfile(this.meta.updated_by);
        if (profile?.email) { this.meta.updated_by_email = profile.email; if (!this.meta.updated_by_name) this.meta.updated_by_name = profile.email; }
        else if (profile?.name) { this.meta.updated_by_name = profile.name; }
      }
    } catch {}
  }
}


