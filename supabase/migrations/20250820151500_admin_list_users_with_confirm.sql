-- Admin: list users with email confirmation status (join auth.users)

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
  return query
    select u.id, u.name, u.email, u.created_at, u.updated_at, u.last_sign_in_at, u.is_online, u.status, u.role, au.email_confirmed_at
    from public.users u
    left join auth.users au on au.id = u.id
    order by u.created_at desc;
end;$$;

revoke all on function public.admin_list_users_with_confirm() from public;
grant execute on function public.admin_list_users_with_confirm() to authenticated;


