import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuditStateService } from '../services/audit-state.service';

@Component({
  selector: 'app-audit-header',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <header class="audit-header">
      <div class="title">Audit <small class="sub">평가 기록</small></div>
      <div class="controls">
        <label>Audit Date</label>
        <input class="date-input" type="date" 
               [ngModel]="state.selectedDate()" 
               (ngModelChange)="dateChange.emit($event)" />
        
        <button class="btn info" 
                [disabled]="state.saving() || isDateCreated()" 
                (click)="onCreate.emit()">
          {{ state.saving() ? '생성중...' : '생성' }} 
          <span *ngIf="state.saving()" class="spinner inline" style="margin-left:6px"></span>
        </button>
        
        <span class="created-note" *ngIf="isDateCreated()">
          생성됨: {{ state.createdDateOnly() }}
          <button class="btn mini danger outline-red" 
                  style="margin-left:6px" 
                  (click)="onDelete.emit()" 
                  [disabled]="state.deleting()">
            {{ state.deleting() ? '삭제중...' : '삭제' }} 
            <span *ngIf="state.deleting()" class="spinner inline" style="margin-left:4px"></span>
          </button>
        </span>
        
        <div class="saved-wrap">
          <label>저장된 날짜</label>
          <button class="btn dropdown" (click)="toggleSavedOpen($event)">
            {{ state.savedSelectedDate || (state.savedDates[0] || '날짜 선택') }}
          </button>
          <div class="saved-menu" *ngIf="state.savedOpen" (click)="$event.stopPropagation()">
            <div class="saved-item" *ngFor="let d of state.savedDates" (click)="selectSavedDate(d)">
              {{ d }}
              <span class="hint-inline" *ngIf="state.savedMeta[d]"> 
                · {{ state.savedMeta[d]?.company || 'ALL' }} 
                · {{ state.savedMeta[d]?.memo || '' }}
              </span>
            </div>
            <div class="saved-empty" *ngIf="!state.savedDates?.length">저장된 날짜가 없습니다</div>
          </div>
        </div>
        
        <button class="btn success outline-blue" 
                (click)="onLoadSaved.emit()" 
                [disabled]="state.loadingSaved()">
          불러오기
        </button>
        <span *ngIf="state.loadingSaved()" class="spinner inline" title="불러오는 중…"></span>
        
        <button class="btn" title="복사" (click)="onCopy.emit()">복사</button>
      </div>
    </header>
  `,
  styles: [`
    .audit-header { 
      display: flex; 
      justify-content: space-between; 
      align-items: center; 
      margin-bottom: 14px; 
    }
    .title { 
      font-weight: 800; 
      font-size: 20px; 
    }
    .title .sub { 
      font-weight: 500; 
      color: #64748b; 
      margin-left: 6px; 
      font-size: .85em; 
    }
    .controls { 
      display: flex; 
      align-items: center; 
      gap: 8px; 
      position: relative; 
    }
    .controls select, 
    .controls input[type='date'] { 
      padding: 8px 10px; 
      border-radius: 10px; 
      border: 1px solid #d1d5db; 
      font-family: var(--font-sans-kr); 
      font-size: 13.5px; 
      height: 36px; 
      box-sizing: border-box; 
    }
    .controls .date-input { 
      font-weight: 400; 
    }
    .controls .btn { 
      font-weight: 400; 
    }
    .controls .btn:disabled { 
      background: #e5e7eb !important; 
      color: #9ca3af !important; 
      border-color: #e5e7eb !important; 
      cursor: not-allowed; 
      box-shadow: none; 
    }
    .controls .btn:disabled:hover { 
      filter: none; 
    }
    .btn.outline-red { 
      background: #fff !important; 
      color: #dc2626 !important; 
      border: 1px solid #fca5a5 !important; 
    }
    .btn.outline-blue { 
      background: #fff !important; 
      color: #2563eb !important; 
      border: 1px solid #93c5fd !important; 
    }
    .btn.danger { 
      background: #ffffff !important; 
      color: #dc2626 !important; 
      border: 1px solid #fca5a5 !important; 
    }
    .btn.danger:hover { 
      background: #fff5f5 !important; 
      border-color: #f87171 !important; 
    }
    .saved-wrap { 
      position: relative; 
      display: flex; 
      align-items: center; 
      gap: 8px; 
    }
    .saved-wrap label { 
      color: #475569; 
      font-size: 12px; 
    }
    .saved-wrap .dropdown { 
      background: #fff; 
      border-color: #d1d5db; 
      color: #0f172a; 
      font-weight: 400; 
      height: 36px; 
    }
    .saved-menu { 
      position: absolute; 
      top: 36px; 
      left: 64px; 
      min-width: 180px; 
      max-height: 220px; 
      overflow: auto; 
      background: #fff; 
      border: 1px solid #e5e7eb; 
      border-radius: 12px; 
      box-shadow: 0 12px 28px rgba(2,6,23,.18); 
      padding: 6px; 
      z-index: 20; 
    }
    .saved-item { 
      padding: 8px 10px; 
      border-radius: 8px; 
      cursor: pointer; 
      font-size: 13px; 
    }
    .saved-item:hover { 
      background: #f1f5f9; 
    }
    .saved-empty { 
      color: #94a3b8; 
      padding: 8px 6px; 
      font-size: 12px; 
    }
    .created-note { 
      font-size: 12px; 
      color: #6b7280; 
      margin-left: 8px; 
    }
    .spinner { 
      width: 14px; 
      height: 14px; 
      border-radius: 50%; 
      border: 2px solid #cbd5e1; 
      border-top-color: #3b82f6; 
      animation: spin 1s linear infinite; 
    }
    .spinner.inline { 
      width: 16px; 
      height: 16px; 
      border: 2px solid #cbd5e1; 
      border-top-color: #3b82f6; 
    }
    @keyframes spin { 
      to { transform: rotate(360deg); } 
    }
  `]
})
export class AuditHeaderComponent {
  @Output() onCreate = new EventEmitter<void>();
  @Output() onDelete = new EventEmitter<void>();
  @Output() onLoadSaved = new EventEmitter<void>();
  @Output() onCopy = new EventEmitter<void>();
  @Output() dateChange = new EventEmitter<string>();
  
  constructor(public state: AuditStateService) {}
  
  isDateCreated(): boolean {
    const d = this.state.selectedDate();
    return !!d && this.state.savedDates.includes(d);
  }
  
  toggleSavedOpen(ev: MouseEvent) {
    ev.stopPropagation();
    this.state.savedOpen = !this.state.savedOpen;
  }
  
  selectSavedDate(d: string) {
    this.state.savedSelectedDate = d;
    this.state.savedOpen = false;
    
    const meta = this.state.savedMeta[d];
    if (meta) {
      this.state.companyFilter = meta.company || 'ALL';
      this.state.headerMemo = meta.memo || '';
    }
  }
}
