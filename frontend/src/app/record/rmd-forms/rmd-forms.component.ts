import { Component, ElementRef, HostListener, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RmdFormCategory, RmdFormItem } from './rmd-forms-data';
import { RMD_STANDARDS } from '../../standard/rmd/rmd-standards';
import { SupabaseService } from '../../services/supabase.service';
import { TabService } from '../../services/tab.service';
import { RmdFormsPdfService } from './services/rmd-forms-pdf.service';
import { RmdFormsFilterService } from './services/rmd-forms-filter.service';
import { RmdFormsMetadataService } from './services/rmd-forms-metadata.service';
import { RecordFeaturesSelectorComponent } from '../../pages/record/features/record-features-selector';
import { normalizeRecordFeatures } from '../../pages/record/features/record-features.registry';
import { RmdFormsThRecordService } from './services/rmd-forms-th-record.service';
import { AuditLink, StandardLink, UserPair } from './rmd-forms.types';

@Component({
  selector: 'app-rmd-forms',
  standalone: true,
  imports: [CommonModule, FormsModule, RecordFeaturesSelectorComponent],
  providers: [
    RmdFormsPdfService,
    RmdFormsFilterService,
    RmdFormsMetadataService,
    RmdFormsThRecordService
  ],
  templateUrl: './rmd-forms.component.html',
  styleUrls: [
    '../../standard/rmd/rmd-page.component.scss',
    './rmd-forms.component.scss'
  ]
})
export class RmdFormsComponent {
  categories: RmdFormCategory[] = [];
  selected = signal<RmdFormItem | null>(null);
  categoriesNoISO: string[] = [];
  stdCategoryOptions: Array<{ value: string; label: string }> = [];
  // Edit modal state
  editOpen = signal(false);
  edit: { id?: string; title: string; docNo: string; category: string | null } = { title: '', docNo: '', category: null };
  auditCompanies: string[] = [];
  
  // User typeahead
  users: string[] = [];
  userPairs: UserPair[] = [];
  ownerSuggest: string[] = [];
  ownerIndex = -1;
  ownerTyping: string = '';
  
  // Audit connections
  private recordToAuditMap: Record<string, Array<{ number: number; company?: string | null }>> = {};
  private auditTitleMap: Record<number, string> = {};
  linkedAuditItems = signal<AuditLink[]>([]);
  linkedCompanies = signal<string[]>([]);
  linkedStandards = signal<StandardLink[]>([]);
  // Departments for dropdowns
  departments: Array<{ id: string; name: string; code: string; company_code?: string|null; company_name?: string|null }> = [];
  ownerDeptToAdd: string = '';
  useDeptToAdd: string = '';
  isGivaudanAudit = false;
  
  // Standard search modal
  showStandardSearchModal = signal(false);
  standardSearchQuery = signal('');
  standardSearchFilter = signal('');  // 실제 필터링에 사용될 검색어
  allStandards: Array<{ id: string; title: string; category: string }> = [];
  selectedStandardIndex = -1;
  
  // Standard title map
  private stdTitleById: Record<string, string> = (() => {
    const map: Record<string, string> = {};
    try {
      for (const c of RMD_STANDARDS) {
        for (const it of (c.items || [])) {
          map[it.id] = it.title;
        }
      }
    } catch {}
    return map;
  })();

  @ViewChild('centerPane', { static: false }) centerPane?: ElementRef<HTMLElement>;
  @ViewChild('rightPane', { static: false }) rightPane?: ElementRef<HTMLElement>;
  @ViewChild('ownerInput') ownerInputRef?: ElementRef<HTMLInputElement>;
  @ViewChild('searchInput') searchInputRef?: ElementRef<HTMLInputElement>;
  
  // Temperature/Humidity specific ViewChildren
  @ViewChild('container', { static: false }) containerRef?: ElementRef<HTMLDivElement>;
  @ViewChild('pdfCanvas', { static: false }) pdfCanvasRef?: ElementRef<HTMLCanvasElement>;
  @ViewChild('drawCanvas', { static: false }) drawCanvasRef?: ElementRef<HTMLCanvasElement>;
  
