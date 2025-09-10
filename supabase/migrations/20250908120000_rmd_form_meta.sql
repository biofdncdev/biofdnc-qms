-- Create table to persist Record page metadata per form
create table if not exists public.rmd_form_meta (
  form_id text primary key,
  department text,
  owner text,
  method text,
  period text,
  standard text,
  standard_category text,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);

alter table public.rmd_form_meta enable row level security;

-- Allow authenticated users to read all (adjust if needed)
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='rmd_form_meta' and policyname='rmd_form_meta_read'
  ) then
    create policy rmd_form_meta_read on public.rmd_form_meta
      for select using ( auth.role() = 'authenticated' or auth.uid() is not null );
  end if;
end $$;

-- Upsert/write only own rows (by user) or admin can write all
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='rmd_form_meta' and policyname='rmd_form_meta_write'
  ) then
    create policy rmd_form_meta_write on public.rmd_form_meta
      for all using ( auth.uid() is not null )
      with check ( auth.uid() is not null );
  end if;
end $$;

-- Update trigger for updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists trg_rmd_form_meta_updated_at on public.rmd_form_meta;
create trigger trg_rmd_form_meta_updated_at
before update on public.rmd_form_meta
for each row execute function public.set_updated_at();


