-- Temperature & Humidity weekly annotated record storage
create table if not exists public.rmd_th_record (
  id bigserial primary key,
  form_id text not null,
  week_start date not null,
  image_url text,
  strokes jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid,
  unique(form_id, week_start)
);

do $do$
begin
  if not exists (
    select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace
    where p.proname='set_timestamp' and n.nspname='public'
  ) then
    execute $ddl$
      create or replace function public.set_timestamp()
      returns trigger
      language plpgsql
      as $fn$
      begin
        new.updated_at := now();
        return new;
      end;
      $fn$;
    $ddl$;
  end if;
end
$do$;

drop trigger if exists rmd_th_record_set_timestamp on public.rmd_th_record;
create trigger rmd_th_record_set_timestamp
before update on public.rmd_th_record
for each row execute procedure public.set_timestamp();

-- RLS
alter table public.rmd_th_record enable row level security;

-- Everyone authenticated can read
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='rmd_th_record' and policyname='rmd_th_record_select'
  ) then
    create policy "rmd_th_record_select" on public.rmd_th_record for select to authenticated using (true);
  end if;
end$$;

-- Everyone authenticated can write (adjust later if needed)
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='rmd_th_record' and policyname='rmd_th_record_write'
  ) then
    create policy "rmd_th_record_write" on public.rmd_th_record for all to authenticated using (auth.uid() is not null) with check (auth.uid() is not null);
  end if;
end$$;

