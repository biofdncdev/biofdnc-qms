-- Make asset_category (품목자산분류) required on products

-- Provide a safe default for existing NULLs
alter table public.products
  alter column asset_category set default 'unspecified';

update public.products
  set asset_category = coalesce(asset_category, 'unspecified')
  where asset_category is null;

alter table public.products
  alter column asset_category set not null;





