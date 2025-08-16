import { Routes } from '@angular/router';
// '.component' 부분을 제거하여 실제 파일 이름과 일치시킵니다.
import { LoginComponent } from './pages/login/login';
import { SignupComponent } from './pages/signup/signup';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
];
