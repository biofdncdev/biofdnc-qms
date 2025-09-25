import { Injectable } from '@angular/core';
import { SupabaseCoreService } from './supabase-core.service';
import { SupabaseClient } from '@supabase/supabase-js';

@Injectable({ providedIn: 'root' })
export class PartnerService {
  constructor(private supabase: SupabaseCoreService) {}

  private get client(): SupabaseClient {
    return this.supabase.getClient();
  }

  async upsertPartners(rows: Array<Record<string, any>>): Promise<{ inserted?: number; updated?: number; skipped?: number; errors?: any[] }> {
    if (!rows || !rows.length) return { inserted: 0, updated: 0, skipped: 0 };
    const payload = rows.map(r => ({
      partner_code: r['internal_code'],
      name_kr: r['name_kr'] || null,
      type: r['type'] || null,
      biz_reg_no: r['biz_reg_no'] || null,
      representative: r['representative'] || null,
      phone: r['phone'] || null,
      fax: r['fax'] || null,
      email: r['email'] || null,
      address: r['address'] || null,
      manager: r['manager'] || null,
      manager_phone: r['manager_phone'] || null,
      manager_email: r['manager_email'] || null,
      remark: r['remark'] || null
    }));
    const { error } = await this.client
      .from('partners')
      .upsert(payload, { onConflict: 'partner_code' });
    if (error) throw error;
    return { inserted: payload.length, updated: 0, skipped: 0 };
  }
}

