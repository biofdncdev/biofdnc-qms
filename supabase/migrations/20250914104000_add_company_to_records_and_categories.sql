-- Add company_code to rmd_standard_categories and rmd_records for prefixing and filtering
do $$ begin
  -- Categories
  if not exists (
    select 1 from information_schema.columns 
    where table_schema='public' and table_name='rmd_standard_categories' and column_name='company_code'
  ) then
    alter table public.rmd_standard_categories add column company_code text null;
  end if;

  -- Records registry
  if not exists (
    select 1 from information_schema.columns 
    where table_schema='public' and table_name='rmd_records' and column_name='company_code'
  ) then
    alter table public.rmd_records add column company_code text null;
  end if;
end $$;

-- Helpful indexes
do $$ begin
  create index if not exists idx_rmd_cat_company on public.rmd_standard_categories(company_code);
  create index if not exists idx_rmd_rec_company on public.rmd_records(company_code);
exception when others then null; end $$;


