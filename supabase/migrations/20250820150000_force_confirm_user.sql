-- Admin-side force confirm: mark auth.users.email_confirmed_at now()
-- Requires service role vault secret and http extension, similar to admin_reset_password

create or replace function public.admin_force_confirm(user_id uuid)
returns json language plpgsql security definer as $$
declare
  srv_jwt text;
  base_url text := current_setting('app.settings.supabase_url', true);
  resp json;
begin
  if not public.is_admin(auth.uid()) then raise exception 'only admin'; end if;
  srv_jwt := (select secret from extensions.vault.get_secret('service_role_jwt'));
  resp := (select (extensions.http('PATCH', base_url || '/auth/v1/admin/users/' || user_id::text,
           json_build_object('email_confirm', true)::text,
           ARRAY[
             extensions.http_header('Authorization','Bearer '||srv_jwt),
             extensions.http_header('apikey', srv_jwt),
             extensions.http_header('Content-Type','application/json')
           ])).content::json);
  return resp;
end;$$;

revoke all on function public.admin_force_confirm(uuid) from public;
grant execute on function public.admin_force_confirm(uuid) to authenticated;


