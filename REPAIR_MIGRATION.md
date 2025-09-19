# Migration 동기화 가이드

## 문제
로컬 migrations 디렉토리와 원격 데이터베이스의 migration 버전이 일치하지 않습니다.

## 해결 방법

### 1. 먼저 다음 명령을 실행하여 migration 상태를 확인하세요:
```bash
npx supabase migration list
```

### 2. 만약 20250919 관련 에러가 계속 발생한다면:
```bash
npx supabase migration repair --status applied 20250919020614
npx supabase migration repair --status applied 20250919020615
npx supabase migration repair --status applied 20250919020616
```

### 3. 그 다음 push를 시도하세요:
```bash
npx supabase db push
```

## 이미 적용된 변경사항
- `audit_items` 테이블에 `is_active` 컬럼이 이미 추가되었습니다 (ADD_IS_ACTIVE_TO_AUDIT_ITEMS.sql을 통해 수동 실행)
- 중복 migration 파일은 제거되었습니다

## 참고사항
- Migration 파일들은 이미 원격 데이터베이스에 적용되어 있으므로, 로컬 migration 히스토리만 동기화하면 됩니다.
