-- Sales tables for Rice Bran Water H (generic enough for other products via product_key)
create table if not exists public.sales_orders (
  id uuid primary key default gen_random_uuid(),
  product_key text not null,
  order_no text,
  order_date date,
  order_qty numeric,
  created_by uuid,
  created_by_name text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.sales_deliveries (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.sales_orders(id) on delete cascade,
  due_date date,
  qty numeric,
  outsource_date date,
  outsource_qty numeric,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists idx_sales_deliveries_order on public.sales_deliveries(order_id);

create table if not exists public.sales_delivery_changes (
  id uuid primary key default gen_random_uuid(),
  delivery_id uuid not null references public.sales_deliveries(id) on delete cascade,
  field text not null,
  old_value text,
  new_value text,
  changed_by uuid,
  changed_by_name text,
  changed_at timestamptz default now()
);
create index if not exists idx_sales_delivery_changes_delivery on public.sales_delivery_changes(delivery_id);


