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

function BF_RMD_HM_01_Content() {
  return (
    <Box sx={{ padding: '20px', backgroundColor: '#fff', borderRadius: '8px' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <Box>{/* 방충 및 방서 관리 규정*/}
          <Typography>문서번호: BF-RM-HM-01</Typography>
          
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
        본 규정은 (주)바이오에프디엔씨(이하 '당사'라 한다)의 화장품 원료 제조소 내 해충 및 쥐 등의 침입을 사전에 차단하고 지속적인 방제와 관리를 통하여 제조소의 위생 및 환경이 오염되지 않도록 하며 품질이 보증된 우수한 화장품 원료를 생산, 공급하는데 그 목적이 있다.
      </Paragraph>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>2. 적용범위</SectionTitle>
      <Paragraph>
        본 규정은 당사 화장품 원료 제조소 내 방충, 방서를 위하여 필요한 모든 부분에 대하여 적용한다.
      </Paragraph>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>3. 책임과 권한</SectionTitle>
      <SubsectionTitle>3.1 품질경영최고책임자</SubsectionTitle>
      <StyledList>
        <StyledListItem>3.1.1 방충 및 방서 관리 규정의 승인</StyledListItem>
      </StyledList>

      <SubsectionTitle>3.2 품질보증책임자</SubsectionTitle>
      <StyledList>
        <StyledListItem>3.2.1 방충 및 방서 관리 규정의 수립 및 이행 감독</StyledListItem>
        <StyledListItem>3.2.2 방충 전문 협력업체 선정 및 관리 감독</StyledListItem>
        <StyledListItem>3.2.3 소독약 투약 시 이로 인한 제품의 오염이 되지 않도록 관리, 감독</StyledListItem>
        <StyledListItem>3.2.4 방충, 방서 이상 발생 시 적절한 조치 실시</StyledListItem>
      </StyledList>

      <SubsectionTitle>3.3 제조생산책임자</SubsectionTitle>
      <StyledList>
        <StyledListItem>3.3.1 제조 구역 내 방충 및 방서 관리 실행</StyledListItem>
        <StyledListItem>3.3.2 방충 및 방서 관련 시설물 유지 관리</StyledListItem>
      </StyledList>

      <SubsectionTitle>3.4 업무담당자</SubsectionTitle>
      <StyledList>
        <StyledListItem>3.4.1 일상적인 방충 및 방서 관리 업무 수행</StyledListItem>
        <StyledListItem>3.4.2 방충 및 방서 관련 기록 유지</StyledListItem>
      </StyledList>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>4. 방충관리 방법</SectionTitle>
      <StyledList>
        <StyledListItem>4.1 외부 출입구에 포충등을 설치한다.</StyledListItem>
        <StyledListItem>4.2 외벽에 설치된 창문에는 방충망을 설치한다.</StyledListItem>
      </StyledList>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>5. 방서관리</SectionTitle>
      <StyledList>
        <StyledListItem>5.1 외부로 통하는 출입문에는 방서장치를 설치한다.</StyledListItem>
        <StyledListItem>5.3 파이프나 덕트가 벽을 통과한 곳은 밀폐시킨다.</StyledListItem>
        
      </StyledList>
      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>6. 방충, 방서 시설의 점검 및 관리</SectionTitle>
      <SubsectionTitle>6.1 정기 점검</SubsectionTitle>
      <Paragraph>
        업무담당자는 방충 및 방서 시설의 상태를 주 1회 점검한다. 점검 대상에는 방서장치, 방충망, 포충등 등이 포함된다. 점검 결과 문제점 발견 시 제조생산책임자에게 보고하고 적절한 조치를 취한다.
      </Paragraph>

      <SubsectionTitle>6.2 방충 관리 위탁 서비스</SubsectionTitle>
      <StyledList>
        <StyledListItem>6.2.1 외부 방충 전문업체를 통하여 UV 포충등의 상태를 매월 1회 점검하고 그 결과를 보고 받는다.</StyledListItem>
        <StyledListItem>6.2.2 점검 결과 문제점 발견 시 외부 방충 전문업체의 지원을 받아 적절한 조치를 취한다.</StyledListItem>
      </StyledList>

    </Box>
  );
}

export default BF_RMD_HM_01_Content;