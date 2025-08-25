-- Allow admin/manager/staff to insert/update materials
begin;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='materials' and policyname='materials_insert_staff'
  ) then
    create policy materials_insert_staff on public.materials
      for insert to authenticated
      with check (exists (select 1 from public.users u where u.id = auth.uid() and u.role in ('admin','manager','staff')));
  end if;
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='materials' and policyname='materials_update_staff'
  ) then
    create policy materials_update_staff on public.materials
      for update to authenticated
      using (exists (select 1 from public.users u where u.id = auth.uid() and u.role in ('admin','manager','staff')))
      with check (exists (select 1 from public.users u where u.id = auth.uid() and u.role in ('admin','manager','staff')));
  end if;
end $$;

commit;


