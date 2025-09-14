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
  departments: string[] = [];
  methods: string[] = ['ERP','QMS','NAS','OneNote','수기'];
  periods: string[] = ['일','주','월','년','발생시','갱신주기에 따라'];

  filtered = computed(() => {
    const q = this.query().trim().toLowerCase();
    // Optional route param 'dept' to filter by using department
    try{
      const params = new URLSearchParams(location.search);
      const d = params.get('dept');
      if (d) this.dept.set(d);
    }catch{}
    const categories = this.getCategories();
    const base = categories.map(cat => ({
      ...cat,
      items: cat.items.filter(i => {
        const byKeyword = !q || i.id.toLowerCase().includes(q) || i.title.toLowerCase().includes(q);
        const byDept = !this.dept() || ((i as any).department || '원료제조팀') === this.dept();
        const byOwner = !this.ownerFilter() || ((i as any).owner || '').toLowerCase().includes(this.ownerFilter().toLowerCase());
        const byMethod = !this.method() || (i as any).method === this.method();
        const byPeriod = !this.period() || this.normalizePeriod((i as any).period) === this.normalizePeriod(this.period());
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
    // refresh dynamic department list from global cache if available
    try{
      const ds = (window as any).__app_cached_departments || [];
      if (Array.isArray(ds) && ds.length){
        this.departments = ds.map((d:any)=> d.name || d.code).filter(Boolean);
      }
    }catch{}
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

  private normalizePeriod(v: string): string {
    const s = (v || '').toString().trim();
    if (!s) return '';
    // Treat legacy '갱신주기' as the same as new label '갱신주기에 따라'
    if (s === '갱신주기' || s === '갱신주기에 따라') return '갱신주기';
    return s;
  }
}
