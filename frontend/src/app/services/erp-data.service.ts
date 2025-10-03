import { Injectable } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseCoreService } from './supabase-core.service';
import { ExcelSyncHelper } from './helpers/excel-sync.helper';

/**
 * ERP 연동 데이터 서비스
 * 향후 ERP API와 연동될 예정인 데이터를 관리합니다.
 * 현재는 Supabase를 통해 데이터를 관리하지만, 
 * 나중에 ERP API로 쉽게 전환할 수 있도록 설계되었습니다.
 */
@Injectable({
  providedIn: 'root',
})
export class ErpDataService {
  constructor(private supabase: SupabaseCoreService) {}

  private get client(): SupabaseClient {
    return this.supabase.getClient();
  }

  // ===== Products (품목) - ERP API로 대체 예정 =====
  async listProducts(params: { 
    page?: number; 
    pageSize?: number; 
    keyword?: string; 
    keywordOp?: 'AND'|'OR' 
  }) {
    const page = Math.max(1, params?.page ?? 1);
    const pageSize = Math.min(100, Math.max(1, params?.pageSize ?? 15));
    const from = (page - 1) * pageSize; 
    const to = from + pageSize - 1;
    const kw = (params?.keyword || '').trim();
    const words = kw ? kw.split(/\s+/).map(s => s.trim()).filter(Boolean).slice(0, 10) : [];

    if (words.length === 0) {
      return this.client
        .from('products')
        .select('*', { count: 'exact' })
        .in('item_status', ['사용', '임시'])
        .order('name_kr', { ascending: true })
        .range(from, to) as any;
    }

    // Build targeted superset for AND search
    const searchableCols = [
      'product_code','main_code','name_kr','name_en','asset_category','item_category',
      'item_midcategory','item_status','spec','main_spec','specification','unit',
      'remarks','keywords_alias','main_name','special_notes','manufacturer','cas_no',
      'country_of_manufacture','source_of_origin_method','plant_part','country_of_origin',
      'nmpa_no','allergen','furocoumarins','expiration_date','storage_location',
      'storage_method1','stability_note1','storage_note1','safety_handling1',
      'cert_organic','cert_kosher','cert_halal','cert_vegan','cert_isaaa','cert_rspo','cert_reach'
    ];
    
    const makeGroup = (w: string) => searchableCols.map(c => `${c}.ilike.*${w}*`).join(',');
    const andGroups = words.map(w => `or(${makeGroup(w)})`).join(',');
    const logic = `and(${andGroups})`;

    const supersetLimit = 20000;
    const { data: superset } = await this.client
      .from('products')
      .select('*')
      .or(logic)
      .in('item_status', ['사용', '임시'])
      .order('name_kr', { ascending: true })
      .limit(supersetLimit) as any;

    const rows: any[] = Array.isArray(superset) ? superset : [];
    const buildText = (row: Record<string, any>) => {
      return Object.values(row)
        .filter(v => typeof v === 'string' || typeof v === 'number')
        .map(v => String(v))
        .join(' ')
        .replace(/\s+/g, ' ')
        .toLowerCase();
    };

    const filtered = words.length === 0 ? rows : rows.filter(r => {
      const hay = buildText(r);
      return words.every(w => hay.includes(w.toLowerCase()));
    });

    const start = (page - 1) * pageSize; 
    const end = start + pageSize;
    return { data: filtered.slice(start, end), count: filtered.length } as any;
  }

