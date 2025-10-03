-- Add name_change_history column to ingredients table
alter table "public"."ingredients" add column "name_change_history" text;

-- Add comment to describe the column
comment on column "public"."ingredients"."name_change_history" is 'History of ingredient name changes';

