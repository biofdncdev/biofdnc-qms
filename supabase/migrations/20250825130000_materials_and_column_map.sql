-- Materials master and ERP column mapping
begin;

-- 1) Materials table (purchased raw materials)
create table if not exists public.materials (
  id uuid primary key default gen_random_uuid(),
  material_code text unique,            -- ERP 자재코드
  material_name text,                   -- 자재명(국문)
  material_name_en text,                -- 자재명(영문)
  vendor_name text,                     -- 공급업체명
  spec text,                            -- 규격/사양
  unit text,                            -- 단위
  cas_no text,                          -- CAS
  inci_name text,                       -- INCI (매칭 가능 시)
  remarks text,                         -- 비고
  attrs jsonb default '{}'::jsonb,      -- 기타 ERP 필드 보관용
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid,
  created_by_name text,
  updated_by_name text
);

alter table public.materials enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='materials' and policyname='materials_read'
  ) then
    create policy materials_read on public.materials for select to authenticated using (true);
  end if;
  if to_regprocedure('public.is_admin()') is not null then
    if not exists (
      select 1 from pg_policies where schemaname='public' and tablename='materials' and policyname='materials_write'
    ) then
      create policy materials_write on public.materials for all to authenticated using (is_admin()) with check (is_admin());
    end if;
  end if;
end $$;

-- 2) Column map for Materials: ERP sheet label (KR) <-> DB column
create table if not exists public.material_column_map (
  id uuid primary key default gen_random_uuid(),
  sheet_label_kr text not null,
  db_column text not null,
  is_required boolean not null default false,
  display_order int not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid,
  created_by_name text,
  updated_by_name text,
  constraint material_column_map_sheet_label_kr_key unique (sheet_label_kr),
  constraint material_column_map_db_column_key unique (db_column)
);

alter table public.material_column_map enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='material_column_map' and policyname='material_column_map_read'
  ) then
    create policy material_column_map_read on public.material_column_map for select to authenticated using (true);
  end if;
  if to_regprocedure('public.is_admin()') is not null then
    if not exists (
      select 1 from pg_policies where schemaname='public' and tablename='material_column_map' and policyname='material_column_map_write'
    ) then
      create policy material_column_map_write on public.material_column_map for all to authenticated using (is_admin()) with check (is_admin());
    end if;
  end if;
end $$;

-- 3) Seed initial mappings from our proposed schema; update these later to match ERP sheet
insert into public.material_column_map(sheet_label_kr, db_column, is_required, display_order)
values
  ('자재코드','material_code', true, 10),
  ('자재명','material_name', true, 20),
  ('자재명(영문)','material_name_en', false, 30),
  ('공급업체','vendor_name', false, 40),
  ('규격','spec', false, 50),
  ('단위','unit', false, 60),
  ('CAS NO','cas_no', false, 70),
  ('INCI Name','inci_name', false, 80),
  ('비고','remarks', false, 90)
on conflict (sheet_label_kr) do nothing;

-- 4) Audit triggers (reuse shared function when exists)
create trigger trg_materials_audit
before insert or update on public.materials
for each row execute function set_audit_fields();

create trigger trg_material_column_map_audit
before insert or update on public.material_column_map
for each row execute function set_audit_fields();

commit;


