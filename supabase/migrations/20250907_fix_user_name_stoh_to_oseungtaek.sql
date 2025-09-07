-- Fix display name for specific user: change from 'stoh' to '오승택'
-- This migration updates both auth.users (raw_user_meta_data.name)
-- and public.users.name to keep them in sync with the auth -> public sync trigger.

do $$
declare
  v_uid uuid;
begin
  -- Locate user by email; adjust if email changes in the future
  select id into v_uid from auth.users where lower(email) = lower('stoh@biofdnc.com') limit 1;

  if v_uid is not null then
    -- Update auth metadata so future syncs keep '오승택'
    update auth.users
    set raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb)
                             || jsonb_build_object('name', '오승택')
    where id = v_uid;

    -- Update public profile name immediately
    update public.users
    set name = '오승택',
        updated_at = now()
    where id = v_uid;
  end if;
end $$;


