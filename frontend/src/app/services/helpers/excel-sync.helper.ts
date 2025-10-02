import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Excel 동기화 헬퍼 클래스
 * 대용량 Excel 데이터를 데이터베이스와 동기화하는 로직을 담당합니다.
 */
export class ExcelSyncHelper {
  /**
   * 제품 데이터를 Excel에서 가져와 데이터베이스와 동기화합니다.
   */
  static async syncProducts(
    client: SupabaseClient,
    payload: { 
      sheet: any[]; 
      headerMap?: Record<string,string>; 
      deleteMode?: 'none' | 'missing' | 'all' 
    }
  ) {
    const rows = payload?.sheet || [];
    const deleteMode = payload?.deleteMode || 'missing';
    const errors: Array<{ product_code: string; column?: string; message: string }> = [];
    
    if (!rows.length) {
      return { ok: true, total: 0, updated: 0, skipped: 0, inserted: 0, deleted: 0, errors } as any;
    }

    // Build column mapping
    const { data: mapRows } = await client.from('product_column_map').select('sheet_label_kr, db_column');
    const dbMap: Record<string,string> = {};
    (mapRows||[]).forEach(m => { 
      if (m?.sheet_label_kr && m?.db_column) dbMap[m.sheet_label_kr] = m.db_column; 
    });

    const builtin = this.getProductColumnMapping();
    const map: Record<string,string> = Object.assign({}, dbMap, builtin, payload?.headerMap || {});

    // Process rows
    const { normalized, colsInUpload, skipped: skipCount } = this.normalizeProductRows(rows, map);
    
    if (!normalized.length) {
      return { ok: true, total: rows.length, updated: 0, skipped: skipCount, inserted: 0, deleted: 0, errors } as any;
    }

    // Fetch existing data - fetch ALL products by filtering with uploaded codes
    const uploadedCodes = normalized.map(n => n.product_code);
    
    // CRITICAL: Always fetch ALL columns from DB, not just columns present in CSV
    // This is necessary to detect and clear fields that are empty/removed in CSV
    // Fetch in batches to avoid query size limits
    let allExisting: any[] = [];
    const BATCH_SIZE = 1000;
    
    for (let i = 0; i < uploadedCodes.length; i += BATCH_SIZE) {
      const codeBatch = uploadedCodes.slice(i, i + BATCH_SIZE);
      const { data: batchData, error: fetchError } = await client
        .from('products')
        .select('*')  // Fetch all columns to detect clearing of fields
        .in('product_code', codeBatch) as any;
      
      if (fetchError) {
        console.error('[ExcelSync] Failed to fetch existing products:', fetchError);
        errors.push({ product_code: '-', message: `DB 조회 실패: ${fetchError.message}` });
        return { ok: false, total: rows.length, updated: 0, skipped: 0, inserted: 0, deleted: 0, errors } as any;
      }
      
      if (batchData) {
        allExisting = allExisting.concat(batchData);
      }
    }
    
    console.log(`[ExcelSync] Fetched ${allExisting.length} existing products from DB (out of ${uploadedCodes.length} uploaded)`);
    console.log(`[ExcelSync] Processing ${normalized.length} rows from CSV`);
    console.log(`[ExcelSync] Columns in upload:`, Array.from(colsInUpload).sort());
    
    // Process updates and inserts
    const { toUpsert, updated, skipped, inserted, allExistingCodes } = this.processProductDiff(
      normalized, 
      allExisting || [], 
      uploadedCodes, 
      colsInUpload
    );
    
    console.log(`[ExcelSync] Diff result: updated=${updated}, inserted=${inserted}, skipped=${skipped}`);
    if (updated === 0 && inserted === 0 && skipped > 0) {
      console.warn('[ExcelSync] WARNING: All rows skipped! Checking first row...');
      if (normalized.length > 0 && allExisting.length > 0) {
        const firstUpload = normalized[0];
        const firstExisting = allExisting.find((e: any) => e.product_code === firstUpload.product_code);
        if (firstExisting) {
          console.log('[ExcelSync] Sample comparison:', {
            code: firstUpload.product_code,
            uploadCasNo: firstUpload.row.cas_no,
            dbCasNo: firstExisting.cas_no,
            uploadHalal: firstUpload.row.cert_halal,
            dbHalal: firstExisting.cert_halal
          });
        }
      }
    }

    // Handle deletions - need to fetch ALL product codes from DB for comparison
    let allExistingCodesForDelete = new Set<string>();
    if (deleteMode === 'missing') {
      // Fetch all product codes from DB in batches (not just uploaded ones)
      let offset = 0;
      const FETCH_BATCH = 1000;
      let hasMore = true;
      
      while (hasMore) {
        const { data: batch } = await client
          .from('products')
          .select('product_code')
          .range(offset, offset + FETCH_BATCH - 1);
        
        if (batch && batch.length > 0) {
          batch.forEach((p: any) => allExistingCodesForDelete.add(p.product_code));
          offset += FETCH_BATCH;
          hasMore = batch.length === FETCH_BATCH; // If less than batch size, we're done
        } else {
          hasMore = false;
        }
      }
      
      console.log(`[ExcelSync] Total products in DB: ${allExistingCodesForDelete.size}, CSV has: ${uploadedCodes.length}`);
    }
    
    const { toDelete } = this.findProductsToDelete(deleteMode, uploadedCodes, allExistingCodesForDelete);

    // Execute database operations
    let deleted = 0;
    
    console.log(`[ExcelSync] Will upsert ${toUpsert.length} products, delete ${toDelete.length} products`);
    
    if (toUpsert.length) {
      await this.executeProductUpsert(client, toUpsert, errors);
    }

    if (toDelete.length > 0 && deleteMode !== 'none') {
      deleted = await this.executeProductDelete(client, toDelete, errors);
    }
    
    console.log(`[ExcelSync] Complete. Errors: ${errors.length}`);
    if (errors.length > 0) {
      console.error('[ExcelSync] Errors:', errors.slice(0, 5)); // Log first 5 errors
    }

    return { 
      ok: true, 
      total: rows.length, 
      updated, 
      skipped: skipped + skipCount, 
      inserted, 
      deleted, 
      errors 
    } as any;
  }

