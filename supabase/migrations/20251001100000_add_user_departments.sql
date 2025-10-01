-- Add user-department relationship table with approval authority
-- Users can belong to multiple departments (겸직 가능)
-- Each user-department relationship can have approval authority

CREATE TABLE IF NOT EXISTS public.user_departments (
  id bigserial PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  department_code text NOT NULL,
  has_approval_authority boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE(user_id, department_code)
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS user_departments_user_id_idx ON public.user_departments(user_id);
CREATE INDEX IF NOT EXISTS user_departments_dept_code_idx ON public.user_departments(department_code);
CREATE INDEX IF NOT EXISTS user_departments_approval_idx ON public.user_departments(user_id, has_approval_authority);

-- Add trigger for updated_at
DROP TRIGGER IF EXISTS trg_user_departments_updated_at ON public.user_departments;
CREATE TRIGGER trg_user_departments_updated_at
  BEFORE UPDATE ON public.user_departments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Enable RLS
ALTER TABLE public.user_departments ENABLE ROW LEVEL SECURITY;

-- Policy: All authenticated users can read user_departments
CREATE POLICY "user_departments_read_authenticated" ON public.user_departments
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Only admins can insert/update/delete user_departments
CREATE POLICY "user_departments_write_admin" ON public.user_departments
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Add comment
COMMENT ON TABLE public.user_departments IS '사용자-부서 매핑 테이블. 겸직 가능하며 각 부서별 승인권한 설정 가능';
COMMENT ON COLUMN public.user_departments.has_approval_authority IS '해당 부서에서 승인권을 가지고 있는지 여부';

