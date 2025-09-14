import React from 'react';
import { Box, Typography, Divider, List, ListItem, TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';
import { styled } from '@mui/system';

// 스타일링을 위한 커스텀 컴포넌트
const SectionTitle = styled(Typography)({
  fontWeight: 'bold',
  fontSize: '1.2rem',
  margin: '20px 0 10px 0',
});

const SubsectionTitle = styled(Typography)({
  fontWeight: 'bold',
  fontSize: '1rem',
  margin: '10px 0',
});

const StyledList = styled(List)({
  paddingLeft: '20px',
});

const StyledListItem = styled(ListItem)({
  paddingLeft: '20px',
  display: 'flex',
  alignItems: 'center',
});

const Paragraph = styled(Typography)({
  marginBottom: '10px',
});

function BF_RMD_GM_01_Content() {
  return (
    <Box sx={{ padding: '20px', backgroundColor: '#fff', borderRadius: '8px' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <Box>
          {/* 업무매뉴얼 */}
          <Typography>문서번호: BF-RM-GM-01</Typography>
          
        </Box>
        <Box>
          <Typography>개정번호: 00</Typography>
          <Typography>제·개정일: 2024.07.01</Typography>
        </Box>
      </Box>
      <Typography variant="subtitle1" gutterBottom>
        제(개정) 이력
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>제·개정번호</TableCell>
              <TableCell>제·개정일자</TableCell>
              <TableCell>제·개정내용</TableCell>
              <TableCell>작성자</TableCell>
              <TableCell>비고</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>0</TableCell>
              <TableCell>2024.07.01</TableCell>
              <TableCell>신규 제정</TableCell>
              <TableCell>신동선</TableCell>
              <TableCell></TableCell>
            </TableRow>
            {/* Add more rows as needed */}
          </TableBody>
        </Table>
      </TableContainer>
      <Typography variant="subtitle1" gutterBottom sx={{ marginTop: '20px' }}>
        문서 승인
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: '25%' }}>구분</TableCell>
              <TableCell sx={{ width: '25%' }}>작성</TableCell>
              <TableCell sx={{ width: '25%' }}>검토</TableCell>
              <TableCell sx={{ width: '25%' }}>승인</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>서명</TableCell>
              <TableCell>신동선</TableCell>
              <TableCell>장성주</TableCell>
              <TableCell>이정훈</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>날짜</TableCell>
              <TableCell>2024.07.01</TableCell>
              <TableCell>2024.07.01</TableCell>
              <TableCell>2024.07.01</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
      <SectionTitle sx={{ marginTop: '100px' }}>목차</SectionTitle>
      <StyledList>
        <StyledListItem>
          1. 총칙
        </StyledListItem>
        <StyledListItem sx={{ paddingLeft: '40px' }}>
          1.1. 목적
        </StyledListItem>
        <StyledListItem sx={{ paddingLeft: '40px' }}>
          1.2. 용어의 정의
        </StyledListItem>
        <StyledListItem>
          2. 조직 및 인적 자원 관리
        </StyledListItem>
        <StyledListItem sx={{ paddingLeft: '40px' }}>
          2.1. 조직의 구성
        </StyledListItem>
        <StyledListItem sx={{ paddingLeft: '40px' }}>
          2.2. 직원의 책임
        </StyledListItem>
        <StyledListItem sx={{ paddingLeft: '40px' }}>
          2.3. 교육 훈련
        </StyledListItem>
        <StyledListItem sx={{ paddingLeft: '40px' }}>
          2.4. 직원의 위생
        </StyledListItem>
        <StyledListItem>
          3. 시설 및 설비 관리
        </StyledListItem>
        <StyledListItem sx={{ paddingLeft: '40px' }}>
          3.1. 시설 기준
        </StyledListItem>
        <StyledListItem sx={{ paddingLeft: '40px' }}>
          3.2. 설비 및 기구의 위생관리
        </StyledListItem>
        <StyledListItem>
          4. 원부자재 및 제조 관리
        </StyledListItem>
        <StyledListItem sx={{ paddingLeft: '40px' }}>
          4.1. 원부자재의 관리
        </StyledListItem>
        <StyledListItem sx={{ paddingLeft: '40px' }}>
          4.2. 출고 관리
        </StyledListItem>
        <StyledListItem sx={{ paddingLeft: '40px' }}>
          4.3. 보관 관리
        </StyledListItem>
        <StyledListItem sx={{ paddingLeft: '40px' }}>
          4.4. 물의 품질
        </StyledListItem>
        <StyledListItem sx={{ paddingLeft: '40px' }}>
          4.5. 제조 관리
        </StyledListItem>
        <StyledListItem>
          5. 품질관리
        </StyledListItem>
        <StyledListItem sx={{ paddingLeft: '40px' }}>
          5.1. 시험관리
        </StyledListItem>
        <StyledListItem sx={{ paddingLeft: '40px' }}>
          5.2. 검체의 채취 및 보관
        </StyledListItem>
        <StyledListItem sx={{ paddingLeft: '40px' }}>
          5.3. 폐기처리
        </StyledListItem>
        <StyledListItem sx={{ paddingLeft: '40px' }}>
          5.4. 위탁 계약
        </StyledListItem>
        <StyledListItem sx={{ paddingLeft: '40px' }}>
          5.5. 일탈관리
        </StyledListItem>
        <StyledListItem sx={{ paddingLeft: '40px' }}>
          5.6. 불만처리
        </StyledListItem>
        <StyledListItem sx={{ paddingLeft: '40px' }}>
          5.7. 제품 회수
        </StyledListItem>
        <StyledListItem sx={{ paddingLeft: '40px' }}>
          5.8. 변경관리
        </StyledListItem>
        <StyledListItem sx={{ paddingLeft: '40px' }}>
          5.9. 내부감사
        </StyledListItem>
        <StyledListItem sx={{ paddingLeft: '40px' }}>
          5.10. 문서관리
        </StyledListItem>
      </StyledList>

      <Divider sx={{ marginY: '50px' }} />

      <SectionTitle>1. 총칙</SectionTitle>
      <SubsectionTitle>1.1. 목적</SubsectionTitle>
      <Paragraph>
        본 매뉴얼은 (주)바이오에프디엔씨(이하 '당사')의 제품 제조 및 품질관리에 관한 기준을
        규정하여, 우수한 품질의 제품을 일관되게 생산하고 관리하는 것을 목적으로 한다.
      </Paragraph>
      <SubsectionTitle>1.2. 용어의 정의</SubsectionTitle>
      <StyledList>
        <StyledListItem>
          <strong>1.2.1 "제조"</strong> : 원료 칭량부터 포장 및 표시까지의 일련의 작업
        </StyledListItem>
        <StyledListItem>
          <strong>1.2.2 "원료"</strong> : 제품 제조에 사용되는 물질
        </StyledListItem>
        <StyledListItem>
          <strong>1.2.3 "자재"</strong> : 제품의 용기, 포장재 등 제조에 사용되는 물품
        </StyledListItem>
        <StyledListItem>
          <strong>1.2.4 "원부자재"</strong> : 화장품 원료 및 부자재
        </StyledListItem>
        <StyledListItem>
          <strong>1.2.5 "반제품"</strong> : 최종 제품이 되기 위해 추가적인 제조공정이 더 필요한 중간 단계의 제품
        </StyledListItem>
        <StyledListItem>
          <strong>1.2.6 "제품"</strong> : 모든 제조공정이 완료된 최종 제품
        </StyledListItem>
        <StyledListItem>
          <strong>1.2.7 "제조단위"</strong> : 균질성을 갖는 일정량의 제품
        </StyledListItem>
        <StyledListItem>
          <strong>1.2.8 "제조번호"</strong> : 제조 단위를 식별하는 고유 번호
        </StyledListItem>
        <StyledListItem>
          <strong>1.2.9 "부적합품"</strong> : 규정된 요구사항을 충족하지 않는 원료, 자재, 반제품 또는 제품
        </StyledListItem>
        <StyledListItem>
          <strong>1.2.10 "재작업"</strong> : 부적합 제품을 규정된 품질 요구사항에 적합하도록 다시 가공하는 작업
        </StyledListItem>
        <StyledListItem>
          <strong>1.2.11 "품질보증"</strong> : 제품이 적합 판정 기준을 충족하도록 보장하는 모든 계획된 활동
        </StyledListItem>
        <StyledListItem>
          <strong>1.2.12 "일탈"</strong> : 정해진 기준을 벗어난 행위
        </StyledListItem>
        <StyledListItem>
          <strong>1.2.13 "기준일탈"</strong> : 규정된 적합 판정 기준에 맞지 않는 결과
        </StyledListItem>
        <StyledListItem>
          <strong>1.2.14 "불만"</strong> : 제품 품질에 대한 외부의 부정적 의견
        </StyledListItem>
        <StyledListItem>
          <strong>1.2.15 "회수"</strong> : 품질 문제로 인해 판매된 제품을 수거하는 활동
        </StyledListItem>
        <StyledListItem>
          <strong>1.2.16 "오염"</strong> : 제품의 화학적, 물리적, 미생물학적 문제 발생
        </StyledListItem>
        <StyledListItem>
          <strong>1.2.17 "청소"</strong> : 표면의 먼지 등을 제거하는 작업
        </StyledListItem>
        <StyledListItem>
          <strong>1.2.18 "유지관리"</strong> : 건물과 설비의 적절한 상태 유지를 위한 작업
        </StyledListItem>
        <StyledListItem>
          <strong>1.2.19 "주요 설비"</strong> : 제품 품질에 영향을 미치는 필수 설비
        </StyledListItem>
        <StyledListItem>
          <strong>1.2.20 "교정"</strong> : 측정기기의 정확도 확인 및 조정
        </StyledListItem>
        <StyledListItem>
          <strong>1.2.21 "수탁자"</strong> : 외부에서 작업을 대신 수행하는 주체
        </StyledListItem>
        <StyledListItem>
          <strong>1.2.22 "공정관리"</strong> : 제조공정 중 품질을 모니터링하고 조정하는 작업
        </StyledListItem>
        <StyledListItem>
          <strong>1.2.23 "감사"</strong> : 제조 및 품질관리의 적합성을 조사하는 활동
        </StyledListItem>
        <StyledListItem>
          <strong>1.2.24 "변경관리"</strong> : 제조 및 품질관리 활동의 계획된 변경
        </StyledListItem>
        <StyledListItem>
          <strong>1.2.25 "내부감사"</strong> : 자체 업무담당자에 의한 제조 및 품질관리 조사
        </StyledListItem>
        <StyledListItem>
          <strong>1.2.26 "부자재"</strong> : 제품 포장에 사용되는 재료
        </StyledListItem>
        <StyledListItem>
          <strong>1.2.27 "적합 판정 기준"</strong> : 시험 결과의 허용 범위
        </StyledListItem>
        <StyledListItem>
          <strong>1.2.28 "소모품"</strong> : 청소, 위생, 유지 작업에 사용되는 물품
        </StyledListItem>
        <StyledListItem>
          <strong>1.2.29 "관리"</strong> : 적합 판정 기준 충족 여부 검증
        </StyledListItem>
        <StyledListItem>
          <strong>1.2.30 "제조소"</strong> : 제품, 반제품 제조 장소
        </StyledListItem>
        <StyledListItem>
          <strong>1.2.31 "건물"</strong> : 제품 관련 활동이 이루어지는 물리적 공간
        </StyledListItem>
        <StyledListItem>
          <strong>1.2.32 "위생관리"</strong> : 오염물 제거를 위한 작업
        </StyledListItem>
        <StyledListItem>
          <strong>1.2.33 "출하"</strong> : 제품을 제조소 외부로 운반하는 활동
        </StyledListItem>
        <StyledListItem>
          <strong>1.2.34 "폐기"</strong> : 부적합품을 재작업해도 회복이 불가능하여 본래의 용도로 사용할 수 없게 하는 활동
        </StyledListItem>
        <StyledListItem>
          <strong>1.2.35 "반품"</strong> : 부적합 원료 또는 자재를 공정에 사용할 수 없어 납품업체로 되돌려 보내는 활동
        </StyledListItem>
      </StyledList>

      <Divider sx={{ marginY: '50px' }} />

      <SectionTitle>2. 조직 및 인적 자원 관리</SectionTitle>

      <SubsectionTitle>2.1. 조직의 구성</SubsectionTitle>
      <StyledList>
        <StyledListItem>2.1.1. 품질경영최고책임자</StyledListItem>
        <StyledListItem>2.1.2. 품질보증부: 품질보증책임자, 품질보증담당자, 품질관리담당자</StyledListItem>
        <StyledListItem>2.1.3. 제조생산부: 제조생산책임자, 생산관리담당자, 제조담당자</StyledListItem>
      </StyledList>

      <SubsectionTitle>2.2. 직원의 책임</SubsectionTitle>
      <Paragraph>모든 직원의 상세한 책임은 "업무분장 규정"에 따른다.</Paragraph>
      <StyledList>
        <StyledListItem>2.2.1. 품질경영최고책임자</StyledListItem>
        <StyledList>
          <StyledListItem>2.2.1.1. 품질경영 총괄책임</StyledListItem>
          <StyledListItem>2.2.1.2. 품질방침 수립</StyledListItem>
          <StyledListItem>2.2.1.3. 주요 규정 최종 승인</StyledListItem>
          <StyledListItem>2.2.1.4. 내부감사 결과 검토 및 필요 조치 실행</StyledListItem>
        </StyledList>
        <StyledListItem>2.2.2. 품질보증책임자</StyledListItem>
        <StyledList>
          <StyledListItem>2.2.2.1. 품질보증 업무 총괄</StyledListItem>
          <StyledListItem>2.2.2.2. 문서화, 실행 및 유지 관장, 변경관리 검토 및 승인</StyledListItem>
          <StyledListItem>2.2.2.3. 부적합품 처리 방안 결정</StyledListItem>
          <StyledListItem>2.2.2.4. 시정 및 예방 조치 관리</StyledListItem>
        </StyledList>
        <StyledListItem>2.2.3. 제조생산책임자</StyledListItem>
        <StyledList>
          <StyledListItem>2.2.3.1. 제조 및 생산 업무 총괄</StyledListItem>
          <StyledListItem>2.2.3.2. 제조공정 및 설비 변경에 대한 평가</StyledListItem>
          <StyledListItem>2.2.3.3. 부적합품 처리 방안 강구</StyledListItem>
        </StyledList>
        <StyledListItem>2.2.4. 업무담당자</StyledListItem>
        <StyledList>
          <StyledListItem>2.2.4.1. 각 부서별 업무 수행</StyledListItem>
          <StyledListItem>2.2.4.2. 관련 규정 및 절차 준수</StyledListItem>
          <StyledListItem>2.2.4.3. 업무 수행 중 발생한 문제점 보고</StyledListItem>
          <StyledListItem>2.2.4.4. 품질 향상을 위한 제안 및 개선 활동 참여</StyledListItem>
        </StyledList>
      </StyledList>

      <SubsectionTitle>2.3. 교육 훈련</SubsectionTitle>
      <StyledList>
        <StyledListItem>2.3.1. "교육훈련 규정"에 따라 연간 교육훈련 계획을 수립하고 실행한다.</StyledListItem>
        <StyledListItem>2.3.2. 신규 입사자에 대한 교육을 실시한다.</StyledListItem>
        <StyledListItem>2.3.3. 정기적인 품질 및 안전 교육을 실시한다.</StyledListItem>
        <StyledListItem>2.3.4. 교육 훈련 기록을 유지하고 평가한다.</StyledListItem>
      </StyledList>

      <SubsectionTitle>2.4. 직원의 위생</SubsectionTitle>
      <StyledList>
        <StyledListItem>2.4.1. "작업원 위생관리 규정"에 따라 작업원의 개인위생 상태를 관리한다.</StyledListItem>
        <StyledListItem>2.4.2. 작업원의 건강상태를 주기적으로 점검하고 기록한다.</StyledListItem>
        <StyledListItem>2.4.3. 작업원 위생교육을 정기적으로 실시하고 기록한다.</StyledListItem>
        <StyledListItem>2.4.4. "위생복 착용 규정"에 따라 작업복 착용 규정을 준수한다(구역별 적절한 작업복 착용).</StyledListItem>
        <StyledListItem>2.4.5. "작업원 건강관리 규정"에 따라 정기적인 건강검진을 실시한다.</StyledListItem>
        <StyledListItem>2.4.6. "작업원 수세 및 소독관리 규정"에 따라 위생 상태를 모니터링하고 기록한다.</StyledListItem>
        <StyledListItem>2.4.7. "작업원 수세 및 소독관리 규정"에 따라 작업 전 손 세척 및 소독을 실시한다.</StyledListItem>
        <StyledListItem>2.4.8. 작업장 내 음식물 섭취, 흡연, 음주를 금지한다.</StyledListItem>
        <StyledListItem>2.4.9. 작업 중 개인위생 상태를 주기적으로 점검하고 기록한다.</StyledListItem>
      </StyledList>

      <Divider sx={{ marginY: '50px' }} />

      <SectionTitle>3. 시설 및 설비 관리</SectionTitle>

      <SubsectionTitle>3.1. 시설 기준</SubsectionTitle>
      <StyledList>
        <StyledListItem>3.1.1. 건물</StyledListItem>
        <StyledList>
          <StyledListItem>3.1.1.1. 제조, 시험, 보관에 적합한 구조와 규모를 갖춘다.</StyledListItem>
          <StyledListItem>3.1.1.2. 교차오염 방지를 위한 구역 분리를 한다.</StyledListItem>
          <StyledListItem>3.1.1.3. 적절한 조명, 온도, 습도를 유지한다.</StyledListItem>
        </StyledList>
        <StyledListItem>3.1.2. 시설</StyledListItem>
        <StyledList>
          <StyledListItem>3.1.2.1. 제조에 필요한 설비를 구비한다.</StyledListItem>
          <StyledListItem>3.1.2.2. 품질관리를 위한 시험설비를 구비한다.</StyledListItem>
          <StyledListItem>3.1.2.3. 설비의 설계 및 재질이 제품 품질에 영향을 미치지 않도록 관리한다.</StyledListItem>
        </StyledList>
        <StyledListItem>3.1.3. 작업소의 위생</StyledListItem>
        <StyledList>
          <StyledListItem>3.1.3.1. "작업장 청소 및 소독관리 규정"에 따라 정기적인 청소 및 소독을 실시한다.</StyledListItem>
          <StyledListItem>3.1.3.2. "방충 및 방서 관리 규정"에 따라 해충 및 설치류 관리 프로그램을 운영한다.</StyledListItem>
          <StyledListItem>3.1.3.3. "작업장 위생관리 규정"에 따라 위생 상태를 모니터링하고 기록한다.</StyledListItem>
          <StyledListItem>3.1.3.4. 작업장 내 청결 상태를 주기적으로 점검하고 기록한다.</StyledListItem>
          <StyledListItem>3.1.3.5. 작업장 위생관리 담당자를 지정하고 책임과 권한을 부여한다.</StyledListItem>
          <StyledListItem>3.1.3.6. 작업장 내 위생관리 점검표를 작성하고 주기적으로 점검한다.</StyledListItem>
          <StyledListItem>3.1.3.7. 작업장 위생상태에 대한 내부감사를 연 1회 이상 실시한다.</StyledListItem>
        </StyledList>
        <StyledListItem>3.1.4. 유지관리</StyledListItem>
        <StyledList>
          <StyledListItem>3.1.4.1. "건물, 시설 및 설비 유지관리 규정"에 따라 설비의 정기적인 점검 및 유지보수를 실시한다.</StyledListItem>
          <StyledListItem>3.1.4.2. "계측기 검교정 관리 규정"에 따라 교정이 필요한 장비의 주기적 교정을 실시한다.</StyledListItem>
          <StyledListItem>3.1.4.3. 유지보수 및 교정 기록을 관리한다.</StyledListItem>
          <StyledListItem>3.1.4.4. 작업환경을 주기적으로 모니터링하고 기록한다.</StyledListItem>
        </StyledList>
      </StyledList>

      <SubsectionTitle>3.2. 설비 및 기구의 위생관리</SubsectionTitle>
      <StyledList>
        <StyledListItem>3.2.1. "설비기구 세척 및 소독관리 규정"에 따라 설비 및 기구를 관리한다.</StyledListItem>
        <StyledListItem>3.2.2. 설비 및 기구의 세척, 소독 기록을 유지한다.</StyledListItem>
        <StyledListItem>3.2.3. 세척 및 소독에 사용되는 물품의 적절성을 주기적으로 평가한다.</StyledListItem>
      </StyledList>

      <Divider sx={{ marginY: '50px' }} />

      <SectionTitle>4. 원부자재 및 제조 관리</SectionTitle>
      <SubsectionTitle>4.1. 원부자재의 관리</SubsectionTitle>
      <StyledList>
        <StyledListItem>4.1.1. "원료관리 규정", "부자재 관리 규정" 및 "부자재 입고검사 규정"에 따라 입고 관리를 실시한다.</StyledListItem>
        <StyledListItem>4.1.2. "원료관리 규정" 및 "부자재 관리 규정"에 따라 출고 관리를 실시한다.</StyledListItem>
        <StyledListItem>4.1.3. "원료관리 규정", "부자재 관리 규정" 및 "반제품 관리 규정"에 따라 보관 관리를 실시한다.</StyledListItem>
        <StyledListItem>4.1.4. "제조용수 시험관리 규정"에 따라 물의 품질을 관리한다.</StyledListItem>
        <StyledListItem>4.1.5. "부자재 입고검사 규정"에 따라 입고된 부자재의 품질을 검사하고 기록한다.</StyledListItem>
      </StyledList>

      <SubsectionTitle>4.2. 출고 관리</SubsectionTitle>
      <StyledList>
        <StyledListItem>4.2.1. "원료관리 규정", "부자재 관리 규정" 및 "제품 관리 규정"에 따라 선입선출 원칙을 준수한다.</StyledListItem>
        <StyledListItem>4.2.2. "원료관리 규정", "부자재 관리 규정" 및 "제품 관리 규정"에 따라 출고 전 품질을 확인한다.</StyledListItem>
        <StyledListItem>4.2.3. "원료관리 규정", "부자재 관리 규정" 및 "제품 관리 규정"에 따라 출고 기록을 유지한다.</StyledListItem>
      </StyledList>

      <SubsectionTitle>4.3. 보관 관리</SubsectionTitle>
      <StyledList>
        <StyledListItem>4.3.1. "원료관리 규정", "부자재 관리 규정", "반제품 관리 규정" 및 "제품 관리 규정"에 따라 적절한 보관 조건을 유지한다.</StyledListItem>
        <StyledListItem>4.3.2. "원료관리 규정", "부자재 관리 규정", "반제품 관리 규정" 및 "제품 관리 규정"에 따라 정기적인 재고 확인을 실시한다.</StyledListItem>
        <StyledListItem>4.3.3. "원료관리 규정", "부자재 관리 규정", "반제품 관리 규정" 및 "제품 관리 규정"에 따라 보관 상태를 모니터링하고 기록한다.</StyledListItem>
      </StyledList>

      <SubsectionTitle>4.4. 물의 품질</SubsectionTitle>
      <StyledList>
        <StyledListItem>4.4.1. "제조용수 시험관리 규정"에 따라 제조용수의 품질기준을 설정하고 관리한다.</StyledListItem>
        <StyledListItem>4.4.2. 정기적인 수질 검사를 실시한다.</StyledListItem>
        <StyledListItem>4.4.3. 수질 검사 결과를 기록하고 유지한다.</StyledListItem>
      </StyledList>

      <SubsectionTitle>4.5. 제조 관리</SubsectionTitle>
      <StyledList>
        <StyledListItem>4.5.1. 제품 기준서 및 제조 기록서</StyledListItem>
        <StyledList>
          <StyledListItem>4.5.1.1. 제품별 기준서를 작성하고 관리한다.</StyledListItem>
          <StyledListItem>4.5.1.2. 제조 기록서를 작성하고 관리한다.</StyledListItem>
          <StyledListItem>4.5.1.3. "문서관리 규정"에 따라 문서를 정기적으로 검토하고 개정한다.</StyledListItem>
        </StyledList>
        <StyledListItem>4.5.2. 칭량</StyledListItem>
        <StyledList>
          <StyledListItem>4.5.2.1. 정확한 칭량 절차를 준수한다.</StyledListItem>
          <StyledListItem>4.5.2.2. "기록관리 규정"에 따라 칭량 기록을 유지한다.</StyledListItem>
          <StyledListItem>4.5.2.3. "계측기 검교정 관리 규정"에 따라 칭량 장비의 정기적인 교정을 실시한다.</StyledListItem>
        </StyledList>
        <StyledListItem>4.5.3. 공정 관리</StyledListItem>
        <StyledList>
          <StyledListItem>4.5.3.1. "제조관리 규정"에 따라 제조 지시서에 따라 제조한다.</StyledListItem>
          <StyledListItem>4.5.3.2. 공정 중 품질관리를 실시한다.</StyledListItem>
          <StyledListItem>4.5.3.3. 공정 파라미터를 모니터링하고 기록한다.</StyledListItem>
          <StyledListItem>4.5.3.4. "제조번호 부여 규정"에 따라 각 제조 단위에 고유한 제조번호를 부여한다.</StyledListItem>
          <StyledListItem>4.5.3.5. "제품식별 및 추적성 관리 규정"에 따라 제품의 식별 및 추적이 가능하도록 관리한다.</StyledListItem>
        </StyledList>
        <StyledListItem>4.5.4. 포장 작업</StyledListItem>
        <StyledList>
          <StyledListItem>4.5.4.1. 포장 작업 전 포장 자재의 적절성을 확인한다.</StyledListItem>
          <StyledListItem>4.5.4.2. 포장 자재의 청결 상태를 확인한다.</StyledListItem>
        </StyledList>
        <StyledListItem>4.5.5. 보관 및 출고</StyledListItem>
        <StyledList>
          <StyledListItem>4.5.5.1. "제품 관리 규정"에 따라 완제품의 적절한 보관 조건을 유지한다.</StyledListItem>
          <StyledListItem>4.5.5.2. 출하 전 품질을 확인한다.</StyledListItem>
          <StyledListItem>4.5.5.3. 보관 및 출고 기록을 유지한다.</StyledListItem>
        </StyledList>
      </StyledList>

      <Divider sx={{ marginY: '50px' }} />

      <SectionTitle>5. 품질관리</SectionTitle>

      <SubsectionTitle>5.1. 시험관리</SubsectionTitle>
      <StyledList>
        <StyledListItem>5.1.1. 원료, 반제품, 완제품에 대한 시험을 실시한다.</StyledListItem>
        <StyledListItem>5.1.2. 시험방법의 정확성을 위해 정기적으로 캘리브레이션을 실시한다.</StyledListItem>
        <StyledListItem>5.1.3. 시험 결과를 기록하고 보관한다.</StyledListItem>
        <StyledListItem>5.1.4. "미생물시험 규정"에 따라 필요한 미생물 시험을 실시한다.</StyledListItem>
        <StyledListItem>5.1.5. "시약 관리 규정"에 따라 시험에 사용되는 시약을 관리한다.</StyledListItem>
        <StyledListItem>5.1.6. "표준품 관리 규정"에 따라 표준품을 관리한다.</StyledListItem>
        <StyledListItem>5.1.7. "안정성 시험 규정"에 따라 제품의 안정성 시험을 실시한다.</StyledListItem>
      </StyledList>

      <SubsectionTitle>5.2. 검체의 채취 및 보관</SubsectionTitle>
      <StyledList>
        <StyledListItem>5.2.1. "검체의 채취 및 보관 규정"에 따라 표준화된 검체 채취 방법을 사용한다.</StyledListItem>
        <StyledListItem>5.2.2. 검체를 적절히 보관하고 관리한다.</StyledListItem>
        <StyledListItem>5.2.3. 검체 채취 및 보관 기록을 유지한다.</StyledListItem>
      </StyledList>

      <SubsectionTitle>5.3. 폐기처리</SubsectionTitle>
      <StyledList>
        <StyledListItem>5.3.1. "폐기물 관리 규정"에 따라 부적합품을 적절히 식별하고 격리한다.</StyledListItem>
        <StyledListItem>5.3.2. "부적합품 관리 규정"에 따라 부적합품의 안전한 관리 및 처리 절차를 준수한다.</StyledListItem>
        <StyledListItem>5.3.3. 승인된 절차에 따라 폐기 처리한다.</StyledListItem>
        <StyledListItem>5.3.4. 폐기 처리 기록을 유지한다.</StyledListItem>
      </StyledList>

      <SubsectionTitle>5.4. 공급관리</SubsectionTitle>
      <StyledList>
        <StyledListItem>5.4.1. "구매 및 공급업체 관리 규정"에 따라 원료 및 자재를 조달 한다.</StyledListItem>
        <StyledListItem>5.4.2. 공급업체와의 계약을 관리한다.</StyledListItem>
        <StyledListItem>5.4.3. 공급업체에 대한 정기 평가를 실시한다.</StyledListItem>
      </StyledList>

      <SubsectionTitle>5.5. 일탈관리</SubsectionTitle>
      <StyledList>
        <StyledListItem>5.5.1. "일탈관리 규정"에 따라 일탈 사항을 기록하고 조사한다.</StyledListItem>
        <StyledListItem>5.5.2. 시정 및 예방 조치를 실시한다.</StyledListItem>
        <StyledListItem>5.5.3. 일탈 관리 기록을 유지한다.</StyledListItem>
      </StyledList>

      <SubsectionTitle>5.6. 불만처리</SubsectionTitle>
      <StyledList>
        <StyledListItem>5.6.1. "불만 처리 규정"에 따라 고객 불만을 접수하고 조사한다.</StyledListItem>
        <StyledListItem>5.6.2. "불만 처리 규정"에 따라 불만에 대한 적절한 조치를 취하고 기록한다.</StyledListItem>
        <StyledListItem>5.6.3. "불만 처리 규정"에 따라 불만 처리 결과를 분석하고 개선 활동을 실시한다.</StyledListItem>
        <StyledListItem>5.6.4. 불만 처리 기한을 준수하고, 처리 결과를 고객에게 회신한다.</StyledListItem>
        <StyledListItem>5.6.5. 불만 처리의 후속조치 및 재발 방지 대책을 수립하고 실행한다.</StyledListItem>
      </StyledList>

      <SubsectionTitle>5.7. 제품 회수</SubsectionTitle>
      <StyledList>
        <StyledListItem>5.7.1. "회수반품처리 규정"에 따라 제품 회수 절차를 수립한다.</StyledListItem>
        <StyledListItem>5.7.2. "회수반품처리 규정"에 따라 회수 훈련을 실시한다.</StyledListItem>
        <StyledListItem>5.7.3. "회수반품처리 규정"에 따라 회수 기록을 유지하고 평가한다.</StyledListItem>
      </StyledList>

      <SubsectionTitle>5.8. 변경관리</SubsectionTitle>
      <StyledList>
        <StyledListItem>5.8.1. "변경관리 규정"에 따라 변경 사항에 대한 평가 및 승인을 실시한다.</StyledListItem>
        <StyledListItem>5.8.2. 변경 이력을 관리한다.</StyledListItem>
        <StyledListItem>5.8.3. 변경 후 영향 평가를 실시한다.</StyledListItem>
      </StyledList>

      <SubsectionTitle>5.9. 내부감사</SubsectionTitle>
      <StyledList>
        <StyledListItem>5.9.1. "내부감사 규정"에 따라 연간 내부감사 계획을 수립하고 실행한다.</StyledListItem>
        <StyledListItem>5.9.2. 감사 결과에 따른 시정 조치를 실시한다.</StyledListItem>
        <StyledListItem>5.9.3. 내부감사 결과를 보고하고 기록을 유지한다.</StyledListItem>
      </StyledList>

      <SubsectionTitle>5.10. 문서관리</SubsectionTitle>
      <StyledList>
        <StyledListItem>5.10.1. "문서 및 자료관리 규정"에 따라 문서의 작성, 검토, 승인, 배포, 개정 절차를 준수한다.</StyledListItem>
        <StyledListItem>5.10.2. "기록 관리 규정"에 따라 문서의 보관 및 폐기를 관리한다.</StyledListItem>
        <StyledListItem>5.10.3. 문서 관리 기록을 유지한다.</StyledListItem>
        <StyledListItem>5.10.4. 문서의 수정 시 수정자의 서명, 수정일자, 수정사유를 기록한다.</StyledListItem>
        <StyledListItem>5.10.5. 전자문서 시스템을 사용할 경우, 접근 권한을 관리하고 데이터의 무결성을 보장한다.</StyledListItem>
        <StyledListItem>5.10.6. 품질 관련 기록의 보관 기간은 "기록 관리 규정"에 따른다.</StyledListItem>
      </StyledList>

    </Box>
  );
}

export default BF_RMD_GM_01_Content;

