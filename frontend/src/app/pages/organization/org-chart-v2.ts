import { Component, OnInit, signal, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrganizationService } from '../../services/organization.service';
import { AuthService } from '../../services/auth.service';

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
      <h3>사용자</h3>
      <div class="user-list">
        <div class="user-chip" *ngFor="let u of users()" 
             [class.assigned]="u.assigned" 
             draggable="true" 
             (dragstart)="onDragUser($event,u)">
          {{u.name}}
        </div>
      </div>
    </aside>
    <main class="main" 
          (dragover)="allowOutside($event)"
          (drop)="dropOutside($event)">
      <!-- 선 연결 버튼 -->
      <div class="toolbar">
        <button class="line-btn" (click)="drawLines()" [class.active]="showLines()">
          선 연결
        </button>
      </div>
      <div class="chart-container" #chartContainer>
        <!-- SVG for connections -->
        <svg class="connections-svg" *ngIf="showLines()" 
             [attr.width]="svgWidth" 
             [attr.height]="svgHeight"
             style="position: absolute; top: 0; left: 0; pointer-events: none; z-index: 0;">
          <path *ngFor="let line of connectionLines()" 
                [attr.d]="line.path" 
                fill="none" 
                stroke="#cbd5e1" 
                stroke-width="2"/>
        </svg>
        <!-- CEO 노드 -->
        <div class="ceo-level">
          <div class="node ceo" 
               data-node-id="ceo"
               [class.selected]="selected?.id === 'ceo'"
               (click)="select(ceo, $event)" 
               (dragover)="allow($event)" 
               (drop)="drop($event, ceo)">
            <div class="title">대표이사</div>
            <div class="members" 
                 (dragover)="allow($event)" 
                 (drop)="drop($event, ceo)">
              <span class="chip" *ngFor="let m of ceo.members" 
                    draggable="true" 
                    (dragstart)="onDragMember($event, m, ceo)">
                {{m}}
              </span>
            </div>
            <button class="add-btn" *ngIf="selected?.id === 'ceo'" (click)="openAddModal($event)">
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
          <div class="level" *ngFor="let lv of [1]" [attr.data-level]="lv">
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
                    <button class="add-btn" *ngIf="selected?.id === d.id" (click)="openAddModal($event)">
                      <span>+</span>
                    </button>
                    <button class="delete-btn" (click)="deleteNode(d, $event)">🗑</button>
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
                          <button class="add-btn" *ngIf="selected?.id === c.id" (click)="openAddModal($event)">
                            <span>+</span>
                          </button>
                          <button class="delete-btn" (click)="deleteNode(c, $event)">🗑</button>
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
    }
    
    /* 좌측 사용자 목록 */
    .left {
      width: 200px;
      padding: 16px;
      background: #fff;
      border-right: 1px solid #e2e8f0;
      overflow-y: auto;
    }
    
    .left h3 {
      margin: 0 0 12px;
      font-size: 14px;
      font-weight: 600;
      color: #475569;
    }
    
    .user-list {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    
    .user-chip {
      display: block;
      padding: 6px 12px;
      border-radius: 8px;
      background: #e2e8f0;
      color: #475569;
      cursor: move;
      transition: all 0.2s;
      font-size: 12px;
      text-align: center;
    }
    
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
      padding: 32px;
      overflow: auto;
      position: relative;
    }
    
    .chart-container {
      min-width: 800px;
      min-height: 600px;
      position: relative;
      padding: 40px;
    }
    
    /* CEO 레벨 */
    .ceo-level {
      display: flex;
      justify-content: center;
      margin-bottom: 55px;
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
      gap: 24px;
    }
    
    .node-group {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    
    .node-group.has-children {
      margin: 0 20px;
    }

    .child-container { 
      margin-top: 50px; 
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
      gap: 24px;
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
      border-radius: 12px;
      box-shadow: 0 2px 12px rgba(0,0,0,0.08);
      min-width: 120px;
      position: relative;
      transition: all 0.3s;
      cursor: pointer;
      z-index: 1;
    }
    
    .node:hover {
      box-shadow: 0 4px 20px rgba(0,0,0,0.12);
      transform: translateY(-2px);
    }
    
    .node.selected {
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
    }
    
    .node .title {
      padding: 10px 12px;
      border-bottom: 1px solid #e2e8f0;
      font-weight: 700;
      font-size: 15px; /* CEO(16px)보다 1 작게 */
      color: #1e293b;
      text-align: center;
      cursor: move;
    }
    
    .node .title:hover {
      background: rgba(0,0,0,0.02);
    }
    
    .members {
      padding: 8px;
      min-height: 36px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      align-items: center;
    }
    
    .chip {
      display: inline-flex;
      align-items: center;
      padding: 4px 8px;
      border-radius: 14px;
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
    
    /* CEO 노드 */
    .ceo {
      background: linear-gradient(135deg, #3b82f6, #2563eb);
      color: #fff;
      min-width: 140px;
    }
    
    .ceo .title {
      border-color: rgba(255,255,255,0.2);
      color: #fff;
      font-size: 16px; /* 기준 폰트 */
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
    }
    
    .add-btn:hover {
      background: #2563eb;
      transform: translateY(-50%) scale(1.1);
    }
    
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
      gap: 24px;
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
export class OrgChartV2Component implements OnInit, AfterViewInit {
  @ViewChild('chartContainer') chartContainer!: ElementRef;
  
  users = signal<any[]>([]);
  nodes = signal<V2Node[]>([{ id:'ceo', name:'대표이사', kind:'ceo', level:0, members:[] }]);
  selected: V2Node | null = null;
  newDept = '';
  showAddModal = false;
  dragUser: any = null;
  dragFrom: V2Node | null = null;
  showLines = signal<boolean>(false);
  connectionLines = signal<Array<{path: string}>>([]);
  svgWidth = 2000;
  svgHeight = 2000;

  constructor(private orgService: OrganizationService,
    private auth: AuthService) {}
  
  ngAfterViewInit() {
    // Initial setup if needed
  }

  get ceo(): V2Node { return this.nodes()[0]; }
  specials(): V2Node[] { return this.nodes().filter(n => n.kind==='special'); }
  depts(level:number): V2Node[] { return this.nodes().filter(n => n.kind==='dept' && n.level===level); }
  childrenOf(parent: V2Node): V2Node[] { return this.nodes().filter(n => n.kind==='dept' && n.parentId===parent.id); }

  async ngOnInit(){
    const res:any = await this.auth.listUsers();
    const list:any[] = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
    this.users.set((list||[]).map(u=>({ id:u.id, name:u.name||u.email, assigned:false })));
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
    this.dragUser=null; 
    this.dragFrom=null;
    // 드래그 후 선 숨김 및 초기화
    this.hideLines();
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
    this.hideLines();
  }

  removeMember(node: V2Node, member: string, event: Event) {
    event.stopPropagation();
    node.members = node.members.filter(m => m !== member);
  }

  hasChildren(nodeId: string): boolean {
    return this.nodes().some(n => n.parentId === nodeId);
  }

  getLevel1LineLeft(): number {
    const nodes = this.depts(1);
    if (nodes.length <= 1) return 0;
    // 첫 번째 노드의 중심 위치 계산
    const nodeWidth = 120;
    const gap = 24;
    const totalWidth = nodes.length * nodeWidth + (nodes.length - 1) * gap;
    const containerWidth = 800; // 대략적인 컨테이너 너비
    const startOffset = (containerWidth - totalWidth) / 2;
    return startOffset + nodeWidth / 2; // 첫 번째 노드 중심
  }
  
  getLevel1LineWidth(): number {
    const nodes = this.depts(1);
    if (nodes.length <= 1) return 0;
    // 첫 번째와 마지막 노드 중심 사이의 거리
    const nodeWidth = 120;
    const gap = 24;
    return (nodes.length - 1) * (nodeWidth + gap);
  }
  
  getChildLineLeftPx(parent: V2Node): number {
    const children = this.childrenOf(parent);
    if (children.length <= 1) return 0;
    // 첫 번째 자식 노드의 중심 위치 (부모 컨테이너 기준)
    const nodeWidth = 120;
    const gap = 24;
    const totalWidth = children.length * nodeWidth + (children.length - 1) * gap;
    const containerWidth = totalWidth + 100; // 자식 컨테이너 너비
    const startOffset = (containerWidth - totalWidth) / 2;
    return startOffset + nodeWidth / 2;
  }
  
  getChildLineWidthPx(parent: V2Node): number {
    const children = this.childrenOf(parent);
    if (children.length <= 1) return 0;
    // 첫 번째와 마지막 자식 노드 중심 사이의 거리
    const nodeWidth = 120;
    const gap = 24;
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
    this.hideLines();
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
      this.hideLines();
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

  hideLines() {
    this.showLines.set(false);
    this.connectionLines.set([]);
  }

  drawLines() {
    setTimeout(() => {
      const lines: Array<{path: string}> = [];
      const container = this.chartContainer?.nativeElement as HTMLElement;
      if (!container) return;

      const containerRect = container.getBoundingClientRect();

      // helper: get node center (by id)
      const getCenter = (id: string) => {
        const el = id === 'ceo' 
          ? container.querySelector(`[data-node-id="ceo"]`)
          : container.querySelector(`[data-node-id="${id}"]`);
        if (!el) return null;
        const r = (el as HTMLElement).getBoundingClientRect();
        return { x: r.left - containerRect.left + r.width/2, top: r.top - containerRect.top, bottom: r.bottom - containerRect.top };
      };

      // recursive draw for a parent to its children
      const drawToChildren = (parentId: string) => {
        const parent = this.nodes().find(n => n.id === parentId);
        const children = this.nodes().filter(n => n.parentId === parentId);
        if (!children.length) return;

        const pc = getCenter(parentId);
        if (!pc) return;

        // vertical down a bit from parent
        const midY = pc.bottom + 20;
        lines.push({ path: `M ${pc.x} ${pc.bottom} L ${pc.x} ${midY}` });

        // gather child centers
        const childCenters = children
          .map(c => ({ id: c.id, c: getCenter(c.id) }))
          .filter(e => !!e.c) as Array<{id:string,c:{x:number,top:number,bottom:number}}>;
        if (!childCenters.length) return;

        // horizontal from first to last at midY
        const minX = Math.min(...childCenters.map(cc => cc.c.x));
        const maxX = Math.max(...childCenters.map(cc => cc.c.x));
        lines.push({ path: `M ${minX} ${midY} L ${maxX} ${midY}` });

        // vertical down to each child top
        childCenters.forEach(cc => {
          lines.push({ path: `M ${cc.c.x} ${midY} L ${cc.c.x} ${cc.c.top}` });
          // recurse
          drawToChildren(cc.id);
        });
      };

      // start from CEO
      const ceoC = getCenter('ceo');
      if (ceoC) {
        // small stem under CEO
        const stemY = ceoC.bottom + 10;
        lines.push({ path: `M ${ceoC.x} ${ceoC.bottom} L ${ceoC.x} ${stemY}` });
      }
      drawToChildren('ceo');

      this.connectionLines.set(lines);
      this.showLines.set(true);
    }, 100);
  }
}


