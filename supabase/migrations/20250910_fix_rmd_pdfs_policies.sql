-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated users to upload PDF files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update their PDF files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete PDF files" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access to PDF files" ON storage.objects;

-- Create RLS policies for rmd_pdfs bucket with unique names
CREATE POLICY "rmd_pdfs_insert_policy"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'rmd_pdfs');

CREATE POLICY "rmd_pdfs_update_policy"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'rmd_pdfs')
WITH CHECK (bucket_id = 'rmd_pdfs');

CREATE POLICY "rmd_pdfs_delete_policy"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'rmd_pdfs');

CREATE POLICY "rmd_pdfs_select_policy"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'rmd_pdfs');

-- Also ensure rmd_records bucket has proper policies for fallback
DROP POLICY IF EXISTS "rmd_records_pdf_insert_policy" ON storage.objects;
DROP POLICY IF EXISTS "rmd_records_pdf_update_policy" ON storage.objects;
DROP POLICY IF EXISTS "rmd_records_pdf_delete_policy" ON storage.objects;
DROP POLICY IF EXISTS "rmd_records_pdf_select_policy" ON storage.objects;

CREATE POLICY "rmd_records_pdf_insert_policy"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'rmd_records' AND (storage.foldername(name))[1] = 'pdfs');

CREATE POLICY "rmd_records_pdf_update_policy"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'rmd_records' AND (storage.foldername(name))[1] = 'pdfs')
WITH CHECK (bucket_id = 'rmd_records' AND (storage.foldername(name))[1] = 'pdfs');

CREATE POLICY "rmd_records_pdf_delete_policy"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'rmd_records' AND (storage.foldername(name))[1] = 'pdfs');

CREATE POLICY "rmd_records_pdf_select_policy"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'rmd_records' AND (storage.foldername(name))[1] = 'pdfs');