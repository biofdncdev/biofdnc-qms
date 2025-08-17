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

function BF_RMD_GM_05_Content() {
  return (
    <Box sx={{ padding: '20px', backgroundColor: '#fff', borderRadius: '8px' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <Box>
          {/* 제품 식별 및 추적성 관리 규정*/}
          <Typography>문서번호: BF-RMD-GM-05</Typography>
          
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
        본 규정은 (주)바이오에프디엔씨(이하 "당사" 라 함)의 화장품 원료 제조에 사용되는 원료, 자재 및 제품의 식별 및 추적성 관리에 관한 절차를 수립함으로써 제품의 전 과정에 대한 효과적인 추적관리가 가능하도록 하는데 그 목적이 있다.
      </Paragraph>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>2. 적용범위</SectionTitle>
      <Paragraph>
        본 규정은 화장품 원료 제조에 사용하는 원료, 자재, 반제품, 제품의 식별 및 추적성 관리에 적용한다.
      </Paragraph>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>3. 용어의 정의</SectionTitle>
      <SubsectionTitle>3.1 식별</SubsectionTitle>
      <Paragraph>
        제품, 원료, 자재 등을 구별하여 인식할 수 있도록 하는 것을 말한다.
      </Paragraph>
      <SubsectionTitle>3.2 추적성</SubsectionTitle>
      <Paragraph>
        제품의 이력, 적용 또는 위치를 추적할 수 있는 능력을 말한다.
      </Paragraph>
      <SubsectionTitle>3.3 제조번호(Batch No.)</SubsectionTitle>
      <Paragraph>
        동일한 제조공정으로 제조되어 균질한 품질을 갖는 원자재, 반제품, 제품의 일정한 제조단위에 부여되는 고유한 식별번호를 말한다.
      </Paragraph>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>4. 책임과 권한</SectionTitle>
      <SubsectionTitle>4.1 품질보증책임자</SubsectionTitle>
      <StyledList>
        <StyledListItem>4.1.1 제품 식별 및 추적성 관리에 대한 총괄 책임을 담당한다.</StyledListItem>
        <StyledListItem>4.1.2 제품 식별 및 추적성 관리 시스템을 수립하고 유지한다.</StyledListItem>
      </StyledList>

      <SubsectionTitle>4.2 제조생산책임자</SubsectionTitle>
      <StyledList>
        <StyledListItem>4.2.1 원료, 자재, 반제품 및 제품의 식별 방법을 검토하고 승인한다.</StyledListItem>
      </StyledList>

      <SubsectionTitle>4.3 품질보증담당자</SubsectionTitle>
      <StyledList>
        <StyledListItem>4.3.1 제품의 식별 및 추적성 관리 업무를 실행하고 감독한다.</StyledListItem>
        <StyledListItem>4.3.2 식별 및 추적성 관련 기록을 검토하고 유지한다.</StyledListItem>
      </StyledList>

      <SubsectionTitle>4.4 제조담당자</SubsectionTitle>
      <StyledList>
        <StyledListItem>4.4.1 제품 식별 및 추적성 관리 업무를 실행한다.</StyledListItem>
        <StyledListItem>4.4.2 제조번호 부여 및 관리 업무를 수행한다.</StyledListItem>
      
      </StyledList>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>5. 업무절차</SectionTitle>
      <SubsectionTitle>5.1 원칙</SubsectionTitle>
      <Paragraph>
        모든 원료, 자재, 반제품 및 제품은 고유한 식별 방법을 통해 구별되어야 하며, 제조 및 품질관리의 전 과정에서 추적이 가능하도록 관리한다.
      </Paragraph>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>6. 적합 및 부적합품 식별</SectionTitle>
      <StyledList>
        <StyledListItem>6.1 품질검사 결과에 따라 적합품과 부적합품을 명확히 구분하여 식별한다.</StyledListItem>
        <StyledListItem>6.2 부적합품은 별도의 식별 표시를 하고 격리 보관한다.</StyledListItem>
      </StyledList>

    </Box>
  );
}

export default BF_RMD_GM_05_Content;