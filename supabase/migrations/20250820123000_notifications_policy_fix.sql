-- Broaden notifications read policy to also allow admins determined via public.users.role
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='notifications' and policyname='notifications_read_admin_users_role'
  ) then
    create policy "notifications_read_admin_users_role"
      on public.notifications
      for select
      to authenticated
      using (
        coalesce(public.is_admin(auth.uid()), false)
        or exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin')
      );
  end if;
end$$;


