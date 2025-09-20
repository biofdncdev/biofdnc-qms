import { Injectable, signal } from '@angular/core';
import { AuditStateService } from './audit-state.service';

@Injectable({
  providedIn: 'root'
})
export class AuditUiService {
  // 편집 상태
  isCompanyEditing = false;
  isMemoEditing = false;
  headerMemoDraft = '';
  previousCompanyFilter = 'ALL';
  headerSavingMeta = false;
  
  // Record picker 상태
  recordPickerOpen = false;
  pickerQuery = '';
  pickerStdCat = '';
  pickerDept = '';
  pickerMethod = '';
  pickerPeriod = '';
  pickerIndex = 0;
  hoverPickerIndex = -1;
  pickerNotice: string | null = null;
  pickerTargetItem: any = null;
  
  // Copy modal 상태
  copying = false;
  copyFromDate: string | null = null;
  copyingBusy = signal<boolean>(false);
  copyJustFinished = signal<boolean>(false);
  
  // Drag & Drop 상태
  linkDragItemId: number | null = null;
  linkDragIndex: number = -1;
  linkDragOverIndex: number = -1;
  
  // 기타 UI 상태
  previewing = false;
  previewItem: any = null;
  linkPopup: { id: string; title: string } | null = null;
  rowSaving: Record<number, 'idle' | 'saving' | 'saved'> = {};
  
  // 코멘트 편집 상태
  newComment: Record<number, string> = {};
  editingComment: Record<number, number> = {};
  editCommentText: Record<string, string> = {};
  
  constructor(private state: AuditStateService) {}
  
  setSaving(id: number, state: 'idle' | 'saving' | 'saved') {
    this.rowSaving[id] = state;
  }
  
  keyFor(id: number, i: number): string {
    return `${id}|${i}`;
  }
  
  syncHeaderMemoDraft() {
    if (!this.isMemoEditing) {
      this.headerMemoDraft = this.state.headerMemo;
    }
  }
  
  persistUi(listRef?: HTMLElement | null) {
    try {
      const st = {
        selectedDate: this.state.selectedDate(),
        companyFilter: this.state.companyFilter,
        headerMemo: this.state.headerMemo,
        filterDept: this.state.filterDept,
        filterOwner: this.state.filterOwner,
        scrollTop: listRef?.scrollTop || 0,
        openItemId: this.state.openItemId,
        openExtra: Array.from(this.state.openExtra)
      };
      sessionStorage.setItem('audit.eval.ui.v1', JSON.stringify(st));
      
      // Note: 항목 배열(items)은 세션에 캐시하지 않습니다.
      // isActive 등의 서버 플래그 변경 시 초기 렌더에서 지연/불일치가 발생하므로 캐싱을 비활성화합니다.
    } catch {}
  }
  
  prehydrateFromSession() {
    try {
      const raw = sessionStorage.getItem('audit.eval.ui.v1');
      if (!raw) return;
      const s = JSON.parse(raw);
      
      if (s?.selectedDate) this.state.selectedDate.set(s.selectedDate);
      if (s?.companyFilter) this.state.companyFilter = s.companyFilter;
      if (s?.headerMemo) {
        this.state.headerMemo = s.headerMemo;
        this.syncHeaderMemoDraft();
      }
      if (s?.filterDept) this.state.filterDept = s.filterDept;
      if (s?.filterOwner) this.state.filterOwner = s.filterOwner;
      
      // Restore selected item
      if (typeof s?.openItemId === 'number') {
        this.state.openItemId = s.openItemId;
      }
      
      // Restore open extras
      try {
        const extra = Array.isArray(s?.openExtra) ? s.openExtra : [];
        if (extra && extra.length) {
          this.state.openExtra = new Set<number>(extra);
        }
      } catch {}
      
      // Items cache 복원 비활성화: 서버 상태와의 불일치 방지
    } catch {}
  }

  restoreScrollPosition(listRef?: HTMLElement | null) {
    try {
      const raw = sessionStorage.getItem('audit.eval.ui.v1');
      if (!raw || !listRef) return;
      const s = JSON.parse(raw);
      
      if (typeof s?.scrollTop === 'number') {
        // Immediate scroll restoration without delay
        listRef.scrollTop = s.scrollTop;
      }
    } catch {}
  }
}
