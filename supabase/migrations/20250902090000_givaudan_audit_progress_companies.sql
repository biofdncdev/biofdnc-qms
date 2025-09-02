-- Add companies (text[]) to givaudan_audit_progress
-- Safe to run multiple times; checks existence
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'givaudan_audit_progress'
      AND column_name = 'companies'
  ) THEN
    ALTER TABLE public.givaudan_audit_progress
      ADD COLUMN companies text[] DEFAULT ARRAY[]::text[];
  END IF;
END $$;

-- Optional index for filtering by company tags (GIN on text[])
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = 'givaudan_audit_progress_companies_gin' AND n.nspname = 'public'
  ) THEN
    CREATE INDEX givaudan_audit_progress_companies_gin
      ON public.givaudan_audit_progress USING GIN (companies);
  END IF;
END $$;