  /**
   * 자재 데이터를 Excel에서 가져와 데이터베이스와 동기화합니다.
   */
  static async syncMaterials(
    client: SupabaseClient,
    payload: { sheet: any[]; headerMap?: Record<string,string> }
  ) {
    const rows = payload?.sheet || [];
    if (!rows.length) {
      return { ok: true, total: 0, updated: 0, skipped: 0, inserted: 0, errors: [] } as any;
    }

    // Build column mapping
    const maps = await this.getMaterialColumnMap(client);
    const dbMap: Record<string,string> = {};
    for (const m of maps) { 
      if (m?.sheet_label_kr && m?.db_column) dbMap[String(m.sheet_label_kr)] = String(m.db_column); 
    }

    const builtin = this.getMaterialColumnMapping();
    const labelToDb: Record<string,string> = Object.assign({}, dbMap, builtin, payload?.headerMap || {});

    // Process rows
    const { normalized, colsInUpload, errors } = this.normalizeMaterialRows(rows, labelToDb);
    
    if (!normalized.length) {
      return { ok: true, total: rows.length, updated: 0, skipped: rows.length, inserted: 0, errors } as any;
    }

    // Fetch existing and process diff
    const keys = normalized.map(n => n.key);
    const { data: existingList } = await client.from('materials').select('*').in('material_number', keys) as any;
    
    const { toUpsert, updated, skipped, inserted } = this.processMaterialDiff(
      normalized, 
      existingList || [], 
      colsInUpload
    );

    // Execute upsert
    if (toUpsert.length) {
      await this.executeMaterialUpsert(client, toUpsert, errors);
    }

    return { ok: true, total: rows.length, updated, skipped, inserted, errors } as any;
  }

