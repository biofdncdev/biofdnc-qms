alter table public.rmd_records add column if not exists features jsonb null;
create index if not exists idx_rmd_records_features on public.rmd_records using gin (features);

