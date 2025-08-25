-- Drop materials and material_column_map tables (cleanup for redefinition)
begin;

-- Drop audit triggers if present
do $$ begin
  if to_regclass('public.materials') is not null then
    begin
      drop trigger if exists trg_materials_audit on public.materials;
    exception when others then null; end;
  end if;
  if to_regclass('public.material_column_map') is not null then
    begin
      drop trigger if exists trg_material_column_map_audit on public.material_column_map;
    exception when others then null; end;
  end if;
end $$;

-- Drop tables if exist
drop table if exists public.material_column_map cascade;
drop table if exists public.materials cascade;

commit;


