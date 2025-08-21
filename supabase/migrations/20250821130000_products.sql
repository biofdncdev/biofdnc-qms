-- Create products and product_compositions tables with audit fields

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  product_code text not null unique,
  name_kr text,
  name_en text,
  category text,
  status text,
  remarks text,
  attrs jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid,
  created_by_name text,
  updated_by_name text
);

create table if not exists public.product_compositions (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  ingredient_id uuid not null references public.ingredients(id) on delete restrict,
  percent numeric,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid,
  created_by_name text,
  updated_by_name text
);

alter table public.products enable row level security;
alter table public.product_compositions enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='products' and policyname='products_read'
  ) then
    create policy products_read on public.products for select to authenticated using (true);
  end if;
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='product_compositions' and policyname='product_compositions_read'
  ) then
    create policy product_compositions_read on public.product_compositions for select to authenticated using (true);
  end if;
  if to_regprocedure('public.is_admin()') is not null then
    if not exists (
      select 1 from pg_policies where schemaname='public' and tablename='products' and policyname='products_write'
    ) then
      create policy products_write on public.products for all to authenticated using (is_admin()) with check (is_admin());
    end if;
    if not exists (
      select 1 from pg_policies where schemaname='public' and tablename='product_compositions' and policyname='product_compositions_write'
    ) then
      create policy product_compositions_write on public.product_compositions for all to authenticated using (is_admin()) with check (is_admin());
    end if;
  end if;
end $$;

-- Audit trigger to populate by/email from JWT similar to ingredients
create or replace function public.set_audit_fields()
returns trigger language plpgsql as $$
declare jwt json; jwt_email text; begin
  begin jwt := nullif(current_setting('request.jwt.claims', true), '')::json; jwt_email := coalesce(jwt->>'email', null);
  exception when others then jwt_email := null; end;
  if (TG_OP='INSERT') then
    if new.created_at is null then new.created_at := now(); end if;
    if new.updated_at is null then new.updated_at := now(); end if;
    if new.created_by is null then new.created_by := auth.uid(); end if;
    if new.updated_by is null then new.updated_by := auth.uid(); end if;
    if new.created_by_name is null then new.created_by_name := coalesce(jwt_email, new.created_by_name); end if;
    if new.updated_by_name is null then new.updated_by_name := coalesce(jwt_email, new.updated_by_name); end if;
  else
    new.updated_at := now();
    if new.updated_by is null then new.updated_by := auth.uid(); end if;
    if new.updated_by_name is null then new.updated_by_name := coalesce(jwt_email, new.updated_by_name); end if;
  end if;
  return new; end $$;

drop trigger if exists trg_products_audit on public.products;
create trigger trg_products_audit before insert or update on public.products for each row execute procedure public.set_audit_fields();

drop trigger if exists trg_product_compositions_audit on public.product_compositions;
create trigger trg_product_compositions_audit before insert or update on public.product_compositions for each row execute procedure public.set_audit_fields();


