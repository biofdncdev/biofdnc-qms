-- Ensure RLS is enabled and policies restrict access to admins only
alter table if exists public.user_roles enable row level security;

-- Select policy: only admins can read
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'user_roles' and policyname = 'user_roles_select_admin'
  ) then
    create policy "user_roles_select_admin"
      on public.user_roles
      for select
      to authenticated
      using ( is_admin() );
  end if;
end$$;

-- Write policy: only admins can insert/update/delete
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'user_roles' and policyname = 'user_roles_write_admin'
  ) then
    create policy "user_roles_write_admin"
      on public.user_roles
      for all
      to authenticated
      using ( is_admin() )
      with check ( is_admin() );
  end if;
end$$;

-- Seed admin mapping: prefer explicit email, also sync any users with admin/manager role in public.users
do $$
declare
  admin_email text := 'stoh@biofdnc.com';
begin
  -- Upsert the explicit admin by email from auth.users or public.users (whichever has it)
  insert into public.user_roles(user_id, role)
  select distinct id, 'admin' from (
    select id from auth.users where email = admin_email
    union
    select id from public.users where email = admin_email
  ) s
  on conflict (user_id) do update set role = excluded.role;

  -- Also sync any rows in public.users with admin-like roles
  if to_regclass('public.users') is not null then
    insert into public.user_roles(user_id, role)
    select id, 'admin'
    from public.users
    where (role::text) in ('admin','manager')
    on conflict (user_id) do update set role = excluded.role;
  end if;
end$$;

-- Make the uuid-arg is_admin version delegate to user_roles, so both variants share a single source of truth
create or replace function public.is_admin(p_user uuid)
returns boolean language sql stable as $$
  select exists (
    select 1 from public.user_roles where user_id = p_user and role = 'admin'
  );
$$;


