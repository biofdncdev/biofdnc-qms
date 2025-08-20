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
import { SupabaseService } from '../../services/supabase.service';
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

  constructor(
    private fb: FormBuilder,
    private supabaseService: SupabaseService,
    private router: Router
  ) {
    this.signupForm = this.fb.group(
      {
        name: new FormControl('', { validators: [Validators.required], updateOn: 'change' }),
        email: new FormControl('', { validators: [Validators.required, Validators.email], updateOn: 'change' }),
        password: new FormControl('', { validators: [Validators.required, Validators.minLength(6)], updateOn: 'change' }),
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

    this.errorMessage = null;
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
          // 이미 auth에 존재하지만 users 테이블에 없을 수 있는 케이스를 위해
          // 비밀번호 재설정 메일을 발송하여 계정 복구를 유도
          try {
            await this.supabaseService.getClient().auth.resetPasswordForEmail(email, {
              redirectTo: `${location.origin}/login`
            });
            alert('이미 가입된 이메일입니다. 비밀번호 재설정 링크를 이메일로 발송했습니다. 메일함을 확인해주세요.');
            return;
          } catch (e) {
            const emailCtrl = this.signupForm.get('email');
            const nextErrors = { ...(emailCtrl?.errors || {}), duplicate: true };
            emailCtrl?.setErrors(nextErrors);
            return;
          }
        }

        throw error;
      }

      if (!data?.user) {
        alert('가입 요청이 접수되었습니다. 이메일로 전송된 인증 링크를 확인해주세요.');
        // 관리자 알림 등록
        try {
          await this.supabaseService.addSignupNotification({ email, name });
        } catch {}
        return;
      }

      // 이메일 인증이 필요한 워크플로라면 여기서도 알림을 남겨 관리자 검토를 유도
      try {
        await this.supabaseService.addSignupNotification({ email, name });
      } catch {}
      alert('회원가입에 성공했습니다! 로그인 페이지로 이동합니다.');
      this.router.navigate(['/login']);
    } catch (error: any) {
      this.errorMessage = `회원가입 중 오류가 발생했습니다: ${error.message}`;
      console.error('Signup error:', error);
    }
  }
}
