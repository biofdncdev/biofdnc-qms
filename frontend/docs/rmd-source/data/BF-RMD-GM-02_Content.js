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

function BF_RMD_GM_02_Content() {
  return (
    <Box sx={{ padding: '20px', backgroundColor: '#fff', borderRadius: '8px' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <Box>
          {/* 업무분장 규정*/}
          <Typography>문서번호: BF-RM-GM-02</Typography>
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
      
      <SectionTitle sx={{ marginTop: '100px' }}>1. 목적</SectionTitle>
      <Paragraph>
          본 규정은 (주)바이오에프디엔씨(이하 '당사')의 화장품 원료 제조 및 품질관리를 효율적으로 수행하기 위한 조직과 직무를 규정하고, 직무의 분담 범위와 권한 및 책임을 명확히 하여 품질이 보장된 우수 화장품 원료를 제조 공급하는 것을 목적으로 한다.
      </Paragraph>

      <Divider sx={{ marginY: '50px' }} />

      <SectionTitle>2. 적용범위</SectionTitle>
      <Paragraph>
        본 규정은 당사에서 수행되는 화장품 원료의 제조, 품질관리, 보관 및 출하 등 모든 관련 활동에 직접 또는 간접적으로 관여하는 모든 조직과 업무담당자의 책임에 적용한다.
      </Paragraph>

      <Divider sx={{ marginY: '50px' }} />

      <SectionTitle>3. 용어의 정의</SectionTitle>
      <StyledList>
        <StyledListItem>
          <strong>3.1 품질경영시스템</strong>: 품질에 관하여 조직을 지휘하고 관리하기 위한 경영시스템
        </StyledListItem>
        <StyledListItem>
          <strong>3.2 품질방침</strong>: 최고경영자에 의해 공식적으로 표명된 품질관련 조직의 전반적인 의도 및 방향
        </StyledListItem>
        <StyledListItem>
          <strong>3.3 품질목표</strong>: 품질에 관해 추구하거나 지향하는 것
        </StyledListItem>
        <StyledListItem>
          <strong>3.4 품질계획</strong>: 품질목표를 설정하고 달성하기 위한 운영프로세스 및 자원을 규정하는 품질경영의 일부
        </StyledListItem>
        <StyledListItem>
          <strong>3.5 품질관리</strong>: 품질요구사항을 충족시키는데 중점을 둔 품질경영의 일부
        </StyledListItem>
        <StyledListItem>
          <strong>3.6 품질보증</strong>: 품질요구사항이 충족될 것이라는 확신을 제공하는데 중점을 둔 품질경영의 일부
        </StyledListItem>
        <StyledListItem>
          <strong>3.7 품질개선</strong>: 품질요구사항을 충족시키는 능력을 증진시키는데 중점을 둔 품질경영의 일부
        </StyledListItem>
        <StyledListItem>
          <strong>3.8 시정</strong>: 발견된 부적합을 제거하기 위한 조치
        </StyledListItem>
        <StyledListItem>
          <strong>3.9 예방조치</strong>: 잠재적 부적합 또는 기타 바람직하지 않은 잠재적 상황의 원인을 제거하기 위한 조치
        </StyledListItem>
      </StyledList>

      <Divider sx={{ marginY: '50px' }} />

      <SectionTitle>4. 각 부문 책임자 및 업무 분장</SectionTitle>

      <SubsectionTitle>4.1 품질경영최고책임자</SubsectionTitle>
      <StyledList>
        <StyledListItem>4.1.1 품질경영 총괄책임</StyledListItem>
        <StyledListItem>4.1.2 품질방침 수립</StyledListItem>
        <StyledListItem>4.1.3 주요 규정 최종 승인</StyledListItem>
        <StyledListItem>4.1.4 내부감사 결과 검토 및 필요 조치 실행</StyledListItem>
      </StyledList>

      <SubsectionTitle>4.2 품질보증책임자</SubsectionTitle>
      <StyledList>
        <StyledListItem>4.2.1 품질보증 업무 총괄</StyledListItem>
        <StyledListItem>4.2.2 문서화, 실행 및 유지 관장, 변경관리 검토 및 승인</StyledListItem>
        <StyledListItem>4.2.3 부적합품 처리 방안 결정</StyledListItem>
        <StyledListItem>4.2.4 시정 및 예방 조치 관리</StyledListItem>
        <StyledListItem>4.2.5 원료, 부자재, 반제품, 제품의 품질관리 총괄</StyledListItem>
        <StyledListItem>4.2.6 품질관리 기준서 및 제품 표준서 관리</StyledListItem>
        <StyledListItem>4.2.7 시험 성적서 발행 및 시험담당자 지정</StyledListItem>
        <StyledListItem>4.2.8 시험 항목, 기준 및 방법 검토 및 설정</StyledListItem>
        <StyledListItem>4.2.9 시험결과 확인 및 적부 판정</StyledListItem>
        <StyledListItem>4.2.10 국내외 화장품법규 파악 및 준수</StyledListItem>
        <StyledListItem>4.2.11 품질관리 계획 수립 및 실시</StyledListItem>
        <StyledListItem>4.2.12 검사, 측정 및 시험기기 관리</StyledListItem>
        <StyledListItem>4.2.13 시정, 예방조치 및 불만처리 주관</StyledListItem>
        <StyledListItem>4.2.14 내부감사 계획 및 실시</StyledListItem>
        <StyledListItem>4.2.15 교육훈련 총괄관리</StyledListItem>
        <StyledListItem>4.2.16 협력업체 평가 및 선정</StyledListItem>
        <StyledListItem>4.2.17 기록관리, 문서관리, 변경관리 총괄</StyledListItem>
        <StyledListItem>4.2.18 위수탁생산 및 서비스 관리</StyledListItem>
        <StyledListItem>4.2.19 회수 및 반품처리, 폐기물 처리 총괄</StyledListItem>
        <StyledListItem>4.2.20 일탈관리, 안정성 시험 총괄</StyledListItem>
      </StyledList>

      <SubsectionTitle>4.3 제조생산책임자</SubsectionTitle>
      <StyledList>
        <StyledListItem>4.3.1 제조 및 생산 업무 총괄</StyledListItem>
        <StyledListItem>4.3.2 제조공정 및 설비 변경에 대한 평가</StyledListItem>
        <StyledListItem>4.3.3 부적합품 처리 방안 강구</StyledListItem>
        <StyledListItem>4.3.4 제조 공정관리 및 개선</StyledListItem>
        <StyledListItem>4.3.5 제조설비 유지관리 및 구매 계획</StyledListItem>
        <StyledListItem>4.3.6 제조관련 문서 관리</StyledListItem>
        <StyledListItem>4.3.7 반제품 및 제품 관리</StyledListItem>
        <StyledListItem>4.3.8 원료 및 부자재 관리</StyledListItem>
        <StyledListItem>4.3.9 작업장 및 작업원 위생관리</StyledListItem>
        <StyledListItem>4.3.10 제조번호 부여 관리</StyledListItem>
        <StyledListItem>4.3.11 공급업체 평가작성 및 관리</StyledListItem>
        <StyledListItem>4.3.12 부적합품 관리</StyledListItem>
      </StyledList>

      <SubsectionTitle>4.4 업무담당자</SubsectionTitle>
      <StyledList>
        <StyledListItem>4.4.1 소속 부서별 업무 수행</StyledListItem>
        <StyledListItem>4.4.2 관련 규정 및 절차 준수</StyledListItem>
        <StyledListItem>4.4.3 업무 수행 중 발생한 문제점 보고</StyledListItem>
        <StyledListItem>4.4.4 품질 향상을 위한 제안 및 개선 활동 참여</StyledListItem>
      </StyledList>

      <Divider sx={{ marginY: '50px' }} />

      <SectionTitle>5. 각 부서별 담당자 업무분장</SectionTitle>

      <SubsectionTitle>5.1 품질보증부</SubsectionTitle>

      <SubsectionTitle sx={{ paddingLeft: '20px' }}>5.1.1 품질보증담당자</SubsectionTitle>
      <StyledList>
        <StyledListItem>5.1.1.1 품질경영 운영계획 및 교육계획 수립</StyledListItem>
        <StyledListItem>5.1.1.2 불만처리 분석 및 재발방지 대책 수립</StyledListItem>
        <StyledListItem>5.1.1.3 품질 정보 관리 및 보고서 작성</StyledListItem>
        <StyledListItem>5.1.1.4 공급업체 선정</StyledListItem>
        <StyledListItem>5.1.1.5 품질 문서 및 기록 관리</StyledListItem>
        <StyledListItem>5.1.1.6 시정조치 및 예방조치 관리</StyledListItem>
        <StyledListItem>5.1.1.7 일탈, 불만, 회수, 변경관리 주관</StyledListItem>
        <StyledListItem>5.1.1.8 품질 관련 인허가 관리</StyledListItem>
        <StyledListItem>5.1.1.9 모니터링 및 측정장비 검교정 관리</StyledListItem>
        <StyledListItem>5.1.1.10 제품의 식별 및 추적성 관리</StyledListItem>
        <StyledListItem>5.1.1.11 위수탁생산 및 서비스 관리</StyledListItem>
        <StyledListItem>5.1.1.12 폐기물 처리 관리</StyledListItem>
        <StyledListItem>5.1.1.13 안정성 시험 관리</StyledListItem>
      </StyledList>

      <SubsectionTitle sx={{ paddingLeft: '20px' }}>5.1.2 품질관리담당자</SubsectionTitle>
      <StyledList>
        <StyledListItem>5.1.2.1 시험기기 관리</StyledListItem>
        <StyledListItem>5.1.2.2 원료, 부자재, 반제품, 제품의 품질검사</StyledListItem>
        <StyledListItem>5.1.2.3 검체 채취 및 보관관리</StyledListItem>
        <StyledListItem>5.1.2.4 계측기 검교정 관리</StyledListItem>
        <StyledListItem>5.1.2.5 제조용수 시험관리</StyledListItem>
        <StyledListItem>5.1.2.6 미생물시험 및 환경모니터링</StyledListItem>
        <StyledListItem>5.1.2.7 시약 및 표준품 관리</StyledListItem>
      </StyledList>

      <SubsectionTitle>5.2 제조생산부</SubsectionTitle>

      <SubsectionTitle sx={{ paddingLeft: '20px' }}>5.2.1 생산관리담당자</SubsectionTitle>
      <StyledList>
        <StyledListItem>5.2.1.1 생산 계획 수립 및 실행</StyledListItem>
        <StyledListItem>5.2.1.2 제조 및 포장 공정 관리</StyledListItem>
        <StyledListItem>5.2.1.3 작업장 위생관리</StyledListItem>
        <StyledListItem>5.2.1.4 원료 및 부자재 구매 관리</StyledListItem>
        <StyledListItem>5.2.1.5 생산 관련 비용 관리</StyledListItem>
        <StyledListItem>5.2.1.6 작업원 위생 및 건강관리</StyledListItem>
        <StyledListItem>5.2.1.7 폐기물 관리</StyledListItem>
        <StyledListItem>5.2.1.8 설비 및 기구 관리</StyledListItem>
        <StyledListItem>5.2.1.9 출하 지시 및 관리</StyledListItem>
      </StyledList>

      <SubsectionTitle sx={{ paddingLeft: '20px' }}>5.2.2 제조담당자</SubsectionTitle>
      <StyledList>
        <StyledListItem>5.2.2.1 제조 지시 및 기록 관리</StyledListItem>
        <StyledListItem>5.2.2.2 원료 칭량 및 제조 업무</StyledListItem>
        <StyledListItem>5.2.2.3 제조공정 위생관리</StyledListItem>
        <StyledListItem>5.2.2.4 제조공정 개선 및 보완</StyledListItem>
        <StyledListItem>5.2.2.5 반제품 및 완제품 관리</StyledListItem>
        <StyledListItem>5.2.2.6 충진 및 포장 공정 업무</StyledListItem>
        <StyledListItem>5.2.2.7 제품 식별 및 추적성 관리</StyledListItem>
        <StyledListItem>5.2.2.8 설비 유지보수 관리</StyledListItem>
      </StyledList>
    </Box>
  );
}

export default BF_RMD_GM_02_Content;