-- Create materials table and mapping from ERP labels to DB columns
begin;

create table if not exists public.materials (
  id uuid primary key default gen_random_uuid(),
  -- Business columns (all text for compatibility; can refine types later)
  material_status text,
  item_asset_class text,
  material_sub_class text,
  created_on_erp text,
  created_by_erp text,
  modified_on_erp text,
  modified_by_erp text,
  is_lot_managed text,
  material_large_class text,
  managing_department text,
  material_number text,
  material_internal_code text,
  material_name text,
  spec text,
  standard_unit text,
  domestic_foreign_class text,
  importance text,
  manager text,
  manufacturer text,
  material_middle_class text,
  english_name text,
  shipping_class text,
  representative_material text,
  is_bom_registered text,
  material_required_for_process_by_product text,
  is_serial_managed text,
  is_unit_price_registered text,
  expiration_date_class text,
  distribution_period text,
  item_description text,
  default_supplier text,
  consignment_supplier text,
  vat_class text,
  is_vat_included_in_sales_price text,
  attachment_file text,
  material_detail_class text,
  search_keyword text,
  specification text,
  material_notes text,
  cas_no text,
  moq text,
  packaging_unit text,
  country_of_manufacture text,
  source_of_origin_method text,
  plant_part text,
  country_of_origin text,
  nmpa_registration_number text,
  allergen_ingredient text,
  furocoumarines text,
  efficacy text,
  patent text,
  paper text,
  clinical_trial text,
  use_by_date text,
  storage_location text,
  storage_method text,
  safety_and_precautions text,
  note_on_storage text,
  safety_and_handling text,
  notice_coa3_english text,
  notice_coa3_korean text,
  -- Extensibility bucket
  attrs jsonb not null default '{}'::jsonb,
  -- Audit
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid,
  created_by_name text,
  updated_by_name text
);

alter table public.materials enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='materials' and policyname='materials_select'
  ) then
    create policy materials_select on public.materials for select to authenticated using (true);
  end if;
  if to_regprocedure('public.is_admin()') is not null then
    if not exists (
      select 1 from pg_policies where schemaname='public' and tablename='materials' and policyname='materials_write'
    ) then
      create policy materials_write on public.materials for all to authenticated using (is_admin()) with check (is_admin());
    end if;
  end if;
end $$;

-- Mapping table: ERP label(kr) <-> DB column
create table if not exists public.material_column_map (
  id uuid primary key default gen_random_uuid(),
  sheet_label_kr text not null,
  db_column text not null,
  is_required boolean not null default false,
  display_order int not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid,
  created_by_name text,
  updated_by_name text,
  constraint material_column_map_sheet_label_kr_key unique (sheet_label_kr)
);

alter table public.material_column_map enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='material_column_map' and policyname='material_column_map_select'
  ) then
    create policy material_column_map_select on public.material_column_map for select to authenticated using (true);
  end if;
  if to_regprocedure('public.is_admin()') is not null then
    if not exists (
      select 1 from pg_policies where schemaname='public' and tablename='material_column_map' and policyname='material_column_map_write'
    ) then
      create policy material_column_map_write on public.material_column_map for all to authenticated using (is_admin()) with check (is_admin());
    end if;
  end if;
end $$;

-- Seed mapping rows using provided pairs
insert into public.material_column_map(sheet_label_kr, db_column, is_required, display_order) values
  ('자재상태','material_status', false, 10),
  ('품목자산분류','item_asset_class', false, 20),
  ('자재소분류','material_sub_class', false, 30),
  ('등록일','created_on_erp', false, 40),
  ('등록자','created_by_erp', false, 50),
  ('최종수정일','modified_on_erp', false, 60),
  ('최종수정자','modified_by_erp', false, 70),
  ('Lot 관리','is_lot_managed', false, 80),
  ('자재대분류','material_large_class', false, 90),
  ('관리부서','managing_department', false, 100),
  ('자재번호','material_number', false, 110),
  ('자재내부코드','material_internal_code', false, 120),
  ('자재명','material_name', true, 130),
  ('규격','spec', false, 140),
  ('기준단위','standard_unit', false, 150),
  ('내외자구분','domestic_foreign_class', false, 160),
  ('중요도','importance', false, 170),
  ('관리자','manager', false, 180),
  ('제조사','manufacturer', false, 190),
  ('자재중분류','material_middle_class', false, 200),
  ('영문명','english_name', false, 210),
  ('출고구분','shipping_class', false, 220),
  ('대표자재','representative_material', false, 230),
  ('BOM등록','is_bom_registered', false, 240),
  ('제품별공정소요자재','material_required_for_process_by_product', false, 250),
  ('Serial 관리','is_serial_managed', false, 260),
  ('단가등록여부','is_unit_price_registered', false, 270),
  ('유통기한구분','expiration_date_class', false, 280),
  ('유통기간','distribution_period', false, 290),
  ('품목설명','item_description', false, 300),
  ('기본구매처','default_supplier', false, 310),
  ('수탁거래처','consignment_supplier', false, 320),
  ('부가세구분','vat_class', false, 330),
  ('판매단가에 부가세포함여부','is_vat_included_in_sales_price', false, 340),
  ('첨부파일','attachment_file', false, 350),
  ('자재세부분류','material_detail_class', false, 360),
  ('검색어(이명(異名))','search_keyword', false, 370),
  ('사양','specification', false, 380),
  ('자재특이사항','material_notes', false, 390),
  ('CAS NO','cas_no', false, 400),
  ('MOQ','moq', false, 410),
  ('포장단위','packaging_unit', false, 420),
  ('Manufacturer','manufacturer', false, 430),
  ('Country of Manufacture','country_of_manufacture', false, 440),
  ('Source of Origin(Method)','source_of_origin_method', false, 450),
  ('Plant Part','plant_part', false, 460),
  ('Country of Origin','country_of_origin', false, 470),
  ('중국원료신고번호(NMPA)','nmpa_registration_number', false, 480),
  ('알러젠성분','allergen_ingredient', false, 490),
  ('Furocoumarines','furocoumarines', false, 500),
  ('효능','efficacy', false, 510),
  ('특허','patent', false, 520),
  ('논문','paper', false, 530),
  ('임상','clinical_trial', false, 540),
  ('사용기한','use_by_date', false, 550),
  ('보관장소','storage_location', false, 560),
  ('보관방법','storage_method', false, 570),
  ('안정성 및 유의사항','safety_and_precautions', false, 580),
  ('Note on storage','note_on_storage', false, 590),
  ('Safety & Handling','safety_and_handling', false, 600),
  ('NOTICE (COA3 영문)','notice_coa3_english', false, 610),
  ('NOTICE (COA3 국문)','notice_coa3_korean', false, 620)
on conflict (sheet_label_kr) do nothing;

-- Audit triggers if the shared function exists
create trigger trg_materials_audit
before insert or update on public.materials
for each row execute function set_audit_fields();

create trigger trg_material_column_map_audit
before insert or update on public.material_column_map
for each row execute function set_audit_fields();

commit;


