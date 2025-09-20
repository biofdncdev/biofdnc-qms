import { Component, HostListener, ViewChild, ElementRef, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Services
import { TabService } from '../../../services/tab.service';
import { AuditService } from '../../../services/audit.service';
import { RecordService } from '../../../services/record.service';
import { AuthService } from '../../../services/auth.service';

// Local Services
import { AuditStateService } from './services/audit-state.service';
import { AuditUiService } from './services/audit-ui.service';
import { AuditDataService } from './services/audit-data.service';

// Components
import { AuditHeaderComponent } from './components/audit-header.component';
import { AuditFiltersComponent } from './components/audit-filters.component';
import { AuditItemListComponent } from './components/audit-item-list.component';

// Types
import { AuditItem, ResourceItem, LinkItem } from './types/audit.types';
import { RmdFormItem } from '../../../record/rmd-forms/rmd-forms-data';
import { RMD_STANDARDS } from '../../../standard/rmd/rmd-standards';

@Component({
  selector: 'app-audit-evaluation',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AuditHeaderComponent,
    AuditFiltersComponent,
    AuditItemListComponent
  ],
  template: `
    <div class="audit-page">
      <!-- Header Component -->
      <app-audit-header
        (onCreate)="onCreateClick()"
        (onDelete)="confirmDeleteDate()"
        (onLoadSaved)="loadFromSaved()"
        (onCopy)="openCopyModal()"
        (dateChange)="setDate($event)">
      </app-audit-header>

      <div class="layout">
        <!-- Filters Component -->
        <app-audit-filters
          (onFilterChange)="onFilterChange()">
        </app-audit-filters>

        <!-- Item List Component -->
        <app-audit-item-list
          *ngIf="!isRestoringState"
          #itemList
          (onSelectItem)="selectItem($event)"
          (onSaveProgress)="saveProgress($event)"
          (onToggleExtra)="toggleExtra($event)"
          (onAddComment)="addComment($event)"
          (onOpenRecordPicker)="openRecordPicker($event)"
          (onRemoveComment)="removeComment($event.it, $event.index)"
          (onStartEditComment)="startEditComment($event.it, $event.index, $event.text)"
          (onSaveEditComment)="saveEditComment($event.it, $event.index)"
          (onCancelEditComment)="cancelEditComment($event.it, $event.index)"
          (onLinkChipClick)="onLinkChipClick($event.event, $event.it, $event.link)"
          (onEditCommentKeydown)="onEditCommentKeydown($event.ev, $event.it, $event.index)">
        </app-audit-item-list>
        
        <!-- Loading placeholder -->
        <div *ngIf="isRestoringState" class="loading-placeholder">
          <div class="loading-spinner"></div>
          <span>평가 항목을 불러오는 중...</span>
        </div>
      </div>

      <!-- Modals -->
      <!-- Record Picker Modal -->
      <div class="preview-backdrop" *ngIf="ui.recordPickerOpen" (click)="closeRecordPicker()">
        <div class="preview draggable" #pickerRoot 
             (click)="$event.stopPropagation()" 
             (keydown)="onPickerKeydown($event)" 
             tabindex="0" 
             style="position:relative;">
          <header (mousedown)="startPickerDrag($event)">
            <div class="name">규정/기록 선택</div>
            <button (click)="closeRecordPicker()">×</button>
          </header>
          <div class="body" (keydown)="onPickerKeydown($event)">
            <div style="display:flex; gap:8px; align-items:center; margin-bottom:10px;">
              <input #pickerInput type="text" 
                    placeholder="규정/기록 (공백=AND)" 
                    [(ngModel)]="ui.pickerQuery" 
                    (keydown)="onPickerKeydown($event); $event.stopPropagation()" 
                    style="flex:1; height:36px; border:1px solid #d1d5db; border-radius:10px; padding:6px 10px; background:rgba(255,255,255,.65); backdrop-filter: blur(6px);" />
            </div>
            <div class="picker-list" style="max-height:55vh; overflow:auto; border:1px solid #eee; border-radius:12px;">
              <div *ngFor="let r of pickerResults(); let i = index" 
                   (mouseenter)="ui.hoverPickerIndex=i" 
                   (mouseleave)="ui.hoverPickerIndex=-1" 
                   (click)="chooseRecord(r)" 
                   [class.active]="i===ui.pickerIndex" 
                   [class.hovered]="i===ui.hoverPickerIndex" 
                   [class.standard-bg]="r.kind==='standard'" 
                   [class.record-bg]="r.kind==='record'" 
                   [id]="'picker-item-'+i" 
                   class="picker-item" 
                   style="padding:10px 12px; cursor:pointer; display:flex; gap:12px; align-items:center;">
                <span class="kind-dot" 
                      [class.dot-standard]="r.kind==='standard'" 
                      [class.dot-record]="r.kind==='record'">
                </span>
                <span style="font-family:monospace; font-size:12px; color:#475569; min-width:120px;">
                  {{ r.id }}
                </span>
                <span style="font-weight:600;">{{ r.title }}</span>
                <span style="margin-left:auto; font-size:12px; color:#64748b;">
                  {{ r.standardCategory || '-' }}
                </span>
              </div>
              <div *ngIf="!pickerResults().length" style="padding:12px; color:#94a3b8;">
                결과가 없습니다.
              </div>
            </div>
          </div>
          <!-- In-modal mini toast -->
          <div *ngIf="ui.pickerNotice" 
               style="position:absolute; right:12px; bottom:12px; background:#10b981; color:#ffffff; padding:6px 10px; border-radius:999px; font-size:12px; box-shadow:0 6px 16px rgba(0,0,0,.2); display:flex; align-items:center; gap:6px;">
            <span style="font-weight:700;">✓</span> {{ ui.pickerNotice }}
          </div>
        </div>
      </div>

      <!-- Copy Modal -->
      <div class="preview-backdrop" *ngIf="ui.copying" 
           (click)="onCopyBackdropClick()" 
           [class.active]="ui.copying">
        <div class="preview copy-modal" #copyModalRoot tabindex="0" 
             (click)="$event.stopPropagation()">
          <header>
            <div class="name">다른 날짜에서 복사</div>
            <button (click)="onCopyCloseClick()">×</button>
          </header>
          <div class="body">
            <div class="busy" *ngIf="ui.copyingBusy()">
              <span class="spinner"></span> 복사중…
            </div>
            <div class="busy ok" *ngIf="!ui.copyingBusy() && ui.copyJustFinished()">
              <span class="dot ok"></span> 복사 완료
            </div>
            <div class="form">
              <div class="form-row">
                <label class="lbl">복사할 날짜 선택</label>
                <select [(ngModel)]="ui.copyFromDate" 
                        class="date-select" 
                        [disabled]="ui.copyingBusy()">
                  <option *ngFor="let d of state.savedDates" [ngValue]="d">{{ d }}</option>
                </select>
              </div>
              <div class="hint">선택한 날짜의 모든 항목을 현재 Audit Date로 복사합니다.</div>
              <div class="actions">
                <button class="btn" (click)="onCopyCloseClick()">취소</button>
                <button class="btn primary" 
                        (click)="confirmCopy()" 
                        [disabled]="ui.copyingBusy()">
                  {{ ui.copyingBusy() ? '복사중…' : '복사' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Link Popup -->
      <div class="preview-backdrop" *ngIf="ui.linkPopup" (click)="ui.linkPopup=null">
        <div class="preview" (click)="$event.stopPropagation()">
          <header>
            <div class="name">{{ ui.linkPopup.id }} · {{ ui.linkPopup.title }}</div>
            <button (click)="ui.linkPopup=null">×</button>
          </header>
          <div class="body">
            <p>세부 내용(미리보기) — 추후 실제 문서/페이지로 연결 가능합니다.</p>
          </div>
        </div>
      </div>

      <!-- Toast -->
      <div class="toast" *ngIf="state.toast">{{ state.toast }}</div>
    </div>
  `,
  styleUrls: ['./audit-evaluation.component.scss'],
  styles: [`
    .loading-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      color: #666;
      font-size: 14px;
    }
    
    .loading-spinner {
      width: 24px;
      height: 24px;
      border: 2px solid #e0e0e0;
      border-top: 2px solid #1976d2;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 16px;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `]
})
export class AuditEvaluationComponent implements OnInit {
  @ViewChild('itemList') itemList?: AuditItemListComponent;
  @ViewChild('pickerRoot') pickerRoot?: ElementRef<HTMLDivElement>;
  @ViewChild('copyModalRoot') copyModalRoot?: ElementRef<HTMLDivElement>;
  @ViewChild('pickerInput') pickerInput?: ElementRef<HTMLInputElement>;
  @ViewChild('kwInput') kwInput?: ElementRef<HTMLInputElement>;

