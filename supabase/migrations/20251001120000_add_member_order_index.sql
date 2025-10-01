-- Add order_index to org_chart_members for preserving chip order
alter table public.org_chart_members 
add column if not exists order_index int not null default 0;

-- Create index for faster queries
create index if not exists idx_org_chart_members_order 
on public.org_chart_members(assigned_node_id, order_index);

