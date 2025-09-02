-- Align delete policies to check admin flag in public.users instead of auth.role()
BEGIN;

-- Drop previous delete policies if exist
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='audit_items' AND policyname='audit_items_delete_admin') THEN
    DROP POLICY "audit_items_delete_admin" ON public.audit_items;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='audit_progress' AND policyname='audit_progress_delete_admin') THEN
    DROP POLICY "audit_progress_delete_admin" ON public.audit_progress;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='audit_resources' AND policyname='audit_resources_delete_admin') THEN
    DROP POLICY "audit_resources_delete_admin" ON public.audit_resources;
  END IF;
END $$;

-- Recreate delete policies using users.role = 'admin'
CREATE POLICY "audit_items_delete_admin" ON public.audit_items
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'admin')
  );

CREATE POLICY "audit_progress_delete_admin" ON public.audit_progress
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'admin')
  );

CREATE POLICY "audit_resources_delete_admin" ON public.audit_resources
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'admin')
  );

COMMIT;


