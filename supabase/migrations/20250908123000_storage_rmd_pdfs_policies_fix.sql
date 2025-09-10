-- Relax and correct RLS policies for rmd_pdfs bucket
-- Drop previous policies if present
do $$ begin
  if exists (select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='rmd_pdfs_insert') then
    drop policy rmd_pdfs_insert on storage.objects;
  end if;
  if exists (select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='rmd_pdfs_update') then
    drop policy rmd_pdfs_update on storage.objects;
  end if;
  if exists (select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='rmd_pdfs_delete') then
    drop policy rmd_pdfs_delete on storage.objects;
  end if;
end $$;

-- Allow any authenticated user to insert into rmd_pdfs
create policy rmd_pdfs_insert_auth on storage.objects
  for insert to authenticated
  with check ( bucket_id = 'rmd_pdfs' );

-- Allow owner to update their own files in rmd_pdfs
create policy rmd_pdfs_update_own on storage.objects
  for update to authenticated
  using ( bucket_id = 'rmd_pdfs' and owner = auth.uid() )
  with check ( bucket_id = 'rmd_pdfs' and owner = auth.uid() );

-- Allow owner to delete their own files in rmd_pdfs
create policy rmd_pdfs_delete_own on storage.objects
  for delete to authenticated
  using ( bucket_id = 'rmd_pdfs' and owner = auth.uid() );


