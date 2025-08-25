begin;

create table if not exists public.product_bom_material_map (
  id uuid primary key default gen_random_uuid(),
  product_code text not null,
  ingredient_name text not null,
  selected_material_id uuid null,
  selected_material_number text null,
  note text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid,
  constraint product_bom_material_map_unique unique (product_code, ingredient_name)
);

alter table public.product_bom_material_map enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='product_bom_material_map' and policyname='pbmm_select'
  ) then
    create policy pbmm_select on public.product_bom_material_map for select to authenticated using (true);
  end if;
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='product_bom_material_map' and policyname='pbmm_write_admin_staff'
  ) then
    create policy pbmm_write_admin_staff on public.product_bom_material_map
      for all to authenticated using (exists (select 1 from public.users u where u.id = auth.uid() and u.role in ('admin','manager','staff')))
      with check (exists (select 1 from public.users u where u.id = auth.uid() and u.role in ('admin','manager','staff')));
  end if;
end $$;

create trigger trg_pbmm_audit before insert or update on public.product_bom_material_map for each row execute function set_audit_fields();

commit;


