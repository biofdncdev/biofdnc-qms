import { Injectable, signal } from '@angular/core';
import { AuditItem, AuditDate } from '../types/audit.types';

@Injectable({
  providedIn: 'root'
})
export class AuditStateService {
  // UI 상태
  items = signal<AuditItem[]>(this.createInitialItems());
  selectedDate = signal<string>('');
  savedDates: string[] = [];
  savedSelectedDate: string | null = null;
  savedOpen = false;
  saving = signal(false);
  deleting = signal(false);
  loadingSaved = signal(false);
  createdAt: string | null = null;
  
  // 필터 상태
  companyFilter: 'ALL' | string = 'ALL';
  headerMemo: string = '';
  savedMeta: Record<string, { company?: string; memo?: string }> = {};
  filterDept: 'ALL' | string = 'ALL';
  filterOwner: 'ALL' | string = 'ALL';
  keyword: string = '';
  
  // UI 상태
  openItemId: number | null = null;
  openExtra = new Set<number>();
  hoverItemId: number | null = null;
  toast: string | null = null;
  
  // 사용자 정보
  userDisplay = '사용자';
  currentUserId: string | null = null;
  isAdmin = false;
  isGivaudanAudit = false;
  
  // 옵션 데이터
  companies: string[] = [];
  departments = ['원료제조팀', '식물세포배양팀', '품질팀', '연구팀', '경영지원팀', '물류팀'];
  userOptions: string[] = [];
  
  private createInitialItems(): AuditItem[] {
    return Array.from({ length: 214 }, (_, i) => {
      const id = i + 1;
      const base: AuditItem = {
        id,
        titleKo: id === 105 ? 'GIVADAN Audit 최종 평가' : `점검 항목 ${id}`,
        titleEn: `Inspection item ${id}`,
        done: false,
        status: 'pending',
        note: '',
        departments: [],
        owners: [],
        companies: [],
        col1Text: '',
        col3Text: '',
        selectedLinks: []
      };
      return base;
    });
  }
  
  resetItems() {
    const blank = Array.from({ length: 214 }, (_, i) => {
      const id = i + 1;
      const row: AuditItem = {
        id,
        titleKo: id === 105 ? 'GIVADAN Audit 최종 평가' : `점검 항목 ${id}`,
        titleEn: `Inspection item ${id}`,
        done: false,
        status: 'pending',
        note: '',
        departments: [],
        owners: [],
        companies: [],
        col1Text: '',
        col3Text: '',
        selectedLinks: []
      };
      return row;
    });
    const curr = this.items();
    for (let i = 0; i < curr.length; i++) curr[i] = blank[i];
    this.items.set(curr);
  }
  
  showToast(msg: string) {
    this.toast = msg;
    setTimeout(() => this.toast = null, 1400);
  }
  
  today(): string {
    const d = new Date();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${mm}-${dd}`;
  }
  
  createdDateOnly(): string {
    const s = this.createdAt || this.selectedDate();
    if (!s) return '';
    try {
      return String(s).slice(0, 10);
    } catch {
      return s;
    }
  }
}