  // Record picker data
  recordData: (RmdFormItem & { kind?: 'record' | 'standard' })[] = [];
  recordCategories: string[] = ['일반관리기준서', '제조위생관리기준서', '제조관리기준서', '품질관리기준서', 'ISO'];
  methods: string[] = ['ERP', 'QMS', 'NAS', 'OneNote', 'Paper'];
  periods: string[] = ['일', '주', '월', '년', '발생시', '갱신주기에 따라'];
  
  // Resources
  resources: ResourceItem[] = [];
  assessment: any = null;
  
  // Navigation
  private pendingOpenId: number | null = null;
  isRestoringState = false;
  private pickerDrag = { 
    active: false, 
    startX: 0, 
    startY: 0, 
    offsetX: 0, 
    offsetY: 0, 
    raf: 0, 
    needsPaint: false 
  };
  private linkDragData?: { item: any; fromIndex: number };
  private pickerNoticeTimer: any = null;
  private pickerKeyGuard = { lastTs: 0, lastKey: '' };
  private recordDataLoading = false;

  constructor(
    public state: AuditStateService,
    public ui: AuditUiService,
    private data: AuditDataService,
    private audit: AuditService,
    private record: RecordService,
    private auth: AuthService,
    private router: Router,
    private tabBus: TabService
  ) {
    // Pre-hydrate UI from sessionStorage
    this.ui.prehydrateFromSession();
    
    // Listen for route changes
    this.router.events.subscribe(async (event) => {
      if (event instanceof NavigationEnd) {
        if (event.url.includes('/audit/')) {
          try {
            const urlParts = event.url.split('?');
            if (urlParts.length > 1) {
              const params = new URLSearchParams(urlParts[1]);
              const openParam = params.get('open');
              if (openParam && openParam.trim()) {
                const open = Number(openParam);
                if (Number.isFinite(open) && open > 0 && open <= 214) {
                  this.pendingOpenId = open;
                  if (this.state.items().length > 0) {
                    await this.openFromPending();
                  }
                }
              }
            }
          } catch (e) {}
        }
      }
    });
  }

