-- Companies master (for document prefixes, ownership, etc.)
create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_companies_code on public.companies using btree (code);
create index if not exists idx_companies_name on public.companies using btree (name);

-- touch-up trigger to maintain updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$ begin new.updated_at = now(); return new; end $$;
do $$ begin
  if not exists (select 1 from pg_trigger where tgname = 'companies_set_updated_at') then
    create trigger companies_set_updated_at before update on public.companies
      for each row execute function public.set_updated_at();
  end if;
end $$;

-- RLS policies (open to authenticated; admin can tighten later)
alter table public.companies enable row level security;
do $$ begin
  create policy companies_select on public.companies for select to authenticated using (true);
  create policy companies_insert on public.companies for insert to authenticated with check (true);
  create policy companies_update on public.companies for update to authenticated using (true) with check (true);
  create policy companies_delete on public.companies for delete to authenticated using (true);
exception when others then null; end $$;