  constructor(
    private supabase: SupabaseService,
    private tabs: TabService,
    public pdfService: RmdFormsPdfService,
    public filterService: RmdFormsFilterService,
    public metadataService: RmdFormsMetadataService,
    public thService: RmdFormsThRecordService
  ) {
    // Initialize all standards for search
    for (const category of RMD_STANDARDS) {
      for (const item of category.items) {
        this.allStandards.push({
          id: item.id,
          title: item.title,
          category: category.category
        });
      }
    }
    // Build standard category dropdown options like BF-RM-GM 회사-부서-규정카테고리
    try{
      // Build options by pairing company/department codes with regulation category code from first item
      const options: Array<{ value: string; label: string }> = [];
      for (const cat of RMD_STANDARDS){
        const example = cat.items?.[0]?.id || '';
        const parts = example.split('-');
        // Expect like BF-RM-GM-01 -> company(BF), dept(RMD), catCode(GM)
        const codeLabel = parts.length >= 3 ? `${parts[0]}-${parts[1]}-${parts[2]}` : '';
        options.push({ value: cat.category, label: `${codeLabel} ${cat.category}`.trim() });
      }
      this.stdCategoryOptions = options;
    }catch{}
  }

  // Edit modal handlers
  openEditModal(sel: any){
    // Ensure categories are loaded for the dropdown
    if (!this.allCategoriesForCreate?.length) { try{ this.loadCatsForCreate(); }catch{} }
    // Map existing category name to its ID for the select
    const catId = (this.allCategoriesForCreate||[])
      .find((c:any) => (c?.name||'') === (sel?.standardCategory||''))?.id || null;
    this.edit = {
      id: sel.id,
      title: sel.title || sel.id,
      docNo: sel.id,
      category: catId,
    };
    this.editOpen.set(true);
  }
  closeEditModal(){ this.editOpen.set(false); }
  async autoNumberEdit(){
    try{
      const cat = (this.allCategoriesForCreate||[]).find((c:any)=> c.id === this.edit.category);
      if (!cat) return;
      const d = (await this.supabase.listDepartments()).find((x:any)=> (x?.code||'') === (cat as any)?.department_code);
      const company = (d?.company_code || '').trim();
      const dept = (d?.code || '').trim();
      const prefixNoSeq = [company, dept, cat.doc_prefix, 'FR'].filter(Boolean).join('-');
      const next = await (this.supabase as any).getNextRecordDocNo(prefixNoSeq);
      this.edit.docNo = next;
    }catch{}
  }
  async applyEdit(){
    const sel = this.selected();
    if (!sel) return;
    const prevRecordNo = sel.id;
    // Prepare change set for DB update
    const update: any = {};
    if (this.edit.title && this.edit.title !== sel.title) {
      update.record_name = this.edit.title;
      sel.title = this.edit.title;
    }
    if (this.edit.category){
      const cat = (this.allCategoriesForCreate||[]).find((c:any)=> c.id === this.edit.category);
      if (cat) { update.standard_category = cat.name; sel.standardCategory = cat.name; }
    }
    if (this.edit.docNo && this.edit.docNo !== sel.id){
      update.record_no = this.edit.docNo; // request doc number change
      sel.id = this.edit.docNo;
    }
    // Persist changes directly without creating a new row
    try{ await (this.supabase as any).updateFormMetaByRecordNo(prevRecordNo, update); }catch{}
    // Keep other meta values untouched but ensure local state is saved
    await this.metadataService.persistMeta(sel);
    this.closeEditModal();
    // Refresh list
    await this.reloadMeta();
  }

  // === Create record modal ===
  createOpen = signal<boolean>(false);
  busyCreate = signal<boolean>(false);
  dupCreate = signal<boolean>(false);
  create = { categoryId: '', title: '', docNo: '' } as any;
  allCategoriesForCreate: Array<{ id: string; name: string; doc_prefix: string }> = [];
  openCreateModal(){ this.create = { categoryId: '', title: '', docNo: '' }; this.dupCreate.set(false); this.createOpen.set(true); this.loadCatsForCreate(); }
  closeCreateModal(){ this.createOpen.set(false); }
  private async loadCatsForCreate(){
    try{ const cats: any[] = await (this.supabase as any).listRmdCategories(); this.allCategoriesForCreate = cats as any[]; }catch{ this.allCategoriesForCreate = []; }
  }

