-- migrate:up
-- Add optional metadata columns for record features and use departments
-- Safe-guarded with IF NOT EXISTS to allow re-runs without error

begin;

  alter table if exists public.record_form_meta
    add column if not exists features jsonb;

  alter table if exists public.record_form_meta
    add column if not exists use_departments text[];

  -- Initialize existing rows to empty values to avoid null-handling glitches
  update public.record_form_meta
    set features = coalesce(features, '{}'::jsonb);

  update public.record_form_meta
    set use_departments = coalesce(use_departments, '{}'::text[]);

commit;

-- migrate:down
begin;
  alter table if exists public.record_form_meta
    drop column if exists use_departments;

  alter table if exists public.record_form_meta
    drop column if exists features;
commit;


