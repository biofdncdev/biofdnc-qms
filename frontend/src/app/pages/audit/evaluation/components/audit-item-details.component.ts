import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, AfterViewInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuditItem, LinkItem } from '../types/audit.types';
import { AuditStateService } from '../services/audit-state.service';
import { AuditUiService } from '../services/audit-ui.service';

@Component({
  selector: 'app-audit-item-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="details-inner comments-on">
      <!-- Column 1: Assessment details -->
      <textarea #slide1 class="status-select slide-input" 
               style="grid-row:1; grid-column:1; width:100%;" 
               [attr.id]="'input-'+item.id+'-1'" 
               [attr.data-col]="1" 
               [style.height.px]="item.__h1 || 120" 
               rows="5" 
               spellcheck="false" 
               [(ngModel)]="item.col1Text" 
               (input)="onAutoResize($event, '__h1')" 
               (blur)="onSaveProgress.emit()" 
               placeholder="평가 항목 세부 사항" 
               (keydown)="onTextareaKeydown.emit($event)">
      </textarea>

      <!-- Column 2: Links -->
      <div class="link-cell" style="grid-row:1; grid-column:2; display:flex; flex-direction:column; gap:6px; width:100%;">
        <button class="btn mini pick-btn" 
                style="align-self:flex-start; margin:4px 0;" 
                (click)="onOpenRecordPicker.emit()">
          규정/기록 선택
        </button>
        <div class="link-list" 
             style="display:flex; flex-direction:column; gap:6px; width:100%;"
             (dragover)="onLinkListDragOver.emit($event)" 
             (drop)="onLinkListDrop.emit($event)">
          <button *ngFor="let l of (item.selectedLinks||[]); let i = index" 
                  class="link-button" 
                  [class.link-standard]="l.kind==='standard'" 
                  [class.link-record]="l.kind==='record'"
                  draggable="true"
                  [class.dragging]="ui.linkDragItemId===item.id && ui.linkDragIndex===i"
                  [class.drag-over]="ui.linkDragItemId===item.id && ui.linkDragOverIndex===i"
                  (dragstart)="onLinkDragStart.emit({event: $event, index: i})"
                  (dragover)="onLinkDragOver.emit({event: $event, index: i})"
                  (dragleave)="onLinkDragLeave.emit({event: $event, index: i})"
                  (drop)="onLinkDrop.emit({event: $event, index: i})"
                  (dragend)="onLinkDragEnd.emit()"
                  (click)="handleLinkClick($event, l)">
            <span class="kind-dot" 
                  [class.dot-standard]="l.kind==='standard'" 
                  [class.dot-record]="l.kind==='record'">
            </span>
            <span class="text">{{ l.id }} · {{ l.title }}</span>
            <span class="close-x" 
                  title="삭제" 
                  (click)="$event.stopPropagation(); onRemoveSelectedLink.emit(l)">×</span>
          </button>
          <div class="link-drop-end" 
               *ngIf="(item.selectedLinks||[]).length"
               [class.active]="ui.linkDragItemId===item.id && ui.linkDragOverIndex===(item.selectedLinks||[]).length"
               (dragover)="onLinkDragOverEnd.emit($event)" 
               (drop)="onLinkDropEnd.emit($event)">
          </div>
        </div>
      </div>

      <!-- Column 3: Progress -->
      <textarea #slide3 class="owner-select slide-input" 
               style="grid-row:1; grid-column:3; width:100%;" 
               [attr.id]="'input-'+item.id+'-3'" 
               [attr.data-col]="3" 
               [style.height.px]="item.__h3 || 120" 
               rows="5" 
               spellcheck="false" 
               [(ngModel)]="item.col3Text" 
               (input)="onAutoResize($event, '__h3')" 
               (blur)="onSaveProgress.emit()" 
               placeholder="평가 항목 진행 현황" 
               (keydown)="onTextareaKeydown.emit($event)">
      </textarea>

      <!-- Comments section -->
      <div class="comments">
        <div class="new">
          <textarea [(ngModel)]="ui.newComment[item.id]" 
                   [attr.id]="'comment-input-'+item.id" 
                   (keydown)="onCommentKeydown.emit($event)" 
                   (input)="autoGrow($event)"
                   placeholder="댓글을 입력..." 
                   [disabled]="!isDateCreated"
                   class="comment-input">
          </textarea>
          <button class="btn" 
                  (click)="onAddComment.emit()" 
                  [disabled]="!isDateCreated || !(ui.newComment[item.id]||'').trim()">
            추가
          </button>
        </div>
        <div class="list">
          <div class="comment" 
               *ngFor="let c of (item.comments||[]); let i = index; trackBy: trackByComment">
            <div class="content">
              <div class="meta">{{ c.user }} · {{ c.time }}</div>
              <ng-container *ngIf="ui.editingComment[item.id]===i; else viewCmt">
                <textarea class="edit-area" 
                         [(ngModel)]="ui.editCommentText[ui.keyFor(item.id,i)]" 
                         (keydown)="onEditCommentKeydown.emit({event: $event, index: i})" 
                         (input)="autoGrow($event)"
                         spellcheck="false">
                </textarea>
                <div class="edit-actions">
                  <button class="btn mini" (click)="onSaveEditComment.emit(i)">저장</button>
                  <button class="btn mini" (click)="onCancelEditComment.emit(i)">취소</button>
                </div>
              </ng-container>
              <ng-template #viewCmt>
                <div class="text">{{ c.text }}</div>
              </ng-template>
            </div>
            <div class="actions">
              <button class="icon-btn edit" 
                      *ngIf="canEditComment(c)" 
                      (click)="$event.stopPropagation(); onStartEditComment.emit({index: i, text: c.text})" 
                      title="수정">✎</button>
              <button class="icon-btn close" 
                      *ngIf="canDeleteComment(c)" 
                      (click)="$event.stopPropagation(); onRemoveComment.emit(i)" 
                      title="삭제">×</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .details-inner {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 16px;
      padding: 10px 6px 12px;
    }
    
    .details-inner.comments-on {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }
    
    .comments { grid-column: 4; }
    .comments .new { display:flex; gap:8px; align-items:flex-start; }
    .comments .new .comment-input { flex:1; min-width:0; max-width:100%; resize:vertical; min-height:64px; }
    .comments .list { display:flex; flex-direction:column; gap:8px; max-height:300px; overflow:auto; }
    .comment { position:relative; border:1px solid #e5e7eb; border-radius:10px; padding:8px; background:#f9fafb; display:flex; align-items:flex-start; font-size:13.5px; }
    .comment .content { flex:1 1 auto; min-width:0; }
    .comment .actions { flex:0 0 auto; display:flex; gap:6px; margin-left:8px; }
    .comment .icon-btn { width:20px; height:20px; border-radius:6px; border:1px solid #e5e7eb; background:#fff; color:#334155; cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:12px; line-height:1; padding:0; }
    .comment .icon-btn.edit:hover { background:#eef2ff; border-color:#c7d2fe; color:#3730a3; }
    .comment .icon-btn.close:hover { background:#fee2e2; border-color:#fecaca; color:#991b1b; }
    .comment .edit-area { width:100%; max-width:100%; min-width:100%; box-sizing:border-box; }
    
    @media (max-width: 1200px) {
      .details-inner {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class AuditItemDetailsComponent implements AfterViewInit, OnChanges {
  @Input() item!: AuditItem;
  @Input() isDateCreated: boolean = false;
  
  @Output() onSaveProgress = new EventEmitter<void>();
  @Output() onOpenRecordPicker = new EventEmitter<void>();
  @Output() onTextareaKeydown = new EventEmitter<KeyboardEvent>();
  @Output() onAddComment = new EventEmitter<void>();
  @Output() onRemoveComment = new EventEmitter<number>();
  @Output() onStartEditComment = new EventEmitter<{index: number, text: string}>();
  @Output() onSaveEditComment = new EventEmitter<number>();
  @Output() onCancelEditComment = new EventEmitter<number>();
  @Output() onEditCommentKeydown = new EventEmitter<{event: KeyboardEvent, index: number}>();
  @Output() onLinkChipClick = new EventEmitter<{event: MouseEvent, link: LinkItem}>();
  @Output() onRemoveSelectedLink = new EventEmitter<LinkItem>();
  @Output() onLinkDragStart = new EventEmitter<{event: DragEvent, index: number}>();
  @Output() onLinkDragOver = new EventEmitter<{event: DragEvent, index: number}>();
  @Output() onLinkDragLeave = new EventEmitter<{event: DragEvent, index: number}>();
  @Output() onLinkDrop = new EventEmitter<{event: DragEvent, index: number}>();
  @Output() onLinkDragEnd = new EventEmitter<void>();
  @Output() onLinkListDragOver = new EventEmitter<DragEvent>();
  @Output() onLinkListDrop = new EventEmitter<DragEvent>();
  @Output() onLinkDragOverEnd = new EventEmitter<DragEvent>();
  @Output() onLinkDropEnd = new EventEmitter<DragEvent>();
  @Output() onCommentKeydown = new EventEmitter<KeyboardEvent>();
  
  constructor(
    public state: AuditStateService,
    public ui: AuditUiService
  ) {}
  
  trackByComment = (_: number, c: any) => `${c.user}|${c.time}|${c.text}`

  handleLinkClick(event: MouseEvent, link: any) {
    event.stopPropagation();
    this.onLinkChipClick.emit({ event, link });
  };
  
  canDeleteComment(c: { user: string }): boolean {
    if (this.state.isAdmin) return true;
    const me = (this.state.userDisplay || '').trim();
    const owner = (c?.user || '').trim();
    return !!me && !!owner && me === owner;
  }
  
  canEditComment(c: { user: string }): boolean {
    return this.canDeleteComment(c);
  }
  
  onAutoResize(ev: Event, key: string) {
    const ta = ev?.target as HTMLTextAreaElement;
    if (!ta) return;
    
    ta.style.height = 'auto';
    ta.style.overflowY = 'hidden';
    
    const base = 120;
    const cap = 480;
    const scrollHeight = ta.scrollHeight;
    const finalH = Math.min(cap, Math.max(base, scrollHeight));
    
    ta.style.height = finalH + 'px';
    
    try {
      (this.item as any)[key] = finalH;
    } catch {}
  }

  autoGrow(ev: Event) {
    const ta = ev?.target as HTMLTextAreaElement;
    if (!ta) return;
    ta.style.overflowY = 'hidden';
    ta.style.height = 'auto';
    ta.style.height = Math.min(480, Math.max(ta.scrollHeight, 64)) + 'px';
  }

  // Refs for initial height calculation
  @ViewChild('slide1') slide1?: ElementRef<HTMLTextAreaElement>;
  @ViewChild('slide3') slide3?: ElementRef<HTMLTextAreaElement>;

  ngAfterViewInit(): void {
    // Measure immediately after view init to avoid initial clipping
    setTimeout(() => this.measureInitialHeights(), 0);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['item']) {
      // Re-measure when item content changes programmatically
      setTimeout(() => this.measureInitialHeights(), 0);
    }
  }

  private measureInitialHeights(){
    try{
      const base = 120; const cap = 480;
      const ta1 = this.slide1?.nativeElement; if (ta1){ ta1.style.height='auto'; ta1.style.overflowY='hidden'; const h=Math.min(cap, Math.max(base, ta1.scrollHeight)); ta1.style.height=h+'px'; (this.item as any).__h1=h; }
      const ta3 = this.slide3?.nativeElement; if (ta3){ ta3.style.height='auto'; ta3.style.overflowY='hidden'; const h=Math.min(cap, Math.max(base, ta3.scrollHeight)); ta3.style.height=h+'px'; (this.item as any).__h3=h; }
    }catch{}
  }
}
