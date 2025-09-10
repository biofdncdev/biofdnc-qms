export interface RmdFormItem {
  id: string;
  title: string;
  // Optional metadata used for filtering/list rendering
  department?: string;   // ex) 원료제조팀
  owner?: string;        // 이름/이메일
  method?: string;       // ERP | QMS | NAS | OneNote | Paper
  period?: string;       // 일 | 주 | 월 | 년 | 갱신주기
  standard?: string;     // 연결된 규정명
  standardCategory?: string; // 일반관리기준서 / 제조위생관리기준서 / 제조관리기준서 / 품질관리기준서
  certs?: string[];      // 인증 체계 배열 (ISO9001, ISO22716, ISO14001, HALAL 등)
  companies?: string[];  // 연결된 Audit 업체들 (목록 칩 표시/필터용)
  selectedLinks?: Array<{ id: string; title: string; kind?: 'record'|'standard' }>;
}
export interface RmdFormCategory { category: string; items: RmdFormItem[]; }

// 코드 규칙: BF-RMD-{GM|HM|PM|QC}-IR-{NN}
// IR = Instruction & Record(지시·기록서)
export const RMD_FORM_CATEGORIES: RmdFormCategory[] = [
  {
    category: '제조관리기준서',
    items: [
      { id: 'BF-RMD-PM-IR-07', title: '온습도관리 지시·기록서', department:'원료제조팀', standardCategory:'제조관리기준서' },
    ],
  },
  {
    category: 'ISO',
    items: [
      { id: 'ISO-9001', title: 'ISO9001 품질경영시스템', department:'원료제조팀', standardCategory:'ISO' },
      { id: 'ISO-22716', title: 'ISO22716 화장품 GMP', department:'원료제조팀', standardCategory:'ISO' },
      { id: 'ISO-14001', title: 'ISO14001 환경경영시스템', department:'원료제조팀', standardCategory:'ISO' },
    ],
  },
];