  async ngOnInit() {
    // Check if we need to restore state
    const hasStoredState = this.hasStoredUiState();
    if (hasStoredState) {
      this.isRestoringState = true;
    }
    
    await this.data.initialize();
    
    // Deep-link handling
    try {
      const params = new URLSearchParams(location.search);
      const openParam = params.get('open');
      if (openParam && openParam.trim()) {
        const open = Number(openParam);
        if (Number.isFinite(open) && open > 0 && open <= 214) {
          this.pendingOpenId = open;
        }
      }
    } catch {}
    
    // Session restore
    try {
      const raw = sessionStorage.getItem('audit.eval.forceOpen');
      if (raw && !this.pendingOpenId) {
        const n = Number(raw);
        if (Number.isFinite(n) && n > 0 && n <= 214) {
          this.pendingOpenId = n;
        }
      }
      sessionStorage.removeItem('audit.eval.forceOpen');
      sessionStorage.removeItem('audit.eval.forceOpenTitle');
    } catch {}
    
    // Load saved dates
    await this.data.loadSavedDates();
    
    // Pre-restore UI state to prevent flickering
    this.preRestoreUiState();
    
    // Load data with optimized timing
    const dateReady = !!this.state.selectedDate();
    if (!dateReady) {
      this.setDate(this.state.today());
    } else {
      await this.data.loadByDate();
    }
    
    if (this.pendingOpenId) {
      await this.openFromPending();
    }
    
    // Show list after state is ready
    if (hasStoredState) {
      // Small delay to ensure data is fully loaded
      setTimeout(() => {
        this.isRestoringState = false;
        // Final UI state restoration after list is rendered
        setTimeout(() => {
          this.finalizeUiState();
        }, 0);
      }, 30);
    } else {
      this.isRestoringState = false;
    }
  }

  // Header events
  setDate(value: string) {
    this.state.selectedDate.set(value);
    this.data.loadByDate();
  }

  async onCreateClick() {
    await this.data.createForDate();
  }

  async confirmDeleteDate() {
    await this.data.deleteDate();
  }

  async loadFromSaved() {
    const d = this.state.savedSelectedDate || this.state.savedDates?.[0];
    if (!d) return;
    
    this.state.loadingSaved.set(true);
    try {
      this.state.savedSelectedDate = d;
      this.setDate(d);
      await this.data.loadByDate();
      await this.openFromPending();
    } finally {
      this.state.loadingSaved.set(false);
    }
  }

  // Filter events
  onFilterChange() {
    // Trigger any filter change logic if needed
  }

  // Item list events
  async selectItem(it: AuditItem) {
    this.state.openItemId = it.id;
    if (!this.state.openExtra.has(it.id)) {
      this.state.openExtra.add(it.id);
    }
    
    this.ui.persistUi(this.itemList?.listRef?.nativeElement);
    
    // Load assessment and progress
    const { data } = await this.audit.getGivaudanAssessment(it.id);
    this.assessment = data;
    
    const date = this.state.selectedDate();
    const { data: prog } = date 
      ? await this.audit.getGivaudanProgressByDate(it.id, date) 
      : await this.audit.getGivaudanProgress(it.id);
      
    if (prog) {
      this.updateItemFromProgress(it, prog);
    }
    
    // Load resources
    const { data: res } = await this.audit.listGivaudanResources(it.id);
    this.resources = res || [];
    
    // Measure heights
    this.measureAndCacheSlideHeights(it);
  }

  async toggleExtra(it: AuditItem) {
    if (this.state.openExtra.has(it.id)) {
      this.state.openExtra.delete(it.id);
      if (this.state.openItemId === it.id) {
        this.state.openItemId = null;
      }
      return;
    }
    
    this.state.openExtra.add(it.id);
    
    // Load data for the item
    const { data } = await this.audit.getGivaudanAssessment(it.id);
    this.assessment = data;
    
    const date = this.state.selectedDate();
    const { data: prog } = date 
      ? await this.audit.getGivaudanProgressByDate(it.id, date) 
      : await this.audit.getGivaudanProgress(it.id);
      
    if (prog) {
      this.updateItemFromProgress(it, prog);
    }
    
    const { data: res } = await this.audit.listGivaudanResources(it.id);
    this.resources = res || [];
    
    this.measureAndCacheSlideHeights(it);

    // When expanding an already-open row via click, ensure selection and centering
    setTimeout(() => {
      this.state.openItemId = it.id;
      this.centerRow(it.id);
    }, 20);
  }

  async saveProgress(it: AuditItem) {
    await this.data.saveProgress(it);
  }

  // Comments
  addComment(it: AuditItem) {
    const text = (this.ui.newComment[it.id] || '').trim();
    if (!text) return;
    
    if (!it.comments) it.comments = [];
    
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    
    it.comments.push({
      user: this.state.userDisplay,
      time: `${y}-${m}-${d} ${hh}:${mm}`,
      text
    });
    
    this.ui.newComment[it.id] = '';
    this.saveProgress(it);
  }

  removeComment(it: AuditItem, idx: number) {
    if (!it || !it.comments) return;
    if (idx >= 0 && idx < it.comments.length) {
      it.comments.splice(idx, 1);
    }
    this.saveProgress(it);
  }

