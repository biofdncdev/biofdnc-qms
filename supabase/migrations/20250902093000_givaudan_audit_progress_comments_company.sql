-- Add comments (jsonb) and company (text) to progress
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='givaudan_audit_progress' AND column_name='comments'
  ) THEN
    ALTER TABLE public.givaudan_audit_progress ADD COLUMN comments jsonb DEFAULT '[]'::jsonb;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='givaudan_audit_progress' AND column_name='company'
  ) THEN
    ALTER TABLE public.givaudan_audit_progress ADD COLUMN company text;
  END IF;
END $$;

