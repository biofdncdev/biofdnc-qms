-- Extend notifications access to staff and manager (in addition to admin)
-- 1) Helper functions
create or replace function public.is_staff_or_above(p_user uuid)
returns boolean language sql stable as $$
  select coalesce((select role in ('admin','manager','staff') from public.users where id = p_user), false);
$$;

create or replace function public.is_staff_or_above()
returns boolean language sql stable as $$
  select public.is_staff_or_above(auth.uid());
$$;

-- 2) Update RLS policies on notifications
do $$
begin
  -- Drop old admin-only read policy if present
  if exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'notifications' and policyname = 'notifications_read_admin'
  ) then
    drop policy "notifications_read_admin" on public.notifications;
  end if;

  -- Create new read policy for staff and above
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'notifications' and policyname = 'notifications_read_staff'
  ) then
    create policy "notifications_read_staff"
      on public.notifications
      for select
      to authenticated
      using ( public.is_staff_or_above() );
  end if;

  -- Drop old admin-only update policy if present
  if exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'notifications' and policyname = 'notifications_update_admin'
  ) then
    drop policy "notifications_update_admin" on public.notifications;
  end if;

  -- Create new update policy for staff and above (allow marking read)
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'notifications' and policyname = 'notifications_update_staff'
  ) then
    create policy "notifications_update_staff"
      on public.notifications
      for update
      to authenticated
      using ( public.is_staff_or_above() )
      with check ( public.is_staff_or_above() );
  end if;
end$$;