  canEditComment(c: { user: string }) {
    return this.canDeleteComment(c);
  }

  canDeleteComment(c: { user: string }) {
    if (this.state.isAdmin) return true;
    const me = (this.state.userDisplay || '').trim();
    const owner = (c?.user || '').trim();
    return !!me && !!owner && me === owner;
  }

  startEditComment(it: AuditItem, idx: number, text: string) {
    this.ui.editingComment[it.id] = idx;
    this.ui.editCommentText[this.ui.keyFor(it.id, idx)] = text;
  }

  cancelEditComment(it: AuditItem, idx: number) {
    delete this.ui.editingComment[it.id];
    delete this.ui.editCommentText[this.ui.keyFor(it.id, idx)];
  }

  saveEditComment(it: AuditItem, idx: number) {
    const list = it.comments || [];
    if (!(idx >= 0 && idx < list.length)) return;
    
    const key = this.ui.keyFor(it.id, idx);
    const next = (this.ui.editCommentText[key] || '').trim();
    
    if (!next) {
      this.cancelEditComment(it, idx);
      return;
    }
    
    list[idx] = { ...list[idx], text: next };
    it.comments = list;
    this.cancelEditComment(it, idx);
    this.saveProgress(it);
  }

  onEditCommentKeydown(ev: KeyboardEvent, it: AuditItem, idx: number) {
    if ((ev.ctrlKey || ev.metaKey) && ev.key === 'Enter') {
      ev.preventDefault();
      this.saveEditComment(it, idx);
    }
    if (ev.key === 'Escape') {
      ev.preventDefault();
      this.cancelEditComment(it, idx);
    }
  }

  onCommentKeydown(ev: KeyboardEvent, it: AuditItem) {
    if ((ev.ctrlKey || ev.metaKey) && ev.key === 'Enter') {
      ev.preventDefault();
      try {
        this.addComment(it);
      } catch {}
      
      const goPrev = ev.shiftKey === true;
      const targetId = it.id + (goPrev ? -1 : 1);
      const targetItem = this.state.items().find(x => x.id === targetId);
      
      if (targetItem) {
        if (this.state.openItemId !== targetId) {
          const prevId = this.state.openItemId;
          if (typeof prevId === 'number') {
            this.state.openExtra.add(prevId);
          }
          this.toggleExtra(targetItem);
        }
        
        this.state.openItemId = targetId;
        setTimeout(() => {
          this.centerRow(targetId);
          const el = document.getElementById(`comment-input-${targetId}`) as HTMLTextAreaElement | null;
          if (el) {
            el.focus();
            el.setSelectionRange(el.value.length, el.value.length);
          }
        }, 40);
      }
    }
  }

  // Record picker
  async openRecordPicker(it: AuditItem) {
    this.ui.pickerTargetItem = it;
    this.ui.recordPickerOpen = true;
    this.ui.pickerIndex = -1;
    
    setTimeout(() => this.pickerInput?.nativeElement?.focus(), 0);
    
    if (!this.recordData.length) {
      await this.loadRecordPickerDataOnce();
    }
  }

  private async loadRecordPickerDataOnce() {
    if (this.recordDataLoading) return;
    this.recordDataLoading = true;
    
    try {
      const rows: any[] = await this.record.listAllFormMeta();
      const recs = (rows || []).map(r => ({
        id: String(r.record_no || '').trim(),
        title: r.record_name || r.name || '',
        department: r.department || undefined,
        method: r.method || undefined,
        period: r.period || undefined,
        standard: r.standard || undefined,
        standardCategory: r.standard_category || '기타',
        kind: 'record' as const
      })).filter(r => !!r.id);
      
      const stds = RMD_STANDARDS.flatMap(c => 
        c.items.map(i => ({
          id: i.id,
          title: i.title,
          standardCategory: c.category,
          kind: 'standard' as const
        }))
      );
      
      this.recordData = [...recs, ...stds];
    } catch {} finally {
      this.recordDataLoading = false;
    }
  }

  closeRecordPicker() {
    this.ui.recordPickerOpen = false;
    this.ui.pickerIndex = 0;
  }

  pickerResults() {
    const q = (this.ui.pickerQuery || '').trim().toLowerCase().split(/\s+/).filter(Boolean);
    let rows = this.recordData || [];
    
    if (this.ui.pickerStdCat) {
      rows = rows.filter(r => (r.standardCategory || '') === this.ui.pickerStdCat);
    }
    if (this.ui.pickerDept) {
      rows = rows.filter(r => (r.department || '') === this.ui.pickerDept);
    }
    if (this.ui.pickerMethod) {
      rows = rows.filter(r => (r.method || '') === this.ui.pickerMethod);
    }
    if (this.ui.pickerPeriod) {
      rows = rows.filter(r => (r.period || '') === this.ui.pickerPeriod);
    }
    
    if (q.length) {
      rows = rows.filter(r => {
        const hay = `${r.id} ${r.title || ''} ${r.owner || ''} ${r.method || ''}`.toLowerCase();
        return q.every(w => hay.includes(w));
      });
    }
    
    return rows.slice(0, 500);
  }

