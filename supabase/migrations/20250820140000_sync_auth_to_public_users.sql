-- Create or update a profile row in public.users whenever a user signs up (row inserted into auth.users)

create or replace function public.sync_user_from_auth()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.users(id, email, name, role, status, is_online, created_at, updated_at)
  values(NEW.id, lower(coalesce(NEW.email,'')), coalesce(NEW.raw_user_meta_data->>'name', split_part(coalesce(NEW.email,''),'@',1)), 'viewer', 'active', false, now(), now())
  on conflict (id) do update set
    email = excluded.email,
    name = excluded.name,
    updated_at = now();
  return NEW;
end;$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.sync_user_from_auth();


