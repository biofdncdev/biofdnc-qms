import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ErpDataService } from '../../services/erp-data.service';
import { AuthService } from '../../services/auth.service';
import { TabService } from '../../services/tab.service';

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
  imports: [CommonModule, FormsModule],
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
              <td><span class="dot" [class.red]="getStatusForCode(p.product_code)==='red'" [class.orange]="getStatusForCode(p.product_code)==='orange'" [class.blue]="getStatusForCode(p.product_code)==='blue'" [class.double]="getStatusForCode(p.product_code)==='double'"></span>{{ p.product_code }}</td>
              <td>{{ p.name_kr }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="col midl small">
        <div class="title">조성비 <button class="btn-mini" (click)="openEditSelected()">수정</button></div>
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
            <span class="dot" [class.red]="r.status==='red'" [class.orange]="r.status==='orange'" [class.blue]="r.status==='blue'" [class.double]="r.status==='double'"></span>
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
  .title .btn-mini{ margin-left:6px; height:22px; padding:0 8px; font-size:11px; border:1px solid #d1d5db; border-radius:6px; background:#fff; cursor:pointer; }
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
  .dot.red{ background:#ef4444; }
  .dot.blue{ background:#38bdf8; }
  .dot.orange{ background:#f59e0b; }
  .dot.double{ background:conic-gradient(from 0deg, #38bdf8 0 50%, #0ea5e9 50% 100%); box-shadow: inset 0 0 0 2px #38bdf8; }
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
  searchResults = signal<Array<{ id: string; product_code: string; name_kr: string; name_en?: string; status?: 'red' | 'orange' | 'blue' | 'double' }>>([]);
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
  private readonly stateKey = 'product.bom.tree.state.v1';

  constructor(private erpData: ErpDataService,
    private auth: AuthService,
    private tabBus: TabService) {}
  async ngOnInit(){
    // restore state if any
    try{
      const raw = sessionStorage.getItem(this.stateKey);
      if (raw){
        const st = JSON.parse(raw);
        if (Array.isArray(st.selected) && st.selected.length){
          this.selectedProducts.set(st.selected);
          await this.rebuildFromSelection();
          if (st.currentProductCode){
            const p = st.selected.find((x:any)=> x.product_code===st.currentProductCode) || st.selected[0];
            if (p) this.onProductClick(p);
          }
        }
      }
    }catch{}
  }

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
  openEditSelected(){
    const code = this.currentProductCode || (this.selectedProducts()[0]?.product_code);
    if (!code) return;
    const navUrl = `/app/product/form?id=${encodeURIComponent(this.selectedProducts()[0]?.id || '')}`;
    this.tabBus.requestOpen('품목등록', '/app/product/form', navUrl);
  }
  debouncedSearch(){ if (this.debTimer) clearTimeout(this.debTimer); this.debTimer = setTimeout(()=> this.runSearch(), 200); }
  async runSearch(){
    const kw = (this.search||'').trim(); if (!kw){ this.searchResults.set([]); return; }
    const words = kw.split(/\s+/).filter(Boolean);
    const cols = ['product_code','name_kr','name_en','cas_no','spec','specification','keywords_alias'];
    const makeGroup = (w:string)=> cols.map(c=> `${c}.ilike.*${w}*`).join(',');
    const orLogic = words.map(w=> `or(${makeGroup(w)})`).join(',');
    const client = this.auth.getClient();
    const { data } = await client.from('products').select('id, product_code, name_kr, name_en, cas_no, spec, specification, keywords_alias').or(orLogic).limit(100) as any;
    const rows: any[] = Array.isArray(data)? data: [];
    const toHay = (r:any)=> `${r.product_code||''} ${r.name_kr||''} ${r.name_en||''} ${r.cas_no||''} ${r.spec||''} ${r.specification||''} ${r.keywords_alias||''}`.toLowerCase();
    const filtered = rows.filter(r=> words.every(w=> toHay(r).includes(w.toLowerCase())));
    // Compute status indicators in batch
    const ids = filtered.map(r=> r.id);
    const codes = filtered.map(r=> r.product_code);
    // 1) compositions per product
    const { data: compRows } = await client
      .from('product_compositions')
      .select('product_id, ingredient:ingredients(inci_name)')
      .in('product_id', ids) as any;
    const compCountById = new Map<string, number>();
    const compSetById = new Map<string, Set<string>>();
    for (const r of (compRows||[])){
      const pid = r.product_id as string; const ing = (r?.ingredient?.inci_name||'').trim();
      compCountById.set(pid, (compCountById.get(pid)||0)+1);
      const s = compSetById.get(pid) || new Set<string>(); if (ing) s.add(ing); compSetById.set(pid, s);
    }
    // 2) selections per product_code
    const { data: selRows } = await client
      .from('product_bom_material_map')
      .select('product_code, ingredient_name, selected_material_id, selected_material_number')
      .in('product_code', codes) as any;
    const matchedCountByCode = new Map<string, number>();
    const matchedSetByCode = new Map<string, Set<string>>();
    for (const r of (selRows||[])){
      const code = (r.product_code||'') as string; const ing = (r.ingredient_name||'').toLowerCase();
      const hasSel = !!(r.selected_material_id || r.selected_material_number);
      if (hasSel){
        matchedCountByCode.set(code, (matchedCountByCode.get(code)||0)+1);
        const s = matchedSetByCode.get(code) || new Set<string>(); if (ing) s.add(ing); matchedSetByCode.set(code, s);
      }
    }
    // 3) verification logs (materials)
    const { data: verifyRows } = await client
      .from('products')
      .select('id, materials_verify_logs')
      .in('id', ids) as any;
    const verifiedById = new Map<string, boolean>();
    for (const r of (verifyRows||[])){
      const logs = (r?.materials_verify_logs || []) as any[];
      verifiedById.set(r.id, Array.isArray(logs) && logs.length>0);
    }
    const withStatus = filtered.map(r=>{
      const hasComp = (compCountById.get(r.id)||0) > 0;
      let status: 'red' | 'orange' | 'blue' | 'double' | undefined = undefined;
      if (!hasComp){ status = 'red'; }
      else {
        status = 'orange';
        const compSet = compSetById.get(r.id) || new Set<string>();
        const matchedSet = matchedSetByCode.get(r.product_code) || new Set<string>();
        if (compSet.size > 0 && matchedSet.size >= compSet.size){
          status = 'double';
        } else if (verifiedById.get(r.id)) {
          status = 'blue';
        }
      }
      return { ...r, status };
    });
    this.searchResults.set(withStatus);
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
    if (!exists){ this.selectedProducts.set([ ...this.selectedProducts(), row ]); await this.rebuildFromSelection(); this.saveState(); }
  }
  async rebuildFromSelection(){
    // Build compositions and unique ingredient list for all selected products
    const client = this.auth.getClient();
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
    const saved = await this.erpData.getBomMaterialSelection(product_code);
    this.selectionsMap = {}; for(const s of saved){ this.selectionsMap[(s.ingredient_name||'').toLowerCase()] = s; }
    // refresh chosen materials list
    this.refreshChosenMaterials();
    this.saveState();
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
    this.saveState();
  }
  // Status for selected list as well
  hasCompositions(code: string){ return this.allCompositions.some(r=> r.product_code === code); }
  getStatusForCode(code: string): 'red' | 'orange' | 'blue' | 'double' {
    const hasComp = this.allCompositions.some(r=> r.product_code === code);
    if (!hasComp) return 'red';
    // If saved selections cover all ingredients for this code -> double
    const compSet = new Set(this.allCompositions.filter(r=> r.product_code===code).map(r=> r.ingredient.toLowerCase()));
    const matchedSet = new Set(Object.keys(this.selectionsMap));
    if (compSet.size>0 && [...compSet].every(k => matchedSet.has(k))) return 'double';
    // If any verification logs exist for this product, show blue; otherwise orange
    // We don't have logs here, so default to orange until expanded later
    return 'orange';
  }
  context: { ingredient: string; product_code?: string } | null = null;
  currentContext(){ return this.context; }
  async onIngredientClick(ing: string, product_code?: string){
    this.context = { ingredient: ing, product_code };
    // load specification matches in materials table
    const mats = await this.erpData.listMaterialsBySpecificationExact(ing);
    this.materialCandidates.set(mats);
  }
  async chooseMaterial(mat: any){
    // associate to first selected product
    const ctx = this.context; if (!ctx) return; const baseCode = ctx.product_code || (this.selectedProducts()[0]?.product_code);
    if (!baseCode) return;
    await this.erpData.setBomMaterialSelection({ product_code: baseCode, ingredient_name: ctx.ingredient, selected_material_id: mat.id || null, selected_material_number: mat.material_number || null });
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

  private saveState(){
    try{
      const st = {
        selected: this.selectedProducts(),
        currentProductCode: this.currentProductCode,
      };
      sessionStorage.setItem(this.stateKey, JSON.stringify(st));
    }catch{}
  }
}

