# Supabase Storage 설정 가이드

## 현재 상황
PDF 업로드 기능이 `rmd_pdfs` 버킷을 사용하도록 구성되어 있습니다. 
콘솔에 표시되는 에러는 `rmd_records` 버킷이 없어서 발생하는 것이며, 시스템은 자동으로 `rmd_pdfs` 버킷으로 전환하여 정상 작동합니다.

## 마이그레이션 적용 방법

### 1. Supabase CLI를 사용한 방법 (권장)

```bash
# 프로젝트 루트에서 실행
npx supabase@latest db push --include-all
```

만약 위 명령이 실패하면:

```bash
# 특정 마이그레이션만 적용
npx supabase@latest db push supabase/migrations/20250910_create_rmd_pdfs_bucket.sql
npx supabase@latest db push supabase/migrations/20250910_fix_rmd_pdfs_policies.sql
```

### 2. Supabase 대시보드를 통한 수동 설정

1. [Supabase Dashboard](https://app.supabase.com)에 로그인
2. 프로젝트 선택
3. **Storage** 섹션으로 이동
4. **New bucket** 클릭
5. 다음 설정으로 버킷 생성:
   - Name: `rmd_pdfs`
   - Public bucket: ✅ (체크)
   - File size limit: 50MB (52428800 bytes)
   - Allowed MIME types: `application/pdf`

### 3. SQL Editor를 통한 직접 실행

1. Supabase Dashboard > SQL Editor로 이동
2. 다음 SQL 실행:

```sql
-- 버킷 생성
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'rmd_pdfs',
  'rmd_pdfs', 
  true,
  52428800,
  ARRAY['application/pdf']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['application/pdf']::text[];

-- RLS 정책 생성
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
```

## 확인 방법

버킷이 제대로 생성되었는지 확인:

1. Supabase Dashboard > Storage 페이지에서 `rmd_pdfs` 버킷이 표시되는지 확인
2. 또는 SQL Editor에서 다음 쿼리 실행:

```sql
SELECT * FROM storage.buckets WHERE id = 'rmd_pdfs';
```

## 문제 해결

### "Bucket not found" 에러가 계속 발생하는 경우

이는 정상적인 동작입니다. 시스템이 자동으로 대체 버킷을 사용하므로 PDF 업로드는 정상적으로 작동합니다.

### 마이그레이션 실패 시

- Supabase 프로젝트가 일시 중지되지 않았는지 확인
- 인터넷 연결 상태 확인
- Supabase CLI가 최신 버전인지 확인: `npx supabase@latest --version`

## 버킷 구조

```
rmd_pdfs/
└── ISO-14001/
    ├── 1757468289440_abc123.pdf
    ├── 1757469938614_m9vq8c.pdf
    └── ...
```

각 파일은 타임스탬프와 랜덤 문자열로 저장되며, 원본 파일명은 브라우저의 localStorage에 매핑되어 관리됩니다.
