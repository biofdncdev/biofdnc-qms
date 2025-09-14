-- Enable RLS on record_form_meta table
alter table public.record_form_meta enable row level security;

-- Create policies for record_form_meta
-- Allow all authenticated users to read
create policy "record_form_meta_select" on public.record_form_meta
  for select
  to authenticated
  using (true);

-- Allow all authenticated users to insert
create policy "record_form_meta_insert" on public.record_form_meta
  for insert
  to authenticated
  with check (true);

-- Allow all authenticated users to update
create policy "record_form_meta_update" on public.record_form_meta
  for update
  to authenticated
  using (true)
  with check (true);

-- Allow all authenticated users to delete
create policy "record_form_meta_delete" on public.record_form_meta
  for delete
  to authenticated
  using (true);
