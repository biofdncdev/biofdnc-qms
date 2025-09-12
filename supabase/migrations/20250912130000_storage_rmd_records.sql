-- Create storage bucket for non-PDF record attachments (images, office docs, HWP)
insert into storage.buckets (id, name, public)
values ('rmd_records', 'rmd_records', true)
on conflict (id) do nothing;

-- Optionally set file size and allowed mime types (skip if column not present or managed via dashboard)
-- update storage.buckets set file_size_limit = 52428800 where id = 'rmd_records';

-- RLS policies: authenticated users can write; public can read (since bucket is public)
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'rmd_records_insert'
  ) then
    create policy rmd_records_insert on storage.objects
      for insert to authenticated
      with check ( bucket_id = 'rmd_records' );
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'rmd_records_update'
  ) then
    create policy rmd_records_update on storage.objects
      for update to authenticated
      using ( bucket_id = 'rmd_records' )
      with check ( bucket_id = 'rmd_records' );
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'rmd_records_delete'
  ) then
    create policy rmd_records_delete on storage.objects
      for delete to authenticated
      using ( bucket_id = 'rmd_records' );
  end if;
end $$;

-- Public read policy (optional; bucket public already allows anon read, but keep explicit)
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'rmd_records_select'
  ) then
    create policy rmd_records_select on storage.objects
      for select to public
      using ( bucket_id = 'rmd_records' );
  end if;
end $$;