  async quickSearchProducts(keyword: string) {
    const kw = (keyword||'').trim();
    if (!kw) return { data: [] as any[] } as any;
    
    const words = kw.split(/\s+/).map(s=>s.trim()).filter(Boolean);
    const cols = [
      'product_code','name_kr','name_en','cas_no','spec','specification',
      'keywords_alias','special_notes','manufacturer','country_of_manufacture',
      'source_of_origin_method','plant_part','country_of_origin','nmpa_no',
      'allergen','furocoumarins','expiration_date','storage_location',
      'storage_method1','stability_note1','storage_note1','safety_handling1',
      'cert_organic','cert_kosher','cert_halal','cert_vegan','cert_isaaa','cert_rspo','cert_reach'
    ];
    
    const makeGroup = (w:string)=> cols.map(c=> `${c}.ilike.*${w}*`).join(',');
    const andLogic = `and(${words.map(w=> `or(${makeGroup(w)})`).join(',')})`;
    
    const { data } = await this.client
      .from('products')
      .select('id, product_code, name_kr, name_en, cas_no, spec, specification, keywords_alias, special_notes')
      .or(andLogic)
      .in('item_status', ['사용', '임시'])
      .limit(500) as any;
    
    const rows = Array.isArray(data) ? data : [];
    return { data: rows.slice(0, 200) } as any;
  }

  async getProduct(id: string) { 
    return this.client.from('products').select('*').eq('id', id).single(); 
  }
  
  async getProductByCode(product_code: string) { 
    return this.client.from('products').select('*').eq('product_code', product_code).maybeSingle(); 
  }
  
  async upsertProduct(row: any) { 
    return this.client.from('products').upsert(row, { onConflict: 'id' }).select('*').single(); 
  }
  
  async deleteProduct(id: string) { 
    return this.client.from('products').delete().eq('id', id); 
  }

  async getProductColumnMap() {
    const { data } = await this.client
      .from('product_column_map')
      .select('*')
      .order('display_order', { ascending: true }) as any;
    return Array.isArray(data) ? data : [];
  }

  async syncProductsByExcel(payload: { sheet: any[]; headerMap?: Record<string,string>; deleteMode?: 'none' | 'missing' | 'all' }) {
    return ExcelSyncHelper.syncProducts(this.client, payload);
  }

  // Product verification logs
  async getProductVerifyLogs(id: string) {
    try {
      const { data, error } = await this.client
        .from('products')
        .select('verify_logs')
        .eq('id', id)
        .single();
      if (error) throw error;
      const logs = (data && (data as any).verify_logs) || [];
      return Array.isArray(logs) ? logs : [];
    } catch(e) {
      console.warn('getProductVerifyLogs failed (column may not exist yet); falling back to empty', e);
      return [] as any[];
    }
  }
  
  async setProductVerifyLogs(id: string, logs: Array<{ user: string; time: string }>) {
    try {
      const { error } = await this.client
        .from('products')
        .update({ verify_logs: logs })
        .eq('id', id);
      if (error) throw error;
      return true;
    } catch(e) {
      console.warn('setProductVerifyLogs failed (column may not exist yet); ignoring', e);
      return false;
    }
  }

  async getProductMaterialsVerifyLogs(id: string) {
    try {
      const { data, error } = await this.client
        .from('products')
        .select('materials_verify_logs')
        .eq('id', id)
        .single();
      if (error) throw error;
      const logs = (data && (data as any).materials_verify_logs) || [];
      return Array.isArray(logs) ? logs : [];
    } catch(e) {
      console.warn('getProductMaterialsVerifyLogs failed (column may not exist yet); falling back to empty', e);
      return [] as any[];
    }
  }
  
  async setProductMaterialsVerifyLogs(id: string, logs: Array<{ user: string; time: string }>) {
    try {
      const { error } = await this.client
        .from('products')
        .update({ materials_verify_logs: logs })
        .eq('id', id);
      if (error) throw error;
      return true;
    } catch(e) {
      console.warn('setProductMaterialsVerifyLogs failed (column may not exist yet); ignoring', e);
      return false;
    }
  }

  // Product compositions
  async listProductCompositions(product_id: string) {
    return this.client
      .from('product_compositions')
      .select('*, ingredient:ingredients(*)')
      .eq('product_id', product_id)
      .order('created_at', { ascending: true });
  }
  
