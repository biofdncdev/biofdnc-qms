import { Component, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuditItem } from '../types/audit.types';
import { AuditStateService } from '../services/audit-state.service';
import { AuditUiService } from '../services/audit-ui.service';
import { AuditItemDetailsComponent } from './audit-item-details.component';

@Component({
  selector: 'app-audit-item-list',
  standalone: true,
  imports: [CommonModule, FormsModule, AuditItemDetailsComponent],
  template: `
    <section class="checklist" #listRef>
      <div class="group">
        <div class="item" 
             *ngFor="let it of visibleItems(); trackBy: trackByItem" 
             [class.open]="isOpen(it)" 
             [class.selected]="state.openItemId === it.id" 
             (click)="onSelectItem.emit(it)" 
             [attr.data-id]="it.id" 
             (mouseenter)="state.hoverItemId = it.id" 
             (mouseleave)="state.hoverItemId = null">
          
          <div class="id">{{ it.id | number:'2.0-0' }}</div>
          
          <div class="text">
            <div class="ko">{{ it.titleKo }}</div>
            <div class="en">{{ it.titleEn }}</div>
          </div>
          
          <div class="state">
            <!-- Status select -->
            <select class="status-select" 
                    [(ngModel)]="it.status" 
                    (ngModelChange)="onSaveProgress.emit(it)" 
                    [ngClass]="statusClass(it.status)" 
                    [ngStyle]="statusStyle(it.status)" 
                    (click)="$event.stopPropagation()">
              <option *ngFor="let s of statusOptions" [value]="s.value">
                {{ s.emoji }} {{ s.label }}
              </option>
            </select>
            
            <!-- Company select -->
            <select class="status-select after-status pill" 
                    [(ngModel)]="it.company" 
                    (ngModelChange)="onSaveProgress.emit(it)" 
                    title="업체 선택" 
                    (click)="$event.stopPropagation()">
              <option *ngFor="let c of state.companies" [ngValue]="c">{{ c }}</option>
            </select>
            
            <!-- Save status -->
            <span class="save-badge saved saved-inline" 
                  *ngIf="ui.rowSaving[it.id] === 'saved'">저장됨</span>
            
            <!-- Note input -->
            <textarea class="note-input" 
                      [(ngModel)]="it.note" 
                      placeholder="보완 요청 코드" 
                      spellcheck="false" 
                      (ngModelChange)="onNoteChange(it)" 
                      (input)="autoResize($event)" 
                      (blur)="onSaveProgress.emit(it)"></textarea>
            
            <!-- Company chips -->
            <div class="col2-bottom">
              <div class="chips companies" *ngIf="it.companies?.length">
                <span class="chip" *ngFor="let c of it.companies; trackBy: trackByValue">
                  {{ c }}
                  <button class="remove" 
                          (click)="removeCompany(it, c); $event.stopPropagation()">×</button>
                </span>
              </div>
              
              <!-- Department chips -->
              <div class="chips depts" 
                   *ngIf="!state.isGivaudanAudit && it.departments?.length">
                <span class="chip" 
                      *ngFor="let d of it.departments; trackBy: trackByValue" 
                      [ngClass]="teamClass(d)">
                  {{ displayDeptName(d) }}
                  <button class="remove" 
                          (click)="removeDept(it, d); $event.stopPropagation()">×</button>
                </span>
              </div>
            </div>
            
            <!-- Department select -->
            <select *ngIf="!state.isGivaudanAudit" 
                    class="dept-select" 
                    [ngModel]="''" 
                    (ngModelChange)="addDept(it, $event)" 
                    title="담당 부서 추가" 
                    (click)="$event.stopPropagation()">
              <option value="" disabled>담당 부서 추가</option>
              <option *ngFor="let d of state.departments" 
                      [value]="d" 
                      [disabled]="it.departments.includes(d)">{{ d }}</option>
            </select>
            
            <span class="save-badge saved-inline" 
                  *ngIf="ui.rowSaving[it.id] === 'saving'">
              <span class="spinner inline"></span>
            </span>
            
            <!-- Owner select -->
            <select *ngIf="!state.isGivaudanAudit" 
                    class="dept-select owner-select" 
                    [ngModel]="''" 
                    (ngModelChange)="addOwner(it, $event)" 
                    title="담당자 추가" 
                    (click)="$event.stopPropagation()">
              <option value="" disabled>담당자 추가</option>
              <option *ngFor="let u of state.userOptions" 
                      [value]="u" 
                      [disabled]="(it.owners || []).includes(u)">{{ u }}</option>
            </select>
            
            <!-- Owner chips -->
            <div class="chips owners" 
                 *ngIf="!state.isGivaudanAudit && it.owners?.length">
              <span class="chip" *ngFor="let u of it.owners; trackBy: trackByValue">
                {{ u }}
                <button class="remove" 
                        (click)="removeOwner(it, u); $event.stopPropagation()">×</button>
              </span>
            </div>
            
            <!-- Toggle button -->
            <button type="button" 
                    class="toggle-chevron chevron-inline" 
                    (click)="onToggleExtra.emit(it); $event.stopPropagation()" 
                    title="열기/닫기"></button>
          </div>
          
          <!-- Details section (expanded content) -->
          <div class="details" *ngIf="isOpen(it)" (click)="$event.stopPropagation()">
            <app-audit-item-details
              [item]="it"
              [isDateCreated]="isDateCreated()"
              (onSaveProgress)="onSaveProgress.emit(it)"
              (onOpenRecordPicker)="onOpenRecordPicker.emit(it)"
              (onTextareaKeydown)="$event"
              (onAddComment)="onAddComment.emit(it)"
              (onRemoveComment)="onRemoveComment.emit({ it: it, index: $event })"
              (onStartEditComment)="onStartEditComment.emit({ it: it, index: $event.index, text: $event.text })"
              (onSaveEditComment)="onSaveEditComment.emit({ it: it, index: $event })"
              (onCancelEditComment)="onCancelEditComment.emit({ it: it, index: $event })"
              (onEditCommentKeydown)="onEditCommentKeydown.emit({ ev: $event.event, it: it, index: $event.index })"
              (onLinkChipClick)="$event"
              (onRemoveSelectedLink)="$event"
              (onLinkDragStart)="$event"
              (onLinkDragOver)="$event"
              (onLinkDragLeave)="$event"
              (onLinkDrop)="$event"
              (onLinkDragEnd)="$event"
              (onLinkListDragOver)="$event"
              (onLinkListDrop)="$event"
              (onLinkDragOverEnd)="$event"
              (onLinkDropEnd)="$event"
              (onCommentKeydown)="$event">
            </app-audit-item-details>
          </div>
        </div>
      </div>
    </section>
  `,
  styleUrls: ['./audit-item-list.component.scss']
})
export class AuditItemListComponent {
  @ViewChild('listRef') listRef?: ElementRef<HTMLDivElement>;
  
