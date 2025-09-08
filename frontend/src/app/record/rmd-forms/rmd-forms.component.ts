import { Component, computed, ElementRef, HostListener, inject, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RMD_FORM_CATEGORIES, RmdFormCategory, RmdFormItem } from './rmd-forms-data';
import { RMD_STANDARDS } from '../../standard/rmd/rmd-standards';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-rmd-forms',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styleUrls: ['../../standard/rmd/rmd-page.component.scss'],
  styles: [
    `:host .page{ display:grid; grid-template-columns: 280px 0.9fr minmax(420px, 46%); gap:16px; align-items:start; }
     :host aside.left{ grid-column:1; position:sticky; top:12px; align-self:start; }
     :host section.center{ grid-column:2; min-width:0; max-height: calc(100vh - 96px); overflow-y:auto; padding-right:8px; }
     :host main.right{ grid-column:3; min-width:0; max-height: calc(100vh - 96px); overflow-y:auto; padding-right:8px; }
     :host .filters{ display:flex; flex-direction:column; gap:10px; }
     :host .filters .f-title{ display:block; margin:0; font-weight:600; color:#334155; font-size:13px; }
     :host .filters .group{ display:flex; flex-wrap:wrap; gap:6px; }
     :host .btn-group{ display:flex; flex-wrap:wrap; gap:6px; }
     :host .btn-group.wrap{ row-gap:8px; column-gap:6px; }
     :host .seg{ padding:6px 10px; border:1px solid #e5e7eb; background:#fff; border-radius:999px; font-size:12px; cursor:pointer; }
     :host .seg.on{ background:#eef2ff; border-color:#c7d2fe; color:#3730a3; }
     :host .search{ position:relative; }
     :host .search input[type='search']{ width:100%; padding-right:26px; }
     :host .search .clear{ position:absolute; right:6px; top:50%; transform:translateY(-50%); border:0; background:transparent; cursor:pointer; color:#64748b; }
     :host .page-head{ display:flex; align-items:center; gap:8px; }
     :host h2{ margin:0; font-size:20px; font-weight:800; }
     :host h2 .sub{ font-size:14px; font-weight:700; margin-left:6px; color:#6b7280; }
     :host .results{ display:flex; flex-direction:column; gap:10px; margin-bottom:16px; }
     /* popup for standard search */
     :host .backdrop{ position:fixed; inset:0; background:rgba(2,6,23,.55); display:flex; align-items:center; justify-content:center; z-index:2147483647; }
     :host .modal{ width:min(720px,86vw); max-height:70vh; background:#fff; border-radius:16px; box-shadow:0 20px 60px rgba(0,0,0,.25); overflow:hidden; display:flex; flex-direction:column; }
     :host .modal header{ display:flex; align-items:center; justify-content:space-between; padding:12px 14px; border-bottom:1px solid #eee; font-weight:700; }
     :host .modal .body{ padding:12px; display:flex; flex-direction:column; gap:10px; }
     :host .modal .tools{ display:flex; gap:8px; align-items:center; }
     :host .modal .tools input{ flex:1; height:36px; border:1px solid #d1d5db; border-radius:10px; padding:6px 10px; }
     :host .picker-list{ max-height:55vh; overflow:auto; border:1px solid #eee; border-radius:12px; }
     :host .picker-item{ padding:10px 12px; display:flex; gap:12px; align-items:center; cursor:pointer; }
     :host .picker-item.hover{ background:#f8fafc; }
     :host .picker-item.active{ background:#eef2ff; box-shadow: inset 0 0 0 2px #6366f1; }
     :host .record-item{ padding:12px; border:1px solid #e5e7eb; border-radius:10px; background:#fff; cursor:pointer; }
     :host .record-item:hover{ border-color:#cbd5e1; background:#f8fafc; box-shadow:0 8px 18px rgba(2,6,23,.06); }
     :host .record-head{ display:flex; gap:12px; align-items:center; }
     :host .record-id{ font-family:monospace; font-size:12px; color:#475569; }
     :host .record-title{ font-weight:600; }
     :host .meta{ margin-top:6px; display:flex; gap:6px; flex-wrap:wrap; }
     :host .chip{ font-size:12px; padding:4px 10px; border-radius:999px; background:#ffffff; color:#111827; border:1px solid #e5e7eb; margin-right:8px; margin-bottom:8px; display:inline-flex; align-items:center; gap:6px; }
     :host .chips.owners .chip{ padding:2px 8px; height:26px; }
     :host .chips.owners .chip .remove{ background:transparent; border:0; cursor:pointer; color:#64748b; }
     :host .chips.owners{ margin-top:8px; }
     :host .summary-chips{ display:flex; flex-wrap:wrap; gap:8px; }
     :host .detail-form{ display:grid; grid-template-columns: 1fr 1fr; gap:12px; margin-bottom:12px; border:1px solid #e5e7eb; border-radius:12px; padding:12px; background:#ffffff; box-shadow:0 6px 16px rgba(2,6,23,.04); }
     :host .detail-form label{ font-size:12px; color:#475569; display:block; margin-bottom:4px; }
     :host .section-title{ font-weight:700; margin:4px 0 8px; }
     :host .section-row{ display:flex; align-items:center; justify-content:space-between; gap:12px; }
     :host .toolbar-line{ margin-bottom:6px; }
     :host .saved-badge{ font-size:12px; color:#16a34a; margin-left:8px; }
     /* unified action buttons */
     :host .action{ height:30px; padding:0 12px; border-radius:10px; border:1px solid #d1d5db; background:#fff; color:#111827; cursor:pointer; font-size:12px; display:inline-flex; align-items:center; justify-content:center; transition: transform .06s ease, box-shadow .12s ease, background .12s ease; }
     :host .action:hover{ background:#f8fafc; box-shadow:0 2px 6px rgba(2,6,23,.08); }
     :host .action:active{ transform: translateY(1px); }
     :host .action.primary{ background:#2563eb; border-color:#2563eb; color:#fff; }
     :host .action.primary:hover{ background:#1d4ed8; }
     :host .doc-title{ font-size:22px; font-weight:800; margin:0; }
     :host .title-wrap{ display:flex; align-items:baseline; gap:12px; }
     :host .doc-meta{ color:#6b7280; font-size:12px; }
     /* typeahead user suggestions */
     :host .typeahead{ position:relative; width:100%; }
     :host .typeahead input[type='text']{ width:100%; }
     :host .suggest{ position:absolute; left:0; top:100%; width:100%; background:#fff; border:1px solid #e5e7eb; border-radius:10px; box-shadow:0 8px 18px rgba(2,6,23,.06); max-height:220px; overflow:auto; z-index:20; }
     :host .suggest .item{ padding:8px 10px; cursor:pointer; font-size:13px; border-radius:6px; background:#ffffff; color:#111827; }
     :host .suggest .item + .item{ border-top:1px solid #f1f5f9; }
     :host .suggest .item.active{ background:#eef2ff; box-shadow:inset 0 0 0 2px rgba(99,102,241,.25); }
     :host .suggest .item:hover{ background:#eef2ff; }
     :host .suggest .item:focus{ outline:0; box-shadow:inset 0 0 0 2px rgba(99,102,241,.25); }
     :host .dropbox{ margin-top:8px; border:2px dashed #cbd5e1; border-radius:10px; padding:12px; display:flex; align-items:center; gap:8px; cursor:pointer; background:#f8fafc; }
     :host .dropbox.dragover{ background:#eef2ff; border-color:#93c5fd; }
     :host .file-pill{ display:inline-flex; align-items:center; gap:6px; padding:4px 10px; border-radius:999px; background:#e2e8f0; }
     :host .std-row{ display:flex; gap:12px; align-items:flex-start; }
     :host .file-pill button{ border:0; background:transparent; color:#ef4444; cursor:pointer; }
    `
  ],
  template: `
  <div class="page">
    <aside class="left" style="flex:0 0 280px; max-width:280px;">
      <div class="sticky">
        <div class="page-head"><h2>Record <span class="sub">원료제조팀</span></h2></div>
        <div class="search">
          <input type="search" placeholder="키워드로 검색" [ngModel]="query()" (ngModelChange)="query.set($event)">
          <button class="clear" *ngIf="query()" (click)="query.set('')">×</button>
        </div>
        <div class="filters">
          <label class="f-title">담당부서로 검색</label>
          <select [ngModel]="dept()" (ngModelChange)="dept.set($event); onFiltersChanged()">
            <option value="">전체</option>
            <option *ngFor="let d of departments" [value]="d">{{ d }}</option>
          </select>
          <label class="f-title">담당자로 검색</label>
          <input type="text" [ngModel]="ownerFilter()" (ngModelChange)="ownerFilter.set($event); onFiltersChanged()" placeholder="이름/이메일">
          <label class="f-title">기록방법으로 검색</label>
          <div class="btn-group">
            <button class="seg" [class.on]="method()===''" (click)="setMethod('')">전체</button>
            <button class="seg" *ngFor="let m of methods" [class.on]="method()===m" (click)="setMethod(m)">{{ m }}</button>
          </div>
          <label class="f-title">기록주기로 검색</label>
          <div class="btn-group">
            <button class="seg" [class.on]="period()===''" (click)="setPeriod('')">전체</button>
            <button class="seg" *ngFor="let p of periods" [class.on]="period()===p" (click)="setPeriod(p)">{{ p }}</button>
          </div>
          <label class="inline"><input type="checkbox" [ngModel]="overdueOnly()" (ngModelChange)="overdueOnly.set($event); onFiltersChanged()"> 기록주기가 지난 것만</label>
          <!-- 규정 카테고리 드롭다운 -->
          <label class="f-title">규정 카테고리로 검색</label>
          <select [ngModel]="standardCategory()" (ngModelChange)="setStdCat($event)">
            <option value="">전체</option>
            <option *ngFor="let c of categoriesNoISO" [value]="c">{{ c }}</option>
          </select>

          <label class="f-title" style="margin-top:8px;">인증 체계로 검색</label>
          <select [ngModel]="cert()" (ngModelChange)="setCert($event)">
            <option value="">전체</option>
            <option value="ISO9001">ISO9001</option>
            <option value="ISO22716">ISO22716</option>
            <option value="ISO14001">ISO14001</option>
            <option value="HALAL">HALAL</option>
          </select>
          <label class="f-title" style="margin-top:8px;">Audit 업체로 검색</label>
          <select [ngModel]="auditCompany()" (ngModelChange)="auditCompany.set($event); onFiltersChanged()">
            <option value="">전체</option>
            <option *ngFor="let c of auditCompanies" [value]="c">{{ c }}</option>
          </select>
        </div>
      </div>
    </aside>

    <section class="center">
      <section class="results">
        <div class="record-item" *ngFor="let r of filteredFlat()" (click)="open(r)">
          <div class="record-head">
            <span class="record-id">{{ r.id }}</span>
            <span class="record-title">{{ r.title }}</span>
          </div>
          <div class="meta">
            <span class="chip">{{ r.department || '원료제조팀' }}</span>
            <span class="chip" *ngIf="r.owner">{{ r.owner }}</span>
            <span class="chip" *ngIf="r.method">{{ r.method }}</span>
            <span class="chip" *ngIf="r.period">{{ r.period }}</span>
            <span class="chip" *ngFor="let c of (r.certs||[])">{{ c }}</span>
            <span class="chip" *ngIf="r.standard">규정: {{ r.standard }}</span>
            <span class="chip" *ngIf="r.standardCategory && r.standardCategory !== 'ISO'">{{ r.standardCategory }}</span>
          </div>
        </div>
      </section>
    </section>

    <main class="right">
      <div class="toolbar">
        <ng-container *ngIf="selected() as sel; else choose">
          <div class="title-wrap">
            <h3 class="doc-title">{{ sel.title }}</h3>
            <div class="doc-meta">문서번호: {{ sel.id }}</div>
          </div>
        </ng-container>
        <div class="spacer"></div>
      </div>
      <ng-template #choose><h3>좌측에서 항목을 선택하세요.</h3></ng-template>
      <section class="content">
        <div *ngIf="selected() as sel">
          <div class="section-row toolbar-line">
            <div class="section-title">기록 정보</div>
            <div style="display:flex; align-items:center; gap:10px;">
              <span class="saved-badge" *ngIf="metaJustSaved">저장됨</span>
              <button class="action" (click)="toggleInfo()">{{ infoOpen() ? '간략히 보기' : '자세히 보기' }}</button>
              <button class="action primary" [disabled]="isSavingMeta" (click)="saveMeta(sel)">저장</button>
            </div>
          </div>
          <ng-container *ngIf="infoOpen(); else infoSummary">
          <div class="detail-form" (ngModelChange)="persistMeta(sel)">
            <div>
              <label>담당부서</label>
              <select [(ngModel)]="sel.department" (ngModelChange)="persistMeta(sel)">
                <option *ngFor="let d of departments" [value]="d">{{ d }}</option>
              </select>
            </div>
            <div>
              <label>담당자</label>
              <div class="typeahead">
                <input #ownerInput type="text" [ngModel]="ownerTyping" (ngModelChange)="onOwnerInputText($event)" (keydown)="onOwnerKeydown($event, sel)" placeholder="이름/이메일" spellcheck="false">
                <div class="suggest" *ngIf="ownerSuggest.length">
                  <div class="item" *ngFor="let u of ownerSuggest; let i = index"
                    tabindex="-1" role="option"
                    [id]="'owner-sg-'+i" [class.active]="i===ownerIndex"
                    (click)="chooseOwner(sel,u)"
                    (keydown)="onOwnerItemKeydown($event, sel, i)">{{ u }}</div>
                </div>
              </div>
              <div class="chips owners" *ngIf="getOwnerList(sel).length">
                <span class="chip" *ngFor="let n of getOwnerList(sel)">{{ n }}
                  <button class="remove" (click)="removeOwnerChip(sel,n)" title="삭제">×</button>
                </span>
              </div>
            </div>
            <div>
              <label>기록방법</label>
              <div class="btn-group">
                <button class="seg" *ngFor="let m of methods" [class.on]="sel.method===m" (click)="sel.method=m; persistMeta(sel)">{{ m }}</button>
              </div>
            </div>
            <div>
              <label>기록주기</label>
              <div class="btn-group">
                <button class="seg" *ngFor="let p of periods" [class.on]="sel.period===p" (click)="sel.period=p; persistMeta(sel)">{{ p }}</button>
              </div>
            </div>
            <!-- 인증 체계 (연결된 규정과 위치 교체) -->
            <div>
              <label>인증 체계</label>
              <div class="btn-group wrap">
                <button class="seg" [class.on]="isCert(sel,'ISO9001')" (click)="toggleCert(sel,'ISO9001')">ISO9001</button>
                <button class="seg" [class.on]="isCert(sel,'ISO22716')" (click)="toggleCert(sel,'ISO22716')">ISO22716</button>
                <button class="seg" [class.on]="isCert(sel,'ISO14001')" (click)="toggleCert(sel,'ISO14001')">ISO14001</button>
                <button class="seg" [class.on]="isCert(sel,'HALAL')" (click)="toggleCert(sel,'HALAL')">HALAL</button>
              </div>
            </div>
            <div>
              <label>규정 카테고리</label>
              <div class="btn-group wrap">
                <button class="seg" *ngFor="let c of categoriesNoISO" [class.on]="sel.standardCategory===c" (click)="sel.standardCategory=c; persistMeta(sel)">{{ c }}</button>
              </div>
            </div>
          </div>
          </ng-container>
          <ng-template #infoSummary>
            <div class="summary-chips">
              <span class="chip">{{ sel.department || '부서 미지정' }}</span>
              <span class="chip" *ngIf="sel.owner">{{ sel.owner }}</span>
              <span class="chip" *ngIf="sel.method">{{ sel.method }}</span>
              <span class="chip" *ngIf="sel.period">{{ sel.period }}</span>
              <span class="chip" *ngIf="sel.standardCategory && sel.standardCategory !== 'ISO'">{{ sel.standardCategory }}</span>
            </div>
          </ng-template>
          <ng-container *ngIf="sel.id==='BF-RMD-PM-IR-07'; else genericInfo">
            <div class="th-toolbar">
              <div class="group">
                <button class="nav pill" title="이전 월" (click)="nudgeDate(-1,'month')"><span class="chev">‹</span><span class="lab">월</span></button>
                <button class="nav pill" title="이전 주" (click)="nudgeDate(-1,'week')"><span class="chev">‹</span><span class="lab">주</span></button>
                <button class="nav pill" title="이전 일" (click)="nudgeDate(-1,'day')"><span class="chev">‹</span><span class="lab">일</span></button>
                <input class="date" type="date" [ngModel]="dateValue()" (ngModelChange)="setDate($event)" />
                <button class="nav pill" title="다음 일" (click)="nudgeDate(1,'day')"><span class="lab">일</span><span class="chev">›</span></button>
                <button class="nav pill" title="다음 주" (click)="nudgeDate(1,'week')"><span class="lab">주</span><span class="chev">›</span></button>
                <button class="nav pill" title="다음 월" (click)="nudgeDate(1,'month')"><span class="lab">월</span><span class="chev">›</span></button>
              </div>
              <div class="group admin">
                <label class="label">기록주기</label>
                <select class="gran" [ngModel]="granularity()" (ngModelChange)="setGranularity($event)" [disabled]="!isAdmin">
                  <option value="month">월</option>
                  <option value="week">주</option>
                  <option value="day">일</option>
                </select>
              </div>
              <div class="group buttons">
                <div class="group tools">
                  <button class="secondary" [class.active]="tool()==='pen'" (click)="togglePenMenu()">펜</button>
                  <div class="tool-menu" *ngIf="showPenMenu()">
                    <div class="row">
                      <span>색상</span>
                      <button class="swatch" *ngFor="let c of penColors"
                        [style.background]="c"
                        (click)="setPenColor(c)"
                        [style.boxShadow]="penColor()===c ? ('0 0 0 4px ' + c + '55') : 'none'"
                        [style.transform]="penColor()===c ? 'scale(1.08)' : 'scale(1)'"
                        [attr.aria-label]="c"></button>
                    </div>
                    <div class="row">
                      <span>굵기</span>
                      <select [ngModel]="penWidth()" (ngModelChange)="setPenWidth($event)">
                        <option *ngFor="let w of penWidths" [value]="w">{{w}}px</option>
                      </select>
                    </div>
                  </div>
                  <button class="secondary" [class.active]="tool()==='eraser'" (click)="toggleEraserMenu()">지우개</button>
                  <div class="tool-menu" *ngIf="showEraserMenu()">
                    <div class="row">
                      <span>굵기</span>
                      <select [ngModel]="eraserWidth()" (ngModelChange)="setEraserWidth($event)">
                        <option *ngFor="let w of eraserWidths" [value]="w">{{w}}px</option>
                      </select>
                    </div>
                  </div>
                </div>
                <button class="secondary" (click)="closeToolMenus(); clearToday()">지우기</button>
                <button class="secondary" (click)="closeToolMenus(); loadRecord()">불러오기</button>
                <button class="primary" (click)="closeToolMenus(); saveRecord()">저장</button>
                <button class="secondary" (click)="closeToolMenus(); printRecord()">인쇄</button>
                <button class="secondary" (click)="toggleFullscreen()">전체화면</button>
              </div>
            </div>
            <div class="pdf-annotator" #container [class.fullscreen]="fullscreen()">
              <button *ngIf="fullscreen()" class="fs-exit" (click)="toggleFullscreen()">닫기</button>
              <canvas #pdfCanvas></canvas>
              <canvas #drawCanvas
                (pointerdown)="onPointerDown($event)" (pointermove)="onPointerMove($event)" (pointerup)="onPointerUp()" (pointercancel)="onPointerUp()"
                (touchstart)="$event.preventDefault()" (touchmove)="$event.preventDefault()" (touchend)="$event.preventDefault()"></canvas>
            </div>
          </ng-container>
          <ng-template #genericInfo></ng-template>
        </div>
      </section>
    </main>
  </div>
  `,
})
export class RmdFormsComponent {
  categories: RmdFormCategory[] = RMD_FORM_CATEGORIES;
  query = signal('');
  selected = signal<RmdFormItem | null>(null);
  // Filters
  departments: string[] = ['원료제조팀','식물세포배양팀','품질팀','연구팀','경영지원팀'];
  methods: string[] = ['ERP','QMS','NAS','OneNote','수기'];
  periods: string[] = ['일','주','월','년','갱신주기'];
  standardItems: string[] = [
    '원료제조팀 규정 1','원료제조팀 규정 2','원료제조팀 규정 3'
  ];
  categoriesOnly: string[] = this.categories.map(c=>c.category);
  categoriesNoISO: string[] = this.categoriesOnly.filter(c => c !== 'ISO');
  // Certification filter
  cert = signal<string>('');
  dept = signal<string>('');
  ownerFilter = signal<string>('');
  method = signal<string>('');
  period = signal<string>('');
  overdueOnly = signal<boolean>(false);
  standard = signal<string>('');
  standardCategory = signal<string>('');
  // Audit companies for filter
  auditCompanies: string[] = [];
  auditCompany = signal<string>('');
  // user options for typeahead
  users: string[] = [];
  userPairs: Array<{ name: string; email: string }> = [];
  ownerSuggest: string[] = [];
  ownerIndex = -1;
  // decoupled typeahead input value
  ownerTyping: string = '';
  // For certs multi-select we store in comments JSON bundle or extend model. Keep temporary on the item object as array
  // standard search popup state
  stdPickerOpen = false;
  stdQuery = '';
  stdCat = '';
  stdIndex = -1;
  stdHover = -1;
  @ViewChild('stdInput') stdInput?: ElementRef<HTMLInputElement>;
  @ViewChild('ownerInput') ownerInputRef?: ElementRef<HTMLInputElement>;
  private pickerTargetItem: any = null;
  @ViewChild('stdPortal') stdPortal?: ElementRef<HTMLDivElement>;
  infoOpen = signal<boolean>(false);
  constructor(private supabase: SupabaseService){}

