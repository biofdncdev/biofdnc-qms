# Audit Evaluation Component 구조

## 디렉토리 구조

```
evaluation/
├── components/           # UI 컴포넌트
│   ├── audit-header.component.ts      # 헤더 (날짜 선택, 생성/삭제 버튼)
│   ├── audit-filters.component.ts     # 필터 바 (업체, 메모, 키워드 등)
│   └── audit-item-list.component.ts   # 평가 항목 리스트
│
├── services/            # 비즈니스 로직
│   ├── audit-state.service.ts   # 상태 관리
│   ├── audit-ui.service.ts      # UI 상태 관리
│   └── audit-data.service.ts    # 데이터 처리 및 API 통신
│
├── types/               # 타입 정의
│   └── audit.types.ts   # 공통 타입 정의
│
└── audit-evaluation.component.ts  # 메인 컴포넌트

```

## 주요 기능 분리

### 1. **audit-state.service.ts**
- 전역 상태 관리 (items, selectedDate, filters 등)
- 사용자 정보 및 권한
- Toast 메시지

### 2. **audit-ui.service.ts**
- UI 상태 (편집 모드, 모달 상태, 드래그 상태 등)
- SessionStorage 관리
- UI 헬퍼 함수

### 3. **audit-data.service.ts**
- API 통신 (CRUD 작업)
- 데이터 로드/저장
- CSV/Excel 파싱
- 타이틀 업데이트

### 4. **컴포넌트 분리**
- **audit-header**: 상단 헤더 (날짜 선택, 생성/삭제)
- **audit-filters**: 필터 바 (업체, 메모, 키워드, 부서, 담당자)
- **audit-item-list**: 평가 항목 리스트 및 상세 내용

### 5. **모달 컴포넌트** (메인 컴포넌트에 통합)
- Copy Modal: 다른 날짜에서 복사
- Record Picker: 규정/기록 선택
- Link Popup: 규정/기록 상세 보기

## 리팩토링 효과

1. **가독성 향상**: 2200줄 → 각 파일 200-500줄로 분리
2. **유지보수성**: 기능별 파일 분리로 수정 용이
3. **재사용성**: 서비스와 컴포넌트 독립적 사용 가능
4. **테스트 용이성**: 각 서비스/컴포넌트 개별 테스트 가능
5. **성능**: 필요한 컴포넌트만 로드 (lazy loading 가능)

## 사용 예시

```typescript
// 메인 컴포넌트에서 서비스 주입
constructor(
  private state: AuditStateService,
  private ui: AuditUiService,
  private data: AuditDataService
) {}

// 상태 접근
this.state.items()
this.state.selectedDate()

// UI 상태 관리
this.ui.recordPickerOpen = true
this.ui.persistUi()

// 데이터 작업
await this.data.loadByDate()
await this.data.saveProgress(item)
```
