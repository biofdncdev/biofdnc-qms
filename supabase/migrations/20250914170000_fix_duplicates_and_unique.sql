-- Fix duplicate records and add unique constraint
begin;

  -- Step 1: Remove duplicate records keeping only the most recent one
  delete from public.record_form_meta a
  using public.record_form_meta b
  where a.record_no = b.record_no
    and a.record_id < b.record_id;  -- Keep the newer record_id

  -- Step 2: Add unique constraint on record_no if not exists
  do $$ 
  begin
    if not exists (
      select 1 from pg_constraint 
      where conname = 'record_form_meta_record_no_unique'
    ) then
      alter table public.record_form_meta
        add constraint record_form_meta_record_no_unique unique (record_no);
    end if;
  end $$;

commit;
