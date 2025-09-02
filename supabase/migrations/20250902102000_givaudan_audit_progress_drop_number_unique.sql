-- Drop legacy unique constraint on number, to allow multiple audit_date versions
ALTER TABLE public.givaudan_audit_progress
  DROP CONSTRAINT IF EXISTS givaudan_audit_progress_number_key;

-- Ensure composite unique constraint exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint c
      JOIN pg_class t ON c.conrelid = t.oid
      WHERE t.relname = 'givaudan_audit_progress'
        AND c.conname = 'givaudan_audit_progress_number_audit_date_key'
  ) THEN
    ALTER TABLE public.givaudan_audit_progress
      ADD CONSTRAINT givaudan_audit_progress_number_audit_date_key UNIQUE (number, audit_date);
  END IF;
END $$;

-- Helpful index for queries by audit_date
CREATE INDEX IF NOT EXISTS givaudan_audit_progress_audit_date_idx
  ON public.givaudan_audit_progress (audit_date);

