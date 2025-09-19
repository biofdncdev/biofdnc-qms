-- Create a dedicated table for audit date metadata
CREATE TABLE IF NOT EXISTS public.audit_date_meta (
    audit_date date NOT NULL PRIMARY KEY,
    company text,
    memo text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.audit_date_meta ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read
CREATE POLICY "Allow authenticated users to read audit_date_meta" ON public.audit_date_meta
    FOR SELECT TO authenticated
    USING (true);

-- Allow all authenticated users to insert
CREATE POLICY "Allow authenticated users to insert audit_date_meta" ON public.audit_date_meta
    FOR INSERT TO authenticated
    WITH CHECK (true);

-- Allow all authenticated users to update
CREATE POLICY "Allow authenticated users to update audit_date_meta" ON public.audit_date_meta
    FOR UPDATE TO authenticated
    USING (true)
    WITH CHECK (true);

-- Allow all authenticated users to delete
CREATE POLICY "Allow authenticated users to delete audit_date_meta" ON public.audit_date_meta
    FOR DELETE TO authenticated
    USING (true);

