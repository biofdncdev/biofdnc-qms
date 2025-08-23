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
        <button class="btn danger" (click)="onDelete()">삭제</button>
      </div>
    </header>

    <section class="form-body">
      <div class="row-3">
        <div class="field">
          <label>품목코드</label>
          <input [readonly]="true" [disabled]="true" [ngModel]="model.product_code" />
        </div>
        <div class="field">
          <label>제품명</label>
          <input [readonly]="true" [disabled]="true" [ngModel]="model.name_kr" />
        </div>
        <div class="field">
          <label>제품명(EN)</label>
          <input [readonly]="true" [disabled]="true" [ngModel]="model.name_en" />
        </div>
      </div>
      <div class="row-1">
        <div class="field">
          <label>품목설명</label>
          <textarea rows="3" [readonly]="true" [disabled]="true" [ngModel]="model.remarks"></textarea>
        </div>
      </div>
      <div class="row-1">
        <div class="field">
          <label>검색어(이명)</label>
          <input [readonly]="true" [disabled]="true" [ngModel]="model.keywords_alias" />
        </div>
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
            <th>INCI Name</th><th>한글성분명</th><th>조성비(%)</th><th></th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let c of compositions; let i = index">
            <td class="col-inci">
              <input [ngModel]="c.inci_name" (ngModelChange)="onInciChange(i, $event)" (input)="onInciInput(i, $event)" placeholder="INCI Name" [attr.list]="'inci-list-' + i" />
              <datalist [id]="'inci-list-' + i">
                <option *ngFor="let s of ingredientSuggest[i]" [value]="s.inci_name"></option>
              </datalist>
            </td>
            <td class="col-kor"><input [ngModel]="c.korean_name" readonly disabled /></td>
            <td class="col-pct"><input type="number" [(ngModel)]="c.percent" /></td>
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
    .btn.danger{ background:#fee2e2; color:#b91c1c; border-color:#fecaca; font-weight:700; }
    .form-body{ border:1px solid #eef2f7; border-radius:12px; padding:12px; margin-bottom:12px; }
    .row-3{ display:grid; grid-template-columns: repeat(3, minmax(220px, 1fr)); gap:12px; align-items:end; }
    .row-1{ display:grid; grid-template-columns:1fr; gap:12px; margin-top:10px; }
    .field{ display:flex; flex-direction:column; gap:6px; }
    input, textarea{ width:100%; box-sizing:border-box; border:1px solid #e5e7eb; border-radius:8px; padding:6px 8px; font-size:13px; }
    .meta{ margin-top:12px; padding:8px 10px; border-top:1px dashed #e5e7eb; color:#6b7280; font-size:12px; }
    .notice{ margin:8px 0 0; padding:8px 10px; border:1px solid #bbf7d0; background:#ecfdf5; color:#065f46; border-radius:10px; font-size:12px; }
  `]
})
export class ProductFormComponent implements OnInit {
  id = signal<string | null>(null);
  model: any = {};
  meta: any = null;
  compositions: Array<{ id?: string; product_id?: string; ingredient_id: string; percent?: number | null; note?: string | null; inci_name?: string; korean_name?: string }> = [];
  notice = signal<string | null>(null);
  private saveTimer: any = null;
  ingredientSuggest: Array<Array<{ id: string; inci_name: string; korean_name?: string }>> = [];

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
      // map for new UI fields
      this.compositions = (comps || []).map((c:any)=>({
        ...c,
        inci_name: (c.ingredient && c.ingredient.inci_name) || '',
        korean_name: (c.ingredient && c.ingredient.korean_name) || '',
      }));
      this.ingredientSuggest = this.compositions.map(()=>[]);
    }
  }
  addComposition(){ this.compositions.push({ ingredient_id: '', percent: null, note: '' }); }
  async removeComposition(row: any){ if (row?.id){ await this.supabase.deleteProductComposition(row.id); } this.compositions = this.compositions.filter(r => r !== row); }
  // Auto-save only remarks when changed
  onRemarksChange(_: any){
    if (this.saveTimer) clearTimeout(this.saveTimer);
    this.saveTimer = setTimeout(() => this.saveRemarks(), 600);
  }
  private async saveRemarks(){
    if (!this.id()) return; // existing product only
    const { data } = await this.supabase.upsertProduct({ id: this.id()!, remarks: this.model.remarks ?? null });
    if (data) this.model = { ...this.model, ...data };
    this.notice.set('비고가 저장되었습니다.'); setTimeout(()=>this.notice.set(null), 1800);
  }
  async onDelete(){
    if (!this.id()) return;
    const ok = confirm('이 제품을 삭제하시겠습니까? 조성성분도 함께 삭제됩니다.');
    if (!ok) return;
    await this.supabase.deleteProduct(this.id()!);
    this.router.navigate(['/app/product']);
  }

  // Excel upload removed from this screen per request

  // INCI autocomplete handlers
  async onInciInput(index:number, ev:any){
    const q = (ev?.target?.value || '').trim();
    if (!q){ this.ingredientSuggest[index] = []; return; }
    const { data } = await this.supabase.searchIngredientsBasic(q);
    this.ingredientSuggest[index] = data || [];
  }
  async onInciChange(index:number, value:string){
    const picked = (this.ingredientSuggest[index] || []).find(s => s.inci_name === value);
    if (picked){
      this.compositions[index].ingredient_id = picked.id;
      (this.compositions as any)[index].inci_name = picked.inci_name;
      (this.compositions as any)[index].korean_name = picked.korean_name || '';
    }
  }
}