  @Output() onSelectItem = new EventEmitter<AuditItem>();
  @Output() onSaveProgress = new EventEmitter<AuditItem>();
  @Output() onToggleExtra = new EventEmitter<AuditItem>();
  @Output() onAddComment = new EventEmitter<AuditItem>();
  @Output() onOpenRecordPicker = new EventEmitter<AuditItem>();
  @Output() onRemoveComment = new EventEmitter<{ it: AuditItem; index: number }>();
  @Output() onStartEditComment = new EventEmitter<{ it: AuditItem; index: number; text: string }>();
  @Output() onSaveEditComment = new EventEmitter<{ it: AuditItem; index: number }>();
  @Output() onCancelEditComment = new EventEmitter<{ it: AuditItem; index: number }>();
  @Output() onEditCommentKeydown = new EventEmitter<{ ev: KeyboardEvent; it: AuditItem; index: number }>();
  
  private noteTimers: Record<number, any> = {};
  
  statusOptions = [
    { value: 'pending', label: '준비중 / Pending', emoji: '' },
    { value: 'in-progress', label: '진행중 / In progress', emoji: '' },
    { value: 'on-hold', label: '보류 / On hold', emoji: '' },
    { value: 'na', label: '해당없음 / N.A.', emoji: '' },
    { value: 'impossible', label: '불가 / Not possible', emoji: '' },
    { value: 'done', label: '완료 / Done', emoji: '' }
  ];
  
