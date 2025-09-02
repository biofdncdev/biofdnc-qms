-- Add audit_date to scope progress by date; keep backward compatibility
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'givaudan_audit_progress' AND column_name = 'audit_date'
  ) THEN
    ALTER TABLE public.givaudan_audit_progress
      ADD COLUMN audit_date date DEFAULT NULL;
  END IF;
END $$;

-- Create unique constraint on (number, audit_date) allowing multiple dates per item
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'givaudan_audit_progress_number_audit_date_key'
  ) THEN
    ALTER TABLE public.givaudan_audit_progress
      ADD CONSTRAINT givaudan_audit_progress_number_audit_date_key UNIQUE (number, audit_date);
  END IF;
END $$;

-- Index to list by date quickly
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = 'givaudan_audit_progress_audit_date_idx' AND n.nspname = 'public'
  ) THEN
    CREATE INDEX givaudan_audit_progress_audit_date_idx ON public.givaudan_audit_progress(audit_date);
  END IF;
END $$;

