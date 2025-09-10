-- Supabase Dashboard SQL Editor에서 실행할 SQL
-- 원격 마이그레이션 히스토리 테이블의 날짜를 수정합니다

-- 1. 먼저 현재 마이그레이션 히스토리 확인
select * from supabase_migrations.schema_migrations 
where version like '202509%' 
order by version;

-- 2. 9월 26일 마이그레이션들을 9월 8일로 변경
UPDATE supabase_migrations.schema_migrations 
SET version = '20250908120000'
WHERE version = '20250926120000';

UPDATE supabase_migrations.schema_migrations 
SET version = '20250908121500'
WHERE version = '20250926121500';

UPDATE supabase_migrations.schema_migrations 
SET version = '20250908123000'
WHERE version = '20250926123000';

UPDATE supabase_migrations.schema_migrations 
SET version = '20250908124000'
WHERE version = '20250926124000';

UPDATE supabase_migrations.schema_migrations 
SET version = '20250908124500'
WHERE version = '20250926124500';

UPDATE supabase_migrations.schema_migrations 
SET version = '20250908130000'
WHERE version = '20250926130000';

UPDATE supabase_migrations.schema_migrations 
SET version = '20250908140000'
WHERE version = '20250926140000';

-- 3. 9월 10일 잘못된 형식 마이그레이션 제거 (있다면)
DELETE FROM supabase_migrations.schema_migrations 
WHERE version = '20250910';

-- 4. 변경 후 확인
select * from supabase_migrations.schema_migrations 
where version like '202509%' 
order by version;

-- 5. admin_list_users_with_confirm 함수 수정
-- 모든 auth.users를 표시하도록 수정

drop function if exists public.admin_list_users_with_confirm();

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
  
  -- auth.users를 기준으로 모든 사용자 반환
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

revoke all on function public.admin_list_users_with_confirm() from public;
grant execute on function public.admin_list_users_with_confirm() to authenticated;

-- 6. ensure_user_profile 함수 생성
create or replace function public.ensure_user_profile(user_id uuid)
returns void
language plpgsql
security definer
as $$
declare
  v_email text;
  v_name text;
begin
  -- auth.users에서 사용자 정보 가져오기
  select email, raw_user_meta_data->>'name' 
  into v_email, v_name
  from auth.users 
  where id = user_id;
  
  if v_email is null then
    raise exception 'User not found';
  end if;
  
  -- public.users에 프로필 생성 또는 업데이트
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
