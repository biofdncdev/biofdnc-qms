create table if not exists public.rmd_record_numbers (
  doc_no text primary key,
  first_used_at timestamptz default now(),
  last_used_at timestamptz default now(),
  created_by uuid null
);
create index if not exists idx_rmd_record_numbers_doc_no on public.rmd_record_numbers using btree (doc_no);
alter table public.rmd_record_numbers enable row level security;
-- Allow read for authenticated users
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='rmd_record_numbers' and policyname='Enable read for authenticated'
  ) then
    create policy "Enable read for authenticated" on public.rmd_record_numbers for select to authenticated using (true);
  end if;
end $$;
-- Allow insert/update for authenticated (service enforces uniqueness)
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='rmd_record_numbers' and policyname='Enable write for authenticated'
  ) then
    create policy "Enable write for authenticated" on public.rmd_record_numbers for all to authenticated using (true) with check (true);
  end if;
end $$;

