import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../services/supabase.service';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-role-admin',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatSelectModule, MatButtonModule],
  templateUrl: './role-admin.html',
  styleUrls: ['./role-admin.scss']
})
export class RoleAdminComponent implements OnInit {
  displayedColumns = ['name','email','created_at','updated_at','last_sign_in_at','is_online','role','actions'];
  rows: any[] = [];
  roles = ['admin','manager','staff','viewer'];
  loading = false;

  constructor(private supabase: SupabaseService) {}

  async ngOnInit() {
    await this.load();
  }

  async load() {
    this.loading = true;
    const { data, error } = await this.supabase.listUsers();
    if (!error && data) this.rows = data;
    this.loading = false;
  }

  async changeRole(row: any, role: string) {
    await this.supabase.updateUserRole(row.id, role);
    await this.load();
  }
}
