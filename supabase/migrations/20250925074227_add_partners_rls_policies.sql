-- Enable RLS on partners table and add policies

-- Enable RLS
alter table public.partners enable row level security;

-- Policy: Staff and above can read all partners
create policy "Partners read for staff and above" on public.partners
  for select
  to authenticated
  using (
    exists (
      select 1 from public.users
      where id = auth.uid()
        and role in ('admin', 'manager', 'staff')
    )
  );

-- Policy: Staff and above can insert/update partners
create policy "Partners write for staff and above" on public.partners
  for all
  to authenticated
  using (
    exists (
      select 1 from public.users
      where id = auth.uid()
        and role in ('admin', 'manager', 'staff')
    )
  )
  with check (
    exists (
      select 1 from public.users
      where id = auth.uid()
        and role in ('admin', 'manager', 'staff')
    )
  );

-- Policy: Admin can delete partners
create policy "Partners delete for admin" on public.partners
  for delete
  to authenticated
  using (
    exists (
      select 1 from public.users
      where id = auth.uid()
        and role = 'admin'
    )
  );