  constructor(
    public state: AuditStateService,
    public ui: AuditUiService
  ) {}
  
  visibleItems(): AuditItem[] {
    const base = this.state.items().filter((it: any) => Number(it.id) !== 25);
    const uniqMap = new Map<number, any>();
    
    for (const it of base) {
      if (!uniqMap.has(it.id)) {
        uniqMap.set(it.id, it);
      }
    }
    
    const arr = Array.from(uniqMap.values());
    const kw = (this.state.keyword || '').trim().toLowerCase();
    
    const byKw = kw ? arr.filter((it: any) => {
      const links = ((it.selectedLinks || []) as any[])
        .map(l => `${l.id || ''} ${l.title || ''}`).join(' ');
      const comments = ((it.comments || []) as any[])
        .map(c => `${c.text || ''}`).join(' ');
      const hay = `${it.titleKo || ''} ${it.titleEn || ''} ${it.note || ''} 
                   ${it.col1Text || ''} ${it.col3Text || ''} ${links} ${comments}`.toLowerCase();
      return hay.includes(kw);
    }) : arr;
    
    const byDept = this.state.filterDept === 'ALL' 
      ? byKw 
      : byKw.filter((it: any) => (it.departments || []).includes(this.state.filterDept));
    
    const byOwner = this.state.filterOwner === 'ALL' 
      ? byDept 
      : byDept.filter((it: any) => (it.owners || []).includes(this.state.filterOwner));
    
    if (this.state.companyFilter === 'ALL') return byOwner;
    
    const selected = this.state.companyFilter;
    const selectedNorm = this.normalizeCompanyName(selected);
    
    return byOwner.filter((it: any) => {
      const tags = (it.companies || []).map((x: string) => this.normalizeCompanyName(x));
      const primary = this.normalizeCompanyName(it.company || '');
      return tags.includes(selectedNorm) || primary === selectedNorm;
    });
  }
  
  isOpen(it: AuditItem): boolean {
    return this.state.openItemId === it.id || this.state.openExtra.has(it.id);
  }
  
  isDateCreated(): boolean {
    const d = this.state.selectedDate();
    return !!d && this.state.savedDates.includes(d);
  }
  
  trackByItem = (_: number, it: AuditItem) => it.id;
  trackByValue = (_: number, v: string) => v;
  
  onNoteChange(it: AuditItem) {
    const id = it?.id;
    if (!id) return;
    
    clearTimeout(this.noteTimers[id]);
    this.noteTimers[id] = setTimeout(() => {
      this.onSaveProgress.emit(it);
    }, 600);
  }
  
  autoResize(ev: any) {
    const ta = ev?.target as HTMLTextAreaElement;
    if (!ta) return;
    
    const lineBreaks = (ta.value.match(/\n/g) || []).length;
    if (lineBreaks === 0) {
      ta.style.height = '32px';
      return;
    }
    
    ta.style.height = 'auto';
    ta.style.height = Math.min(120, Math.max(ta.scrollHeight, 32)) + 'px';
  }
  
  addDept(it: AuditItem, dept: string) {
    if (!dept) return;
    if (!it.departments) it.departments = [];
    
    if (!it.departments.includes(dept)) {
      const date = this.state.selectedDate();
      if (!date || !this.state.savedDates.includes(date)) {
        this.state.showToast('먼저 생성 버튼으로 이 날짜를 생성해 주세요');
        return;
      }
      it.departments.push(dept);
      this.onSaveProgress.emit(it);
    }
  }
  