  // preload audit companies when component constructed
  private async preloadCompanies(){
    try{ this.auditCompanies = (await this.supabase.listAuditCompanies()).map((r:any)=> r.name).filter(Boolean); }catch{}
  }

  filtered = computed(() => {
    const q = this.query().trim().toLowerCase();
    const base = this.categories.map(cat => ({
      ...cat,
      items: cat.items.filter(i => {
        const byKeyword = !q || i.id.toLowerCase().includes(q) || i.title.toLowerCase().includes(q);
        const byDept = !this.dept() || ((i as any).department || '원료제조팀') === this.dept();
        const byOwner = !this.ownerFilter() || ((i as any).owner || '').toLowerCase().includes(this.ownerFilter().toLowerCase());
        const byMethod = !this.method() || (i as any).method === this.method();
        const byPeriod = !this.period() || (i as any).period === this.period();
        const byStandard = !this.standard() || ((i as any).standard || '').toLowerCase().includes(this.standard().toLowerCase());
        const byCompany = !this.auditCompany() || (((i as any).companies || []).includes(this.auditCompany()));
        const stdCat = ((i as any).standardCategory || cat.category) as string;
        const byStdCat = !this.standardCategory() || stdCat.toLowerCase() === this.standardCategory().toLowerCase();
        // overdueOnly flag is placeholder; in real data you'd check due dates
        const byOverdue = !this.overdueOnly() || !!(i as any).overdue;
        return byKeyword && byDept && byOwner && byMethod && byPeriod && byStandard && byStdCat && byCompany && byOverdue;
      })
    })).filter(cat => cat.items.length > 0);
    return base;
  });

