import { Component, signal } from '@angular/core';
// Avoid animations dependency for Netlify build; simple JS/CSS transitions are used
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
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
  // Tab overflow handling
  visibleCount = 8;
  overflowOpen = false;
  dragIndex: number | null = null;
  dragOverIndex: number | null = null;
  menus: Array<{ key: string; icon: string; label: string; path?: string; badge?: number; submenu?: Array<{ label: string; path?: string }> }> = [];
  isAdmin = false;
  isManager = false;
  isStaff = false;
  isViewer = false;
  unread = signal<number>(0);
  private notifSubscription: any;

  constructor(private router: Router, private supabase: SupabaseService, private tabBus: TabService) {
    // Determine admin on boot
    this.supabase.getCurrentUser().then(async (u) => {
      if (u) {
        const { data } = await this.supabase.getUserProfile(u.id);
        this.isAdmin = data?.role === 'admin';
        this.isManager = data?.role === 'manager';
        this.isStaff = data?.role === 'staff';
        this.isViewer = data?.role === 'viewer';
      }
      this.buildMenus();
      // Load notifications for staff and above (admin/manager/staff)
      if (this.isAdmin || this.isManager || this.isStaff) {
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
    // keep side menu in sync with current route when navigating via tabs or links
    this.router.events.subscribe(ev => {
      if (ev instanceof NavigationEnd) {
        this.syncMenuToCurrentRoute();
      }
    });
  }

  private buildMenus() {
    // 기본 메뉴: Home만
    this.menus = [
      { key: 'home', icon: 'home', label: 'Home', path: '/app/home' }
    ];

    if (!this.isViewer) {
      this.menus.push(
        { key: 'ingredient', icon: 'category', label: 'Ingredient', submenu: [ { label: '성분조회', path: '/app/ingredient' }, { label: '성분등록', path: '/app/ingredient/form' } ] },
        { key: 'product', icon: 'inventory', label: 'Product', submenu: [ { label: '품목조회', path: '/app/product' }, { label: '품목등록', path: '/app/product/form' }, { label: '품목정보 업데이트', path: '/app/product/update' }, { label: 'BOM TREE', path: '/app/product/bom-tree' }, { label: '기본서류', path: '/app/product/docs' }, { label: '서류양식', path: '/app/product/doc-templates' } ] },
        { key: 'material', icon: 'eco', label: 'Material', submenu: [
          { label: '자재조회', path: '/app/material' },
          { label: '자재등록', path: '/app/material/form' },
          { label: '자재정보 업데이트', path: '/app/material/update' }
        ] },
        {
          key: 'standard', icon: 'gavel', label: 'Standard',
          submenu: [
            { label: '원료제조팀 규정', path: '/app/standard/rmd' }
          ]
        },
        {
          key: 'record', icon: 'description', label: 'Record', submenu: [
            { label: '원료제조팀 지시·기록서', path: '/app/record/rmd-forms' }
          ]
        },
        {
          key: 'audit', icon: 'rule', label: 'Audit', submenu: [
            { label: 'Audit 평가항목', path: '/app/audit' }
          ]
        },
      );
      if (this.isAdmin) {
        this.menus.push({ key: 'sale', icon: 'payments', label: 'Sale', submenu: [ { label: 'Rice Bran Water H', path: '/app/sale/rice-bran-water-h' } ] });
      }
    }
    // Alerts: visible to staff and above (admin/manager/staff)
    if ((this.isAdmin || this.isManager || this.isStaff) && !this.isViewer) {
      this.menus.push({ key: 'alerts', icon: 'notifications', label: 'Notification', path: '/app/alerts', badge: this.isAdmin ? this.unread() : undefined });
    }
    // User management: admin only
    if (this.isAdmin && !this.isViewer) {
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

  onContentMouseEnter(){
    // When moving into the page content, restore to the actual current route
    const path = this.router.url || this.tabs[this.activeTabIndex]?.path || '/app/home';
    this.syncMenuSelectionByPath(path);
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
    // no submenu → navigate but keep user's drawer state (do not auto-close)
    if (menu.path) this.router.navigate([menu.path]);
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
    // Clear transient UI states that should not persist across login sessions
    try { sessionStorage.removeItem('product.list.state.v1'); } catch {}
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
    this.updateVisibleCount();
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
    this.updateVisibleCount();
    this.syncMenuToCurrentRoute();
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
    this.updateVisibleCount();
  }
  closeAllTabs(){
    if (!this.tabs.length) return;
    this.tabs = [];
    // Navigate to home after clearing
    this.activeTabIndex = 0;
    this.router.navigate(['/app/home']);
    this.updateVisibleCount();
    this.overflowOpen = false;
  }
  activateTab(i: number){
    this.activeTabIndex = i;
    this.router.navigate([this.tabs[i].path]);
    this.syncMenuToCurrentRoute();
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

  // Overflow helpers
  updateVisibleCount(){
    // Heuristic: show up to 8 tabs; if more, keep the latest active within visible slice
    const MAX = 8;
    this.visibleCount = Math.min(MAX, this.tabs.length);
  }
  toggleOverflow(){ this.overflowOpen = !this.overflowOpen; }
  activateTabByPath(path: string){
    const idx = this.tabs.findIndex(t=>t.path===path);
    if (idx>=0){ this.activateTab(idx); this.overflowOpen=false; }
  }

  private getKeyForPath(path: string): string | null {
    const match = this.menus.find(m => (m.path && path.startsWith(m.path)) || (m.submenu || []).some(s => path.startsWith(s.path || '')));
    return match?.key || null;
  }
  private syncMenuToCurrentRoute(){
    try{
      const path = this.router.url || this.tabs[this.activeTabIndex]?.path || '/app/home';
      this.syncMenuSelectionByPath(path);
    }catch{}
  }

  private syncMenuSelectionByPath(path: string){
    const key = this.getKeyForPath(path) || this.selected();
    const menu = this.menus.find(m => m.key === key);
    this.selected.set(key);
    if (menu?.submenu && menu.submenu.length){
      // compute best match (longest prefix) among submenu paths
      let bestIdx = -1; let bestLen = -1;
      const items = menu.submenu.map((it, idx) => {
        const p = it.path || '';
        const match = p && path.startsWith(p);
        if (match && p.length > bestLen){ bestLen = p.length; bestIdx = idx; }
        return { ...it, selected: false } as any;
      });
      if (bestIdx >= 0) (items[bestIdx] as any).selected = true;
      this.sectionMenu = items;
      this.leftOpen = true;
    } else {
      this.sectionMenu = [];
    }
  }
}
