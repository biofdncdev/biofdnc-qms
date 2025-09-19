-- Step 1: Add enum label 'audit' before any data changes
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'user_role'
  ) THEN
    BEGIN
      ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'audit';
    EXCEPTION WHEN duplicate_object THEN NULL; END;
  END IF;
END$$;