  async addProductComposition(row: { 
    product_id: string; 
    ingredient_id: string; 
    percent?: number | null; 
    note?: string | null;
    display_order?: number | null;
  }) {
    return this.client.from('product_compositions').insert(row).select('*').single();
  }
  
  async updateProductComposition(id: string, row: Partial<{ percent: number; note: string; display_order: number; }>) {
    return this.client.from('product_compositions').update(row).eq('id', id).select('*').single();
  }
  
  async deleteProductComposition(id: string) { 
    return this.client.from('product_compositions').delete().eq('id', id); 
  }

  // BOM map
  async getBomMaterialSelection(product_code: string) {
    const { data } = await this.client
      .from('product_bom_material_map')
      .select('*')
      .eq('product_code', product_code) as any;
    return Array.isArray(data) ? data : [];
  }
  
  async setBomMaterialSelection(row: { 
    product_code: string; 
    ingredient_name: string; 
    selected_material_id?: string | null; 
    selected_material_number?: string | null; 
    note?: string | null; 
  }) {
    return this.client
      .from('product_bom_material_map')
      .upsert(row, { onConflict: 'product_code,ingredient_name' })
      .select('*')
      .single();
  }

  // ===== Materials (자재) - ERP API로 대체 예정 =====
  async listMaterials(params: { 
    page?: number; 
    pageSize?: number; 
    keyword?: string; 
    keywordOp?: 'AND' | 'OR' 
  }) {
    const page = Math.max(1, params?.page ?? 1);
    const pageSize = Math.min(100, Math.max(1, params?.pageSize ?? 15));
    const from = (page - 1) * pageSize; 
    const to = from + pageSize - 1;
    const kw = (params?.keyword || '').trim();
    
    if (!kw) {
      return this.client
        .from('materials')
        .select('*', { count: 'exact' })
        .order('material_name', { ascending: true })
        .range(from, to) as any;
    }
    
    const words = kw.split(/\s+/).map(s=>s.trim()).filter(Boolean);
    const cols = [
      'material_number','material_name','english_name','manufacturer',
      'spec','standard_unit','specification',
      'cas_no','search_keyword','material_notes','item_description'
    ];
    const makeGroup = (w:string)=> cols.map(c=> `${c}.ilike.*${w}*`).join(',');
    const andLogic = `and(${words.map(w=> `or(${makeGroup(w)})`).join(',')})`;
    
    return this.client
      .from('materials')
      .select('*', { count: 'exact' })
      .or(andLogic)
      .order('material_name', { ascending: true })
      .range(from, to) as any;
  }
  
  async upsertMaterial(row: any) { 
    return this.client.from('materials').upsert(row, { onConflict: 'id' }).select('*').single(); 
  }
  
  async deleteMaterial(id: string) { 
    return this.client.from('materials').delete().eq('id', id); 
  }
  
  async getMaterial(id: string) { 
    return this.client.from('materials').select('*').eq('id', id).single(); 
  }
  
  async getMaterialColumnMap() {
    const { data } = await this.client
      .from('material_column_map')
      .select('*')
      .order('display_order', { ascending: true }) as any;
    return Array.isArray(data) ? data : [];
  }

  async getMaterialsByIds(ids: string[]) {
    const list = Array.from(new Set((ids||[]).filter(Boolean)));
    if (!list.length) return [] as any[];
    const { data } = await this.client.from('materials').select('*').in('id', list) as any;
    return Array.isArray(data) ? data : [];
  }

  async listMaterialsBySpecificationExact(spec: string) {
    const { data } = await this.client
      .from('materials')
      .select('*')
      .or(`specification.ilike.${spec}`)
      .limit(2000) as any;
    const s = (spec||'').trim().toLowerCase();
    return (Array.isArray(data)? data: [])
      .filter(r => (r?.specification||'').toString().trim().toLowerCase() === s);
  }

