import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-alerts',
  standalone: true,
  imports: [CommonModule],
  template: `
  <div class="alerts">
    <div class="head">
      <h3>알림</h3>
      <button class="btn" (click)="markAll()" [disabled]="unreadCount()===0">모두 읽음 처리</button>
    </div>
    <div class="list">
      <div class="item" *ngFor="let n of notifications()">
        <div class="title">
          <span class="chip" [class.unread]="!n.read_at">{{ n.type || '알림' }}</span>
          <b>{{ n.title || '알림' }}</b>
          <span class="time">{{ n.created_at | date:'yyyy-MM-dd HH:mm' }}</span>
        </div>
        <div class="msg">{{ n.message }}</div>
        <div class="meta">
          <span *ngIf="n.actor_name || n.actor_email">from {{ n.actor_name || n.actor_email }}</span>
          <a *ngIf="n.link" (click)="go(n.link!)">이동</a>
        </div>
      </div>
    </div>
  </div>
  `,
  styles: [`
  .alerts{ padding:16px; max-width:900px; margin:0 auto; }
  .head{ display:flex; align-items:center; justify-content:space-between; margin-bottom:12px; }
  .btn{ padding:6px 10px; border:1px solid #e5e7eb; border-radius:10px; background:#fff; font-weight:700; font-size:12px; }
  .list{ display:flex; flex-direction:column; gap:10px; }
  .item{ border:1px solid #e5e7eb; border-radius:10px; padding:10px; background:#fff; }
  .title{ display:flex; align-items:center; gap:8px; }
  .time{ margin-left:auto; color:#64748b; font-size:12px; }
  .chip{ font-size:10px; padding:0 8px; background:#e5e7eb; border-radius:999px; height:20px; display:inline-flex; align-items:center; }
  .chip.unread{ background:#dbeafe; color:#1d4ed8; font-weight:800; }
  .msg{ margin:6px 0; }
  .meta{ display:flex; align-items:center; gap:8px; color:#475569; font-size:12px; }
  a{ cursor:pointer; color:#1d4ed8; text-decoration:underline; }
  `]
})
export class AlertsComponent implements OnInit {
  notifications = signal<any[]>([]);
  unreadCount = signal<number>(0);

  constructor(private auth: AuthService, private router: Router) {}

  async ngOnInit() {
    await this.load();
  }

  async load(){
    const { data } = await this.auth.listNotifications();
    this.notifications.set(data || []);
    this.unreadCount.set((data || []).filter((n:any)=>!n.read_at).length);
  }

  async markAll(){
    await this.auth.markAllNotificationsRead();
    await this.load();
  }

  go(path: string){
    if (!path) return;
    this.router.navigate([path]);
  }
}


