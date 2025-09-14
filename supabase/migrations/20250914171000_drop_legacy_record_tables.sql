-- Drop legacy tables if they exist
begin;

  do $$ begin
    if exists (select 1 from information_schema.tables where table_schema='public' and table_name='records') then
      drop table public.records cascade;
    end if;
  end $$;

  do $$ begin
    if exists (select 1 from information_schema.tables where table_schema='public' and table_name='record_numbers') then
      drop table public.record_numbers cascade;
    end if;
  end $$;

commit;


