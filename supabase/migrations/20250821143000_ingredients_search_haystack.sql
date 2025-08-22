-- Simplify search logic: build a single haystack text over searchable columns
-- Then apply AND/OR over tokens against the haystack. This avoids dynamic SQL pitfalls.

create or replace function public.ingredients_search(
  _page integer default 1,
  _page_size integer default 15,
  _keyword text default '',
  _op text default 'AND'
)
returns table (
  id uuid,
  inci_name text,
  korean_name text,
  chinese_name text,
  function_en text,
  function_kr text,
  cas_no text,
  einecs_no text,
  old_korean_name text,
  scientific_name text,
  origin_abs text,
  remarks text,
  created_at timestamptz,
  updated_at timestamptz,
  created_by uuid,
  updated_by uuid,
  created_by_name text,
  updated_by_name text,
  total_count bigint
)
language plpgsql
as $$
declare
  _from integer := greatest(0, (_page - 1) * _page_size);
  _tokens_raw text[] := regexp_split_to_array(coalesce(_keyword, ''), '\\s+');
  _tokens text[] := array(
    select btrim(t) from unnest(coalesce(_tokens_raw, array[]::text[])) as t
    where btrim(t) <> ''
  );
  _use_or boolean := upper(coalesce(_op,'AND')) = 'OR';
begin
  return query
  with base as (
    select 
      i.*,
      -- haystack includes spaces between fields so token boundaries are respected
      lower(
        coalesce(i.inci_name,'')||' '||coalesce(i.korean_name,'')||' '||coalesce(i.chinese_name,'')||' '||
        coalesce(i.cas_no,'')||' '||coalesce(i.scientific_name,'')||' '||coalesce(i.function_en,'')||' '||
        coalesce(i.function_kr,'')||' '||coalesce(i.einecs_no,'')||' '||coalesce(i.old_korean_name,'')||' '||
        coalesce(i.origin_abs,'')||' '||coalesce(i.remarks,'')||' '||coalesce(i.created_by_name,'')||' '||
        coalesce(i.updated_by_name,'')
      ) as hay
    from public.ingredients i
  ), filtered as (
    select * from base
    where (
      case when array_length(_tokens,1) is null then true
           when _use_or then exists (
             select 1 from unnest(_tokens) t where hay like '%'||lower(t)||'%'
           )
           else not exists (
             select 1 from unnest(_tokens) t where hay not like '%'||lower(t)||'%'
           )
      end
    )
  )
  select 
    f.id,
    f.inci_name,
    f.korean_name,
    f.chinese_name,
    f.function_en,
    f.function_kr,
    f.cas_no,
    f.einecs_no,
    f.old_korean_name,
    f.scientific_name,
    f.origin_abs,
    f.remarks,
    f.created_at,
    f.updated_at,
    f.created_by,
    f.updated_by,
    f.created_by_name,
    f.updated_by_name,
    count(*) over() as total_count
  from filtered f
  order by f.inci_name asc
  offset _from limit _page_size;
end;
$$;

grant execute on function public.ingredients_search(integer, integer, text, text) to authenticated, anon;


