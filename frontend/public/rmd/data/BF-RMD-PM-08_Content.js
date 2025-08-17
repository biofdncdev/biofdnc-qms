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

function BF_RMD_PM_08_Content() {
  return (
    <Box sx={{ padding: '20px', backgroundColor: '#fff', borderRadius: '8px' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <Box>{/* 반제품 관리 규정*/}
          <Typography>문서번호: BF-RMD-PM-08</Typography>
          
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
        본 규정은 (주)바이오에프디엔씨의 반제품 관리방법을 규정하여 반제품을 최적의 상태로 유지하고 혼동 및 변질을 예방하는 데 그 목적이 있다.
      </Paragraph>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>2. 용어의 정의</SectionTitle>
      <Paragraph>
        반제품: 최종 제품이 되기 위해 추가적인 제조공정이 더 필요한 중간 단계의 제품으로, 일부 제조 과정을 거쳤으나 아직 완성되지 않은 상태의 제품
      </Paragraph>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>3. 책임과 권한</SectionTitle>
      <SubsectionTitle>3.1 제조생산책임자</SubsectionTitle>
      <StyledList>
        <StyledListItem>반제품의 제조 관리에 대한 총괄 책임</StyledListItem>
      </StyledList>
      <SubsectionTitle>3.2 제조담당자</SubsectionTitle>
      <StyledList>
        <StyledListItem>반제품의 제조, 출고, 보관 관리</StyledListItem>
      </StyledList>
      <SubsectionTitle>3.3 품질보증책임자</SubsectionTitle>
      <StyledList>
        <StyledListItem>반제품의 품질관리 총괄 및 시험 결과 판정</StyledListItem>
      </StyledList>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>4. 반제품 입고</SectionTitle>
      <StyledList>
        <StyledListItem>4.1 제조담당자는 반제품 제조 완료 후 품질보증부서에 검사 의뢰</StyledListItem>
        <StyledListItem>4.2 품질관리담당자는 검사 결과에 따라 적합/부적합 표시</StyledListItem>
      </StyledList>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>5. 보관 관리</SectionTitle>
      <StyledList>
        <StyledListItem>5.1 청결하고 밀폐 가능한 용기에 보관</StyledListItem>
        <StyledListItem>5.2 규정된 보관 조건에서 보관하며 주기적으로 점검</StyledListItem>
        <StyledListItem>5.3 제품명, 제조번호, 제조일자, 제조량 등을 기재한 라벨 부착</StyledListItem>
        <StyledListItem>5.4 6개월 경과 시 재시험 실시</StyledListItem>
      </StyledList>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>6. 부적합 반제품 처리</SectionTitle>
      <StyledList>
        <StyledListItem>6.1 부적합 판정 시 구분 보관 및 원인 분석</StyledListItem>
        <StyledListItem>6.2 재작업 가능 시 품질보증부 지시에 따라 재작업 실시</StyledListItem>
        <StyledListItem>6.3 재시험 결과 부적합 시 폐기</StyledListItem>
      </StyledList>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>7. 반제품의 출고</SectionTitle>
      <StyledList>
        <StyledListItem>7.1 출고 시 품명, 제조량, 시험결과, 제조일자, 제조번호 확인</StyledListItem>
        <StyledListItem>7.2 외주업체 출고 시 제조생산책임자 지시에 따름</StyledListItem>
        <StyledListItem>7.3 반제품의 식별 및 추적성 유지를 위해 출고 기록 관리</StyledListItem>
      </StyledList>

      
    </Box>
  );
}

export default BF_RMD_PM_08_Content;