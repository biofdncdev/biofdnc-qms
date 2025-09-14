-- Ensure RLS and basic policies so that authenticated users can see records

alter table if exists public.rmd_records enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='rmd_records' and policyname='rmd_records_select_auth'
  ) then
    create policy "rmd_records_select_auth" on public.rmd_records for select to authenticated using (true);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='rmd_records' and policyname='rmd_records_insert_auth'
  ) then
    create policy "rmd_records_insert_auth" on public.rmd_records for insert to authenticated with check (true);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='rmd_records' and policyname='rmd_records_update_auth'
  ) then
    create policy "rmd_records_update_auth" on public.rmd_records for update to authenticated using (true) with check (true);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='rmd_records' and policyname='rmd_records_delete_auth'
  ) then
    create policy "rmd_records_delete_auth" on public.rmd_records for delete to authenticated using (true);
  end if;
end $$;


