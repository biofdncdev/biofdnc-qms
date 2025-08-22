-- Recreate products with required columns, order, and constraints
-- Ensures: product_code UNIQUE NOT NULL, name_kr NOT NULL, asset_category NOT NULL

begin;

-- 0) Ensure audit trigger won't block renames
drop trigger if exists trg_products_audit on public.products;

-- 1) Drop dependent FK on product_compositions before table swap
alter table public.product_compositions drop constraint if exists product_compositions_product_id_fkey;

-- 2) Keep current data by renaming old table
alter table if exists public.products rename to products_old;

-- 3) Create new products table in the exact desired order
create table public.products (
  -- Korean sheet order
  item_status               text null,
  reg_date                  text null,
  reg_user                  text null,
  last_update_date          text null,
  last_update_user          text null,
  domestic_overseas         text null,
  item_subcategory          text null,
  importance                text null,
  managing_department       text null,
  manager                   text null,
  item_category             text null,
  item_midcategory          text null,
  shipping_type             text null,
  is_main_item              text null,
  is_set_item               text null,
  is_bom_registered         text null,
  has_process_materials     text null,
  lot_control               text null,
  serial_control            text null,
  asset_category            text not null default 'unspecified',
  inspection_target         text null,
  shelf_life_type           text null,
  shelf_life_period         text null,
  sm_asset_grp              text null,
  default_supplier          text null,
  vat_type                  text null,
  sale_price_includes_vat   text null,
  attachment                text null,
  image_url                 text null,
  main_name                 text null,
  main_code                 text null,
  main_spec                 text null,
  product_code              text not null,
  name_kr                   text not null,
  spec                      text null,
  name_en                   text null,
  remarks                   text null,
  unit                      text null,
  item_subdivision          text null,
  keywords_alias            text null,
  specification             text null,
  special_notes             text null,
  cas_no                    text null,
  moq                       text null,
  package_unit              text null,
  manufacturer              text null,
  country_of_manufacture    text null,
  source_of_origin_method   text null,
  plant_part                text null,
  country_of_origin         text null,
  nmpa_no                   text null,
  allergen                  text null,
  furocoumarins             text null,
  efficacy                  text null,
  patent                    text null,
  paper                     text null,
  clinical                  text null,
  expiration_date           text null,
  storage_location          text null,
  storage_method1           text null,
  stability_note1           text null,
  storage_note1             text null,
  safety_handling1          text null,
  notice_coa3_en_1          text null,
  notice_coa3_kr_1          text null,
  notice_comp_kr_1          text null,
  notice_comp_en_1          text null,
  caution_origin_1          text null,
  cert_organic              text null,
  cert_kosher               text null,
  cert_halal                text null,
  cert_vegan                text null,
  cert_isaaa                text null,
  cert_rspo                 text null,
  cert_reach                text null,
  expiration_date2          text null,
  storage_method2           text null,
  stability_note2           text null,
  storage_note2             text null,
  safety_handling2          text null,
  notice_coa3_en_2          text null,
  notice_coa3_kr_2          text null,
  notice_comp_kr_2          text null,
  notice_comp_en_2          text null,
  caution_origin_2          text null,

  -- Tail: system fields
  id                        uuid not null default gen_random_uuid(),
  category                  text null,
  status                    text null,
  attrs                     jsonb null default '{}'::jsonb,
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now(),
  created_by                uuid null,
  updated_by                uuid null,
  created_by_name           text null,
  updated_by_name           text null,

  constraint products_pkey primary key (id),
  constraint products_product_code_key unique (product_code)
);

-- 4) Backfill from old table preserving IDs and ensuring required columns are not null
insert into public.products (
  item_status, reg_date, reg_user, last_update_date, last_update_user,
  domestic_overseas, item_subcategory, importance, managing_department, manager,
  item_category, item_midcategory, shipping_type, is_main_item, is_set_item,
  is_bom_registered, has_process_materials, lot_control, serial_control, asset_category,
  inspection_target, shelf_life_type, shelf_life_period, sm_asset_grp, default_supplier,
  vat_type, sale_price_includes_vat, attachment, image_url, main_name, main_code, main_spec,
  product_code, name_kr, spec, name_en, remarks, unit, item_subdivision, keywords_alias,
  specification, special_notes, cas_no, moq, package_unit, manufacturer, country_of_manufacture,
  source_of_origin_method, plant_part, country_of_origin, nmpa_no, allergen, furocoumarins,
  efficacy, patent, paper, clinical, expiration_date, storage_location, storage_method1,
  stability_note1, storage_note1, safety_handling1, notice_coa3_en_1, notice_coa3_kr_1,
  notice_comp_kr_1, notice_comp_en_1, caution_origin_1, cert_organic, cert_kosher, cert_halal,
  cert_vegan, cert_isaaa, cert_rspo, cert_reach, expiration_date2, storage_method2,
  stability_note2, storage_note2, safety_handling2, notice_coa3_en_2, notice_coa3_kr_2,
  notice_comp_kr_2, notice_comp_en_2, caution_origin_2,
  id, category, status, attrs, created_at, updated_at, created_by, updated_by,
  created_by_name, updated_by_name
)
select
  item_status, reg_date, reg_user, last_update_date, last_update_user,
  domestic_overseas, item_subcategory, importance, managing_department, manager,
  item_category, item_midcategory, shipping_type, is_main_item, is_set_item,
  is_bom_registered, has_process_materials, lot_control, serial_control,
  coalesce(asset_category, 'unspecified') as asset_category,
  inspection_target, shelf_life_type, shelf_life_period, sm_asset_grp, default_supplier,
  vat_type, sale_price_includes_vat, attachment, image_url, main_name, main_code, main_spec,
  product_code, coalesce(name_kr, product_code) as name_kr, spec, name_en, remarks, unit, item_subdivision, keywords_alias,
  specification, special_notes, cas_no, moq, package_unit, manufacturer, country_of_manufacture,
  source_of_origin_method, plant_part, country_of_origin, nmpa_no, allergen, furocoumarins,
  efficacy, patent, paper, clinical, expiration_date, storage_location, storage_method1,
  stability_note1, storage_note1, safety_handling1, notice_coa3_en_1, notice_coa3_kr_1,
  notice_comp_kr_1, notice_comp_en_1, caution_origin_1, cert_organic, cert_kosher, cert_halal,
  cert_vegan, cert_isaaa, cert_rspo, cert_reach, expiration_date2, storage_method2,
  stability_note2, storage_note2, safety_handling2, notice_coa3_en_2, notice_coa3_kr_2,
  notice_comp_kr_2, notice_comp_en_2, caution_origin_2,
  id, category, status, attrs, created_at, updated_at, created_by, updated_by,
  created_by_name, updated_by_name
from public.products_old;

-- 5) Recreate FK dependency
alter table public.product_compositions
  add constraint product_compositions_product_id_fkey
  foreign key (product_id) references public.products(id) on delete cascade;

-- 6) RLS + policies (idempotent)
alter table public.products enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='products' and policyname='products_read'
  ) then
    create policy products_read on public.products for select to authenticated using (true);
  end if;
  if to_regprocedure('public.is_admin()') is not null then
    if not exists (
      select 1 from pg_policies where schemaname='public' and tablename='products' and policyname='products_write'
    ) then
      create policy products_write on public.products for all to authenticated using (is_admin()) with check (is_admin());
    end if;
  end if;
end $$;

-- 7) Recreate audit trigger
create trigger trg_products_audit
before insert or update on public.products
for each row execute function set_audit_fields();

-- 8) Drop old table
drop table if exists public.products_old;

commit;


