-- Ingredients master table
-- All business columns are stored as text; primary key is inci_name

create table if not exists public.ingredients (
  inci_name text primary key,
  korean_name text,
  common_name text,
  synonyms text,
  cas_no text,
  ec_no text,
  category text,
  origin text,
  functions text,
  regulation text,
  description text,
  note text
);

-- RLS
alter table public.ingredients enable row level security;

-- Everyone authenticated can read
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

-- Only admins can write (assumes is_admin() helper exists)
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename  = 'ingredients'
      and policyname = 'ingredients_write'
  ) then
    -- Create write policy only if is_admin() exists; otherwise skip (writes denied by default under RLS)
    if to_regprocedure('public.is_admin()') is not null then
      create policy "ingredients_write"
        on public.ingredients
        for all
        to authenticated
        using ( is_admin() )
        with check ( is_admin() );
    end if;
  end if;
end$$;



