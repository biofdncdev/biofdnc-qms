import { Component, computed, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RMD_STANDARDS, RegulationItem, RegulationCategory } from './rmd-standards';
import { RMD_FORM_CATEGORIES, RmdFormItem } from '../../record/rmd-forms/rmd-forms-data';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { TabService } from '../../services/tab.service';

interface SearchDoc { id: string; title: string; content: string; }

@Component({
  standalone: true,
  selector: 'app-rmd-page',
  imports: [CommonModule, HttpClientModule, FormsModule],
  styleUrls: ['./rmd-page.component.scss'],
  templateUrl: './rmd-page.component.html',
})
export class RmdPageComponent {
  private http = inject(HttpClient);
  private sanitizer = inject(DomSanitizer);
  private tabs = inject(TabService);

  categories: RegulationCategory[] = RMD_STANDARDS;

  selected = signal<RegulationItem | null>(null);
  docUrl = signal<SafeResourceUrl | null>(null);
  query = signal<string>('');
  // 입력 중 임시 버퍼(엔터 눌러 확정 시에만 검색 적용)
  queryDraft = signal<string>('');
  loading = signal<boolean>(false);
  // keyboard focus index for left list (category or search results)
  focusIndex = signal<number>(-1);
  // whether keyboard navigation mode is on (disables hover highlight)
  kbdMode = signal<boolean>(false);

  // search state
  indexReady = signal<boolean>(false);
  searching = signal<boolean>(false);
  term = signal<string>('');
  results = signal<RegulationItem[]>([]);
  private docs: SearchDoc[] = [];
  private static cachedDocs: SearchDoc[] | null = null;  // Static cache for search index
  private static indexBuilding = false;  // Prevent multiple builds

  // highlight nav state
  matchTotal = signal<number>(0);
  matchIndex = signal<number>(0);
  highlightPending = signal<boolean>(false);

  // ===== Linked Records (per standard) =====
  linkQuery = signal<string>('');
  linkSuggest: Array<{ id: string; title: string }> = [];
  linkedRecords = signal<Array<{ id: string; title: string }>>([]);
  private recordPool: Array<{ id: string; title: string }> = [];
  private linksMap: Record<string, Array<{ id: string; title: string }>> = {};
  // popup state
  recPickerOpen = signal<boolean>(false);
  recQuery = signal<string>('');
  recIndex = signal<number>(-1);
  // collapse state for chips row (default: expanded)
  linkedExpanded = signal<boolean>(true);

  // Toolbar dropdown states
  addMenuOpen = signal<boolean>(false);
  linksMenuOpen = signal<boolean>(false);
  tQuery = signal<string>('');
  tIndex = signal<number>(-1);
  private addCloseTimer: any = null;
  private linksCloseTimer: any = null;

  openLinkedRecord(id: string){
    try{
      // persist current UI state (including scroll) before navigating away
      this.persistUiState();
      const url = `/app/record/rmd-forms?open=${encodeURIComponent(id)}`;
      this.tabs.requestOpen('원료제조팀 기록', 'record:rmd-forms', url);
    }catch{}
  }

  // 3) 키보드로 검색 결과 항목 이동 및 선택
  public onSearchKeydown(ev: KeyboardEvent){
    const key = ev.key;
    if (key === 'ArrowDown'){
      // Move focus into the list (search results if searching, else category list)
      ev.preventDefault();
      ev.stopPropagation(); // avoid double-handling with global keydown
      this.kbdMode.set(true);
      if (this.focusIndex() < 0){
        // When searching, first ArrowDown should select the first result
        if (!this.searching()){
          const start = this.selected() ? this.getVisibleIndex(this.selected() as any) : 0;
          this.focusIndex.set(Math.max(0, start));
        }
      }
      this.moveListFocus('down');
      return;
    }
    if (key === 'ArrowUp'){
      ev.preventDefault();
      ev.stopPropagation(); // avoid double-handling with global keydown
      this.kbdMode.set(true);
      if (this.focusIndex() < 0){
        if (!this.searching()){
          const start = this.selected() ? this.getVisibleIndex(this.selected() as any) : 0;
          this.focusIndex.set(Math.max(0, start));
        }
      }
      this.moveListFocus('up');
      return;
    }
    if (key === 'Enter'){
      ev.preventDefault();
      ev.stopPropagation(); // avoid double-handling with global keydown
      this.kbdMode.set(true);
      this.activateFocusedItem();
      return;
    }
  }

