-- Add change_logs column to ingredients to persist edit history
-- Stores an array of objects: [{ user: text, time: text }]

alter table if exists public.ingredients
  add column if not exists change_logs jsonb not null default '[]'::jsonb;

comment on column public.ingredients.change_logs is 'Edit history logs: array of { user: text, time: text (local timestamp) }';

-- Optional: simple constraint to ensure it is an array
alter table if exists public.ingredients
  add constraint ingredients_change_logs_is_array
  check (jsonb_typeof(change_logs) = 'array');

-- Ensure RLS policies (if any) are unaffected; no changes here because updates inherit existing rules.


