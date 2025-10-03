-- Add icid_monograph_id column to ingredients table
alter table "public"."ingredients" add column "icid_monograph_id" text;

-- Add comment to describe the column
comment on column "public"."ingredients"."icid_monograph_id" is 'ICID Monograph ID for ingredient reference';

-- Create index for faster lookups
create index ingredients_icid_monograph_id_idx 
on public.ingredients (icid_monograph_id)
where icid_monograph_id is not null;

-- Add comment to explain the index
comment on index public.ingredients_icid_monograph_id_idx is 
'Index for ICID Monograph ID lookups';

