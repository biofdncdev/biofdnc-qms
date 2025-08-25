-- Ensure upsert by material_number works
begin;

alter table if exists public.materials
  add constraint materials_material_number_key unique (material_number);

commit;