  async syncMaterialsByExcel(payload: { sheet: any[]; headerMap?: Record<string,string> }) {
    return ExcelSyncHelper.syncMaterials(this.client, payload);
  }

  // ===== Ingredients (원료) - ERP API로 대체 예정 =====
  async listIngredients(params: {
    page?: number;
    pageSize?: number;
    keyword?: string;
    keywordOp?: 'AND' | 'OR';
  }) {
    const page = Math.max(1, params?.page ?? 1);
    const pageSize = Math.min(100, Math.max(1, params?.pageSize ?? 15));
    const kwRaw = params?.keyword || '';
    const kwTrim = kwRaw.trim();
    const words = kwTrim ? kwTrim.split(/\s+/).map(s => s.trim()).filter(Boolean).slice(0, 10) : [];
    const op = 'AND' as const;

    if (words.length > 0) {
      const cols = [
        'inci_name','korean_name','chinese_name','cas_no','scientific_name',
        'function_en','function_kr','einecs_no','old_korean_name','origin_abs',
        'remarks','created_by_name','updated_by_name'
      ];
      const quotePattern = (w: string) => `"*${String(w).replace(/\"/g, '\\"')}*"`;
      const makeGroup = (w: string) => cols.map(c => `${c}.ilike.${quotePattern(w)}`).join(',');
      const logic = `and(${words.map(w => `or(${makeGroup(w)})`).join(',')})`;
      const MAX_FETCH = 20000;
      
      const { data: superset } = await this.client
        .from('ingredients')
        .select('*')
        .or(logic)
        .order('inci_name', { ascending: true })
        .limit(MAX_FETCH) as any;
      
      const rows: any[] = Array.isArray(superset) ? superset : [];
      const buildText = (row: Record<string, any>) => Object.values(row)
        .filter(v => typeof v === 'string' || typeof v === 'number')
        .map(v => String(v))
        .join(' ')
        .replace(/\s+/g, ' ')
        .toLowerCase();
      
      const filtered = rows.filter(r => {
        const hay = buildText(r);
        return words.every(w => hay.includes(w.toLowerCase()));
      });
      
      const start = (page - 1) * pageSize; 
      const end = start + pageSize;
      return { data: filtered.slice(start, end), count: filtered.length } as any;
    }

    // No keyword: try RPC first, then fallback
    try {
      const { data, error } = await this.client.rpc('ingredients_search', {
        _page: page,
        _page_size: pageSize,
        _keyword: kwTrim,
        _op: op,
      });
      if (!error) {
        const count = Array.isArray(data) && data.length ? (data[0] as any).total_count as number : 0;
        return { data, count } as any;
      }
    } catch (e) {
      console.warn('ingredients_search RPC failed; falling back to direct query', e);
    }

    // Fallback query
    const from = (page - 1) * pageSize; 
    const to = from + pageSize - 1;
    const { data, count } = await this.client
      .from('ingredients')
      .select('*', { count: 'exact' })
      .order('inci_name', { ascending: true })
      .range(from, to) as any;
    
    return { data: data || [], count: count || 0 } as any;
  }

  async getIngredient(id: string) {
    return this.client
      .from('ingredients')
      .select('*')
      .eq('id', id)
      .single();
  }

  async getIngredientChangeLogs(id: string) {
    try {
      const { data, error } = await this.client
        .from('ingredients')
        .select('change_logs')
        .eq('id', id)
        .single();
      if (error) throw error;
      const logs = (data && (data as any).change_logs) || [];
      return Array.isArray(logs) ? logs : [];
    } catch(e) {
      console.warn('getIngredientChangeLogs failed; returning empty list', e);
      return [] as Array<{ user: string; time: string }>;
    }
  }

  async setIngredientChangeLogs(id: string, logs: Array<{ user: string; time: string }>) {
    try {
      const { error } = await this.client
        .from('ingredients')
        .update({ change_logs: logs })
        .eq('id', id);
      if (error) throw error;
      return true;
    } catch(e) {
      console.warn('setIngredientChangeLogs failed; ignoring', e);
      return false;
    }
  }