  onFiltersChanged(){ /* signals trigger recompute automatically */ }
  setMethod(v: string){ this.method.set(v); this.onFiltersChanged(); }
  setPeriod(v: string){ this.period.set(v); this.onFiltersChanged(); }
  setStdCat(v: string){ this.standardCategory.set(v); this.onFiltersChanged(); }
  setCert(v: string){ this.cert.set(v); this.onFiltersChanged(); }
  openStandardPopup(){
    this.stdPickerOpen = true;
    // lock background scroll
    try{ document.body.style.overflow = 'hidden'; }catch{}
    setTimeout(()=> this.stdInput?.nativeElement?.focus(), 0);
  }
  closeStandardPopup(){
    this.stdPickerOpen = false; this.stdIndex = -1; this.stdHover = -1; this.stdQuery='';
    // restore scroll
    try{ document.body.style.overflow = ''; }catch{}
  }
  stdResults(){
    const rows = RMD_STANDARDS.flatMap(c => c.items.map(i => ({ id: i.id, title: i.title, standardCategory: c.category })));
    const q = (this.stdQuery||'').trim().toLowerCase().split(/\s+/).filter(Boolean);
    const cat = this.stdCat || '';
    return rows.filter(r => (!cat || r.standardCategory===cat) && q.every(w => (`${r.id} ${r.title}`).toLowerCase().includes(w))).slice(0, 500);
  }
  onStdPickerKeydown(ev: KeyboardEvent){
    const list = this.stdResults();
    if (ev.key==='ArrowDown'){ ev.preventDefault(); this.stdIndex = Math.min((this.stdIndex<0?0:this.stdIndex+1), Math.max(0,list.length-1)); }
    else if (ev.key==='ArrowUp'){ ev.preventDefault(); this.stdIndex = Math.max(this.stdIndex-1, -1); }
    else if (ev.key==='Enter'){ ev.preventDefault(); if (this.stdIndex>=0 && list[this.stdIndex]) this.chooseStandard(list[this.stdIndex]); }
    else if (ev.key==='Escape'){ ev.preventDefault(); this.closeStandardPopup(); }
  }
  chooseStandard(r: { id: string; title: string }){ this.standard.set(`${r.id}`); this.onFiltersChanged(); this.closeStandardPopup(); }

