import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
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
})
export class AppShellComponent {
  selected = signal<string>('home');
  leftOpen = false;
  accountOpen = false;
  // Motion tokens derived from M3 motion guidance
  readonly drawerDurationMs = 320;
  readonly drawerEasing = 'cubic-bezier(0.2, 0, 0, 1)';
  sectionMenu: Array<{ label: string; selected?: boolean; onClick?: () => void }> = [];
  isAdmin = false;

  constructor(private router: Router, private supabase: SupabaseService) {
    // Determine admin on boot
    this.supabase.getCurrentUser().then(async (u) => {
      if (u) {
        const { data } = await this.supabase.getUserProfile(u.id);
        this.isAdmin = data?.role === 'admin' || data?.role === 'manager';
      }
    });
  }

  openLeft(key?: string) {
    if (key) this.selected.set(key);
    // build section-specific submenu (placeholder items)
    this.sectionMenu = [
      { label: `${this.selected().toUpperCase()} - 메뉴 1` },
      { label: `${this.selected().toUpperCase()} - 메뉴 2` },
      { label: `${this.selected().toUpperCase()} - 메뉴 3` },
    ];
    this.leftOpen = true;
  }

  openAccountMenu() {
    this.accountOpen = true;
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
