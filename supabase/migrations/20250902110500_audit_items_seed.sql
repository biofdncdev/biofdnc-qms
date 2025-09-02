BEGIN;

-- Seed 214 placeholder items (can be updated later)
INSERT INTO public.audit_items (number, title_ko, title_en)
SELECT i, '점검 항목 '||i, 'Inspection item '||i
FROM generate_series(1,214) AS s(i)
ON CONFLICT (number) DO NOTHING;

COMMIT;


