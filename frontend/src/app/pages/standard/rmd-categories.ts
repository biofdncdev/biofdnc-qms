import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../services/supabase.service';

interface Cat { id: string; name: string; doc_prefix: string; created_at?: string; updated_at?: string }

@Component({
  selector: 'app-rmd-categories',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="page" style="padding:16px;">
    <h2 style="margin:0 0 12px 0;">규정 카테고리 등록</h2>
    <div class="form" style="display:flex; gap:8px; align-items:flex-end; flex-wrap:wrap; margin-bottom:12px;">
      <div style="display:flex; flex-direction:column;">
        <label>카테고리명</label>
        <input type="text" [(ngModel)]="form.name" placeholder="예: 일반관리기준서" style="height:32px; padding:6px 8px; border:1px solid #d1d5db; border-radius:8px;" />
      </div>
      <div style="display:flex; flex-direction:column;">
        <label>문서번호</label>
        <input type="text" [(ngModel)]="form.doc_prefix" placeholder="예: BF-RMD-GM" style="height:32px; padding:6px 8px; border:1px solid #d1d5db; border-radius:8px; min-width:220px;" />
      </div>
      <button class="btn" (click)="save()" [disabled]="busy()" style="height:32px; padding:0 12px;">{{ busy() ? '저장중…' : '저장' }}</button>
    </div>

    <div class="list" style="border:1px solid #e5e7eb; border-radius:12px; overflow:hidden;">
      <div style="display:grid; grid-template-columns: 1fr 1fr 80px; gap:0; background:#f8fafc; border-bottom:1px solid #e5e7eb; padding:8px 10px; font-weight:700;">
        <div>카테고리명</div><div>문서번호</div><div>삭제</div>
      </div>
      <div *ngFor="let c of cats()" style="display:grid; grid-template-columns: 1fr 1fr 80px; gap:0; padding:8px 10px; border-bottom:1px solid #f1f5f9; align-items:center;">
        <div>{{ c.name }}</div>
        <div>{{ c.doc_prefix }}</div>
        <div><button class="btn danger" (click)="remove(c)" [disabled]="busy()">삭제</button></div>
      </div>
      <div *ngIf="!cats().length" style="padding:12px; color:#94a3b8;">등록된 카테고리가 없습니다.</div>
    </div>
  </div>
  `,
  styles: [`
    .btn{ background:#2563eb; color:#fff; border:0; border-radius:8px; cursor:pointer; }
    .btn.danger{ background:#ef4444; }
    label{ font-size:12px; color:#475569; margin-bottom:4px; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RmdCategoriesComponent {
  cats = signal<Cat[]>([]);
  busy = signal<boolean>(false);
  form: { name: string; doc_prefix: string } = { name: '', doc_prefix: '' };
  constructor(private supabase: SupabaseService){ this.load(); }
  async load(){ this.cats.set(await this.supabase.listRmdCategories()); }
  async save(){
    if(!(this.form.name||'').trim() || !(this.form.doc_prefix||'').trim()) return;
    this.busy.set(true);
    try{ await this.supabase.upsertRmdCategory({ name: this.form.name.trim(), doc_prefix: this.form.doc_prefix.trim() } as any); this.form = { name:'', doc_prefix:'' }; await this.load(); }
    finally{ this.busy.set(false); }
  }
  async remove(c: Cat){ if(!confirm('삭제할까요?')) return; this.busy.set(true); try{ await this.supabase.deleteRmdCategory(c.id); await this.load(); } finally{ this.busy.set(false); } }
}
