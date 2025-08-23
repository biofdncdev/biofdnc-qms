-- Add JSONB column to persist composition verification logs per product
-- Each entry in the array will be an object like { user: text, time: text }

alter table if exists public.products
  add column if not exists verify_logs jsonb default '[]'::jsonb;


