import { Injectable } from '@angular/core';
import { AuditService } from '../../../../services/audit.service';
import { AuthService } from '../../../../services/auth.service';
import { RecordService } from '../../../../services/record.service';
import { AuditStateService } from './audit-state.service';
import { AuditUiService } from './audit-ui.service';
import { AuditItem } from '../types/audit.types';
import * as XLSX from 'xlsx';

@Injectable({
  providedIn: 'root'
})
export class AuditDataService {
  constructor(
    private audit: AuditService,
    private auth: AuthService,
    private record: RecordService,
    private state: AuditStateService,
    private ui: AuditUiService
  ) {}
  
  async initialize() {
    // 사용자 정보 로드
    const u = await this.auth.getCurrentUser();
    if (u) {
      const { data } = await this.auth.getUserProfile(u.id);
      this.state.userDisplay = data?.name || data?.email || '사용자';
      this.state.currentUserId = u.id;
      this.state.isAdmin = data?.role === 'admin';
      this.state.isGivaudanAudit = data?.role === 'audit' || data?.role === 'givaudan_audit';
    }
    
    // 저장된 날짜 로드
    await this.loadSavedDates();
    this.state.savedSelectedDate = this.state.savedDates?.[0] || null;
    
    // 회사 목록 로드
    try {
      this.state.companies = (await this.audit.listAuditCompanies())
        .map((r: any) => r.name)
        .filter(Boolean);
    } catch {}
    
    // 사용자 목록 로드
    try {
      const { data: users } = await this.auth.getClient()
        .from('users')
        .select('name,email')
        .order('created_at', { ascending: false });
      this.state.userOptions = (users || [])
        .map((u: any) => u?.name || u?.email)
        .filter(Boolean);
    } catch {}
    
    // CSV 템플릿 사용 중지: 항상 DB 기준으로 제목/부제목 로드
    await this.refreshTitlesFromDb();
  }
  
  async loadSavedDates() {
    try {
      this.state.savedDates = await this.audit.listSavedAuditDates();
      
      // 메타데이터도 함께 로드
      try {
        const rows = await this.audit.listAllAuditDateMeta();
        const map: Record<string, { company?: string; memo?: string }> = {};
        for (const r of rows) {
          map[r.audit_date] = {
            company: r.company || undefined,
            memo: r.memo || ''
          };
        }
        this.state.savedMeta = map;
      } catch {}
    } catch {
      this.state.savedDates = [];
    }
  }
  
  async loadByDate() {
    const date = this.state.selectedDate();
    if (!date) {
      this.state.resetItems();
      return;
    }
    
    const created = this.state.savedDates.includes(date);
    
    try {
      // 날짜 메타 불러오기
      try {
        const meta = await this.audit.getAuditDateMeta(date);
        this.state.companyFilter = meta?.company || 'ALL';
        this.state.headerMemo = meta?.memo || '';
        this.state.savedMeta[date] = {
          company: this.state.companyFilter !== 'ALL' ? this.state.companyFilter : undefined,
          memo: this.state.headerMemo
        };
        this.ui.syncHeaderMemoDraft();
      } catch {}
      
      const { data: all } = created 
        ? await this.audit.listGivaudanProgressByDate(date) 
        : { data: [] };
      
      // 생성일 표시
      try {
        this.state.createdAt = await this.audit.getAuditDateCreatedAt(date) || null;
      } catch {
        this.state.createdAt = null;
      }
      
      const next = this.state.items().map(it => {
        delete (it as any).__h1;
        delete (it as any).__h3;
        
        const row = (all || []).find((r: any) => r.number === it.id);
        const rawComments = (row?.comments || []) as any[];
        const fieldBundle = Array.isArray(rawComments) 
          ? rawComments.find((c: any) => c && c.type === 'fields') 
          : null;
        const userComments = Array.isArray(rawComments) 
          ? rawComments.filter((c: any) => !(c && c.type === 'fields')) 
          : [];
        
        return {
          ...it,
          status: row?.status || 'pending',
          note: row?.note || '',
          departments: row?.departments || [],
          owners: row?.owners || [],
          companies: row?.companies || [],
          comments: userComments || [],
          company: row?.company || null,
          col1Text: fieldBundle?.col1 || '',
          col3Text: fieldBundle?.col3 || '',
          selectedLinks: (fieldBundle?.links || []).map((link: any) => ({
            id: link.id,
            title: link.title,
            kind: link.kind || link.type || 'record'
          }))
        } as AuditItem;
      });
      
      // In-place update
      const curr = this.state.items();
      for (let i = 0; i < curr.length; i++) {
        curr[i] = next[i];
      }
      this.state.items.set(curr);
      
      // 새로 생성한 날짜라도 항목 타이틀은 DB 기준으로 동기화
      await this.refreshTitlesFromDb();
    } catch {
      this.state.resetItems();
    }
  }
  
