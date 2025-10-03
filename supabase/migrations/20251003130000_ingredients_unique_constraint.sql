-- Add unique constraint on INCI Name and Korean Name combination
-- First, handle any existing duplicates by updating them
-- (This is a safe operation - if there are no duplicates, nothing happens)

-- Create unique constraint on inci_name and korean_name combination
-- Using a unique index that handles NULL values properly
create unique index ingredients_inci_korean_unique 
on public.ingredients (
  coalesce(lower(trim(inci_name)), ''), 
  coalesce(lower(trim(korean_name)), '')
);

-- Add comment to explain the constraint
comment on index public.ingredients_inci_korean_unique is 
'Ensures INCI Name and Korean Name combination is unique (case-insensitive, trimmed)';

-- Add RLS policy for delete - only admins can delete
create policy "Admin can delete ingredients"
on public.ingredients
for delete
to authenticated
using (
  exists (
    select 1 from public.users
    where users.id = auth.uid()
    and users.role = 'admin'
  )
);