  // simplified picker open for standards only (reuses existing record picker UI)
  openStandardPicker(sel: any){ this.stdPickerOpen = true; this.stdQuery=''; this.stdIndex=-1; setTimeout(()=> this.stdInput?.nativeElement?.focus(), 0); this.pickerTargetItem = sel; }

  removeStandardChip(sel: any, l: { id: string }){
    if (!sel?.selectedLinks) return;
    sel.selectedLinks = (sel.selectedLinks as any[]).filter((x:any)=> x.id !== l.id);
    this.persistMeta(sel);
  }
  // owner typeahead handlers (decoupled from model)
  onOwnerInputText(v: string){
    try{
      this.ownerTyping = v;
      const q = (v||'').toString().trim().toLowerCase();
      if (!q){ this.ownerSuggest = []; this.ownerIndex = -1; return; }
      const pool = this.userPairs || [];
      const matched = pool.filter(p => (p.name||'').toLowerCase().includes(q) || (p.email||'').toLowerCase().includes(q));
      this.ownerSuggest = matched.slice(0,8).map(p => `${p.name} / ${p.email}`);
      // 초기에는 포커스가 목록으로 이동하지 않도록 유지
      this.ownerIndex = -1;
    }catch{ this.ownerSuggest = []; this.ownerIndex = -1; }
  }
  private appendOwner(sel: any, text: string){
    const name = (text||'').toString().trim(); if(!name) return;
    const list = this.getOwnerList(sel);
    if (!list.includes(name)) list.push(name);
    sel.owner = list.join(', ');
    this.persistMeta(sel);
  }
  chooseOwner(sel: any, u: string){
    this.appendOwner(sel, u);
    this.ownerTyping = '';
    this.ownerSuggest = [];
    this.ownerIndex = -1;
  }

  onOwnerItemKeydown(ev: KeyboardEvent, sel: any, index: number){
    const key = ev.key || (ev as any).keyIdentifier || '';
    if (key === 'Enter'){
      ev.preventDefault();
      const pick = this.ownerSuggest[index];
      if (pick) this.chooseOwner(sel, pick);
    } else if (key === 'ArrowDown' || key === 'Down'){
      ev.preventDefault();
      const next = Math.min(index + 1, this.ownerSuggest.length - 1);
      this.ownerIndex = next;
      setTimeout(()=> (document.getElementById('owner-sg-'+next) as HTMLElement | null)?.focus?.(), 0);
    } else if (key === 'ArrowUp' || key === 'Up'){
      ev.preventDefault();
      const prev = index - 1;
      if (prev < 0){ this.ownerIndex = -1; this.ownerInputRef?.nativeElement?.focus(); return; }
      this.ownerIndex = prev;
      setTimeout(()=> (document.getElementById('owner-sg-'+prev) as HTMLElement | null)?.focus?.(), 0);
    }
  }
  getOwnerList(sel: any){
    const val = (sel.owner || '').toString();
    return val ? val.split(/\s*,\s*/).filter(Boolean) : [];
  }
  removeOwnerChip(sel: any, name: string){
    const list = this.getOwnerList(sel).filter((n:string)=> n!==name);
    sel.owner = list.join(', ');
    this.persistMeta(sel);
  }

