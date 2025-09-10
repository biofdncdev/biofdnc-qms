-- Create storage bucket for RMD PDF files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'rmd_pdfs',
  'rmd_pdfs', 
  true,
  52428800, -- 50MB
  ARRAY['application/pdf']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['application/pdf']::text[];

-- Create RLS policies for rmd_pdfs bucket
CREATE POLICY "Allow authenticated users to upload PDF files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'rmd_pdfs');

CREATE POLICY "Allow authenticated users to update their PDF files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'rmd_pdfs')
WITH CHECK (bucket_id = 'rmd_pdfs');

CREATE POLICY "Allow authenticated users to delete PDF files"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'rmd_pdfs');

CREATE POLICY "Allow public read access to PDF files"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'rmd_pdfs');
