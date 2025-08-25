-- Add recipient scoping so staff users see only their own notifications

-- 1) Schema change: add recipient_user_id (nullable)
alter table if exists public.notifications
  add column if not exists recipient_user_id uuid references auth.users(id);

-- 2) Helper: get role text for a user
create or replace function public.user_role(p_user uuid)
returns text language sql stable as $$
  select role from public.users where id = p_user
$$;

-- 3) Tighten RLS policies
do $$
begin
  -- Drop previous policies if they exist
  if exists (select 1 from pg_policies where schemaname='public' and tablename='notifications' and policyname='notifications_read_staff') then
    drop policy "notifications_read_staff" on public.notifications;
  end if;
  if exists (select 1 from pg_policies where schemaname='public' and tablename='notifications' and policyname='notifications_update_staff') then
    drop policy "notifications_update_staff" on public.notifications;
  end if;

  -- Read: admins/managers can read all; staff can read only their own recipient rows
  create policy "notifications_read_scoped"
    on public.notifications
    for select
    to authenticated
    using (
      coalesce(public.user_role(auth.uid()) in ('admin','manager'), false)
      or recipient_user_id = auth.uid()
    );

  -- Update: same scope for marking as read
  create policy "notifications_update_scoped"
    on public.notifications
    for update
    to authenticated
    using (
      coalesce(public.user_role(auth.uid()) in ('admin','manager'), false)
      or recipient_user_id = auth.uid()
    )
    with check (
      coalesce(public.user_role(auth.uid()) in ('admin','manager'), false)
      or recipient_user_id = auth.uid()
    );
end$$;

-- 4) Update RPC to respect role/recipient
create or replace function public.mark_all_notifications_read()
returns void language sql security definer as $$
  update public.notifications
    set read_at = now()
  where read_at is null
    and (
      coalesce(public.user_role(auth.uid()) in ('admin','manager'), false)
      or recipient_user_id = auth.uid()
    );
$$;

revoke all on function public.mark_all_notifications_read() from public;
grant execute on function public.mark_all_notifications_read() to authenticated;