  async saveProgress(it: AuditItem) {
    const date = this.state.selectedDate();
    if (!date || !this.state.savedDates.includes(date)) {
      this.state.showToast('먼저 생성 버튼으로 이 날짜를 생성해 주세요');
      return;
    }
    
    try {
      this.ui.setSaving(it.id, 'saving');
      
      const payload = {
        number: it.id,
        note: it.note || null,
        status: it.status || null,
        departments: it.departments || [],
        owners: it.owners || [],
        companies: it.companies || [],
        comments: ([{
          type: 'fields',
          col1: it.col1Text || '',
          col3: it.col3Text || '',
          links: it.selectedLinks || []
        }] as any[]).concat(it.comments || []),
        company: it.company || null,
        updated_by: this.state.currentUserId,
        updated_by_name: this.state.userDisplay,
        audit_date: date
      };
      
      const { error } = await this.audit.upsertGivaudanProgress(payload) as any;
      if (error) throw error;
      
      // Reload from server
      try {
        const { data: fresh } = await this.audit.getGivaudanProgressByDate(it.id, date);
        if (fresh) {
          Object.assign(it, {
            status: fresh.status || it.status,
            note: fresh.note || it.note,
            departments: fresh.departments || it.departments,
            owners: fresh.owners || it.owners,
            company: fresh.company || it.company,
            companies: fresh.companies || it.companies
          });
          
          const raw = fresh.comments || [];
          if (Array.isArray(raw)) {
            const fb = raw.find((c: any) => c && c.type === 'fields');
            it.comments = raw.filter((c: any) => !(c && c.type === 'fields'));
            if (fb) {
              it.col1Text = fb.col1 || it.col1Text;
              it.col3Text = fb.col3 || it.col3Text;
              it.selectedLinks = (fb.links || []).map((link: any) => ({
                id: link.id,
                title: link.title,
                kind: link.kind || link.type || 'record'
              }));
            }
          }
        }
      } catch {}
      
      this.ui.setSaving(it.id, 'saved');
      setTimeout(() => this.ui.setSaving(it.id, 'idle'), 1200);
    } catch (e) {
      console.error('Failed to save progress', e);
      this.ui.setSaving(it.id, 'idle');
    }
  }
  
  async createForDate() {
    const date = this.state.selectedDate() || this.state.today();
    
    if (this.state.savedDates.includes(date)) return;
    
    this.state.resetItems();
    
    try {
      await this.applyTitlesFromJsonOrExcel();
    } catch {}
    
    this.state.companyFilter = 'ALL';
    this.state.filterDept = 'ALL';
    this.state.filterOwner = 'ALL';
    this.state.saving.set(true);
    
    try {
      await this.saveAllForDate();
    } catch (e) {
      console.warn('saveAllForDate error', e);
    }
    
    await this.loadByDate();
    this.state.saving.set(false);
    this.state.showToast('생성되었습니다');
  }
  
  async deleteDate() {
    if (!this.state.isAdmin) {
      alert('관리자만 삭제할 수 있습니다.');
      return;
    }
    
    const date = this.state.selectedDate();
    if (!date) {
      alert('삭제할 날짜를 선택하세요.');
      return;
    }
    
    const ok = confirm(`${date} 데이터를 정말 삭제할까요? 되돌릴 수 없습니다.`);
    if (!ok) return;
    
    try {
      this.state.deleting.set(true);
      await this.audit.deleteGivaudanProgressByDate(date);
      this.state.savedDates = this.state.savedDates.filter(d => d !== date);
      this.state.resetItems();
      await this.loadSavedDates();
      this.state.showToast('삭제되었습니다');
    } finally {
      this.state.deleting.set(false);
    }
  }
  
