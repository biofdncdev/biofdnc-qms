-- Seed product_column_map from current products schema
-- - Creates default rows for all products columns (sheet_label_kr defaults to db_column)
-- - Marks required fields and sets preferred display order

begin;

-- 1) Seed every column with default mapping if missing
insert into public.product_column_map (sheet_label_kr, db_column, is_required, display_order)
select
  c.column_name as sheet_label_kr,
  c.column_name as db_column,
  false as is_required,
  c.ordinal_position as display_order
from information_schema.columns c
where c.table_schema = 'public'
  and c.table_name = 'products'
on conflict (db_column) do nothing;

-- 2) Apply required fields and Korean display labels for key columns
update public.product_column_map
  set sheet_label_kr = '품번', is_required = true, display_order = 1
where db_column = 'product_code';

update public.product_column_map
  set sheet_label_kr = '품명', is_required = true, display_order = 2
where db_column = 'name_kr';

update public.product_column_map
  set sheet_label_kr = '품목자산분류', is_required = true, display_order = 3
where db_column = 'asset_category';

commit;


