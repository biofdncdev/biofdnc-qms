import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login';
import { SignupComponent } from './pages/signup/signup';
import { AppShellComponent } from './pages/app-shell/app-shell';
import { RoleAdminComponent } from './pages/admin/role-admin';
import { HomeComponent } from './pages/home/home';
import { ProfileComponent } from './pages/profile/profile';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },

  {
    path: 'app',
    component: AppShellComponent,
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: HomeComponent },
      { path: 'profile', component: ProfileComponent },
      { path: 'admin/roles', component: RoleAdminComponent },
    ],
  },

  { path: '**', redirectTo: 'login' },
];