  onOwnerKeydown(ev: KeyboardEvent, sel: any){
    const key = ev.key || (ev as any).keyIdentifier || '';
    if (key === 'ArrowDown' || key === 'Down'){
      ev.preventDefault();
      if (!this.ownerSuggest.length) return;
      this.ownerIndex = Math.min((this.ownerIndex < 0 ? 0 : this.ownerIndex + 1), this.ownerSuggest.length - 1);
      setTimeout(()=>{
        const el = document.getElementById('owner-sg-'+this.ownerIndex) as HTMLElement | null;
        el?.scrollIntoView({ block: 'nearest' });
        el?.focus?.();
      },0);
    } else if (key === 'ArrowUp' || key === 'Up'){
      ev.preventDefault();
      if (!this.ownerSuggest.length){
        // no suggestions -> move focus back to input
        this.ownerInputRef?.nativeElement?.focus();
        return;
      }
      if (this.ownerIndex <= 0){
        this.ownerIndex = -1;
        this.ownerInputRef?.nativeElement?.focus();
        return;
      }
      this.ownerIndex = Math.max(this.ownerIndex - 1, 0);
      setTimeout(()=>{
        const el = document.getElementById('owner-sg-'+this.ownerIndex) as HTMLElement | null;
        el?.scrollIntoView({ block: 'nearest' });
        el?.focus?.();
      },0);
    } else if (key === 'Enter'){
      ev.preventDefault();
      if (this.ownerSuggest.length){
        const pick = this.ownerSuggest[this.ownerIndex] || this.ownerSuggest[0];
        if (pick) this.chooseOwner(sel, pick);
      } else {
        // 제안이 없는 경우는 사용자 목록에 없으므로 추가하지 않음
        this.ownerTyping = '';
      }
      this.ownerSuggest = [];
      this.ownerIndex = -1;
    } else if (key === 'Escape' || key === 'Esc'){
      ev.preventDefault();
      this.ownerTyping = '';
      this.ownerSuggest = [];
      this.ownerIndex = -1;
    }
  }
  focusSuggest(){
    setTimeout(()=>{
      const el = document.getElementById('owner-sg-'+(this.ownerIndex>=0?this.ownerIndex:0));
      (el as any)?.focus?.();
    },0);
  }

  ngOnInit(){
    this.preloadCompanies();
    // Load meta from DB; fallback to localStorage
    queueMicrotask(async ()=>{
      try{
        const all = await this.supabase.listAllFormMeta();
        const byId: Record<string, any> = {};
        for(const row of all as any[]){
          if(!row?.form_id) continue;
          // Normalize snake_case → camelCase used in UI
          byId[row.form_id] = {
            department: row.department || undefined,
            owner: row.owner || undefined,
            method: row.method || undefined,
            period: row.period || undefined,
            standard: row.standard || undefined,
            standardCategory: row.standard_category || undefined,
            certs: Array.isArray(row.certs) ? row.certs : [],
          };
        }
        for(const cat of this.categories){
          for(const it of cat.items as any[]){
            const m = byId[it.id];
            if(m){
              it.department = m.department ?? it.department;
              it.owner = m.owner ?? it.owner;
              it.method = m.method ?? it.method;
              it.period = m.period ?? it.period;
              it.standard = m.standard ?? it.standard;
              // If DB has standardCategory as 'ISO', keep blank to hide in badges
              const sc = m.standardCategory === 'ISO' ? undefined : m.standardCategory;
              it.standardCategory = sc ?? it.standardCategory;
              it.certs = Array.isArray(m.certs) ? m.certs : (it.certs||[]);
            }
          }
        }
        // Overlay with localStorage conservatively: only apply defined & non-empty values
        try{
          const raw = localStorage.getItem('rmd_forms_meta');
          if(raw){
            // Local cache는 더 이상 우선 적용하지 않습니다. (DB 우선)
          }
        }catch{}
      }catch{
        try{
          const raw = localStorage.getItem('rmd_forms_meta');
          if(raw){ const map = JSON.parse(raw) as Record<string, any>; for(const cat of this.categories){ for(const it of cat.items as any[]){ const m = map[it.id]; if(m) Object.assign(it, m); } } }
        }catch{}
      }
      // Load user list for typeahead (name/email)
      try{
        const { data: users } = await this.supabase.getClient().from('users').select('name,email');
        this.userPairs = (users||[]).map((u:any)=> ({ name: u?.name || '', email: u?.email || '' }));
        this.users = this.userPairs.map(p => p.name || p.email).filter(Boolean);
      }catch{}
      // Deep-link open by id (e.g., ?open=ISO-9001)
      try{
        const params = new URLSearchParams(location.search);
        const openId = params.get('open');
        if (openId){
          const target = this.filteredFlat().find(r => r.id === openId);
          if (target){ this.open(target); }
        }
      }catch{}
    });
  }

  persistMeta(it: any){
    try{
      const raw = localStorage.getItem('rmd_forms_meta');
      const map = raw ? JSON.parse(raw) : {};
      const sc = (it.standardCategory === 'ISO') ? undefined : it.standardCategory;
      map[it.id] = { department: it.department, owner: it.owner, method: it.method, period: it.period, standard: it.standard, standardCategory: sc, certs: (it.certs||[]) };
      localStorage.setItem('rmd_forms_meta', JSON.stringify(map));
    }catch{}
    // Note: 자동 DB 저장은 비활성화. 사용자가 [저장]을 눌렀을 때만 커밋합니다.
  }

  private upsertTimer?: any;
  private scheduleUpsert(it: any){
    clearTimeout(this.upsertTimer);
    this.upsertTimer = setTimeout(async () => {
      try{
        await this.supabase.upsertFormMeta({
          form_id: it.id,
          department: it.department || null,
          owner: it.owner || null,
          method: it.method || null,
          period: it.period || null,
          standard: it.standard || null,
          standard_category: it.standardCategory || null,
          certs: (it.certs||[])
        });
      }catch{}
    }, 300);
  }

  // ===== PDF handling =====
  recordPdfs: Array<{ name: string; path: string; url: string }> = [];
  selectedPdfPath: string = '';
  isSavingMeta = false;
  metaJustSaved = false;
  dragOver = false;

