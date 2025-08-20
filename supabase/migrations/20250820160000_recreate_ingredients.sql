-- Recreate ingredients table with new schema

-- 1) Drop existing table (will also drop policies)
drop table if exists public.ingredients cascade;

-- 2) Create new table - all columns as text, primary key on inci_name
create table public.ingredients (
  inci_name text primary key,
  korean_name text,
  chinese_name text,
  function_en text,
  function_kr text,
  cas_no text,
  einecs_no text,
  old_korean_name text,
  scientific_name text,
  origin_abs text,
  source text,
  genetic_resources text
);

-- 3) Enable RLS
alter table public.ingredients enable row level security;

-- 4) Read policy for all authenticated users
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename  = 'ingredients'
      and policyname = 'ingredients_read'
  ) then
    create policy "ingredients_read"
      on public.ingredients
      for select
      to authenticated
      using ( true );
  end if;
end$$;

-- 5) Write policy for admins only (requires public.is_admin())
do $$
begin
  if to_regprocedure('public.is_admin()') is not null and not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename  = 'ingredients'
      and policyname = 'ingredients_write'
  ) then
    create policy "ingredients_write"
      on public.ingredients
      for all
      to authenticated
      using ( is_admin() )
      with check ( is_admin() );
  end if;
end$$;


