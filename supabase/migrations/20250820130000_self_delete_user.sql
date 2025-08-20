-- Allow authenticated users to delete their own account and profile
-- Requires vault secret 'service_role_jwt' to be configured (already used by admin_delete_user)

create or replace function public.self_delete_user(confirm_email text)
returns json language plpgsql security definer as $$
declare
  uid uuid := auth.uid();
  srv_jwt text;
  base_url text := current_setting('app.settings.supabase_url', true);
  user_email text;
  http_status int;
  http_resp json;
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;

  select email into user_email from auth.users where id = uid;
  if user_email is null then
    raise exception 'user not found';
  end if;
  if lower(coalesce(confirm_email,'')) <> lower(user_email) then
    raise exception 'email mismatch';
  end if;

  -- Remove from app tables first to block further access even if auth deletion fails
  delete from public.user_roles where user_id = uid;
  delete from public.users where id = uid;

  -- Delete from auth.users via Admin API
  srv_jwt := (select secret from extensions.vault.get_secret('service_role_jwt'));
  if srv_jwt is null or base_url is null then
    -- Missing configuration; return partial success and notify admins
    insert into public.notifications(type, title, message)
    values('delete_failed','회원 탈퇴 처리 실패','관리자 인증 설정 누락으로 auth 계정 삭제에 실패했습니다. 수동 삭제 필요.');
    return json_build_object('ok', true, 'auth_deleted', false);
  end if;

  select (r).status, (r).content::json into http_status, http_resp
  from (
    select extensions.http('DELETE', base_url || '/auth/v1/admin/users/' || uid::text, null,
           ARRAY[
             extensions.http_header('Authorization','Bearer '||srv_jwt),
             extensions.http_header('apikey', srv_jwt)
           ]) as r
  ) s;

  if http_status between 200 and 299 then
    return json_build_object('ok', true, 'auth_deleted', true);
  else
    insert into public.notifications(type, title, message)
    values('delete_failed','회원 탈퇴 처리 실패','Auth 사용자 삭제 API 호출 실패(상태: '||http_status||'). 수동 삭제 필요.');
    return json_build_object('ok', true, 'auth_deleted', false, 'status', http_status, 'resp', http_resp);
  end if;
end;$$;

revoke all on function public.self_delete_user(text) from public;
grant execute on function public.self_delete_user(text) to authenticated;


