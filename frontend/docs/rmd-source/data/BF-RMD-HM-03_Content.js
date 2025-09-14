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

function BF_RMD_HM_03_Content() {
  return (
    <Box sx={{ padding: '20px', backgroundColor: '#fff', borderRadius: '8px' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <Box>{/* 작업원 수세 및 소독관리 규정*/}
          <Typography>문서번호: BF-RM-HM-03</Typography>
          
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
        본 규정은 (주)바이오에프디엔씨(이하 "당사"라 함)의 화장품 원료 제조에 종사하는 업무담당자의 수세 및 소독에 관한 관리방법을 규정하여 이행함으로써 화장품 원료의 오염을 방지하는데 목적이 있다.
      </Paragraph>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>2. 적용범위</SectionTitle>
      <Paragraph>
        당사의 제조, 포장공정 및 미생물 실험실에 출입하는 모든 업무담당자와 외부 방문자에 적용한다.
      </Paragraph>

      <Divider sx={{ marginY: '50px' }} />

      <SectionTitle>3. 책임과 권한</SectionTitle>
      <SubsectionTitle>3.1 품질경영최고책임자</SubsectionTitle>
      <StyledList>
        <StyledListItem>3.1.1 수세 및 소독관리 규정의 승인</StyledListItem>
      </StyledList>

      <SubsectionTitle>3.2 품질보증책임자</SubsectionTitle>
      <StyledList>
        <StyledListItem>3.2.1 수세 및 소독관리 규정의 수립 및 이행 감독</StyledListItem>
        <StyledListItem>3.2.2 수세 및 소독 상태 점검 및 개선 조치</StyledListItem>
      </StyledList>

      <SubsectionTitle>3.3 제조생산책임자</SubsectionTitle>
      <StyledList>
        <StyledListItem>3.3.1 제조 구역 내 수세 및 소독 관리 실행</StyledListItem>
        <StyledListItem>3.3.2 수세 및 소독 관련 시설물 유지 관리</StyledListItem>
      </StyledList>

      <SubsectionTitle>3.4 업무담당자</SubsectionTitle>
      <StyledList>
        <StyledListItem>3.4.1 수세 및 소독관리 규정 준수</StyledListItem>
        <StyledListItem>3.4.2 개인 위생 관리</StyledListItem>
      </StyledList>

      <Divider sx={{ marginY: '50px' }} />

      
      <SectionTitle>4. 수세 및 소독 방법</SectionTitle>
      <SubsectionTitle>4.1 화장실</SubsectionTitle>
      <StyledList>
        <StyledListItem>4.1.1 화장실 사용 후 수돗물로 손을 충분히 적신다.</StyledListItem>
        <StyledListItem>4.1.2 손에 비누를 칠한다.</StyledListItem>
        <StyledListItem>4.1.3 손바닥과 손등뿐만 아니라 손톱과 손가락 사이를 3회 이상 문지른다.</StyledListItem>
        <StyledListItem>4.1.4 비누를 충분하게 헹구어내고 1회용 종이 타월 또는 공기 건조기로 손을 건조시킨다.</StyledListItem>
      </StyledList>

      <SubsectionTitle>4.2 제조 및 포장 공정, 원료 보관소, 미생물 실험</SubsectionTitle>
      <StyledList>
        <StyledListItem>4.2.1 제조 및 포장 공정, 원료 보관소, 미생물 실험실 클린벤치 사용전에 라텍스 글로브를 착용한다.</StyledListItem>
        <StyledListItem>4.2.2 라텍스 글로브를 착용한 손에 70% 에탄올 소독제를 적당량 분사한다.</StyledListItem>
        <StyledListItem>4.2.3 손바닥, 손등, 손가락 사이, 손목 부분까지 꼼꼼히 문질러 소독제가 골고루 퍼지도록 한다.</StyledListItem>
        <StyledListItem>4.2.4 70% 에탄올 소독제가 완전히 마를 때까지 기다린다.</StyledListItem>
        <StyledListItem>4.2.5 소독이 완료된 후 작업장에 입실한다.</StyledListItem>
      </StyledList>
    </Box>
  );
}

export default BF_RMD_HM_03_Content;