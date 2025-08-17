-- Givaudan audit per-item progress and resources

create table if not exists public.givaudan_audit_progress (
  number int primary key references public.givaudan_audit_assessment(number) on delete cascade,
  note text,
  status text check (status in ('pending','in-progress','on-hold','na','impossible','done')),
  departments text[] default '{}',
  updated_by uuid,
  updated_by_name text,
  updated_at timestamptz default now()
);

create table if not exists public.givaudan_audit_resources (
  id uuid primary key default gen_random_uuid(),
  number int references public.givaudan_audit_assessment(number) on delete cascade,
  name text not null,
  type text, -- Regulation / IR / External / Manual
  url text, -- link to standard/record route or external link
  file_url text, -- uploaded file public url
  created_at timestamptz default now()
);

-- RLS
alter table public.givaudan_audit_progress enable row level security;
alter table public.givaudan_audit_resources enable row level security;

-- Everyone authenticated can read
create policy if not exists "givaudan_progress_read" on public.givaudan_audit_progress
  for select using ( auth.role() = 'authenticated' );
create policy if not exists "givaudan_resources_read" on public.givaudan_audit_resources
  for select using ( auth.role() = 'authenticated' );

-- Only admins can write (assumes is_admin() helper exists)
create policy if not exists "givaudan_progress_write" on public.givaudan_audit_progress
  for all to authenticated using ( is_admin() ) with check ( is_admin() );
create policy if not exists "givaudan_resources_write" on public.givaudan_audit_resources
  for all to authenticated using ( is_admin() ) with check ( is_admin() );


