-- Create mapping table between sheet display labels and DB column names for products

begin;

create table if not exists public.product_column_map (
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
  constraint product_column_map_sheet_label_kr_key unique (sheet_label_kr),
  constraint product_column_map_db_column_key unique (db_column)
);

alter table public.product_column_map enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='product_column_map' and policyname='product_column_map_read'
  ) then
    create policy product_column_map_read on public.product_column_map for select to authenticated using (true);
  end if;
  if to_regprocedure('public.is_admin()') is not null then
    if not exists (
      select 1 from pg_policies where schemaname='public' and tablename='product_column_map' and policyname='product_column_map_write'
    ) then
      create policy product_column_map_write on public.product_column_map for all to authenticated using (is_admin()) with check (is_admin());
    end if;
  end if;
end $$;

-- Reuse the shared audit trigger function if present
create trigger trg_product_column_map_audit
before insert or update on public.product_column_map
for each row execute function set_audit_fields();

commit;


