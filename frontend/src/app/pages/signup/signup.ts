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
} from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterLink } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';

// 비밀번호 일치 커스텀 유효성 검사기
export function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');

  if (password && confirmPassword && password.value !== confirmPassword.value) {
    confirmPassword.setErrors({ passwordMismatch: true });
    return { passwordMismatch: true };
  } else {
    // control.get('confirmPassword')?.setErrors(null);
    return null;
  }
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

  constructor(
    private fb: FormBuilder,
    private supabaseService: SupabaseService,
    private router: Router
  ) {
    this.signupForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
    }, { validators: passwordMatchValidator });
  }

  get email() {
    return this.signupForm.get('email');
  }

  get confirmPassword() {
    return this.signupForm.get('confirmPassword');
  }

  async onSubmit() {
    if (this.signupForm.valid) {
      this.errorMessage = null;
      const { name, email, password } = this.signupForm.value;

      try {
        // 1. Supabase Auth로 사용자 생성
        const { data: authData, error: authError } = await this.supabaseService
          .getClient()
          .auth.signUp({
            email: email,
            password: password,
          });

        if (authError) {
          throw authError;
        }

        if (authData.user) {
          // 2. 'users' 테이블에 추가 정보 저장
          const now = new Date().toISOString();
          const { error: dbError } = await this.supabaseService
            .getClient()
            .from('users')
            .insert([
              {
                id: authData.user.id, // Auth user id와 동일하게 설정
                name: name,
                email: email,
                created_at: now,
                updated_at: now,
                last_sign_in_at: now,
                is_online: true,
              },
            ]);

          if (dbError) {
            throw dbError;
          }

          // 회원가입 성공 시 로그인 페이지로 이동
          this.router.navigate(['/login']);
        }
      } catch (error: any) {
        if (error.message.includes('unique constraint')) {
          this.errorMessage = '이미 사용 중인 이메일입니다.';
        } else {
          this.errorMessage = '회원가입 중 오류가 발생했습니다.';
        }
        console.error('Signup error:', error);
      }
    }
  }
}
