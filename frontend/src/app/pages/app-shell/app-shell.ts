import { Component, signal } from '@angular/core';
// Avoid animations dependency for Netlify build; simple JS/CSS transitions are used
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SupabaseService } from '../../services/supabase.service';
import { TabService } from '../../services/tab.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    CommonModule,
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
  // Simple in-app tab bar for quick nav
  tabs: Array<{ title: string; path: string }>=[];
  activeTabIndex = 0;
  dragIndex: number | null = null;
  dragOverIndex: number | null = null;
  menus: Array<{ key: string; icon: string; label: string; path?: string; badge?: number; submenu?: Array<{ label: string; path?: string }> }> = [];
  isAdmin = false;
  isViewer = false;
  unread = signal<number>(0);
  private notifSubscription: any;

  constructor(private router: Router, private supabase: SupabaseService, private tabBus: TabService) {
    // Determine admin on boot
    this.supabase.getCurrentUser().then(async (u) => {
      if (u) {
        const { data } = await this.supabase.getUserProfile(u.id);
        this.isAdmin = data?.role === 'admin';
        this.isViewer = data?.role === 'viewer';
      }
      this.buildMenus();
      // Load notifications only for admins
      if (this.isAdmin) {
        this.refreshNotifications();
        this.subscribeNotifications();
      }
    });
    // initial menus before profile resolves
    this.buildMenus();
    // subscribe to open-tab requests from anywhere
    this.tabBus.open$.subscribe(({ title, tabPath, navUrl }) => {
      this.openOrNavigateTab(title, tabPath, navUrl);
    });
  }

  private buildMenus() {
    // 기본 메뉴: Home만
    this.menus = [
      { key: 'home', icon: 'home', label: 'Home', path: '/app/home' }
    ];

    if (!this.isViewer) {
      this.menus.push(
        { key: 'ingredient', icon: 'inventory_2', label: 'Ingredient', submenu: [ { label: '성분목록', path: '/app/ingredient' }, { label: '성분등록', path: '/app/ingredient/form' } ] },
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
        { key: 'sale', icon: 'payments', label: 'Sale', submenu: [ { label: 'Rice Bran Water H', path: '/app/sale/rice-bran-water-h' } ] },
      );
    }
    if (this.isAdmin && !this.isViewer) {
      // Notification above User
      this.menus.push({ key: 'alerts', icon: 'notifications', label: 'Notification', path: '/app/alerts', badge: this.unread() });
      this.menus.push({ key: 'user', icon: 'group', label: 'User', submenu: [ { label: '사용자 관리', path: '/app/admin/roles' } ] });
    }
  }

  private async refreshNotifications(){
    const count = await this.supabase.countUnreadNotifications();
    this.unread.set(count);
    const alerts = this.menus.find(m => m.key === 'alerts');
    if (alerts) alerts.badge = count;
  }

  private subscribeNotifications(){
    // Realtime subscription to notifications inserts
    const client = this.supabase.getClient();
    this.notifSubscription = client
      .channel('public:notifications')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, async () => {
        await this.refreshNotifications();
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'notifications' }, async () => {
        await this.refreshNotifications();
      })
      .subscribe();
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

  onSubClick(item: { label?: string; path?: string; onClick?: () => void; selected?: boolean }) {
    // clear previous selections
    this.sectionMenu.forEach(i => i.selected = false);
    item.selected = true;
    if (item?.onClick) { item.onClick(); return; }
    if (item && item.path) {
      this.openTab(item.label || 'Page', item.path);
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
    if (path) this.openTab(this.menus.find(m=>m.key===key)?.label || 'Page', path);
  }

  async logout() {
    const user = await this.supabase.getCurrentUser();
    if (user) {
      await this.supabase.updateLoginState(user.id, false);
    }
    await this.supabase.signOut();
    this.router.navigate(['/login']);
  }

  // tabs helpers
  openTab(title: string, path: string){
    const idx = this.tabs.findIndex(t => t.path === path);
    if (idx === -1) {
      this.tabs.push({ title, path });
      this.activeTabIndex = this.tabs.length - 1;
    } else {
      this.activeTabIndex = idx;
    }
    // Support absolute path with query by using navigateByUrl
    this.router.navigateByUrl(path);
  }

  private openOrNavigateTab(title: string, tabPath: string, navUrl: string){
    const idx = this.tabs.findIndex(t => t.path === tabPath);
    if (idx === -1) {
      this.tabs.push({ title, path: tabPath });
      this.activeTabIndex = this.tabs.length - 1;
    } else {
      this.activeTabIndex = idx;
    }
    this.router.navigateByUrl(navUrl);
  }
  closeTab(i: number){
    const closingActive = i === this.activeTabIndex;
    this.tabs.splice(i,1);
    if (this.tabs.length === 0) return;
    if (closingActive) {
      const ni = Math.max(0, i-1);
      this.activeTabIndex = ni;
      this.router.navigate([this.tabs[ni].path]);
    }
  }
  activateTab(i: number){
    this.activeTabIndex = i;
    this.router.navigate([this.tabs[i].path]);
  }

  // drag & drop tabs
  onTabDragStart(ev: DragEvent, index: number){
    this.dragIndex = index;
    this.dragOverIndex = null;
    try { ev.dataTransfer?.setData('text/plain', String(index)); } catch {}
    if (ev.dataTransfer) ev.dataTransfer.effectAllowed = 'move';
  }
  onTabDragOver(ev: DragEvent, index: number){
    ev.preventDefault();
    this.dragOverIndex = index;
    if (ev.dataTransfer) ev.dataTransfer.dropEffect = 'move';
  }
  onTabDragLeave(){
    this.dragOverIndex = null;
  }
  onTabDrop(ev: DragEvent, index: number){
    ev.preventDefault();
    const from = this.dragIndex ?? Number(ev.dataTransfer?.getData('text/plain'));
    this.dragIndex = null;
    this.dragOverIndex = null;
    if (Number.isNaN(from) || from === null || from === index || from < 0 || from >= this.tabs.length) return;
    const [moved] = this.tabs.splice(from, 1);
    this.tabs.splice(index, 0, moved);
    this.activeTabIndex = index;
  }
}
