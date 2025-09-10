# PDF 업로드 기능 설정 가이드

## 개요
Record 페이지의 ISO14001 환경경영시스템 항목에서 PDF 파일을 업로드하고 관리할 수 있는 기능입니다.

## Supabase Storage 설정

### 1. 버킷 생성
Supabase 대시보드에서 Storage 섹션으로 이동하여 다음 설정으로 버킷을 생성합니다:

- **버킷 이름**: `rmd_pdfs`
- **Public 버킷**: Yes (체크)
- **파일 크기 제한**: 50MB
- **허용된 MIME 타입**: `application/pdf`

### 2. RLS 정책 설정
다음 정책들을 설정합니다:

#### 업로드 정책
```sql
CREATE POLICY "Allow authenticated users to upload PDF files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'rmd_pdfs');
```

#### 업데이트 정책
```sql
CREATE POLICY "Allow authenticated users to update their PDF files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'rmd_pdfs')
WITH CHECK (bucket_id = 'rmd_pdfs');
```

#### 삭제 정책
```sql
CREATE POLICY "Allow authenticated users to delete PDF files"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'rmd_pdfs');
```

#### 읽기 정책
```sql
CREATE POLICY "Allow public read access to PDF files"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'rmd_pdfs');
```

### 3. 자동 마이그레이션
프로젝트에 포함된 마이그레이션 파일을 실행하면 자동으로 버킷과 정책이 생성됩니다:
```bash
supabase migration up
```

## 기능 설명

### PDF 업로드
1. ISO14001 환경경영시스템 항목 선택
2. 드래그앤드롭 또는 클릭으로 PDF 파일 선택
3. 저장 버튼 클릭

### PDF 관리
- **조회**: 저장된 PDF 목록 확인
- **다운로드**: 파일명 클릭으로 새 탭에서 열기
- **삭제**: X 버튼으로 삭제 (확인 메시지 표시)
- **이력**: 업로드한 사용자와 시간 표시

### 파일 저장 구조
```
rmd_pdfs/
├── ISO-14001/
│   ├── 1234567890_document1.pdf
│   ├── 1234567891_document2.pdf
│   └── ...
```

## Fallback 메커니즘
`rmd_pdfs` 버킷이 없거나 접근 불가능한 경우, 자동으로 `rmd_records` 버킷의 `pdfs/` 폴더를 사용합니다.

## 트러블슈팅

### PDF 업로드 실패
1. **로그인 상태 확인**: 사용자가 인증되어 있는지 확인
2. **버킷 존재 확인**: Supabase 대시보드에서 `rmd_pdfs` 버킷 확인
3. **RLS 정책 확인**: 위의 정책들이 모두 설정되어 있는지 확인
4. **파일 크기 확인**: 50MB 이하인지 확인

### 권한 오류
RLS(Row Level Security) 정책이 제대로 설정되지 않은 경우:
```sql
-- 정책 확인
SELECT * FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';
```

### 버킷이 생성되지 않는 경우
수동으로 SQL 실행:
```sql
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('rmd_pdfs', 'rmd_pdfs', true, 52428800, ARRAY['application/pdf']::text[]);
```

## 주의사항
- PDF 파일만 업로드 가능
- 최대 파일 크기: 50MB
- 인증된 사용자만 업로드/수정/삭제 가능
- 읽기는 공개 접근 가능 (Public URL 제공)