  onPickerKeydown(ev: KeyboardEvent) {
    const now = performance.now();
    if (this.pickerKeyGuard.lastKey === ev.key && (now - this.pickerKeyGuard.lastTs) < 30) {
      ev.preventDefault();
      return;
    }
    
    this.pickerKeyGuard.lastKey = ev.key;
    this.pickerKeyGuard.lastTs = now;
    
    const list = this.pickerResults();
    
    if (ev.key === 'ArrowDown') {
      ev.preventDefault();
      const next = this.ui.pickerIndex < 0 ? 0 : this.ui.pickerIndex + 1;
      this.ui.pickerIndex = Math.min(next, Math.max(0, list.length - 1));
      
      if (this.ui.pickerIndex >= 0) {
        setTimeout(() => {
          const el = document.getElementById('picker-item-' + this.ui.pickerIndex);
          if (el) el.scrollIntoView({ block: 'nearest' });
        }, 0);
      }
    } else if (ev.key === 'ArrowUp') {
      ev.preventDefault();
      if (this.ui.pickerIndex <= 0) {
        this.ui.pickerIndex = -1;
        setTimeout(() => this.pickerInput?.nativeElement?.focus(), 0);
      } else {
        this.ui.pickerIndex = Math.max(this.ui.pickerIndex - 1, 0);
        setTimeout(() => {
          const el = document.getElementById('picker-item-' + this.ui.pickerIndex);
          if (el) el.scrollIntoView({ block: 'nearest' });
        }, 0);
      }
    } else if (ev.key === 'Enter') {
      ev.preventDefault();
      if (this.ui.pickerIndex >= 0 && list[this.ui.pickerIndex]) {
        this.chooseRecord(list[this.ui.pickerIndex]);
      }
    } else if (ev.key === 'Escape') {
      ev.preventDefault();
      const hasQuery = (this.ui.pickerQuery || '').trim().length > 0;
      if (hasQuery) {
        this.ui.pickerQuery = '';
        this.ui.pickerIndex = -1;
        setTimeout(() => this.pickerInput?.nativeElement?.focus(), 0);
      } else {
        this.closeRecordPicker();
      }
    }
  }

  chooseRecord(r: any) {
    if (!this.ui.pickerTargetItem) return;
    if (!this.ui.pickerTargetItem.selectedLinks) {
      this.ui.pickerTargetItem.selectedLinks = [];
    }
    
    const exists = this.ui.pickerTargetItem.selectedLinks.some((x: any) => x.id === r.id);
    if (!exists) {
      this.ui.pickerTargetItem.selectedLinks.push({
        id: r.id,
        title: r.title || r.name || '',
        kind: r.kind || 'record'
      });
      
      this.saveProgress(this.ui.pickerTargetItem);
      
      // Show notification
      this.ui.pickerNotice = '추가되었습니다';
      if (this.pickerNoticeTimer) {
        clearTimeout(this.pickerNoticeTimer);
      }
      this.pickerNoticeTimer = setTimeout(() => {
        this.ui.pickerNotice = null;
      }, 1000);
    }
    
    this.ui.pickerIndex = 0;
    setTimeout(() => this.pickerInput?.nativeElement?.focus(), 0);
  }

  startPickerDrag(ev: MouseEvent) {
    this.pickerDrag.active = true;
    this.pickerDrag.startX = ev.clientX;
    this.pickerDrag.startY = ev.clientY;
    
    const move = (e: MouseEvent) => {
      if (!this.pickerDrag.active) return;
      this.pickerDrag.offsetX += (e.clientX - this.pickerDrag.startX);
      this.pickerDrag.offsetY += (e.clientY - this.pickerDrag.startY);
      this.pickerDrag.startX = e.clientX;
      this.pickerDrag.startY = e.clientY;
      
      if (!this.pickerDrag.raf) {
        this.pickerDrag.raf = requestAnimationFrame(this.paintPickerTransform);
      }
    };
    
    const up = () => {
      this.pickerDrag.active = false;
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
      cancelAnimationFrame(this.pickerDrag.raf);
      this.pickerDrag.raf = 0;
    };
    
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  }

  paintPickerTransform = () => {
    this.pickerDrag.raf = 0;
    try {
      const el = this.pickerRoot?.nativeElement;
      if (!el) return;
      el.style.transform = `translate(${this.pickerDrag.offsetX}px, ${this.pickerDrag.offsetY}px)`;
    } finally {}
  }

  // Links management
  onLinkChipClick(ev: MouseEvent, it: AuditItem, l: LinkItem) {
    ev.stopPropagation();
    
    if (this.state.openItemId !== it.id) {
      this.selectItem(it);
    }
    
    this.openLinkPopup(l);
  }

  openLinkPopup(l: LinkItem) {
    // Ensure UI state is saved before navigating
    this.ui.persistUi(this.itemList?.listRef?.nativeElement);
    
    if ((l.kind || 'record') === 'record') {
      const tabPath = 'record:rmd-forms';
      const navUrl = `/app/record/rmd-forms?open=${encodeURIComponent(l.id)}&ts=${Date.now()}`;
      
      try {
        sessionStorage.setItem('record.forceOpen', String(l.id));
      } catch {}
      
      this.tabBus.requestOpen('원료제조팀 기록', tabPath, navUrl);
      return;
    }
    
    const stdTab = 'standard:rmd';
    const ts = Date.now();
    const stdUrl = `/app/standard/rmd?open=${encodeURIComponent(l.id)}&ts=${ts}`;
    
    try {
      sessionStorage.setItem('standard.forceOpen', String(l.id));
    } catch {}
    
    this.tabBus.requestOpen('원료제조팀 규정', stdTab, stdUrl);
  }

