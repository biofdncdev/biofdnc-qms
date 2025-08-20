-- Replace previous sync trigger: only create profile after email is confirmed

-- Drop old trigger/function if present
do $$
begin
  if exists (
    select 1 from pg_trigger t join pg_class c on c.oid=t.tgrelid
    join pg_namespace n on n.oid=c.relnamespace
    where n.nspname='auth' and c.relname='users' and t.tgname='on_auth_user_created'
  ) then
    execute 'drop trigger on_auth_user_created on auth.users';
  end if;
  if exists (
    select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace
    where n.nspname='public' and p.proname='sync_user_from_auth'
  ) then
    execute 'drop function public.sync_user_from_auth()';
  end if;
end$$;

create or replace function public.sync_user_on_confirm()
returns trigger
language plpgsql
security definer
as $$
begin
  if NEW.email_confirmed_at is not null then
    insert into public.users(id, email, name, role, status, is_online, created_at, updated_at)
    values(NEW.id, lower(coalesce(NEW.email,'')), coalesce(NEW.raw_user_meta_data->>'name', split_part(coalesce(NEW.email,''),'@',1)), 'viewer', 'active', false, now(), now())
    on conflict (id) do update set
      email = excluded.email,
      name = excluded.name,
      updated_at = now();
  end if;
  return NEW;
end;$$;

drop trigger if exists on_auth_user_confirmed on auth.users;
create trigger on_auth_user_confirmed
after update on auth.users
for each row execute function public.sync_user_on_confirm();


