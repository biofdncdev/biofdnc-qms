-- Create storage buckets if they don't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('rmd_records', 'rmd_records', true, 52428800, NULL),
  ('rmd_pdfs', 'rmd_pdfs', true, 52428800, NULL)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for rmd_records bucket (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'rmd_records_public_read'
  ) THEN
    CREATE POLICY "rmd_records_public_read" ON storage.objects
      FOR SELECT
      USING (bucket_id = 'rmd_records');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'rmd_records_auth_insert'
  ) THEN
    CREATE POLICY "rmd_records_auth_insert" ON storage.objects
      FOR INSERT
      TO authenticated
      WITH CHECK (bucket_id = 'rmd_records');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'rmd_records_auth_update'
  ) THEN
    CREATE POLICY "rmd_records_auth_update" ON storage.objects
      FOR UPDATE
      TO authenticated
      USING (bucket_id = 'rmd_records')
      WITH CHECK (bucket_id = 'rmd_records');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'rmd_records_auth_delete'
  ) THEN
    CREATE POLICY "rmd_records_auth_delete" ON storage.objects
      FOR DELETE
      TO authenticated
      USING (bucket_id = 'rmd_records');
  END IF;
END $$;

-- Create RLS policies for rmd_pdfs bucket (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'rmd_pdfs_public_read'
  ) THEN
    CREATE POLICY "rmd_pdfs_public_read" ON storage.objects
      FOR SELECT
      USING (bucket_id = 'rmd_pdfs');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'rmd_pdfs_auth_insert'
  ) THEN
    CREATE POLICY "rmd_pdfs_auth_insert" ON storage.objects
      FOR INSERT
      TO authenticated
      WITH CHECK (bucket_id = 'rmd_pdfs');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'rmd_pdfs_auth_update'
  ) THEN
    CREATE POLICY "rmd_pdfs_auth_update" ON storage.objects
      FOR UPDATE
      TO authenticated
      USING (bucket_id = 'rmd_pdfs')
      WITH CHECK (bucket_id = 'rmd_pdfs');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'rmd_pdfs_auth_delete'
  ) THEN
    CREATE POLICY "rmd_pdfs_auth_delete" ON storage.objects
      FOR DELETE
      TO authenticated
      USING (bucket_id = 'rmd_pdfs');
  END IF;
END $$;