  removeSelectedLink(it: AuditItem, l: LinkItem) {
    if (!it?.selectedLinks) return;
    it.selectedLinks = it.selectedLinks.filter(x => x.id !== l.id);
    this.saveProgress(it);
  }

  // Drag & Drop
  onLinkDragStart(ev: DragEvent, it: AuditItem, index: number) {
    this.ui.linkDragItemId = it.id;
    this.ui.linkDragIndex = index;
    this.ui.linkDragOverIndex = index;
    this.linkDragData = { item: it, fromIndex: index };
    
    try {
      ev.dataTransfer?.setData('text/plain', String(index));
      ev.dataTransfer!.effectAllowed = 'move';
    } catch {}
  }

  onLinkDragOver(ev: DragEvent, it: AuditItem, index: number) {
    if (this.ui.linkDragItemId !== it.id) return;
    ev.preventDefault();
    ev.dataTransfer!.dropEffect = 'move';
    this.ui.linkDragOverIndex = index;
  }

  onLinkDragLeave(ev: DragEvent, it: AuditItem, index: number) {
    if (this.ui.linkDragOverIndex === index) {
      this.ui.linkDragOverIndex = -1;
    }
  }

  onLinkDrop(ev: DragEvent, it: AuditItem, index: number) {
    ev.preventDefault();
    if (this.ui.linkDragItemId !== it.id) {
      this.onLinkDragEnd();
      return;
    }
    
    const from = this.ui.linkDragIndex;
    const to = index;
    this.reorderLinks(it, from, to);
    this.onLinkDragEnd();
  }

  onLinkListDragOver(ev: DragEvent, it: AuditItem) {
    if (this.ui.linkDragItemId !== it.id) return;
    ev.preventDefault();
  }

  onLinkListDrop(ev: DragEvent, it: AuditItem) {
    ev.preventDefault();
    this.onLinkDropEnd(ev, it);
  }

  onLinkDragOverEnd(ev: DragEvent, it: AuditItem) {
    if (this.ui.linkDragItemId !== it.id) return;
    ev.preventDefault();
    this.ui.linkDragOverIndex = (it.selectedLinks || []).length;
  }

  onLinkDropEnd(ev: DragEvent, it: AuditItem) {
    ev.preventDefault();
    if (this.ui.linkDragItemId !== it.id) {
      this.onLinkDragEnd();
      return;
    }
    
    const from = this.ui.linkDragIndex;
    const to = (it.selectedLinks || []).length;
    this.reorderLinks(it, from, to);
    this.onLinkDragEnd();
  }

  onLinkDragEnd() {
    this.ui.linkDragItemId = null;
    this.ui.linkDragIndex = -1;
    this.ui.linkDragOverIndex = -1;
    this.linkDragData = undefined;
  }

  private reorderLinks(it: AuditItem, from: number, to: number) {
    if (!it || !Array.isArray(it.selectedLinks)) return;
    
    const arr = it.selectedLinks;
    if (from === to || from < 0 || from >= arr.length) return;
    
    const toIndex = Math.max(0, Math.min(arr.length - 1, to));
    const [moved] = arr.splice(from, 1);
    arr.splice(toIndex, 0, moved);
    it.selectedLinks = arr;
    
    this.saveProgress(it);
  }

  // Copy modal
  openCopyModal() {
    this.ui.copying = true;
    this.ui.copyFromDate = this.state.savedDates?.[0] || null;
    
    setTimeout(() => this.copyModalRoot?.nativeElement?.focus(), 0);
    
    try {
      document.getElementById('app-root')?.classList.add('modal-open');
    } catch {}
  }

  closeCopy() {
    this.ui.copying = false;
    
    setTimeout(() => this.kwInput?.nativeElement?.blur(), 0);
    
    try {
      document.getElementById('app-root')?.classList.remove('modal-open');
    } catch {}
  }

  private confirmCancelCopy(): boolean {
    if (!this.ui.copyingBusy()) return true;
    return confirm('복사를 취소할까요? 진행 중인 작업이 중단됩니다.');
  }

  onCopyBackdropClick() {
    if (this.confirmCancelCopy()) {
      this.ui.copyingBusy.set(false);
      this.ui.copyJustFinished.set(false);
      this.closeCopy();
    }
  }

  onCopyCloseClick() {
    if (this.confirmCancelCopy()) {
      this.ui.copyingBusy.set(false);
      this.ui.copyJustFinished.set(false);
      this.closeCopy();
    }
  }

  async confirmCopy() {
    try {
      this.ui.copyingBusy.set(true);
      this.ui.copyJustFinished.set(false);
      
      const target = this.state.selectedDate() || this.state.today();
      this.state.selectedDate.set(target);
      
      const from = this.ui.copyFromDate;
      if (!from) {
        alert('복사할 날짜를 선택하세요.');
        return;
      }
      
      const { data: rows } = await this.audit.listGivaudanProgressByDate(from);
      const payload = (rows || []).map((r: any) => ({
        number: r.number,
        status: r.status || null,
        note: r.note || null,
        departments: r.departments || [],
        companies: r.companies || [],
        audit_date: target,
        updated_by: this.state.currentUserId,
        updated_by_name: this.state.userDisplay
      }));
      
      if (payload.length) {
        await this.audit.upsertGivaudanProgressMany(payload);
      }
      
      await this.data.loadByDate();
      await this.data.loadSavedDates();
      
      this.state.showToast('복사가 완료되었습니다');
      this.ui.copyJustFinished.set(true);
    } finally {
      this.ui.copyingBusy.set(false);
    }
  }

