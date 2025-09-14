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

function BF_RMD_QC_05_Content() {
  return (
    <Box sx={{ padding: '20px', backgroundColor: '#fff', borderRadius: '8px' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <Box>{/* 부자재 입고검사 규정*/}
          <Typography>문서번호: BF-RM-QC-05</Typography>
          
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
        본 규정은 (주)바이오에프디엔씨(이하 '당사'라 함)에서 사용되는 자재의 입고검사 업무에 관한 사항을 간소화하여 규정함으로써 효율적인 품질관리를 수행하는 데 그 목적이 있다.
      </Paragraph>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>2. 적용범위</SectionTitle>
      <Paragraph>
        본 규정은 당사에서 생산되는 제품에 사용되는 모든 자재에 대해 적용한다.
      </Paragraph>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>3. 책임과 권한</SectionTitle>
      <SubsectionTitle>3.1 품질경영최고책임자</SubsectionTitle>
      <StyledList>
        <StyledListItem>3.1.1 자재 입고검사 관련 규정을 승인한다.</StyledListItem>
      </StyledList>
      <SubsectionTitle>3.2 품질보증책임자</SubsectionTitle>
      <StyledList>
        <StyledListItem>3.2.1 자재 입고검사 업무를 총괄한다.</StyledListItem>
        <StyledListItem>3.2.2 이상 발생 시 최종 판정한다.</StyledListItem>
      </StyledList>
      <SubsectionTitle>3.3 생산관리담당자</SubsectionTitle>
      <StyledList>
        <StyledListItem>3.3.1 이상 발생 시 품질보증책임자와 협의하여 처리한다.</StyledListItem>
      </StyledList>
      <SubsectionTitle>3.4 입고담당자</SubsectionTitle>
      <StyledList>
        <StyledListItem>3.4.1 자재의 입고검사 업무를 수행하고 그 결과를 기록한다.</StyledListItem>
        <StyledListItem>3.4.2 이상 발생 시 생산관리담당자와 품질보증책임자에게 보고한다.</StyledListItem>
      </StyledList>
      <Divider sx={{ marginY: '50px' }} />
      <SectionTitle>4. 입고 검사 절차</SectionTitle>
      <StyledList>
        <StyledListItem sx={{ display: 'flex' }}>
          <Box sx={{ width: '50%', flexShrink: 0 }}>
            4.1 입고담당자는 입고된 자재에 대해 다음의 검사항목에 따라 검사를 실시한다:
          </Box>
          <StyledList sx={{ flexGrow: 1 }}>
            <StyledListItem>- 자재명 확인</StyledListItem>
            <StyledListItem>- 수량 확인</StyledListItem>
            <StyledListItem>- 외관 상태 확인</StyledListItem>
            <StyledListItem>- 포장 상태 확인</StyledListItem>
            <StyledListItem>- 내부 이물질 혼입 여부 확인</StyledListItem>
            <StyledListItem>- 파손된 제품 포함 여부 확인</StyledListItem>
          </StyledList>
        </StyledListItem>
        <StyledListItem>4.2 입고담당자는 검사 결과를 전산 시스템에 기록한다.</StyledListItem>
        <StyledListItem>4.3 이상이 발견된 경우, 입고담당자는 즉시 생산관리담당자와 품질보증책임자에게 보고한다.</StyledListItem>
        <StyledListItem>4.4 품질보증책임자는 보고된 이상에 대해 최종 판정한다.</StyledListItem>
      </StyledList>

      <Divider sx={{ marginY: '50px' }} />
      <SectionTitle>5. 부적합품의 처리</SectionTitle>
      <StyledList>
        <StyledListItem>5.1 부적합으로 판정된 자재는 반품 처리한다.</StyledListItem>
      </StyledList>


    </Box>
  );
}

export default BF_RMD_QC_05_Content;