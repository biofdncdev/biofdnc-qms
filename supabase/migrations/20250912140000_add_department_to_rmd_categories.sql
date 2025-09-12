alter table public.rmd_standard_categories
  add column if not exists department_code text null;

-- optional FK to departments.code if table exists
do $$ begin
  alter table public.rmd_standard_categories
    add constraint rmd_cat_department_code_fkey foreign key (department_code)
    references public.departments(code) on update cascade on delete set null;
exception when others then null; end $$;


