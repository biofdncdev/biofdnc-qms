import { Injectable, signal } from '@angular/core';
import { RecordService } from '../../../services/record.service';
import { StorageService } from '../../../services/storage.service';
import { normalizeRecordFeatures } from '../../../pages/record/features/record-features.registry';
import { FormMetadata, UiState } from '../rmd-forms.types';
import { RmdFormItem } from '../rmd-forms-data';

@Injectable()
export class RmdFormsMetadataService {
  isSavingMeta = signal<boolean>(false);
  isDeletingMeta = signal<boolean>(false);
  metaJustSaved = signal<boolean>(false);
  infoOpen = signal<boolean>(false);
  private featuresDirty = false;

  constructor(private record: RecordService) {}

  async saveMeta(sel: any): Promise<void> {
    try {
      this.isSavingMeta.set(true);
      this.metaJustSaved.set(false);
      
      const up = await this.record.upsertFormMeta({
        record_no: sel.id,
        record_name: sel.title || sel.id,
        department: Array.isArray(sel.ownerDepartments) ? sel.ownerDepartments.join(', ') : (sel.department || null),
        owner: sel.owner || null,
        method: sel.method || null,
        period: sel.period || null,
        standard: sel.standard || null,
        standard_category: (sel.standardCategory === 'ISO') ? null : (sel.standardCategory || null),
        certs: (sel.certs || []),
        features: sel.features ? JSON.parse(JSON.stringify(sel.features)) : {},
        use_departments: Array.isArray(sel.useDepartments) ? sel.useDepartments : []
      });
      
      // Re-fetch canonical row and patch UI to ensure persistence actually reflected
      try {
        const { data: fresh } = await this.record.getFormMeta(sel.id) as any;
        if (fresh) {
          sel.department = fresh.department || sel.department;
          sel.owner = fresh.owner || sel.owner;
          sel.method = fresh.method || sel.method;
          sel.period = fresh.period || sel.period;
          sel.standard = fresh.standard || sel.standard;
          sel.standardCategory = fresh.standard_category || sel.standardCategory;
          sel.certs = Array.isArray(fresh.certs) ? fresh.certs : (sel.certs || []);
          if (fresh.features && typeof fresh.features === 'object') sel.features = normalizeRecordFeatures(fresh.features);
          if (Array.isArray(fresh.use_departments)) sel.useDepartments = fresh.use_departments;
        }
      } catch {}
      
      // Also persist immediately to localStorage
      this.persistMeta(sel);
      
      this.metaJustSaved.set(true);
      setTimeout(() => this.metaJustSaved.set(false), 1500);
    } catch(e) {
      console.error('[Record] saveMeta failed', e);
      alert('저장에 문제가 발생했습니다. 로그인 상태를 확인하거나 네트워크를 다시 시도해 주세요.');
    } finally {
      this.isSavingMeta.set(false);
    }
  }

  persistMeta(it: any): void {
    try {
      const raw = localStorage.getItem('rmd_forms_meta');
      const map = raw ? JSON.parse(raw) : {};
      const sc = (it.standardCategory === 'ISO') ? undefined : it.standardCategory;
      // Ensure features is always saved as an object
      const featuresToSave = it.features && typeof it.features === 'object' ? it.features : {};
      map[it.id] = {
        department: it.department,
        owner: it.owner,
        method: it.method,
        period: it.period,
        standard: it.standard,
        standardCategory: sc,
        certs: (it.certs || []),
        features: featuresToSave,
        useDepartments: Array.isArray(it.useDepartments) ? it.useDepartments : undefined
      };
      localStorage.setItem('rmd_forms_meta', JSON.stringify(map));
    } catch {}
  }

  removePersistedMeta(recordId: string): void {
    try {
      const raw = localStorage.getItem('rmd_forms_meta');
      if (!raw) return;
      const map = JSON.parse(raw) as Record<string, any>;
      if (map && recordId in map) {
        delete map[recordId];
        localStorage.setItem('rmd_forms_meta', JSON.stringify(map));
      }
    } catch {}
  }

  async loadMetadata(categories: any[]): Promise<void> {
    try {
      const all = await this.record.listAllFormMeta();
      const byId: Record<string, any> = {};
      for (const row of all as any[]) {
        if (!row?.record_no) continue;
        // Normalize snake_case → camelCase used in UI
        byId[row.record_no] = {
          department: row.department || undefined,
          owner: row.owner || undefined,
          method: row.method || undefined,
          period: row.period || undefined,
          standard: row.standard || undefined,
          standardCategory: row.standard_category || undefined,
          certs: Array.isArray(row.certs) ? row.certs : [],
          features: normalizeRecordFeatures(row.features || {}), // Always normalize features
          useDepartments: Array.isArray(row.use_departments) ? row.use_departments : undefined,
        };
      }
      for (const cat of categories) {
        for (const it of cat.items as any[]) {
          const m = byId[it.id];
          if (m) {
            it.department = m.department ?? it.department;
            it.owner = m.owner ?? it.owner;
            it.method = m.method ?? it.method;
            it.period = m.period ?? it.period;
            it.standard = m.standard ?? it.standard;
            const sc = m.standardCategory === 'ISO' ? undefined : m.standardCategory;
            it.standardCategory = sc ?? it.standardCategory;
            it.certs = Array.isArray(m.certs) ? m.certs : (it.certs || []);
            // Always set features, normalized with defaults
            const loadedFeatures = (m.features && typeof m.features === 'object') ? normalizeRecordFeatures(m.features) : normalizeRecordFeatures({});
            (it as any).features = loadedFeatures;
            if (Array.isArray(m.useDepartments)) (it as any).useDepartments = m.useDepartments;
          }
        }
      }
    } catch {
      // Fallback to localStorage
      try {
        const raw = localStorage.getItem('rmd_forms_meta');
        if (raw) {
          const map = JSON.parse(raw) as Record<string, any>;
          for (const cat of categories) {
            for (const it of cat.items as any[]) {
              const m = map[it.id];
              if (m) Object.assign(it, m);
            }
          }
        }
      } catch {}
    }
  }

  // Cert helpers
  isCert(sel: any, c: string): boolean {
    const arr = (sel.certs || []) as string[];
    return arr.includes(c);
  }

  toggleCert(sel: any, c: string): void {
    let arr = (sel.certs || []) as string[];
    if (arr.includes(c)) {
      arr = arr.filter(x => x !== c);
    } else {
      arr = [...arr, c];
    }
    sel.certs = arr;
    this.persistMeta(sel);
  }

  toggleInfo(): void {
    this.infoOpen.set(!this.infoOpen());
  }

  setDeletingMeta(value: boolean): void {
    this.isDeletingMeta.set(value);
  }

  markFeaturesDirty(): void {
    this.featuresDirty = true;
  }

  // UI state persistence
  persistUiState(selected: RmdFormItem | null, centerScroll?: number, rightScroll?: number): void {
    try {
      const state: UiState = {
        selectedId: selected?.id || null,
        centerScroll: centerScroll || 0,
        rightScroll: rightScroll || 0,
      };
      localStorage.setItem('rmd_forms_state', JSON.stringify(state));
    } catch {}
  }

  restoreUiState(): UiState | null {
    try {
      const raw = localStorage.getItem('rmd_forms_state');
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }
}