  // Compute a flat list of items currently shown on the left, in DOM order
  private getVisibleItems(): RegulationItem[] {
    if (this.searching()) return this.results();
    const items: RegulationItem[] = [] as any;
    for (const cat of this.filtered()) items.push(...cat.items);
    return items;
  }

  private scrollLeftListTo(index: number, center: boolean = false){
    setTimeout(()=>{
      const container = document.querySelector('aside.left') as HTMLElement | null;
      if (!container) return;
      const nodes = Array.from(container.querySelectorAll('.item')) as HTMLElement[];
      const el = nodes[index]; if (!el) return;
      const sticky = container.querySelector('.sticky') as HTMLElement | null;
      const headerH = sticky ? sticky.getBoundingClientRect().height : 0;

      const itemTop = el.offsetTop; // relative to container
      const itemBottom = itemTop + el.offsetHeight;
      const visibleTop = container.scrollTop + headerH;
      const visibleBottom = container.scrollTop + container.clientHeight;

      if (center){
        const targetTop = Math.max(0, itemTop - Math.max(0, (container.clientHeight - headerH - el.offsetHeight) / 2));
        container.scrollTo({ top: targetTop, behavior: 'auto' });
        return;
      }

      if (itemTop < visibleTop){
        container.scrollTo({ top: Math.max(0, itemTop - headerH - 6), behavior: 'auto' });
      } else if (itemBottom > visibleBottom){
        const delta = itemBottom - container.clientHeight + 6;
        const target = Math.min(container.scrollHeight - container.clientHeight, delta);
        container.scrollTo({ top: target, behavior: 'auto' });
      }
    }, 0);
  }

  public moveListFocus(dir: 'up'|'down'){
    const list = this.getVisibleItems(); if (!list.length) return;
    let i = this.focusIndex(); if (i < 0) i = 0;
    i = dir==='down' ? Math.min(list.length-1, i+1) : Math.max(0, i-1);
    this.focusIndex.set(i);
    this.scrollLeftListTo(i);
  }

  public activateFocusedItem(){
    const list = this.getVisibleItems(); if (!list.length) return;
    let i = this.focusIndex();
    if (i < 0){
      // If searching and no focus yet, pick first result
      if (this.searching() && list.length){ i = 0; }
      else i = 0;
    }
    const it = list[i]; if (!it) return;
    if (this.searching()) this.openResult(it); else this.select(it);
  }

  public getVisibleIndex(it: RegulationItem): number {
    const list = this.getVisibleItems();
    const idx = list.findIndex(x => x.id === it.id);
    return idx;
  }

  public setFocusToItem(it: RegulationItem){
    if (this.kbdMode()) return; // ignore hover while keyboard mode active
    const idx = this.getVisibleIndex(it);
    if (idx >= 0) this.focusIndex.set(idx);
  }

  // Global key navigation outside search as well
  private onGlobalKeydown = (ev: KeyboardEvent) => {
    const key = ev.key;
    if (key !== 'ArrowUp' && key !== 'ArrowDown' && key !== 'Enter') return;
    const ae = document.activeElement as HTMLElement | null;
    const tag = (ae?.tagName || '').toLowerCase();
    const isInput = tag === 'input' || tag === 'textarea';
    const isSearch = (ae as HTMLInputElement | null)?.type === 'search';
    if (isInput && !isSearch) return;
    if (key === 'ArrowDown' || key === 'ArrowUp'){
      this.kbdMode.set(true);
      if (this.focusIndex() < 0){
        const start = this.selected() ? this.getVisibleIndex(this.selected() as any) : 0;
        this.focusIndex.set(Math.max(0, start));
      }
      this.moveListFocus(key === 'ArrowDown' ? 'down' : 'up');
      ev.preventDefault(); // prevent native scroll
      return;
    }
    if (key === 'Enter' && this.kbdMode()){
      this.activateFocusedItem();
      ev.preventDefault();
    }
  };

