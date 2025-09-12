create table if not exists public.departments (
  id uuid primary key,
  name text not null,
  code text not null unique,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_departments_name on public.departments using btree (name);
create index if not exists idx_departments_code on public.departments using btree (code);

alter table public.departments enable row level security;

do $$ begin
  create policy dept_select on public.departments for select to authenticated using (true);
  create policy dept_insert on public.departments for insert to authenticated with check (true);
  create policy dept_update on public.departments for update to authenticated using (true) with check (true);
  create policy dept_delete on public.departments for delete to authenticated using (true);
exception when others then null; end $$;


