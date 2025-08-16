import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login'; // .ts 확장자는 생략합니다.

export const routes: Routes = [
  // 기본 경로를 login 컴포넌트로 설정
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent }
];
