-- Rename table rmd_form_meta -> record_form_meta for clarity
do $$ begin
  if to_regclass('public.record_form_meta') is null and to_regclass('public.rmd_form_meta') is not null then
    alter table public.rmd_form_meta rename to record_form_meta;
  end if;
end $$;

-- Note: existing RLS policies and triggers bound to the table remain attached after rename.
-- Policy/trigger names may still include the old prefix and can be renamed later if desired.


