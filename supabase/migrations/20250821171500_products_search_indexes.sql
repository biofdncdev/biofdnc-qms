-- Speed up keyword search on products using pg_trgm indexes for ILIKE
begin;

create extension if not exists pg_trgm;

-- Individual column trigram indexes
create index if not exists idx_products_trgm_product_code on public.products using gin (product_code gin_trgm_ops);
create index if not exists idx_products_trgm_name_kr on public.products using gin (name_kr gin_trgm_ops);
create index if not exists idx_products_trgm_name_en on public.products using gin (name_en gin_trgm_ops);
create index if not exists idx_products_trgm_asset_category on public.products using gin (asset_category gin_trgm_ops);
create index if not exists idx_products_trgm_remarks on public.products using gin (remarks gin_trgm_ops);

commit;