  // Helper methods
  private static getProductColumnMapping(): Record<string, string> {
    return {
      '품번': 'product_code', 
      '품목코드': 'product_code', 
      '대표품번': 'main_code', 
      '품명': 'name_kr', 
      '대표품명': 'name_kr', 
      '영문명': 'name_en', 
      '품목설명': 'remarks',
      '등록일': 'reg_date', 
      '등록일자': 'reg_date',
      '등록자': 'reg_user',
      '최종수정일': 'last_update_date', 
      '최종수정일자': 'last_update_date',
      '최종수정자': 'last_update_user',
      '품목상태':'item_status',
      '품목대분류':'item_category',
      '품목중분류':'item_midcategory',
      '품목소분류':'item_subcategory',
      '기준단위':'unit',
      '규격':'spec',
      '대표규격':'main_spec',
      '검색어(이명(異名))':'keywords_alias',
      '사양':'specification',
      '품목특이사항':'special_notes',
      'CAS':'cas_no',
      'CAS NO':'cas_no',
      'CAS No':'cas_no',
      'cas':'cas_no',
      'MOQ':'moq',
      '포장단위':'package_unit',
      'Manufacturer':'manufacturer',
      'Country of Manufacture':'country_of_manufacture',
      'Source of Origin(Method)':'source_of_origin_method',
      'Plant Part':'plant_part',
      'Country of Origin':'country_of_origin',
      '중국원료신고번호(NMPA)':'nmpa_no',
      '알러젠성분':'allergen',
      'Furocoumarines':'furocoumarins',
      '효능':'efficacy',
      '특허':'patent',
      '논문':'paper',
      '임상':'clinical',
      '사용기한':'expiration_date',
      '보관위치':'storage_location',
      '보관방법1':'storage_method1',
      '안정성 및 유의사항1':'stability_note1',
      'Note on storage1':'storage_note1',
      'Safety & Handling1':'safety_handling1',
      '유기농 인증':'cert_organic',
      'KOSHER 인증':'cert_kosher',
      'HALAL 인증':'cert_halal',
      'VEGAN 인증':'cert_vegan',
      'ISAAA 인증':'cert_isaaa',
      'RSPO 인증':'cert_rspo',
      'REACH 인증':'cert_reach'
    };
  }

  private static getMaterialColumnMapping(): Record<string, string> {
    return {
      '자재상태':'material_status',
      '품목자산분류':'item_asset_class',
      '자재소분류':'material_sub_class',
      '등록일':'created_on_erp',
      '등록자':'created_by_erp',
      '최종수정일':'modified_on_erp',
      '최종수정자':'modified_by_erp',
      'Lot 관리':'is_lot_managed',
      '자재대분류':'material_large_class',
      '관리부서':'managing_department',
      '자재번호':'material_number',
      '자재내부코드':'material_internal_code',
      '자재명':'material_name',
      '규격':'spec',
      '기준단위':'standard_unit',
      '내외자구분':'domestic_foreign_class',
      '중요도':'importance',
      '관리자':'manager',
      '제조사':'manufacturer',
      '자재중분류':'material_middle_class',
      '영문명':'english_name',
      '출고구분':'shipping_class',
      '대표자재':'representative_material',
      'BOM등록':'is_bom_registered',
      '제품별공정소요재':'material_required_for_process_by_product',
      'Serial 관리':'is_serial_managed',
      '단가등록여부':'is_unit_price_registered',
      '유통기한구분':'expiration_date_class',
      '유통기간':'distribution_period',
      '품목설명':'item_description',
      '기본구매처':'default_supplier',
      '수탁거래처':'consignment_supplier',
      '부가세구분':'vat_class',
      '판매단가에 부가세포함여부':'is_vat_included_in_sales_price',
      '첨부파일':'attachment_file',
      '자재세부분류':'material_detail_class',
      '검색어(이명(異名))':'search_keyword',
      '사양':'specification',
      '자재특이사항':'material_notes',
      'CAS NO':'cas_no',
      'MOQ':'moq',
      '포장단위':'packaging_unit'
    };
  }

