-- Robust search RPC for ingredients supporting commas, dots, unicode
-- Returns ingredients rows with an extra column total_count for pagination

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
  _tokens text[] := regexp_split_to_array(coalesce(_keyword, ''), '\\s+');
  _where text := '';
  _cols text[] := array[
    'inci_name','korean_name','chinese_name','cas_no','scientific_name','function_en','function_kr','einecs_no','old_korean_name','origin_abs','remarks','created_by_name','updated_by_name'
  ];
  _t text;
  _group text;
begin
  if array_length(_tokens,1) is null then
    _tokens := array[]::text[];
  end if;

  if array_length(_tokens,1) > 0 then
    if upper(coalesce(_op,'AND')) = 'AND' then
      -- Build: AND over tokens of (OR over columns)
      foreach _t in array _tokens loop
        _group := (
          select string_agg(format('(coalesce(%s,'''') ilike %L)', c, '%'||_t||'%'), ' OR ')
          from unnest(_cols) as c
        );
        if _where <> '' then _where := _where || ' AND '; end if;
        _where := _where || '(' || _group || ')';
      end loop;
    else
      -- OR across every token on every column
      _where := (
        select string_agg(format('(coalesce(%s,'''') ilike %L)', c, '%'||t||'%'), ' OR ')
        from unnest(_cols) as c cross join unnest(_tokens) as t
      );
    end if;
  end if;

  return query
  execute format(
    'select i.*, count(*) over() as total_count
     from public.ingredients i
     %s
     order by i.inci_name asc
     offset %s limit %s',
     case when _where <> '' then 'where '||_where else '' end,
     _from, _page_size
  );
end;
$$;

grant execute on function public.ingredients_search(integer, integer, text, text) to authenticated;



