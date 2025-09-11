-- Admin function to completely remove signup request traces
create or replace function public.admin_delete_signup_request(p_email text)
returns void
language plpgsql
security definer
as $$
declare
  v_email_norm text;
begin
  -- Normalize email
  v_email_norm := trim(lower(p_email));
  
  -- 1. Delete from notifications
  delete from public.notifications
  where type = 'signup'
    and trim(lower(actor_email)) = v_email_norm;
  
  -- 2. Delete from public.users
  delete from public.users
  where trim(lower(email)) = v_email_norm;
  
  -- No exceptions, just silently succeed even if nothing was deleted
end;
$$;

-- Grant execute permission to authenticated users
grant execute on function public.admin_delete_signup_request(text) to authenticated;