  private static normalizeProductRows(rows: any[], map: Record<string, string>) {
    const normalized: Array<{ product_code: string; row: any }> = [];
    const colsInUpload = new Set<string>(['product_code']);
    const codeHeaders = Object.keys(map).filter(k => map[k] === 'product_code');
    const seenCodes = new Set<string>();
    let skipped = 0;

    const DATE_COLS = new Set(['reg_date','last_update_date']);
    const isEmpty = (val:any) => val===undefined || val===null || (typeof val==='string' && val.trim()==='');
    
    // Pre-populate colsInUpload with ALL columns that are present in ANY row
    // This ensures empty columns are still tracked
    if (rows.length > 0) {
      const firstRow = rows[0];
      for (const [erpHeader, dbCol] of Object.entries(map)) {
        if (erpHeader in firstRow) {
          colsInUpload.add(dbCol);
        }
      }
    }
    
    for (const r of rows) {
      const codeRaw = codeHeaders.map(h => r[h]).find(v => v!==undefined && v!==null && String(v).trim()!=='');
      const code = codeRaw ? String(codeRaw).trim() : '';
      
      if (!code) { 
        skipped++; 
        continue; 
      }

      // Skip duplicates within the uploaded CSV
      if (seenCodes.has(code)) {
        skipped++;
        continue;
      }
      seenCodes.add(code);

      const obj: any = { product_code: code };
      
      for (const [erp, dbcol] of Object.entries(map)) {
        // Check if this column header exists in this row (even if empty)
        if (!(erp in r)) continue;
        
        const raw = r[erp];
        let v: any = DATE_COLS.has(dbcol) ? this.toDateText(raw) : raw;
        v = (v===undefined || v===null || (typeof v==='string' && v.trim()==='')) ? null : v;
        
        // Always set the value from CSV, even if it's null/empty
        // This allows clearing fields by providing empty values in CSV
        obj[dbcol] = v;
        // Note: colsInUpload is already populated from the first row
      }
      
      normalized.push({ product_code: code, row: obj });
    }

    return { normalized, colsInUpload, skipped };
  }

  private static normalizeMaterialRows(rows: any[], labelToDb: Record<string, string>) {
    const normalized: Array<{ key: string; row: any }> = [];
    const errors: Array<{ key:string; column?: string; message:string }> = [];
    const colsInUpload = new Set<string>();

    for (const r of rows) {
      const obj: any = {};
      
      for (const [erp, value] of Object.entries(r)) {
        const dbcol = labelToDb[erp];
        if (!dbcol) continue;
        
        let v: any = this.toDateText(value);
        obj[dbcol] = v;
        colsInUpload.add(dbcol);
      }
      
      const key = obj.material_number || (r as any)['자재번호'] || '';
      if (!key) { 
        errors.push({ key: '-', message: '자재번호가 없습니다.' }); 
        continue; 
      }
      
      obj.material_number = key;
      normalized.push({ key, row: obj });
    }

    return { normalized, colsInUpload, errors };
  }

  private static toDateText(val: any): any {
    if (val === undefined || val === null) return null;
    const s = String(val).trim();
    if (!s) return null;
    return s;
  }

  private static processProductDiff(
    normalized: Array<{ product_code: string; row: any }>,
    allExisting: any[],
    uploadedCodes: string[],
    colsInUpload: Set<string>
  ) {
    const codeToExisting: Record<string, any> = {};
    const allExistingCodes = new Set<string>();
    const uploadedCodeSet = new Set(uploadedCodes);
    
    for (const ex of allExisting) {
      const code = ex.product_code;
      if (code) {
        allExistingCodes.add(code);
        if (uploadedCodeSet.has(code)) {
          codeToExisting[code] = ex;
        }
      }
    }

    const toUpsert: any[] = [];
    let updated = 0, skipped = 0, inserted = 0;

    const signatureOf = (row: any) => {
      const keys = Array.from(colsInUpload).filter(k => k !== 'product_code').sort();
      const parts = keys.map(k => {
        const val = row[k];
        const norm = this.normalizeValue(val);
        return `${k}:${norm}`;
      });
      
      let h = 5381;
      const s = parts.join('|');
      for (let i = 0; i < s.length; i++) {
        h = ((h << 5) + h) ^ s.charCodeAt(i);
      }
      return (h >>> 0).toString(36);
    };

    for (const n of normalized) {
      const existing = codeToExisting[n.product_code];
      
      if (!existing) {
        const row = { ...n.row };
        if (!row.name_kr) row.name_kr = n.product_code;
        if (!row.asset_category) row.asset_category = 'unspecified';
        const sig = signatureOf(row);
        const prevAttrs = (row as any).attrs || {};
        row.attrs = { ...prevAttrs, row_hash: sig };
        toUpsert.push(row);
        inserted++;
        continue;
      }

      // Compare each field explicitly to detect real changes
      const diff = this.computeProductDiff(n, existing, colsInUpload);
      if (diff) {
        const prevAttrs = (existing as any)?.attrs || {};
        diff.attrs = { ...prevAttrs, last_sync: new Date().toISOString() };
        toUpsert.push(diff);
        updated++;
      } else {
        skipped++;
      }
    }

    return { toUpsert, updated, skipped, inserted, allExistingCodes };
  }

