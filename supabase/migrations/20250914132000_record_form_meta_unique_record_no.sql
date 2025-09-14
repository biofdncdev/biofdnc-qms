-- Add unique constraint on record_no
begin;

  -- Drop any duplicate records first (keep the most recent)
  delete from public.record_form_meta a
  using public.record_form_meta b
  where a.record_no = b.record_no
    and a.record_no is not null
    and a.updated_at < b.updated_at;

  -- Check if constraint exists before adding
  do $$ 
  begin
    if not exists (
      select 1 from pg_constraint 
      where conname = 'record_form_meta_record_no_key'
    ) then
      alter table public.record_form_meta
        add constraint record_form_meta_record_no_key unique (record_no);
    end if;
  end $$;

commit;
