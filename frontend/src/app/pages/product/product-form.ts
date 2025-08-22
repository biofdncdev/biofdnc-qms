import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="form-page">
    <header class="form-header">
      <h2>Product 제품등록</h2>
      <div class="actions">
        <input type="file" accept=".xlsx,.xls" (change)="onExcel($event)" />
        <button class="btn primary" (click)="save()">저장</button>
        <button class="btn ghost" (click)="cancel()">취소</button>
      </div>
    </header>

    <section class="form-body">
      <div class="grid">
        <label>품목코드</label><input [(ngModel)]="model.product_code" />
        <label>제품명</label><input [(ngModel)]="model.name_kr" />
        <label>제품명(EN)</label><input [(ngModel)]="model.name_en" />
        <label>분류</label><input [(ngModel)]="model.category" />
        <label>상태</label><input [(ngModel)]="model.status" />
        <label>비고</label><textarea rows="2" [(ngModel)]="model.remarks"></textarea>
      </div>
      <div class="meta" *ngIf="meta">
        <div>처음 생성: {{ meta.created_at | date:'yyyy-MM-dd HH:mm' }} · {{ meta.created_by_name || meta.created_by }}</div>
        <div>마지막 수정: {{ meta.updated_at | date:'yyyy-MM-dd HH:mm' }} · {{ meta.updated_by_name || meta.updated_by }}</div>
      </div>
    </section>

    <section>
      <h3>조성성분</h3>
      <div>
        <button class="btn" (click)="addComposition()">추가</button>
      </div>
      <table class="compact wide">
        <thead>
          <tr>
            <th>성분ID</th><th>함량(%)</th><th>비고</th><th></th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let c of compositions">
            <td><input [(ngModel)]="c.ingredient_id" placeholder="ingredient id (임시)" /></td>
            <td><input type="number" [(ngModel)]="c.percent" /></td>
            <td><input [(ngModel)]="c.note" /></td>
            <td><button class="btn" (click)="removeComposition(c)">삭제</button></td>
          </tr>
        </tbody>
      </table>
    </section>

    <div class="notice" *ngIf="notice()">{{ notice() }}</div>
  </div>
  `,
  styles: [`
    .form-page{ padding:12px 16px; }
    .form-header{ display:flex; align-items:center; justify-content:space-between; position:sticky; top:12px; background:#fff; z-index:5; padding:8px 0; }
    .actions{ display:flex; gap:8px; align-items:center; }
    .btn{ height:30px; padding:0 12px; border-radius:8px; border:1px solid #d1d5db; background:#fff; cursor:pointer; }
    .btn.primary{ background:#111827; color:#fff; border-color:#111827; }
    .btn.ghost{ background:#fff; color:#111827; }
    .form-body{ border:1px solid #eef2f7; border-radius:12px; padding:12px; margin-bottom:12px; }
    .grid{ display:grid; grid-template-columns:120px 1fr; gap:10px 14px; align-items:center; }
    input, textarea{ width:100%; border:1px solid #e5e7eb; border-radius:8px; padding:6px 8px; font-size:13px; }
    .meta{ margin-top:12px; padding:8px 10px; border-top:1px dashed #e5e7eb; color:#6b7280; font-size:12px; }
    .notice{ margin:8px 0 0; padding:8px 10px; border:1px solid #bbf7d0; background:#ecfdf5; color:#065f46; border-radius:10px; font-size:12px; }
  `]
})
export class ProductFormComponent implements OnInit {
  id = signal<string | null>(null);
  model: any = {};
  meta: any = null;
  compositions: Array<{ id?: string; product_id?: string; ingredient_id: string; percent?: number | null; note?: string | null; }> = [];
  notice = signal<string | null>(null);

  constructor(private route: ActivatedRoute, private router: Router, private supabase: SupabaseService) {}
  async ngOnInit(){
    const id = this.route.snapshot.queryParamMap.get('id');
    if (id) {
      this.id.set(id);
      const { data } = await this.supabase.getProduct(id);
      this.model = data || {};
      this.meta = {
        created_at: data?.created_at,
        created_by: data?.created_by,
        created_by_name: data?.created_by_name,
        updated_at: data?.updated_at,
        updated_by: data?.updated_by,
        updated_by_name: data?.updated_by_name,
      };
      const { data: comps } = await this.supabase.listProductCompositions(id) as any;
      this.compositions = comps || [];
    }
  }
  addComposition(){ this.compositions.push({ ingredient_id: '', percent: null, note: '' }); }
  async removeComposition(row: any){ if (row?.id){ await this.supabase.deleteProductComposition(row.id); } this.compositions = this.compositions.filter(r => r !== row); }

  async save(){
    const { data: user } = await this.supabase.getClient().auth.getUser();
    const now = new Date().toISOString();
    const row: any = { ...this.model };
    if (!row.id) row.id = crypto.randomUUID();
    if (!this.id()) {
      row.created_at = now; row.created_by = user.user?.id || null; row.created_by_name = user.user?.email || null;
    }
    row.updated_at = now; row.updated_by = user.user?.id || null; row.updated_by_name = user.user?.email || null;
    const { data: saved } = await this.supabase.upsertProduct(row);
    this.model = saved || row; this.id.set(this.model.id);
    // Save compositions: naive upsert by id or insert when missing
    for (const c of this.compositions){
      if (!c.ingredient_id) continue;
      c.product_id = this.id()!;
      if (c.id) await this.supabase.updateProductComposition(c.id, { percent: c.percent || null, note: c.note || null } as any);
      else { const { data: ins } = await this.supabase.addProductComposition({ product_id: this.id()!, ingredient_id: c.ingredient_id, percent: c.percent || null, note: c.note || null } as any); Object.assign(c, ins || {}); }
    }
    this.notice.set('저장되었습니다.'); setTimeout(()=>this.notice.set(null), 2500);
  }
  cancel(){ this.router.navigate(['/app/product']); }

  async onExcel(ev: Event){
    const input = ev.target as HTMLInputElement; const file = input.files?.[0]; if (!file) return;
    const XLSX = await import('xlsx');
    const wb = await file.arrayBuffer().then(buf => XLSX.read(buf, { type: 'array' }));
    const ws = wb.Sheets[wb.SheetNames[0]]; const rows: any[] = XLSX.utils.sheet_to_json(ws, { defval: '' });
    // Send to backend (stub). You can implement server-side diff later.
    await this.supabase.syncProductsByExcel({ sheet: rows });
    this.notice.set(`엑셀 ${rows.length}건 처리 요청됨`); setTimeout(()=>this.notice.set(null), 2500);
  }
}


