import { Component, OnInit, AfterViewInit, signal, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuditService } from '../../../services/audit.service';
import { AuthService } from '../../../services/auth.service';

interface AuditItem {
  number: number;
  title_ko: string;
  title_en: string;
  is_active: boolean;
  category_no?: string;
  question?: string;
  translation?: string;
  isNew?: boolean; // 새로 추가된 항목인지 표시
}

@Component({
  selector: 'app-audit-items-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <div class="header">
        <h1>Audit 평가 항목 관리</h1>
        <div class="actions">
          <button class="btn" (click)="addNewItem()" style="background: #10b981; color: white; border-color: #10b981;">
            + 추가
          </button>
          <button class="btn primary" (click)="saveAll()" [disabled]="saving()">
            <span *ngIf="!saving()">저장</span>
            <span *ngIf="saving()">저장 중...</span>
          </button>
        </div>
      </div>

      <div class="table-container">
        <table class="items-table">
          <thead>
            <tr>
              <th width="60">번호</th>
              <th width="80">사용</th>
              <th width="22%">제목</th>
              <th width="68%">부제목</th>
            </tr>
          </thead>
        </table>
        <div class="scroll-body">
          <table class="items-table">
            <colgroup>
              <col style="width:60px" />
              <col style="width:80px" />
              <col style="width:22%" />
              <col />
            </colgroup>
            <tbody>
            <tr *ngFor="let item of items(); trackBy: trackByNumber" [class.inactive]="!item.is_active">
              <td class="center">{{ item.number }}</td>
              <td class="center">
                <label class="switch">
                  <input type="checkbox" [(ngModel)]="item.is_active" (change)="onToggleActive(item)">
                  <span class="slider"></span>
                </label>
              </td>
              <td>
                <textarea 
                  class="input-field" 
                  [(ngModel)]="item.title_ko" 
                  (blur)="onFieldChange(item)"
                  (input)="autoGrow($event)"
                  #titleKoTa
                  rows="2"
                  placeholder="항목 제목 입력">
                </textarea>
              </td>
              <td>
                <textarea 
                  class="input-field" 
                  [(ngModel)]="item.title_en" 
                  (blur)="onFieldChange(item)"
                  (input)="autoGrow($event)"
                  #titleEnTa
                  rows="2"
                  placeholder="항목 부제목 입력">
                </textarea>
              </td>
              
            </tr>
            </tbody>
          </table>
        </div>
      </div>

      
    </div>
  `,
  styles: [`
    .container {
      display: grid;
      grid-template-rows: auto 1fr;
      gap: 16px;
      padding: 24px;
      max-width: 1400px;
      height: calc(100% - 32px);
      min-height: 0;
      margin: 0 auto;
      box-sizing: border-box;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 2px solid #e5e7eb;
    }

    .header h1 {
      font-size: 24px;
      font-weight: 600;
      color: #1f2937;
      margin: 0;
    }

    .actions {
      display: flex;
      gap: 12px;
    }

    .btn {
      padding: 8px 16px;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      border: 1px solid transparent;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      line-height: 1;
    }

    .btn.primary {
      background: #3b82f6;
      color: white;
      border-color: #3b82f6;
    }

    .btn.primary:hover:not(:disabled) {
      background: #2563eb;
      border-color: #2563eb;
    }

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .table-container {
      background: white;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      border: 1px solid #e5e7eb;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      min-height: 0;
    }

    .items-table {
      width: 100%;
      border-collapse: collapse;
      table-layout: fixed;
    }

    .items-table thead {
      background: #f9fafb;
    }
    
    .table-container > .items-table {
      flex-shrink: 0;
    }

    .items-table th {
      padding: 12px;
      text-align: left;
      font-size: 13px;
      font-weight: 600;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 2px solid #e5e7eb;
    }

    .items-table tbody tr {
      border-bottom: 1px solid #f3f4f6;
      transition: background 0.2s;
    }

    .items-table tbody tr:hover {
      background: #f9fafb;
    }

    .items-table tbody tr.inactive {
      background: #fef2f2;
      opacity: 0.7;
    }

    .items-table td {
      padding: 12px;
      font-size: 14px;
      color: #374151;
    }

    .scroll-body {
      overflow: auto;
      flex: 1;
      min-height: 0;
      max-height: calc(100vh - 280px);
      padding-bottom: 24px;
      box-sizing: border-box;
    }

    .items-table td.center {
      text-align: center;
    }

    .input-field {
      width: 100%;
      padding: 6px 10px;
      border: 1px solid #d1d5db;
      border-radius: 4px;
      font-size: 13px;
      font-family: 'Noto Sans KR', sans-serif;
      transition: all 0.2s;
      resize: vertical;
      min-height: 36px;
    }

    textarea.input-field {
      line-height: 1.4;
    }

    .input-field:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .switch {
      position: relative;
      display: inline-block;
      width: 44px;
      height: 24px;
    }

    .switch input {
      opacity: 0;
      width: 0;
      height: 0;
    }

    .slider {
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: #cbd5e1;
      transition: 0.3s;
      border-radius: 24px;
    }

    .slider:before {
      position: absolute;
      content: "";
      height: 18px;
      width: 18px;
      left: 3px;
      bottom: 3px;
      background-color: white;
      transition: 0.3s;
      border-radius: 50%;
    }

    input:checked + .slider {
      background-color: #10b981;
    }

    input:checked + .slider:before {
      transform: translateX(20px);
    }

    .btn-icon {
      width: 32px;
      height: 32px;
      border-radius: 4px;
      border: 1px solid #d1d5db;
      background: white;
      cursor: pointer;
      transition: all 0.2s;
      font-size: 16px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .btn-icon:hover {
      background: #f3f4f6;
      border-color: #9ca3af;
    }

    .btn-icon.save:hover {
      background: #dcfce7;
      border-color: #10b981;
    }

    
  `]
})
export class AuditItemsManagementComponent implements OnInit, AfterViewInit {
  items = signal<AuditItem[]>([]);
  saving = signal(false);
  modifiedItems = new Set<number>();
  @ViewChildren('titleKoTa') titleKoTAs!: QueryList<ElementRef<HTMLTextAreaElement>>;
  @ViewChildren('titleEnTa') titleEnTAs!: QueryList<ElementRef<HTMLTextAreaElement>>;

  constructor(
    private audit: AuditService,
    private auth: AuthService
  ) {}

  async ngOnInit() {
    await this.loadItems();
  }
  ngAfterViewInit(): void {
    const sub = () => setTimeout(() => this.measureAll(), 0);
    this.titleKoTAs?.changes?.subscribe(sub);
    this.titleEnTAs?.changes?.subscribe(sub);
    sub();
  }

  async loadItems() {
    try {
      const data = await this.audit.listAuditItems();
      this.items.set(data || []);
      setTimeout(() => this.measureAll(), 0);
    } catch (error) {
      console.error('Failed to load audit items:', error);
      alert('항목을 불러오는 중 오류가 발생했습니다.');
    }
  }

  trackByNumber(index: number, item: AuditItem): number {
    return item.number;
  }

  onFieldChange(item: AuditItem) {
    this.modifiedItems.add(item.number);
  }

  autoGrow(ev: Event) {
    const ta = ev?.target as HTMLTextAreaElement;
    if (!ta) return;
    ta.style.overflow = 'hidden';
    ta.style.height = 'auto';
    ta.style.height = ta.scrollHeight + 'px';
  }

  private measureAll() {
    const all = [
      ...(this.titleKoTAs ? this.titleKoTAs.toArray() : []),
      ...(this.titleEnTAs ? this.titleEnTAs.toArray() : [])
    ];
    for (const ref of all) {
      const ta = ref?.nativeElement as HTMLTextAreaElement;
      if (!ta) continue;
      ta.style.overflow = 'hidden';
      ta.style.height = 'auto';
      ta.style.height = ta.scrollHeight + 'px';
    }
  }

  async onToggleActive(item: AuditItem) {
    // 새 항목은 저장 후에만 토글 가능
    if (item.isNew) {
      item.is_active = !item.is_active; // 되돌리기
      alert('새 항목은 저장 후에 사용 여부를 변경할 수 있습니다.');
      return;
    }
    
    try {
      await this.audit.toggleAuditItemActive(item.number, item.is_active);
      console.log(`Item ${item.number} active status changed to ${item.is_active}`);
    } catch (error) {
      console.error('Failed to toggle item active status:', error);
      // Revert the change
      item.is_active = !item.is_active;
      alert('상태 변경 중 오류가 발생했습니다.');
    }
  }

  async saveItem(item: AuditItem) {
    try {
      // upsert 방식으로 저장 (새 항목이든 기존 항목이든 처리)
      await this.audit.upsertAuditItems([{
        number: item.number,
        titleKo: item.title_ko || '',
        titleEn: item.title_en || ''
      }]);
      
      // 새 항목이었다면 isNew 플래그 제거
      if (item.isNew) {
        delete item.isNew;
      }
      
      this.modifiedItems.delete(item.number);
      console.log(`Item ${item.number} saved successfully`);
    } catch (error) {
      console.error('Failed to save item:', error);
      alert('저장 중 오류가 발생했습니다.');
    }
  }

  addNewItem() {
    const currentItems = this.items();
    const maxNumber = currentItems.length > 0 
      ? Math.max(...currentItems.map(item => item.number))
      : 0;
    
    const newItem: AuditItem = {
      number: maxNumber + 1,
      title_ko: '',
      title_en: '',
      is_active: true,
      category_no: '',
      question: '',
      translation: '',
      isNew: true // 새 항목 표시
    };
    
    this.items.set([...currentItems, newItem]);
    this.modifiedItems.add(newItem.number);
    
    // 스크롤을 맨 아래로 이동
    setTimeout(() => {
      const scrollBody = document.querySelector('.scroll-body');
      if (scrollBody) {
        scrollBody.scrollTop = scrollBody.scrollHeight;
      }
      this.measureAll();
    }, 0);
  }

  async saveAll() {
    if (this.modifiedItems.size === 0) {
      alert('변경된 항목이 없습니다.');
      return;
    }

    this.saving.set(true);
    try {
      const itemsToSave = this.items().filter(item => this.modifiedItems.has(item.number));
      
      for (const item of itemsToSave) {
        await this.saveItem(item);
      }
      
      alert('모든 변경사항이 저장되었습니다.');
    } catch (error) {
      console.error('Failed to save all items:', error);
      alert('일부 항목 저장 중 오류가 발생했습니다.');
    } finally {
      this.saving.set(false);
    }
  }
}
