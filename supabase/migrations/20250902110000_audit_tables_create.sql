BEGIN;

-- 0) Drop legacy tables if they exist
DROP TABLE IF EXISTS public.givaudan_audit_resources CASCADE;
DROP TABLE IF EXISTS public.givaudan_audit_progress CASCADE;
DROP TABLE IF EXISTS public.givaudan_audit_assessment CASCADE;

-- 1) Master: audit_items (evaluation items)
CREATE TABLE public.audit_items (
  number integer PRIMARY KEY,
  title_ko text NOT NULL,
  title_en text,
  category_no text,
  question text,
  translation text,
  acceptance_criteria text
);

-- 2) Progress per date and item
CREATE TABLE public.audit_progress (
  number integer NOT NULL,
  audit_date date NOT NULL,
  status text,
  note text,
  departments text[],
  companies text[] DEFAULT ARRAY[]::text[],
  comments jsonb DEFAULT '[]'::jsonb,
  company text,
  updated_by uuid,
  updated_by_name text,
  updated_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (number, audit_date),
  CONSTRAINT audit_progress_number_fkey FOREIGN KEY (number) REFERENCES public.audit_items(number) ON DELETE CASCADE
);

CREATE INDEX audit_progress_audit_date_idx ON public.audit_progress(audit_date);
CREATE INDEX audit_progress_companies_gin ON public.audit_progress USING GIN (companies);

-- 3) Resources (optional)
CREATE TABLE public.audit_resources (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  number integer NOT NULL,
  name text NOT NULL,
  type text,
  url text,
  file_url text,
  done boolean,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT audit_resources_number_fkey FOREIGN KEY (number) REFERENCES public.audit_items(number) ON DELETE CASCADE
);

-- 4) RLS
ALTER TABLE public.audit_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_resources ENABLE ROW LEVEL SECURITY;

-- Read for all
CREATE POLICY audit_items_read_all ON public.audit_items FOR SELECT USING (true);
CREATE POLICY audit_progress_read_all ON public.audit_progress FOR SELECT USING (true);
CREATE POLICY audit_resources_read_all ON public.audit_resources FOR SELECT USING (true);

-- Write for authenticated
CREATE POLICY audit_items_write_auth ON public.audit_items FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY audit_items_update_auth ON public.audit_items FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY audit_items_delete_admin ON public.audit_items FOR DELETE USING (auth.role() = 'admin');

CREATE POLICY audit_progress_write_auth ON public.audit_progress FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY audit_progress_update_auth ON public.audit_progress FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY audit_progress_delete_admin ON public.audit_progress FOR DELETE USING (auth.role() = 'admin');

CREATE POLICY audit_resources_write_auth ON public.audit_resources FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY audit_resources_update_auth ON public.audit_resources FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY audit_resources_delete_admin ON public.audit_resources FOR DELETE USING (auth.role() = 'admin');

COMMIT;


