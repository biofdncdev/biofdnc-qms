-- Broaden insert policy for rmd_pdfs to allow uploads without login (anon)
do $$ begin
  if exists (select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='rmd_pdfs_insert_auth') then
    drop policy rmd_pdfs_insert_auth on storage.objects;
  end if;
end $$;

create policy rmd_pdfs_insert_public on storage.objects
  for insert to public
  with check ( bucket_id = 'rmd_pdfs' );


