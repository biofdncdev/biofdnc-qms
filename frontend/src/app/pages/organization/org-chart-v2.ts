import { Component, OnInit, signal, AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrganizationService } from '../../services/organization.service';
import { AuthService } from '../../services/auth.service';

// LeaderLine은 window 객체를 통해 접근
declare const LeaderLine: any;

interface V2Node {
  id: string;
  name: string;
  kind: 'ceo' | 'dept' | 'special';
  parentId?: string;
  level: number;
  members: string[];
}

@Component({
  selector: 'app-org-chart-v2',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="org-v2" (click)="selected = null">
    <aside class="left">
      <div class="sticky-header">
        <h3>임직원</h3>
        <div class="user-input">
        <input [(ngModel)]="newChipName" (keyup.enter)="addChip()" placeholder="이름 입력" />
        <button class="add-chip-btn" (click)="addChip()">추가</button>
        </div>
      </div>
      <div class="user-list">
        <div class="user-chip" *ngFor="let u of users()" 
             draggable="true" 
             (dragstart)="onDragUser($event,u)"
             (dragover)="onDragOverUserChip($event)"
             (drop)="onDropUserChip($event,u)">
          <span class="chip-label">{{u.name}}{{getAssignedDeptsLabel(u)}}</span>
          <span class="chip-actions">
            <button class="chip-edit" title="이름 수정" (click)="editChip(u, $event)" aria-label="이름 수정">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                <path d="M3 17.25V21h3.75L19.81 7.94l-3.75-3.75L3 17.25zM21.41 6.34c.39-.39.39-1.02 0-1.41L19.07 2.59a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
              </svg>
            </button>
            <button class="chip-remove" title="삭제" (click)="removeChip(u, $event)">×</button>
          </span>
        </div>
      </div>
    </aside>
    <main class="main" 
          (dragover)="allowOutside($event)"
          (drop)="dropOutside($event)">
      <!-- 선 연결 버튼 -->
      <div class="toolbar">
        <button class="line-btn" (click)="onSave()">
          저장
        </button>
      </div>
      <div class="chart-container" #chartContainer>
        <!-- 대표이사 노드 -->
        <div class="chairman-level">
          <div class="node chairman" 
               [attr.data-node-id]="chairman.id"
               [class.selected]="selected?.id === chairman.id"
               (click)="select(chairman, $event)" 
               (dragover)="allow($event)" 
               (drop)="drop($event, chairman)">
            <div class="title">{{chairman.name}}</div>
            <div class="members" 
                 (dragover)="allow($event)" 
                 (drop)="drop($event, chairman)">
              <span class="chip" *ngFor="let m of chairman.members" 
                    draggable="true" 
                    (dragstart)="onDragMember($event, m, chairman)">
                {{m}}
              </span>
            </div>
            <button class="add-btn" *ngIf="selected?.id === chairman.id" (click)="openAddModal($event)">
              <span>+</span>
            </button>
          </div>
        </div>

        <!-- 부사장 노드 -->
        <div class="vice-chairman-level">
          <div class="node vice-chairman" 
               [attr.data-node-id]="viceChairman.id"
               [class.selected]="selected?.id === viceChairman.id"
               (click)="select(viceChairman, $event)" 
               (dragover)="allow($event)" 
               (drop)="drop($event, viceChairman)">
            <div class="title">{{viceChairman.name}}</div>
            <div class="members" 
                 (dragover)="allow($event)" 
                 (drop)="drop($event, viceChairman)">
              <span class="chip" *ngFor="let m of viceChairman.members" 
                    draggable="true" 
                    (dragstart)="onDragMember($event, m, viceChairman)">
                {{m}}
              </span>
            </div>
            <button class="add-btn" *ngIf="selected?.id === viceChairman.id" (click)="openAddModal($event)">
              <span>+</span>
            </button>
          </div>
        </div>

        <!-- 특수 부서 (감사, COO) -->
        <div class="special-level" *ngIf="specials().length > 0">
          <div class="node special" *ngFor="let s of specials()" 
               [class.selected]="selected?.id === s.id"
               (click)="select(s, $event)" 
               (dragover)="allow($event)" 
               (drop)="drop($event, s)">
            <div class="title">{{s.name}}</div>
            <div class="members"
                 (dragover)="allow($event)" 
                 (drop)="drop($event, s)">
              <span class="chip" *ngFor="let m of s.members" 
                    draggable="true" 
                    (dragstart)="onDragMember($event, m, s)">
                {{m}}
              </span>
            </div>
            <button class="add-btn" *ngIf="selected?.id === s.id" (click)="openAddModal($event)">
              <span>+</span>
            </button>
            <button class="delete-btn" (click)="deleteNode(s, $event)">🗑</button>
            <!-- connector removed -->
          </div>
        </div>

        <!-- 일반 부서 레벨별 -->
        <div class="dept-levels">
          <div class="level" *ngFor="let lv of [2]" [attr.data-level]="lv">
            <div class="level-container" *ngIf="depts(lv).length > 0">
              <!-- connectors removed -->
              <div class="level-wrapper">
                <div class="node-group" *ngFor="let d of depts(lv); let first = first; let last = last" 
                     [class.has-children]="hasChildren(d.id)"
                     [class.first-node]="first"
                     [class.last-node]="last">
                  <!-- connectors removed -->
                  <div class="node dept" 
                       [attr.data-node-id]="d.id"
                       [class.selected]="selected?.id === d.id"
                       (click)="select(d, $event)" 
                       (dragover)="allow($event)" 
                       (drop)="drop($event,d)">
                    <div class="title"
                         draggable="true"
                         (dragstart)="onDragDeptStart($event, d)"
                         (dragover)="allow($event)"
                         (drop)="onDropDept($event, d)">{{d.name}}</div>
                    <div class="members"
                         (dragover)="allow($event)" 
                         (drop)="drop($event, d)">
                      <span class="chip" *ngFor="let m of d.members; let mi = index" 
                            draggable="true" 
                            (dragstart)="onDragMember($event, m, d)"
                            (dragover)="onDragOverMember($event)"
                            (drop)="onDropMember($event, d, mi)">
                        {{m}}
                      </span>
                      <div class="member-drop-end" (dragover)="onDragOverMember($event)" (drop)="onDropMemberEnd($event, d)"></div>
                    </div>
                    <button class="mini-btn up action-edit" *ngIf="selected?.id === d.id" title="수정" (click)="openRename(d, $event)">✎</button>
                    <button class="add-btn small action-add" *ngIf="selected?.id === d.id" title="하위 부서 추가" (click)="openAddModal($event)"><span>+</span></button>
                    <button class="mini-btn down action-del" *ngIf="selected?.id === d.id" title="삭제" (click)="deleteNode(d, $event)">🗑</button>
                  </div>
                  <div class="child-container" *ngIf="childrenOf(d).length > 0">
                    <div class="child-wrapper">
                      <div class="child-group" *ngFor="let c of childrenOf(d); let cfirst = first; let clast = last"
                           [class.first-child]="cfirst"
                           [class.last-child]="clast">
                        <!-- connectors removed -->
                        <div class="node dept"
                             [attr.data-node-id]="c.id"
                             [class.selected]="selected?.id === c.id"
                             (click)="select(c, $event)"
                             (dragover)="allow($event)"
                             (drop)="drop($event,c)">
                          <div class="title"
                               draggable="true"
                               (dragstart)="onDragDeptStart($event, c)"
                               (dragover)="allow($event)"
                               (drop)="onDropDept($event, c)">{{c.name}}</div>
                          <div class="members"
                               (dragover)="allow($event)" 
                               (drop)="drop($event, c)">
                            <span class="chip" *ngFor="let m of c.members; let mi = index" 
                                  draggable="true" 
                                  (dragstart)="onDragMember($event, m, c)"
                                  (dragover)="onDragOverMember($event)"
                                  (drop)="onDropMember($event, c, mi)">
                              {{m}}
                            </span>
                            <div class="member-drop-end" (dragover)="onDragOverMember($event)" (drop)="onDropMemberEnd($event, c)"></div>
                          </div>
                          <button class="mini-btn up action-edit" *ngIf="selected?.id === c.id" title="수정" (click)="openRename(c, $event)">✎</button>
                          <button class="add-btn small action-add" *ngIf="selected?.id === c.id" title="하위 부서 추가" (click)="openAddModal($event)"><span>+</span></button>
                          <button class="mini-btn down action-del" *ngIf="selected?.id === c.id" title="삭제" (click)="deleteNode(c, $event)">🗑</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 부서 추가 모달 -->
      <div class="modal" *ngIf="showAddModal" (click)="closeModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <h3>부서 추가</h3>
          <input [(ngModel)]="newDept" 
                 placeholder="부서명 입력" 
                 (keyup.enter)="addDept()"
                 #deptInput>
          <div class="modal-actions">
            <button class="cancel" (click)="closeModal()">취소</button>
            <button class="confirm" (click)="addDept()">추가</button>
          </div>
        </div>
      </div>
    </main>
  </div>
  `,
  styles: [`
    .org-v2 {
      display: flex;
      height: calc(100vh - 64px);
      background: #f8fafc;
      font-family: 'Noto Sans KR', sans-serif;
      overflow: hidden;
    }
    
    /* 좌측 사용자 목록 */
    .left {
      width: 260px;
      background: #fff;
      border-right: 1px solid #e2e8f0;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    
    .left h3 { margin: 0 0 12px 0; font-size: 14px; font-weight: 600; color: #475569; }
    .sticky-header { 
      position: sticky; 
      top: 0; 
      background: #fff; 
      z-index: 30; 
      padding: 16px 16px 12px 16px; 
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
      flex-shrink: 0;
    }
    
    .user-input { display:flex; gap:8px; margin-top: 12px; align-items:center; }
    .user-input input { width: 0; flex: 1 1 auto; min-width: 0; height:32px; padding:6px 8px; border:1px solid #d1d5db; border-radius:8px; }
    .user-input .add-chip-btn { height:32px; padding:0 12px; border:1px solid #cbd5e1; background:#f8fafc; border-radius:8px; cursor:pointer; white-space:nowrap; }
    .user-list { 
      display: flex; 
      flex-direction: column; 
      gap: 6px; 
      padding: 0 16px 16px 16px;
      overflow-y: auto;
      flex: 1;
    }
    
    .user-chip { display:flex; align-items:center; justify-content:space-between; padding: 4px 8px; border-radius: 8px; background: #e2e8f0; color: #475569; cursor: move; transition: all 0.2s; font-size: 12px; white-space: nowrap; }
    .user-chip .chip-label { pointer-events:none; }
    .user-chip .chip-actions { display:flex; gap:4px; }
    .user-chip .chip-remove, .user-chip .chip-edit { border:none; background:transparent; cursor:pointer; font-size:14px; padding:0 4px; }
    .user-chip .chip-edit { color:#000; transform: none; padding:0 2px; }
    
    .user-chip:hover {
      background: #cbd5e1;
      transform: translateX(2px);
    }
    
    .user-chip.assigned {
      opacity: 0.4;
      cursor: not-allowed;
    }
    
    /* 메인 차트 영역 */
    .main {
      flex: 1;
      padding: 20px;
      overflow: hidden;
      position: relative;
    }
    
    .chart-container {
      width: 100%;
      height: 100%;
      position: relative;
      padding: 20px 20px 40px 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
      padding-top: 50px;
      transform: scale(0.92);
      transform-origin: center top;
      overflow: hidden;
    }
    
    /* 대표이사 레벨 */
    .chairman-level {
      display: flex;
      justify-content: center;
      margin-bottom: 40px;
      position: relative;
    }
    
    /* 부사장 레벨 */
    .vice-chairman-level {
      display: flex;
      justify-content: center;
      margin-bottom: 90px;
      position: relative;
    }
    
    /* CEO 레벨 (하위 호환) */
    .ceo-level {
      display: flex;
      justify-content: center;
      margin-bottom: 50px;
      margin-top: 50px;
    }
    
    /* 특수 부서 레벨 */
    .special-level {
      position: absolute;
      top: 40px;
      right: 100px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    
    /* 부서 레벨 */
    .dept-levels {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 40px;
    }
    
    .level-wrapper {
      display: flex;
      justify-content: center;
      gap: 12px;
    }
    
    .node-group {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    
    .node-group.has-children {
      margin: 0 8px;
    }

    .child-container { 
      margin-top: 90px; 
      width: 100%; 
      position: relative; 
      display: flex; 
      flex-direction: column;
      align-items: center;
    }
    
    /* 부모에서 중간 높이까지 내려오는 세로선 */
    .down-from-parent { 
      width: 2px; 
      height: 20px; 
      background:#cbd5e1; 
    }
    
    /* 레벨2 가로선 */
    .horizontal-line-child {
      position: absolute;
      top: 20px;
      height: 2px;
      background: #cbd5e1;
      z-index: 0;
      pointer-events: none;
    }
    
    .child-wrapper { 
      position: relative; 
      width: 100%; 
      display: flex; 
      justify-content: center; 
      gap: 12px;
      margin-top: 0;
    }
    
    .child-group { 
      display:flex; 
      flex-direction:column; 
      align-items:center; 
    }
    
    /* 가로선에서 각 자식 노드로 내려오는 세로선 */
    .child-vertical { 
      width:2px; 
      height:20px; 
      background:#cbd5e1; 
      margin:-20px auto 0;
    }
    
    /* 단일 자식일 때 세로선 숨기기 */
    .child-group:only-child .child-vertical {
      display: none;
    }
    
    /* 노드 공통 스타일 */
    .node {
      background: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
      min-width: 95px;
      position: relative;
      transition: all 0.3s;
      cursor: pointer;
      z-index: 1;
    }
    
    .node:hover {
      box-shadow: 0 3px 12px rgba(0,0,0,0.1);
      transform: translateY(-1px);
    }
    
    .node.selected {
      box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
      z-index: 50;
    }
    
    .node .title {
      padding: 8px 10px;
      border-bottom: 1px solid #e2e8f0;
      font-weight: 600;
      font-size: 13px;
      color: #1e293b;
      text-align: center;
      cursor: move;
    }
    
    .node .title:hover {
      background: rgba(0,0,0,0.02);
    }
    
    .members {
      padding: 6px;
      min-height: 28px;
      display: flex;
      flex-direction: column;
      gap: 4px;
      align-items: center;
    }
    
    .chip {
      display: inline-flex;
      align-items: center;
      padding: 3px 8px;
      border-radius: 12px;
      background: #f1f5f9;
      font-size: 12px;
      color: #475569;
      cursor: move;
    }
    
    .member-drop-end {
      min-height: 4px;
      width: 60%;
      margin: 0 auto;
    }
    
    /* 대표이사 노드 */
    .chairman {
      background: linear-gradient(135deg, #93c5fd, #60a5fa);
      color: #1e3a8a;
      min-width: 125px;
      border: 2px solid #dbeafe;
    }
    
    .chairman .title {
      border-color: #bfdbfe;
      color: #1e3a8a;
      font-size: 14px;
      font-weight: 700;
    }
    
    .chairman .chip {
      background: rgba(191, 219, 254, 0.6);
      color: #1e40af;
    }
    
    /* 부사장 노드 */
    .vice-chairman {
      background: linear-gradient(135deg, #a5b4fc, #818cf8);
      color: #312e81;
      min-width: 125px;
      border: 2px solid #e0e7ff;
    }
    
    .vice-chairman .title {
      border-color: #c7d2fe;
      color: #312e81;
      font-size: 14px;
      font-weight: 700;
    }
    
    .vice-chairman .chip {
      background: rgba(199, 210, 254, 0.6);
      color: #3730a3;
    }
    
    /* CEO 노드 (하위 호환) */
    .ceo {
      background: linear-gradient(135deg, #3b82f6, #2563eb);
      color: #fff;
      min-width: 110px;
    }
    
    .ceo .title {
      border-color: rgba(255,255,255,0.2);
      color: #fff;
      font-size: 14px; /* 기준 폰트 */
    }
    
    .ceo .chip {
      background: rgba(255,255,255,0.2);
      color: #fff;
    }
    
    .ceo .chip .remove {
      color: rgba(255,255,255,0.7);
    }
    
    /* 특수 부서 노드 */
    .special {
      background: linear-gradient(135deg, #8b5cf6, #7c3aed);
      color: #fff;
    }
    
    .special .title {
      border-color: rgba(255,255,255,0.2);
      color: #fff;
    }
    
    .special .chip {
      background: rgba(255,255,255,0.2);
      color: #fff;
    }
    
    /* 부서 추가 버튼 */
    .add-btn {
      position: absolute;
      top: 50%;
      right: -16px;
      transform: translateY(-50%);
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #3b82f6;
      color: white;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      transition: all 0.2s;
      box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
      z-index: 10;
    }
    
    .add-btn:hover {
      background: #2563eb;
      transform: translateY(-50%) scale(1.1);
    }

    .add-btn.small { width: 28px; height: 28px; font-size: 18px; z-index: 100; }

    .node-actions { position: relative; z-index: 100; }
    
    .mini-btn { width:24px; height:24px; border-radius:50%; border:none; cursor:pointer; display:flex; align-items:center; justify-content:center; box-shadow:0 1px 4px rgba(0,0,0,.15); background:#fff; position:absolute; right:-28px; z-index: 100; }
    .mini-btn.up { color:#2563eb; }
    .mini-btn.down { color:#dc2626; }
    .action-edit { top: calc(50% - 36px); transform: translateY(-50%); }
    .action-add  { top: 50%; transform: translateY(-50%); right:-32px; z-index: 100; }
    .action-del  { top: calc(50% + 36px); transform: translateY(-50%); }
    
    /* 삭제 버튼 */
    .delete-btn {
      position: absolute;
      top: 8px;
      right: 8px;
      background: none;
      border: none;
      cursor: pointer;
      opacity: 0;
      transition: opacity 0.2s;
      font-size: 14px;
    }
    
    .node:hover .delete-btn {
      opacity: 0.5;
    }
    
    .delete-btn:hover {
      opacity: 1 !important;
    }
    
    /* 연결선 시스템 */
    .level-container {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    
    .level-wrapper {
      display: flex;
      justify-content: center;
      gap: 12px;
      position: relative;
    }
    
    /* CEO에서 중간 높이까지 내려오는 세로선 */
    .from-ceo {
      position: absolute;
      top: -30px;
      left: 50%;
      transform: translateX(-50%);
      width: 2px;
      height: 30px;
      background: #cbd5e1;
      z-index: 1;
    }
    
    /* 레벨1 가로선 - 첫번째와 마지막 노드 사이 */
    .horizontal-line-level1 {
      position: absolute;
      top: -30px;
      height: 2px;
      background: #cbd5e1;
      z-index: 0;
      pointer-events: none;
    }
    
    /* 가로선에서 각 노드로 내려오는 세로선 */
    .vertical-line-to-node {
      width: 2px;
      height: 30px;
      background: #cbd5e1;
      margin: -30px auto 0;
      position: relative;
      z-index: 1;
    }
    
    /* 단일 노드일 때 */
    .node-group:only-child .vertical-line-to-node {
      display: none;
    }
    
    .connector {
      position: absolute;
      top: -40px;
      left: 50%;
      transform: translateX(-50%);
      pointer-events: none;
    }
    
    /* 모달 */
    .modal {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }
    
    .modal-content {
      background: white;
      border-radius: 12px;
      padding: 24px;
      min-width: 320px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.2);
    }
    
    .modal-content h3 {
      margin: 0 0 16px;
      font-size: 18px;
      color: #1e293b;
    }
    
    .modal-content input {
      width: 100%;
      padding: 10px 12px;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      font-size: 14px;
      margin-bottom: 16px;
      box-sizing: border-box;
    }
    
    .modal-content input:focus {
      outline: none;
      border-color: #3b82f6;
    }
    
    .modal-actions {
      display: flex;
      gap: 8px;
      justify-content: flex-end;
    }
    
    .modal-actions button {
      padding: 8px 16px;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .modal-actions .cancel {
      background: #f1f5f9;
      color: #475569;
    }
    
    .modal-actions .confirm {
      background: #3b82f6;
      color: white;
    }
    
    .modal-actions button:hover {
      transform: translateY(-1px);
    }

    /* 툴바 */
    .toolbar {
      position: absolute;
      top: 16px;
      right: 16px;
      z-index: 10;
    }

    .line-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 10px 20px;
      background: #fff;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      color: #475569;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    }

    .line-btn:hover {
      border-color: #cbd5e1;
      background: #f8fafc;
    }

    .line-btn.active {
      background: #3b82f6;
      border-color: #3b82f6;
      color: #fff;
    }

    .line-btn.active:hover {
      background: #2563eb;
      border-color: #2563eb;
    }

    /* SVG 연결선 */
    .connections-svg {
      position: absolute;
      top: 0;
      left: 0;
      pointer-events: none;
      z-index: 0;
    }
  `]
})
export class OrgChartV2Component implements OnInit, AfterViewInit, OnDestroy {
  
  users = signal<any[]>([]);
  nodes = signal<V2Node[]>([
    { id:'chairman', name:'대표이사', kind:'ceo', level:0, members:[] },
    { id:'vice-chairman', name:'부사장', kind:'ceo', parentId:'chairman', level:1, members:[] }
  ]);
  selected: V2Node | null = null;
  newDept = '';
  showAddModal = false;
  dragUser: any = null;
  dragFrom: V2Node | null = null;
  newChipName = '';
  private leaderLines: any[] = []; // LeaderLine 인스턴스들을 저장

  @ViewChild('chartContainer') chartContainer!: ElementRef;

  constructor(private orgService: OrganizationService,
    private auth: AuthService) {}
  
  

  get chairman(): V2Node { return this.nodes().find(n => n.id === 'chairman') || this.nodes()[0]; }
  get viceChairman(): V2Node { return this.nodes().find(n => n.id === 'vice-chairman') || this.nodes()[1]; }
  get ceo(): V2Node { return this.chairman; }
  specials(): V2Node[] { return this.nodes().filter(n => n.kind==='special'); }
  depts(level:number): V2Node[] { return this.nodes().filter(n => n.kind==='dept' && n.level===level); }
  childrenOf(parent: V2Node): V2Node[] { return this.nodes().filter(n => n.kind==='dept' && n.parentId===parent.id); }

  getAssignedDeptsLabel(user: any): string {
    const depts = user.assignedDepts || [];
    if (depts.length === 0) return '';
    return ' : ' + depts.join(', ');
  }

  async ngOnInit(){
    // 1) 로컬 스냅샷 즉시 반영 (있다면)
    try{
      const snap = localStorage.getItem('orgChartV2');
      if(snap){
        const s = JSON.parse(snap);
        if(Array.isArray(s.nodes) && s.nodes.length){
          this.nodes.set(s.nodes.map((n:any)=>({ id:n.id, name:n.name, kind:n.kind, parentId:n.parent_id||undefined, level:n.level, members:[] })));
        }
        if(Array.isArray(s.members)){
          // localStorage에서도 겸직 정보 수집
          const memberDepts: Record<string, string[]> = {};
          s.members.forEach((m:any)=>{
            if(!memberDepts[m.name]) memberDepts[m.name] = [];
            const nodeName = this.getNodeNameById(m.assigned_node_id);
            if(nodeName && !memberDepts[m.name].includes(nodeName)) {
              memberDepts[m.name].push(nodeName);
            }
          });
          const uniqueMembers = Array.from(new Set(s.members.map((m:any) => m.name)) as Set<string>).map((name: string) => {
            const firstMember = s.members.find((m:any) => m.name === name);
            return {
              id: firstMember?.id || this.generateId(),
              name: name,
              assignedDepts: memberDepts[name] || []
            };
          });
          this.users.set(uniqueMembers);
        }
      }
    } catch {}

    // 2) DB에서 최신 상태 로드
    await this.loadFromDb();
  }

  async ngAfterViewInit(){
    // View 초기화 후 충분한 시간을 두고 선 그리기
    setTimeout(() => {
      // LeaderLine이 로드되었는지 확인
      if (typeof LeaderLine !== 'undefined') {
        this.drawLeaderLines();
      } else {
        console.warn('LeaderLine not loaded yet');
      }
    }, 500);
  }

  private async loadFromDb(){
    try{
      const res:any = await this.orgService.loadOrgChart();
      const nodes:any[] = Array.isArray(res?.nodes) ? res.nodes : [];
      const members:any[] = Array.isArray(res?.members) ? res.members : [];
      if(nodes.length){
        this.nodes.set(nodes.map(n=>{
          // vice-chairman 노드는 항상 '부사장'으로 표시
          if(n.id === 'vice-chairman') {
            return { id:n.id, name:'부사장', kind:n.kind, parentId:n.parent_id||undefined, level:n.level, members:[] };
          }
          return { id:n.id, name:n.name, kind:n.kind, parentId:n.parent_id||undefined, level:n.level, members:[] };
        }));
        // 멤버를 노드에 주입 및 겸직 정보 수집
        const byId: Record<string, any> = {};
        this.nodes().forEach(n=> byId[n.id] = n);
        
        // 각 멤버별로 할당된 모든 부서를 추적
        const memberDepts: Record<string, string[]> = {};
        
        // order_index로 정렬
        const sortedMembers = members.slice().sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
        
        sortedMembers.forEach(m=>{
          const node = byId[m.assigned_node_id];
          if(node){
            if(!Array.isArray(node.members)) node.members = [];
            if(!node.members.includes(m.name)) node.members.push(m.name);
            
            // 겸직 정보 수집
            if(!memberDepts[m.name]) memberDepts[m.name] = [];
            const nodeName = this.getNodeNameById(m.assigned_node_id);
            if(nodeName && !memberDepts[m.name].includes(nodeName)) {
              memberDepts[m.name].push(nodeName);
            }
          }
        });
        
        // 중복 제거: 동일한 이름을 가진 멤버들을 하나로 통합
        const uniqueMembers = Array.from(new Set(members.map(m => m.name))).map(name => {
          const firstMember = members.find(m => m.name === name);
          return {
            id: firstMember?.id || this.generateId(),
            name: name,
            assignedDepts: memberDepts[name] || []
          };
        });
        
        this.users.set(uniqueMembers);
      } else {
        this.nodes.set([
          { id:'chairman', name:'대표이사', kind:'ceo', level:0, members:[] } as any,
          { id:'vice-chairman', name:'부사장', kind:'ceo', parentId:'chairman', level:1, members:[] } as any
        ]);
        this.users.set([]);
      }

      // 로컬 스냅샷도 최신으로 갱신
      try{ localStorage.setItem('orgChartV2', JSON.stringify({ nodes, members })); }catch{}

    } catch {
      // 로드 실패
    }
  }

  select(n:V2Node, e?: Event){ 
    if(e) e.stopPropagation();
    this.selected = this.selected?.id === n.id ? null : n; 
  }
  
  allow(e:DragEvent){ 
    e.preventDefault(); 
  }
  
  onDragUser(e:DragEvent,u:any){ 
    this.dragUser=u; 
    this.dragFrom=null; 
  }

  onDragOverUserChip(e: DragEvent){
    e.preventDefault();
  }

  onDropUserChip(e: DragEvent, targetUser: any){
    e.preventDefault();
    // 현재 드래그 중인 사용자가 없으면 무시
    if(!this.dragUser || this.dragFrom) return; // dragFrom이 있으면 부서 칩 드래그 중
    const list = this.users();
    const fromIdx = list.indexOf(this.dragUser);
    const toIdx = list.indexOf(targetUser);
    if(fromIdx < 0 || toIdx < 0 || fromIdx === toIdx) { this.dragUser = null; return; }
    const newList = list.slice();
    const [item] = newList.splice(fromIdx,1);
    newList.splice(toIdx,0,item);
    this.users.set(newList);
    this.dragUser = null;
  }

  addChip(){
    const name = (this.newChipName||'').trim();
    if(!name) return;
    const newItem = { id: this.generateId(), name, assignedDepts: [] };
    this.users.update(arr => [...arr, newItem]);
    this.newChipName = '';
  }

  removeChip(u:any, e:Event){
    e.stopPropagation();
    this.users.update(arr => arr.filter(x => x !== u));
    // 사용자가 리스트에서 제거되면 끌어놓기 진행 중 상태도 초기화
    if(this.dragUser && this.dragUser === u){
      this.dragUser = null;
      this.dragFrom = null;
    }
    // 조직도 내 모든 부서에서 동일 이름의 칩 제거
    const name = u?.name;
    if(name){
      const updated = this.nodes().map(n => ({...n, members: (n.members||[]).filter(m => m !== name)}));
      this.nodes.set(updated);
    }
  }

  editChip(u:any, e:Event){
    e.stopPropagation();
    const name = prompt('임직원 이름 수정', u?.name || '');
    if(name && name.trim()){
      const newName = name.trim();
      // 좌측 칩 이름 변경
      this.users.update(list => list.map(x => x===u ? { ...x, name: newName } : x));
      // 조직도 내 칩 텍스트도 변경
      this.nodes.update(arr => arr.map(n => ({
        ...n,
        members: (n.members||[]).map(m => m === u.name ? newName : m)
      })));
    }
  }
  
  onDragMember(e:DragEvent,m:string,from:V2Node){ 
    this.dragUser={ name:m }; 
    this.dragFrom=from; 
  }
  
  drop(e:DragEvent,target:V2Node){
    e.preventDefault();
    if(!this.dragUser) return;
    if(this.dragFrom){ 
      this.dragFrom.members = this.dragFrom.members.filter(n=>n!==this.dragUser.name); 
    }
    if(!target.members.includes(this.dragUser.name)) {
      target.members.push(this.dragUser.name);
    }
    // 칩의 부서 표시 업데이트 (겸직 지원: 기존 부서에 새 부서 추가)
    const deptLabel = target.name || '';
    this.users.update(list => list.map(u => {
      if (u.name === this.dragUser.name) {
        const depts = u.assignedDepts || [];
        if (!depts.includes(deptLabel)) {
          return { ...u, assignedDepts: [...depts, deptLabel] };
        }
      }
      return u;
    }));
    this.dragUser=null; 
    this.dragFrom=null;
  }

  // 칩 순서 변경 (동일 부서 내)
  onDragOverMember(e: DragEvent){
    e.preventDefault();
  }

  onDropMember(e: DragEvent, node: V2Node, targetIndex: number){
    e.preventDefault();
    if(!this.dragFrom || this.dragFrom.id !== node.id || !this.dragUser) return;
    const fromIndex = node.members.indexOf(this.dragUser.name);
    if(fromIndex === -1) return;
    const members = node.members.slice();
    const [m] = members.splice(fromIndex,1);
    const insertAt = targetIndex <= fromIndex ? targetIndex : targetIndex;
    members.splice(insertAt,0,m);
    node.members = members;
    this.dragUser = null; this.dragFrom = null;
  }

  onDropMemberEnd(e: DragEvent, node: V2Node){
    e.preventDefault();
    if(!this.dragFrom || this.dragFrom.id !== node.id || !this.dragUser) return;
    const fromIndex = node.members.indexOf(this.dragUser.name);
    if(fromIndex === -1) return;
    const members = node.members.slice();
    const [m] = members.splice(fromIndex,1);
    members.push(m);
    node.members = members;
    this.dragUser = null; this.dragFrom = null;
  }

  // 동일 레벨 부서 드래그 앤 드롭 순서 변경
  onDragDeptStart(e: DragEvent, node: V2Node){
    e.dataTransfer?.setData('text/plain', node.id);
  }

  onDropDept(e: DragEvent, target: V2Node){
    e.preventDefault();
    const dragId = e.dataTransfer?.getData('text/plain');
    if(!dragId || dragId === target.id) return;
    const dragged = this.nodes().find(n=>n.id===dragId);
    if(!dragged || dragged.level !== target.level || dragged.kind!==target.kind) return;
    const arr = this.nodes();
    const sameLevel = arr.filter(n=>n.kind==='dept' && n.level===target.level);
    const orderIds = sameLevel.map(n=>n.id);
    const from = orderIds.indexOf(dragged.id);
    const to = orderIds.indexOf(target.id);
    if(from<0 || to<0) return;
    // 재배열
    orderIds.splice(to,0,orderIds.splice(from,1)[0]);
    const reordered = arr.slice().sort((a,b)=>{
      if(a.level!==target.level || a.kind!=='dept') return 0;
      if(b.level!==target.level || b.kind!=='dept') return 0;
      return orderIds.indexOf(a.id)-orderIds.indexOf(b.id);
    });
    this.nodes.set(reordered);
  }

  removeMember(node: V2Node, member: string, event: Event) {
    event.stopPropagation();
    node.members = node.members.filter(m => m !== member);
  }

  hasChildren(nodeId: string): boolean {
    return this.nodes().some(n => n.parentId === nodeId);
  }

  getLevel1LineLeft(): number {
    const nodes = this.depts(2); // level 2로 변경 (현재 레벨1은 실제로 레벨2)
    if (nodes.length <= 1) return 0;
    // 첫 번째 노드의 중심 위치 계산
    const nodeWidth = 95; // CSS min-width와 일치
    const gap = 12; // CSS gap과 일치
    const totalWidth = nodes.length * nodeWidth + (nodes.length - 1) * gap;
    const containerWidth = 800; // 대략적인 컨테이너 너비
    const startOffset = (containerWidth - totalWidth) / 2;
    return startOffset + nodeWidth / 2; // 첫 번째 노드 중심
  }
  
  getLevel1LineWidth(): number {
    const nodes = this.depts(2); // level 2로 변경
    if (nodes.length <= 1) return 0;
    // 첫 번째와 마지막 노드 중심 사이의 거리
    const nodeWidth = 95; // CSS min-width와 일치
    const gap = 12; // CSS gap과 일치
    return (nodes.length - 1) * (nodeWidth + gap);
  }
  
  getChildLineLeftPx(parent: V2Node): number {
    const children = this.childrenOf(parent);
    if (children.length <= 1) return 0;
    // 첫 번째 자식 노드의 중심 위치 (부모 컨테이너 기준)
    const nodeWidth = 95; // CSS min-width와 일치
    const gap = 12; // CSS gap과 일치
    const totalWidth = children.length * nodeWidth + (children.length - 1) * gap;
    const containerWidth = totalWidth + 100; // 자식 컨테이너 너비
    const startOffset = (containerWidth - totalWidth) / 2;
    return startOffset + nodeWidth / 2;
  }
  
  getChildLineWidthPx(parent: V2Node): number {
    const children = this.childrenOf(parent);
    if (children.length <= 1) return 0;
    // 첫 번째와 마지막 자식 노드 중심 사이의 거리
    const nodeWidth = 95; // CSS min-width와 일치
    const gap = 12; // CSS gap과 일치
    return (children.length - 1) * (nodeWidth + gap);
  }

  allowOutside(e: DragEvent) {
    if (this.dragFrom) {
      e.preventDefault();
    }
  }

  dropOutside(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    
    // Check if drop is on a node (don't remove in that case)
    const target = e.target as HTMLElement;
    if (target.closest('.node') || target.closest('.user-chip')) {
      return;
    }
    
    // Remove member from their current department
    if (this.dragFrom && this.dragUser) {
      this.dragFrom.members = this.dragFrom.members.filter(m => m !== this.dragUser.name);
      this.dragUser = null;
      this.dragFrom = null;
    }
  }

  openAddModal(event: Event) {
    event.stopPropagation();
    this.newDept = '';
    this.showAddModal = true;
    // 포커스 지연 적용하여 인풋 활성화
    setTimeout(() => {
      try {
        const el = document.querySelector('input[placeholder="부서명 입력"]') as HTMLInputElement | null;
        el?.focus();
        el?.select();
      } catch {}
    }, 0);
  }

  closeModal() {
    this.showAddModal = false;
    this.newDept = '';
  }

  addDept(){
    if(!this.selected || !this.newDept.trim()) return;
    const kind: 'dept' | 'special' = (this.selected.kind==='ceo' && (this.newDept.includes('감사') || this.newDept.toUpperCase().includes('COO'))) ? 'special':'dept';
    const node:V2Node={ 
      id:`n_${Date.now()}`, 
      name:this.newDept.trim(), 
      kind, 
      parentId:this.selected.id, 
      level:this.selected.level+1, 
      members:[] 
    };
    this.nodes.update(arr=>[...arr,node]);
    this.closeModal();
  }

  deleteNode(node: V2Node, event: Event) {
    event.stopPropagation();
    if(confirm(`"${node.name}" 부서를 삭제하시겠습니까?`)) {
      // 하위 부서도 함께 삭제
      const idsToDelete = this.getDescendantIds(node.id);
      idsToDelete.add(node.id);
      this.nodes.update(arr => arr.filter(n => !idsToDelete.has(n.id)));
      if(this.selected?.id === node.id) {
        this.selected = null;
      }
    }
  }

  openEditNodeName(node: V2Node, event: Event){
    event.stopPropagation();
    const name = prompt('부서명 수정', node.name);
    if(name && name.trim()){
      node.name = name.trim();
    }
  }

  openRename(node: V2Node, event: Event){
    event.stopPropagation();
    const name = prompt('부서명 수정', node.name);
    if(name && name.trim()){
      node.name = name.trim();
    }
  }

  getDescendantIds(parentId: string): Set<string> {
    const ids = new Set<string>();
    const nodes = this.nodes();
    const addChildren = (pid: string) => {
      nodes.filter(n => n.parentId === pid).forEach(child => {
        ids.add(child.id);
        addChildren(child.id);
      });
    };
    addChildren(parentId);
    return ids;
  }


  async onSave(){
    // 1) collect nodes
    const isUuid = (s:string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);
    const idMapDb: Record<string,string> = {};
    const uiNodes = this.nodes();
    // Generate DB ids for all UI nodes
    uiNodes.forEach(n => { idMapDb[n.id] = isUuid(n.id) ? n.id : this.generateId(); });
    const nodesPayload = uiNodes.map((n, idx) => ({
      id: idMapDb[n.id],
      name: n.name,
      kind: n.kind,
      parent_id: n.parentId ? (idMapDb[n.parentId] || null) : null,
      level: n.level,
      order_index: idx,
    }));

    // 2) collect members from UI chips and their assigned departments (겸직 지원: 여러 레코드 생성)
    const membersPayload: any[] = [];
    this.users().forEach((u, userIndex) => {
      const depts = u.assignedDepts || [];
      if (depts.length === 0) {
        // 부서 미배정인 경우에도 레코드 생성
        membersPayload.push({
          id: (u.id && isUuid(u.id)) ? u.id : this.generateId(),
          name: u.name,
          assigned_node_id: null,
          order_index: userIndex
        });
      } else {
        // 각 부서마다 별도의 레코드 생성 (겸직)
        depts.forEach((deptName: string, deptIndex: number) => {
          const uiId = this.findNodeIdByName(deptName);
          membersPayload.push({
            id: this.generateId(), // 겸직이므로 각 레코드마다 새 ID
            name: u.name,
            assigned_node_id: uiId ? idMapDb[uiId] : null,
            order_index: userIndex * 1000 + deptIndex // 유저 순서 유지하면서 겸직 순서도 보존
          });
        });
      }
    });

    await this.orgService.saveOrgChart({ nodes: nodesPayload, members: membersPayload });
    // 로컬 스냅샷 저장
    try{ localStorage.setItem('orgChartV2', JSON.stringify({ nodes: nodesPayload, members: membersPayload })); }catch{}
    // 저장 후 즉시 DB에서 재로드
    await this.loadFromDb();

    // 저장 완료 후 연결선 다시 그리기
    setTimeout(() => {
      if (typeof LeaderLine !== 'undefined') {
        this.drawLeaderLines();
      }
    }, 500);
  }

  private findNodeIdByName(name?: string | null): string | undefined {
    if(!name) return undefined;
    const found = this.nodes().find(n => n.name === name);
    return found?.id;
  }

  private getNodeNameById(id?: string | null): string | undefined {
    if(!id) return undefined;
    const found = this.nodes().find(n => n.id === id);
    return found?.name;
  }

  private generateId(): string {
    try { return (crypto as any).randomUUID(); } catch { /* no-op */ }
    return `${Date.now()}_${Math.random().toString(36).slice(2)}`;
  }

  /**
   * LeaderLine 라이브러리를 사용하여 부모-자식 박스를 연결
   */
  drawLeaderLines() {
    // 기존 라인들 모두 제거
    this.clearLeaderLines();

    const container = this.chartContainer?.nativeElement as HTMLElement;
    if (!container) {
      console.warn('Chart container not found');
      return;
    }

    // Helper: 노드 엘리먼트 가져오기 (DOM에 연결되어 있고 화면에 보이는지 확인)
    const getNodeElement = (nodeId: string): HTMLElement | null => {
      const el = container.querySelector(`[data-node-id="${nodeId}"]`) as HTMLElement;
      // DOM에 연결되어 있고, 보이는 요소인지 확인
      if (el && document.body.contains(el) && el.offsetParent !== null) {
        return el;
      }
      return null;
    };

    // 1. 대표이사 -> 부사장
    const chairmanEl = getNodeElement(this.chairman.id);
    const viceEl = getNodeElement(this.viceChairman.id);
    if (chairmanEl && viceEl) {
      try {
        const line = new LeaderLine(chairmanEl, viceEl, {
          color: '#cbd5e1',
          size: 2,
          path: 'fluid',
          startSocket: 'bottom',
          endSocket: 'top',
          startPlug: 'behind',
          endPlug: 'behind'
        });
        this.leaderLines.push(line);
      } catch (e) {
        console.error('Failed to create leader line:', e);
      }
    }

    // 2. 부사장 -> 각 Level 2 부문
    const level2Depts = this.depts(2);
    level2Depts.forEach(dept => {
      const deptEl = getNodeElement(dept.id);
      if (viceEl && deptEl) {
        try {
          const line = new LeaderLine(viceEl, deptEl, {
            color: '#cbd5e1',
            size: 2,
            path: 'fluid',
            startSocket: 'bottom',
            endSocket: 'top',
            startPlug: 'behind',
            endPlug: 'behind'
          });
          this.leaderLines.push(line);
        } catch (e) {
          console.error('Failed to create leader line:', e);
        }
      }
    });

    // 3. 각 Level 2 부문 -> 하위 팀들
    level2Depts.forEach(dept => {
      const parentEl = getNodeElement(dept.id);
      const children = this.childrenOf(dept);
      children.forEach(child => {
        const childEl = getNodeElement(child.id);
        if (parentEl && childEl) {
          try {
            const line = new LeaderLine(parentEl, childEl, {
              color: '#cbd5e1',
              size: 2,
              path: 'fluid',
              startSocket: 'bottom',
              endSocket: 'top',
              startPlug: 'behind',
              endPlug: 'behind'
            });
            this.leaderLines.push(line);
          } catch (e) {
            console.error('Failed to create leader line:', e);
          }
        }
      });
    });
  }

  /**
   * 모든 LeaderLine 인스턴스 제거
   */
  clearLeaderLines() {
    this.leaderLines.forEach(line => {
      try {
        line.remove();
      } catch (e) {
        // 이미 제거된 경우 무시
      }
    });
    this.leaderLines = [];
  }

  ngOnDestroy() {
    // 컴포넌트 파괴 시 모든 라인 제거
    this.clearLeaderLines();
  }
}


