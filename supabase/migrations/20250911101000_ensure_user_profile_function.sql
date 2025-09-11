-- Function to ensure user profile exists in public.users table
-- Called after force confirm to guarantee profile exists

create or replace function public.ensure_user_profile(user_id uuid)
returns void
language plpgsql
security definer
as $$
declare
  v_email text;
  v_name text;
  v_now timestamptz := now();
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
  insert into public.users (
    id, 
    email, 
    name, 
    role, 
    status, 
    created_at, 
    updated_at, 
    last_sign_in_at
  )
  values (
    user_id, 
    v_email, 
    coalesce(v_name, v_email),
    'viewer',
    'active',
    v_now,
    v_now,
    v_now  -- Mark as confirmed by setting last_sign_in_at
  )
  on conflict (id) do update
  set 
    email = excluded.email,
    name = coalesce(public.users.name, excluded.name),
    status = 'active',
    updated_at = v_now,
    last_sign_in_at = coalesce(public.users.last_sign_in_at, v_now);
end;$$;

grant execute on function public.ensure_user_profile(uuid) to authenticated;
