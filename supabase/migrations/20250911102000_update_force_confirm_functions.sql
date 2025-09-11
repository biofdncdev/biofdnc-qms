-- Update admin_force_confirm to work without vault/http extensions
-- This ensures the existing function also works properly

create or replace function public.admin_force_confirm(user_id uuid)
returns json language plpgsql security definer as $$
declare
  v_email text;
  v_name text;
  v_now timestamptz := now();
begin
  if not public.is_admin(auth.uid()) then 
    raise exception 'only admin'; 
  end if;
  
  -- Get user info from auth.users
  select email, raw_user_meta_data->>'name' 
  into v_email, v_name
  from auth.users 
  where id = user_id;
  
  if v_email is null then
    raise exception 'User not found';
  end if;
  
  -- Ensure profile exists in public.users with confirmed status
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
    v_now -- Mark as confirmed
  )
  on conflict (id) do update
  set 
    email = excluded.email,
    name = coalesce(public.users.name, excluded.name),
    status = 'active',
    updated_at = v_now,
    last_sign_in_at = coalesce(public.users.last_sign_in_at, v_now);
  
  return json_build_object(
    'success', true,
    'user_id', user_id,
    'message', 'User confirmed and profile ensured'
  );
end;$$;
