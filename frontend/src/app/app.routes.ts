import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { LoginComponent } from './pages/login/login';
import { SignupComponent } from './pages/signup/signup';
import { AppShellComponent } from './pages/app-shell/app-shell';
import { RoleAdminComponent } from './pages/admin/role-admin';
import { HomeComponent } from './pages/home/home';
import { ProfileComponent } from './pages/profile/profile';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'app',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then(m => m.LoginComponent),
  },
  {
    path: 'forgot-credentials',
    loadComponent: () => import('./pages/forgot-credentials/forgot-credentials').then(m => m.ForgotCredentialsComponent),
  },
  {
    path: 'signup',
    loadComponent: () => import('./pages/signup/signup').then(m => m.SignupComponent),
  },
  {
    path: 'app',
    loadComponent: () => import('./pages/app-shell/app-shell').then(m => m.AppShellComponent),
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      {
        path: 'home',
        loadComponent: () => import('./pages/home/home').then(m => m.HomeComponent),
      },
      {
        path: 'alerts',
        loadComponent: () => import('./pages/alerts/alerts').then(m => m.AlertsComponent),
      },
      {
        path: 'admin/roles',
        loadComponent: () => import('./pages/admin/role-admin').then(m => m.RoleAdminComponent),
      },
      {
        path: 'profile',
        loadComponent: () => import('./pages/profile/profile').then(m => m.ProfileComponent),
      },
      {
        path: 'standard/rmd',
        loadComponent: () => import('./standard/rmd/rmd-page.component').then(m => m.RmdPageComponent),
      },
      {
        path: 'record/rmd-forms',
        loadComponent: () => import('./record/rmd-forms/rmd-forms.component').then(m => m.RmdFormsComponent),
      },
      {
        path: 'audit/amorepacific',
        loadComponent: () => import('./pages/home/home').then(m => m.HomeComponent),
      },
      {
        path: 'audit/givaudan',
        loadComponent: () => import('./pages/audit/givaudan/audit-givaudan.component').then(m => m.AuditGivaudanComponent),
      },
      {
        path: 'ingredient',
        loadComponent: () => import('./pages/ingredient/ingredient-list').then(m => m.IngredientListComponent),
      },
      {
        path: 'ingredient/form',
        loadComponent: () => import('./pages/ingredient/ingredient-form').then(m => m.IngredientFormComponent),
      },
      {
        path: 'sale/rice-bran-water-h',
        loadComponent: () => import('./pages/sale/rice-bran-water-h').then(m => m.RiceBranWaterHComponent),
      },
    ]
  },
  {
    path: '**',
    redirectTo: 'app',
  }
];
