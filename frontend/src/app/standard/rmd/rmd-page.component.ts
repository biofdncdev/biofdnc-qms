import { Component, computed, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RMD_STANDARDS, RegulationItem, RegulationCategory } from './rmd-standards';
import { RMD_FORM_CATEGORIES, RmdFormItem } from '../../record/rmd-forms/rmd-forms-data';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

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

  filtered = computed(() => {
    const q = this.query().trim().toLowerCase();
    if (!q) return this.categories;
    return this.categories.map(cat => ({
      ...cat,
      items: cat.items.filter(i => i.id.toLowerCase().includes(q) || i.title.toLowerCase().includes(q))
    })).filter(cat => cat.items.length > 0);
  });

  @ViewChild('rightPane', { static: false }) rightPane?: ElementRef<HTMLElement>;

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
    // try restore UI state (selected & scroll)
    setTimeout(()=> this.restoreUiState(), 0);
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

  async select(item: RegulationItem) {
    this.term.set(this.term());
    this.matchIndex.set(0);
    this.matchTotal.set(0);
    this.selected.set(item);
    this.loading.set(true);
    try {
      const q = this.term();
      const viewer = `/rmd/view.html?id=${encodeURIComponent(item.id)}${q ? `&q=${encodeURIComponent(q)}` : ''}`;
      this.docUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(viewer));
      setTimeout(() => this.scrollTop(), 0);
    } finally {
      this.loading.set(false);
    }
    // Load linked records for this standard
    this.loadLinks(item.id);
    // persist selected id
    this.persistUiState();
    // restore scroll position for this doc if state says so
    try{
      const raw = localStorage.getItem('rmd_page_state');
      if(raw){
        const s = JSON.parse(raw);
        if(s?.selectedId === item.id){
          setTimeout(()=>{ this.rightPane?.nativeElement?.scrollTo({ top: Number(s.rightScroll||0), behavior:'auto' }); }, 0);
        }
      }
    }catch{}
  }

  clearSearch() {
    this.query.set('');
    this.term.set('');
    this.searching.set(false);
    this.results.set([]);
    this.matchTotal.set(0);
    this.matchIndex.set(0);
    const frame = document.querySelector('iframe') as HTMLIFrameElement | null;
    if (frame?.contentWindow) frame.contentWindow.postMessage({ type:'highlight', term: '' }, '*');
  }

  scrollTop() { this.rightPane?.nativeElement?.scrollTo({ top: 0, behavior: 'smooth' }); }

  print() {
    const sel = this.selected();
    if (!sel) return;
    const url = `/rmd/view.html?id=${encodeURIComponent(sel.id)}`;
    const win = window.open(url, '_blank');
    if (!win) return;
    win.onload = () => { try { win.focus(); win.print(); } finally {} };
  }

  runSearch(){
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

  openResult(it: RegulationItem){
    this.highlightPending.set(true);
    this.select(it);
  }

  private findTitle(id: string){
    for (const c of this.categories){
      const f = c.items.find((i: RegulationItem) => i.id === id);
      if (f) return f.title;
    }
    return id;
  }

  onFrameLoad(){
    // noop; rely on ready message from iframe
  }

  private postHighlight(){
    const frame = document.querySelector('iframe') as HTMLIFrameElement | null;
    if (!frame?.contentWindow) return;
    frame.contentWindow.postMessage({ type:'highlight', term: this.term() }, '*');
  }

  navigate(dir: 'prev'|'next'){
    const frame = document.querySelector('iframe') as HTMLIFrameElement | null;
    if (!frame?.contentWindow) return;
    frame.contentWindow.postMessage({ type:'nav', dir }, '*');
  }

  private onFrameMessage(e: MessageEvent){
    const data = e.data || {};
    if (data.type === 'highlight:result'){
      this.matchTotal.set(data.total || 0);
      this.matchIndex.set(data.index || 0);
      this.highlightPending.set(false);
    } else if (data.type === 'ready'){
      if (this.term()) this.postHighlight();
    }
  }

  // ===== Linked records helpers =====
  private persistLinks(){
    try{ localStorage.setItem('rmd_standard_links', JSON.stringify(this.linksMap)); }catch{}
  }
  private loadLinks(stdId: string){
    const arr = this.linksMap[stdId] || [];
    this.linkedRecords.set([ ...arr ]);
    // expanded by default whenever standard changes
    this.linkedExpanded.set(true);
    try{ setTimeout(()=>{ const el = document.querySelector('section.linked-records .chips') as HTMLElement; if(el){ el.style.maxHeight = '2000px'; } }, 0); }catch{}
  }
  // open picker modal
  openRecordPicker(){ this.recPickerOpen.set(true); setTimeout(()=>{ try{ (document.getElementById('rec-picker-input') as HTMLInputElement)?.focus(); }catch{} }, 0); }
  closeRecordPicker(){ this.recPickerOpen.set(false); this.recQuery.set(''); this.recIndex.set(-1); }
  recResults(){
    const q = (this.recQuery()||'').trim().toLowerCase().split(/\s+/).filter(Boolean);
    const selIds = new Set(this.linkedRecords().map(x=>x.id));
    return this.recordPool.filter(r => !selIds.has(r.id) && q.every(w => (`${r.id} ${r.title}`.toLowerCase().includes(w)))).slice(0, 300);
  }
  onRecKeydown(ev: KeyboardEvent){
    const list = this.recResults();
    if (ev.key==='ArrowDown'){ ev.preventDefault(); this.recIndex.set(Math.min((this.recIndex()<0?0:this.recIndex()+1), Math.max(0,list.length-1))); }
    else if (ev.key==='ArrowUp'){ ev.preventDefault(); this.recIndex.set(Math.max(this.recIndex()-1, -1)); }
    else if (ev.key==='Enter'){ ev.preventDefault(); const i = this.recIndex(); if (i>=0 && list[i]) this.chooseLink(list[i]); this.closeRecordPicker(); }
    else if (ev.key==='Escape'){ ev.preventDefault(); this.closeRecordPicker(); }
  }
  toggleExpand(){
    const exp = !this.linkedExpanded();
    this.linkedExpanded.set(exp);
    try{ const el = document.querySelector('section.linked-records .chips') as HTMLElement; if(el){ el.style.maxHeight = exp ? '2000px' : '32px'; } }catch{}
    this.persistUiState();
  }

  // ===== UI state persistence =====
  private persistUiState(){
    try{
      const s = {
        selectedId: this.selected()?.id || null,
        rightScroll: this.rightPane?.nativeElement?.scrollTop || 0,
        expanded: this.linkedExpanded()
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
        // find and select target doc
        for(const cat of this.categories){
          const it = cat.items.find((i:any)=> i.id === s.selectedId);
          if(it){ this.select(it); break; }
        }
      }
      if(typeof s?.expanded === 'boolean') this.linkedExpanded.set(!!s.expanded);
      setTimeout(()=>{ this.rightPane?.nativeElement?.scrollTo({ top: Number(s?.rightScroll||0), behavior:'auto' }); }, 50);
    }catch{}
  }

  ngAfterViewInit(){
    // track right pane scroll to persist state
    queueMicrotask(()=>{
      const el = this.rightPane?.nativeElement; if(!el) return;
      el.addEventListener('scroll', () => this.persistUiState(), { passive: true });
    });
  }
  chooseLink(r: { id: string; title: string }){
    const std = this.selected(); if(!std) return;
    const list = this.linksMap[std.id] || [];
    if (!list.some(x=>x.id===r.id)) list.push({ id:r.id, title:r.title });
    this.linksMap[std.id] = list;
    this.persistLinks();
    this.linkQuery.set('');
    this.linkSuggest = [];
    this.loadLinks(std.id);
  }
  removeLink(r: { id: string }){
    const std = this.selected(); if(!std) return;
    const list = (this.linksMap[std.id] || []).filter(x=>x.id!==r.id);
    this.linksMap[std.id] = list;
    this.persistLinks();
    this.loadLinks(std.id);
  }
}