  async upsertIngredient(row: any) {
    return this.client
      .from('ingredients')
      .upsert(row, { onConflict: 'id' })
      .select('*')
      .single();
  }

  async searchIngredientsBasic(keyword: string) {
    const kw = (keyword||'').trim();
    if (!kw) return { data: [] as any[] } as any;
    const or = `inci_name.ilike.*${kw}*,korean_name.ilike.*${kw}*`;
    const { data } = await this.client
      .from('ingredients')
      .select('id, inci_name, korean_name')
      .or(or)
      .order('inci_name', { ascending: true })
      .limit(50) as any;
    return { data: Array.isArray(data)? data: [] } as any;
  }

  async getIngredientsByNames(names: string[]) {
    const list = Array.from(new Set((names||[]).filter(Boolean)));
    if (!list.length) return { data: [] as any[] } as any;
    const { data } = await this.client
      .from('ingredients')
      .select('id, inci_name, korean_name, chinese_name, cas_no')
      .in('inci_name', list) as any;
    return { data: Array.isArray(data)? data: [] } as any;
  }

  async getCompositionCountsForIngredients(ingredientIds: string[]) {
    const ids = Array.from(new Set((ingredientIds||[]).filter(Boolean)));
    if (!ids.length) return {} as Record<string, number>;
    const { data } = await this.client
      .from('product_compositions')
      .select('ingredient_id')
      .in('ingredient_id', ids) as any;
    const counts: Record<string, number> = {};
    for (const row of (data||[])) {
      const k = row?.ingredient_id as string; 
      if (!k) continue;
      counts[k] = (counts[k]||0) + 1;
    }
    return counts;
  }

  // ===== Sales (판매) - 향후 ERP API 연동 가능 =====
  async createSalesOrder(row: { 
    product_key: string; 
    order_no?: string | null; 
    order_date?: string | null; 
    order_qty?: number | null; 
    created_by?: string | null; 
    created_by_name?: string | null; 
  }) {
    return this.client.from('sales_orders').insert(row).select('*').single();
  }
  
  async updateSalesOrder(id: string, row: Partial<{ 
    order_no: string; 
    order_date: string; 
    order_qty: number; 
  }>) {
    return this.client.from('sales_orders').update(row).eq('id', id).select('*').single();
  }
  
  async listSalesOrders(product_key: string) {
    return this.client
      .from('sales_orders')
      .select('*, deliveries:sales_deliveries(*)')
      .eq('product_key', product_key)
      .order('created_at', { ascending: true });
  }
  
  async addSalesDelivery(row: { 
    order_id: string; 
    due_date?: string | null; 
    qty?: number | null; 
    outsource_date?: string | null; 
    outsource_qty?: number | null; 
  }) {
    return this.client.from('sales_deliveries').insert(row).select('*').single();
  }
  
  async updateSalesDelivery(id: string, row: Partial<{ 
    due_date: string; 
    qty: number; 
    outsource_date: string; 
    outsource_qty: number; 
  }>) {
    return this.client.from('sales_deliveries').update(row).eq('id', id).select('*').single();
  }
  
  async deleteSalesDelivery(id: string) {
    return this.client.from('sales_deliveries').delete().eq('id', id);
  }
  
  async logDeliveryChange(row: { 
    delivery_id: string; 
    field: string; 
    old_value?: string | null; 
    new_value?: string | null; 
    changed_by?: string | null; 
    changed_by_name?: string | null; 
  }) {
    return this.client.from('sales_delivery_changes').insert(row);
  }
  
  async listDeliveryChanges(delivery_id: string) {
    return this.client
      .from('sales_delivery_changes')
      .select('*')
      .eq('delivery_id', delivery_id)
      .order('changed_at', { ascending: true });
  }
}