  private static processMaterialDiff(
    normalized: Array<{ key: string; row: any }>,
    existingList: any[],
    colsInUpload: Set<string>
  ) {
    const mapByKey: Record<string, any> = {};
    for (const ex of existingList) {
      const k1 = ex.material_number;
      if (k1) mapByKey[k1] = ex;
    }

    let updated = 0, skipped = 0, inserted = 0;
    const toUpsert: any[] = [];

    for (const n of normalized) {
      const existing = mapByKey[n.key];
      
      if (!existing) {
        const row = { ...n.row };
        if (!row.material_name) row.material_name = n.key;
        toUpsert.push(row);
        inserted++;
        continue;
      }

      let changed = false;
      const diff: any = { material_number: existing.material_number };
      
      for (const col of colsInUpload) {
        const newVal = (n.row as any)[col];
        if (newVal === undefined) continue;
        
        const oldVal = (existing as any)[col];
        const oldNorm = (oldVal === undefined || oldVal === null || String(oldVal).trim() === '') ? null : oldVal;
        const newNorm = (newVal === undefined || newVal === null || (typeof newVal === 'string' && newVal.trim() === '')) ? null : newVal;
        
        if (JSON.stringify(oldNorm) !== JSON.stringify(newNorm)) {
          diff[col] = newNorm;
          changed = true;
        }
      }
      
      if (changed) {
        toUpsert.push(diff);
        updated++;
      } else {
        skipped++;
      }
    }

    return { toUpsert, updated, skipped, inserted };
  }

  private static findProductsToDelete(
    deleteMode: string,
    uploadedCodes: string[],
    allExistingCodes: Set<string>
  ) {
    const toDelete: string[] = [];
    
    if (deleteMode === 'missing') {
      // Delete only products that exist in DB but are NOT in the uploaded CSV
      const uploadedCodeSet = new Set(uploadedCodes.map(c => String(c).trim()).filter(Boolean));
      
      for (const existingCode of allExistingCodes) {
        const normalizedExisting = String(existingCode).trim();
        if (normalizedExisting && !uploadedCodeSet.has(normalizedExisting)) {
          toDelete.push(existingCode);
        }
      }
    } else if (deleteMode === 'all') {
      // Delete all existing products (use with caution)
      for (const existingCode of allExistingCodes) {
        if (existingCode) {
          toDelete.push(existingCode);
        }
      }
    }
    
    return { toDelete };
  }

  private static async executeProductUpsert(
    client: SupabaseClient,
    toUpsert: any[],
    errors: any[]
  ) {
    // Process one by one to ensure accuracy and catch individual errors
    for (const item of toUpsert) {
      try {
        const { error } = await client
          .from('products')
          .upsert(item, { 
            onConflict: 'product_code',
            ignoreDuplicates: false
          });
        
        if (error) {
          errors.push({
            product_code: item.product_code || '-',
            message: error.message || String(error)
          });
        }
      } catch (e: any) {
        errors.push({
          product_code: item.product_code || '-',
          message: e?.message || String(e)
        });
      }
    }
  }

