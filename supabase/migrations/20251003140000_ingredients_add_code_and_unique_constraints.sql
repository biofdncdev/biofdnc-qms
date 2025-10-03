-- Add ingredient_code column to ingredients table
alter table "public"."ingredients" add column "ingredient_code" text;

-- Add comment to describe the column
comment on column "public"."ingredients"."ingredient_code" is 'Ingredient code from cosmetic ingredient dictionary (not enforced as unique)';

-- Note: ingredient_code is NOT unique by database constraint
-- Duplicates are allowed but will show a confirmation dialog in the UI

-- Create index for faster lookups (but not unique)
create index ingredients_code_idx 
on public.ingredients (ingredient_code)
where ingredient_code is not null;

-- Add comment to explain the index
comment on index public.ingredients_code_idx is 
'Index for ingredient_code lookups (allows duplicates)';

-- Note: The unique constraint on (inci_name, korean_name) combination 
-- was already created in migration 20251003130000_ingredients_unique_constraint.sql