  async saveMeta(sel: any){
    try{
      this.isSavingMeta = true; this.metaJustSaved = false;
      const up = await this.supabase.upsertFormMeta({
        form_id: sel.id,
        department: sel.department || null,
        owner: sel.owner || null,
        method: sel.method || null,
        period: sel.period || null,
        standard: sel.standard || null,
        standard_category: (sel.standardCategory==='ISO') ? null : (sel.standardCategory || null),
        certs: (sel.certs||[])
      });
      // Re-fetch canonical row and patch UI to ensure persistence actually reflected
      try{
        const { data: fresh } = await this.supabase.getFormMeta(sel.id) as any;
        if (fresh){
          sel.department = fresh.department || sel.department;
          sel.owner = fresh.owner || sel.owner;
          sel.method = fresh.method || sel.method;
          sel.period = fresh.period || sel.period;
          sel.standard = fresh.standard || sel.standard;
          sel.standardCategory = fresh.standard_category || sel.standardCategory;
          sel.certs = Array.isArray(fresh.certs) ? fresh.certs : (sel.certs||[]);
          // UI 리스트에도 즉시 반영
          const all = this.filteredFlat();
          const idx = all.findIndex(r => r.id === sel.id);
          if (idx >= 0){
            (all[idx] as any).department = sel.department;
            (all[idx] as any).owner = sel.owner;
            (all[idx] as any).method = sel.method;
            (all[idx] as any).period = sel.period;
            (all[idx] as any).standard = sel.standard;
            (all[idx] as any).standardCategory = sel.standardCategory;
            (all[idx] as any).certs = sel.certs || [];
          }
        }
      }catch{}
      // Also persist immediately to localStorage to ensure F5 후에도 유지
      try{
        const raw = localStorage.getItem('rmd_forms_meta');
        const map = raw ? JSON.parse(raw) : {};
        const sc = (sel.standardCategory === 'ISO') ? undefined : sel.standardCategory;
        map[sel.id] = { department: sel.department, owner: sel.owner, method: sel.method, period: sel.period, standard: sel.standard, standardCategory: sc, certs: (sel.certs||[]) };
        localStorage.setItem('rmd_forms_meta', JSON.stringify(map));
      }catch{}
      this.metaJustSaved = true;
      setTimeout(()=> this.metaJustSaved = false, 1500);
    }catch(e){
      console.error('[Record] saveMeta failed', e);
      alert('저장에 문제가 발생했습니다. 로그인 상태를 확인하거나 네트워크를 다시 시도해 주세요.');
    }finally{ this.isSavingMeta = false; }
  }

  private async refreshPdfList(){
    const sel = this.selected(); if(!sel) return;
    this.recordPdfs = await this.supabase.listRecordPdfs(sel.id);
    if (this.recordPdfs.length && !this.selectedPdfPath){ this.selectedPdfPath = this.recordPdfs[0].url; }
  }
  async onPdfPick(ev: Event){
    const input = ev.target as HTMLInputElement; const f = input?.files?.[0]; if(!f || !this.selected()) return;
    await this.supabase.uploadRecordPdf(f, this.selected()!.id);
    await this.refreshPdfList();
  }
  async onDrop(ev: DragEvent){
    ev.preventDefault(); this.dragOver = false; const file = ev.dataTransfer?.files?.[0]; if(!file || !this.selected()) return;
    if (file.type !== 'application/pdf') return;
    await this.supabase.uploadRecordPdf(file, this.selected()!.id);
    await this.refreshPdfList();
  }
  async removePdf(p: { path: string }){
    try{ await this.supabase.deleteRecordPdf(p.path); }catch{}
    await this.refreshPdfList();
  }

  filteredFlat = computed<RmdFormItem[]>(() => {
    const cats = this.filtered();
    const flat: RmdFormItem[] = [];
    for(const cat of cats){
      for(const it of cat.items){
        const ref: any = it as any;
        if (!ref.certs) ref.certs = [];
        if (!ref.standardCategory) ref.standardCategory = cat.category;
        if (!ref.department) ref.department = '원료제조팀';
        flat.push(ref as RmdFormItem);
      }
    }
    return flat.sort((a,b)=> a.id.localeCompare(b.id));
  });

  async open(it: RmdFormItem){
    this.selected.set(it);
    await this.refreshPdfList();
    if (it.id === 'BF-RMD-PM-IR-07'){
      try{
        const today = new Date().toISOString().slice(0,10);
        // View가 렌더된 다음에 날짜/렌더/불러오기를 실행 (container가 아직 없을 수 있음)
        setTimeout(async () => {
          await this.setDate(today);
          const list = await this.supabase.listThWeeks(it.id);
          this.recordedWeeks = signal<string[]>((list.data||[]).map((r:any)=> r.week_start));
        }, 0);
      }catch{}
    }
  }
  // ===== Temperature/Humidity PDF Annotator =====
  @ViewChild('container', { static: false }) containerRef?: ElementRef<HTMLDivElement>;
  @ViewChild('pdfCanvas', { static: false }) pdfCanvasRef?: ElementRef<HTMLCanvasElement>;
  @ViewChild('drawCanvas', { static: false }) drawCanvasRef?: ElementRef<HTMLCanvasElement>;

  // selected date from calendar
  dateValue = signal<string>(new Date().toISOString().slice(0,10));
  // computed period start based on granularity
  periodStartSig = signal<string>(RmdFormsComponent.toMonday(new Date()));
  granularity = signal<'day'|'week'|'month'>( (localStorage.getItem('th_granularity') as any) || 'day');
  isAdmin = false;
  recordedWeeks = signal<string[]>([]);
  fullscreen = signal<boolean>(false);
  tool = signal<'pen'|'eraser'>('pen');
  showPenMenu = signal<boolean>(false);
  showEraserMenu = signal<boolean>(false);
  penColors = ['#111827','#ef4444','#f59e0b','#10b981','#3b82f6','#8b5cf6'];
  penWidths = [2,3,4,6,8,10,12];
  eraserWidths = [6,8,10,14,20,28];
  penColor = signal<string>('#111827');
  penWidth = signal<number>(3);
  eraserWidth = signal<number>(14);
  private drawing = false;
  private ctxDraw?: CanvasRenderingContext2D | null;
  private pdfCtx?: CanvasRenderingContext2D | null;
  private strokesByDate: Record<string, { points: {x:number;y:number;}[]; width:number; color:string; }[]> = {};
  private legacyStrokes: { points: {x:number;y:number;}[]; width:number; color:string; }[] | null = null;
  private currentStroke: { points: {x:number;y:number;}[]; width:number; color:string; } | null = null;

  // Week starts on Sunday as requested
  static toMonday(d: Date){ const dt = new Date(d); const day = dt.getDay(); const diff = 0 - day; dt.setDate(dt.getDate()+diff); return dt.toISOString().slice(0,10); }
  static toMonthStart(d: Date){ const dt = new Date(d.getFullYear(), d.getMonth(), 1); return dt.toISOString().slice(0,10); }
  private computePeriodStart(dateStr: string){
    const d = new Date(dateStr);
    switch(this.granularity()){
      case 'day': return dateStr;
      case 'week': return RmdFormsComponent.toMonday(d);
      case 'month': return RmdFormsComponent.toMonthStart(d);
    }
  }

  async setDate(v: string){
    if(!v) return;
    this.dateValue.set(v);
    this.periodStartSig.set(this.computePeriodStart(v));
    await this.renderPdf();
    await this.loadRecord();
  }
  hasRecord(ymd: string){ return this.recordedWeeks().includes(ymd); }
  periodStart(){ return this.periodStartSig(); }
  setGranularity(val: 'day'|'week'|'month'){ this.granularity.set(val); localStorage.setItem('th_granularity', val); this.periodStartSig.set(this.computePeriodStart(this.dateValue())); this.renderPdf(); this.loadRecord(); }
  async nudgeDate(delta: number, unit: 'day'|'week'|'month'){
    const d = new Date(this.dateValue());
    if (unit==='day') d.setDate(d.getDate()+delta);
    if (unit==='week') d.setDate(d.getDate()+delta*7);
    if (unit==='month') d.setMonth(d.getMonth()+delta);
    await this.setDate(d.toISOString().slice(0,10));
  }
  // Removed jumpRecord in favor of explicit day/week/month nudges

