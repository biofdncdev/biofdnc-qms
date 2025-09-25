-- Create partners master table for bulk onboarding

set check_function_bodies = off;

-- Create set_updated_at function if not exists
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $function$
begin
  new.updated_at := timezone('utc', now());
  return new;
end;
$function$;

create table if not exists public.partners (
  partner_code text primary key,
  name_kr text,
  type text,
  biz_reg_no text,
  representative text,
  phone text,
  fax text,
  email text,
  address text,
  manager text,
  manager_phone text,
  manager_email text,
  remark text,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

do $$
begin
  if not exists (
    select 1 from pg_trigger where tgname = 'trg_partners_updated_at'
  ) then
    create trigger trg_partners_updated_at
    before update on public.partners
    for each row execute procedure public.set_updated_at();
  end if;
end
$$;

create index if not exists partners_name_idx on public.partners (lower(name_kr));
create index if not exists partners_type_idx on public.partners (type);