  // Textarea handling
  onTextareaKeydown(ev: KeyboardEvent, it: AuditItem) {
    if (!ev || !(ev.ctrlKey || ev.metaKey) || ev.key !== 'Enter') return;
    
    ev.preventDefault();
    
    const target = ev.target as HTMLElement | null;
    const col = Number(target?.getAttribute('data-col') || 1);
    
    const arr = this.visibleItems();
    if (!arr.length) return;
    
    const idx = arr.findIndex(x => x.id === it.id);
    if (idx < 0) return;
    
    const nextIdx = ev.shiftKey 
      ? Math.max(0, idx - 1) 
      : Math.min(arr.length - 1, idx + 1);
    
    const next = arr[nextIdx];
    if (!next) return;
    
    const nextId = next.id;
    
    this.state.openExtra.add(nextId);
    this.state.openItemId = nextId;
    
    setTimeout(() => {
      this.centerRow(nextId);
      try {
        requestAnimationFrame(() => this.centerRow(nextId));
      } catch {}
    }, 30);
    
    setTimeout(() => {
      try {
        const el = document.getElementById(`input-${nextId}-${col}`) as HTMLTextAreaElement | null;
        if (el) {
          el.focus();
          el.setSelectionRange(el.value.length, el.value.length);
        }
      } catch {}
    }, 0);
  }

  autoResize(ev: any, it?: AuditItem, key?: string) {
    const ta = ev?.target as HTMLTextAreaElement;
    if (!ta) return;
    
    if (key && it) {
      ta.style.height = 'auto';
      ta.style.overflowY = 'hidden';
      
      const base = 120;
      const cap = 480;
      const scrollHeight = ta.scrollHeight;
      const finalH = Math.min(cap, Math.max(base, scrollHeight));
      
      ta.style.height = finalH + 'px';
      
      try {
        (it as any)[key] = finalH;
      } catch {}
      
      return;
    }
    
    const lineBreaks = (ta.value.match(/\n/g) || []).length;
    if (lineBreaks === 0) {
      ta.style.height = '32px';
      return;
    }
    
    ta.style.height = 'auto';
    ta.style.height = Math.min(120, Math.max(ta.scrollHeight, 32)) + 'px';
  }

  // Helper methods
  isOpen(it: AuditItem): boolean {
    return this.state.openItemId === it.id || this.state.openExtra.has(it.id);
  }

  isDateCreated(): boolean {
    const d = this.state.selectedDate();
    return !!d && this.state.savedDates.includes(d);
  }

  visibleItems(): AuditItem[] {
    // Delegate to item-list component's logic
    return this.state.items().filter((it: any) => Number(it.id) !== 25);
  }

  trackByComment = (_: number, c: any) => `${c.user}|${c.time}|${c.text}`;

  private centerRow(id: number) {
    try {
      const container = this.itemList?.listRef?.nativeElement as HTMLElement | undefined;
      if (!container) return;
      
      const row = container.querySelector(`.item[data-id="${id}"]`) as HTMLElement | null;
      if (!row) return;
      
      const containerRect = container.getBoundingClientRect();
      const rowRect = row.getBoundingClientRect();
      const current = container.scrollTop;
      const target = current + (rowRect.top - containerRect.top) - 
                     (container.clientHeight / 2 - rowRect.height / 2);
      const max = container.scrollHeight - container.clientHeight;
      const to = Math.max(0, Math.min(max, target));
      
      // Skip if already close to target
      if (Math.abs(current - to) < 5) return;
      
      // Use native smooth scroll for better performance and consistency
      container.scrollTo({
        top: to,
        behavior: 'smooth'
      });
    } catch {}
  }

  private measureAndCacheSlideHeights(it: AuditItem) {
    setTimeout(() => {
      try {
        const container = this.itemList?.listRef?.nativeElement as HTMLElement | undefined;
        if (!container) return;
        
        const row = container.querySelector(`.item[data-id="${it.id}"]`) as HTMLElement | null;
        if (!row) return;
        
        const tas = row.querySelectorAll('textarea.slide-input');
        const base = 120;
        const cap = 480;
        
        if (tas[0]) {
          const ta = tas[0] as HTMLTextAreaElement;
          ta.style.height = 'auto';
          ta.style.overflowY = 'hidden';
          
          const hasContent = (ta.value || '').trim().length > 0;
          const scrollHeight = ta.scrollHeight;
          const h = hasContent ? Math.min(cap, Math.max(base, scrollHeight)) : base;
          
          (it as any).__h1 = h;
          ta.style.height = h + 'px';
        }
        
        if (tas[1]) {
          const ta = tas[1] as HTMLTextAreaElement;
          ta.style.height = 'auto';
          ta.style.overflowY = 'hidden';
          
          const hasContent = (ta.value || '').trim().length > 0;
          const scrollHeight = ta.scrollHeight;
          const h = hasContent ? Math.min(cap, Math.max(base, scrollHeight)) : base;
          
          (it as any).__h3 = h;
          ta.style.height = h + 'px';
        }
      } catch {}
    }, 0);
    
    // Second attempt for reliability
    setTimeout(() => this.measureAndCacheSlideHeights(it), 50);
  }