  private async reloadMeta(){
    try{
      const rows: any[] = await this.supabase.listAllFormMeta();
      const map: Record<string, RmdFormItem[]> = {};
      const seenIds = new Set<string>(); // Track unique IDs to prevent duplicates
      
      for (const r of (rows||[])){
        const id = String((r as any).record_no || '').trim();
        if (!id || seenIds.has(id)) continue; // Skip if empty or already processed
        seenIds.add(id);
        
        const cat = String((r as any).standard_category || '기타');
        const item: RmdFormItem = {
          id,
          title: String((r as any).record_name || id),
          department: (r as any).department || '원료제조팀',
          method: (r as any).method || null,
          period: (r as any).period || null,
          standard: (r as any).standard || null,
          standardCategory: cat,
          features: normalizeRecordFeatures((r as any).features || {}), // Normalize features here
        } as any;
        if (!map[cat]) map[cat] = [];
        map[cat].push(item);
      }
      this.categories = Object.keys(map).sort().map(k => ({ category: k, items: map[k] }));
      this.categoriesNoISO = this.categories.map(c=>c.category).filter(c=>c!=='ISO');
      this.filterService.setCategories(this.categories);
    }catch{}
  }
  async autoNumberCreate(){
    const cat = (this.allCategoriesForCreate||[]).find(c=>c.id===this.create.categoryId);
    if (!cat) return;
    // 회사-부서-규정카테고리코드-FR-두자리
    const d = (await this.supabase.listDepartments()).find((x:any)=> (x?.code||'') === (cat as any)?.department_code);
    const company = (d?.company_code || '').trim();
    const dept = (d?.code || '').trim();
    const prefixNoSeq = [company, dept, cat.doc_prefix, 'FR'].filter(Boolean).join('-');
    this.busyCreate.set(true);
    try{
      const next = await (this.supabase as any).getNextRecordDocNo(prefixNoSeq);
      this.create.docNo = next;
      this.dupCreate.set(false);
    } finally { this.busyCreate.set(false); }
  }
  async submitCreate(){
    const title = (this.create.title||'').trim();
    const docNo = (this.create.docNo||'').trim();
    const categoryId = this.create.categoryId;
    if (!title || !docNo || !categoryId){ alert('카테고리/기록명/문서번호를 모두 입력하세요.'); return; }
    this.busyCreate.set(true);
    try{
      const taken = await (this.supabase as any).isRecordDocNoTaken(docNo);
      if (taken){ this.dupCreate.set(true); alert('이미 사용된 번호입니다. 다른 번호를 입력하세요.'); return; }
      // Create directly in record_form_meta (legacy approach)
      const catName = this.allCategoriesForCreate.find(c=>c.id===categoryId)?.name || null;
      const res = await (this.supabase as any).upsertFormMeta({ 
        record_no: docNo, 
        record_name: title, 
        standard_category: catName, 
        department: '원료제조팀',
        features: { uploadFiles: true },
      });
      if (!res || res.error){
        throw new Error(res?.error?.message || '저장 실패');
      }
      this.createOpen.set(false);
      await this.reloadMeta();
      try{
        let it = this.filterService.filteredFlat().find(x=>x.id===docNo);
        if (!it){
          // Fallback: inject client-side item if DB propagation delayed
          const catName = this.allCategoriesForCreate.find(c=>c.id===categoryId)?.name || '기타';
          const item: RmdFormItem = { id: docNo, title, department: '원료제조팀', standardCategory: catName } as any;
          this.filterService.addExtraItem(item);
          it = item as any;
        }
        if (it) this.open(it);
      }catch{}
    } catch(e: any){
      alert('생성 중 오류: ' + (e?.message || e));
    } finally { this.busyCreate.set(false); }
  }

  ngOnInit() {
    this.preloadCompanies();
    this.buildAuditLinkMap();
    this.reloadMeta();
    this.loadInitialData();
    // Resolve current user role for conditional UI
    queueMicrotask(async () => {
      try{
        const u = await this.supabase.getCurrentUser();
        if (u){
          const { data } = await this.supabase.getUserProfile(u.id);
          this.isGivaudanAudit = (data?.role === 'givaudan_audit');
        }
      }catch{}
    });
  }

  ngAfterViewInit() {
    queueMicrotask(async () => {
      await this.thService.checkAdmin();
      this.thService.periodStartSig.set(this.thService.computePeriodStart(this.thService.dateValue()));
      if (this.selected()?.id === 'BF-RM-PM-IR-07') {
        await this.renderPdf();
        await this.loadRecord();
      }
      // Attach scroll listeners
      try {
        this.centerPane?.nativeElement?.addEventListener('scroll', () => this.persistUiState(), { passive: true });
        this.rightPane?.nativeElement?.addEventListener('scroll', () => this.persistUiState(), { passive: true });
      } catch {}
    });
  }

