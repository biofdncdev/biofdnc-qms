begin;

-- Relax RLS write policy on public.product_compositions to allow admin/manager/staff
-- Previously, writes were restricted to admin only, causing 403 on insert/update from the app.

do $$
begin
  if exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'product_compositions' and policyname = 'product_compositions_write'
  ) then
    execute 'drop policy product_compositions_write on public.product_compositions';
  end if;
end $$;

create policy product_compositions_write on public.product_compositions
  for all to authenticated
  using (
    exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.role in ('admin','manager','staff')
    )
  )
  with check (
    exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.role in ('admin','manager','staff')
    )
  );

commit;



