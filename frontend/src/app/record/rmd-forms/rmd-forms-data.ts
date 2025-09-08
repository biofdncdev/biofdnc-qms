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
    category: '일반관리기준서',
    items: [
      { id: 'BF-RMD-GM-IR-01', title: '업무분장 지시·기록서', department:'원료제조팀', standardCategory:'일반관리기준서' },
      { id: 'BF-RMD-GM-IR-02', title: '교육훈련 지시·기록서', department:'원료제조팀', standardCategory:'일반관리기준서' },
      { id: 'BF-RMD-GM-IR-03', title: '문서 및 기록관리 지시·기록서', department:'원료제조팀', standardCategory:'일반관리기준서' },
      { id: 'BF-RMD-GM-IR-04', title: '불만 처리 지시·기록서', department:'원료제조팀', standardCategory:'일반관리기준서' },
      { id: 'BF-RMD-GM-IR-05', title: '내부감사 지시·기록서', department:'원료제조팀', standardCategory:'일반관리기준서' },
    ],
  },
  {
    category: '제조위생관리기준서',
    items: [
      { id: 'BF-RMD-HM-IR-01', title: '위생복 관리 지시·기록서', department:'원료제조팀', standardCategory:'제조위생관리기준서' },
      { id: 'BF-RMD-HM-IR-02', title: '작업장 청소/소독 지시·기록서', department:'원료제조팀', standardCategory:'제조위생관리기준서' },
      { id: 'BF-RMD-HM-IR-03', title: '해충 방제 지시·기록서', department:'원료제조팀', standardCategory:'제조위생관리기준서' },
      { id: 'BF-RMD-HM-IR-04', title: '개인위생 지시·기록서', department:'원료제조팀', standardCategory:'제조위생관리기준서' },
    ],
  },
  {
    category: '제조관리기준서',
    items: [
      { id: 'BF-RMD-PM-IR-01', title: '원료 입고/검수 지시·기록서', department:'원료제조팀', standardCategory:'제조관리기준서' },
      { id: 'BF-RMD-PM-IR-02', title: '제조 지시·기록서', department:'원료제조팀', standardCategory:'제조관리기준서' },
      { id: 'BF-RMD-PM-IR-03', title: '공정검사 지시·기록서', department:'원료제조팀', standardCategory:'제조관리기준서' },
      { id: 'BF-RMD-PM-IR-04', title: '완제품 출하 지시·기록서', department:'원료제조팀', standardCategory:'제조관리기준서' },
      { id: 'BF-RMD-PM-IR-05', title: '변경관리 지시·기록서', department:'원료제조팀', standardCategory:'제조관리기준서' },
      { id: 'BF-RMD-PM-IR-06', title: '부자재 입고/검사 지시·기록서', department:'원료제조팀', standardCategory:'제조관리기준서' },
      { id: 'BF-RMD-PM-IR-07', title: '온습도관리 지시·기록서', department:'원료제조팀', standardCategory:'제조관리기준서' },
    ],
  },
  {
    category: '품질관리기준서',
    items: [
      { id: 'BF-RMD-QC-IR-01', title: '표준품/시약 관리 지시·기록서', department:'원료제조팀', standardCategory:'품질관리기준서' },
      { id: 'BF-RMD-QC-IR-02', title: '시험 의뢰/성적서 지시·기록서', department:'원료제조팀', standardCategory:'품질관리기준서' },
      { id: 'BF-RMD-QC-IR-03', title: '검체 채취 지시·기록서', department:'원료제조팀', standardCategory:'품질관리기준서' },
      { id: 'BF-RMD-QC-IR-04', title: '계측기 교정 지시·기록서', department:'원료제조팀', standardCategory:'품질관리기준서' },
      { id: 'BF-RMD-QC-IR-05', title: '일탈 관리 지시·기록서', department:'원료제조팀', standardCategory:'품질관리기준서' },
      { id: 'BF-RMD-QC-IR-06', title: '부적합품 처리 지시·기록서', department:'원료제조팀', standardCategory:'품질관리기준서' },
      { id: 'BF-RMD-QC-IR-07', title: '회수/반품 관리 지시·기록서', department:'원료제조팀', standardCategory:'품질관리기준서' },
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
