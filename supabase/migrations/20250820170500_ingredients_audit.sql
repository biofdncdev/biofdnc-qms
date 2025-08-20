-- Add audit columns for ingredients and triggers to auto-populate

alter table public.ingredients
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now(),
  add column if not exists created_by uuid,
  add column if not exists updated_by uuid,
  add column if not exists created_by_name text,
  add column if not exists updated_by_name text;

create or replace function public.ingredients_set_audit_fields()
returns trigger
language plpgsql
as $$
declare
  jwt json;
  jwt_email text;
begin
  -- Extract email from JWT claims if available
  begin
    jwt := nullif(current_setting('request.jwt.claims', true), '')::json;
    jwt_email := coalesce(jwt->>'email', null);
  exception when others then
    jwt_email := null;
  end;

  if (TG_OP = 'INSERT') then
    if new.created_at is null then new.created_at := now(); end if;
    if new.updated_at is null then new.updated_at := now(); end if;
    if new.created_by is null then new.created_by := auth.uid(); end if;
    if new.updated_by is null then new.updated_by := auth.uid(); end if;
    if new.created_by_name is null then new.created_by_name := coalesce(jwt_email, new.created_by_name); end if;
    if new.updated_by_name is null then new.updated_by_name := coalesce(jwt_email, new.updated_by_name); end if;
  elsif (TG_OP = 'UPDATE') then
    new.updated_at := now();
    if new.updated_by is null then new.updated_by := auth.uid(); end if;
    if new.updated_by_name is null then new.updated_by_name := coalesce(jwt_email, new.updated_by_name); end if;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_ingredients_audit on public.ingredients;
create trigger trg_ingredients_audit
  before insert or update on public.ingredients
  for each row
  execute procedure public.ingredients_set_audit_fields();


