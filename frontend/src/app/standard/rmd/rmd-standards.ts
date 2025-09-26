export interface RegulationItem { id: string; title: string; }
export interface RegulationCategory { category: string; items: RegulationItem[]; }

// React's rmdStandards.js converted to TS (same data)
export const RMD_STANDARDS: RegulationCategory[] = [
  {
    category: '일반관리기준서',
    items: [
      { id: 'BF-GM-01', title: '업무매뉴얼' },
      { id: 'BF-GM-02', title: '업무분장 규정' },
      { id: 'BF-GM-03', title: '기록 관리 규정' },
      { id: 'BF-GM-04', title: '교육훈련 규정' },
      { id: 'BF-GM-05', title: '제품 식별 및 추적성 관리 규정' },
      { id: 'BF-GM-06', title: '내부감사 규정' },
      { id: 'BF-GM-07', title: '문서 및 자료관리 규정' },
      { id: 'BF-GM-08', title: '불만 처리 규정' },
      { id: 'BF-GM-10', title: '폐기물 처리 및 관리 규정' },
      { id: 'BF-GM-11', title: '회수반품처리규정' },
      { id: 'BF-GM-12', title: '자격인증 규정' },
      { id: 'BF-GM-13', title: '비즈니스 연속성 관리 규정' },
    ],
  },
  {
    category: '제조위생관리기준서',
    items: [
      { id: 'BF-HM-01', title: '방충 및 방서 관리 규정' },
      { id: 'BF-HM-02', title: '위생복 착용 규정' },
      { id: 'BF-HM-03', title: '작업원 수세 및 소독관리 규정' },
      { id: 'BF-HM-04', title: '작업원 건강관리 규정' },
      { id: 'BF-HM-06', title: '작업원 위생관리 규정' },
      { id: 'BF-HM-07', title: '작업장 위생관리 규정' },
      { id: 'BF-HM-08', title: '작업장 청소 및 소독관리 규정' },
      { id: 'BF-HM-09', title: '설비 기구 세척 및 소독관리 규정' },
    ],
  },
  {
    category: '제조관리기준서',
    items: [
      { id: 'BF-PM-01', title: '제조번호 부여 규정' },
      { id: 'BF-PM-02', title: '건물,시설 및 설비관리규정' },
      { id: 'BF-PM-03', title: '구매 및 공급업체 관리 규정' },
      { id: 'BF-PM-04', title: '원료 관리 규정' },
      { id: 'BF-PM-05', title: '자재 관리 규정' },
      { id: 'BF-PM-06', title: '제조 관리 규정' },
      { id: 'BF-PM-08', title: '반제품 관리 규정' },
      { id: 'BF-PM-09', title: '제품 관리 규정' },
      { id: 'BF-PM-10', title: '변경 관리 규정' },
      { id: 'BF-PM-11', title: '부적합품 관리 규정' },
      { id: 'BF-PM-12', title: '창고 관리 규정' },
      { id: 'BF-PM-13', title: '제조 공정검사 및 관리 규정' },
      { id: 'BF-PM-14', title: '라벨 관리 규정' },
      
    ],
  },
  {
    category: '품질관리기준서',
    items: [
      { id: 'BF-QC-01', title: '검체의 채취 및 보관 규정' },
      { id: 'BF-QC-02', title: '일탈 관리 규정' },
      { id: 'BF-QC-03', title: '계측기 검교정 관리 규정' },
      { id: 'BF-QC-04', title: '제조용수 시험관리 규정' },
      { id: 'BF-QC-05', title: '부자재 입고검사 규정' },
      { id: 'BF-QC-06', title: '미생물시험 규정' },
      { id: 'BF-QC-07', title: '안정성 시험 규정' },
      { id: 'BF-QC-08', title: '시약 관리 규정' },
      { id: 'BF-QC-09', title: '표준품관리규정' },
      { id: 'BF-QC-10', title: '안정성시험규정(구버전)' },
      { id: 'BF-QC-11', title: '중금속 함량 시험 규정' },
    ],
  },
];
