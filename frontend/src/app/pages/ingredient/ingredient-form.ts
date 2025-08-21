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
      <h2>{{ id() ? 'Ingredient 수정' : 'Ingredient 등록' }}</h2>
      <div class="actions">
        <button class="btn primary" (click)="save()">저장</button>
        <button class="btn ghost" (click)="cancel()">취소</button>
      </div>
    </header>

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
        <div>처음 생성: {{ meta.created_at | date:'yyyy-MM-dd HH:mm' }} · {{ meta.created_by_name || meta.created_by }}</div>
        <div>마지막 수정: {{ meta.updated_at | date:'yyyy-MM-dd HH:mm' }} · {{ meta.updated_by_name || meta.updated_by }}</div>
      </div>
    </section>
  </div>
  `,
  styles: [`
  .form-page{ padding:12px 16px; }
  .form-header{ display:flex; align-items:center; justify-content:space-between; position:sticky; top:12px; background:#fff; z-index:5; padding:8px 0; }
  .actions{ display:flex; gap:8px; }
  .btn{ height:30px; padding:0 12px; border-radius:8px; border:1px solid #d1d5db; background:#fff; cursor:pointer; }
  .btn.primary{ background:#111827; color:#fff; border-color:#111827; }
  .btn.ghost{ background:#fff; color:#111827; }
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
  constructor(private route: ActivatedRoute, private router: Router, private supabase: SupabaseService) {}
  async ngOnInit(){
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
    await this.supabase.upsertIngredient(row);
    this.router.navigate(['/app/ingredient']);
  }
  cancel(){ this.router.navigate(['/app/ingredient']); }
}


