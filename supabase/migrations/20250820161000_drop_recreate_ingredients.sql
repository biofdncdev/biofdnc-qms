-- Drop and recreate public.ingredients with the agreed schema

drop table if exists public.ingredients cascade;

create table public.ingredients (
  id uuid primary key default gen_random_uuid(),
  inci_name text not null unique,
  korean_name text,
  chinese_name text,
  function_en text,
  function_kr text,
  cas_no text,
  einecs_no text,
  old_korean_name text,
  scientific_name text,
  origin_abs text
);

alter table public.ingredients enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='ingredients' and policyname='ingredients_read'
  ) then
    create policy "ingredients_read" on public.ingredients for select to authenticated using (true);
  end if;
  if to_regprocedure('public.is_admin()') is not null and not exists (
    select 1 from pg_policies where schemaname='public' and tablename='ingredients' and policyname='ingredients_write'
  ) then
    create policy "ingredients_write" on public.ingredients for all to authenticated using (is_admin()) with check (is_admin());
  end if;
end$$;


