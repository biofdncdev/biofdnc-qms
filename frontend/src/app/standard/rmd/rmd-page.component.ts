import { Component, computed, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RMD_STANDARDS, RegulationItem, RegulationCategory } from './rmd-standards';
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
    window.addEventListener('message', (e) => this.onFrameMessage(e));
  }

  async buildIndex(){
    // Load all docs content once; disable search until ready
    try {
      const items: RegulationItem[] = [];
      this.categories.forEach(c => items.push(...c.items));
      for (const it of items){
        try{
          const html = await this.http.get(`/rmd/${it.id}.html`, { responseType:'text' }).toPromise();
          if (!html) continue;
          const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g,' ').trim();
          this.docs.push({ id: it.id, title: it.title, content: text.toLowerCase() });
        }catch{}
      }
      this.indexReady.set(true);
      queueMicrotask(() => {
        const el = document.querySelector<HTMLInputElement>('input[type=search]');
        if (el) el.focus();
      });
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
      queueMicrotask(() => this.scrollTop());
    } finally {
      this.loading.set(false);
    }
  }

  clearSearch() {
    this.query.set('');
    this.term.set('');
    this.searching.set(false);
    this.results.set([]);
    this.matchTotal.set(0);
    this.matchIndex.set(0);
    const frame = document.querySelector<HTMLIFrameElement>('iframe');
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
      .filter(d => d.title.toLowerCase().includes(q) || d.content.includes(q))
      .map(d => ({ id: d.id, title: this.findTitle(d.id) } as RegulationItem));
    this.results.set(filtered);
  }

  openResult(it: RegulationItem){
    this.highlightPending.set(true);
    this.select(it);
  }

  private findTitle(id: string){
    for (const c of this.categories){
      const f = c.items.find(i => i.id === id);
      if (f) return f.title;
    }
    return id;
  }

  onFrameLoad(){
    // noop; rely on ready message from iframe
  }

  private postHighlight(){
    const frame = document.querySelector<HTMLIFrameElement>('iframe');
    if (!frame?.contentWindow) return;
    frame.contentWindow.postMessage({ type:'highlight', term: this.term() }, '*');
  }

  navigate(dir: 'prev'|'next'){
    const frame = document.querySelector<HTMLIFrameElement>('iframe');
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
}
