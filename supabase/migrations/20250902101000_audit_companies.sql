create table if not exists public.audit_companies (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  note text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create index if not exists audit_companies_name_idx on public.audit_companies using btree (name);

-- simple trigger to keep updated_at fresh
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$ begin new.updated_at = now(); return new; end $$;
do $$ begin
  if not exists (select 1 from pg_trigger where tgname = 'audit_companies_set_updated_at') then
    create trigger audit_companies_set_updated_at before update on public.audit_companies
      for each row execute function public.set_updated_at();
  end if;
end $$;