  closeToolMenus(){ this.showPenMenu.set(false); this.showEraserMenu.set(false); }

  togglePenMenu(){ this.tool.set('pen'); this.showPenMenu.set(!this.showPenMenu()); this.showEraserMenu.set(false); }
  toggleEraserMenu(){ this.tool.set('eraser'); this.showEraserMenu.set(!this.showEraserMenu()); this.showPenMenu.set(false); }
  setPenColor(c: string){ this.penColor.set(c); this.ctxDraw && (this.ctxDraw.strokeStyle = c); }
  setPenWidth(w: number){ this.penWidth.set(+w); this.ctxDraw && (this.ctxDraw.lineWidth = +w); }
  setEraserWidth(w: number){ this.eraserWidth.set(+w); }
  toggleInfo(){ this.infoOpen.set(!this.infoOpen()); }
  // cert helpers
  isCert(sel: any, c: string){ const arr = (sel.certs || []) as string[]; return arr.includes(c); }
  toggleCert(sel: any, c: string){
    let arr = (sel.certs || []) as string[];
    if (arr.includes(c)) arr = arr.filter(x=>x!==c); else arr = [...arr, c];
    sel.certs = arr; this.persistMeta(sel);
  }

  methodClass(m: string){ return {} as any; }

  ngAfterViewInit(){
    queueMicrotask(async ()=>{
      try{ const u = await this.supabase.getCurrentUser(); if(u){ const { data } = await this.supabase.getUserProfile(u.id); this.isAdmin = (data?.role==='admin'||data?.role==='manager'); } }catch{}
      this.periodStartSig.set(this.computePeriodStart(this.dateValue()));
      await this.renderPdf();
      await this.loadRecord();
    });
  }

  @HostListener('window:resize') onResize(){ if(this.fullscreen()) this.renderPdf(); }

  private async renderPdf(){
    if (!this.selected() || this.selected()!.id !== 'BF-RMD-PM-IR-07') return;
    const container = this.containerRef?.nativeElement; if(!container) return;
    const pdfCanvas = this.pdfCanvasRef?.nativeElement; const drawCanvas = this.drawCanvasRef?.nativeElement;
    if(!pdfCanvas || !drawCanvas) return;

    // Target size: fit within container (or viewport if fullscreen) while preserving A4 ratio (sqrt(2) ≈ 1.414)
    let width: number; let height: number;
    if (this.fullscreen()) {
      const vw = Math.max(320, (globalThis.innerWidth || 1024) - 32);
      const vh = Math.max(320, (globalThis.innerHeight || 768) - 32);
      width = Math.min(vw, Math.floor(vh / 1.414));
      height = Math.floor(width * 1.414);
    } else {
      width = Math.min(900, container.clientWidth || 900);
      height = Math.floor(width * 1.414);
    }
    [pdfCanvas, drawCanvas].forEach(c=>{ c.width = width; c.height = height; c.style.width = width+'px'; c.style.height = height+'px'; });
    this.pdfCtx = pdfCanvas.getContext('2d');
    this.ctxDraw = drawCanvas.getContext('2d');
    if (this.ctxDraw){
      this.ctxDraw.lineCap='round'; this.ctxDraw.lineJoin='round';
      this.ctxDraw.strokeStyle = this.penColor();
      this.ctxDraw.lineWidth = this.penWidth();
    }

    // Try to draw from image first for best performance on iPad; fallback to PDF
    const imageCandidates = [
      '/forms/th-record-sheet.png',
      '/forms/Temperature%20and%20Humidity%20Record%20Sheet.png',
      '/asset/th-record-sheet.png',
      '/asset/Temperature%20and%20Humidity%20Record%20Sheet.png',
      '/forms/th-record-sheet.jpg',
      '/asset/th-record-sheet.jpg'
    ];
    let drawn = false;
    for(const url of imageCandidates){
      try{
        // eslint-disable-next-line no-await-in-loop
        await this.drawImageBackground(url, pdfCanvas);
        drawn = true; break;
      }catch{ /* try next */ }
    }
    if(!drawn){
      try{
        const pdfjs = await this.ensurePdfjs();
        (pdfjs as any).GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.6.82/build/pdf.worker.min.js';
        const pdfPaths = [
          '/asset/th-record-sheet.pdf',
          '/asset/Temperature%20and%20Humidity%20Record%20Sheet.pdf'
        ];
        let ok = false;
        for(const p of pdfPaths){
          try{
            // eslint-disable-next-line no-await-in-loop
            const loadingTask = (pdfjs as any).getDocument(p);
            // eslint-disable-next-line no-await-in-loop
            const pdf = await loadingTask.promise; ok = true;
            const page = await pdf.getPage(1);
            const viewport = page.getViewport({ scale: width / page.getViewport({ scale: 1 }).width });
            const ctx = this.pdfCtx!;
            await page.render({ canvasContext: ctx as any, viewport }).promise;
            break;
          }catch{ /* try next */ }
        }
        if(!ok) throw new Error('no pdf');
      }catch{
        const ctx = this.pdfCtx!; ctx.fillStyle = '#f1f5f9'; ctx.fillRect(0,0,pdfCanvas.width,pdfCanvas.height);
        ctx.fillStyle = '#64748b'; ctx.fillText('양식 배경을 찾을 수 없습니다. /forms/th-record-sheet.png 또는 /asset/th-record-sheet.pdf 를 배치하세요.', 20, 30);
      }
    }
    // Clear drawing layer for new week
    this.clearCanvas(false);
  }

  onPointerDown(ev: PointerEvent){
    if (!this.drawCanvasRef) return;
    const canvas = this.drawCanvasRef.nativeElement; this.drawing = true; canvas.setPointerCapture(ev.pointerId);
    const {x,y} = this.localPoint(canvas, ev);
    this.closeToolMenus();
    if (this.tool()==='eraser' && this.ctxDraw){
      const w = this.eraserWidth();
      this.ctxDraw.save();
      this.ctxDraw.globalCompositeOperation = 'destination-out';
      this.ctxDraw.lineWidth = w; this.ctxDraw.strokeStyle = 'rgba(0,0,0,1)';
      this.currentStroke = { points:[{x,y}], width: w, color: 'eraser' } as any;
    } else {
      if (this.ctxDraw){ this.ctxDraw.globalCompositeOperation = 'source-over'; this.ctxDraw.lineWidth = this.penWidth(); this.ctxDraw.strokeStyle = this.penColor(); }
      this.currentStroke = { points:[{x,y}], width: this.ctxDraw?.lineWidth||3, color: this.ctxDraw?.strokeStyle as string || '#111827' };
    }
  }
  onPointerMove(ev: PointerEvent){ if(!this.drawing || !this.drawCanvasRef || !this.ctxDraw || !this.currentStroke) return; const canvas=this.drawCanvasRef.nativeElement; const {x,y}=this.localPoint(canvas,ev); const pts=this.currentStroke.points; const last=pts[pts.length-1]; if(Math.hypot(x-last.x,y-last.y)<0.8) return; pts.push({x,y}); this.ctxDraw.beginPath(); this.ctxDraw.moveTo(last.x,last.y); this.ctxDraw.lineTo(x,y); this.ctxDraw.stroke(); }
  onPointerUp(){ if(!this.drawing) return; this.drawing=false; if(this.currentStroke){ if(this.ctxDraw){ this.ctxDraw.restore?.(); } const key=this.dateValue(); if(!this.strokesByDate[key]) this.strokesByDate[key]=[]; this.strokesByDate[key].push(this.currentStroke); this.currentStroke=null; } }
  private localPoint(canvas: HTMLCanvasElement, ev: PointerEvent){ const rect = canvas.getBoundingClientRect(); return { x: (ev.clientX - rect.left) * (canvas.width/rect.width), y: (ev.clientY - rect.top) * (canvas.height/rect.height) }; }

