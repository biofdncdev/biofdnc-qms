import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors,
  FormControl,
  FormGroupDirective,
  NgForm,
} from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ErrorStateMatcher } from '@angular/material/core';

// 입력을 시작하면(Dirty) 즉시 에러 상태로 간주하는 매처
export class ImmediateErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    if (!control) return false;
    const startedTyping = control.dirty || (!!control.value && `${control.value}`.length > 0);
    return control.invalid && startedTyping;
  }
}

// 비밀번호 일치 커스텀 유효성 검사기
export function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirm = control.get('confirmPassword');

  if (!confirm) return null;

  if (password !== confirm.value) {
    const nextErrors = { ...(confirm.errors || {}), passwordMismatch: true };
    confirm.setErrors(nextErrors);
  } else {
    if (confirm.errors && 'passwordMismatch' in confirm.errors) {
      const { passwordMismatch, ...rest } = confirm.errors as Record<string, any>;
      const hasOthers = Object.keys(rest).length > 0;
      confirm.setErrors(hasOthers ? rest : null);
    }
  }
  return null;
}

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './signup.html',
  styleUrls: ['./signup.scss'],
})
export class SignupComponent {
  signupForm: FormGroup;
  errorMessage: string | null = null;
  immediateMatcher = new ImmediateErrorStateMatcher();
  submitting = false;
  cooldownRemainingSec = 0;
  private cooldownTimer?: any;
  private lastSubmitTime = 0;
  private readonly MIN_SUBMIT_INTERVAL_MS = 2000; // 2초 디바운스

  constructor(
    private fb: FormBuilder,
    private supabaseService: AuthService,
    private router: Router
  ) {
    // 회원가입 페이지 진입 시 기존 세션 제거 (rate limit 방지)
    this.clearAnyExistingSession();
    
    this.signupForm = this.fb.group(
      {
        name: new FormControl('', { validators: [Validators.required], updateOn: 'change' }),
        email: new FormControl('', { validators: [Validators.required, Validators.email], updateOn: 'change' }),
        password: new FormControl('', { validators: [Validators.required, Validators.minLength(8)], updateOn: 'change' }),
        confirmPassword: new FormControl('', { validators: [Validators.required], updateOn: 'change' }),
      },
      { validators: passwordMatchValidator, updateOn: 'change' }
    );

    // 이메일/확인 입력 시 즉시 dirty로 만들어 에러가 곧바로 노출되도록 보장
    const emailCtrl = this.signupForm.get('email') as FormControl;
    emailCtrl.valueChanges.subscribe(() => emailCtrl.markAsDirty({ onlySelf: true }));

    const confirmCtrl = this.signupForm.get('confirmPassword') as FormControl;
    confirmCtrl.valueChanges.subscribe(() => confirmCtrl.markAsDirty({ onlySelf: true }));

    // 이메일 값 변경 시 duplicate 에러 제거
    this.signupForm.get('email')?.valueChanges.subscribe(() => {
      const ctrl = this.signupForm.get('email');
      if (ctrl?.errors?.['duplicate']) {
        const { duplicate, ...rest } = ctrl.errors as Record<string, any>;
        ctrl.setErrors(Object.keys(rest).length ? rest : null);
      }
    });
  }

  get email() {
    return this.signupForm.get('email');
  }

  get confirmPassword() {
    return this.signupForm.get('confirmPassword');
  }