  @HostListener('window:resize')
  onResize() {
    if (this.thService.fullscreen()) {
      this.renderPdf();
    }
  }

  // === Owner management ===
  onOwnerInputText(v: string) {
    try {
      this.ownerTyping = v;
      const q = (v || '').toString().trim().toLowerCase();
      if (!q) {
        this.ownerSuggest = [];
        this.ownerIndex = -1;
        return;
      }
      const pool = this.userPairs || [];
      const matched = pool.filter(p => 
        (p.name || '').toLowerCase().includes(q) || 
        (p.email || '').toLowerCase().includes(q)
      );
      this.ownerSuggest = matched.slice(0, 8).map(p => `${p.name} / ${p.email}`);
      this.ownerIndex = -1;
    } catch {
      this.ownerSuggest = [];
      this.ownerIndex = -1;
    }
  }

  chooseOwner(sel: any, u: string) {
    this.appendOwner(sel, u);
    this.ownerTyping = '';
    this.ownerSuggest = [];
    this.ownerIndex = -1;
  }

  private appendOwner(sel: any, text: string) {
    const name = (text || '').toString().trim();
    if (!name) return;
    const list = this.getOwnerList(sel);
    if (!list.includes(name)) list.push(name);
    sel.owner = list.join(', ');
    this.metadataService.persistMeta(sel);
  }

  getOwnerList(sel: any): string[] {
    const val = (sel.owner || '').toString();
    return val ? val.split(/\s*,\s*/).filter(Boolean) : [];
  }

  removeOwnerChip(sel: any, name: string) {
    const list = this.getOwnerList(sel).filter((n: string) => n !== name);
    sel.owner = list.join(', ');
    this.metadataService.persistMeta(sel);
  }

  onOwnerKeydown(ev: KeyboardEvent, sel: any) {
    const key = ev.key || (ev as any).keyIdentifier || '';
    if (key === 'ArrowDown' || key === 'Down') {
      ev.preventDefault();
      if (!this.ownerSuggest.length) return;
      this.ownerIndex = Math.min((this.ownerIndex < 0 ? 0 : this.ownerIndex + 1), this.ownerSuggest.length - 1);
      setTimeout(() => {
        const el = document.getElementById('owner-sg-' + this.ownerIndex) as HTMLElement | null;
        el?.scrollIntoView({ block: 'nearest' });
        el?.focus?.();
      }, 0);
    } else if (key === 'ArrowUp' || key === 'Up') {
      ev.preventDefault();
      if (!this.ownerSuggest.length) {
        this.ownerInputRef?.nativeElement?.focus();
        return;
      }
      if (this.ownerIndex <= 0) {
        this.ownerIndex = -1;
        this.ownerInputRef?.nativeElement?.focus();
        return;
      }
      this.ownerIndex = Math.max(this.ownerIndex - 1, 0);
      setTimeout(() => {
        const el = document.getElementById('owner-sg-' + this.ownerIndex) as HTMLElement | null;
        el?.scrollIntoView({ block: 'nearest' });
        el?.focus?.();
      }, 0);
    } else if (key === 'Enter') {
      ev.preventDefault();
      if (this.ownerSuggest.length) {
        const pick = this.ownerSuggest[this.ownerIndex] || this.ownerSuggest[0];
        if (pick) this.chooseOwner(sel, pick);
      } else {
        this.ownerTyping = '';
      }
      this.ownerSuggest = [];
      this.ownerIndex = -1;
    } else if (key === 'Escape' || key === 'Esc') {
      ev.preventDefault();
      this.ownerTyping = '';
      this.ownerSuggest = [];
      this.ownerIndex = -1;
    }
  }

  onOwnerItemKeydown(ev: KeyboardEvent, sel: any, index: number) {
    const key = ev.key || (ev as any).keyIdentifier || '';
    if (key === 'Enter') {
      ev.preventDefault();
      const pick = this.ownerSuggest[index];
      if (pick) this.chooseOwner(sel, pick);
    } else if (key === 'ArrowDown' || key === 'Down') {
      ev.preventDefault();
      const next = Math.min(index + 1, this.ownerSuggest.length - 1);
      this.ownerIndex = next;
      setTimeout(() => (document.getElementById('owner-sg-' + next) as HTMLElement | null)?.focus?.(), 0);
    } else if (key === 'ArrowUp' || key === 'Up') {
      ev.preventDefault();
      const prev = index - 1;
      if (prev < 0) {
        this.ownerIndex = -1;
        this.ownerInputRef?.nativeElement?.focus();
        return;
      }
      this.ownerIndex = prev;
      setTimeout(() => (document.getElementById('owner-sg-' + prev) as HTMLElement | null)?.focus?.(), 0);
    }
  }

