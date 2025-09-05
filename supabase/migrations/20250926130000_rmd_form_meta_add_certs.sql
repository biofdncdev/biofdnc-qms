-- Add certs array column to persist selected certification schemes
do $$ begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'rmd_form_meta' and column_name = 'certs'
  ) then
    alter table public.rmd_form_meta add column certs text[] default '{}'::text[];
  end if;
end $$;

-- No RLS changes needed; existing policies cover all columns


