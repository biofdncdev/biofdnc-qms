-- Add owners (assignees) array column to audit_progress
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='audit_progress' AND column_name='owners'
  ) THEN
    ALTER TABLE public.audit_progress
      ADD COLUMN owners text[] DEFAULT ARRAY[]::text[];
  END IF;
END
$$;

-- Optional: keep updated_at fresh on update
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'audit_progress_set_updated_at'
  ) THEN
    CREATE TRIGGER audit_progress_set_updated_at
    BEFORE UPDATE ON public.audit_progress
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();
  END IF;
END
$$;


