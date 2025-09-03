-- Allow anon role to insert into rmd_pdfs (Storage API typically uses anon or authenticated JWT)
do $$ begin
  if exists (select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='rmd_pdfs_insert_public') then
    drop policy rmd_pdfs_insert_public on storage.objects;
  end if;
end $$;

create policy rmd_pdfs_insert_anon on storage.objects
  for insert to anon
  with check ( bucket_id = 'rmd_pdfs' );

-- Keep authenticated insert too, if missing
do $$ begin
  if not exists (select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='rmd_pdfs_insert_auth') then
    create policy rmd_pdfs_insert_auth on storage.objects
      for insert to authenticated
      with check ( bucket_id = 'rmd_pdfs' );
  end if;
end $$;


