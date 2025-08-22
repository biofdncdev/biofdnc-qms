-- Align product_column_map order with current products column order
-- and enforce required flags for key fields

begin;

-- 1) Set display_order to match products' ordinal_position
update public.product_column_map pcm
set display_order = c.ordinal_position
from information_schema.columns c
where c.table_schema = 'public'
  and c.table_name = 'products'
  and c.column_name = pcm.db_column;

-- 2) Ensure required fields
update public.product_column_map set is_required = true where db_column in ('product_code','name_kr','asset_category');

-- 3) Preferred Korean labels for the three required fields (idempotent)
update public.product_column_map set sheet_label_kr = '품번' where db_column = 'product_code';
update public.product_column_map set sheet_label_kr = '품명' where db_column = 'name_kr';
update public.product_column_map set sheet_label_kr = '품목자산분류' where db_column = 'asset_category';

commit;


