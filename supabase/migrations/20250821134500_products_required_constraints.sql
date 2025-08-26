-- Ensure product_code is NOT NULL UNIQUE (already unique in create, but enforce again safely)
alter table public.products
  alter column product_code set not null;

-- Backfill missing name_kr, then make NOT NULL
update public.products set name_kr = coalesce(name_kr, product_code)
where name_kr is null;

alter table public.products
  alter column name_kr set not null;