  clearCanvas(resetStrokes: boolean = true){ if(this.ctxDraw && this.drawCanvasRef){ this.ctxDraw.clearRect(0,0,this.drawCanvasRef.nativeElement.width,this.drawCanvasRef.nativeElement.height); } if(resetStrokes){ this.strokesByDate[this.dateValue()] = []; } }

  // 지우기: 오늘 날짜의 스트로크만 제거하고 이전 누적은 유지(주/월 단위 대비)
  clearToday(){ this.clearCanvas(true); }

  async saveRecord(){
    const ymd = this.periodStart();
    try{
      // Double-confirm if a record already exists for this date
      const chk = await this.supabase.getThRecord(this.selected()!.id, ymd);
      if (chk.data) {
        const first = globalThis.confirm('해당 날짜에 기존 기록이 있습니다. 덮어쓰시겠습니까?');
        if (!first) return;
        const second = globalThis.confirm('정말로 덮어쓰기 하시겠습니까? 이 작업은 되돌릴 수 없습니다.');
        if (!second) return;
      }

      const merged = document.createElement('canvas');
      const pdfC = this.pdfCanvasRef!.nativeElement; const drawC = this.drawCanvasRef!.nativeElement;
      merged.width = pdfC.width; merged.height = pdfC.height; const mctx = merged.getContext('2d')!;
      mctx.drawImage(pdfC, 0, 0); mctx.drawImage(drawC, 0, 0);
      const blob: Blob = await new Promise(res=> merged.toBlob(b=>res(b!), 'image/png'));
      const path = `th/${ymd}.png`;
      let publicUrl: string | null = null;
      try{
        const up = await this.supabase.uploadRecordImage(blob, path);
        publicUrl = up.publicUrl;
      }catch(err:any){
        // Storage 업로드가 실패해도 DB에는 필기(strokes)만 저장되도록 진행합니다.
      }
      // If we loaded legacy array-only strokes and 사용자가 새로 그린 게 없으면 보존을 위해 현재 날짜 키에 넣어 저장
      if (this.legacyStrokes && Object.keys(this.strokesByDate).length === 0){
        this.strokesByDate[this.dateValue()] = this.legacyStrokes;
      }
      await this.supabase.upsertThRecord({ form_id: this.selected()!.id, week_start: ymd, image_url: publicUrl, strokes: this.strokesByDate });
      // 성공 토스트: 기본 alert 제거
    }catch(e){ console.error(e); alert('저장 실패'); }
  }

  async loadRecord(){
    try{
      const ymd = this.periodStart();
      const { data } = await this.supabase.getThRecord(this.selected()!.id, ymd);
      if(data?.strokes){
        const raw = data.strokes as any;
        // Backward-compat: older 데이터는 배열(strokes[])로 저장됨
        if (Array.isArray(raw)){
          this.legacyStrokes = raw as any;
          this.strokesByDate = {};
        } else {
          this.legacyStrokes = null;
          this.strokesByDate = raw || {};
        }
        this.redrawFromMap();
      } else {
        this.strokesByDate = {};
        this.legacyStrokes = null;
        this.clearCanvas(true);
      }
      // 기록이 없으면 아무 메시지도 표시하지 않고 빈 양식을 유지합니다.
    }catch{ /* Silent fail; keep current canvas */ }
  }

  private redrawFromMap(){
    if(!this.ctxDraw || !this.drawCanvasRef) return; this.clearCanvas(false);
    const start = new Date(this.periodStart());
    const end = new Date(this.dateValue());
    const gather: { points:{x:number;y:number;}[]; width:number; color:string; }[] = [];
    const pushDay = (d: Date)=>{
      const key = d.toISOString().slice(0,10);
      const arr = this.strokesByDate[key] || [];
      for(const s of arr){ gather.push(s); }
    };
    if(this.granularity()==='day'){
      pushDay(end);
    } else if(this.granularity()==='week' || this.granularity()==='month'){
      const cur = new Date(start);
      while(cur <= end){ pushDay(cur); cur.setDate(cur.getDate()+1); }
    }
    // If legacy array-only strokes exist, 주간/월간 어디서든 표시되도록 누적에 포함
    if (this.legacyStrokes){ for(const s of this.legacyStrokes){ gather.push(s); } }
    for(const s of gather){ this.ctxDraw!.strokeStyle = s.color; this.ctxDraw!.lineWidth = s.width; const pts=s.points; for(let i=1;i<pts.length;i++){ this.ctxDraw!.beginPath(); this.ctxDraw!.moveTo(pts[i-1].x, pts[i-1].y); this.ctxDraw!.lineTo(pts[i].x, pts[i].y); this.ctxDraw!.stroke(); } }
  }

  printRecord(){
    const merged = document.createElement('canvas'); const pdfC = this.pdfCanvasRef!.nativeElement; const drawC = this.drawCanvasRef!.nativeElement; merged.width=pdfC.width; merged.height=pdfC.height; const mctx=merged.getContext('2d')!; mctx.drawImage(pdfC,0,0); mctx.drawImage(drawC,0,0);
    const url = merged.toDataURL('image/png'); const w = window.open('', '_blank'); if(!w) return; w.document.write(`<img src="${url}" style="width:100%" onload="window.print(); window.onafterprint=window.close;" />`);
  }

  toggleFullscreen(){
    const on = !this.fullscreen(); this.fullscreen.set(on);
    const el = this.containerRef?.nativeElement; if(!el) return;
    if(on){
      el.requestFullscreen?.();
      // iOS PWA/Safari 대안: 그냥 화면을 fixed로 만들어 유사 전체화면
      document.body.style.overflow = 'hidden';
    }else{
      document.exitFullscreen?.();
      document.body.style.overflow = '';
    }
    // 크기 다시 계산
    setTimeout(()=> this.renderPdf(), 50);
  }
  private async drawImageBackground(url: string, canvas: HTMLCanvasElement){
    const img = new Image();
    img.crossOrigin = 'anonymous';
    await new Promise<void>((resolve, reject)=>{ img.onload=()=>resolve(); img.onerror=()=>reject(); img.src=url; });
    const ctx = this.pdfCtx!; ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  }

  private static async imageExists(url: string){
    try{ const res = await fetch(url, { method: 'HEAD' }); return res.ok; } catch { return false; }
  }

  private loadScript(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = url;
      s.async = true;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error('script load failed'));
      document.head.appendChild(s);
    });
  }

  private async ensurePdfjs(): Promise<any> {
    const g: any = globalThis as any;
    if (g.pdfjsLib) return g.pdfjsLib;
    await this.loadScript('https://cdn.jsdelivr.net/npm/pdfjs-dist@4.6.82/build/pdf.min.js');
    return g.pdfjsLib;
  }
}
