-- Add optional company fields to departments for linkage
do $$ begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='departments' and column_name='company_code'
  ) then
    alter table public.departments add column company_code text null;
  end if;
  if not exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='departments' and column_name='company_name'
  ) then
    alter table public.departments add column company_name text null;
  end if;
end $$;

do $$ begin
  create index if not exists idx_departments_company_code on public.departments(company_code);
exception when others then null; end $$;


