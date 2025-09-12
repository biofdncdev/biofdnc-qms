-- RMD standard categories
create table if not exists public.rmd_standard_categories (
  id text primary key,
  name text not null,
  doc_prefix text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RMD records registry
create table if not exists public.rmd_records (
  id uuid primary key,
  title text not null,
  category_id text not null references public.rmd_standard_categories(id) on delete restrict,
  doc_no text not null unique,
  created_by uuid null,
  created_by_name text null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Helpful index for prefix search on doc_no
create index if not exists idx_rmd_records_doc_no on public.rmd_records (doc_no);

-- RLS
alter table public.rmd_standard_categories enable row level security;
alter table public.rmd_records enable row level security;

do $$ begin
  create policy rmd_cat_select on public.rmd_standard_categories for select to authenticated using (true);
  create policy rmd_cat_insert on public.rmd_standard_categories for insert to authenticated with check (true);
  create policy rmd_cat_update on public.rmd_standard_categories for update to authenticated using (true) with check (true);
  create policy rmd_cat_delete on public.rmd_standard_categories for delete to authenticated using (true);
exception when others then null; end $$;

do $$ begin
  create policy rmd_rec_select on public.rmd_records for select to authenticated using (true);
  create policy rmd_rec_insert on public.rmd_records for insert to authenticated with check (true);
  create policy rmd_rec_update on public.rmd_records for update to authenticated using (true) with check (true);
  create policy rmd_rec_delete on public.rmd_records for delete to authenticated using (true);
exception when others then null; end $$;


