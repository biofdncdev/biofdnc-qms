import { Component, ViewChild, ElementRef, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuditStateService } from '../services/audit-state.service';
import { AuditUiService } from '../services/audit-ui.service';
import { AuditService } from '../../../../services/audit.service';

@Component({
  selector: 'app-audit-filters',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="filters">
      <div class="filterbar">
        <label style="margin-left:12px">업체</label>
        <select #companySelect class="dept-select" 
                [class.readonly]="!ui.isCompanyEditing"
                (mousedown)="onCompanyMouseDown($event)" 
                (blur)="onCompanyBlur()"
                [(ngModel)]="state.companyFilter" 
                (ngModelChange)="onCompanyFilterChange($event)">
          <option [ngValue]="'ALL'">전체</option>
          <option *ngFor="let c of state.companies" [ngValue]="c">{{ c }}</option>
        </select>
        
        <label style="margin-left:12px">메모</label>
        <input class="kw-input" 
               [class.readonly]="!ui.isMemoEditing" 
               [style.background]="ui.isMemoEditing ? '#ffffff' : ''" 
               [style.color]="ui.isMemoEditing ? '#111827' : ''" 
               [readOnly]="!ui.isMemoEditing"
               style="width:260px;" 
               type="text"
               (mousedown)="onMemoMouseDown($event)" 
               (keydown.enter)="onMemoEnter($event)" 
               (blur)="onMemoBlur()"
               [(ngModel)]="ui.headerMemoDraft" 
               placeholder="이 스냅샷 설명 메모" />
        
        <label style="margin-left:12px">키워드</label>
        <input #kwInput class="kw-input" type="text" 
               [(ngModel)]="state.keyword" 
               (ngModelChange)="onFilterChange.emit()" 
               placeholder="제목/비고/입력/링크/댓글 검색" />
        
        <span *ngIf="ui.headerSavingMeta" class="spinner inline" title="저장중"></span>
        
        <label *ngIf="!state.isGivaudanAudit" style="margin-left:12px">부서</label>
        <select *ngIf="!state.isGivaudanAudit" class="dept-select" 
                [(ngModel)]="state.filterDept" 
                (ngModelChange)="onFilterChange.emit()">
          <option [ngValue]="'ALL'">전체</option>
          <option *ngFor="let d of state.departments" [ngValue]="d">{{ d }}</option>
        </select>
        
        <label *ngIf="!state.isGivaudanAudit" style="margin-left:12px">담당자</label>
        <select *ngIf="!state.isGivaudanAudit" class="dept-select" 
                [(ngModel)]="state.filterOwner" 
                (ngModelChange)="onFilterChange.emit()">
          <option [ngValue]="'ALL'">전체</option>
          <option *ngFor="let u of state.userOptions" [ngValue]="u">{{ u }}</option>
        </select>
      </div>
    </div>
  `,
  styles: [`
    .filters { 
      position: sticky; 
      top: 0; 
      z-index: 8; 
      background: #fff; 
    }
    .filterbar { 
      display: flex; 
      align-items: center; 
      gap: 10px; 
      margin: 0; 
      padding: 8px 10px; 
      flex-wrap: wrap; 
      background: #fff; 
      border: 1px solid #e5e7eb; 
      border-radius: 12px; 
      box-shadow: 0 4px 10px rgba(2,6,23,.04); 
      transition: filter .15s ease; 
    }
    .kw-input { 
      width: 220px; 
      height: 32px; 
      border: 1px solid #d1d5db; 
      border-radius: 10px; 
      padding: 6px 10px; 
      font-family: var(--font-sans-kr); 
      font-size: 13.5px; 
    }
    .kw-input.readonly, 
    .dept-select.readonly { 
      background: #f8fafc; 
      color: #94a3b8; 
      cursor: not-allowed; 
    }
    .dept-select { 
      padding: 6px 8px; 
      border: 1px solid #d1d5db; 
      border-radius: 10px; 
      appearance: none; 
      -webkit-appearance: none; 
      -moz-appearance: none; 
      font-family: var(--font-sans-kr); 
      font-size: 13.5px; 
      width: 150px; 
      max-width: 100%; 
    }
    .spinner.inline { 
      width: 16px; 
      height: 16px; 
      border: 2px solid #cbd5e1; 
      border-top-color: #3b82f6; 
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    @keyframes spin { 
      to { transform: rotate(360deg); } 
    }
  `]
})
export class AuditFiltersComponent {
  @ViewChild('companySelect', { static: false }) companySelect?: ElementRef<HTMLSelectElement>;
  @Output() onFilterChange = new EventEmitter<void>();
  
  private companyFilterSaveTimer: any = null;
  
  constructor(
    public state: AuditStateService,
    public ui: AuditUiService,
    private audit: AuditService
  ) {}
  
  onCompanyMouseDown(ev: MouseEvent) {
    if (!this.ui.isCompanyEditing) {
      ev.preventDefault();
      if (confirm('업체를 수정하시겠습니까?')) {
        this.ui.isCompanyEditing = true;
        this.ui.previousCompanyFilter = this.state.companyFilter;
        
        setTimeout(() => {
          const el = this.companySelect?.nativeElement;
          if (el) {
            el.focus();
            const event = new MouseEvent('mousedown', {
              view: window,
              bubbles: true,
              cancelable: true
            });
            el.dispatchEvent(event);
            el.click();
          }
        }, 0);
      }
    }
  }
  
  onCompanyBlur() {
    if (this.ui.isCompanyEditing && this.state.companyFilter !== this.ui.previousCompanyFilter) {
      if (confirm('업체 필터를 저장하시겠습니까?')) {
        this.ui.previousCompanyFilter = this.state.companyFilter;
      } else {
        this.state.companyFilter = this.ui.previousCompanyFilter;
      }
    }
    this.ui.isCompanyEditing = false;
  }
  
  onCompanyFilterChange(_: any) {
    if (!this.ui.isCompanyEditing) return;
    
    const d = this.state.selectedDate();
    if (!d) return;
    
    this.state.savedMeta[d] = {
      ...(this.state.savedMeta[d] || {}),
      company: this.state.companyFilter,
      memo: this.state.headerMemo
    };
    
    clearTimeout(this.companyFilterSaveTimer);
    this.companyFilterSaveTimer = setTimeout(() => {
      this.ui.headerSavingMeta = true;
      this.audit.upsertAuditDateMeta(d, {
        company: this.state.companyFilter,
        memo: this.state.headerMemo
      }).then((res: any) => {
        if (res?.error) {
          console.error('[onCompanyFilterChange] Save failed:', res.error);
        }
      }).finally(() => {
        this.ui.headerSavingMeta = false;
      });
    }, 100);
    
    this.ui.syncHeaderMemoDraft();
  }
  
  onMemoMouseDown(ev: MouseEvent) {
    if (!this.ui.isMemoEditing) {
      ev.preventDefault();
      if (confirm('메모를 수정하시겠습니까?')) {
        this.ui.isMemoEditing = true;
        this.ui.headerMemoDraft = this.state.headerMemo;
        
        setTimeout(() => {
          const input = ev.target as HTMLInputElement;
          if (input) {
            input.focus();
            input.setSelectionRange(input.value.length, input.value.length);
          }
        }, 0);
      }
    }
  }
  
  onMemoEnter(ev: Event) {
    if (!this.ui.isMemoEditing) return;
    ev.preventDefault();
    this.onMemoBlur();
  }
  
  onMemoBlur() {
    if (!this.ui.isMemoEditing) return;
    
    if (this.ui.headerMemoDraft !== this.state.headerMemo) {
      this.confirmSaveMemo();
    } else {
      this.ui.isMemoEditing = false;
    }
  }
  
  private confirmSaveMemo() {
    const ok = confirm('메모를 저장하시겠습니까?');
    if (ok) {
      const d = this.state.selectedDate();
      if (!d) {
        this.ui.isMemoEditing = false;
        this.ui.headerMemoDraft = this.state.headerMemo;
        return;
      }
      
      this.state.headerMemo = this.ui.headerMemoDraft;
      this.ui.headerSavingMeta = true;
      
      this.audit.upsertAuditDateMeta(d, {
        company: this.state.companyFilter,
        memo: this.state.headerMemo
      }).finally(() => {
        this.ui.headerSavingMeta = false;
        this.ui.syncHeaderMemoDraft();
      });
    } else {
      this.ui.headerMemoDraft = this.state.headerMemo;
    }
    this.ui.isMemoEditing = false;
  }
}