  // Mouse moves over left list → exit keyboard mode
  public onLeftMouseMove(){ this.kbdMode.set(false); this.focusIndex.set(-1); }

  // Click on item with mouse enables keyboard mode starting from that item
  public onItemClick(it: RegulationItem){
    this.select(it);
    this.kbdMode.set(true);
    const idx = this.getVisibleIndex(it); if (idx >= 0) this.focusIndex.set(idx);
  }

  public onResultClick(it: RegulationItem){
    this.openResult(it);
    this.kbdMode.set(true);
    const idx = this.getVisibleIndex(it); if (idx >= 0) this.focusIndex.set(idx);
  }

  onMenuEnter(which: 'add'|'links'){
    if (which==='add'){ clearTimeout(this.addCloseTimer); this.addMenuOpen.set(true); }
    else { clearTimeout(this.linksCloseTimer); this.linksMenuOpen.set(true); }
  }
  onMenuLeave(which: 'add'|'links'){
    const closer = () => { if (which==='add') this.addMenuOpen.set(false); else this.linksMenuOpen.set(false); };
    const t = setTimeout(closer, 120);
    if (which==='add') this.addCloseTimer = t; else this.linksCloseTimer = t;
  }

  toggleMenu(which: 'add'|'links'){
    if (which==='add'){
      this.addMenuOpen.set(!this.addMenuOpen());
      if (this.addMenuOpen()){
        this.linksMenuOpen.set(false);
        setTimeout(()=>{
          document.addEventListener('click', this.closeMenusOnOutside, { once: true });
          try{
            const frame = document.querySelector('iframe') as HTMLIFrameElement | null;
            const fd = frame?.contentWindow?.document; fd?.addEventListener('click', this.closeMenusOnOutside, { once: true });
          }catch{}
          // focus the toolbar search input if available
          try{
            const inp = document.querySelector('.toolbar-dropdown .menu input') as HTMLInputElement | null;
            inp?.focus(); this.recIndex.set(-1);
          }catch{}
        }, 0);
      }
    }else{
      this.linksMenuOpen.set(!this.linksMenuOpen());
      if (this.linksMenuOpen()){
        this.addMenuOpen.set(false);
        setTimeout(()=>{
          document.addEventListener('click', this.closeMenusOnOutside, { once: true });
          try{
            const frame = document.querySelector('iframe') as HTMLIFrameElement | null;
            const fd = frame?.contentWindow?.document; fd?.addEventListener('click', this.closeMenusOnOutside, { once: true });
          }catch{}
        }, 0);
      }
    }
  }
  private closeMenusOnOutside = (ev?: MouseEvent) => {
    // if click originated inside the dropdown, ignore (we already stopPropagation on menu wrappers)
    this.addMenuOpen.set(false);
    this.linksMenuOpen.set(false);
  };

  filtered = computed(() => {
    const q = this.query().trim().toLowerCase();
    if (!q) return this.categories;
    return this.categories.map(cat => ({
      ...cat,
      items: cat.items.filter(i => i.id.toLowerCase().includes(q) || i.title.toLowerCase().includes(q))
    })).filter(cat => cat.items.length > 0);
  });

  @ViewChild('rightPane', { static: false }) rightPane?: ElementRef<HTMLElement>;
  @ViewChild('contentPane', { static: false }) contentPane?: ElementRef<HTMLElement>;