  private updateItemFromProgress(it: AuditItem, prog: any) {
    it.status = prog.status || it.status;
    it.note = prog.note || it.note;
    it.departments = prog.departments || [];
    it.companies = prog.companies || [];
    it.owners = prog.owners || [];
    it.company = prog.company || null;
    
    const raw = prog.comments || [];
    if (Array.isArray(raw)) {
      const fb = raw.find((c: any) => c && c.type === 'fields');
      it.comments = raw.filter((c: any) => !(c && c.type === 'fields'));
      
      if (fb) {
        it.col1Text = fb.col1 || it.col1Text;
        it.col3Text = fb.col3 || it.col3Text;
        it.selectedLinks = (fb.links || it.selectedLinks || []).map((link: any) => ({
          id: link.id,
          title: link.title,
          kind: link.kind || link.type || 'record'
        }));
      }
    }
  }

  private async openFromPending() {
    try {
      const id = this.pendingOpenId || null;
      if (!id || id > 214) return;
      
      const target = this.state.items().find(x => x.id === id);
      if (!target) return;
      
      await this.selectItem(target);
    } catch {}
    
    this.pendingOpenId = null;
  }

  // Keyboard shortcuts
  @HostListener('document:keydown', ['$event'])
  onKeyNav(ev: KeyboardEvent) {
    const key = ev.key || '';
    const isDown = key === 'ArrowDown' || key === 'Down';
    const isUp = key === 'ArrowUp' || key === 'Up';
    
    if (!isDown && !isUp) return;
    if (this.isEditableTarget(ev.target)) return;
    
    ev.preventDefault();
    ev.stopPropagation();
    
    const arr = this.visibleItems();
    if (!arr.length) return;
    
    let idx = this.state.openItemId 
      ? arr.findIndex(x => x.id === this.state.openItemId) 
      : -1;
      
    if (idx < 0) idx = -1;
    
    if (isDown) idx = Math.min(idx + 1, arr.length - 1);
    if (isUp) idx = Math.max(idx - 1, 0);
    
    const next = arr[Math.max(0, idx)];
    if (next && next.id !== this.state.openItemId) {
      this.selectItem(next);
      this.ui.persistUi(this.itemList?.listRef?.nativeElement);
      
      // Use requestAnimationFrame for better timing
      requestAnimationFrame(() => {
        this.centerRow(next.id);
      });
    }
  }

  @HostListener('document:keydown.escape')
  onEsc() {
    if (this.ui.previewing) {
      this.ui.previewing = false;
      return;
    }
    
    if (this.ui.linkPopup) {
      this.ui.linkPopup = null;
      return;
    }
    
    if (this.ui.recordPickerOpen) {
      const hasQuery = (this.ui.pickerQuery || '').trim().length > 0;
      if (hasQuery) {
        this.ui.pickerQuery = '';
        this.ui.pickerIndex = -1;
        setTimeout(() => this.pickerInput?.nativeElement?.focus(), 0);
        return;
      }
      
      this.closeRecordPicker();
      return;
    }
  }

  @HostListener('window:beforeunload')
  persistUi() {
    this.ui.persistUi(this.itemList?.listRef?.nativeElement);
  }

  @HostListener('document:click')
  closeSaved() {
    this.state.savedOpen = false;
  }

  private isEditableTarget(target: EventTarget | null): boolean {
    try {
      const el = target as HTMLElement | null;
      if (!el) return false;
      
      const tag = (el.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return true;
      if ((el as HTMLElement).isContentEditable) return true;
      
      const role = el.getAttribute?.('role') || '';
      if (role === 'textbox') return true;
      
      return false;
    } catch {
      return false;
    }
  }

  private hasStoredUiState(): boolean {
    try {
      const raw = sessionStorage.getItem('audit.eval.ui.v1');
      if (!raw) return false;
      const s = JSON.parse(raw);
      return typeof s?.openItemId === 'number' && s.openItemId > 0;
    } catch {
      return false;
    }
  }

  private preRestoreUiState() {
    try {
      // Immediately restore basic UI state to prevent flickering
      const raw = sessionStorage.getItem('audit.eval.ui.v1');
      if (!raw) return;
      const s = JSON.parse(raw);
      
      // Restore selected item immediately
      if (typeof s?.openItemId === 'number') {
        this.state.openItemId = s.openItemId;
      }
      
      // Restore expanded items immediately
      if (Array.isArray(s?.openExtra)) {
        this.state.openExtra = new Set<number>(s.openExtra);
      }
    } catch (e) {
      console.warn('Failed to pre-restore UI state:', e);
    }
  }

  private finalizeUiState() {
    // Use requestAnimationFrame for better timing synchronization
    requestAnimationFrame(() => {
      try {
        // Restore scroll position
        this.ui.restoreScrollPosition(this.itemList?.listRef?.nativeElement);
        
        // Center the selected item if it exists
        if (this.state.openItemId) {
          const selectedItem = this.state.items().find(x => x.id === this.state.openItemId);
          if (selectedItem) {
            // Center the selected item after DOM is fully rendered
            setTimeout(() => {
              this.centerRow(this.state.openItemId!);
            }, 50);
          }
        }
      } catch (e) {
        console.warn('Failed to finalize UI state:', e);
      }
    });
  }
}
