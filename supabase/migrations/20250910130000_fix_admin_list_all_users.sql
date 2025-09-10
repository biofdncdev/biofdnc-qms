-- Fix: Show all auth users in admin panel, even without profile

-- Drop existing function
drop function if exists public.admin_list_users_with_confirm();

-- Create improved function that shows ALL auth users
create or replace function public.admin_list_users_with_confirm()
returns table (
  id uuid,
  name text,
  email text,
  created_at timestamptz,
  updated_at timestamptz,
  last_sign_in_at timestamptz,
  is_online boolean,
  status text,
  role text,
  email_confirmed_at timestamptz
)
language plpgsql
security definer
as $$
begin
  if not public.is_admin(auth.uid()) then
    raise exception 'only admin';
  end if;
  
  -- Return ALL auth users, with or without profile
  return query
    select 
      au.id,
      coalesce(u.name, au.raw_user_meta_data->>'name', au.email) as name,
      au.email,
      coalesce(u.created_at, au.created_at) as created_at,
      coalesce(u.updated_at, au.updated_at) as updated_at,
      coalesce(u.last_sign_in_at, au.last_sign_in) as last_sign_in_at,
      coalesce(u.is_online, false) as is_online,
      coalesce(u.status, 'active') as status,
      coalesce(u.role, 'viewer') as role,
      au.email_confirmed_at
    from auth.users au
    left join public.users u on u.id = au.id
    order by au.created_at desc;
end;$$;

-- Grant permissions
revoke all on function public.admin_list_users_with_confirm() from public;
grant execute on function public.admin_list_users_with_confirm() to authenticated;

-- Create function to ensure user profile exists
create or replace function public.ensure_user_profile(user_id uuid)
returns void
language plpgsql
security definer
as $$
declare
  v_email text;
  v_name text;
begin
  -- Get user info from auth.users
  select email, raw_user_meta_data->>'name' 
  into v_email, v_name
  from auth.users 
  where id = user_id;
  
  if v_email is null then
    raise exception 'User not found';
  end if;
  
  -- Insert or update profile
  insert into public.users (id, email, name, role, status, created_at, updated_at)
  values (
    user_id, 
    v_email, 
    coalesce(v_name, v_email),
    'viewer',
    'active',
    now(),
    now()
  )
  on conflict (id) do update
  set 
    email = excluded.email,
    name = coalesce(public.users.name, excluded.name),
    updated_at = now();
end;$$;

grant execute on function public.ensure_user_profile(uuid) to authenticated;
