-- Add features column to record_form_meta to persist checkbox states
begin;

  -- Ensure the table exists
  do $$ begin
    if not exists (
      select 1 from information_schema.tables 
      where table_schema = 'public' and table_name = 'record_form_meta'
    ) then
      raise exception 'Table public.record_form_meta does not exist';
    end if;
  end $$;

  -- Add JSONB column for features if missing
  alter table if exists public.record_form_meta
    add column if not exists features jsonb not null default '{}'::jsonb;

  -- Optional: ensure column has a CHECK for valid json object (not array)
  do $$ begin
    if not exists (
      select 1 from pg_constraint 
      where conrelid = 'public.record_form_meta'::regclass
        and conname = 'record_form_meta_features_is_object'
    ) then
      alter table public.record_form_meta
        add constraint record_form_meta_features_is_object
        check (jsonb_typeof(features) = 'object');
    end if;
  end $$;

commit;