  constructor(){
    // Only build index if not already cached
    if (RmdPageComponent.cachedDocs) {
      this.docs = RmdPageComponent.cachedDocs;
      this.indexReady.set(true);
    } else {
      this.buildIndex();
    }
    
    window.addEventListener('message', (e: MessageEvent) => this.onFrameMessage(e));
    // Build record pool for linker search
    this.recordPool = RMD_FORM_CATEGORIES.flatMap((c:any)=> (c.items||[]).map((it:RmdFormItem)=> ({ id: it.id, title: it.title })));
    // Load saved map
    try{
      const raw = localStorage.getItem('rmd_standard_links');
      if (raw) this.linksMap = JSON.parse(raw) || {};
    }catch{}
    // remove eager restore; will restore after view is ready
    // Global keyboard handler to prevent default scrolling and move list focus
    document.addEventListener('keydown', this.onGlobalKeydown, { passive: false });
  }

  private async loadDoc(id: string): Promise<string | null> {
    const primary = `/rmd/${id}.html`;
    try {
      const html = await this.http.get(primary, { responseType: 'text' }).toPromise();
      if (this.isValidDoc(html as string)) return this.normalizeDocNumbers(html as string, id);
    } catch {}
    return null;
  }

  private isValidDoc(html: string): boolean {
    if (!html) return false;
    const text = String(html).toLowerCase();
    if (text.includes('class="doc"') || text.includes('<div class="doc"')) return true;
    if (text.includes('<app-root')) return false;
    return false;
  }

  private normalizeDocNumbers(html: string, id: string): string {
    try{
      // Replace legacy prefixes in displayed document numbers
      const re1 = /문서번호\s*:\s*BF-RM-([A-Z]{2}-\d+)/g;
      const re2 = /문서번호\s*:\s*BF-RMD-([A-Z]{2}-\d+)/g;
      return String(html).replace(re1, '문서번호: BF-$1').replace(re2, '문서번호: BF-$1');
    }catch{ return html; }
  }

