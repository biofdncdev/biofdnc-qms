import { Component, HostListener, ViewChild, ElementRef, signal, ChangeDetectionStrategy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { TabService } from '../../../services/tab.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../../services/supabase.service';
import { RMD_FORM_CATEGORIES, RmdFormItem } from '../../../record/rmd-forms/rmd-forms-data';
import { RMD_STANDARDS } from '../../../standard/rmd/rmd-standards';
import * as XLSX from 'xlsx';

interface AuditItem { id: number; titleKo: string; titleEn: string; done: boolean; status: 'pending'|'on-hold'|'na'|'impossible'|'in-progress'|'done'; note: string; departments: string[]; companies?: string[]; comments?: Array<{ user: string; time: string; text: string; ownerTag?: boolean }>; owners?: string[]; company?: string | null; doneBy?: string; doneAt?: string; col1Text?: string; col3Text?: string; selectedLinks?: Array<{ id: string; title: string; kind: 'record'|'standard' }>; __h1?: number; __h3?: number; }
interface ResourceItem { id?: string; number?: number; name: string; type?: string; url?: string | null; file_url?: string | null; done?: boolean; }
interface AuditDate { value: string; label: string; }

@Component({
  selector: 'app-audit-evaluation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
  <div class="audit-page">
    <header class="audit-header">
      <div class="title">Audit <small class="sub">평가 항목</small></div>
      <div class="controls">
        <label>Audit Date</label>
        <input class="date-input" type="date" [ngModel]="selectedDate()" (ngModelChange)="setDate($event)" />
        <button class="btn" (click)="setToday()">오늘</button>
        <button class="btn info" [disabled]="saving() || isDateCreated()" (click)="onCreateClick()">{{ saving() ? '생성중...' : '생성' }} <span *ngIf="saving()" class="spinner inline" style="margin-left:6px"></span></button>
        <span class="created-note" *ngIf="isDateCreated()">생성됨: {{ createdDateOnly() }}
          <button class="btn mini danger" style="margin-left:6px" (click)="confirmDeleteDate()" [disabled]="deleting()">{{ deleting() ? '삭제중...' : '삭제' }} <span *ngIf="deleting()" class="spinner inline" style="margin-left:4px"></span></button>
        </span>
        <div class="saved-wrap">
          <label>저장된 날짜</label>
          <button class="btn dropdown" (click)="toggleSavedOpen($event)">{{ savedSelectedDate || (savedDates[0] || '날짜 선택') }}</button>
          <div class="saved-menu" *ngIf="savedOpen" (click)="$event.stopPropagation()">
            <div class="saved-item" *ngFor="let d of savedDates" (click)="selectSavedDate(d)">{{ d }}</div>
            <div class="saved-empty" *ngIf="!savedDates?.length">저장된 날짜가 없습니다</div>
          </div>
        </div>
        <button class="btn success" (click)="loadFromSaved()" [disabled]="loadingSaved()">불러오기</button>
        <span *ngIf="loadingSaved()" class="spinner inline" title="불러오는 중…"></span>
        <button class="btn" title="복사" (click)="openCopyModal()">복사</button>
      </div>
    </header>

    <div class="layout">
      <!-- Detached sticky filter header -->
      <div class="filters">
        <div class="filterbar">
          <label>키워드</label>
          <input #kwInput class="kw-input" type="text" [(ngModel)]="keyword" (ngModelChange)="onFilterChange()" placeholder="제목/비고/입력/링크/댓글 검색" />
          <label style="margin-left:12px">업체</label>
          <select class="dept-select" [(ngModel)]="companyFilter" (ngModelChange)="onCompanyFilterChange($event)">
            <option [ngValue]="'ALL'">전체</option>
            <option *ngFor="let c of companies" [ngValue]="c">{{ c }}</option>
          </select>
          <label style="margin-left:12px">부서</label>
          <select class="dept-select" [(ngModel)]="filterDept" (ngModelChange)="onFilterChange()">
            <option [ngValue]="'ALL'">전체</option>
            <option *ngFor="let d of departments" [ngValue]="d">{{ d }}</option>
          </select>
          <label style="margin-left:12px">담당자</label>
          <select class="dept-select" [(ngModel)]="filterOwner" (ngModelChange)="onFilterChange()">
            <option [ngValue]="'ALL'">전체</option>
            <option *ngFor="let u of userOptions" [ngValue]="u">{{ u }}</option>
          </select>
        </div>
      </div>
      <section class="checklist" #listRef>
        <div class="group">
          <div class="item" *ngFor="let it of visibleItems(); trackBy: trackByItem" [class.open]="isOpen(it)" [class.selected]="openItemId===it.id" (click)="selectItem(it)" [attr.data-id]="it.id" (mouseenter)="hoverItemId=it.id" (mouseleave)="hoverItemId=null">
            <div class="id">{{ it.id | number:'2.0-0' }}</div>
            <div class="text">
              <div class="ko">{{ it.titleKo }}</div>
              <div class="en">{{ it.titleEn }}</div>
            </div>
            <div class="state">
              <select class="status-select" [(ngModel)]="it.status" (ngModelChange)="saveProgress(it)" (change)="saveProgress(it)" [ngClass]="statusClass(it.status)" [ngStyle]="statusStyle(it.status)" (blur)="saveProgress(it)" (click)="$event.stopPropagation()">
                <option *ngFor="let s of statusOptions" [value]="s.value">{{ s.emoji }} {{ s.label }}</option>
              </select>
              <!-- 2열 상단: 협력업체 선택 -->
              <select class="status-select after-status pill" [(ngModel)]="it.company" (ngModelChange)="saveProgress(it)" (blur)="saveProgress(it)" title="업체 선택" (click)="$event.stopPropagation()">
                <option *ngFor="let c of companies" [ngValue]="c">{{ c }}</option>
              </select>
              <!-- 3열 상단: 저장됨 -->
              <span class="save-badge saved saved-inline" *ngIf="rowSaving[it.id]==='saved'">저장됨</span>
              <!-- 4열 상단: 비고 입력 (상단 행만, 줄바꿈 가능) -->
              <textarea class="note-input" [(ngModel)]="it.note" placeholder="비고" spellcheck="false" (ngModelChange)="onNoteModelChange(it)" (input)="autoResize($event)" (change)="saveProgress(it)" (blur)="saveProgress(it)"></textarea>

              <!-- 2열 하단: 칩 영역(업체/부서 표시) -->
              <div class="col2-bottom">
                <div class="chips companies" *ngIf="it.companies?.length">
                  <span class="chip" *ngFor="let c of it.companies; trackBy: trackByValue">{{ c }}
                    <button class="remove" (click)="removeCompany(it, c); $event.stopPropagation()">×</button>
                  </span>
                </div>
                <div class="chips depts" *ngIf="it.departments?.length">
                  <span class="chip" *ngFor="let d of it.departments; trackBy: trackByValue" [ngClass]="teamClass(d)">{{ displayDeptName(d) }}
                    <button class="remove" (click)="removeDept(it, d); $event.stopPropagation()">×</button>
                  </span>
                </div>
              </div>
              <select class="dept-select" [ngModel]="''" (ngModelChange)="addDept(it, $event)" (blur)="saveProgress(it)" title="담당 부서 추가" (click)="$event.stopPropagation()">
                <option value="" disabled>담당 부서 추가</option>
                <option *ngFor="let d of departments" [value]="d" [disabled]="it.departments.includes(d)">{{ d }}</option>
              </select>
              <span class="save-badge saved-inline" *ngIf="rowSaving[it.id]==='saving'"><span class="spinner inline"></span></span>
              
              <!-- 3열 하단: 담당자 추가 -->
              <select class="dept-select owner-select" [ngModel]="''" (ngModelChange)="addOwner(it, $event)" (blur)="saveProgress(it)" title="담당자 추가" (click)="$event.stopPropagation()">
                <option value="" disabled>담당자 추가</option>
                <option *ngFor="let u of userOptions" [value]="u" [disabled]="(it.owners||[]).includes(u)">{{ u }}</option>
              </select>
              <!-- 4열 하단: 담당자 칩 -->
              <div class="chips owners" *ngIf="it.owners?.length">
                <span class="chip" *ngFor="let u of it.owners; trackBy: trackByValue">{{ u }}
                  <button class="remove" (click)="removeOwner(it, u); $event.stopPropagation()">×</button>
                </span>
              </div>
              <button type="button" class="toggle-chevron chevron-inline" (click)="toggleExtra(it); $event.stopPropagation()" title="열기/닫기"></button>
              
            </div>
            <div class="details" *ngIf="isOpen(it)" (click)="$event.stopPropagation()">
              <div class="details-inner comments-on">
                <div class="assessment" *ngIf="false"></div>
                <!-- 1열 1행: 상태 select 대신 입력창으로 변경 (그리드 셀 가득 채움) -->
                <textarea class="status-select slide-input" style="grid-row:1; grid-column:1; width:100%;" [attr.id]="'input-'+it.id+'-1'" [attr.data-col]="1" [style.height.px]="it.__h1 || 120" rows="5" spellcheck="false" [(ngModel)]="it.col1Text" (input)="autoResize($event, it, '__h1')" (blur)="saveProgress(it)" placeholder="평가 항목 세부 사항" (keydown)="onTextareaKeydown($event, it)"></textarea>
                <div class="link-cell" style="grid-row:1; grid-column:2; display:flex; flex-direction:column; gap:6px; width:100%;">
                  <button class="btn mini pick-btn" style="align-self:flex-start; margin:4px 0;" (click)="openRecordPicker(it)">규정/기록 선택</button>
                  <div class="link-list" style="display:flex; flex-direction:column; gap:6px; width:100%;"
                       (dragover)="onLinkListDragOver($event, it)" (drop)="onLinkListDrop($event, it)">
                    <button *ngFor="let l of (it.selectedLinks||[]); let i = index" class="link-button"
                            draggable="true"
                            [class.dragging]="linkDragItemId===it.id && linkDragIndex===i"
                            [class.drag-over]="linkDragItemId===it.id && linkDragOverIndex===i"
                            (dragstart)="onLinkDragStart($event, it, i)"
                            (dragover)="onLinkDragOver($event, it, i)"
                            (dragleave)="onLinkDragLeave($event, it, i)"
                            (drop)="onLinkDrop($event, it, i)"
                            (dragend)="onLinkDragEnd()"
                            (click)="openLinkPopup(l)">
                      <span class="text">{{ l.id }} · {{ l.title }}</span>
                      <span class="close-x" title="삭제" (click)="$event.stopPropagation(); removeSelectedLink(it, l)">×</span>
                    </button>
                    <div class="link-drop-end" *ngIf="(it.selectedLinks||[]).length"
                         [class.active]="linkDragItemId===it.id && linkDragOverIndex===(it.selectedLinks||[]).length"
                         (dragover)="onLinkDragOverEnd($event, it)" (drop)="onLinkDropEnd($event, it)"></div>
                  </div>
                </div>
                <!-- 3열 1행으로 이동 -->
                <textarea class="owner-select slide-input" style="grid-row:1; grid-column:3; width:100%;" [attr.id]="'input-'+it.id+'-3'" [attr.data-col]="3" [style.height.px]="it.__h3 || 120" rows="5" spellcheck="false" [(ngModel)]="it.col3Text" (input)="autoResize($event, it, '__h3')" (blur)="saveProgress(it)" placeholder="평가 항목 진행 현황" (keydown)="onTextareaKeydown($event, it)"></textarea>
                <div class="comments">
                  <div class="new">
                    <textarea [(ngModel)]="newComment[it.id]" id="comment-input-{{it.id}}" (keydown)="onCommentKeydown($event, it)" placeholder="댓글을 입력..." [disabled]="!isDateCreated()"></textarea>
                    <button class="btn" (click)="addComment(it)" [disabled]="!isDateCreated() || !(newComment[it.id]||'').trim()">추가</button>
                  </div>
                  <div class="list">
                    <div class="comment" *ngFor="let c of (it.comments||[]); let i = index; trackBy: trackByComment">
                      <button class="close-x" *ngIf="canDeleteComment(c)" (click)="$event.stopPropagation(); removeComment(it, i)" title="삭제">×</button>
                      <button class="edit-btn" *ngIf="canEditComment(c)" (click)="$event.stopPropagation(); startEditComment(it, i, c.text)" title="수정">✎</button>
                      <div class="meta">{{ c.user }} · {{ c.time }}</div>
                      <ng-container *ngIf="editingComment[it.id]===i; else viewCmt">
                        <textarea class="edit-area" [(ngModel)]="editCommentText[keyFor(it.id,i)]" (keydown)="onEditCommentKeydown($event, it, i)" spellcheck="false"></textarea>
                        <div class="edit-actions">
                          <button class="btn mini" (click)="saveEditComment(it, i)">저장</button>
                          <button class="btn mini" (click)="cancelEditComment(it, i)">취소</button>
                        </div>
                      </ng-container>
                      <ng-template #viewCmt>
                        <div class="text">{{ c.text }}</div>
                      </ng-template>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 우측 자료 패널 제거 -->
    </div>

    <div class="preview-backdrop" *ngIf="previewing" (click)="previewing=false">
      <div class="preview" (click)="$event.stopPropagation()">
        <header>
          <div class="name">{{ previewItem?.name }}</div>
          <button (click)="previewing=false">×</button>
        </header>
        <div class="body">
          <p>미리보기(Popup) 예시 콘텐츠입니다. 실제 연결은 규정/지시·기록서/사진 파일로 교체됩니다.</p>
        </div>
      </div>
    </div>
  </div>
  <div class="toast" *ngIf="toast">{{ toast }}</div>
  
  <!-- Record picker modal -->
  <div class="preview-backdrop" *ngIf="recordPickerOpen" (click)="closeRecordPicker()">
    <div class="preview draggable" #pickerRoot (click)="$event.stopPropagation()" (keydown)="onPickerKeydown($event)" tabindex="0">
      <header (mousedown)="startPickerDrag($event)">
        <div class="name">규정/기록 선택</div>
        <button (click)="closeRecordPicker()">×</button>
      </header>
      <div class="body" (keydown)="onPickerKeydown($event)">
        <div style="display:flex; gap:8px; align-items:center; margin-bottom:10px;">
          <input #pickerInput type="text" placeholder="규정/기록 (공백=AND)" [(ngModel)]="pickerQuery" (keydown)="onPickerKeydown($event); $event.stopPropagation()" style="flex:1; height:36px; border:1px solid #d1d5db; border-radius:10px; padding:6px 10px; background:rgba(255,255,255,.65); backdrop-filter: blur(6px);" />
        </div>
        <div class="picker-list" style="max-height:55vh; overflow:auto; border:1px solid #eee; border-radius:12px;">
          <div *ngFor="let r of pickerResults(); let i = index" (mouseenter)="hoverPickerIndex=i" (mouseleave)="hoverPickerIndex=-1" (click)="chooseRecord(r)" [class.active]="i===pickerIndex" [class.hovered]="i===hoverPickerIndex" [id]="'picker-item-'+i" class="picker-item" style="padding:10px 12px; cursor:pointer; display:flex; gap:12px; align-items:center;">
            <span style="font-family:monospace; font-size:12px; color:#475569; min-width:120px;">{{ r.id }}</span>
            <span style="font-weight:600;">{{ r.title }}</span>
            <span style="margin-left:auto; font-size:12px; color:#64748b;">{{ r.standardCategory || '-' }}</span>
          </div>
          <div *ngIf="!pickerResults().length" style="padding:12px; color:#94a3b8;">결과가 없습니다.</div>
        </div>
        <!-- 하단 닫기 버튼 제거 -->
      </div>
    </div>
  </div>

  <!-- Link detail popup -->
  <div class="preview-backdrop" *ngIf="linkPopup" (click)="linkPopup=null">
    <div class="preview" (click)="$event.stopPropagation()">
      <header>
        <div class="name">{{ linkPopup.id }} · {{ linkPopup.title }}</div>
        <button (click)="linkPopup=null">×</button>
      </header>
      <div class="body">
        <p>세부 내용(미리보기) — 추후 실제 문서/페이지로 연결 가능합니다.</p>
      </div>
    </div>
  </div>

  <!-- Copy modal -->
  <div class="preview-backdrop" *ngIf="copying" (click)="onCopyBackdropClick()" [class.active]="copying">
    <div class="preview copy-modal" #copyModalRoot tabindex="0" (click)="$event.stopPropagation()">
      <header>
        <div class="name">다른 날짜에서 복사</div>
        <button (click)="onCopyCloseClick()">×</button>
      </header>
      <div class="body">
        <div class="busy" *ngIf="copyingBusy()"><span class="spinner"></span> 복사중…</div>
        <div class="busy ok" *ngIf="!copyingBusy() && copyJustFinished()"><span class="dot ok"></span> 복사 완료</div>
        <div class="form">
          <div class="form-row">
            <label class="lbl">복사할 날짜 선택</label>
            <select [(ngModel)]="copyFromDate" class="date-select" [disabled]="copyingBusy()">
              <option *ngFor="let d of savedDates" [ngValue]="d">{{ d }}</option>
            </select>
          </div>
          <div class="hint">선택한 날짜의 모든 항목을 현재 Audit Date로 복사합니다.</div>
          <div class="actions">
            <button class="btn" (click)="onCopyCloseClick()">취소</button>
            <button class="btn primary" (click)="confirmCopy()" [disabled]="copyingBusy()">{{ copyingBusy() ? '복사중…' : '복사' }}</button>
          </div>
        </div>
      </div>
    </div>
  </div>
  `,
  styles: [`
    /* Viewport-fitting container: reserve space for global headers/footers (~100px) */
    .audit-page{ padding:16px; height:calc(100vh - 100px); overflow:hidden; box-sizing:border-box; display:flex; flex-direction:column; }
    .audit-header{ display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; }
    .title{ font-weight:800; font-size:20px; }
    .title .sub{ font-weight:500; color:#64748b; margin-left:6px; font-size:.85em; }
    .controls{ display:flex; align-items:center; gap:8px; position:relative; }
    .controls select, .controls input[type='date']{ padding:8px 10px; border-radius:10px; border:1px solid #d1d5db; font-family: var(--font-sans-kr); font-size:13.5px; height:36px; box-sizing:border-box; }
    .controls .date-input{ font-weight:400; }
    .controls .btn{ font-weight:400; }
    /* Disabled state for create button: clear hover and show gray */
    .controls .btn:disabled{ background:#e5e7eb !important; color:#9ca3af !important; border-color:#e5e7eb !important; cursor:not-allowed; box-shadow:none; }
    .controls .btn.info:disabled{ background:#e5e7eb !important; color:#9ca3af !important; border-color:#e5e7eb !important; }
    .controls .btn:disabled:hover{ filter:none; }

    .layout{ display:grid; grid-template-rows: auto 1fr; gap:8px; height:100%; min-height:0; }
    .filters{ position:sticky; top:0; z-index:8; background:#fff; }
    .checklist{ min-width:0; }

    .checklist{ background:#fff; border:1px solid #eee; border-radius:12px; padding:10px; height: 100%; min-height:0; overflow-y:auto; overflow-x:auto; box-shadow:0 8px 22px rgba(2,6,23,.06); }
    .group h3{ margin:8px 6px 12px; }
    .filterbar{ display:flex; align-items:center; gap:10px; margin:0; padding:8px 10px; flex-wrap:wrap; background:#fff; border:1px solid #e5e7eb; border-radius:12px; box-shadow:0 4px 10px rgba(2,6,23,.04); transition: filter .15s ease; }
    .audit-page.modal-open .filterbar{ filter: grayscale(1) brightness(.92); }
    .kw-input{ width:220px; height:32px; border:1px solid #d1d5db; border-radius:10px; padding:6px 10px; font-family: var(--font-sans-kr); font-size:13.5px; }
    .item{ display:grid; grid-template-columns: 54px 1fr 1.6fr; gap:12px; padding:10px; border-radius:10px; border:1px solid #f1f5f9; margin:8px; background:linear-gradient(180deg,rgba(241,245,249,.35),rgba(255,255,255,1)); position:relative; align-items:start; min-width:0; transition: box-shadow .18s ease, transform .18s ease; }
    .item.selected{ box-shadow: 0 10px 28px rgba(2,6,23,.10), inset 0 0 0 1px rgba(99,102,241,.22); transform: translateZ(0); }
    .item.selected::after{ content:''; position:absolute; left:8px; right:8px; bottom:-2px; height:4px; border-radius:999px; background:linear-gradient(90deg,rgba(99,102,241,.22),rgba(99,102,241,.08)); }
    .id{ font-weight:500; color:#cbd5e1; opacity:.6; display:flex; align-items:center; justify-content:center; }
    .ko{ font-weight:600; margin-bottom:2px; }
    .en{ color:#64748b; font-size:.92em; }
    /* 4열 x 2행 레이아웃 */
    .state{ display:grid; grid-template-columns: 20% 20% 12% calc(48% - 36px); grid-template-rows:auto auto; align-items:start; column-gap:12px; row-gap:8px; min-width:0; }
    /* 1열: 상태(상단), 부서 추가(하단) */
    .state .status-select{ grid-row:1; grid-column:1; }
    /* 1열 2행: 부서 추가 버튼 (owner-select 제외) */
    .state .dept-select:not(.owner-select){ grid-row:2; grid-column:1; justify-self:start; }
    /* 2열: 상단 업체 선택, 하단 기존 칩 묶음 */
    .state .after-status{ grid-row:1; grid-column:2; justify-self:start; width:100%; }
    .col2-bottom{ grid-row:2; grid-column:2; display:flex; flex-direction:column; gap:6px; }
    .company-tag-select{ width:220px; }
    /* 3열: 상단 저장됨, 하단 담당자 추가 */
    .saved-inline{ grid-row:1; grid-column:3; justify-self:start; align-self:center; }
    /* 3열 2행: 담당자 추가 버튼 */
    .state .owner-select{ grid-row:2; grid-column:3; width:220px; }
    /* 4열: 상단 비고, 하단 담당자 칩 */
    /* 비고: 버튼과 동일 높이(약 32px) */
    .note-input{ grid-row:1; grid-column:4; align-self:stretch; height:32px; min-height:32px; border:1px solid #e5e7eb; border-radius:12px; padding:6px 10px; font-size:13px; box-sizing:border-box; resize:none; white-space:pre-wrap; overflow-y:hidden; }
    .chips.owners{ grid-row:2; grid-column:4; }
    /* 기존 칩 정렬 */
    .state .chips{ margin-top:0; min-height:32px; display:flex; align-items:center; justify-content:flex-start; }
    .state .meta{ color:#475569; font-size:.85em; }
    .status-swatch{ width:12px; height:12px; border-radius:50%; border:2px solid #fff; box-shadow:0 0 0 1px #e5e7eb; }
    select{ padding:6px 8px; border:1px solid #d1d5db; border-radius:10px; appearance:none; -webkit-appearance:none; -moz-appearance:none; font-family: var(--font-sans-kr); font-size:13.5px; }
    .status-select, .dept-select{ width: 150px; max-width: 100%; }
    .pill{ display:inline-flex; align-items:center; height:32px; padding:0 10px; border-radius:999px; border:1px solid #e5e7eb; font-size:12px; }
    .pill.company-giv{ background:#ecfdf5; border-color:#bbf7d0; color:#065f46; }
    .pill.company-amo{ background:#e0f2fe; border-color:#93c5fd; color:#0c4a6e; }
    /* 상태별 색상 (진행중=초록, 보류=주황, 해당없음=회색) */
    .state select.status-pending{ background:#fff7ed; border-color:#f59e0b; color:#92400e; }
    .state select.status-in-progress{ background:#ecfdf5; border-color:#10b981; color:#065f46; }
    .state select.status-on-hold{ background:#fff7ed; border-color:#fb923c; color:#9a3412; }
    .state select.status-na{ background:#f1f5f9; border-color:#cbd5e1; color:#334155; }
    /* 불가 색상을 해당없음과 동일 계열로 변경 */
    .state select.status-impossible{ background:#f1f5f9; border-color:#cbd5e1; color:#334155; }
    .state select.status-done{ background:#dbeafe; border-color:#3b82f6; color:#1e40af; }
    .save-badge{ margin-left:6px; font-size:.85em; color:#64748b; height:32px; display:inline-flex; align-items:center; }
    .save-badge.saved{ color:#16a34a; }
    .saved-inline{ margin-left:0; color:#16a34a; height:32px; display:inline-flex; align-items:center; }
    .toggle-chevron{ position:absolute; right:8px; bottom:6px; width:28px; height:20px; border:0; background:#f1f5f9; color:#64748b; cursor:pointer; border-radius:999px; display:flex; align-items:center; justify-content:center; }
    .chevron-inline{ position:static; margin-left:auto; grid-row:2; grid-column:4; align-self:end; justify-self:end; display:flex; align-items:center; justify-content:center; width:28px; height:20px; background:#f1f5f9; border-radius:999px; }
    .toggle-chevron::before{ content: "▼"; font-size:14px; line-height:16px; display:block; }
    .item.open .toggle-chevron::before{ content: "▲"; }
    textarea{ width:100%; max-width: none; border:1px solid #e5e7eb; border-radius:10px; padding:8px; resize:vertical; }
    .note textarea{ width: min(500px, 100%); max-width:100%; box-sizing:border-box; }

    .item .details{ grid-column: 1 / -1; overflow:hidden; }
    .item.open .details{ animation: slideDown .22s ease-out; }
    .details-inner{ display:grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap:16px; padding:10px 6px 12px; }
    .details-inner.comments-on{ grid-template-columns: repeat(4, minmax(0, 1fr)); }
    .comments{ background:#fff; border:1px solid #e5e7eb; border-radius:12px; padding:10px; display:flex; flex-direction:column; gap:10px; grid-column:4; box-sizing:border-box; max-width:100%; overflow:auto; }
    .comments .new{ display:flex; gap:8px; }
    .comments .new textarea{ flex:1; resize:vertical; min-height:64px; }
    .comments .list{ display:flex; flex-direction:column; gap:8px; max-height:300px; overflow:auto; }
    .comment{ border:1px solid #e5e7eb; border-radius:10px; padding:8px; background:#f9fafb; }
    .comment{ position:relative; }
    .comment .close-x{ position:absolute; top:6px; right:6px; width:20px; height:20px; border-radius:6px; border:1px solid #e5e7eb; background:#fff; color:#334155; cursor:pointer; display:flex; align-items:center; justify-content:center; line-height:1; }
    .comment .close-x:hover{ background:#fee2e2; border-color:#fecaca; color:#991b1b; }
    .comment .edit-btn{ position:absolute; top:6px; right:30px; width:20px; height:20px; border-radius:6px; border:1px solid #e5e7eb; background:#fff; color:#334155; cursor:pointer; display:flex; align-items:center; justify-content:center; line-height:1; }
    .comment .edit-btn:hover{ background:#eef2ff; border-color:#c7d2fe; color:#3730a3; }
    .comment .meta{ color:#6b7280; font-size:11px; margin-bottom:6px; }
    .comment .edit-area{ width:100%; min-height:64px; border:1px solid #d1d5db; border-radius:8px; padding:6px; resize:vertical; }
    .comment .edit-actions{ display:flex; gap:6px; margin-top:6px; }
    @media (max-width: 1200px){ .details-inner{ grid-template-columns: 1fr; } }
    .slide-input{ resize:none; overflow:hidden; white-space:pre-wrap; line-height:1.4; font-weight:400; border:1px solid #e5e7eb; border-radius:8px; padding:8px; font-family: var(--font-sans-kr); }
    /* slide inputs already placed via inline grid-row/column overrides */
    .assessment .row{ display:flex; gap:10px; margin:4px 0; }
    .assessment .q{ margin-top:8px; font-weight:600; }
    .assessment .t{ color:#475569; margin:6px 0; }
    .assessment .acc{ background:#f8fafc; border:1px dashed #e2e8f0; border-radius:8px; padding:8px; }
    .assign select{ min-height: 100px; }
    .chips{ margin-top:8px; display:flex; flex-wrap:wrap; gap:8px; }
    .chip{ background:#f8fafc; color:#334155; padding:0 8px; height:32px; border-radius:999px; font-weight:600; font-size:.82em; display:inline-flex; align-items:center; gap:4px; border:1px solid #e2e8f0; transition: background-color .15s ease, border-color .15s ease, color .15s ease; }
    .chip:hover{ border-color:#cbd5e1; }
    .chip .remove{ background:transparent; border:0; color:inherit; cursor:pointer; line-height:1; padding:0 2px; border-radius:8px; }
    .chip .remove:hover{ background:#e2e8f0; }
    .chip.team-rmd{ background:#e0f2fe; color:#075985; border-color:#bae6fd; } /* 원료제조팀: Sky */
    .chip.team-cell{ background:#dcfce7; color:#047857; border-color:#bbf7d0; } /* 식물세포배양팀: Emerald */
    .chip.team-qc{ background:#cffafe; color:#155e75; border-color:#a5f3fc; } /* 품질팀: Cyan */
    .chip.team-rnd{ background:#ede9fe; color:#6d28d9; border-color:#ddd6fe; } /* 연구팀: Violet */
    .chip.team-admin{ background:#fef3c7; color:#b45309; border-color:#fde68a; } /* 경영지원팀: Amber */
    .chip.team-logi{ background:#cff7e6; color:#0f766e; border-color:#99f6e4; } /* 물류팀: Teal */
    /* 내부 resources 편집 섹션 제거로 관련 스타일 삭제 */

    .link-button{ width:100%; text-align:left; padding:8px 10px; border-radius:10px; border:1px solid #e5e7eb; background:#ffffff; font-weight:600; color:#0f172a; display:flex; align-items:center; justify-content:space-between; }
    .link-button .text{ font-weight:600; opacity:.9; }
    .link-button .close-x{ font-weight:700; font-size:14px; color:#64748b; padding:0 6px; }
    .link-button:hover{ background:#f8fafc; }
    /* Drag styles for link chips */
    .link-button.dragging{ opacity:.5; }
    .link-button.drag-over{ box-shadow: inset 0 0 0 2px #6366f1; border-color:#c7d2fe; }
    .link-drop-end{ height:8px; border-radius:6px; }
    .link-drop-end.active{ outline:2px dashed #6366f1; outline-offset:2px; }

    /* Picker highlight */
    .picker-item.hovered{ background:#f8fafc; box-shadow: inset 0 0 0 1px #e5e7eb, 0 2px 8px rgba(59,130,246,.12); border-radius:10px; transition: box-shadow .15s ease, background .15s ease; }
    .picker-item.active{ background:#eef2ff; box-shadow: inset 0 0 0 2px #6366f1, 0 4px 12px rgba(99,102,241,.18); border-radius:12px; transition: box-shadow .15s ease, background .15s ease; }

    @keyframes slideDown { from{ opacity:0; transform: translateY(-6px); } to{ opacity:1; transform:none; } }

    .checkbox{ display:inline-flex; align-items:center; gap:6px; cursor:pointer; }
    .checkbox input{ display:none; }
    .checkbox .box{ width:22px; height:22px; border-radius:6px; background:#0f172a; display:inline-flex; align-items:center; justify-content:center; }
    .checkbox .tick{ color:#22c55e; font-weight:800; font-size:14px; line-height:1; }
    .checkbox.small .box{ width:18px; height:18px; }
    .checkbox.small .tick{ font-size:12px; }

    .resources{ background:#fff; border:1px solid #eee; border-radius:16px; padding:16px; box-shadow:0 10px 24px rgba(2,6,23,.06); height: calc(100vh - 160px); overflow:auto; width:100%; box-sizing:border-box; }
    .resources .sticky{ position:sticky; top:0; background:#fff; padding-bottom:8px; }
    .re-head{ display:flex; align-items:center; justify-content:space-between; }
    .re-head .add-btn{ padding:6px 10px; border-radius:999px; border:1px solid #e5e7eb; background:#ffffff; color:#0f172a; font-weight:600; font-size:12px; }
    .resource-card{ position:relative; border:1px solid #e5e7eb; border-radius:12px; padding:12px; margin:12px 6px; background:linear-gradient(180deg,#f8fafc,#ffffff); box-shadow:0 4px 14px rgba(2,6,23,.05); }
    .resource-card .col{ display:flex; flex-direction:column; gap:8px; }
    .resource-card .card-row{ display:flex; align-items:center; gap:8px; }
    .re-row{ display:flex; align-items:center; gap:8px; }
    .re-input{ width:100%; padding:6px 8px; border:1px solid #e5e7eb; border-radius:8px; box-sizing:border-box; }
    .re-text{ width:100%; padding:8px 10px; border:1px solid #e5e7eb; border-radius:8px; box-sizing:border-box; resize:none; overflow:hidden; }
    .card-controls{ position:absolute; top:-10px; right:-10px; display:flex; gap:6px; }
    .icon-btn{ width:22px; height:22px; border-radius:4px; border:1px solid #0f172a; background:#ffe9d5; color:#0f172a; font-size:13px; line-height:20px; transition: all .15s ease; }
    .icon-btn.check:hover{ border-color:#16a34a; color:#16a34a; }
    .icon-btn.check.on{ background:#16a34a; color:#fff; border-color:#16a34a; }
    .icon-btn.close:hover{ border-color:#ef4444; color:#ef4444; }
    .dropzone{ border:2px dashed #cbd5e1; border-radius:10px; padding:8px; text-align:center; color:#64748b; cursor:pointer; font-size:12px; transition: all .15s ease; }
    .dropzone.hover{ border-color:#22c55e; background:#f0fdf4; color:#16a34a; }
    .file-link{ color:#2563eb; text-decoration:underline; cursor:pointer; }
    .hint{ color:#64748b; margin:8px 0 0 4px; }
    .resource-card button{ padding:6px 10px; border-radius:8px; background:#2563eb; color:#fff; border:0; }

    /* Tablet: compress item row and make controls stack to avoid horizontal scroll */
    @media (max-width: 1100px){
      .item{ grid-template-columns: 48px 1fr; }
      .state{ grid-template-columns: 1fr; grid-template-rows: auto auto auto auto; }
      .state .status-select, .state .dept-select{ width: 100%; }
      .state .after-status{ grid-row:auto; grid-column:auto; justify-self:start; }
    }

    .preview-backdrop{ position:fixed; inset:0; background:rgba(2,6,23,.45); display:flex; align-items:center; justify-content:center; z-index:1000; }
    .preview{ width:min(880px,92vw); max-height:80vh; background:#fff; border-radius:16px; box-shadow:0 20px 60px rgba(0,0,0,.2); overflow:hidden; display:flex; flex-direction:column; }
    .preview.draggable{ will-change: transform; }
    .preview header{ display:flex; align-items:center; justify-content:space-between; padding:12px 14px; border-bottom:1px solid #eee; font-weight:700; }
    .preview .body{ padding:16px; overflow:auto; }
    .copy-modal .form{ display:flex; flex-direction:column; gap:12px; }
    .copy-modal .form-row{ display:flex; align-items:center; gap:10px; }
    .copy-modal .form-row .lbl{ width:120px; color:#475569; font-size:13px; }
    .copy-modal .date-select{ height:36px; border:1px solid #d1d5db; border-radius:10px; padding:6px 10px; font-family: var(--font-sans-kr); }
    .copy-modal .hint{ color:#6b7280; font-size:12px; }
    .copy-modal .actions{ display:flex; gap:8px; justify-content:flex-end; }
    .copy-modal .busy{ display:flex; align-items:center; gap:8px; color:#374151; font-size:13px; }
    .copy-modal .busy.ok{ color:#166534; }
    .copy-modal .dot.ok{ width:10px; height:10px; border-radius:50%; background:#22c55e; display:inline-block; }
    .spinner{ width:14px; height:14px; border-radius:50%; border:2px solid #cbd5e1; border-top-color:#3b82f6; animation:spin 1s linear infinite; }
    .spinner.inline{ width:16px; height:16px; border:2px solid #cbd5e1; border-top-color:#3b82f6; }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* Saved dates dropdown (search-result style) */
    .saved-wrap{ position:relative; display:flex; align-items:center; gap:8px; }
    .saved-wrap label{ color:#475569; font-size:12px; }
    .saved-wrap .dropdown{ background:#fff; border-color:#d1d5db; color:#0f172a; font-weight:400; height:36px; }
    .saved-menu{ position:absolute; top:36px; left:64px; min-width:180px; max-height:220px; overflow:auto; background:#fff; border:1px solid #e5e7eb; border-radius:12px; box-shadow:0 12px 28px rgba(2,6,23,.18); padding:6px; z-index:20; }
    .saved-item{ padding:8px 10px; border-radius:8px; cursor:pointer; font-size:13px; }
    .saved-item:hover{ background:#f1f5f9; }
    .saved-empty{ color:#94a3b8; padding:8px 6px; font-size:12px; }
    .created-note{ font-size:12px; color:#6b7280; margin-left:8px; }
    .toast{ position:fixed; top:12px; right:12px; background:#111827; color:#fff; padding:8px 12px; border-radius:10px; z-index:10000; font-size:12px; box-shadow:0 6px 16px rgba(0,0,0,.2); }

    /* Delete button to light orange */
    .btn.danger{ background:#fed7aa !important; border-color:#fed7aa !important; color:#7c2d12 !important; }
    .btn.danger:hover{ background:#fdba74 !important; border-color:#fdba74 !important; }
  `]
})
export class AuditEvaluationComponent {
  constructor(private supabase: SupabaseService, private router: Router, private tabBus: TabService){
    // Pre-hydrate UI from sessionStorage to avoid initial flicker on tab switching
    this.prehydrateFromSession();
    
    // Listen for route changes to handle navigation from Record page
    this.router.events.subscribe(async (event) => {
      if (event instanceof NavigationEnd) {
        // Check if we're on the audit page
        if (event.url.includes('/audit/')) {
          // Parse the URL for the open parameter
          try {
            const urlParts = event.url.split('?');
            if (urlParts.length > 1) {
              const params = new URLSearchParams(urlParts[1]);
              const openParam = params.get('open');
              if (openParam && openParam.trim()) {
                const open = Number(openParam);
                if (Number.isFinite(open) && open > 0 && open <= 214) {
                  this.pendingOpenId = open;
                  // Wait for items to be loaded if needed
                  if (this.items().length > 0) {
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

  private prehydrateFromSession(){
    try{
      const raw = sessionStorage.getItem('audit.eval.ui.v1');
      if (!raw) return;
      const s = JSON.parse(raw);
      if (s?.selectedDate) this.selectedDate.set(s.selectedDate);
      if (s?.companyFilter) this.companyFilter = s.companyFilter;
      if (s?.filterDept) this.filterDept = s.filterDept;
      if (s?.filterOwner) this.filterOwner = s.filterOwner;
      // items cache
      const d = s?.selectedDate;
      if (d){
        const cache = sessionStorage.getItem(`audit.eval.items.${d}`);
        if (cache){
          const rows = JSON.parse(cache);
          if (Array.isArray(rows) && rows.length){ this.items.set(rows as any); this.preHydrated = true; }
        }
      }
    }catch{}
  }
  userDisplay = '사용자';
  currentUserId: string | null = null;
  isAdmin = false;
  hover: boolean = false;
  resourceHover: boolean[] = [];
  companies: string[] = [];
  companyFilter: 'ALL' | string = 'ALL';
  @ViewChild('listRef') listRef?: ElementRef<HTMLDivElement>;
  // UI pre-hydration
  private preHydrated: boolean = false;
  uiHydrated: boolean = false;
  private initialScrollTop: number = 0;
  // pending target to open (from deep-link or record page)
  private pendingOpenId: number | null = null;
  async ngOnInit(){
    try{
      // Deep-link (?open=ID) or session flag from Record → remember target
      try{
        const params = new URLSearchParams(location.search);
        const openParam = params.get('open');
        if (openParam && openParam.trim()) {
          const open = Number(openParam);
          if (Number.isFinite(open) && open > 0 && open <= 214) {
            this.pendingOpenId = open;
          }
        }
      }catch{}
      try{
        const raw = sessionStorage.getItem('audit.eval.forceOpen');
        if (raw && !this.pendingOpenId){
          const n = Number(raw); 
          if (Number.isFinite(n) && n > 0 && n <= 214) {
            this.pendingOpenId = n;
          }
        }
        sessionStorage.removeItem('audit.eval.forceOpen');
        sessionStorage.removeItem('audit.eval.forceOpenTitle');
      }catch{}
      const u = await this.supabase.getCurrentUser();
      if(u){
        const { data } = await this.supabase.getUserProfile(u.id);
        this.userDisplay = data?.name || data?.email || '사용자';
        this.currentUserId = u.id;
        this.isAdmin = (data?.role === 'admin');
      }
      await this.loadSavedDates();
      // 기본 선택값: 가장 최근 저장일
      this.savedSelectedDate = this.savedDates?.[0] || null;
      // load audit companies for selects/filters
      try{ this.companies = (await this.supabase.listAuditCompanies()).map((r:any)=> r.name).filter(Boolean); }catch{}
      // Expose tab service bridge for child components (temporary)
      try{ (window as any).tabBus = (window as any).tabBus || new (class{ requestOpen(){}})(); }catch{}
      // 사용자 목록 로드 (담당자 선택/필터용)
      try{
        const { data: users } = await this.supabase.getClient().from('users').select('name,email').order('created_at', { ascending: false });
        this.userOptions = (users||[]).map((u:any)=> u?.name || u?.email).filter(Boolean);
      }catch{}
      // Restore persisted UI state if available (no flicker)
      try{
        const raw = sessionStorage.getItem('audit.eval.ui.v1');
        if (raw){
          const s = JSON.parse(raw);
          const openId: number | null = s?.openItemId ?? null;
          if (s?.selectedDate) this.selectedDate.set(s.selectedDate);
          if (s?.companyFilter) this.companyFilter = s.companyFilter;
          if (s?.filterDept) this.filterDept = s.filterDept;
          if (s?.filterOwner) this.filterOwner = s.filterOwner;
          const dateReady = !!this.selectedDate();
          if (!dateReady) { this.setToday(); }
          // 1) 즉시 화면 복원: 캐시에 저장된 items가 있으면 선반영
          const usedCache = this.hydrateFromCache();
          // 2) 백그라운드 최신화: 서버에서 최신값을 가져오되 UI는 막지 않음
          if (dateReady) {
            if (usedCache) { this.loadByDate(); } else { await this.loadByDate(); }
          }
          // 복귀 시 마지막 선택 항목도 함께 복원
          if (openId && Number.isFinite(openId as any)) { this.pendingOpenId = openId as any; }
          // Restore scroll after data renders (selection is handled by pending open)
          setTimeout(()=>{
            try{
              this.initialScrollTop = s.scrollTop || 0;
              if(this.listRef) this.listRef.nativeElement.scrollTop = this.initialScrollTop;
            }catch{}
          }, 0);
          this.uiHydrated = true;
        } else { this.setToday(); }
      }catch{ this.setToday(); }
      // JSON+해시 기반 반영은 세션당 1회만 수행하여 초기 렌더 지연을 줄임
      try{
        if (!sessionStorage.getItem('audit.eval.template.synced')){
          await this.applyTitlesFromJsonOrExcel();
          sessionStorage.setItem('audit.eval.template.synced', '1');
        } else {
          // 이미 동기화된 경우엔 백그라운드에서 가볍게 최신화
          this.applyTitlesFromJsonOrExcel();
        }
      }catch{}
      // 제목 최신화는 백그라운드로
      this.refreshTitlesFromDb();
      this.uiHydrated = true;
    }catch{}
  }

  private hydrateFromCache(): boolean{
    try{
      const d = this.selectedDate(); if(!d) return false;
      const cache = sessionStorage.getItem(`audit.eval.items.${d}`);
      if(!cache) return false;
      const rows = JSON.parse(cache);
      if (Array.isArray(rows) && rows.length){ this.items.set(rows as any); this.preHydrated = true; return true; }
      return false;
    }catch{ return false; }
  }

  private async applyTitlesFromJsonOrExcel(){
    // Try to read prebuilt JSON + hash; if JSON missing or excel changed, fallback to client parse
    try{
      // 1) Prefer CSV if present (authoritative)
      const csvRes = await fetch('/asset/Audit%20Evaluation%20Items.csv', { cache: 'no-store' });
      if (csvRes.ok){ await this.loadTitlesFromCsv(csvRes); return; }
      // 2) Fallback to JSON if CSV missing
      const jsonRes = await fetch('/audit-items.json', { cache: 'no-store' });
      if (jsonRes.ok){
        const items = await jsonRes.json();
        if (Array.isArray(items) && items.length){
          const updated = this.items().map((it:any) => {
            const row = items.find((r:any)=> Number(r.number)===Number(it.id));
            return row ? ({...it, titleKo: row.titleKo || it.titleKo, titleEn: row.titleEn || it.titleEn}) : it;
          });
          this.items.set(updated as any);
          try{ await this.supabase.upsertAuditItems(items); }catch{}
          return;
        }
      }
    }catch{}
    // Fallback: parse CSV directly in client if JSON is missing
    await this.loadTitlesFromCsv();
  }

  private async loadTitlesFromCsv(preFetched?: Response){
    try{
      const res = preFetched || await fetch('/asset/Audit%20Evaluation%20Items.csv', { cache: 'no-store' });
      if (!res.ok) return false as any;
      const buf = await res.arrayBuffer();
      // Robust CSV parsing via XLSX
      const wb = XLSX.read(buf, { type: 'array' });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const rows: any[] = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: true }) as any[];
      const cleaned = rows.filter(r => Array.isArray(r) && r.length >= 2);
      const updated = this.items().slice();
      const upserts: Array<{ number: number; titleKo: string; titleEn: string }>=[];
      for (const r of cleaned){
        const num = parseInt(String(r[0] ?? '').trim(), 10);
        if (!Number.isFinite(num)) continue;
        const titleKo = String(r[1] ?? '').trim();
        const titleEn = String(r[2] ?? '').trim();
        const companyRaw = String(r[3] ?? '').trim();
        if (companyRaw){
          if (updated[num-1]){ (updated[num-1] as any).company = companyRaw; }
        }
        upserts.push({ number: num, titleKo, titleEn });
        if (updated[num-1]){
          updated[num-1] = { ...updated[num-1], titleKo: titleKo || updated[num-1].titleKo, titleEn: titleEn || updated[num-1].titleEn } as any;
        }
      }
      // in-place로 제목만 갱신
      const curr = this.items();
      for (let i=0;i<curr.length;i++) curr[i] = updated[i] as any;
      this.items.set(curr as any);
      if (upserts.length){ try{ await this.supabase.upsertAuditItems(upserts); }catch{} }
      // 회사명도 함께 저장 (company는 audit_progress가 날짜별이라 items에는 보관하지 않음)
      // 화면 반영만 즉시 수행
      const curr2 = this.items();
      for (let i=0;i<curr2.length;i++) curr2[i] = updated[i] as any;
      this.items.set(curr2 as any);
      return true as any;
    }catch{ return false as any; }
  }

  private async loadTitlesFromExcel(){
    const candidates = ['/asset/Audit%20Evaluation%20Items.xlsx'];
    let buf: ArrayBuffer | null = null;
    for (const url of candidates){
      try{
        const res = await fetch(url, { cache: 'no-store' });
        console.info('[Audit] Try excel:', url, res.status);
        if (res.ok){ buf = await res.arrayBuffer(); break; }
      }catch(e){ console.warn('[Audit] Excel fetch failed:', url, e); }
    }
    if (!buf){
      console.warn('[Audit] Excel not found in candidates, using DB titles only');
      this.showToast('엑셀 파일을 찾지 못해 DB 제목으로 표시합니다');
      return false as any;
    }
    try{
      const wb = XLSX.read(buf, { type: 'array' });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const rows: any[] = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: true }) as any[];
      if (!Array.isArray(rows) || rows.length < 3) return false as any;
      // Grouping parse:
      // - Start from index 2 (Excel row 3) to skip cover/header rows
      // - New item begins when column C is non-empty
      // - titleKo = A + B + C of the first row of the group
      // - titleEn = concat of D+E across the group rows until next C appears
      const startIndex = 2;
      let seq = 1;
      const max = this.items().length;
      const updated = this.items().slice();
      const upserts: Array<{ number: number; titleKo: string; titleEn: string }> = [];
      for (let i = startIndex; i < rows.length && seq <= max; i++){
        const r = (rows[i] as any[]) || [];
        const c = (r[2] ?? '').toString().trim();
        if (!c) continue; // only start group when C has content
        const a = (r[0] ?? '').toString().trim();
        const b = (r[1] ?? '').toString().trim();
        const titleKo = [a,b,c].filter(Boolean).join(' ').replace(/\s+/g,' ').trim();
        const parts: string[] = [];
        let j = i;
        while (j < rows.length){
          const rr = (rows[j] as any[]) || [];
          if (j > i && (rr[2] ?? '').toString().trim()) break; // next group starts
          const d = (rr[3] ?? '').toString().trim();
          const e = (rr[4] ?? '').toString().trim();
          const sub = [d,e].filter(Boolean).join(' ').trim();
          if (sub) parts.push(sub);
          j++;
        }
        const titleEn = parts.join(' ');
        const number = seq++;
        upserts.push({ number, titleKo, titleEn });
        if (updated[number-1]){
          updated[number-1] = { ...updated[number-1], titleKo: titleKo || updated[number-1].titleKo, titleEn: titleEn || updated[number-1].titleEn } as any;
        }
        i = j - 1; // continue after group
      }
      const curr3 = this.items();
      for (let i=0;i<curr3.length;i++) curr3[i] = updated[i] as any;
      this.items.set(curr3 as any);
      console.info('[Audit] Excel parsed rows:', rows.length, 'sequential mapped items:', upserts.length);

      // Upsert to DB to persist titles by immutable key 'number'
      if (upserts.length){
        try{ const res: any = await this.supabase.upsertAuditItems(upserts); console.info('[Audit] Upsert items (sequential):', upserts.length, 'result:', res); return !!(res && res.ok !== false); }catch(e){ console.warn('[Audit] Upsert failed', e); return false as any; }
      }
      return true as any;
    }catch{ return false as any; }
  }

  private async refreshTitlesFromDb(){
    try{
      const rows = await this.supabase.listAuditItems();
      const map = new Map<number, { title_ko: string; title_en: string }>();
      for (const r of rows as any[]){ map.set((r as any).number, { title_ko: (r as any).title_ko, title_en: (r as any).title_en }); }
      const updated = this.items().map((it:any)=>{
        const t = map.get(it.id);
        return t ? { ...it, titleKo: t.title_ko || it.titleKo, titleEn: t.title_en || it.titleEn } : it;
      });
      this.items.set(updated as any);
      console.info('[Audit] Titles refreshed from DB:', rows?.length ?? 0);
    }catch{}
  }

  dates: AuditDate[] = [];
  selectedDate = signal<string>('');
  savedDates: string[] = [];
  savedSelectedDate: string | null = null;
  savedOpen = false;
  saving = signal(false); // 진행 상태: 생성
  deleting = signal(false); // 진행 상태: 삭제
  toast: string | null = null;
  loadingSaved = signal(false); // 진행 상태: 불러오기
  createdAt: string | null = null;
  createdDateOnly(){
    const s = this.createdAt || this.selectedDate();
    if (!s) return '' as any;
    try{ return String(s).slice(0,10); }catch{ return s as any; }
  }

  items = signal<AuditItem[]>(Array.from({ length: 214 }, (_, i) => {
    const id = i + 1;
    const base: AuditItem = {
      id,
      titleKo: `점검 항목 ${id}`,
      titleEn: `Inspection item ${id}`,
      done: false,
      status: 'pending',
      note: '',
      departments: [],
      owners: [],
      ...( { companies: [] as string[] } as any ),
      col1Text: '',
      col3Text: '',
      selectedLinks: []
    } as any;
    return base as any;
  }));

  // trackBy handlers to keep DOM nodes stable
  trackByItem = (_: number, it: AuditItem) => it.id;
  trackByValue = (_: number, v: string) => v;
  trackByComment = (_: number, c: { user: string; time: string; text: string }) => `${c.user}|${c.time}|${c.text}`;

  resources: ResourceItem[] = [];
  userOptions: string[] = [];
  newComment: Record<number, string> = {};
  // inline comment editing state
  editingComment: Record<number, number> = {}; // itemId -> index being edited
  editCommentText: Record<string, string> = {}; // key(itemId|index) -> text
  keyFor(id: number, i: number){ return `${id}|${i}`; }

  setDate(value: string){ this.selectedDate.set(value); this.loadByDate(); }
  today(){ const d = new Date(); const mm = String(d.getMonth()+1).padStart(2,'0'); const dd = String(d.getDate()).padStart(2,'0'); return `${d.getFullYear()}-${mm}-${dd}`; }
  setToday(){ this.setDate(this.today()); }
  async loadSavedDates(){ try{ this.savedDates = await this.supabase.listSavedAuditDates(); }catch{ this.savedDates = []; } }
  toggleSavedOpen(ev: MouseEvent){ ev.stopPropagation(); this.savedOpen = !this.savedOpen; }
  selectSavedDate(d: string){ this.savedSelectedDate = d; this.savedOpen = false; /* 불러오기 버튼을 눌러야 실제 로드 */ }
  @HostListener('document:click') closeSaved(){ this.savedOpen = false; }
  async loadFromSaved(){
    const d = this.savedSelectedDate || this.savedDates?.[0];
    if (!d) return;
    this.loadingSaved.set(true);
    try{
      this.savedSelectedDate = d;
      this.setDate(d);
      await this.loadByDate();
      await this.openFromPending();
    } finally {
      this.loadingSaved.set(false);
    }
  }
  async loadByDate(){
    const date = this.selectedDate();
    if (!date){ this.resetItems(); return; }
    // 아직 생성되지 않은 날짜라면 화면을 초기화하고 수정 가드를 켭니다
    const created = this.savedDates.includes(date);
    try{
      const { data: all } = created ? await this.supabase.listGivaudanProgressByDate(date) : { data: [] } as any;
      // 생성일(최초 저장 시간) 표시
      try{ this.createdAt = (await this.supabase.getAuditDateCreatedAt(date)) || null; }catch{ this.createdAt = null; }
      const next = this.items().map(it => {
        // 높이 캐시 초기화
        delete (it as any).__h1;
        delete (it as any).__h3;
        
        const row = (all||[]).find((r:any) => r.number === it.id);
        // Extract custom field bundle from comments (persisted without schema change)
        const rawComments = (row?.comments || []) as any[];
        const fieldBundle = Array.isArray(rawComments) ? rawComments.find((c:any)=> c && c.type==='fields') : null;
        const userComments = Array.isArray(rawComments) ? rawComments.filter((c:any)=> !(c && c.type==='fields')) : [];
        return {
          ...it,
          status: row?.status || 'pending',
          note: row?.note || '',
          departments: row?.departments || [],
          owners: row?.owners || [],
          companies: row?.companies || [],
          comments: userComments || [],
          company: row?.company || null,
          col1Text: fieldBundle?.col1 || '',
          col3Text: fieldBundle?.col3 || '',
          selectedLinks: (fieldBundle?.links || []).map((link: any) => ({
            id: link.id,
            title: link.title,
            kind: link.kind || link.type || 'record'  // kind 또는 type 속성 유지
          }))
        } as any;
      });
      // in-place 업데이트로 참조를 유지하여 깜박임 최소화
      const curr = this.items();
      for (let i=0;i<curr.length;i++) curr[i] = next[i] as any;
      this.items.set(curr as any);
      // 생성되지 않은 날짜라면, 업서트된 템플릿(CSV/JSON)을 적용해 기본 타이틀/업체가 보이도록 함
      if (!created){
        try{ await this.applyTitlesFromJsonOrExcel(); }catch{}
      }
      }catch{ this.resetItems(); }
    await this.openFromPending();
    
    // 현재 열려있는 항목의 높이 재계산
    if (this.openItemId) {
      const openItem = this.items().find(it => (it as any).id === this.openItemId);
      if (openItem) {
        setTimeout(() => this.measureAndCacheSlideHeights(openItem as any), 100);
        setTimeout(() => this.measureAndCacheSlideHeights(openItem as any), 200);
      }
    }
  }
  resetItems(){
    const blank = Array.from({ length: 214 }, (_, i) => {
      const id = i + 1;
      const row: any = { id, titleKo: `점검 항목 ${id}`, titleEn: `Inspection item ${id}`, done: false, status: 'pending', note: '', departments: [], owners: [] as string[], companies: [] as string[] };
      return row;
    });
    const curr = this.items();
    for (let i=0;i<curr.length;i++) curr[i] = blank[i] as any;
    this.items.set(curr as any);
  }
  async saveAllForDate(){
    const date = this.selectedDate() || this.today();
    this.selectedDate.set(date);
    const user = this.currentUserId; const name = this.userDisplay;
    // optimistic: 먼저 목록에 반영
    if (!this.savedDates.includes(date)) this.savedDates = [date, ...this.savedDates];
    // 대량 upsert로 409 충돌을 줄임
    const payload = this.items().map(it => ({
      number: it.id,
      status: it.status,
      note: it.note,
      departments: it.departments,
      companies: it.companies || [],
      company: (it as any).company || null,
      updated_by: user,
      updated_by_name: name,
      audit_date: date
    }));
    try{
      await this.supabase.upsertGivaudanProgressMany(payload as any);
    }catch(e){ console.warn('bulk upsert failed', e); this.showToast('저장이 일부 실패했습니다'); }
    // 서버 기준으로 최신화
    try{
      const latest = await this.supabase.listSavedAuditDates();
      this.savedDates = Array.from(new Set([date, ...(latest||[])]));
    }catch{}
  }

  addComment(it: any){
    const text = (this.newComment[it.id]||'').trim();
    if (!text) return;
    if (!it.comments) it.comments = [];
    const now = new Date(); const y = now.getFullYear(); const m = String(now.getMonth()+1).padStart(2,'0'); const d = String(now.getDate()).padStart(2,'0');
    const hh = String(now.getHours()).padStart(2,'0'); const mm = String(now.getMinutes()).padStart(2,'0');
    it.comments.push({ user: this.userDisplay, time: `${y}-${m}-${d} ${hh}:${mm}`, text });
    this.newComment[it.id] = '';
    this.saveProgress(it);
  }
  removeComment(it: any, idx: number){
    if (!it) return;
    const list = Array.isArray(it.comments) ? it.comments : [];
    if (idx >= 0 && idx < list.length){ list.splice(idx, 1); }
    // 즉시 UI 반영 후 저장
    it.comments = list;
    this.saveProgress(it);
  }
  canEditComment(c: { user: string }){ return this.canDeleteComment(c); }
  startEditComment(it: any, idx: number, text: string){
    this.editingComment[it.id] = idx;
    this.editCommentText[this.keyFor(it.id, idx)] = text;
  }
  cancelEditComment(it: any, idx: number){
    delete this.editingComment[it.id];
    delete this.editCommentText[this.keyFor(it.id, idx)];
  }
  saveEditComment(it: any, idx: number){
    const list = Array.isArray(it.comments) ? it.comments : [];
    if (!(idx >= 0 && idx < list.length)) return;
    const key = this.keyFor(it.id, idx);
    const next = (this.editCommentText[key]||'').trim();
    if (!next){ this.cancelEditComment(it, idx); return; }
    list[idx] = { ...list[idx], text: next };
    it.comments = list;
    this.cancelEditComment(it, idx);
    this.saveProgress(it);
  }
  onEditCommentKeydown(ev: KeyboardEvent, it: any, idx: number){
    if ((ev.ctrlKey || (ev as any).metaKey) && ev.key==='Enter'){ ev.preventDefault(); this.saveEditComment(it, idx); }
    if (ev.key==='Escape'){ ev.preventDefault(); this.cancelEditComment(it, idx); }
  }

  // Create current date data (initialize and save)
  isDateCreated(){ const d = this.selectedDate(); return !!d && this.savedDates.includes(d); }
  async onCreateClick(){
    const date = this.selectedDate() || this.today();
    // 이미 생성되어 있으면 동작하지 않음
    if (this.savedDates.includes(date)) return;
    // 페이지 내용 초기화 후 저장
    this.resetItems();
    // 기본 템플릿(제목/부제/업체)을 먼저 적용하여 초기 저장에도 포함되도록
    try{ await this.applyTitlesFromJsonOrExcel(); }catch{}
    // 생성 직후 필터 초기화
    this.companyFilter = 'ALL';
    this.filterDept = 'ALL';
    this.filterOwner = 'ALL';
    this.saving.set(true);
    try{
      await this.saveAllForDate();
    }catch(e){ console.warn('saveAllForDate error', e); }
    // 저장된 직후에도 아이템이 유지되도록, 서버에서 방금 저장한 값을 로드해 덮어쓰기
    await this.loadByDate();
    this.saving.set(false);
    this.showToast('생성되었습니다');
  }

  // Delete all rows of a saved date (admin only)
  async confirmDeleteDate(){
    if (!this.isAdmin) { alert('관리자만 삭제할 수 있습니다.'); return; }
    const date = this.selectedDate(); if (!date){ alert('삭제할 날짜를 선택하세요.'); return; }
    const ok = confirm(`${date} 데이터를 정말 삭제할까요? 되돌릴 수 없습니다.`);
    if(!ok) return;
    try{
      this.deleting.set(true);
      await this.supabase.deleteGivaudanProgressByDate(date);
      // savedDates에서 즉시 제거(낙관적 업데이트)
      this.savedDates = this.savedDates.filter(d => d !== date);
      // 현재 화면도 초기화
      this.resetItems();
      // 서버 기준으로 재동기화
      await this.loadSavedDates();
      this.showToast('삭제되었습니다');
    } finally {
      this.deleting.set(false);
    }
  }

  // Copy from another date into current date
  copying = false; copyFromDate: string | null = null;
  copyingBusy = signal(false);
  copyJustFinished = signal(false);
  @ViewChild('copyModalRoot') copyModalRoot?: ElementRef<HTMLDivElement>;
  @ViewChild('kwInput') kwInput?: ElementRef<HTMLInputElement>;
  openCopyModal(){
    this.copying = true; this.copyFromDate = this.savedDates?.[0] || null;
    // 모달이 열리면 모달 자체에 포커스를 이동시켜 배경 검색창 하이라이트 방지
    setTimeout(()=> this.copyModalRoot?.nativeElement?.focus(), 0);
    try{ document.getElementById('app-root')?.classList.add('modal-open'); }catch{}
  }
  closeCopy(){
    this.copying = false;
    setTimeout(()=> this.kwInput?.nativeElement?.blur(), 0);
    try{ document.getElementById('app-root')?.classList.remove('modal-open'); }catch{}
  }
  private confirmCancelCopy(): boolean{
    if (!this.copyingBusy()) return true;
    return confirm('복사를 취소할까요? 진행 중인 작업이 중단됩니다.');
  }
  onCopyBackdropClick(){
    if (this.confirmCancelCopy()){
      // 취소 선택 시 진행 상태 초기화(대기 상태로)
      this.copyingBusy.set(false);
      this.copyJustFinished.set(false);
      this.closeCopy();
    }
  }
  onCopyCloseClick(){
    if (this.confirmCancelCopy()){
      this.copyingBusy.set(false);
      this.copyJustFinished.set(false);
      this.closeCopy();
    }
  }
  async confirmCopy(){
    try{
      this.copyingBusy.set(true);
      this.copyJustFinished.set(false);
      const target = this.selectedDate() || this.today();
      this.selectedDate.set(target);
      const from = this.copyFromDate; if (!from){ alert('복사할 날짜를 선택하세요.'); return; }
      // 원본을 한번에 읽고, 단일 벌크 업서트로 처리하여 속도와 완료 타이밍 개선
      const { data: rows } = await this.supabase.listGivaudanProgressByDate(from);
      const payload = (rows||[]).map((r:any)=> ({
        number: r.number,
        status: r.status || null,
        note: r.note || null,
        departments: r.departments || [],
        companies: r.companies || [],
        audit_date: target,
        updated_by: this.currentUserId,
        updated_by_name: this.userDisplay
      }));
      if (payload.length){ await this.supabase.upsertGivaudanProgressMany(payload as any); }
      await this.loadByDate();
      await this.loadSavedDates();
      // 완료 안내 (모달은 유지)
      this.showToast('복사가 완료되었습니다');
      this.copyJustFinished.set(true);
    } finally {
      this.copyingBusy.set(false);
      // 모달은 유지하고, 닫기는 사용자가 직접 수행
    }
  }

  private showToast(msg: string){
    this.toast = msg;
    setTimeout(()=> this.toast=null, 1400);
  }

  // Debounced note save to ensure persistence when user types without blur
  private noteTimers: Record<number, any> = {};
  onNoteModelChange(it: any){
    const id = it?.id; if(!id) return;
    // throttle: save 600ms after last keystroke
    clearTimeout(this.noteTimers[id]);
    this.noteTimers[id] = setTimeout(()=>{
      this.saveProgress(it);
    }, 600);
  }

  onCommentKeydown(ev: KeyboardEvent, it: any){
    // Ctrl+Enter: 다음 항목 댓글 입력창으로 이동 (Shift+Ctrl+Enter: 이전 항목)
    if ((ev.ctrlKey || ev.metaKey) && ev.key === 'Enter'){
      ev.preventDefault();
      // 입력한 댓글이 있으면 저장 시도(비어있으면 addComment는 무시됨)
      try{ this.addComment(it); }catch{}

      const goPrev = ev.shiftKey === true;
      const targetId = (it.id as number) + (goPrev ? -1 : 1);
      const targetItem = this.items().find(x => (x as any).id === targetId);
      if (targetItem){
        if (this.openItemId !== targetId){ this.toggleDetails(targetItem as any); }
        this.openItemId = targetId;
        setTimeout(()=>{
          this.centerRow(targetId);
          try{ requestAnimationFrame(()=> this.centerRow(targetId)); }catch{}
          const el = document.getElementById(`comment-input-${targetId}`) as HTMLTextAreaElement | null;
          if (el){ el.focus(); el.setSelectionRange(el.value.length, el.value.length); }
        }, 40);
      }
    }
  }

  markDone(it: AuditItem){
    if(it.done){
      const now = new Date();
      const y = now.getFullYear(); const m = (now.getMonth()+1).toString().padStart(2,'0'); const d = now.getDate().toString().padStart(2,'0');
      const hh = now.getHours().toString().padStart(2,'0'); const mm = now.getMinutes().toString().padStart(2,'0');
      it.doneBy = this.userDisplay; it.doneAt = `${y}-${m}-${d} ${hh}:${mm}`;
    } else { it.doneBy = undefined; it.doneAt = undefined; }
  }

  previewing = false; previewItem: any=null;
  preview(r: any){ this.previewItem = r; this.previewing = true; }
  linkPopup: { id: string; title: string } | null = null;
  // drag-n-drop state for selectedLinks
  linkDragItemId: number | null = null;
  linkDragIndex: number = -1;
  linkDragOverIndex: number = -1;
  private linkDragData?: { item: any; fromIndex: number };
  // drag state for picker
  @ViewChild('pickerRoot') pickerRoot?: ElementRef<HTMLDivElement>;
  private pickerDrag = { active: false, startX: 0, startY: 0, offsetX: 0, offsetY: 0, raf: 0, needsPaint: false };
  startPickerDrag(ev: MouseEvent){
    this.pickerDrag.active = true; this.pickerDrag.startX = ev.clientX; this.pickerDrag.startY = ev.clientY;
    const move = (e: MouseEvent)=>{
      if(!this.pickerDrag.active) return;
      this.pickerDrag.offsetX += (e.clientX - this.pickerDrag.startX);
      this.pickerDrag.offsetY += (e.clientY - this.pickerDrag.startY);
      this.pickerDrag.startX = e.clientX; this.pickerDrag.startY = e.clientY;
      if (!this.pickerDrag.raf){ this.pickerDrag.raf = requestAnimationFrame(this.paintPickerTransform); }
    };
    const up = ()=>{ this.pickerDrag.active = false; window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); cancelAnimationFrame(this.pickerDrag.raf); this.pickerDrag.raf = 0; };
    window.addEventListener('mousemove', move); window.addEventListener('mouseup', up);
  }
  paintPickerTransform = ()=>{
    this.pickerDrag.raf = 0;
    try{
      const el = this.pickerRoot?.nativeElement; if(!el) return;
      el.style.transform = `translate(${this.pickerDrag.offsetX}px, ${this.pickerDrag.offsetY}px)`;
    }finally{}
  }

  // Slide open state and assessment/progress
  openItemId: number | null = null;
  private openExtra = new Set<number>();
  assessment: any = null;
  departments = ['원료제조팀','식물세포배양팀','품질팀','연구팀','경영지원팀','물류팀'];
  filterDept: 'ALL' | string = 'ALL';
  filterOwner: 'ALL' | string = 'ALL';
  keyword: string = '';
  hoverItemId: number | null = null;

  // Record picker state
  recordPickerOpen = false;
  @ViewChild('pickerInput') pickerInput?: ElementRef<HTMLInputElement>;
  pickerQuery = '';
  pickerStdCat = '';
  pickerDept = '';
  pickerMethod = '';
  pickerPeriod = '';
  pickerIndex = 0;
  hoverPickerIndex = -1;
  methods: string[] = ['ERP','QMS','NAS','OneNote','Paper'];
  periods: string[] = ['일','주','월','년','발생시','갱신주기에 따라'];
  recordData: (RmdFormItem & { kind?: 'record'|'standard' })[] = ([] as any);
  recordCategories: string[] = ['일반관리기준서','제조위생관리기준서','제조관리기준서','품질관리기준서','ISO'];
  private pickerTargetItem: any = null;

  openRecordPicker(it: any){
    this.pickerTargetItem = it;
    // Load records once (static list)
    if (!(this.recordData && (this.recordData as any).length)){
      try{
        const recs = RMD_FORM_CATEGORIES.flatMap(c => c.items.map(i => ({ ...i, standardCategory: (i as any).standardCategory || (c as any).category, kind: 'record' as const })));
        const stds = RMD_STANDARDS.flatMap(c => c.items.map(i => ({ id: i.id, title: i.title, standardCategory: c.category, kind: 'standard' as const })));
        this.recordData = ([] as any).concat(recs, stds);
      }catch{}
    }
    this.recordPickerOpen = true;
    this.pickerIndex = -1; // 처음에는 입력창에 포커스
    setTimeout(()=> this.pickerInput?.nativeElement?.focus(), 0);
  }
  closeRecordPicker(){ this.recordPickerOpen = false; this.pickerIndex = 0; }
  pickerResults(){
    const q = (this.pickerQuery||'').trim().toLowerCase().split(/\s+/).filter(Boolean);
    let rows = (this.recordData||[]) as any[];
    if (this.pickerStdCat) rows = rows.filter(r => (r.standardCategory||'') === this.pickerStdCat);
    if (this.pickerDept) rows = rows.filter(r => ((r as any).department||'') === this.pickerDept);
    if (this.pickerMethod) rows = rows.filter(r => ((r as any).method||'') === this.pickerMethod);
    if (this.pickerPeriod) rows = rows.filter(r => ((r as any).period||'') === this.pickerPeriod);
    if (q.length){
      rows = rows.filter(r => {
        const hay = `${r.id} ${r.title||r.title} ${(r as any).owner||''} ${(r as any).method||''}`.toLowerCase();
        return q.every(w => hay.includes(w));
      });
    }
    return rows.slice(0, 500);
  }
  private pickerKeyGuard = { lastTs: 0, lastKey: '' };
  onPickerKeydown(ev: KeyboardEvent){
    // 키 반복/중복 방지: 같은 키가 30ms 내에 다시 들어오면 무시
    const now = performance.now();
    if (this.pickerKeyGuard.lastKey === ev.key && (now - this.pickerKeyGuard.lastTs) < 30){
      ev.preventDefault();
      return;
    }
    this.pickerKeyGuard.lastKey = ev.key; this.pickerKeyGuard.lastTs = now;

    const list = this.pickerResults();
    if (ev.key === 'ArrowDown'){
      ev.preventDefault();
      const next = this.pickerIndex < 0 ? 0 : this.pickerIndex + 1;
      this.pickerIndex = Math.min(next, Math.max(0, list.length-1));
      if (this.pickerIndex >= 0){
        setTimeout(()=>{ const el = document.getElementById('picker-item-'+this.pickerIndex); if(el) el.scrollIntoView({ block: 'nearest' }); }, 0);
      }
    }
    else if (ev.key === 'ArrowUp'){
      ev.preventDefault();
      if (this.pickerIndex <= 0){ this.pickerIndex = -1; setTimeout(()=> this.pickerInput?.nativeElement?.focus(), 0); }
      else { this.pickerIndex = Math.max(this.pickerIndex-1, 0); setTimeout(()=>{ const el = document.getElementById('picker-item-'+this.pickerIndex); if(el) el.scrollIntoView({ block: 'nearest' }); }, 0); }
    }
    else if (ev.key === 'Enter'){
      ev.preventDefault();
      if (this.pickerIndex >= 0 && list[this.pickerIndex]){ this.chooseRecord(list[this.pickerIndex]); }
    }
  }
  chooseRecord(r: any){
    if (!this.pickerTargetItem) return;
    if (!this.pickerTargetItem.selectedLinks) this.pickerTargetItem.selectedLinks = [];
    const exists = (this.pickerTargetItem.selectedLinks as any[]).some(x => x.id === r.id);
    if (!exists){
      this.pickerTargetItem.selectedLinks.push({ id: r.id, title: r.title || r.name || '', kind: (r.kind || 'record') });
      this.saveProgress(this.pickerTargetItem);
    }
    this.pickerIndex = 0;
    // keep picker open for multiple adds; re-focus input
    setTimeout(()=> this.pickerInput?.nativeElement?.focus(), 0);
  }

  openLinkPopup(l: { id: string; title: string; kind?: 'record'|'standard' }){
    if ((l.kind||'record') === 'record'){
      // Open/replace a single 'Record' tab instead of replacing current Audit view
      const tabPath = '/app/record/rmd-forms';
      const navUrl = `/app/record/rmd-forms?open=${encodeURIComponent(l.id)}&ts=${Date.now()}`;
      // Use TabService to request/activate the shared Record tab
      try{ sessionStorage.setItem('record.forceOpen', String(l.id)); }catch{}
      this.persistUi();
      this.tabBus.requestOpen('원료제조팀 기록', tabPath, navUrl);
      return;
    }
    // Open/replace a single 'Standard' tab
    const stdTab = '/app/standard/rmd';
    const stdUrl = `/app/standard/rmd?open=${encodeURIComponent(l.id)}&ts=${Date.now()}`;
    try{ sessionStorage.setItem('standard.forceOpen', String(l.id)); }catch{}
    this.persistUi();
    this.tabBus.requestOpen('원료제조팀 규정', stdTab, stdUrl);
  }
  removeSelectedLink(it: any, l: { id: string }){
    if(!it?.selectedLinks) return; it.selectedLinks = (it.selectedLinks as any[]).filter(x => x.id !== l.id); this.saveProgress(it);
  }
  private buildLinkUrl(l: { id: string; title: string }): string | null {
    try{
      // Map by pattern: Standard pages served under /rmd/<ID>.html
      if(/^BF-/.test(l.id)){
        return `/rmd/${l.id}.html`;
      }
      return null;
    }catch{ return null; }
  }

  async toggleDetails(it: any){
    // 유지: 다른 코드에서 사용하는 경우를 위해 남겨둠. selection 기반으로 위임
    await this.selectItem(it);
  }
  // Drag and drop handlers for selectedLinks chips
  onLinkDragStart(ev: DragEvent, it: any, index: number){
    this.linkDragItemId = it.id; this.linkDragIndex = index; this.linkDragOverIndex = index;
    this.linkDragData = { item: it, fromIndex: index };
    try{ ev.dataTransfer?.setData('text/plain', String(index)); ev.dataTransfer!.effectAllowed = 'move'; }catch{}
  }
  onLinkDragOver(ev: DragEvent, it: any, index: number){
    if (this.linkDragItemId !== it.id) return;
    ev.preventDefault(); ev.dataTransfer!.dropEffect = 'move';
    this.linkDragOverIndex = index;
  }
  onLinkDragLeave(_ev: DragEvent, _it: any, index: number){
    if (this.linkDragOverIndex === index) this.linkDragOverIndex = -1;
  }
  onLinkDrop(ev: DragEvent, it: any, index: number){
    ev.preventDefault();
    if (this.linkDragItemId !== it.id) { this.onLinkDragEnd(); return; }
    const from = this.linkDragIndex; const to = index;
    this.reorderLinks(it, from, to);
    this.onLinkDragEnd();
  }
  onLinkListDragOver(ev: DragEvent, it: any){
    if (this.linkDragItemId !== it.id) return; ev.preventDefault();
  }
  onLinkListDrop(ev: DragEvent, it: any){ ev.preventDefault(); this.onLinkDropEnd(ev, it); }
  onLinkDragOverEnd(ev: DragEvent, it: any){
    if (this.linkDragItemId !== it.id) return; ev.preventDefault();
    this.linkDragOverIndex = (it.selectedLinks||[]).length;
  }
  onLinkDropEnd(ev: DragEvent, it: any){
    ev.preventDefault();
    if (this.linkDragItemId !== it.id) { this.onLinkDragEnd(); return; }
    const from = this.linkDragIndex; const to = (it.selectedLinks||[]).length;
    this.reorderLinks(it, from, to);
    this.onLinkDragEnd();
  }
  onLinkDragEnd(){ this.linkDragItemId = null; this.linkDragIndex = -1; this.linkDragOverIndex = -1; this.linkDragData = undefined; }
  private reorderLinks(it: any, from: number, to: number){
    if (!it || !Array.isArray(it.selectedLinks)) return;
    const arr = it.selectedLinks as any[];
    if (from === to || from < 0 || from >= arr.length) return;
    const toIndex = Math.max(0, Math.min(arr.length - 1, to));
    const [moved] = arr.splice(from, 1);
    arr.splice(toIndex, 0, moved);
    it.selectedLinks = arr;
    this.saveProgress(it);
  }

  private isEditableTarget(target: EventTarget | null){
    try{
      const el = target as HTMLElement | null;
      if (!el) return false;
      const tag = (el.tagName||'').toLowerCase();
      if (tag==='input' || tag==='textarea' || tag==='select') return true;
      if ((el as HTMLElement).isContentEditable) return true;
      const role = el.getAttribute?.('role')||'';
      if (role==='textbox') return true;
      return false;
    }catch{ return false; }
  }

  @HostListener('document:keydown', ['$event'])
  onKeyNav(ev: KeyboardEvent){
    const key = ev.key || '';
    const isDown = key==='ArrowDown' || key==='Down' || (ev as any).keyCode===40;
    const isUp = key==='ArrowUp' || key==='Up' || (ev as any).keyCode===38;
    if (!isDown && !isUp) return;
    if (this.isEditableTarget(ev.target)) return; // 폼 입력 중이면 무시
    ev.preventDefault();
    ev.stopPropagation();
    const arr = this.visibleItems();
    if (!arr.length) return;
    let idx = this.openItemId ? arr.findIndex(x => (x as any).id === this.openItemId) : -1;
    if (idx < 0) idx = -1; // no selection yet
    if (isDown) idx = Math.min(idx + 1, arr.length - 1);
    if (isUp) idx = Math.max(idx - 1, 0);
    const next = arr[Math.max(0, idx)];
    if (next) {
      this.selectItem(next as any);
      // 이동 직후에도 상태를 저장해 복귀 시 동일 항목이 열리도록 함
      this.persistUi();
      // center selected row in viewport for keyboard navigation
      setTimeout(()=> this.centerRow((next as any).id), 0);
    }
  }

  @HostListener('document:copy', ['$event'])
  onCopy(ev: ClipboardEvent){
    try{
      // If user has selected text explicitly, copy the selection only
      const sel = window.getSelection?.();
      const selectedText = sel ? sel.toString() : '';
      if (selectedText && selectedText.trim().length > 0){
        // Let the browser handle default text copy
        return; // do not preventDefault
      }
      const id = this.openItemId || this.hoverItemId;
      if (!id) return;
      const it: any = this.items().find(x => (x as any).id === id);
      if (!it) return;
      const lines: string[] = [];
      lines.push(`번호,${id}`);
      lines.push(`제목,${(it.titleKo||'').replace(/\n/g,' ').trim()}`);
      lines.push(`부제목,${(it.titleEn||'').replace(/\n/g,' ').trim()}`);
      lines.push(`입력1,${(it.col1Text||'').replace(/\n/g,' ').trim()}`);
      lines.push(`입력2,${(it.col3Text||'').replace(/\n/g,' ').trim()}`);
      const links = ((it.selectedLinks||[]) as any[]).map((l:any)=>`${l.id||''} ${l.title||''}`).join(' | ');
      lines.push(`규정/기록,${links}`);
      const comments = ((it.comments||[]) as any[]).map((c:any)=>`${c.user||''}:${c.text||''}`).join(' | ');
      lines.push(`댓글,${comments}`);
      lines.push(`비고,${(it.note||'').replace(/\n/g,' ').trim()}`);
      lines.push(`진행상황,${it.status||''}`);
      lines.push(`업체선택,${it.company||''}`);
      lines.push(`담당부서,${(it.departments||[]).join(' / ')}`);
      lines.push(`담당자,${(it.owners||[]).join(' / ')}`);
      const csv = lines.join('\n');
      ev.clipboardData?.setData('text/plain', csv);
      ev.preventDefault();
      this.showToast('항목 정보가 복사되었습니다');
    }catch{}
  }

  async selectItem(it: any){
    // 105번 이후 항목은 사용하지 않음
    if (it && Number(it.id) > 104) return;
    // 단일 선택: 기존 임시 열림을 모두 닫고 선택 항목만 열림 상태 유지
    this.openItemId = it.id;
    this.openExtra.clear();
    this.openExtra.add(it.id);
    // 선택 즉시 UI 상태 저장해 탭 이동 후 복귀 시 동일 항목 복원
    this.persistUi();
    // Load assessment master
    const { data } = await this.supabase.getGivaudanAssessment(it.id);
    this.assessment = data;
    // Load progress
    const date = this.selectedDate();
    const { data: prog } = date ? await this.supabase.getGivaudanProgressByDate(it.id, date) : await this.supabase.getGivaudanProgress(it.id);
    if (prog){
      it.status = (prog.status as any) || it.status;
      it.note = prog.note || it.note;
      it.departments = prog.departments || [];
      (it as any).companies = (prog as any).companies || [];
      it.owners = (prog as any).owners || it.owners || [];
      const raw = (prog as any).comments || [];
      if (Array.isArray(raw)){
        const fb = raw.find((c:any)=> c && c.type==='fields');
        it.comments = raw.filter((c:any)=> !(c && c.type==='fields'));
        if (fb){ 
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
    // Load resources
    const { data: res } = await this.supabase.listGivaudanResources(it.id);
    this.resources = res || [];
    
    // 높이 캐시를 초기화하고 재계산
    delete (it as any).__h1;
    delete (it as any).__h3;
    
    // 내용 길이만큼 입력창이 처음부터 보이도록 즉시 측정/캐시
    setTimeout(()=> this.measureAndCacheSlideHeights(it), 0);
    // 더 확실한 재계산을 위해 두 번째 시도
    setTimeout(()=> this.measureAndCacheSlideHeights(it), 50);
  }

  isOpen(it: any){ return this.openItemId === it.id || this.openExtra.has(it.id); }

  async toggleExtra(it: any){
    if (this.openExtra.has(it.id)){
      this.openExtra.delete(it.id);
      if (this.openItemId === it.id) this.openItemId = null;
      return;
    }
    this.openExtra.add(it.id);
    // 열릴 때 필요한 데이터는 selectItem과 동일하게 로드
    const { data } = await this.supabase.getGivaudanAssessment(it.id);
    this.assessment = data;
    const date = this.selectedDate();
    const { data: prog } = date ? await this.supabase.getGivaudanProgressByDate(it.id, date) : await this.supabase.getGivaudanProgress(it.id);
    if (prog){
      it.status = (prog.status as any) || it.status;
      it.note = prog.note || it.note;
      it.departments = prog.departments || [];
      (it as any).companies = (prog as any).companies || [];
      it.owners = (prog as any).owners || it.owners || [];
      const raw = (prog as any).comments || [];
      if (Array.isArray(raw)){
        const fb = raw.find((c:any)=> c && c.type==='fields');
        it.comments = raw.filter((c:any)=> !(c && c.type==='fields'));
        if (fb){ 
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
    const { data: res } = await this.supabase.listGivaudanResources(it.id);
    this.resources = res || [];
    
    // 높이 캐시를 초기화하고 재계산
    delete (it as any).__h1;
    delete (it as any).__h3;
    
    // 슬라이드가 열릴 때도 동일하게 높이 측정/캐시
    setTimeout(()=> this.measureAndCacheSlideHeights(it), 0);
    // 더 확실한 재계산을 위해 두 번째 시도
    setTimeout(()=> this.measureAndCacheSlideHeights(it), 50);
  }

  private centerRow(id: number){
    try{
      const container = this.listRef?.nativeElement as HTMLElement | undefined;
      if (!container) return;
      const row = container.querySelector(`.item[data-id="${id}"]`) as HTMLElement | null;
      if (!row) return;
      const containerRect = container.getBoundingClientRect();
      const rowRect = row.getBoundingClientRect();
      const current = container.scrollTop;
      const target = current + (rowRect.top - containerRect.top) - (container.clientHeight/2 - rowRect.height/2);
      const max = container.scrollHeight - container.clientHeight;
      const to = Math.max(0, Math.min(max, target));
      try{
        container.scrollTo({ top: to, behavior: 'smooth' as ScrollBehavior });
      }catch{
        // fallback: rAF easing
        const start = container.scrollTop;
        const change = to - start;
        const duration = 220; // ms
        let startTs: number | null = null;
        const easeInOut = (t: number)=> t < .5 ? 2*t*t : -1 + (4 - 2*t)*t;
        const step = (ts: number)=>{
          if (startTs===null) startTs = ts;
          const p = Math.min(1, (ts - startTs)/duration);
          container.scrollTop = start + change * easeInOut(p);
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }
    }catch{}
  }

  async saveProgress(it: any){
    // 생성되지 않은 날짜면 수정 차단
    const date = this.selectedDate();
    if (!date || !this.savedDates.includes(date)) { this.showToast('먼저 생성 버튼으로 이 날짜를 생성해 주세요'); return; }
    try{
      this.setSaving(it.id, 'saving');
      const payload = {
        number: it.id,
        note: it.note || null,
        status: it.status || null,
        departments: it.departments || [],
        owners: (it.owners || []) as string[],
        companies: (it.companies || []) as string[],
        comments: ([{ type:'fields', col1: it.col1Text || '', col3: it.col3Text || '', links: (it.selectedLinks||[]) }] as any[]).concat(it.comments || []),
        company: (it.company || null) as any,
        updated_by: this.currentUserId,
        updated_by_name: this.userDisplay,
        audit_date: this.selectedDate() || null,
      };
      const { error } = await this.supabase.upsertGivaudanProgress(payload) as any;
      if (error) throw error;
      // Reload the single row from server to reflect canonical values
      try{
        const date = this.selectedDate();
        if (date){
          const { data: fresh } = await this.supabase.getGivaudanProgressByDate(it.id, date);
          if (fresh){
            it.status = (fresh as any).status || it.status;
            it.note = (fresh as any).note || it.note;
            it.departments = (fresh as any).departments || it.departments || [];
            it.owners = (fresh as any).owners || it.owners || [];
            it.company = (fresh as any).company || it.company || null;
            it.companies = (fresh as any).companies || it.companies || [];
            const raw = (fresh as any).comments || [];
            if (Array.isArray(raw)){
              const fb = raw.find((c:any)=> c && c.type==='fields');
              it.comments = raw.filter((c:any)=> !(c && c.type==='fields'));
              if (fb){ 
                it.col1Text = fb.col1 || it.col1Text; 
                it.col3Text = fb.col3 || it.col3Text;
                it.selectedLinks = (fb.links || []).map((link: any) => ({
                  id: link.id,
                  title: link.title,
                  kind: link.kind || link.type || 'record'
                }));
              }
            } else {
              it.comments = it.comments || [];
            }
          }
        }
      }catch{}
      this.setSaving(it.id, 'saved');
      setTimeout(()=>this.setSaving(it.id,'idle'), 1200);
    }catch(e){
      console.error('Failed to save progress', e);
      this.setSaving(it.id,'idle');
    }
  }

  visibleItems(){
    // 1) 기본 제한(105번 이상 숨김)
    const base = this.items().filter((it:any)=> Number(it.id) <= 104 && Number((it as any).id) !== 25);
    // 2) 중복 ID 방지: 같은 번호가 두 번 있을 경우 첫 번째만 유지
    const uniqMap = new Map<number, any>();
    for (const it of base){ if (!uniqMap.has((it as any).id)) uniqMap.set((it as any).id, it); }
    const arr = Array.from(uniqMap.values());
    // 키워드 필터 (제목/비고 포함)
    const kw = (this.keyword||'').trim().toLowerCase();
    const byKw = kw ? arr.filter((it:any)=>{
      const links = ((it.selectedLinks||[]) as any[]).map(l=> `${l.id||''} ${l.title||''}`).join(' ');
      const comments = ((it.comments||[]) as any[]).map(c=> `${c.text||''}`).join(' ');
      const hay = `${it.titleKo||''} ${it.titleEn||''} ${it.note||''} ${(it.col1Text||'')} ${(it.col3Text||'')} ${links} ${comments}`.toLowerCase();
      return hay.includes(kw);
    }) : arr;
    // 부서 필터
    const byDept = this.filterDept==='ALL' ? byKw : byKw.filter((it:any)=> (it.departments||[]).includes(this.filterDept));
    // 담당자 필터
    const byOwner = this.filterOwner==='ALL' ? byDept : byDept.filter((it:any)=> (it.owners||[]).includes(this.filterOwner));
    // 업체 필터
    if (this.companyFilter === 'ALL') return byOwner;
    const selected = this.companyFilter;
    const selectedNorm = this.normalizeCompanyName(selected);
    return byOwner.filter((it:any)=>{
      const tags = (it.companies||[]).map((x:string)=> this.normalizeCompanyName(x));
      const primary = this.normalizeCompanyName(it.company || '');
      return tags.includes(selectedNorm) || primary === selectedNorm;
    });
  }

  onFilterChange(){}

  onTextareaKeydown(ev: KeyboardEvent, it: any){
    // Ctrl+Enter → 다음 항목의 동일 입력창으로, Shift+Ctrl+Enter → 이전 항목으로
    if (!ev || !(ev.ctrlKey || (ev as any).metaKey) || ev.key !== 'Enter') return;
    ev.preventDefault();
    const target = ev.target as HTMLElement | null;
    const col = Number(target?.getAttribute('data-col') || 1); // 1 or 3
    const arr = this.visibleItems(); if(!arr.length) return;
    const idx = arr.findIndex(x => (x as any).id === it.id);
    if (idx < 0) return;
    const nextIdx = ev.shiftKey ? Math.max(0, idx - 1) : Math.min(arr.length - 1, idx + 1);
    const next = arr[nextIdx]; if(!next) return;
    const nextId = (next as any).id;
    // 슬라이드를 열고 선택 항목 업데이트 + 스크롤 보정
    this.openExtra.add(nextId);
    this.openItemId = nextId;
    // 렌더가 반영된 뒤 중앙으로 스크롤 (두 번 보정)
    setTimeout(()=>{
      this.centerRow(nextId);
      try{ requestAnimationFrame(()=> this.centerRow(nextId)); }catch{}
    }, 30);
    setTimeout(()=>{
      try{
        const el = document.getElementById(`input-${nextId}-${col}`) as HTMLTextAreaElement | null;
        if (el){ el.focus(); el.setSelectionRange(el.value.length, el.value.length); }
      }catch{}
    }, 0);
  }

  addDept(it: any, dept: string){
    if(!dept) return;
    if(!it.departments) it.departments = [];
    if(!it.departments.includes(dept)){
      // 생성 전이면 금지
      const date = this.selectedDate();
      if (!date || !this.savedDates.includes(date)) { this.showToast('먼저 생성 버튼으로 이 날짜를 생성해 주세요'); return; }
      it.departments.push(dept);
      this.saveProgress(it);
    }
  }
  removeDept(it: any, dept: string){
    const date = this.selectedDate();
    if (!date || !this.savedDates.includes(date)) { this.showToast('먼저 생성 버튼으로 이 날짜를 생성해 주세요'); return; }
    it.departments = (it.departments||[]).filter((d:string)=>d!==dept);
    this.saveProgress(it);
  }

  // 업체 태그 관리
  onAddCompanyChange(it: any, c: string){
    if(!c) return;
    const date = this.selectedDate();
    if (!date || !this.savedDates.includes(date)) { this.showToast('먼저 생성 버튼으로 이 날짜를 생성해 주세요'); return; }
    if(!it.companies) it.companies = [];
    if(!(it.companies as string[]).includes(c)){ (it.companies as string[]).push(c); this.saveProgress(it); }
  }
  removeCompany(it: any, c: string){
    const date = this.selectedDate();
    if (!date || !this.savedDates.includes(date)) { this.showToast('먼저 생성 버튼으로 이 날짜를 생성해 주세요'); return; }
    it.companies = (it.companies||[]).filter((x:string)=>x!==c); this.saveProgress(it);
  }
  onCompanyFilterChange(_: any){}

  @HostListener('window:beforeunload')
  persistUi(){
    try{
      const st = {
        selectedDate: this.selectedDate(),
        companyFilter: this.companyFilter,
        filterDept: this.filterDept,
        filterOwner: this.filterOwner,
        scrollTop: this.listRef?.nativeElement?.scrollTop || 0,
        openItemId: this.openItemId
      };
      sessionStorage.setItem('audit.eval.ui.v1', JSON.stringify(st));
      const d = this.selectedDate(); if(d){ sessionStorage.setItem(`audit.eval.items.${d}`, JSON.stringify(this.items())); }
    }catch{}
  }

  // 담당자 추가/삭제
  addOwner(it: any, owner: string){
    if (!owner) return;
    const date = this.selectedDate();
    if (!date || !this.savedDates.includes(date)) { this.showToast('먼저 생성 버튼으로 이 날짜를 생성해 주세요'); return; }
    if (!it.owners) it.owners = [];
    if (!(it.owners as string[]).includes(owner)) { (it.owners as string[]).push(owner); this.saveProgress(it); }
  }
  removeOwner(it: any, owner: string){
    const date = this.selectedDate();
    if (!date || !this.savedDates.includes(date)) { this.showToast('먼저 생성 버튼으로 이 날짜를 생성해 주세요'); return; }
    it.owners = (it.owners||[]).filter((x:string)=>x!==owner); this.saveProgress(it);
  }

  async addResource(it: any){
    const row = { number: it.id, name: '', type: 'Manual', url: null, file_url: null };
    const { data } = await this.supabase.addGivaudanResource(row);
    this.resources = [...(this.resources || []), data as ResourceItem];
  }

  async addResourceByAside(){
    if(!this.openItemId) return;
    const row = { number: this.openItemId, name: '', type: 'Manual', url: null, file_url: null };
    const { data } = await this.supabase.addGivaudanResource(row);
    this.resources = [...(this.resources || []), data as ResourceItem];
  }

  async removeResource(r: any){
    await this.supabase.deleteGivaudanResource(r.id);
    this.resources = (this.resources || []).filter((x:any)=>x.id!==r.id);
  }
  removeResourceConfirm(r: any){
    const ok = confirm('정말로 이 자료 항목을 삭제할까요?');
    if(!ok) return;
    this.removeResource(r);
  }

  async uploadFor(r: any, ev: any){
    const file: File | undefined = ev?.target?.files?.[0];
    if(!file) return;
    const ext = file.name.split('.').pop();
    const path = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
    const { publicUrl } = await this.supabase.uploadAuditFile(file, path);
    r.file_url = publicUrl;
    this.saveResource(r);
  }
  handleDrop(r: any, ev: DragEvent){
    ev.preventDefault();
    const file = ev.dataTransfer?.files?.[0];
    if(!file) return;
    const fake = { target: { files: [file] } } as any;
    this.uploadFor(r, fake);
  }
  toggleResourceDone(r: any){ r.done = !r.done; this.saveResource(r); }
  autoResize(ev: any, it?: any, key?: string){
    const ta = ev?.target as HTMLTextAreaElement; if(!ta) return;
    // 슬라이드 입력창(평가 항목 세부/진행 현황)일 때: 내용 높이에 맞춰 즉시 확장하고 캐시
    if (key && it){
      // 먼저 높이를 auto로 설정하여 실제 내용 높이를 측정
      ta.style.height = 'auto';
      ta.style.overflowY = 'hidden';
      
      const base = 120; // 기본 높이
      const cap = 480;  // 최대 높이
      
      // scrollHeight를 측정하여 실제 필요한 높이 계산
      const scrollHeight = ta.scrollHeight;
      
      // 내용에 따라 높이 결정
      // scrollHeight가 base보다 작으면 base 사용, 크면 scrollHeight 사용 (cap까지만)
      const finalH = Math.min(cap, Math.max(base, scrollHeight));
      
      ta.style.height = finalH + 'px';
      try{ (it as any)[key] = finalH; }catch{}
      return;
    }
    // 비고 입력창: 줄바꿈이 없으면 한 줄(32px), 있으면 최대 120px까지 확장
    const lineBreaks = (ta.value.match(/\n/g) || []).length;
    if (lineBreaks === 0){ ta.style.height = '32px'; return; }
    ta.style.height = 'auto';
    ta.style.height = Math.min(120, Math.max(ta.scrollHeight, 32)) + 'px';
  }

  private measureAndCacheSlideHeights(it: any){
    try{
      const container = this.listRef?.nativeElement as HTMLElement | undefined; if(!container) return;
      const row = container.querySelector(`.item[data-id="${it.id}"]`) as HTMLElement | null; if(!row) return;
      const tas = row.querySelectorAll('textarea.slide-input');
      const base = 120; const cap = 480;
      if (tas[0]){
        const ta = tas[0] as HTMLTextAreaElement; 
        // 먼저 높이를 auto로 설정하여 실제 내용 높이 측정
        ta.style.height = 'auto';
        ta.style.overflowY = 'hidden';
        
        // 텍스트 내용이 있는지 확인
        const hasContent = (ta.value || '').trim().length > 0;
        
        // 내용이 있으면 scrollHeight 사용, 없으면 base 사용
        const scrollHeight = ta.scrollHeight;
        const h = hasContent ? Math.min(cap, Math.max(base, scrollHeight)) : base;
        
        (it as any).__h1 = h; 
        ta.style.height = h + 'px';
      }
      if (tas[1]){
        const ta = tas[1] as HTMLTextAreaElement; 
        // 먼저 높이를 auto로 설정하여 실제 내용 높이 측정
        ta.style.height = 'auto';
        ta.style.overflowY = 'hidden';
        
        // 텍스트 내용이 있는지 확인
        const hasContent = (ta.value || '').trim().length > 0;
        
        // 내용이 있으면 scrollHeight 사용, 없으면 base 사용
        const scrollHeight = ta.scrollHeight;
        const h = hasContent ? Math.min(cap, Math.max(base, scrollHeight)) : base;
        
        (it as any).__h3 = h; 
        ta.style.height = h + 'px';
      }
    }catch{}
  }
  getFileName(r: any){ try{ const url = (r?.file_url||'').split('?')[0]; return url.substring(url.lastIndexOf('/')+1); }catch{return '파일 열기';} }

  openResource(r: ResourceItem){ this.preview(r); }
  async saveResource(r: ResourceItem){
    if (!r || !('id' in (r as any))) return;
    try{
      await this.supabase.updateGivaudanResource((r as any).id, { name: r.name, url: (r as any).url, file_url: (r as any).file_url, done: (r as any).done });
    }catch{}
  }
  openLink(url?: string | null){ if(!url) return; window.open(url, '_blank'); }
  clearFile(r: ResourceItem){ r.file_url = null; }

  @HostListener('document:keydown.escape') onEsc(){
    // ESC는 슬라이드를 닫지 않습니다. 열린 팝업만 처리합니다.
    if(this.previewing){ this.previewing=false; return; }
    if(this.linkPopup){ this.linkPopup=null; return; }
    // 규정/기록 선택 팝업이 열려있을 때는 검색창 초기화
    if(this.recordPickerOpen){ this.pickerQuery=''; this.pickerIndex = -1; setTimeout(()=> this.pickerInput?.nativeElement?.focus(), 0); }
  }

  // UI helpers
  rowSaving: Record<number, 'idle'|'saving'|'saved'> = {};
  private setSaving(id: number, state: 'idle'|'saving'|'saved') { this.rowSaving[id] = state; }
  statusOptions = [
    { value: 'pending', label: '준비중 / Pending', emoji: '' },
    { value: 'in-progress', label: '진행중 / In progress', emoji: '' },
    { value: 'on-hold', label: '보류 / On hold', emoji: '' },
    { value: 'na', label: '해당없음 / N.A.', emoji: '' },
    { value: 'impossible', label: '불가 / Not possible', emoji: '' },
    { value: 'done', label: '완료 / Done', emoji: '' },
  ];
  statusClass(status: string){
    return {
      'status-pending': status==='pending',
      'status-in-progress': status==='in-progress',
      'status-on-hold': status==='on-hold',
      'status-na': status==='na',
      'status-impossible': status==='impossible',
      'status-done': status==='done',
    };
  }
  statusStyle(status: string){
    try{
      switch(status){
        case 'pending': return { background:'#fff7ed', borderColor:'#f59e0b', color:'#92400e' } as any;
        case 'in-progress': return { background:'#ecfdf5', borderColor:'#10b981', color:'#065f46' } as any;
        case 'on-hold': return { background:'#f3f4f6', borderColor:'#9ca3af', color:'#374151' } as any;
        case 'na': return { background:'#f8fafc', borderColor:'#cbd5e1', color:'#475569' } as any;
        case 'impossible': return { background:'#f1f5f9', borderColor:'#cbd5e1', color:'#334155' } as any;
        case 'done': return { background:'#dbeafe', borderColor:'#3b82f6', color:'#1e40af' } as any;
        default: return {} as any;
      }
    } catch { return {} as any; }
  }

  teamClass(team: string){
    return {
      'team-rmd': team==='원료제조팀',
      'team-cell': team==='식물세포배양팀',
      'team-qc': team==='품질팀',
      'team-rnd': team==='연구팀',
      'team-admin': team==='경영지원팀',
      'team-logi': team==='물류팀',
    } as any;
  }
  statusColor(status: string){
    switch(status){
      case 'pending': return '#f59e0b';
      case 'in-progress': return '#10b981';
      case 'on-hold': return '#fb923c';
      case 'na': return '#94a3b8';
      case 'impossible': return '#ef4444';
      case 'done': return '#3b82f6';
      default: return '#e5e7eb';
    }
  }

  displayDeptName(name: string){
    try{
      return name.replace(/팀$/,'');
    }catch{ return name; }
  }

  pad2(n: number){ return String(n).padStart(2,'0'); }

  canDeleteComment(c: { user: string }){
    if (this.isAdmin) return true;
    const me = (this.userDisplay || '').trim();
    const owner = (c?.user || '').trim();
    return !!me && !!owner && me === owner;
  }

  // Normalize/alias company names to improve matching (e.g., Korean label vs English alias)
  private normalizeCompanyName(name: string): string{
    if (!name) return '';
    const raw = String(name).trim();
    const alias: Record<string,string> = {
      '아모레퍼시픽': 'AMOREPACIFIC',
      '아모레 퍼시픽': 'AMOREPACIFIC',
      '지보단': 'GIVAUDAN',
      '기보단': 'GIVAUDAN',
    };
    return (alias[raw] || raw).toUpperCase();
  }

  // Center and select the item specified by pendingOpenId (if any)
  private async openFromPending(){
    try{
      const id = this.pendingOpenId || null;
      if (!id || id > 214) return;
      
      const target = this.items().find(x => (x as any).id === id);
      if (!target) return;
      
      await this.selectItem(target as any);
      setTimeout(()=> this.centerRow(id), 0);
    }catch{}
    this.pendingOpenId = null;
  }
}
