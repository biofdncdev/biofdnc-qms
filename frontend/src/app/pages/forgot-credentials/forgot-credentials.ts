import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-forgot-credentials',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="forgot">
    <h3>아이디 / 비밀번호 찾기</h3>
    <div class="section">
      <h4>아이디 찾기</h4>
      <p>가입하신 이메일이 아이디입니다. 가입 이메일을 모르면 관리자에게 문의하세요.</p>
    </div>
    <div class="section">
      <h4>비밀번호 변경</h4>
      <label>이메일</label>
      <input [(ngModel)]="email" placeholder="email@example.com" />
      <div class="actions">
        <button (click)="startReset()">비밀번호 변경하기</button>
      </div>
      <p class="hint">이메일로 온 링크를 누르면 이 화면으로 돌아옵니다. 새 비밀번호를 아래에 입력하세요.</p>
      <div *ngIf="isRecovery">
        <label>새 비밀번호</label>
        <input [(ngModel)]="newPassword" type="password" />
        <label>새 비밀번호 확인</label>
        <input [(ngModel)]="confirmPassword" type="password" />
        <div class="actions">
          <button (click)="applyNewPassword()">변경 완료</button>
        </div>
      </div>
    </div>
  </div>
  `,
  styles: [`
  .forgot{ max-width:480px; margin:24px auto; padding:16px; background:#fff; border:1px solid #eee; border-radius:12px; }
  h3{ margin:0 0 12px; }
  .section{ margin:12px 0; }
  label{ display:block; font-size:13px; margin:6px 0 4px; color:#334155; }
  input{ width:100%; border:1px solid #e5e7eb; border-radius:10px; padding:8px 10px; }
  .actions{ margin-top:10px; display:flex; gap:8px; }
  button{ padding:8px 12px; border-radius:10px; border:1px solid #e5e7eb; background:#0ea5e9; color:#fff; font-weight:800; }
  .hint{ color:#6b7280; font-size:12px; }
  `]
})
export class ForgotCredentialsComponent {
  email = '';
  newPassword = '';
  confirmPassword = '';
  isRecovery = false;

  constructor(private supabase: SupabaseService){
    const hash = location.hash || '';
    const search = location.search || '';
    const urlType = new URLSearchParams(search).get('type');
    this.isRecovery = hash.includes('type=recovery') || urlType === 'recovery';
  }

  async startReset(){
    const e = (this.email || '').trim().toLowerCase();
    if (!e){ alert('이메일을 입력하세요.'); return; }
    await this.supabase.getClient().auth.resetPasswordForEmail(e, { redirectTo: 'https://biofdnc-qms.vercel.app/login' });
    alert('이메일로 비밀번호 변경 링크를 보냈습니다. 메일함/스팸함을 확인해주세요.');
  }

  async applyNewPassword(){
    const p1 = (this.newPassword || '').trim();
    const p2 = (this.confirmPassword || '').trim();
    if (!p1 || p1.length < 6){ alert('새 비밀번호는 6자 이상이어야 합니다.'); return; }
    if (p1 !== p2){ alert('비밀번호가 서로 다릅니다.'); return; }
    await this.supabase.getClient().auth.updateUser({ password: p1 });
    alert('비밀번호가 변경되었습니다. 로그인 페이지로 이동합니다.');
    location.href = '/login';
  }
}


