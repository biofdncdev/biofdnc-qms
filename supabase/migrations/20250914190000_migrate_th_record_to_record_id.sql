-- Migrate rmd_th_record to use record_id instead of form_id (which was actually record_no)
-- First add a new column for record_id
ALTER TABLE public.rmd_th_record ADD COLUMN IF NOT EXISTS record_id uuid;

-- Update existing records to map form_id (record_no) to record_id
UPDATE public.rmd_th_record th
SET record_id = meta.record_id
FROM public.record_form_meta meta
WHERE th.form_id = meta.record_no
AND th.record_id IS NULL;

-- Create new unique constraint on record_id + week_start
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'rmd_th_record_record_id_week_start_key'
  ) THEN
    ALTER TABLE public.rmd_th_record 
    ADD CONSTRAINT rmd_th_record_record_id_week_start_key 
    UNIQUE (record_id, week_start);
  END IF;
END $$;

-- Note: We keep form_id column for backward compatibility
-- New records should use record_id, but old code can still read form_id
