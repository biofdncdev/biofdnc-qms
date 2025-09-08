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
  loading = signal<boolean>(false);

  // search state
  indexReady = signal<boolean>(false);
  searching = signal<boolean>(false);
  term = signal<string>('');
  results = signal<RegulationItem[]>([]);
  private docs: SearchDoc[] = [];

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
    this.buildIndex();
    window.addEventListener('message', (e: MessageEvent) => this.onFrameMessage(e));
    // Build record pool for linker search
    this.recordPool = RMD_FORM_CATEGORIES.flatMap((c:any)=> (c.items||[]).map((it:RmdFormItem)=> ({ id: it.id, title: it.title })));
    // Load saved map
    try{
      const raw = localStorage.getItem('rmd_standard_links');
      if (raw) this.linksMap = JSON.parse(raw) || {};
    }catch{}
    // remove eager restore; will restore after view is ready
  }

  async buildIndex(){
    // Load all docs content once; disable search until ready
    try {
      const items: RegulationItem[] = this.categories.flatMap((c: RegulationCategory) => c.items);
      for (const it of items){
        try{
          const html = await this.http.get(`/rmd/${it.id}.html`, { responseType:'text' }).toPromise();
          if (!html) continue;
          const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g,' ').trim();
          this.docs.push({ id: it.id, title: it.title, content: text.toLowerCase() });
        }catch{}
      }
      this.indexReady.set(true);
      setTimeout(() => {
        const el = document.querySelector('input[type=search]') as HTMLInputElement | null;
        if (el) el.focus();
      }, 0);
    } catch { this.indexReady.set(true); }
  }

  private persistUiState(){
    try{
      if (!this.selected() || !this.contentPane?.nativeElement) return; // avoid clobbering saved state when nothing selected
      const prevRaw = localStorage.getItem('rmd_page_state');
      const prev = prevRaw ? JSON.parse(prevRaw) : {};
      const s = {
        selectedId: this.selected()?.id || null,
        rightScroll: this.contentPane?.nativeElement?.scrollTop || 0,
        expanded: this.linkedExpanded(),
        iframeTop: typeof prev?.iframeTop === 'number' ? prev.iframeTop : 0
      } as any;
      localStorage.setItem('rmd_page_state', JSON.stringify(s));
    }catch{}
  }
  private restoreUiState(){
    try{
      const raw = localStorage.getItem('rmd_page_state');
      if(!raw) return;
      const s = JSON.parse(raw);
      if(s?.selectedId){
        // find and select target doc without resetting scroll
        for(const cat of this.categories){
          const it = cat.items.find((i:any)=> i.id === s.selectedId);
          if(it){ this.select(it, { resetScroll: false }); break; }
        }
      }
      if(typeof s?.expanded === 'boolean') this.linkedExpanded.set(!!s.expanded);
      setTimeout(()=>{ this.contentPane?.nativeElement?.scrollTo({ top: Number(s?.rightScroll||0), behavior:'auto' }); }, 50);
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
    // Deep link: if ?open=ID or sessionStorage.standard.forceOpen exists, select that doc immediately
    setTimeout(()=>{
      try{
        const params = new URLSearchParams(location.search);
        const fromQuery = params.get('open');
        const fromSession = sessionStorage.getItem('standard.forceOpen');
        const target = (fromQuery || fromSession || '').trim();
        if (target){
          for(const cat of this.categories){
            const it = cat.items.find((i:any)=> i.id === target);
            if (it){ this.select(it, { resetScroll: false }); break; }
          }
        }
        sessionStorage.removeItem('standard.forceOpen');
      }catch{}
    }, 0);
    // also persist on visibility change (e.g., before switching tabs)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') this.persistUiState();
      if (document.visibilityState === 'visible') setTimeout(()=> this.applySavedIframeScroll(), 50);
    });
    window.addEventListener('focus', () => setTimeout(()=> this.applySavedIframeScroll(), 50));
    // restore after view exists
    setTimeout(()=> this.restoreUiState(), 0);
    setTimeout(()=> this.restoreUiState(), 200); // second pass to ensure after iframe/layout settles
  }
  chooseLink(r: { id: string; title: string }){
    const std = this.selected(); if(!std) return;
    const list = this.linksMap[std.id] || [];
    if (!list.some(x=>x.id===r.id)) list.push({ id:r.id, title:r.title });
    this.linksMap[std.id] = list;
    try{ localStorage.setItem('rmd_standard_links', JSON.stringify(this.linksMap)); }catch{}
    this.linkQuery.set('');
    this.linkSuggest = [];
    // reflect to UI
    const arr = this.linksMap[std.id] || [];
    this.linkedRecords.set([ ...arr ]);
    this.linkedExpanded.set(true);
  }
  removeLink(r: { id: string }){
    const std = this.selected(); if(!std) return;
    const list = (this.linksMap[std.id] || []).filter(x=>x.id!==r.id);
    this.linksMap[std.id] = list;
    try{ localStorage.setItem('rmd_standard_links', JSON.stringify(this.linksMap)); }catch{}
    const arr = this.linksMap[std.id] || [];
    this.linkedRecords.set([ ...arr ]);
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
    this.term.set('');
    this.searching.set(false);
    this.results.set([]);
    this.matchTotal.set(0);
    this.matchIndex.set(0);
    const frame = document.querySelector('iframe') as HTMLIFrameElement | null;
    if (frame?.contentWindow) frame.contentWindow.postMessage({ type:'highlight', term: '' }, '*');
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
    this.linkedRecords.set([ ...arr ]);
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

  public print() {
    const sel = this.selected();
    if (!sel) return;
    const url = `/rmd/view.html?id=${encodeURIComponent(sel.id)}`;
    const win = window.open(url, '_blank');
    if (!win) return;
    win.onload = () => { try { win.focus(); win.print(); } finally {} };
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
