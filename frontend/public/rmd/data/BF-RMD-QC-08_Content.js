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

function BF_RMD_QC_08_Content() {
  return (
    <Box sx={{ padding: '20px', backgroundColor: '#fff', borderRadius: '8px' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <Box>{/* 시약 관리 규정*/}
          <Typography>문서번호: BF-RMD-QC-08</Typography>
          
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
        본 규정은 (주)바이오에프디엔씨(이하 "당사"라 함)에서 사용되는 시약 및 시액 등의 관리기준을 정하여 품질보증을 위한 정확하고 효율적인 제품 제조 관련 업무를 수행하도록 하는데 그 목적이 있다.
      </Paragraph>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>2. 적용범위</SectionTitle>
      <Paragraph>
        본 규정은 당사의 제품 제조 관련 모든 업무담당자에 적용한다.
      </Paragraph>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>3. 책임과 권한</SectionTitle>
      <SubsectionTitle>3.1 품질경영최고책임자</SubsectionTitle>
      <StyledList>
        <StyledListItem>3.1.1 시약 관리 규정에 대한 최종 승인 권한을 가진다.</StyledListItem>
      </StyledList>
      <SubsectionTitle>3.2 품질보증책임자</SubsectionTitle>
      <StyledList>
        <StyledListItem>3.2.1 시약 및 시액에 대한 사용기준의 준수 여부를 관리, 감독한다.</StyledListItem>
        <StyledListItem>3.2.2 시약 및 시액의 효율적인 관리가 이루어지도록 품질관리담당자를 관리 감독한다.</StyledListItem>
        <StyledListItem>3.2.3 시약 관리에 관한 문서화, 실행 및 유지를 관장한다.</StyledListItem>
        <StyledListItem>3.2.4 시약 관리와 관련된 변경사항을 검토하고 승인한다.</StyledListItem>
      </StyledList>
      <SubsectionTitle>3.3 품질관리담당자</SubsectionTitle>
      <StyledList>
        <StyledListItem>3.3.1 정기적으로 시약 및 시액의 유효기간 경과 여부, 변질 여부 및 잔량 등을 확인한 후, 구매 또는 폐기 조치를 취한다.</StyledListItem>
        <StyledListItem>3.3.2 시약 및 시액의 보관 및 관리를 수행하고, 적절한 보관조건하에서 보관한다.</StyledListItem>
      </StyledList>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>4. 시액 (Solution)의 조제</SectionTitle>
      <StyledList>
        <StyledListItem>4.1 품질관리담당자는 표준시험법 (예, 화장품 안전기준 등에 관한 규정 등) 및 허가사항에 준하여 시액을 조제한다. 단, 정확한 농도관리가 필요한 시액은 구매해서 사용한다.</StyledListItem>
        <StyledListItem>4.2 조제 완료된 시액병에 첨부 "시약라벨"을 부착한다.</StyledListItem>
        <StyledListItem>4.3 낮은 농도의 시액은 같은 종류 시액을 일정 비율로 희석하여 사용한다.</StyledListItem>
      </StyledList>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>5. 시액 및 시약의 보관 및 관리</SectionTitle>
      <StyledList>
        <StyledListItem>5.1 시약 및 시액이 담긴 용기에는 반드시 첨부 라벨을 부착하여 적합한 보관조건하에서 보관한다.</StyledListItem>
        <StyledListItem>5.2 별도의 규정이 없는 한 시약 및 시액은 공급업체가 제공한 원용기에 보관하고, 냉장보관 시약 및 시액은 냉장고에 보관한다.</StyledListItem>
      </StyledList>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>6. 유효기간</SectionTitle>
      <StyledList>
        <StyledListItem>6.1 시약의 유효기간은 따로 정해져 있으면 이에 따르고, 기타 이외의 것은 제조일로부터 2년으로 한다.</StyledListItem>
        <StyledListItem>6.2 시액의 유효기간은 따로 정해져 있으면 이에 따르고, 기타 이외의 것은 제조일로부터 6개월로 한다.</StyledListItem>
      </StyledList>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>7. 폐기</SectionTitle>
      <StyledList>
        <StyledListItem>7.1 사용 시 조제하여야 하는 시액은 사용 후 전량 폐기한다.</StyledListItem>
        <StyledListItem>7.2 보관 중 침전이 생긴 시액은 폐기한다.</StyledListItem>
        <StyledListItem>7.3 폐기방법은 과량의 물에 희석하여 처리함을 원칙으로 하며, 냄새가 심한 것은 후드 안에서 물에 희석하여 처리한다.</StyledListItem>
        <StyledListItem>7.4 이물혼입, 교차오염 등으로 사용할 수 없거나 유효기간이 경과한 것은 폐수처리 수거용 폐수배관에 버린다.</StyledListItem>
      </StyledList>

    </Box>
  );
}

export default BF_RMD_QC_08_Content;
