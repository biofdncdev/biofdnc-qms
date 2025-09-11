import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

// Angular Material Modules
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  // 실제 파일 이름과 일치시킵니다.
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class LoginComponent implements OnInit {
  email = '';
  password = '';
  recovery = false;
  newPassword = '';
  confirmNewPassword = '';
  private maxAttempts = 10;

  constructor(private router: Router, private supabase: SupabaseService) {}

  submitOnEnter(event: Event) {
    event.preventDefault();
    this.login();
  }

  async login() {
    const email = this.email?.trim().toLowerCase();
    const password = this.password ?? '';

    if (!email || !password) {
      alert('이메일과 비밀번호를 입력하세요.');
      return;
    }

    // Simple client-side rate limiting per email
    const key = `login.fail.${email}`;
    const raw = localStorage.getItem(key) || '0';
    let fails = parseInt(raw, 10); if (!Number.isFinite(fails)) fails = 0;
    if (fails >= this.maxAttempts) {
      alert('로그인 시도가 여러 차례 실패하여 계정이 일시적으로 잠겼습니다. 관리자에게 문의해 주세요.');
      return;
    }

    const { data, error } = await this.supabase.signIn(email, password);
    if (error) {
      // Increase local fail counter and block after threshold
      fails += 1; localStorage.setItem(key, String(fails));
      if (fails >= this.maxAttempts) {
        alert('비밀번호를 여러 번 잘못 입력하여 로그인이 차단되었습니다. 관리자에게 문의해 주세요.');
      } else {
        alert(`로그인 실패: 이메일 또는 비밀번호가 올바르지 않습니다. (${fails}/${this.maxAttempts})`);
      }
      return;
    }

    // Successful login: reset the local counter
    try { localStorage.removeItem(key); } catch {}
    const user = await this.supabase.getCurrentUser();
    if (!user) {
      alert('로그인 세션을 확인할 수 없습니다. 다시 시도해주세요.');
      return;
    }

    // 프로필 자동 생성 제거: 탈퇴 직후 재생성되는 문제 방지

    const { data: profile, error: pError } = await this.supabase.getUserProfile(user.id);
    if (pError || !profile) {
      // 방금 ensureUserProfile 수행 후에도 조회가 실패하면 viewer 기본권한으로 진행 차단 안내
      alert('프로필을 불러오지 못했습니다. 관리자에게 문의하세요.');
      await this.supabase.signOut();
      return;
    }

    // viewer도 로그인 허용 (메뉴 제한은 앱 셸에서 처리)

    await this.supabase.updateLoginState(user.id, true);
    this.router.navigate(['/app']);
  }

  async requestDelete(){
    const email = (this.email || '').trim().toLowerCase();
    if (!email){
      const input = prompt('탈퇴 요청 이메일을 입력하세요');
      if (!input) return;
      const e = input.trim().toLowerCase();
      if (!e){ alert('이메일을 입력하세요.'); return; }
      await this.supabase.addDeleteRequestNotification({ email: e });
      alert('회원탈퇴 요청이 접수되었습니다. 관리자 검토 후 처리됩니다.');
      return;
    }
    await this.supabase.addDeleteRequestNotification({ email });
    alert('회원탈퇴 요청이 접수되었습니다. 관리자 검토 후 처리됩니다.');
  }

  async resendConfirm(){
    const email = (this.email || '').trim().toLowerCase();
    if (!email){
      const input = prompt('가입 당시 이메일을 입력하세요');
      if (!input) return;
      const e = input.trim().toLowerCase();
      if (!e){ alert('이메일을 입력하세요.'); return; }
      await this.supabase.resendConfirmationEmail(e);
      alert('인증(로그인) 링크를 이메일로 재발송했습니다. 메일함/스팸함을 확인해주세요.');
      return;
    }
    await this.supabase.resendConfirmationEmail(email);
    alert('인증(로그인) 링크를 이메일로 재발송했습니다. 메일함/스팸함을 확인해주세요.');
  }

  ngOnInit(): void {
    // 일부 환경에서 IME 기본값이 한글일 수 있으므로, 영문 입력 강제는 브라우저/OS 권한 밖입니다.
    // 대신 페이지 진입 시 email 필드에 포커스가 위치하도록 보장합니다.
    // Angular의 autofocus가 동작하지 않는 브라우저를 대비해 수동 포커스 시도
    queueMicrotask(() => {
      const el = document.querySelector('input[name="email"]') as HTMLInputElement | null;
      el?.focus();
    });

    // Detect password recovery mode from URL (Supabase appends type=recovery with access token)
    const hash = location.hash || '';
    const search = location.search || '';
    const urlType = new URLSearchParams(search).get('type');
    if (hash.includes('type=recovery') || urlType === 'recovery') {
      this.recovery = true;
    }
  }

  async setNewPassword(){
    const p1 = (this.newPassword || '').trim();
    const p2 = (this.confirmNewPassword || '').trim();
    if (!p1 || p1.length < 6) { alert('새 비밀번호는 6자 이상이어야 합니다.'); return; }
    if (p1 !== p2) { alert('비밀번호가 서로 다릅니다.'); return; }
    try {
      await this.supabase.getClient().auth.updateUser({ password: p1 });
      alert('비밀번호가 변경되었습니다. 새 비밀번호로 로그인하세요.');
      await this.supabase.signOut();
      this.recovery = false;
      this.newPassword = '';
      this.confirmNewPassword = '';
    } catch (e: any) {
      alert('비밀번호 변경 실패: ' + (e?.message || e));
    }
  }
}
