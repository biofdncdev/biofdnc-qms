import { Component, ElementRef, HostListener, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RMD_FORM_CATEGORIES, RmdFormCategory, RmdFormItem } from './rmd-forms-data';
import { RMD_STANDARDS } from '../../standard/rmd/rmd-standards';
import { SupabaseService } from '../../services/supabase.service';
import { TabService } from '../../services/tab.service';
import { RmdFormsPdfService } from './services/rmd-forms-pdf.service';
import { RmdFormsFilterService } from './services/rmd-forms-filter.service';
import { RmdFormsMetadataService } from './services/rmd-forms-metadata.service';
import { RmdFormsThRecordService } from './services/rmd-forms-th-record.service';
import { AuditLink, StandardLink, UserPair } from './rmd-forms.types';

@Component({
  selector: 'app-rmd-forms',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
  categories: RmdFormCategory[] = RMD_FORM_CATEGORIES;
  selected = signal<RmdFormItem | null>(null);
  categoriesNoISO: string[] = this.categories.map(c => c.category).filter(c => c !== 'ISO');
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
    // Initialize filter service with categories
    this.filterService.setCategories(this.categories);
  }

  ngOnInit() {
    this.preloadCompanies();
    this.buildAuditLinkMap();
    this.loadInitialData();
  }

  ngAfterViewInit() {
    queueMicrotask(async () => {
      await this.thService.checkAdmin();
      this.thService.periodStartSig.set(this.thService.computePeriodStart(this.thService.dateValue()));
      if (this.selected()?.id === 'BF-RMD-PM-IR-07') {
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
    this.selected.set(it);
    await this.pdfService.refreshPdfList(it.id);
    this.updateLinkedForSelected();
    
    if (it.id === 'BF-RMD-PM-IR-07') {
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
      console.log('[Record] Opening audit item:', num, title);
      try {
        sessionStorage.setItem('audit.eval.forceOpen', String(num));
        if (title) sessionStorage.setItem('audit.eval.forceOpenTitle', String(title));
      } catch {}
      const url = `/app/audit/givaudan?open=${encodeURIComponent(String(num))}`;
      console.log('[Record] Opening URL:', url);
      this.tabs.requestOpen('Audit 평가 항목', 'audit:givaudan', url);
    } catch (e) {
      console.error('[Record] Error opening audit item:', e);
    }
  }

  openStandardTab(stdId: string) {
    try {
      this.persistUiState();
      const url = `/app/standard/rmd?open=${encodeURIComponent(stdId)}`;
      this.tabs.requestOpen('원료제조팀 규정', '/app/standard/rmd', url);
    } catch {}
  }

  // === Initial data loading ===
  private async loadInitialData() {
    queueMicrotask(async () => {
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
