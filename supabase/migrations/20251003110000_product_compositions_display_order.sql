-- Add display_order column to product_compositions to preserve user-defined order
-- When null or 0, compositions should be sorted by percent desc (legacy behavior)

alter table if exists public.product_compositions
  add column if not exists display_order integer;

comment on column public.product_compositions.display_order is 'User-defined display order (null/0 = sort by percent desc)';

-- Create index for efficient ordering queries
create index if not exists product_compositions_display_order_idx 
  on public.product_compositions(product_id, display_order);

-- Optional: Initialize existing rows with null (default behavior - sort by percent)
-- No need to set values as null is the default


