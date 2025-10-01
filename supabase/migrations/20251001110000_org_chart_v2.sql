create table if not exists public.org_chart_nodes (
  id uuid primary key,
  name text not null,
  kind text not null check (kind in ('ceo','dept','special')),
  parent_id uuid references public.org_chart_nodes(id) on delete cascade,
  level int not null default 0,
  order_index int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.org_chart_members (
  id uuid primary key,
  name text not null,
  assigned_node_id uuid references public.org_chart_nodes(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- RLS
alter table public.org_chart_nodes enable row level security;
alter table public.org_chart_members enable row level security;

drop policy if exists "org_nodes_select" on public.org_chart_nodes;
create policy "org_nodes_select" on public.org_chart_nodes for select to authenticated using (true);
drop policy if exists "org_nodes_modify" on public.org_chart_nodes;
create policy "org_nodes_modify" on public.org_chart_nodes for all to authenticated using (true) with check (true);

drop policy if exists "org_members_select" on public.org_chart_members;
create policy "org_members_select" on public.org_chart_members for select to authenticated using (true);
drop policy if exists "org_members_modify" on public.org_chart_members;
create policy "org_members_modify" on public.org_chart_members for all to authenticated using (true) with check (true);


