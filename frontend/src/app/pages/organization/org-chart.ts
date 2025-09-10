import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-org-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
  <div class="org-embed">
    <div class="toolbar">
      <a class="btn btn-primary" [href]="editHref" target="_blank" rel="noopener">수정</a>
      <button class="btn" (click)="reload()">새로고침</button>
      <button class="btn" (click)="toggleFullscreen()">전체화면</button>
    </div>
    <iframe #frame class="embed" [src]="embedUrl" allowfullscreen allow="fullscreen; clipboard-write; clipboard-read" style="border:none"></iframe>
  </div>
  `,
  styles: [`
    .org-embed{ height:calc(100vh - 120px); background:#f8fafc; display:flex; flex-direction:column; overflow:hidden; margin:0; padding:0; }
    .toolbar{ display:flex; gap:10px; justify-content:flex-end; padding:8px 16px; height:44px; box-sizing:border-box; }
    .btn{ appearance:none; background:#ffffff; border:1px solid #e5e7eb; color:#111827; padding:0 12px; border-radius:10px; font-size:13px; line-height:1; cursor:pointer; text-decoration:none; box-shadow:0 1px 2px rgba(0,0,0,.06); transition:all .15s ease; font-weight:600; display:inline-flex; align-items:center; justify-content:center; height:34px; min-width:92px; box-sizing:border-box; }
    .btn:hover{ background:#f9fafb; border-color:#d1d5db; box-shadow:0 2px 6px rgba(0,0,0,.08); }
    .btn:active{ transform:translateY(1px); box-shadow:0 1px 3px rgba(0,0,0,.1); }
    .btn:focus-visible{ outline:2px solid #2563eb; outline-offset:2px; }
    .btn-primary{ background:#2563eb; color:#ffffff; border-color:#2563eb; box-shadow:0 1px 2px rgba(37,99,235,.4); height:34px; min-width:92px; }
    .btn-primary:hover{ background:#1d4ed8; border-color:#1d4ed8; box-shadow:0 2px 8px rgba(37,99,235,.5); }
    .btn-primary:active{ transform:translateY(1px); }
    .embed{ width:100%; height:calc(100% - 40px); border:none; display:block; }
  `]
})
export class OrgChartComponent {
  embedUrl: SafeResourceUrl;
  editHref: string;
  private embedSrc = 'https://whimsical.com/embed/SXd17UkERydeG7Mev9ebGN@2nr1gScbNHAs6x1qZTZQgJWCYEYHHFPKfVQKUqzKa42K1A1KvU';
  constructor(private sanitizer: DomSanitizer){
    this.embedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.embedSrc);
    this.editHref = 'https://whimsical.com/bio-fd-and-c-SXd17UkERydeG7Mev9ebGN';
  }
  reload(){ location.reload(); }
  toggleFullscreen(){
    const el = document.querySelector('.embed') as HTMLElement | null;
    if(!el) return;
    const anyEl = el as any;
    if(document.fullscreenElement){ (document as any).exitFullscreen?.(); return; }
    anyEl.requestFullscreen?.();
  }
}


