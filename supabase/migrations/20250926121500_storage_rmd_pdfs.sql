-- Storage bucket for Record PDFs
insert into storage.buckets (id, name, public)
values ('rmd_pdfs', 'rmd_pdfs', true)
on conflict (id) do nothing;

-- Allow read (public bucket already readable), allow authenticated users to insert/update/delete within this bucket
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'rmd_pdfs_insert'
  ) then
    create policy rmd_pdfs_insert on storage.objects
      for insert
      with check ( bucket_id = 'rmd_pdfs' and auth.role() = 'authenticated' );
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'rmd_pdfs_update'
  ) then
    create policy rmd_pdfs_update on storage.objects
      for update
      using ( bucket_id = 'rmd_pdfs' and auth.role() = 'authenticated' )
      with check ( bucket_id = 'rmd_pdfs' and auth.role() = 'authenticated' );
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'rmd_pdfs_delete'
  ) then
    create policy rmd_pdfs_delete on storage.objects
      for delete
      using ( bucket_id = 'rmd_pdfs' and auth.role() = 'authenticated' );
  end if;
end $$;