  private async saveAllForDate() {
    const date = this.state.selectedDate() || this.state.today();
    this.state.selectedDate.set(date);
    
    const user = this.state.currentUserId;
    const name = this.state.userDisplay;
    
    if (!this.state.savedDates.includes(date)) {
      this.state.savedDates = [date, ...this.state.savedDates];
    }
    
    const payload = this.state.items().map(it => ({
      number: it.id,
      status: it.status,
      note: it.note,
      departments: it.departments,
      companies: it.companies || [],
      company: it.company || null,
      updated_by: user,
      updated_by_name: name,
      audit_date: date
    }));
    
    try {
      await this.audit.upsertGivaudanProgressMany(payload as any);
    } catch (e) {
      console.warn('bulk upsert failed', e);
      this.state.showToast('저장이 일부 실패했습니다');
    }
    
    try {
      const latest = await this.audit.listSavedAuditDates();
      this.state.savedDates = Array.from(new Set([date, ...(latest || [])]));
      this.state.savedMeta[date] = {
        company: this.state.companyFilter,
        memo: this.state.headerMemo
      };
    } catch {}
  }
  
  private async applyTitlesFromJsonOrExcel() {
    try {
      // Try CSV first
      const csvRes = await fetch('/asset/Audit%20Evaluation%20Items.csv', { cache: 'no-store' });
      if (csvRes.ok) {
        await this.loadTitlesFromCsv(csvRes);
        return;
      }
      
      // Fallback to JSON
      const jsonRes = await fetch('/audit-items.json', { cache: 'no-store' });
      if (jsonRes.ok) {
        const items = await jsonRes.json();
        if (Array.isArray(items) && items.length) {
          const updated = this.state.items().map((it: any) => {
            const row = items.find((r: any) => Number(r.number) === Number(it.id));
            return row 
              ? { ...it, titleKo: row.titleKo || it.titleKo, titleEn: row.titleEn || it.titleEn } 
              : it;
          });
          this.state.items.set(updated);
          
          try {
            await this.audit.upsertAuditItems(items);
          } catch {}
          return;
        }
      }
    } catch {}
    
    // Fallback to direct CSV parsing
    await this.loadTitlesFromCsv();
  }
  
  private async loadTitlesFromCsv(preFetched?: Response) {
    try {
      const res = preFetched || await fetch('/asset/Audit%20Evaluation%20Items.csv', { cache: 'no-store' });
      if (!res.ok) return false;
      
      const buf = await res.arrayBuffer();
      const wb = XLSX.read(buf, { type: 'array' });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const rows: any[] = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: true }) as any[];
      
      const cleaned = rows.filter(r => Array.isArray(r) && r.length >= 2);
      const updated = this.state.items().slice();
      const upserts: Array<{ number: number; titleKo: string; titleEn: string }> = [];
      
      for (const r of cleaned) {
        const num = parseInt(String(r[0] ?? '').trim(), 10);
        if (!Number.isFinite(num)) continue;
        
        const titleKo = String(r[1] ?? '').trim();
        const titleEn = String(r[2] ?? '').trim();
        const companyRaw = String(r[3] ?? '').trim();
        
        if (companyRaw && updated[num - 1]) {
          (updated[num - 1] as any).company = companyRaw;
        }
        
        upserts.push({ number: num, titleKo, titleEn });
        
        if (updated[num - 1]) {
          updated[num - 1] = {
            ...updated[num - 1],
            titleKo: titleKo || updated[num - 1].titleKo,
            titleEn: titleEn || updated[num - 1].titleEn
          } as any;
        }
      }
      
      const curr = this.state.items();
      for (let i = 0; i < curr.length; i++) {
        curr[i] = updated[i];
      }
      this.state.items.set(curr);
      
      if (upserts.length) {
        try {
          await this.audit.upsertAuditItems(upserts);
        } catch {}
      }
      
      return true;
    } catch {
      return false;
    }
  }
  
  private async refreshTitlesFromDb() {
    try {
      const rows = await this.audit.listAuditItems();
      const map = new Map<number, { title_ko: string; title_en: string; is_active: boolean }>();
      
      for (const r of rows as any[]) {
        map.set(r.number, {
          title_ko: r.title_ko,
          title_en: r.title_en,
          is_active: r.is_active !== false // Default to true if undefined
        });
      }
      
      const updated = this.state.items().map((it: any) => {
        const t = map.get(it.id);
        return t 
          ? { ...it, 
              titleKo: t.title_ko || it.titleKo, 
              titleEn: t.title_en || it.titleEn,
              isActive: t.is_active
            } 
          : it;
      });
      
      this.state.items.set(updated);
      console.info('[Audit] Titles refreshed from DB:', rows?.length ?? 0);
    } catch {}
  }
}
