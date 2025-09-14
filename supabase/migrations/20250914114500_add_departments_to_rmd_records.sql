alter table public.rmd_records add column if not exists departments text[] null;
create index if not exists idx_rmd_records_departments on public.rmd_records using gin (departments);

