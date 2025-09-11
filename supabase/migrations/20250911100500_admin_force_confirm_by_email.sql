-- Simplified force confirm without vault/http extensions
-- Just ensures user profile exists in public.users

create or replace function public.admin_force_confirm_by_email(p_email text)
returns json language plpgsql security definer as $$
declare
  v_user_id uuid;
  v_now timestamptz := now();
begin
  if not public.is_admin(auth.uid()) then
    raise exception 'only admin';
  end if;

  -- Find user by email from auth.users
  select id into v_user_id
  from auth.users
  where email = lower(trim(p_email))
  limit 1;

  if v_user_id is null then
    raise exception 'user not found for %', p_email;
  end if;

  -- Ensure profile exists in public.users
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
    v_user_id, 
    lower(trim(p_email)), 
    coalesce(
      (select raw_user_meta_data->>'name' from auth.users where id = v_user_id),
      lower(trim(p_email))
    ),
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

  -- Return success response
  return json_build_object(
    'success', true,
    'user_id', v_user_id,
    'email', p_email,
    'message', 'User profile ensured and marked as confirmed'
  );
end;$$;

revoke all on function public.admin_force_confirm_by_email(text) from public;
grant execute on function public.admin_force_confirm_by_email(text) to authenticated;