export interface RmdFormItem { id: string; title: string; }
export interface RmdFormCategory { category: string; items: RmdFormItem[]; }

// 코드 규칙: BF-RMD-{GM|HM|PM|QC}-IR-{NN}
// IR = Instruction & Record(지시·기록서)
export const RMD_FORM_CATEGORIES: RmdFormCategory[] = [
  {
    category: '일반관리기준서',
    items: [
      { id: 'BF-RMD-GM-IR-01', title: '업무분장 지시·기록서' },
      { id: 'BF-RMD-GM-IR-02', title: '교육훈련 지시·기록서' },
      { id: 'BF-RMD-GM-IR-03', title: '문서 및 기록관리 지시·기록서' },
      { id: 'BF-RMD-GM-IR-04', title: '불만 처리 지시·기록서' },
      { id: 'BF-RMD-GM-IR-05', title: '내부감사 지시·기록서' },
    ],
  },
  {
    category: '제조위생관리기준서',
    items: [
      { id: 'BF-RMD-HM-IR-01', title: '위생복 관리 지시·기록서' },
      { id: 'BF-RMD-HM-IR-02', title: '작업장 청소/소독 지시·기록서' },
      { id: 'BF-RMD-HM-IR-03', title: '해충 방제 지시·기록서' },
      { id: 'BF-RMD-HM-IR-04', title: '개인위생 지시·기록서' },
    ],
  },
  {
    category: '제조관리기준서',
    items: [
      { id: 'BF-RMD-PM-IR-01', title: '원료 입고/검수 지시·기록서' },
      { id: 'BF-RMD-PM-IR-02', title: '제조 지시·기록서' },
      { id: 'BF-RMD-PM-IR-03', title: '공정검사 지시·기록서' },
      { id: 'BF-RMD-PM-IR-04', title: '완제품 출하 지시·기록서' },
      { id: 'BF-RMD-PM-IR-05', title: '변경관리 지시·기록서' },
      { id: 'BF-RMD-PM-IR-06', title: '부자재 입고/검사 지시·기록서' },
      { id: 'BF-RMD-PM-IR-07', title: '온습도관리 지시·기록서' },
    ],
  },
  {
    category: '품질관리기준서',
    items: [
      { id: 'BF-RMD-QC-IR-01', title: '표준품/시약 관리 지시·기록서' },
      { id: 'BF-RMD-QC-IR-02', title: '시험 의뢰/성적서 지시·기록서' },
      { id: 'BF-RMD-QC-IR-03', title: '검체 채취 지시·기록서' },
      { id: 'BF-RMD-QC-IR-04', title: '계측기 교정 지시·기록서' },
      { id: 'BF-RMD-QC-IR-05', title: '일탈 관리 지시·기록서' },
      { id: 'BF-RMD-QC-IR-06', title: '부적합품 처리 지시·기록서' },
      { id: 'BF-RMD-QC-IR-07', title: '회수/반품 관리 지시·기록서' },
    ],
  },
];