  async onSubmit() {
    if (this.signupForm.invalid) return;
    if (this.submitting || this.cooldownRemainingSec > 0) return;

    // 디바운스: 마지막 제출로부터 최소 2초 경과 필요
    const now = Date.now();
    if (now - this.lastSubmitTime < this.MIN_SUBMIT_INTERVAL_MS) {
      console.warn('Too many signup requests. Please wait.');
      return;
    }
    this.lastSubmitTime = now;

    this.errorMessage = null;
    this.submitting = true;
    const name: string = this.signupForm.value.name;
    const email: string = String(this.signupForm.value.email || '').trim().toLowerCase();
    const password: string = this.signupForm.value.password;

    try {
      // 가용성 사전 체크는 신뢰하지 않고, 실제 auth.signUp 결과로 처리 분기
      // (auth에 기존 레코드가 남아있을 수 있으므로)

      const { data, error } = await this.supabaseService
        .getClient()
        .auth.signUp({
          email,
          password,
          options: { data: { name } },
        });

      if (error) {
        const msg = String((error as any)?.message || '').toLowerCase();
        const desc = String((error as any)?.error_description || '').toLowerCase();
        const looksDuplicate =
          msg.includes('already registered') ||
          desc.includes('already registered') ||
          msg.includes('user already exists') ||
          desc.includes('user already exists');

        if (looksDuplicate) {
          // 이미 auth에 존재하는 이메일: 레이트리밋 방지를 위해 resetPasswordForEmail 호출 제거
          const emailCtrl = this.signupForm.get('email');
          const nextErrors = { ...(emailCtrl?.errors || {}), duplicate: true };
          emailCtrl?.setErrors(nextErrors);
          this.errorMessage = '이미 가입된 이메일입니다. 로그인 페이지에서 "비밀번호를 잊으셨나요?"를 이용해 주세요.';
          return;
        }

        throw error;
      }

      if (!data?.user) {
        alert('회원가입이 완료되었습니다. 관리자에게 권한 요청을 해주세요. 승인 후 로그인하실 수 있습니다.');
        // 관리자 알림 등록
        try {
          await this.supabaseService.addSignupNotification({ email, name });
        } catch {}
        this.router.navigate(['/login']);
        return;
      }

      // 관리자 알림 등록
      try {
        await this.supabaseService.addSignupNotification({ email, name });
      } catch {}
      alert('회원가입이 완료되었습니다. 관리자에게 권한 요청을 해주세요. 승인 후 로그인하실 수 있습니다.');
      this.router.navigate(['/login']);
    } catch (error: any) {
      const message = String(error?.message || '');
      console.error('Signup error:', error);
      
      // 429 레이트리밋 처리: 메시지 내 남은 시간 파싱(대략 59초) 후 쿨다운 시작
      const isRateLimited = (error?.status === 429) || /after\s+(\d+)\s*seconds?/i.test(message);
      let seconds = 0;
      const m = message.match(/after\s+(\d+)\s*seconds?/i);
      if (m && m[1]) seconds = parseInt(m[1], 10);
      if (!Number.isFinite(seconds) || seconds <= 0) seconds = 60;
      
      if (isRateLimited) {
        this.errorMessage = `보안상의 이유로 ${seconds}초 후에 다시 시도할 수 있습니다.\n\n` +
          `💡 즉시 가입하려면 다음 방법을 시도해보세요:\n` +
          `• 모바일 핫스팟으로 연결\n` +
          `• VPN 사용\n` +
          `• 다른 네트워크 환경에서 시도`;
        this.startCooldown(seconds);
      } else {
        this.errorMessage = `회원가입 중 오류가 발생했습니다: ${message}`;
      }
    }
    finally {
      // 약간의 딜레이 후 더블클릭 방지 해제
      setTimeout(() => { this.submitting = false; }, 800);
    }
  }

  private startCooldown(seconds: number) {
    try { if (this.cooldownTimer) clearInterval(this.cooldownTimer); } catch {}
    this.cooldownRemainingSec = Math.max(1, Math.min(120, Math.floor(seconds)));
    this.cooldownTimer = setInterval(() => {
      this.cooldownRemainingSec -= 1;
      if (this.cooldownRemainingSec <= 0) {
        try { clearInterval(this.cooldownTimer); } catch {}
        this.cooldownTimer = undefined;
        this.cooldownRemainingSec = 0;
      }
    }, 1000);
  }

  private clearAnyExistingSession() {
    try {
      // API 호출 없이 로컬 저장소만 정리 (rate limit 방지)
      const storageKey = 'qms-auth';
      
      // SessionStorage에서 Supabase 세션 제거
      if (typeof sessionStorage !== 'undefined') {
        const keys = Object.keys(sessionStorage);
        keys.forEach(key => {
          if (key.startsWith(storageKey) || key.includes('supabase')) {
            sessionStorage.removeItem(key);
          }
        });
      }
      
      // LocalStorage에서도 제거 (혹시 남아있을 수 있음)
      if (typeof localStorage !== 'undefined') {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
          if (key.startsWith(storageKey) || key.includes('supabase')) {
            localStorage.removeItem(key);
          }
        });
      }
    } catch (err) {
      // 저장소 정리 실패는 무시 (회원가입에 영향 없음)
      console.debug('Storage cleanup on signup page:', err);
    }
  }
}
