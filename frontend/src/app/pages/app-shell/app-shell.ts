import { Component, signal } from '@angular/core';
// Avoid animations dependency for Netlify build; simple JS/CSS transitions are used
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
  animations: []
})
export class AppShellComponent {
  selected = signal<string>('home');
  leftOpen = false;
  drawerCompact = false;
  // Motion tokens derived from M3 motion guidance
  readonly drawerDurationMs = 320;
  readonly drawerEasing = 'cubic-bezier(0.2, 0, 0, 1)';
  sectionMenu: Array<{ label: string; path?: string; onClick?: () => void; selected?: boolean }> = [];
  menus: Array<{ key: string; icon: string; label: string; path?: string; submenu?: Array<{ label: string; path?: string }> }> = [];
  isAdmin = false;

  constructor(private router: Router, private supabase: SupabaseService) {
    // Determine admin on boot
    this.supabase.getCurrentUser().then(async (u) => {
      if (u) {
        const { data } = await this.supabase.getUserProfile(u.id);
        this.isAdmin = data?.role === 'admin';
      }
      this.buildMenus();
    });
    // initial menus before profile resolves
    this.buildMenus();
  }

  private buildMenus() {
    this.menus = [
      { key: 'home', icon: 'home', label: 'Home', path: '/app/home' },
      { key: 'ingredient', icon: 'inventory_2', label: 'Ingredient', submenu: [ { label: '목록' }, { label: '등록' }, { label: '승인' } ] },
      { key: 'product', icon: 'category', label: 'Product', submenu: [ { label: '목록' }, { label: '등록' } ] },
      {
        key: 'standard', icon: 'gavel', label: 'Standard',
        submenu: [
          { label: '원료제조팀 규정', path: '/app/standard/rmd' }
        ]
      },
      {
        key: 'record', icon: 'history_edu', label: 'Record', submenu: [
          { label: '원료제조팀 지시·기록서', path: '/app/record/rmd-forms' }
        ]
      },
      {
        key: 'audit', icon: 'rule', label: 'Audit', submenu: [
          { label: 'AMOREPACIFIC', path: '/app/audit/amorepacific' },
          { label: 'GIVAUDAN', path: '/app/audit/givaudan' }
        ]
      },
    ];
    if (this.isAdmin) {
      this.menus.push({ key: 'user', icon: 'group', label: 'User', submenu: [ { label: '사용자 관리', path: '/app/admin/roles' } ] });
    }
  }

  private openLeftForKey(key: string) {
    this.selected.set(key);
    const menu = this.menus.find(m => m.key === key);
    this.sectionMenu = menu?.submenu ?? [];
    if (this.sectionMenu.length > 0) this.leftOpen = true;
  }

  onHover(event: MouseEvent) {
    const target = event.target as HTMLElement | null;
    if (!target) return;
    target.style.setProperty('--mx', `${event.offsetX}px`);
    target.style.setProperty('--my', `${event.offsetY}px`);
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

  onSubClick(item: { path?: string; onClick?: () => void; selected?: boolean }) {
    // clear previous selections
    this.sectionMenu.forEach(i => i.selected = false);
    item.selected = true;
    if (item?.onClick) { item.onClick(); return; }
    if (item && item.path) {
      this.router.navigate([item.path]);
    }
  }

  toggleDrawerSize(){
    this.drawerCompact = !this.drawerCompact;
  }

  toggleLeftDrawer(){
    this.leftOpen = !this.leftOpen;
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