  async buildIndex(){
    // Prevent multiple simultaneous builds
    if (RmdPageComponent.indexBuilding) return;
    
    // Check again if cached while waiting
    if (RmdPageComponent.cachedDocs) {
      this.docs = RmdPageComponent.cachedDocs;
      this.indexReady.set(true);
      return;
    }
    
    RmdPageComponent.indexBuilding = true;
    
    // Load all docs content once; disable search until ready
    try {
      const items: RegulationItem[] = this.categories.flatMap((c: RegulationCategory) => c.items);
      for (const it of items){
        try{
          const html = await this.loadDoc(it.id);
          if (!html) continue;
          const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g,' ').trim();
          this.docs.push({ id: it.id, title: it.title, content: text.toLowerCase() });
        }catch{}
      }
      
      // Cache the built index
      RmdPageComponent.cachedDocs = this.docs;
      this.indexReady.set(true);
      
      setTimeout(() => {
        const el = document.querySelector('input[type=search]') as HTMLInputElement | null;
        if (el) el.focus();
      }, 0);
    } catch { 
      this.indexReady.set(true); 
    } finally {
      RmdPageComponent.indexBuilding = false;
    }
  }

  private persistUiState(){
    try{
      const prevRaw = localStorage.getItem('rmd_page_state');
      const prev = prevRaw ? JSON.parse(prevRaw) : {};
      const s = {
        selectedId: this.selected()?.id || null,
        rightScroll: this.contentPane?.nativeElement?.scrollTop || 0,
        leftScroll: document.querySelector('aside.left')?.scrollTop || 0,
        expanded: this.linkedExpanded(),
        iframeTop: typeof prev?.iframeTop === 'number' ? prev.iframeTop : 0,
        // Persist search state
        searchQuery: this.query(),
        searchDraft: this.queryDraft(),
        searchTerm: this.term(),
        searching: this.searching(),
        searchResults: this.searching() ? this.results().map(r => ({ id: r.id, title: r.title })) : []
      } as any;
      localStorage.setItem('rmd_page_state', JSON.stringify(s));
    }catch{}
  }
  private restoreUiState(){
    try{
      const raw = localStorage.getItem('rmd_page_state');
      if(!raw) return;
      const s = JSON.parse(raw);
      
      // Restore search state first
      if (s?.searchQuery !== undefined) {
        this.query.set(s.searchQuery);
        this.queryDraft.set(s.searchDraft || s.searchQuery);
      }
      if (s?.searchTerm) {
        this.term.set(s.searchTerm);
      }
      if (s?.searching && s?.searchResults) {
        this.searching.set(true);
        // Reconstruct full RegulationItem objects from saved results
        const fullResults = s.searchResults.map((saved: any) => {
          for (const cat of this.categories) {
            const found = cat.items.find(it => it.id === saved.id);
            if (found) return found;
          }
          return null;
        }).filter((it: any) => it !== null);
        this.results.set(fullResults);
      }
      
      // Then restore selected item (but do not override an explicit pending open)
      if(s?.selectedId && !(this as any)._pendingOpenId){
        // find and select target doc without resetting scroll
        for(const cat of this.categories){
          const it = cat.items.find((i:any)=> i.id === s.selectedId);
          if(it){ this.select(it, { resetScroll: false }); break; }
        }
      }
      
      if(typeof s?.expanded === 'boolean') this.linkedExpanded.set(!!s.expanded);
      
      // Restore scroll positions
      setTimeout(()=>{ 
        this.contentPane?.nativeElement?.scrollTo({ top: Number(s?.rightScroll||0), behavior:'auto' });
        const leftPane = document.querySelector('aside.left') as HTMLElement;
        if (leftPane && s?.leftScroll) {
          leftPane.scrollTo({ top: Number(s.leftScroll), behavior: 'auto' });
        }
      }, 50);
      
      // also try to push iframe saved scroll once after restore
      setTimeout(()=> this.applySavedIframeScroll(), 120);
    }catch{}
  }

  private applySavedIframeScroll(){
    try{
      const frame = document.querySelector('iframe') as HTMLIFrameElement | null;
      if(!frame?.contentWindow) return;
      const raw = localStorage.getItem('rmd_page_state');
      if(!raw) return;
      const s = JSON.parse(raw);
      if(s?.selectedId && s.selectedId === this.selected()?.id){
        frame.contentWindow.postMessage({ type:'setScroll', top: Number(s.iframeTop||0) }, '*');
      }
    }catch{}
  }

  ngAfterViewInit(){
    // track right pane scroll to persist state
    queueMicrotask(()=>{
      const el = this.contentPane?.nativeElement; if(!el) return;
      el.addEventListener('scroll', () => this.persistUiState(), { passive: true });
    });
    
    // Track left pane scroll to persist state
    queueMicrotask(()=>{
      const leftPane = document.querySelector('aside.left') as HTMLElement | null;
      if(leftPane){
        leftPane.addEventListener('scroll', () => this.persistUiState(), { passive: true });
      }
    });
    
    // Deep link: if ?open=ID or sessionStorage.standard.forceOpen exists, select that doc immediately
    setTimeout(()=>{
      try{
        const params = new URLSearchParams(location.search);
        const fromQuery = params.get('open');
        const fromSession = sessionStorage.getItem('standard.forceOpen');
        const target = (fromQuery || fromSession || '').trim();
        if (target){
          // mark as pending so state restoration won't override this explicit request
          (this as any)._pendingOpenId = target;
          for(const cat of this.categories){
            const it = cat.items.find((i:any)=> i.id === target);
            if (it){
              this.select(it, { resetScroll: false });
              // Focus the left list item and center it
              this.kbdMode.set(true);
              const idx = this.getVisibleIndex(it as any);
              if (idx >= 0){ this.focusIndex.set(idx); this.scrollLeftListTo(idx, true); }
              break;
            }
          }
        }
        sessionStorage.removeItem('standard.forceOpen');
      }catch{}
    }, 0);
    // also persist on visibility change (e.g., before switching tabs)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') this.persistUiState();
      if (document.visibilityState === 'visible') {
        // Restore state when tab becomes visible again
        setTimeout(()=> this.restoreUiState(), 50);
        setTimeout(()=> this.applySavedIframeScroll(), 100);
      }
    });
    window.addEventListener('focus', () => {
      setTimeout(()=> this.restoreUiState(), 50);
      setTimeout(()=> this.applySavedIframeScroll(), 100);
    });
    // restore after view exists
    setTimeout(()=> this.restoreUiState(), 0);
    setTimeout(()=> this.restoreUiState(), 200); // second pass to ensure after iframe/layout settles
  }

  ngOnDestroy(){
    try{ document.removeEventListener('keydown', this.onGlobalKeydown as any); }catch{}
  }
  chooseLink(r: { id: string; title: string }){
    const std = this.selected(); if(!std) return;
    const list = this.linksMap[std.id] || [];
    if (!list.some(x=>x.id===r.id)) list.push({ id:r.id, title:r.title });
    this.linksMap[std.id] = list;
    try{ localStorage.setItem('rmd_standard_links', JSON.stringify(this.linksMap)); }catch{}
    this.linkQuery.set('');
    this.linkSuggest = [];
    // reflect to UI with updated titles
    const arr = this.linksMap[std.id] || [];
    const updatedArr = arr.map(item => {
      const currentRecord = this.recordPool.find(rec => rec.id === item.id);
      return currentRecord ? { ...item, title: currentRecord.title } : item;
    });
    this.linkedRecords.set([ ...updatedArr ]);
    this.linkedExpanded.set(true);
  }
  removeLink(r: { id: string }){
    const std = this.selected(); if(!std) return;
    const list = (this.linksMap[std.id] || []).filter(x=>x.id!==r.id);
    this.linksMap[std.id] = list;
    try{ localStorage.setItem('rmd_standard_links', JSON.stringify(this.linksMap)); }catch{}
    const arr = this.linksMap[std.id] || [];
    const updatedArr = arr.map(item => {
      const currentRecord = this.recordPool.find(rec => rec.id === item.id);
      return currentRecord ? { ...item, title: currentRecord.title } : item;
    });
    this.linkedRecords.set([ ...updatedArr ]);
  }

  public runSearch(){
    const q = this.query().trim().toLowerCase();
    this.term.set(q);
    if (!q){ this.searching.set(false); this.results.set([]); return; }
    this.searching.set(true);
    // rank simple contains
    const filtered = this.docs
      .filter((d: SearchDoc) => d.title.toLowerCase().includes(q) || d.content.includes(q))
      .map((d: SearchDoc) => ({ id: d.id, title: this.findTitle(d.id) } as RegulationItem));
    this.results.set(filtered);
  }

  public clearSearch() {
    this.query.set('');
    this.queryDraft.set('');
    this.term.set('');
    this.searching.set(false);
    this.results.set([]);
    this.matchTotal.set(0);
    this.matchIndex.set(0);
    const frame = document.querySelector('iframe') as HTMLIFrameElement | null;
    if (frame?.contentWindow) frame.contentWindow.postMessage({ type:'highlight', term: '' }, '*');
  }

  // 엔터로 입력 확정 후 검색 실행
  public applySearch(){
    this.query.set(this.queryDraft().trim());
    this.runSearch();
  }

  public navigate(dir: 'prev'|'next'){
    const frame = document.querySelector('iframe') as HTMLIFrameElement | null;
    if (!frame?.contentWindow) return;
    frame.contentWindow.postMessage({ type:'nav', dir }, '*');
  }

  public openResult(it: RegulationItem){
    this.highlightPending.set(true);
    this.select(it);
  }

  public async select(item: RegulationItem, opts?: { resetScroll?: boolean }) {
    const resetScroll = opts?.resetScroll !== false; // default true
    this.term.set(this.term());
    this.matchIndex.set(0);
    this.matchTotal.set(0);
    this.selected.set(item);
    this.loading.set(true);
    try {
      const q = this.term();
      const viewer = `/rmd/view.html?id=${encodeURIComponent(item.id)}${q ? `&q=${encodeURIComponent(q)}` : ''}`;
      this.docUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(viewer));
      if (resetScroll) setTimeout(() => { this.contentPane?.nativeElement?.scrollTo({ top: 0, behavior: 'auto' }); }, 0);
      // proactively try to restore iframe scroll even if 'ready' races
      setTimeout(()=> this.applySavedIframeScroll(), 150);
      setTimeout(()=> this.applySavedIframeScroll(), 400);
    } finally {
      this.loading.set(false);
    }
    // Load linked records for this standard
    this.loadLinksPublic(item.id);
    // persist selected id
    this.persistUiState();
    // restore scroll position for this doc if state says so
    try{
      const raw = localStorage.getItem('rmd_page_state');
      if(raw){
        const s = JSON.parse(raw);
        if(s?.selectedId === item.id){
          setTimeout(()=>{ this.contentPane?.nativeElement?.scrollTo({ top: Number(s.rightScroll||0), behavior:'auto' }); }, 0);
        }
      }
    }catch{}
  }

  // expose small wrapper for template calls if needed
  private loadLinksPublic(stdId: string){
    const arr = this.linksMap[stdId] || [];
    // 최신 제목으로 업데이트
    const updatedArr = arr.map(item => {
      const currentRecord = this.recordPool.find(r => r.id === item.id);
      return currentRecord ? { ...item, title: currentRecord.title } : item;
    });
    this.linkedRecords.set([ ...updatedArr ]);
    this.linkedExpanded.set(true);
  }

  public setRecQuery(v: string){ this.recQuery.set(v); this.recIndex.set(-1); }
  public onRecKeydown(ev: KeyboardEvent){
    const list = this.recResults();
    if (ev.key==='ArrowDown'){ ev.preventDefault(); this.recIndex.set(Math.min((this.recIndex()<0?0:this.recIndex()+1), Math.max(0,list.length-1))); this.scrollRecToIndex(); }
    else if (ev.key==='ArrowUp'){ ev.preventDefault(); this.recIndex.set(Math.max(this.recIndex()-1, -1)); this.scrollRecToIndex(); }
    else if (ev.key==='Enter'){
      ev.preventDefault();
      const i = this.recIndex();
      if (i>=0 && list[i]){
        this.chooseLink(list[i]);
        // close toolbar dropdown if open
        if (this.addMenuOpen()) this.addMenuOpen.set(false);
        // close modal picker if open
        if (this.recPickerOpen()) this.closeRecordPicker();
        this.recIndex.set(-1);
      }
    }
    else if (ev.key==='Escape'){ ev.preventDefault(); this.closeRecordPicker(); }
  }
  public recResults(){
    const q = (this.recQuery()||'').trim().toLowerCase();
    const words = q.split(/\s+/).filter(Boolean);
    const selIds = new Set(this.linkedRecords().map(x=>x.id));
    const hay = (r: { id:string; title:string }) => `${r.id} ${r.title}`.toLowerCase();
    return this.recordPool
      .filter(r => !selIds.has(r.id))
      .filter(r => words.length ? words.every(w => hay(r).includes(w)) : true)
      .slice(0, 300);
  }

  public async print() {
    const sel = this.selected();
    if (!sel) return;
    
    try {
      // 문서 내용 가져오기 (폴백 포함)
      const getWithFallback = async (id: string) => {
        const res = await fetch(`/rmd/${id}.html`);
        if (res.ok) {
          const txt = await res.text();
          if (this.isValidDoc(txt)) return txt;
        }
        const makeAlts = (raw: string): string[] => {
          const alts: string[] = [];
          if (/^BF-RM-/.test(raw)) {
            const rest = raw.replace(/^BF-RM-/, '');
            alts.push(`BF-${rest}`);
            alts.push(`BF-RMD-${rest}`);
          } else if (/^BF-/.test(raw)) {
            const rest = raw.replace(/^BF-/, '');
            alts.push(`BF-RM-${rest}`);
            alts.push(`BF-RMD-${rest}`);
          }
          return alts;
        };
        for (const alt of makeAlts(id)){
          const r = await fetch(`/rmd/${alt}.html`);
          if (r.ok){ const t = await r.text(); if (this.isValidDoc(t)) return t; }
        }
        throw new Error('문서를 불러올 수 없습니다.');
      };

      const htmlContent = await getWithFallback(sel.id);
      
      // 출력용 iframe 생성
      const printFrame = document.createElement('iframe');
      printFrame.style.position = 'absolute';
      printFrame.style.width = '0';
      printFrame.style.height = '0';
      printFrame.style.border = 'none';
      printFrame.style.left = '-9999px';
      
      document.body.appendChild(printFrame);
      
      const printDoc = printFrame.contentDocument || printFrame.contentWindow?.document;
      if (!printDoc) {
        document.body.removeChild(printFrame);
        return;
      }
      
      // 출력용 HTML 작성
      printDoc.open();
      printDoc.write(`
        <!DOCTYPE html>
        <html lang="ko">
        <head>
          <meta charset="utf-8">
          <title>${sel.title}</title>
          <link rel="stylesheet" href="/rmd/rmd-doc.css">
          <style>
            @media print {
              body { margin: 20px; }
              h1 { font-size: 20px; margin-bottom: 20px; page-break-after: avoid; }
              table { page-break-inside: avoid; }
              tr { page-break-inside: avoid; }
            }
            h1 { font-size: 20px; margin: 0 0 20px 0; font-weight: bold; }
          </style>
        </head>
        <body>
          <h1>${sel.title}</h1>
          <div class="doc-container">
            ${htmlContent}
          </div>
        </body>
        </html>
      `);
      printDoc.close();
      
      // iframe 내용이 로드될 때까지 잠시 대기
      printFrame.onload = () => {
        setTimeout(() => {
          try {
            printFrame.contentWindow?.focus();
            printFrame.contentWindow?.print();
          } finally {
            // 출력 완료 후 iframe 제거
            setTimeout(() => {
              document.body.removeChild(printFrame);
            }, 1000);
          }
        }, 250);
      };
      
    } catch (error) {
      console.error('출력 중 오류가 발생했습니다:', error);
    }
  }

  private onFrameMessage(e: MessageEvent){
    const data = e.data || {};
    if (data.type === 'highlight:result'){
      this.matchTotal.set(data.total || 0);
      this.matchIndex.set(data.index || 0);
      this.highlightPending.set(false);
    } else if (data.type === 'ready'){
      if (this.term()){
        try{ this.postHighlight?.(); }catch{}
      }
      // when iframe signals ready, re-apply saved inner scroll
      this.applySavedIframeScroll();
    } else if (data.type === 'doc:scroll'){
      // persist iframe inner scroll top alongside pane scroll
      try{
        const raw = localStorage.getItem('rmd_page_state');
        const s = raw ? JSON.parse(raw) : {};
        s.selectedId = this.selected()?.id || null;
        s.rightScroll = this.contentPane?.nativeElement?.scrollTop || 0;
        s.expanded = this.linkedExpanded();
        s.iframeTop = Number(data.top||0);
        localStorage.setItem('rmd_page_state', JSON.stringify(s));
      }catch{}
    }
  }

  private findTitle(id: string){
    for (const c of this.categories){
      const f = c.items.find((i: RegulationItem) => i.id === id);
      if (f) return f.title;
    }
    return id;
  }

  private scrollRecToIndex(){
    setTimeout(()=>{
      const i = this.recIndex(); if (i<0) return;
      let listEl: HTMLElement | null = null;
      if (this.addMenuOpen()) listEl = document.querySelector('.toolbar-dropdown .menu .list') as HTMLElement;
      else if (this.recPickerOpen()) listEl = document.querySelector('.picker-list') as HTMLElement;
      if (!listEl) return;
      const items = listEl.querySelectorAll('.item, .picker-item');
      const el = items[i] as HTMLElement | undefined;
      el?.scrollIntoView({ block: 'nearest' });
    }, 0);
  }

  public closeRecordPicker(){ this.recPickerOpen.set(false); this.recQuery.set(''); this.recIndex.set(-1); }

  private postHighlight(){
    const frame = document.querySelector('iframe') as HTMLIFrameElement | null;
    if (!frame?.contentWindow) return;
    frame.contentWindow.postMessage({ type:'highlight', term: this.term() }, '*');
  }
}
