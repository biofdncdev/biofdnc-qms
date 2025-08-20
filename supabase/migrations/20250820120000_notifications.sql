-- Notifications table for admin alerts (e.g., new signup requests)
create table if not exists public.notifications (
  id bigserial primary key,
  type text, -- e.g., 'signup'
  title text,
  message text not null,
  link text, -- optional deep link like '/app/admin/roles'
  actor_email text,
  actor_name text,
  created_at timestamptz not null default now(),
  read_at timestamptz
);

-- Enable RLS
alter table public.notifications enable row level security;

-- Read policy: only admins can read notifications
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'notifications' and policyname = 'notifications_read_admin'
  ) then
    create policy "notifications_read_admin"
      on public.notifications
      for select
      to authenticated
      using ( is_admin() );
  end if;
end$$;

-- Insert policy: allow anyone (anon or authenticated) to insert a notification (used by signup flow)
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'notifications' and policyname = 'notifications_insert_any'
  ) then
    create policy "notifications_insert_any"
      on public.notifications
      for insert
      to anon, authenticated
      with check ( true );
  end if;
end$$;

-- Update policy: only admins can mark as read
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'notifications' and policyname = 'notifications_update_admin'
  ) then
    create policy "notifications_update_admin"
      on public.notifications
      for update
      to authenticated
      using ( is_admin() )
      with check ( is_admin() );
  end if;
end$$;

-- Optional helper to mark all notifications as read
create or replace function public.mark_all_notifications_read()
returns void language sql security definer as $$
  update public.notifications set read_at = now() where read_at is null;
$$;

revoke all on function public.mark_all_notifications_read() from public;
grant execute on function public.mark_all_notifications_read() to authenticated;


