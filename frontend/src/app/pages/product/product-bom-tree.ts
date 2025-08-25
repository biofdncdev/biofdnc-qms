import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../services/supabase.service';

type BomNode = { code: string; name: string; percent?: number | null; children?: BomNode[] };

@Component({
  selector: 'app-children',
  standalone: true,
  imports: [CommonModule],
  inputs: ['nodes'],
  template: `
  <ul *ngIf="nodes?.length" class="node-list">
    <li *ngFor="let c of nodes">
      <div class="node">{{ c.code }} · {{ c.name }}<span *ngIf="c.percent!=null"> — {{ c.percent }}%</span></div>
      <app-children [nodes]="c.children"></app-children>
    </li>
  </ul>`,
  styles: [`.node-list{ list-style:none; padding-left:16px; } .node{ padding:2px 0; }`]
})
export class ChildrenComponent { nodes?: BomNode[]; }

@Component({
  standalone: true,
  selector: 'app-product-bom-tree',
  imports: [CommonModule, FormsModule, ChildrenComponent],
  template: `
  <div class="page">
    <header class="top"><h2><span class="title-main">Product</span> <span class="sub">BOM Tree</span></h2>
      <div class="spacer"></div>
    </header>
    <section class="toolbar">
      <div class="spacer"></div>
      <button class="btn pick-btn" (click)="openSearch()">품목 선택</button>
    </section>
    <section class="grid5">
      <div class="col left small">
        <div class="title">선택한 품목</div>
        <table class="tbl">
          <thead><tr><th>품번</th><th>품명</th></tr></thead>
          <tbody>
            <tr *ngFor="let p of selectedProducts()" (click)="onProductClick(p)" [class.active]="p.product_code===currentProductCode">
              <td><span class="dot" [class.blue]="hasCompositions(p.product_code)" [class.orange]="!hasCompositions(p.product_code)"></span>{{ p.product_code }}</td>
              <td>{{ p.name_kr }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="col midl small">
        <div class="title">조성비</div>
        <table class="tbl">
          <thead><tr><th>품번</th><th>성분</th><th>%</th></tr></thead>
          <tbody>
            <tr *ngFor="let r of compositionsTableItems()" (click)="onIngredientClick(r.ingredient, r.product_code)">
              <td>{{ r.product_code }}</td>
              <td class="clickable">{{ r.ingredient }}</td>
              <td class="num">{{ r.percent | number:'1.0-2' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="col mid small">
        <div class="title">자재 (사양 일치)</div>
        <div *ngIf="materialCandidates().length===0" class="hint">조성에서 성분을 클릭해 주세요.</div>
        <table class="tbl" *ngIf="materialCandidates().length">
          <thead><tr><th>사양(성분)</th><th>자재번호</th><th>자재명</th><th>선택</th></tr></thead>
          <tbody>
            <tr *ngFor="let m of materialCandidates()" (click)="chooseMaterial(m)">
              <td>{{ currentContext()?.ingredient }}</td>
              <td>{{ m.material_number || '-' }}</td>
              <td>{{ m.material_name || '-' }}</td>
              <td class="sel">{{ isCurrentSelected(m) ? '✓' : '' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="col midr small">
        <div class="title">성분 집합</div>
        <ul class="list">
          <li class="static" *ngFor="let ing of uniqueIngredients()">{{ ing }}</li>
        </ul>
      </div>
      <div class="col right small">
        <div class="title">선택된 자재 집합</div>
        <ul class="list">
          <li *ngFor="let m of chosenMaterials()">{{ m.material_number || '-' }} · {{ m.material_name || '-' }}</li>
        </ul>
      </div>
    </section>
    <!-- Popup search -->
    <div class="overlay" *ngIf="searchOpen()" (click)="closeSearch()">
      <div class="popup" (click)="$event.stopPropagation()" [style.top.px]="popTop" [style.left.px]="popLeft">
        <div class="pop-head">
          <div class="title">품목 선택</div>
          <button class="btn ghost" (click)="closeSearch()">닫기</button>
        </div>
        <input class="search" autofocus [(ngModel)]="search" (input)="debouncedSearch()" (keydown.arrowDown)="movePointer(1)" (keydown.arrowUp)="movePointer(-1)" (keydown.enter)="onEnterInSearch()" (keydown.escape)="onEscInSearch()" placeholder="품번/품명/영문명/CAS/사양/검색어 검색 (공백=AND)" />
        <ul class="sr-list">
          <li *ngFor="let r of searchResults(); let i=index" [class.sel]="i===pointer" (click)="addProduct(r)">
            {{ r.product_code }} · {{ r.name_kr }}<span *ngIf="r.name_en"> · {{ r.name_en }}</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
  `,
  styles: [`
  .page{ padding:12px 16px; }
  .top{ display:flex; align-items:center; gap:10px; margin-bottom:4px; }
  .top h2{ margin:0; font-size:24px; font-weight:800; }
  .title-main{ font-size:inherit; font-weight:inherit; }
  .sub{ font-size:16px; font-weight:700; margin-left:6px; color:#6b7280; }
  .spacer{ flex:1; }
  .toolbar{ display:flex; align-items:center; gap:8px; margin-top:50px; }
  .btn{ height:30px; padding:0 12px; border-radius:8px; border:1px solid #d1d5db; background:#fff; cursor:pointer; font-size:12px; }
  .grid5{ display:grid; grid-template-columns: 1fr 1fr 1fr 1fr 1fr; gap:12px; margin-top:8px; }
  .col{ border:1px solid #eef2f7; border-radius:10px; padding:8px; min-height:240px; }
  .title{ font-size:12px; color:#6b7280; margin-bottom:6px; font-weight:700; }
  .small{ font-size:12px; }
  .list{ list-style:none; margin:0; padding:0; }
  .list li{ padding:4px 6px; cursor:pointer; border-radius:6px; }
  .list li:hover{ background:#f3f4f6; }
  .list li.static{ cursor:default; }
  .list li.static:hover{ background:transparent; }
  .tbl{ width:100%; border-collapse:collapse; }
  .tbl th, .tbl td{ border-bottom:1px solid #f1f5f9; padding:4px 6px; text-align:left; }
  .tbl td.num{ text-align:right; }
  .tbl td.sel{ text-align:center; width:44px; }
  .clickable{ cursor:pointer; }
  .tbl tr.active{ box-shadow:inset 0 0 0 9999px rgba(2,132,199,0.06); }
  .dot{ display:inline-block; width:8px; height:8px; border-radius:50%; margin-right:6px; position:relative; top:-1px; }
  .dot.blue{ background:#38bdf8; }
  .dot.orange{ background:#f59e0b; }
  .overlay{ position:fixed; inset:0; background:rgba(0,0,0,0.08); }
  .popup{ position:absolute; width:520px; max-height:70vh; background:#fff; border:1px solid #e5e7eb; border-radius:12px; box-shadow:0 6px 24px rgba(0,0,0,0.18); padding:10px; }
  .pop-head{ display:flex; align-items:center; justify-content:space-between; margin-bottom:6px; }
  .search{ width:100%; height:32px; border:1px solid #d1d5db; border-radius:8px; padding:0 10px; box-sizing:border-box; }
  .sr-list{ list-style:none; margin:8px 0 0; padding:0; max-height:52vh; overflow:auto; }
  .sr-list li{ padding:6px 8px; cursor:pointer; border-radius:8px; }
  .sr-list li.sel, .sr-list li:hover{ background:#f3f4f6; }
  `]
})
export class ProductBomTreeComponent implements OnInit {
  // search
  search = '';
  searchOpen = signal(false);
  searchResults = signal<Array<{ id: string; product_code: string; name_kr: string; name_en?: string }>>([]);
  debTimer: any = null;
  pointer = -1;
  popTop = 0; popLeft = 0;

