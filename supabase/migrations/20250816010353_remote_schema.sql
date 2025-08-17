

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";








ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";














































































































































































ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";






























RESET ALL;

-- Admin RPCs: password reset and delete user
create or replace function public.is_admin(p_user uuid)
returns boolean language sql stable as $$
  select coalesce((select role in ('admin','manager') from public.users where id = p_user), false);
$$;

create or replace function public.admin_reset_password(user_id uuid, new_password text)
returns json language plpgsql security definer as $$
declare
  srv_jwt text;
  base_url text := current_setting('app.settings.supabase_url', true);
  resp json;
begin
  if not public.is_admin(auth.uid()) then raise exception 'only admin'; end if;
  srv_jwt := (select secret from extensions.vault.get_secret('service_role_jwt'));
  resp := (select (extensions.http('PATCH', base_url || '/auth/v1/admin/users/' || user_id::text,
           json_build_object('password', new_password)::text,
           ARRAY[
             extensions.http_header('Authorization','Bearer '||srv_jwt),
             extensions.http_header('apikey', srv_jwt),
             extensions.http_header('Content-Type','application/json')
           ])).content::json);
  return resp;
end;$$;

create or replace function public.admin_delete_user(user_id uuid)
returns json language plpgsql security definer as $$
declare
  srv_jwt text;
  base_url text := current_setting('app.settings.supabase_url', true);
begin
  if not public.is_admin(auth.uid()) then raise exception 'only admin'; end if;
  srv_jwt := (select secret from extensions.vault.get_secret('service_role_jwt'));
  perform extensions.http('DELETE', base_url || '/auth/v1/admin/users/' || user_id::text, null,
           ARRAY[
             extensions.http_header('Authorization','Bearer '||srv_jwt),
             extensions.http_header('apikey', srv_jwt)
           ]);
  delete from public.users where id = user_id;
  return json_build_object('ok', true);
end;$$;

revoke all on function public.admin_reset_password(uuid, text) from public;
revoke all on function public.admin_delete_user(uuid) from public;
grant execute on function public.admin_reset_password(uuid, text) to authenticated;
grant execute on function public.admin_delete_user(uuid) to authenticated;
