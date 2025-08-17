import { Component, signal } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterOutlet,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    MatMenuModule,
    MatTooltipModule,
  ],
  templateUrl: './app-shell.html',
  styleUrls: ['./app-shell.scss'],
  animations: [
    trigger('routeFade', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('220ms ease', style({ opacity: 1 }))
      ])
    ])
  ]
})
export class AppShellComponent {
  selected = signal<string>('home');
  leftOpen = false;
  // Motion tokens derived from M3 motion guidance
  readonly drawerDurationMs = 320;
  readonly drawerEasing = 'cubic-bezier(0.2, 0, 0, 1)';
  sectionMenu: Array<{ label: string; path?: string; onClick?: () => void; selected?: boolean }> = [];
  menus: Array<{ key: string; icon: string; label: string; path?: string; submenu?: Array<{ label: string; path?: string }> }> = [
    { key: 'home', icon: 'home', label: 'Home', path: '/app/home' },
    { key: 'ingredient', icon: 'inventory_2', label: 'Ingredient', submenu: [
      { label: '목록' }, { label: '등록' }, { label: '승인' }
    ] },
    { key: 'product', icon: 'category', label: 'Product', submenu: [
      { label: '목록' }, { label: '등록' }
    ] },
    { key: 'standard', icon: 'tune', label: 'Standard', submenu: [ { label: '개정 관리' } ] },
    { key: 'record', icon: 'description', label: 'Record', submenu: [ { label: '업로드' }, { label: '검토' } ] },
    { key: 'audit', icon: 'fact_check', label: 'Audit', submenu: [ { label: '내부 감사' }, { label: '외부 감사' } ] },
    { key: 'user', icon: 'group', label: 'User', submenu: [
      // 관리자만 사용자 관리 노출 (프로필 제외)
    ] },
  ];
  isAdmin = false;

  constructor(private router: Router, private supabase: SupabaseService) {
    // Determine admin on boot
    this.supabase.getCurrentUser().then(async (u) => {
      if (u) {
        const { data } = await this.supabase.getUserProfile(u.id);
        this.isAdmin = data?.role === 'admin' || data?.role === 'manager';
      }
      this.buildMenus();
    });
    // initial menus before profile resolves
    this.buildMenus();
  }

  private buildMenus() {
    // ensure admin submenu appended when rights are available
    const userMenu = this.menus.find(m => m.key === 'user');
    if (userMenu) {
      userMenu.submenu = [
        ...(this.isAdmin ? [{ label: '사용자 관리', path: '/app/admin/roles' }] : [])
      ];
    }
  }

  private openLeftForKey(key: string) {
    this.selected.set(key);
    const menu = this.menus.find(m => m.key === key);
    this.sectionMenu = menu?.submenu ?? [];
    if (this.sectionMenu.length > 0) this.leftOpen = true;
  }

  onRailMouseEnter(key: string) {
    const menu = this.menus.find(m => m.key === key);
    if (menu?.submenu && menu.submenu.length > 0) {
      this.openLeftForKey(key);
    } else {
      this.selected.set(key);
    }
  }

  onMainClick(menu: { key: string; path?: string; submenu?: Array<{ label: string; path?: string }> }) {
    this.selected.set(menu.key);
    if (menu.submenu && menu.submenu.length > 0) {
      // keep drawer open
      this.sectionMenu = menu.submenu;
      this.leftOpen = true;
      if (menu.path) this.router.navigate([menu.path]);
      return;
    }
    // no submenu → navigate and close drawer
    if (menu.path) this.router.navigate([menu.path]);
    this.leftOpen = false;
  }

  onSubClick(item: { path?: string }) {
    // run inline action if provided
    // @ts-ignore
    if ((item as any).onClick) { (item as any).onClick(); this.leftOpen = true; return; }
    if (item.path) this.router.navigate([item.path]);
    // keep drawer open for submenu navigation
    this.leftOpen = true;
  }

  openAccountList() {
    this.selected.set('account');
    this.sectionMenu = [
      { label: '로그인 프로필', path: '/app/profile' },
      ...(this.isAdmin ? [] : []),
      { label: '로그아웃', onClick: () => this.logout() }
    ];
    this.leftOpen = true;
  }

  navigate(key: string, path: string) {
    this.selected.set(key);
    if (path) {
      this.router.navigate([path]);
    }
  }

  async logout() {
    const user = await this.supabase.getCurrentUser();
    if (user) {
      await this.supabase.updateLoginState(user.id, false);
    }
    await this.supabase.signOut();
    this.router.navigate(['/login']);
  }
}