  // state
  selectedProducts = signal<Array<{ id: string; product_code: string; name_kr: string }>>([]);
  currentProductId: string | null = null;
  currentProductCode: string | null = null;
  leftCompositions = signal<Array<{ product_code: string; ingredient: string; percent: number }>>([]);
  private allCompositions: Array<{ product_code: string; ingredient: string; percent: number }> = [];
  uniqueIngredients = signal<string[]>([]);
  // live material candidates for a clicked ingredient
  materialCandidates = signal<any[]>([]);
  chosenMaterials = signal<any[]>([]);
  private selectionsMap: Record<string, any> = {};

  constructor(private supabase: SupabaseService) {}
  async ngOnInit(){ }

  openSearch(){
    this.searchOpen.set(true);
    // place under the '품목 선택' button, right-aligned
    setTimeout(()=>{
      const btn = document.querySelector('.pick-btn') as HTMLElement | null;
      const pop = document.querySelector('.popup') as HTMLElement | null;
      if (btn && pop){
        const r = btn.getBoundingClientRect();
        const pw = pop.offsetWidth || 520;
        this.popTop = Math.round(r.bottom + 6 + window.scrollY);
        let left = Math.round(r.right - pw + window.scrollX);
        // clamp within viewport
        const minL = 8 + window.scrollX;
        const maxL = window.scrollX + window.innerWidth - pw - 8;
        this.popLeft = Math.max(minL, Math.min(maxL, left));
      }
      // focus search input
      const el = document.querySelector('.popup .search') as HTMLInputElement | null; el?.focus();
      this.runSearch();
    }, 0);
  }
  closeSearch(){ this.searchOpen.set(false); }
  debouncedSearch(){ if (this.debTimer) clearTimeout(this.debTimer); this.debTimer = setTimeout(()=> this.runSearch(), 200); }
  async runSearch(){
    const kw = (this.search||'').trim(); if (!kw){ this.searchResults.set([]); return; }
    const words = kw.split(/\s+/).filter(Boolean);
    const cols = ['product_code','name_kr','name_en','cas_no','spec','specification','keywords_alias'];
    const makeGroup = (w:string)=> cols.map(c=> `${c}.ilike.*${w}*`).join(',');
    const orLogic = words.map(w=> `or(${makeGroup(w)})`).join(',');
    const { data } = await this.supabase.getClient().from('products').select('id, product_code, name_kr, name_en, cas_no, spec, specification, keywords_alias').or(orLogic).limit(100) as any;
    const rows: any[] = Array.isArray(data)? data: [];
    const toHay = (r:any)=> `${r.product_code||''} ${r.name_kr||''} ${r.name_en||''} ${r.cas_no||''} ${r.spec||''} ${r.specification||''} ${r.keywords_alias||''}`.toLowerCase();
    const filtered = rows.filter(r=> words.every(w=> toHay(r).includes(w.toLowerCase())));
    this.searchResults.set(filtered);
    this.pointer = Math.min(this.pointer<0?0:this.pointer, Math.max(0, filtered.length-1));
  }
  async onEnterInSearch(){
    const list = this.searchResults(); if (!list.length) return;
    const pick = list[Math.max(0, this.pointer)]; if (pick) await this.addProduct(pick);
  }
  movePointer(delta:number){ const len=this.searchResults().length; if (!len) return; this.pointer = (this.pointer + delta + len) % len; }
  onEscInSearch(){ this.search=''; this.pointer=-1; setTimeout(()=>{
    const el = document.querySelector('.popup .search') as HTMLInputElement | null;
    el?.focus();
  }, 0); }
  async addProduct(row: { id: string; product_code: string; name_kr: string }){
    // accumulate
    const exists = this.selectedProducts().some(p=> p.id===row.id);
    if (!exists){ this.selectedProducts.set([ ...this.selectedProducts(), row ]); await this.rebuildFromSelection(); }
  }
  async rebuildFromSelection(){
    // Build compositions and unique ingredient list for all selected products
    const client = this.supabase.getClient();
    const list = this.selectedProducts(); if (!list.length){ this.leftCompositions.set([]); this.uniqueIngredients.set([]); return; }
    const ids = list.map(p=> p.id);
    const { data: prods } = await client.from('products').select('id, product_code').in('id', ids) as any;
    const idToCode: Record<string,string> = {}; for (const p of (prods||[])) idToCode[p.id]=p.product_code;
    const { data: comps } = await client.from('product_compositions').select('product_id, percent, ingredient:ingredients(inci_name)').in('product_id', ids) as any;
    const rows: Array<{ product_code:string; ingredient:string; percent:number }> = [];
    const uniqueIngSet = new Set<string>();
    for (const r of (comps||[])){
      const ing=(r?.ingredient?.inci_name||'').trim(); if (!ing) continue; const pc=idToCode[r.product_id]; if (!pc) continue;
      rows.push({ product_code: pc, ingredient: ing, percent: Number(r.percent)||0 });
      uniqueIngSet.add(ing);
    }
    // sort for readability by product then percent
    rows.sort((a,b)=> a.product_code.localeCompare(b.product_code) || (b.percent-a.percent));
    this.allCompositions = rows;
    // do not show until a product is clicked
    this.leftCompositions.set([]);
    this.uniqueIngredients.set(Array.from(uniqueIngSet).sort());
    // preload saved selections for first product
    const { product_code } = list[0];
    const saved = await this.supabase.getBomMaterialSelection(product_code);
    this.selectionsMap = {}; for(const s of saved){ this.selectionsMap[(s.ingredient_name||'').toLowerCase()] = s; }
    // refresh chosen materials list
    this.refreshChosenMaterials();
  }
  onProductClick(p: { id: string; product_code: string; name_kr: string }){
    this.currentProductId = p.id;
    this.currentProductCode = p.product_code;
    // filter compositions table to this product only from master set
    const filtered = this.allCompositions.filter(r => r.product_code === p.product_code);
    this.leftCompositions.set(filtered);
    // update unique ingredient list accordingly
    const set = new Set(filtered.map(r=> r.ingredient));
    this.uniqueIngredients.set(Array.from(set).sort());
    // clear middle candidates until a new ingredient is clicked
    this.materialCandidates.set([]);
  }
  hasCompositions(code: string){ return this.allCompositions.some(r=> r.product_code === code); }
  context: { ingredient: string; product_code?: string } | null = null;
  currentContext(){ return this.context; }
  async onIngredientClick(ing: string, product_code?: string){
    this.context = { ingredient: ing, product_code };
    // load specification matches in materials table
    const mats = await this.supabase.listMaterialsBySpecificationExact(ing);
    this.materialCandidates.set(mats);
  }
  async chooseMaterial(mat: any){
    // associate to first selected product
    const ctx = this.context; if (!ctx) return; const baseCode = ctx.product_code || (this.selectedProducts()[0]?.product_code);
    if (!baseCode) return;
    await this.supabase.setBomMaterialSelection({ product_code: baseCode, ingredient_name: ctx.ingredient, selected_material_id: mat.id || null, selected_material_number: mat.material_number || null });
    // store in local map
    this.selectionsMap[ctx.ingredient.toLowerCase()] = { selected_material_id: mat.id, selected_material_number: mat.material_number, material_name: mat.material_name };
    this.refreshChosenMaterials();
  }
  isCurrentSelected(m:any){ const ctx=this.context; if (!ctx) return false; const s=this.selectionsMap[ctx.ingredient.toLowerCase()]; return !!(s && ((s.selected_material_id && s.selected_material_id===m.id) || (s.selected_material_number && s.selected_material_number===m.material_number))); }
  compositionsTableItems(){ return this.leftCompositions(); }
  refreshChosenMaterials(){
    const list: any[] = [];
    for (const key of Object.keys(this.selectionsMap)){
      const s = this.selectionsMap[key];
      list.push({ material_number: s.selected_material_number, material_name: s.material_name || '-' });
    }
    // unique by material_number
    const seen = new Set<string>();
    const uniq = list.filter(m=>{ const k=m.material_number||m.material_name; if (seen.has(k)) return false; seen.add(k); return true; });
    this.chosenMaterials.set(uniq);
  }
}