  // === Open item ===
  async open(it: RmdFormItem) {
    // Ensure features is always an object
    (it as any).features = normalizeRecordFeatures((it as any).features || {});
    this.selected.set(it);
    await this.pdfService.refreshPdfList(it.id);
    this.updateLinkedForSelected();
    
    if (it.id === 'BF-RM-PM-IR-07') {
      try {
        const today = new Date().toISOString().slice(0, 10);
        setTimeout(async () => {
          await this.setDate(today);
          await this.thService.loadWeeks(it.id);
        }, 0);
      } catch {}
    }
    this.persistUiState();
  }

  // === Use Departments helper ===
  onToggleUseDept(sel: any, dept: string, checked: boolean){
    try{
      const current = Array.isArray(sel.useDepartments) ? [...sel.useDepartments] : [];
      const idx = current.indexOf(dept);
      if (checked){ if (idx < 0) current.push(dept); }
      else { if (idx >= 0) current.splice(idx, 1); }
      sel.useDepartments = current;
      this.metadataService.persistMeta(sel);
    }catch{}
  }

  // === Owner Departments helper (담당부서 다중 선택 칩)
  onToggleOwnerDept(sel: any, dept: string, checked: boolean){
    try{
      const current = Array.isArray(sel.ownerDepartments) ? [...sel.ownerDepartments] : [];
      const idx = current.indexOf(dept);
      if (checked){ if (idx < 0) current.push(dept); }
      else { if (idx >= 0) current.splice(idx, 1); }
      sel.ownerDepartments = current;
      // department 필드는 첫 칩을 대표값으로 유지(기존 화면 호환)
      sel.department = (sel.ownerDepartments[0] || sel.department || null);
      this.metadataService.persistMeta(sel);
    }catch{}
  }
  removeOwnerDeptChip(sel: any, dept: string){
    this.onToggleOwnerDept(sel, dept, false);
  }
  removeUseDeptChip(sel: any, dept: string){
    this.onToggleUseDept(sel, dept, false);
  }

  // === Audit connections ===
  private async preloadCompanies() {
    try {
      this.auditCompanies = (await this.supabase.listAuditCompanies())
        .map((r: any) => r.name)
        .filter(Boolean);
    } catch {}
  }

  private async buildAuditLinkMap() {
    try {
      const prog = await this.supabase.listAllGivaudanProgress();
      const map: Record<string, Array<{ number: number; company?: string | null }>> = {};
      const rows = (prog as any)?.data || [];
      
      for (const row of rows) {
        const num = row?.number as number;
        const company = (row?.company ?? null) as string | null;
        const comments = Array.isArray(row?.comments) ? row.comments : [];
        const fb = comments.find((c: any) => c && c.type === 'fields');
        const links = Array.isArray(fb?.links) ? fb.links : [];
        
        for (const l of links) {
          const id = l?.id;
          const kind = l?.kind || 'record';
          if (!id || kind !== 'record') continue;
          if (!map[id]) map[id] = [];
          if (!map[id].some(x => x.number === num)) {
            map[id].push({ number: num, company });
          }
        }
      }
      
      this.recordToAuditMap = map;
      
      // Load titles
      try {
        const items = await this.supabase.listAuditItems();
        const tmap: Record<number, string> = {};
        for (const it of (items as any[] || [])) {
          tmap[(it as any).number] = (it as any).title_ko || (it as any).title_en || '';
        }
        this.auditTitleMap = tmap;
      } catch {}
      
      // Propagate company chips to list items
      try {
        for (const cat of this.categories) {
          for (const it of cat.items as any[]) {
            const recId = it.id;
            const arr = map[recId] || [];
            const comps = Array.from(new Set(arr.map(a => (a.company || '').toString().trim()).filter(Boolean)));
            (it as any).companies = comps;
          }
        }
      } catch {}
    } catch {}
    
    this.updateLinkedForSelected();
  }

