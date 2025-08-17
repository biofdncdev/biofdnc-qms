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

function BF_RMD_QC_10_Content() {
  return (
    <Box sx={{ padding: '20px', backgroundColor: '#fff', borderRadius: '8px' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <Box>{/* 안정성시험규정*/}
          <Typography>문서번호: BF-RMD-QC-10</Typography>
          
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
        본 규정은 (주)바이오에프디엔씨(이하 "당사"라 한다.)의 제품 생산 전·후 일정한 유통기간 중의 품질의 경시적인 변화 등의 문제점 파악과 기존 제품의 품질향상을 도모하여 품질을 보증하는데 그 목적이 있다.
      </Paragraph>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>2. 적용범위</SectionTitle>
      <Paragraph>
        본 규정은 당사의 제품 제조 관련 모든 업무담당자에 적용하며, 안정성 시험을 실시하는 품목은 안정성이 확립되지 않은 다음의 경우로 한다.
      </Paragraph>
      <StyledList>
        <StyledListItem>2.1 신제품 개발 시</StyledListItem>
        <StyledListItem>2.2 원료 변경 시</StyledListItem>
        <StyledListItem>2.3 제조공정 변경 시(안정성에 영향을 미칠 수 있는 처방 또는 제조에 변경이 있는 경우)</StyledListItem>
        <StyledListItem>2.4 포장 변경 시 (내용물의 품질에 영향을 미칠 수 있는 포장 형태의 변경이 있는 경우)</StyledListItem>
      </StyledList>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>3. 책임과 권한</SectionTitle>
      <SubsectionTitle>3.1 품질경영최고책임자</SubsectionTitle>
      <StyledList>
        <StyledListItem>3.1.1 본 규정에 대한 최종 승인 권한을 가진다.</StyledListItem>
      </StyledList>
      <SubsectionTitle>3.2 품질보증책임자</SubsectionTitle>
      <StyledList>
        <StyledListItem>3.2.1 안정성 시험 규정의 승인 및 운영을 총괄한다.</StyledListItem>
        <StyledListItem>3.2.2 안정성 시험 결과에 대한 최종 평가 및 승인을 한다.</StyledListItem>
      </StyledList>
      <SubsectionTitle>3.3 품질보증담당자</SubsectionTitle>
      <StyledList>
        <StyledListItem>3.3.1 안정성 시험 계획을 수립하고 실행한다.</StyledListItem>
        <StyledListItem>3.3.2 안정성 시험 결과를 평가하고 보고서를 작성한다.</StyledListItem>
        <StyledListItem>3.3.3 안정성 시험 관리를 총괄한다.</StyledListItem>
      </StyledList>
      <SubsectionTitle>3.4 품질관리담당자</SubsectionTitle>
      <StyledList>
        <StyledListItem>3.4.1 안정성 시험을 실시하고 결과를 기록한다.</StyledListItem>
        <StyledListItem>3.4.2 시험기기 관리 및 검체 채취, 보관을 담당한다.</StyledListItem>
      </StyledList>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>4. 용어의 정의</SectionTitle>
      <SubsectionTitle>4.1 안정성 시험</SubsectionTitle>
      <StyledList>
        <StyledListItem>4.1.1 가혹시험: 유통기간 중의 제품을 과장된 온도의 환경에서 단기간에 물리, 화학적 변화를 추정하기 위해 행하는 시험</StyledListItem>
        <StyledListItem>4.1.2 장기보존 시험: 일정한 유통기간 중의 품질을 보관 조건 내에서 경시적 변화를 확인하기 위한 시험</StyledListItem>
      </StyledList>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>5. 안정성 시험 방법 및 업무분장</SectionTitle>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>시험항목</TableCell>
              <TableCell>담당자</TableCell>
              <TableCell>검체</TableCell>
              <TableCell>보관조건</TableCell>
              <TableCell>시험기간</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>가혹시험</TableCell>
              <TableCell>품질관리담당자</TableCell>
              <TableCell>제품(01)BATCH</TableCell>
              <TableCell>45℃, 실온, 4℃</TableCell>
              <TableCell>3일</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>장기보존시험</TableCell>
              <TableCell>품질관리담당자</TableCell>
              <TableCell>일부 품목 관리품</TableCell>
              <TableCell>실온</TableCell>
              <TableCell>1년 이상</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>6. 유형별 시험항목</SectionTitle>
      <Paragraph>
        성상(상분리), 향취, 색상, pH, 점도, 균질성, 이물질, 침전물 등
      </Paragraph>
      <Paragraph>
        * 유형별로 상기 시험항목 중 해당 항목을 선정하여 실시한다.
      </Paragraph>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>7. 시험결과의 종합정리 및 관리</SectionTitle>
      <StyledList>
        <StyledListItem>7.1 시험결과의 데이터를 안정성시험 관리대장(첨부양식)에 종합 기록한다.</StyledListItem>
        <StyledListItem>7.2 안정성 시험기간 중 문제점이 발견되었을 경우에는 즉시 관련부서에 통보하고, 적절한 조치를 강구한다.</StyledListItem>
      </StyledList>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>8. 기록 및 문서 관리</SectionTitle>
      <Paragraph>
        8.1 본 규정에 의해 처리된 문서는 명확한 기록, 관리, 유지하여야 하며, 기타사항은 "기록 관리 규정"에 준한다.
      </Paragraph>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>9. 첨부</SectionTitle>
      <Paragraph>
        첨부 1) 안정성시험결과기록서
      </Paragraph>
    </Box>
  );
}

export default BF_RMD_QC_10_Content;