  removeDept(it: AuditItem, dept: string) {
    const date = this.state.selectedDate();
    if (!date || !this.state.savedDates.includes(date)) {
      this.state.showToast('먼저 생성 버튼으로 이 날짜를 생성해 주세요');
      return;
    }
    it.departments = (it.departments || []).filter((d: string) => d !== dept);
    this.onSaveProgress.emit(it);
  }
  
  addOwner(it: AuditItem, owner: string) {
    if (!owner) return;
    const date = this.state.selectedDate();
    if (!date || !this.state.savedDates.includes(date)) {
      this.state.showToast('먼저 생성 버튼으로 이 날짜를 생성해 주세요');
      return;
    }
    if (!it.owners) it.owners = [];
    if (!(it.owners as string[]).includes(owner)) {
      (it.owners as string[]).push(owner);
      this.onSaveProgress.emit(it);
    }
  }
  
  removeOwner(it: AuditItem, owner: string) {
    const date = this.state.selectedDate();
    if (!date || !this.state.savedDates.includes(date)) {
      this.state.showToast('먼저 생성 버튼으로 이 날짜를 생성해 주세요');
      return;
    }
    it.owners = (it.owners || []).filter((x: string) => x !== owner);
    this.onSaveProgress.emit(it);
  }
  
  removeCompany(it: AuditItem, c: string) {
    const date = this.state.selectedDate();
    if (!date || !this.state.savedDates.includes(date)) {
      this.state.showToast('먼저 생성 버튼으로 이 날짜를 생성해 주세요');
      return;
    }
    it.companies = (it.companies || []).filter((x: string) => x !== c);
    this.onSaveProgress.emit(it);
  }
  
  statusClass(status: string) {
    return {
      'status-pending': status === 'pending',
      'status-in-progress': status === 'in-progress',
      'status-on-hold': status === 'on-hold',
      'status-na': status === 'na',
      'status-impossible': status === 'impossible',
      'status-done': status === 'done'
    };
  }
  
  statusStyle(status: string) {
    try {
      switch (status) {
        case 'pending': return { background: '#fff7ed', borderColor: '#f59e0b', color: '#92400e' };
        case 'in-progress': return { background: '#ecfdf5', borderColor: '#10b981', color: '#065f46' };
        case 'on-hold': return { background: '#f3f4f6', borderColor: '#9ca3af', color: '#374151' };
        case 'na': return { background: '#f8fafc', borderColor: '#cbd5e1', color: '#475569' };
        case 'impossible': return { background: '#f1f5f9', borderColor: '#cbd5e1', color: '#334155' };
        case 'done': return { background: '#dbeafe', borderColor: '#3b82f6', color: '#1e40af' };
        default: return {};
      }
    } catch {
      return {};
    }
  }
  
  teamClass(team: string) {
    return {
      'team-rmd': team === '원료제조팀',
      'team-cell': team === '식물세포배양팀',
      'team-qc': team === '품질팀',
      'team-rnd': team === '연구팀',
      'team-admin': team === '경영지원팀',
      'team-logi': team === '물류팀'
    };
  }
  
  displayDeptName(name: string): string {
    try {
      return name.replace(/팀$/, '');
    } catch {
      return name;
    }
  }
  
  private normalizeCompanyName(name: string): string {
    if (!name) return '';
    const raw = String(name).trim();
    const alias: Record<string, string> = {
      '아모레퍼시픽': 'AMOREPACIFIC',
      '아모레 퍼시픽': 'AMOREPACIFIC',
      '지보단': 'GIVAUDAN',
      '기보단': 'GIVAUDAN'
    };
    return (alias[raw] || raw).toUpperCase();
  }
}