  private updateLinkedForSelected() {
    const sel = this.selected();
    if (!sel) {
      this.linkedAuditItems.set([]);
      this.linkedCompanies.set([]);
      return;
    }
    
    const arr = this.recordToAuditMap[sel.id] || [];
    const items = arr.map(a => ({
      number: a.number,
      title: this.auditTitleMap[a.number] || '',
      company: a.company || undefined
    }));
    this.linkedAuditItems.set(items);
    
    const companies = Array.from(new Set(items.map(i => (i.company || '').toString().trim()).filter(Boolean)));
    this.linkedCompanies.set(companies);
    
    // Compute linked standards from localStorage
    try {
      const raw = localStorage.getItem('rmd_standard_links');
      const map = raw ? JSON.parse(raw) as Record<string, Array<{ id: string; title: string }>> : {};
      const hits: Array<{ id: string; title: string }> = [];
      
      for (const stdId of Object.keys(map || {})) {
        const list = map[stdId] || [];
        if (list.some(x => x && x.id === sel.id)) {
          hits.push({ id: stdId, title: this.stdTitleById[stdId] || stdId });
        }
      }
      this.linkedStandards.set(hits);
    } catch {
      this.linkedStandards.set([]);
    }
  }

  openAuditItemTab(num: number, title?: string) {
    try {
      try {
        sessionStorage.setItem('audit.eval.forceOpen', String(num));
        if (title) sessionStorage.setItem('audit.eval.forceOpenTitle', String(title));
      } catch {}
      const url = `/app/audit/givaudan?open=${encodeURIComponent(String(num))}`;
      this.tabs.requestOpen('Audit 평가 항목', 'audit:givaudan', url);
    } catch {}
  }

  // Delete record
  async deleteRecord(sel: any) {
    if (!sel) return;
    
    const confirmMsg = `정말로 "${sel.title}" 기록을 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`;
    if (!confirm(confirmMsg)) return;
    
    try {
      this.metadataService.setDeletingMeta(true);
      
      // Delete from database
      await this.supabase.deleteFormMeta(sel.id);
      
      // Remove from local categories
      for (const cat of this.categories) {
        const idx = cat.items.findIndex(item => item.id === sel.id);
        if (idx !== -1) {
          cat.items.splice(idx, 1);
          break;
        }
      }
      
      // Remove any locally persisted metadata for this record
      try { this.metadataService.removePersistedMeta(sel.id); } catch {}

      // Force-refresh the left list by updating categories signal with new references
      try {
        // Also remove empty categories to keep UI tidy
        const refreshed = this.categories
          .map(c => ({ category: c.category, items: [...c.items] } as any))
          .filter(c => c.items.length > 0);
        this.categories = refreshed as any;
        this.filterService.setCategories(refreshed);
      } catch {}

      // Clear selection
      this.selected.set(null);
      
      // Update filter
      this.filterService.onFiltersChanged();
      
      alert('기록이 삭제되었습니다.');
    } catch (error) {
      console.error('Failed to delete record:', error);
      alert('기록 삭제에 실패했습니다.');
    } finally {
      this.metadataService.setDeletingMeta(false);
    }
  }

  // Handle features change with proper persistence
  async onFeaturesChange(sel: any, features: any) {
    // Ensure features is always an object
    sel.features = features || {};
    
    // Persist to localStorage immediately
    this.metadataService.persistMeta(sel);
    
    // Auto-save to DB immediately when checkbox changes
    try {
      await this.metadataService.saveMeta(sel);
      console.log('Features saved to DB:', sel.id, features);
    } catch (error) {
      console.error('Failed to save features:', error);
    }
  }

  openStandardTab(stdId: string) {
    try {
      this.persistUiState();
      const url = `/app/standard/rmd?open=${encodeURIComponent(stdId)}`;
      this.tabs.requestOpen('원료제조팀 규정', '/app/standard/rmd', url);
    } catch {}
  }
  
  // Standard search modal methods
  openStandardSearchModal() {
    this.showStandardSearchModal.set(true);
    this.standardSearchQuery.set('');
    this.standardSearchFilter.set('');  // 필터도 초기화
    this.selectedStandardIndex = -1;
    
    // Focus search input after modal opens
    setTimeout(() => {
      this.searchInputRef?.nativeElement?.focus();
    }, 100);
  }
  
  closeStandardSearchModal() {
    this.showStandardSearchModal.set(false);
    this.standardSearchQuery.set('');
    this.standardSearchFilter.set('');  // 필터도 초기화
    this.selectedStandardIndex = -1;
  }
  
