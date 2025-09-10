import { Injectable, computed, signal } from '@angular/core';
import { RmdFormCategory, RmdFormItem } from '../rmd-forms-data';

@Injectable()
export class RmdFormsFilterService {
  // Filter signals
  query = signal('');
  cert = signal<string>('');
  dept = signal<string>('');
  ownerFilter = signal<string>('');
  method = signal<string>('');
  period = signal<string>('');
  overdueOnly = signal<boolean>(false);
  standard = signal<string>('');
  standardCategory = signal<string>('');
  auditCompany = signal<string>('');

  // Static data
  departments: string[] = ['원료제조팀','식물세포배양팀','품질팀','연구팀','경영지원팀'];
  methods: string[] = ['ERP','QMS','NAS','OneNote','수기'];
  periods: string[] = ['일','주','월','년','갱신주기'];

  filtered = computed(() => {
    const q = this.query().trim().toLowerCase();
    const categories = this.getCategories();
    const base = categories.map(cat => ({
      ...cat,
      items: cat.items.filter(i => {
        const byKeyword = !q || i.id.toLowerCase().includes(q) || i.title.toLowerCase().includes(q);
        const byDept = !this.dept() || ((i as any).department || '원료제조팀') === this.dept();
        const byOwner = !this.ownerFilter() || ((i as any).owner || '').toLowerCase().includes(this.ownerFilter().toLowerCase());
        const byMethod = !this.method() || (i as any).method === this.method();
        const byPeriod = !this.period() || (i as any).period === this.period();
        const byStandard = !this.standard() || ((i as any).standard || '').toLowerCase().includes(this.standard().toLowerCase());
        const byCompany = !this.auditCompany() || (((i as any).companies || []).includes(this.auditCompany()));
        const stdCat = ((i as any).standardCategory || cat.category) as string;
        const byStdCat = !this.standardCategory() || stdCat.toLowerCase() === this.standardCategory().toLowerCase();
        const byOverdue = !this.overdueOnly() || !!(i as any).overdue;
        
        // Cert filter
        if (this.cert()) {
          const certs = (i as any).certs || [];
          if (!certs.includes(this.cert())) return false;
        }
        
        return byKeyword && byDept && byOwner && byMethod && byPeriod && byStandard && byStdCat && byCompany && byOverdue;
      })
    })).filter(cat => cat.items.length > 0);
    return base;
  });

  filteredFlat = computed<RmdFormItem[]>(() => {
    const cats = this.filtered();
    const flat: RmdFormItem[] = [];
    for (const cat of cats) {
      for (const it of cat.items) {
        const ref: any = it as any;
        if (!ref.certs) ref.certs = [];
        if (!ref.standardCategory) ref.standardCategory = cat.category;
        if (!ref.department) ref.department = '원료제조팀';
        flat.push(ref as RmdFormItem);
      }
    }
    return flat.sort((a, b) => a.id.localeCompare(b.id));
  });

  private categories: RmdFormCategory[] = [];
  
  setCategories(categories: RmdFormCategory[]): void {
    this.categories = categories;
  }

  private getCategories(): RmdFormCategory[] {
    return this.categories;
  }

  onFiltersChanged(): void {
    // Signals trigger recompute automatically
  }

  setMethod(v: string): void { 
    this.method.set(v); 
    this.onFiltersChanged(); 
  }

  setPeriod(v: string): void { 
    this.period.set(v); 
    this.onFiltersChanged(); 
  }

  setStdCat(v: string): void { 
    this.standardCategory.set(v); 
    this.onFiltersChanged(); 
  }

  setCert(v: string): void { 
    this.cert.set(v); 
    this.onFiltersChanged(); 
  }
}