  private static async executeMaterialUpsert(
    client: SupabaseClient,
    toUpsert: any[],
    errors: any[]
  ) {
    const { error } = await client.from('materials').upsert(toUpsert, { 
      onConflict: 'material_number', 
      ignoreDuplicates: false, 
      defaultToNull: false 
    });
    
    if (error) {
      const B = 200;
      for (let i = 0; i < toUpsert.length; i += B) {
        const part = toUpsert.slice(i, i + B);
        const { error: e2 } = await client.from('materials').upsert(part, { 
          onConflict: 'material_number', 
          ignoreDuplicates: false, 
          defaultToNull: false 
        });
        if (e2) {
          errors.push({ 
            key: part[0]?.material_internal_code || part[0]?.material_number || part[0]?.material_name || '-', 
            message: e2.message || String(e2) 
          });
        }
      }
    }
  }

  private static async executeProductDelete(
    client: SupabaseClient,
    toDelete: string[],
    errors: any[]
  ): Promise<number> {
    let deleted = 0;
    const BATCH_SIZE = 100;
    
    for (let i = 0; i < toDelete.length; i += BATCH_SIZE) {
      const batch = toDelete.slice(i, i + BATCH_SIZE);
      try {
        const { error } = await client
          .from('products')
          .delete()
          .in('product_code', batch);
        
        if (error) {
          errors.push({
            product_code: batch.join(','),
            message: `삭제 실패: ${error.message || String(error)}`
          });
        } else {
          deleted += batch.length;
        }
      } catch (e: any) {
        errors.push({
          product_code: batch.join(','),
          message: `삭제 중 오류: ${e?.message || String(e)}`
        });
      }
    }
    
    return deleted;
  }

  private static async getMaterialColumnMap(client: SupabaseClient) {
    const { data } = await client.from('material_column_map').select('*').order('display_order', { ascending: true }) as any;
    return Array.isArray(data) ? data : [];
  }

  private static normalizeValue(val: any): string {
    if (val === undefined || val === null) return '';
    if (typeof val === 'string') return val.trim();
    if (typeof val === 'number') return val.toString();
    if (typeof val === 'boolean') return val ? 'true' : 'false';
    if (val instanceof Date) return val.toISOString();
    return JSON.stringify(val);
  }

  private static computeProductDiff(
    n: { product_code: string; row: any },
    existing: any,
    colsInUpload: Set<string>
  ): any | null {
    const diff: any = { product_code: n.product_code };
    const REQUIRED = new Set<string>(['name_kr', 'asset_category']);
    let changed = false;
    const changes: string[] = []; // Track what changed for debugging
    
    for (const col of colsInUpload) {
      if (col === 'product_code') continue;
      
      const newVal = (n.row as any)[col];
      const oldVal = (existing as any)[col];
      
      const normalizeForComparison = (v: any): any => {
        if (v === undefined || v === null) return null;
        if (typeof v === 'string') {
          const trimmed = v.trim();
          return trimmed === '' ? null : trimmed;
        }
        if (typeof v === 'number' && isNaN(v)) return null;
        return v;
      };
      
      const oldNorm = normalizeForComparison(oldVal);
      const newNorm = normalizeForComparison(newVal);
      
      // Skip only if the column is not present in the upload at all
      // Allow explicit empty/null values from CSV to clear DB fields
      if (newVal === undefined) continue;
      
      // Don't allow clearing required fields
      if (newNorm === null && REQUIRED.has(col as string)) {
        // Keep existing value for required fields
        continue;
      }
      
      const oldStr = JSON.stringify(oldNorm);
      const newStr = JSON.stringify(newNorm);
      
      if (oldStr !== newStr) {
        (diff as any)[col] = newNorm;
        changed = true;
        
        // Log significant changes for debugging
        if (col === 'cas_no' || col === 'cert_halal') {
          changes.push(`${col}: "${oldVal}" → "${newNorm}"`);
        }
      }
    }
    
    // Only return diff if there are actual changes
    if (!changed) {
      return null;
    }
    
    // Debug log for products with changes
    if (changes.length > 0) {
      console.log(`[ExcelSync] Changes for ${n.product_code}:`, changes.join(', '));
    }
    
    // Ensure required fields are present in the update
    diff.name_kr = (n.row as any).name_kr || (existing as any).name_kr || n.product_code;
    diff.asset_category = (n.row as any).asset_category || (existing as any).asset_category || 'unspecified';
    
    return diff;
  }
}