  onStandardSearchKeydown(event: KeyboardEvent) {
    const filtered = this.filteredStandards;
    
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.selectedStandardIndex = Math.min(this.selectedStandardIndex + 1, filtered.length - 1);
      this.scrollToSelected();
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (this.selectedStandardIndex > -1) {
        this.selectedStandardIndex--;
      }
      this.scrollToSelected();
    } else if (event.key === 'Enter') {
      event.preventDefault();
      // 선택된 항목이 있으면 연결, 없으면 검색 실행
      if (this.selectedStandardIndex >= 0 && this.selectedStandardIndex < filtered.length) {
        this.linkStandard(filtered[this.selectedStandardIndex]);
      } else {
        // 검색 실행
        this.standardSearchFilter.set(this.standardSearchQuery());
        this.selectedStandardIndex = -1;
      }
    } else if (event.key === 'Escape') {
      event.preventDefault();
      this.closeStandardSearchModal();
    }
  }
  
  private scrollToSelected() {
    setTimeout(() => {
      const container = document.querySelector('.standards-list');
      const selected = container?.querySelectorAll('.standard-item')[this.selectedStandardIndex] as HTMLElement;
      
      if (selected && container) {
        const containerRect = container.getBoundingClientRect();
        const selectedRect = selected.getBoundingClientRect();
        
        if (selectedRect.bottom > containerRect.bottom) {
          container.scrollTop += selectedRect.bottom - containerRect.bottom + 10;
        } else if (selectedRect.top < containerRect.top) {
          container.scrollTop -= containerRect.top - selectedRect.top + 10;
        }
      }
    }, 0);
  }
  
  get filteredStandards() {
    const query = this.standardSearchFilter().toLowerCase();
    if (!query) return this.allStandards;
    
    return this.allStandards.filter(std => 
      std.id.toLowerCase().includes(query) || 
      std.title.toLowerCase().includes(query) ||
      std.category.toLowerCase().includes(query)
    );
  }
  
  linkStandard(std: { id: string; title: string }) {
    const selected = this.selected();
    if (!selected) return;
    
    try {
      // Load existing links from localStorage
      const raw = localStorage.getItem('rmd_standard_links');
      const map = raw ? JSON.parse(raw) as Record<string, Array<{ id: string; title: string }>> : {};
      
      // Add the selected item to this standard's list
      if (!map[std.id]) {
        map[std.id] = [];
      }
      
      // Check if already linked
      if (!map[std.id].some(x => x.id === selected.id)) {
        map[std.id].push({
          id: selected.id,
          title: selected.title
        });
        
        // Save back to localStorage
        localStorage.setItem('rmd_standard_links', JSON.stringify(map));
        
        // Update the display
        this.updateLinkedForSelected();
        
        // Show success message
        alert(`${std.title} 규정이 연결되었습니다.`);
    } else {
        alert('이미 연결된 규정입니다.');
      }
    } catch (e) {
      console.error('Failed to link standard:', e);
      alert('규정 연결에 실패했습니다.');
    }
    
    this.closeStandardSearchModal();
  }
  
  unlinkStandard(stdId: string) {
    const selected = this.selected();
    if (!selected) return;
    
    if (!confirm('이 규정 연결을 해제하시겠습니까?')) return;
    
    try {
      const raw = localStorage.getItem('rmd_standard_links');
      const map = raw ? JSON.parse(raw) as Record<string, Array<{ id: string; title: string }>> : {};
      
      if (map[stdId]) {
        map[stdId] = map[stdId].filter(x => x.id !== selected.id);
        if (map[stdId].length === 0) {
          delete map[stdId];
        }
        
        localStorage.setItem('rmd_standard_links', JSON.stringify(map));
        this.updateLinkedForSelected();
      }
    } catch (e) {
      console.error('Failed to unlink standard:', e);
    }
  }

  // === Initial data loading ===
  private async loadInitialData() {
    queueMicrotask(async () => {
      // Load departments for dropdowns
      try { this.departments = await this.supabase.listDepartments(); } catch { this.departments = []; }

      await this.metadataService.loadMetadata(this.categories);
      
      // Load user list for typeahead
      try {
        const { data: users } = await this.supabase.getClient().from('users').select('name,email');
        this.userPairs = (users || []).map((u: any) => ({ name: u?.name || '', email: u?.email || '' }));
        this.users = this.userPairs.map(p => p.name || p.email).filter(Boolean);
      } catch {}
      
      // Restore UI state
      let restored = false;
      try {
        const params = new URLSearchParams(location.search);
        const openId = params.get('open');
        if (openId) {
          const target = this.filterService.filteredFlat().find(r => r.id === openId);
          if (target) {
            this.open(target);
            restored = true;
          }
        }
      } catch {}
      
      if (!restored) {
        this.restoreUiState();
      }
    });
  }

  // === UI state persistence ===
  private persistUiState() {
    this.metadataService.persistUiState(
      this.selected(),
      this.centerPane?.nativeElement?.scrollTop || 0,
      this.rightPane?.nativeElement?.scrollTop || 0
    );
  }

  private restoreUiState() {
    try {
      const state = this.metadataService.restoreUiState();
      if (!state) return;
      
      if (state.selectedId) {
        const target = this.filterService.filteredFlat().find(r => r.id === state.selectedId);
        if (target) {
          this.selected.set(target);
          this.updateLinkedForSelected();
          this.pdfService.refreshPdfList(target.id);
        }
      }
      
      setTimeout(() => {
        this.centerPane?.nativeElement?.scrollTo({ top: Number(state.centerScroll || 0), behavior: 'auto' });
      }, 30);
      setTimeout(() => {
        this.rightPane?.nativeElement?.scrollTo({ top: Number(state.rightScroll || 0), behavior: 'auto' });
      }, 30);
    } catch {}
  }

  // === PDF handling ===
  async onPdfPick(ev: Event) {
    const input = ev.target as HTMLInputElement;
    const file = input?.files?.[0];
    if (!file || !this.selected()) return;
    
    await this.pdfService.handlePdfPick(file, this.selected()!.id);
    input.value = ''; // Allow re-selection of same file
  }

  // === Temperature/Humidity Record ===
  async setDate(v: string) {
    if (!v || !this.pdfCanvasRef || !this.drawCanvasRef || !this.containerRef) return;
    await this.thService.setDate(
      v,
      this.pdfCanvasRef.nativeElement,
      this.drawCanvasRef.nativeElement,
      this.containerRef.nativeElement
    );
  }

  async nudgeDate(delta: number, unit: 'day' | 'week' | 'month') {
    if (!this.pdfCanvasRef || !this.drawCanvasRef || !this.containerRef) return;
    await this.thService.nudgeDate(
      delta,
      unit,
      this.pdfCanvasRef.nativeElement,
      this.drawCanvasRef.nativeElement,
      this.containerRef.nativeElement
    );
  }

  setGranularity(val: 'day' | 'week' | 'month') {
    if (!this.pdfCanvasRef || !this.drawCanvasRef || !this.containerRef) return;
    this.thService.setGranularity(
      val,
      this.pdfCanvasRef.nativeElement,
      this.drawCanvasRef.nativeElement,
      this.containerRef.nativeElement
    );
  }

  clearToday() {
    if (!this.drawCanvasRef) return;
    this.thService.clearToday(this.drawCanvasRef.nativeElement);
  }

  async saveRecord() {
    if (!this.selected() || !this.pdfCanvasRef || !this.drawCanvasRef) return;
    await this.thService.saveRecord(
      this.selected()!.id,
      this.pdfCanvasRef.nativeElement,
      this.drawCanvasRef.nativeElement
    );
  }

  async loadRecord() {
    if (!this.selected()) return;
    await this.thService.loadRecord(this.selected()!.id);
  }

  printRecord() {
    if (!this.pdfCanvasRef || !this.drawCanvasRef) return;
    this.thService.printRecord(
      this.pdfCanvasRef.nativeElement,
      this.drawCanvasRef.nativeElement
    );
  }

  toggleFullscreen() {
    this.thService.toggleFullscreen(this.containerRef?.nativeElement);
  }

  onPointerDown(ev: PointerEvent) {
    if (!this.drawCanvasRef) return;
    this.thService.onPointerDown(ev, this.drawCanvasRef.nativeElement);
  }

  onPointerMove(ev: PointerEvent) {
    if (!this.drawCanvasRef) return;
    this.thService.onPointerMove(ev, this.drawCanvasRef.nativeElement);
  }

  onPointerUp() {
    this.thService.onPointerUp();
  }

  private async renderPdf() {
    if (!this.pdfCanvasRef || !this.drawCanvasRef || !this.containerRef) return;
    await this.thService.renderPdf(
      this.pdfCanvasRef.nativeElement,
      this.drawCanvasRef.nativeElement,
      this.containerRef.nativeElement
    );
  }
}
