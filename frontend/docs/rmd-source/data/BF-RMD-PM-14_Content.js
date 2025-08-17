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

function BF_RMD_PM_14_Content() {
  return (
    <Box sx={{ padding: '20px', backgroundColor: '#fff', borderRadius: '8px' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <Box>{/* 라벨 관리 규정*/}
          <Typography>문서번호: BF-RMD-PM-14</Typography>
          
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
        본 규정은 (주)바이오에프디엔씨(이하 "당사"라 함)에서 사용되는 모든 라벨의 관리, 출력, 사용 및 폐기에 관한 기준을 정하여 제품의 품질을 보증하고 생산성을 향상시키는 데 그 목적이 있다.
      </Paragraph>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>2. 적용범위</SectionTitle>
      <Paragraph>
        본 규정은 당사에서 사용되는 모든 라벨에 적용된다.
      </Paragraph>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>3. 용어의 정의</SectionTitle>
      <StyledList>
        <StyledListItem>3.1 라벨: 제품, 원료, 반제품 등의 정보를 표시하기 위해 사용되는 표지</StyledListItem>
        <StyledListItem>3.2 전용 라벨 출력 프로그램: 제품 라벨 출력 및 수량 관리를 위해 사용되는 전문 소프트웨어</StyledListItem>
      </StyledList>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>4. 책임과 권한</SectionTitle>
      <SubsectionTitle>4.1 품질경영최고책임자</SubsectionTitle>
      <StyledList>
        <StyledListItem>4.1.1 라벨 관리 규정의 승인</StyledListItem>
      </StyledList>
      <SubsectionTitle>4.2 품질보증책임자</SubsectionTitle>
      <StyledList>
        <StyledListItem>4.2.1 라벨 관리 규정의 검토 및 승인</StyledListItem>
        <StyledListItem>4.2.2 라벨 내용의 적절성 검토</StyledListItem>
      </StyledList>
      <SubsectionTitle>4.3 제조생산책임자</SubsectionTitle>
      <StyledList>
        <StyledListItem>4.3.1 라벨 관리 업무 총괄</StyledListItem>
        <StyledListItem>4.3.2 라벨 출력 및 사용에 대한 관리·감독</StyledListItem>
      </StyledList>
      <SubsectionTitle>4.4 제조담당자</SubsectionTitle>
      <StyledList>
        <StyledListItem>4.4.1 라벨 출력, 부착 및 관리 업무 수행</StyledListItem>
        <StyledListItem>4.4.2 제품 라벨 재고 관리</StyledListItem>
      </StyledList>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>5. 라벨 관리 절차</SectionTitle>
      <SubsectionTitle>5.1 라벨 설계 및 승인</SubsectionTitle>
      <StyledList>
        <StyledListItem>5.1.2 라벨에는 제품명, 배치번호, 제조일자, 유효기간 등 필수 정보가 포함되어야 한다.</StyledListItem>
      </StyledList>
      <SubsectionTitle>5.2 라벨 출력</SubsectionTitle>
      <StyledList>
        <StyledListItem>5.2.1 제품 라벨은 전용 라벨 출력 프로그램을 통해서 출력한다.</StyledListItem>
        <StyledListItem>5.2.2 제품 라벨 출력 수량은 제조 배치 크기에 따라 전용 프로그램에서 자동으로 계산된다.</StyledListItem>
        <StyledListItem>5.2.3 기타 라벨(원료, 반제품 등)은 별도의 프로그램을 통해 출력한다.</StyledListItem>
        <StyledListItem>5.2.4 라벨 출력 시 제조담당자는 내용의 정확성을 확인해야 한다.</StyledListItem>
      </StyledList>
      <SubsectionTitle>5.3 라벨 사용</SubsectionTitle>
      <StyledList>
        <StyledListItem>5.3.1 라벨은 해당 제품, 원료, 반제품에 정확히 부착되어야 한다.</StyledListItem>
        <StyledListItem>5.3.2 라벨 부착 후 제조담당자는 부착 상태와 내용을 재확인해야 한다.</StyledListItem>
      </StyledList>
      <SubsectionTitle>5.4 라벨 폐기</SubsectionTitle>
      <StyledList>
        <StyledListItem>5.4.1 오류 라벨이나 사용하지 않는 라벨은 즉시 사용할 수 없는 형태로 폐기 처리한다.</StyledListItem>
      </StyledList>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>6. 기록 관리</SectionTitle>
      <StyledList>
        <StyledListItem>6.1 제품 라벨 출력에 관한 기록은 전용 라벨 출력 프로그램에 저장된다.</StyledListItem>
      </StyledList>

    </Box>
  );
}

export default BF_RMD_PM_14_Content;