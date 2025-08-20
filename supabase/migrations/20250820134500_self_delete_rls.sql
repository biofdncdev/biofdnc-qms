-- Enable self-delete from public.users and public.user_roles via RLS

-- Users table: enable RLS and allow authenticated to delete own row
do $$
begin
  if to_regclass('public.users') is not null then
    execute 'alter table public.users enable row level security';
    if not exists (
      select 1 from pg_policies
      where schemaname='public' and tablename='users' and policyname='users_self_delete'
    ) then
      create policy "users_self_delete"
        on public.users
        for delete
        to authenticated
        using ( id = auth.uid() );
    end if;
  end if;
end$$;

-- user_roles table: allow user to delete own mapping (in addition to admin policies)
do $$
begin
  if to_regclass('public.user_roles') is not null then
    execute 'alter table public.user_roles enable row level security';
    if not exists (
      select 1 from pg_policies
      where schemaname='public' and tablename='user_roles' and policyname='user_roles_self_delete'
    ) then
      create policy "user_roles_self_delete"
        on public.user_roles
        for delete
        to authenticated
        using ( user_id = auth.uid() );
    end if;
  end if;
end$$;


