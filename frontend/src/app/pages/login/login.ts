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

    const { data, error } = await this.supabase.signIn(email, password);
    if (error) {
      alert('로그인 실패: ' + error.message);
      return;
    }

    const user = await this.supabase.getCurrentUser();
    if (!user) {
      alert('로그인 세션을 확인할 수 없습니다. 다시 시도해주세요.');
      return;
    }

    const { data: profile, error: pError } = await this.supabase.getUserProfile(user.id);
    if (pError || !profile) {
      alert('프로필을 불러오지 못했습니다.');
      return;
    }

    if (profile.role === 'viewer') {
      alert('관리자 검토 중입니다. 승인이 완료되면 로그인할 수 있습니다.');
      await this.supabase.signOut();
      return;
    }

    await this.supabase.updateLoginState(user.id, true);
    this.router.navigate(['/app']);
  }

  ngOnInit(): void {
    // 일부 환경에서 IME 기본값이 한글일 수 있으므로, 영문 입력 강제는 브라우저/OS 권한 밖입니다.
    // 대신 페이지 진입 시 email 필드에 포커스가 위치하도록 보장합니다.
    // Angular의 autofocus가 동작하지 않는 브라우저를 대비해 수동 포커스 시도
    queueMicrotask(() => {
      const el = document.querySelector('input[name="email"]') as HTMLInputElement | null;
      el?.focus();
    });
  }
}
