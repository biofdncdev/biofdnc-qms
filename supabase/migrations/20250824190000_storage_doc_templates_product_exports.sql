-- Create storage buckets for document templates and generated product exports
-- Buckets are private by default; authenticated users can read/write via RLS policies below.

-- 1) Buckets
insert into storage.buckets (id, name, public)
values ('doc_templates', 'doc_templates', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('product_exports', 'product_exports', false)
on conflict (id) do nothing;

-- 2) Policies for doc_templates (allow any authenticated user to read/write)
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'doc_templates_read_authenticated'
  ) then
    create policy "doc_templates_read_authenticated" on storage.objects
      for select to authenticated
      using (bucket_id = 'doc_templates');
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'doc_templates_insert_authenticated'
  ) then
    create policy "doc_templates_insert_authenticated" on storage.objects
      for insert to authenticated
      with check (bucket_id = 'doc_templates');
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'doc_templates_update_authenticated'
  ) then
    create policy "doc_templates_update_authenticated" on storage.objects
      for update to authenticated
      using (bucket_id = 'doc_templates')
      with check (bucket_id = 'doc_templates');
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'doc_templates_delete_authenticated'
  ) then
    create policy "doc_templates_delete_authenticated" on storage.objects
      for delete to authenticated
      using (bucket_id = 'doc_templates');
  end if;
end $$;

-- 3) Policies for product_exports (allow authenticated users to create/read downloads)
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'product_exports_read_authenticated'
  ) then
    create policy "product_exports_read_authenticated" on storage.objects
      for select to authenticated
      using (bucket_id = 'product_exports');
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'product_exports_insert_authenticated'
  ) then
    create policy "product_exports_insert_authenticated" on storage.objects
      for insert to authenticated
      with check (bucket_id = 'product_exports');
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'product_exports_update_authenticated'
  ) then
    create policy "product_exports_update_authenticated" on storage.objects
      for update to authenticated
      using (bucket_id = 'product_exports')
      with check (bucket_id = 'product_exports');
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'product_exports_delete_authenticated'
  ) then
    create policy "product_exports_delete_authenticated" on storage.objects
      for delete to authenticated
      using (bucket_id = 'product_exports');
  end if;
end $$;

-- Note: If public access is desired for downloads without auth, set the bucket to public=true
-- or create signed URLs from the application side (recommended).


