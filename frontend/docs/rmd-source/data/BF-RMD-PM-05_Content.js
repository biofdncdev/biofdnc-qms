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

function BF_RMD_PM_05_Content() {
  return (
    <Box sx={{ padding: '20px', backgroundColor: '#fff', borderRadius: '8px' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <Box>{/* 자재 관리 규정*/}
          <Typography>문서번호: BF-RM-PM-05</Typography>
          
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
        본 규정은 (주)바이오에프디엔씨(이하 '당사'라 한다.)의 제품 제조에 사용되는 자재를 납품업체로부터 인수 및 입고에서 출고까지의 각 단계마다 관리방법을 규정하고 실행함으로써 자재의 인위적 과오 및 사고발생을 방지하는 것을 목적으로 한다.
      </Paragraph>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>2. 적용범위</SectionTitle>
      <Paragraph>
        본 규정은 당사에서 사용하는 모든 자재에 대해 적용한다.
      </Paragraph>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>3. 용어의 정의</SectionTitle>
      <SubsectionTitle>3.1 용기 (CONTAINER)</SubsectionTitle>
      <Paragraph>
        제품 제조 시 사용되는 용기라 함은 제품에 직접 접촉되는 1차 자재를 말한다.
      </Paragraph>
      <SubsectionTitle>3.2 포장재료 (PACKAGING MATERIAL)</SubsectionTitle>
      <Paragraph>
        상기 3.1항에 해당되지 않는 자재로서 BOX 등을 말한다.
      </Paragraph>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>4. 책임과 권한</SectionTitle>
      <SubsectionTitle>4.1 품질경영최고책임자</SubsectionTitle>
      <StyledList>
        <StyledListItem>자재 관리에 대한 총괄 책임</StyledListItem>
      </StyledList>
      <SubsectionTitle>4.2 품질보증책임자</SubsectionTitle>
      <StyledList>
        <StyledListItem>자재 관리에 대한 총괄 관리</StyledListItem>
      </StyledList>
      <SubsectionTitle>4.3 제조생산책임자</SubsectionTitle>
      <StyledList>
        <StyledListItem>자재의 입고 및 보관, 출고에 대한 관리 책임</StyledListItem>
      </StyledList>
      <SubsectionTitle>4.4 생산관리담당자</SubsectionTitle>
      <StyledList>
        <StyledListItem>4.4.1 자재 입고 시 거래명세서와 입고품 확인</StyledListItem>
        <StyledListItem>4.4.2 입고 검사 수행 및 적합 판정</StyledListItem>
        <StyledListItem>4.4.3 입고 검사 적합품 입고 및 보관 관리</StyledListItem>
        <StyledListItem>4.4.4 제조부서의 출고의뢰에 따른 자재 출고</StyledListItem>
        <StyledListItem>4.4.5 자재 보관장소의 온도, 습도 등 환경 조건 모니터링</StyledListItem>
      </StyledList>
      <SubsectionTitle>4.5 품질관리담당자</SubsectionTitle>
      <StyledList>
        <StyledListItem>4.5.1 필요시 자재 검사 수행</StyledListItem>
        <StyledListItem>4.5.2 입고품 부적합 발생 시 원인 조사 및 해당 협력사에 시정조치 요구</StyledListItem>
      </StyledList>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>5. 업무 절차</SectionTitle>
      <SubsectionTitle>5.1 자재의 입고</SubsectionTitle>
      <StyledList>
        <StyledListItem>5.1.1 생산관리담당자는 자재 입고 시 거래명세서와 현품을 대조 비교하고, 포장상태를 확인한다.</StyledListItem>
        <StyledListItem>5.1.2 입고 검사를 수행하고 적합 여부를 판정한다. 필요시 품질관리담당자에게 검사를 의뢰할 수 있다.</StyledListItem>
        <StyledListItem>5.1.3 부적합 사항 발견 시 해당 협력사에 반품하거나 적절한 시정 조치를 요구한다.</StyledListItem>
      </StyledList>
      <SubsectionTitle>5.2 자재의 보관</SubsectionTitle>
      <StyledList>
        <StyledListItem>5.2.1 입고한 자재를 용도별로 구분 보관한다.</StyledListItem>
        <StyledListItem>5.2.2 혼동 방지를 위해 자재를 명확히 구분하여 관리한다.</StyledListItem>
        <StyledListItem>5.2.3 변질 예방을 위해 적절한 온도 관리 및 보관 상태를 점검한다.</StyledListItem>
        <StyledListItem>5.2.4 생산관리담당자는 매 분기 1회 재고 조사 및 자재관리 상태를 점검한다.</StyledListItem>
      </StyledList>
      <SubsectionTitle>5.3 자재의 출고</SubsectionTitle>
      <StyledList>
        <StyledListItem>5.3.1 생산관리담당자는 제조부서의 요청에 따라 자재를 출고한다.</StyledListItem>
        <StyledListItem>5.3.2 출고 시 자재명, 입고일자, 수량, 적합여부, 포장상태 등을 확인한다.</StyledListItem>
      </StyledList>
      <SubsectionTitle>5.4 보안 및 안전관리</SubsectionTitle>
      <StyledList>
        <StyledListItem>5.4.1 자재 보관장소의 출입을 통제한다.</StyledListItem>
        <StyledListItem>5.4.2 화재 및 도난 방지를 위한 적절한 조치를 취한다.</StyledListItem>
      </StyledList>

    </Box>
  );
}

export default BF_RMD_PM_05_Content;