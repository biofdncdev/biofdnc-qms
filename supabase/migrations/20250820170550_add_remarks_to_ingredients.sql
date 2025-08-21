-- Add nullable remarks column to public.ingredients

alter table if exists public.ingredients
  add column if not exists remarks text;


