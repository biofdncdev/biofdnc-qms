-- 0) Admin role mapping table (optional but recommended)
create table if not exists public.user_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('admin'))
);

-- 1) Create no-arg is_admin() helper if missing
do $do$
begin
  if not exists (
    select 1
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where p.proname = 'is_admin'
      and n.nspname = 'public'
      and pg_get_function_arguments(p.oid) = ''
  ) then
    execute $ddl$
      create or replace function public.is_admin()
      returns boolean
      language sql
      stable
      as $body$
        select exists (
          select 1
          from public.user_roles ur
          where ur.user_id = auth.uid()
            and ur.role    = 'admin'
        );
      $body$;
    $ddl$;
  end if;

  -- 2) If ingredients table exists and write policy is missing, and is_admin() is available, create the policy now
  if to_regclass('public.ingredients') is not null
     and to_regprocedure('public.is_admin()') is not null
     and not exists (
       select 1 from pg_policies
       where schemaname = 'public' and tablename = 'ingredients' and policyname = 'ingredients_write'
     ) then
    execute $ddl$
      create policy "ingredients_write"
        on public.ingredients
        for all
        to authenticated
        using ( is_admin() )
        with check ( is_admin() );
    $ddl$;
  end if;
end
$do$;


