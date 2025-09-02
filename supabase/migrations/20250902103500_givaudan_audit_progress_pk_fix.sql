BEGIN;

-- 1) 기존 행 중 audit_date 가 NULL 인 경우 현재 날짜로 채움(임시 기준)
UPDATE public.givaudan_audit_progress
SET audit_date = CURRENT_DATE
WHERE audit_date IS NULL;

-- 2) 날짜 필수화
ALTER TABLE public.givaudan_audit_progress
  ALTER COLUMN audit_date SET NOT NULL;

-- 3) 기존 기본키/유니크 제거
ALTER TABLE public.givaudan_audit_progress
  DROP CONSTRAINT IF EXISTS givaudan_audit_progress_pkey;
ALTER TABLE public.givaudan_audit_progress
  DROP CONSTRAINT IF EXISTS givaudan_audit_progress_number_audit_date_key;

-- 4) (number, audit_date)로 기본키 재설정
ALTER TABLE public.givaudan_audit_progress
  ADD CONSTRAINT givaudan_audit_progress_pkey PRIMARY KEY (number, audit_date);

-- 5) 조회 성능 보조 인덱스 보장
CREATE INDEX IF NOT EXISTS givaudan_audit_progress_audit_date_idx
  ON public.givaudan_audit_progress (audit_date);

COMMIT;


