DO $$
BEGIN
  -- Only run migration if rmd_th_record table exists
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'rmd_th_record'
  ) THEN
    -- Add record_id column if missing
    BEGIN
      ALTER TABLE public.rmd_th_record ADD COLUMN IF NOT EXISTS record_id uuid;
    EXCEPTION WHEN undefined_table THEN
      -- Table truly missing; skip
      RETURN;
    END;

    -- Backfill record_id by matching record_no (form_id)
    UPDATE public.rmd_th_record th
    SET record_id = meta.record_id
    FROM public.record_form_meta meta
    WHERE th.form_id = meta.record_no
      AND th.record_id IS NULL;

    -- Add unique constraint on (record_id, week_start)
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint 
      WHERE conname = 'rmd_th_record_record_id_week_start_key'
    ) THEN
      ALTER TABLE public.rmd_th_record 
      ADD CONSTRAINT rmd_th_record_record_id_week_start_key 
      UNIQUE (record_id, week_start);
    END IF;
  END IF;
END $$;

-- Note: We keep form_id column for backward compatibility
-- New records should use record_id, but old code can still read form_id
