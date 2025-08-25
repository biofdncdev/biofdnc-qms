import { Component, OnInit, signal, Directive, ElementRef, HostListener, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';

@Directive({
  selector: 'textarea[autoGrow]',
  standalone: true
})
export class AutoGrowDirective implements AfterViewInit {
  constructor(private elementRef: ElementRef<HTMLTextAreaElement>) {}
  ngAfterViewInit(){ this.adjust(); this.applyBase(); }
  @HostListener('input') onInput(){ this.adjust(); }
  private applyBase(){ const el=this.elementRef.nativeElement; el.style.overflow='hidden'; el.style.resize='none'; }
  private adjust(){ const el=this.elementRef.nativeElement; el.style.height='auto'; el.style.height=`${el.scrollHeight}px`; }
}

@Component({
  selector: 'app-material-form',
  standalone: true,
  imports: [CommonModule, FormsModule, AutoGrowDirective],
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
        <label>자재번호</label>
        <input class="hl-green" [(ngModel)]="model.material_number" />
        <label>자재명</label>
        <textarea rows="1" autoGrow class="hl-green" [(ngModel)]="model.material_name"></textarea>

        <label>규격</label>
        <textarea rows="1" autoGrow [(ngModel)]="model.spec"></textarea>
        <label>기준단위</label>
        <input [(ngModel)]="model.standard_unit" />

        <label>자재상태</label>
        <input [(ngModel)]="model.material_status" />
        <label>품목자산분류</label>
        <input [(ngModel)]="model.item_asset_class" />

        <label>자재소분류</label>
        <input [(ngModel)]="model.material_sub_class" />
        <label>자재대분류</label>
        <input [(ngModel)]="model.material_large_class" />

        <label>자재중분류</label>
        <input [(ngModel)]="model.material_middle_class" />
        <label>관리부서</label>
        <input [(ngModel)]="model.managing_department" />

        <label>영문명</label>
        <input [(ngModel)]="model.english_name" />

        <label>기본구매처</label>
        <input [(ngModel)]="model.default_supplier" />

        <label>제조사</label>
        <input [(ngModel)]="model.manufacturer" />

        

        <label>Serial 관리</label>
        <input [(ngModel)]="model.is_serial_managed" />

        

        <label>비고</label>
        <textarea rows="1" autoGrow [(ngModel)]="model.material_notes"></textarea>

        <label>검색어(이명)</label>
        <input [(ngModel)]="model.search_keyword" />
        <label>사양</label>
        <textarea rows="1" autoGrow [(ngModel)]="model.specification"></textarea>

        <label>CAS NO</label>
        <input [(ngModel)]="model.cas_no" />
        <label>MOQ</label>
        <input [(ngModel)]="model.moq" />

        <label>포장단위</label>
        <input [(ngModel)]="model.packaging_unit" />
        <label>Country of Manufacture</label>
        <input [(ngModel)]="model.country_of_manufacture" />

        <label>Source of Origin(Method)</label>
        <input [(ngModel)]="model.source_of_origin_method" />
        <label>Plant Part</label>
        <input [(ngModel)]="model.plant_part" />

        <label>Country of Origin</label>
        <input [(ngModel)]="model.country_of_origin" />
        <label>NMPA 번호</label>
        <input [(ngModel)]="model.nmpa_registration_number" />

        <label>알러젠성분</label>
        <input [(ngModel)]="model.allergen_ingredient" />
        <label>Furocoumarines</label>
        <input [(ngModel)]="model.furocoumarines" />

        <label>효능</label>
        <input [(ngModel)]="model.efficacy" />
        <label>특허</label>
        <input [(ngModel)]="model.patent" />

        
        <label>임상</label>
        <input [(ngModel)]="model.clinical_trial" />

        <label>사용기한</label>
        <input [(ngModel)]="model.use_by_date" />
        <label>보관장소</label>
        <input [(ngModel)]="model.storage_location" />

        <label>보관방법</label>
        <input [(ngModel)]="model.storage_method" />
        <label>안정성 및 유의사항</label>
        <textarea rows="1" autoGrow [(ngModel)]="model.safety_and_precautions"></textarea>

        
        

        <!-- Place item description at the very bottom; span full width for readability -->
        <label>품목설명</label>
        <textarea rows="10" class="wide scroll" [(ngModel)]="model.item_description"></textarea>
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
  textarea{ white-space:pre-wrap; word-break:break-word; resize:none; overflow:hidden; min-height:28px; }
  /* simple auto-grow for textareas */
  textarea[autoGrow]{ height:auto; }
  .grid textarea.wide{ grid-column: 2 / span 3; }
  .grid textarea.scroll{ overflow:auto; }
  .hl-green{ background:#ecfdf5; border-color:#bbf7d0; }
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


