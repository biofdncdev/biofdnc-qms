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

function BF_RMD_HM_07_Content() {
  return (
    <Box sx={{ padding: '20px', backgroundColor: '#fff', borderRadius: '8px' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <Box>{/* 작업장 위생관리 규정*/}
          <Typography>문서번호: BF-RMD-HM-07</Typography>
          
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
        본 규정은 (주)바이오에프디엔씨(이하 "당사"라 함)의 제조 환경을 적절히 유지하여 제조 공정에서의 제품 오염을 방지할 수 있도록 작업장 및 설비의 청소 및 소독방법과 위생에 관한 사항을 규정함으로써 우수한 화장품 원료를 제조하는 데 그 목적이 있다.
      </Paragraph>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>2. 적용범위</SectionTitle>
      <Paragraph>
        본 규정은 당사의 모든 제품 제조 및 포장 등의 작업실과 원료, 자재, 반제품, 제품 보관소 및 품질관리 구역 등에 대해서 적용한다.
      </Paragraph>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>3. 책임과 권한</SectionTitle>
      <SubsectionTitle>3.1 품질경영최고책임자</SubsectionTitle>
      <StyledList>
        <StyledListItem>3.1.1 작업장 위생관리에 대한 총괄 책임</StyledListItem>
      </StyledList>

      <SubsectionTitle>3.2 품질보증책임자</SubsectionTitle>
      <StyledList>
        <StyledListItem>3.2.1 작업장 위생관리 규정의 제정 및 개정</StyledListItem>
        <StyledListItem>3.2.2 작업장 위생관리 상태의 주기적 점검 및 개선 조치</StyledListItem>
      </StyledList>

      <SubsectionTitle>3.3 생산관리책임자</SubsectionTitle>
      <StyledList>
        <StyledListItem>3.3.1 작업장 및 설비의 청소 및 소독 관리</StyledListItem>
        <StyledListItem>3.3.2 원료, 자재, 반제품, 제품 보관소의 청소 및 소독 관리</StyledListItem>
        <StyledListItem>3.3.3 작업장 시설의 위생관리에 관한 외부용역 업무 주관</StyledListItem>
        <StyledListItem>3.3.4 작업원 위생 및 건강관리 총괄</StyledListItem>
      </StyledList>

      <SubsectionTitle>3.4 품질관리담당자</SubsectionTitle>
      <StyledList>
        <StyledListItem>3.4.1 품질관리 관련 구역의 청소 및 소독 관리</StyledListItem>
      </StyledList>

      <SubsectionTitle>3.5 제조담당자</SubsectionTitle>
      <StyledList>
        <StyledListItem>3.5.1 일상적인 작업장 청소 및 소독 실시</StyledListItem>
        <StyledListItem>3.5.2 작업장 위생 상태의 일일 점검 및 기록</StyledListItem>
      </StyledList>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>4. 업무 절차</SectionTitle>
      <SubsectionTitle>4.1 작업장 시설 및 설비의 설치</SubsectionTitle>
      <StyledList>
        <StyledListItem>4.1.1 제품 생산용 건물과 작업장은 청소 및 소독하기 쉽도록 설계 및 설치, 운영한다.</StyledListItem>
        <StyledListItem>4.1.2 배관, 창문, 바닥, 벽, 천장 등은 청소와 소독이 용이하고 오염을 방지할 수 있는 구조로 설치한다.</StyledListItem>
        <StyledListItem>4.1.3 배수구는 소독이 가능하며 해충의 유입을 방지하도록 설치한다.</StyledListItem>
        <StyledListItem>4.1.4 원자재나 업무담당자의 이동으로 인해 제품의 품질에 영향을 주지 않도록 시설과 설비를 배치한다.</StyledListItem>
      </StyledList>

      <SubsectionTitle>4.2 작업장 위생관리</SubsectionTitle>
      <StyledList>
        <StyledListItem>4.2.1 위생관리 담당자는 작업장의 청소 및 위생 상태를 매일 점검하고 그 결과를 "작업장 청소 및 위생점검 기록서"에 기록한다.</StyledListItem>
        <StyledListItem>4.2.2 위생관리 담당자는 점검 결과를 확인하고, 기준에 미달될 경우 즉시 개선 조치를 취한다.</StyledListItem>
      </StyledList>

      <SubsectionTitle>4.3 작업장 시설, 설비 및 기구의 위생관리</SubsectionTitle>
      <StyledList>
        <StyledListItem>4.3.1 매 작업 전후에 "작업장 청소 및 소독관리 규정"에 따라 청소 및 소독을 실시한다.</StyledListItem>
        <StyledListItem>4.3.2 위생관리 담당자는 매 작업 전 설비 및 기구의 청소 상태를 점검하고 결과를 "작업장 청소 및 위생점검 기록서"에 기록한다.</StyledListItem>
        <StyledListItem>4.3.3 청소 및 소독에 사용되는 세척제와 소독제는 효능이 입증된 것을 사용한다.</StyledListItem>
      </StyledList>

      <SubsectionTitle>4.4 작업장 위생에 관한 주의 사항</SubsectionTitle>
      <StyledList>
        <StyledListItem>4.4.1 업무담당자는 작업장 입실 전 손 세척 및 소독을 실시한다.</StyledListItem>
        <StyledListItem>4.4.2 규정된 위생복, 위생화, 위생모를 착용한 후 입실한다.</StyledListItem>
        <StyledListItem>4.4.3 작업장 내에서는 뛰지 않으며, 불필요한 대화를 자제한다.</StyledListItem>
        <StyledListItem>4.4.4 작업과 무관한 외부인의 출입을 제한하며, 부득이한 경우 위생관리 책임자의 승인 후 출입을 허용한다.</StyledListItem>
        <StyledListItem>4.4.5 작업장 내 음식물 섭취, 흡연, 음주를 금지한다.</StyledListItem>
      </StyledList>

      <SubsectionTitle>4.5 작업장 방충 및 방서관리</SubsectionTitle>
      <Paragraph>
        "방충 및 방서 관리 규정"에 따라 작업장의 해충 및 설치류 침입을 방지한다.
      </Paragraph>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>5. 첨부</SectionTitle>
      <StyledList>
        <StyledListItem>첨부1) 작업장 청소 및 위생점검 기록서</StyledListItem>
      </StyledList>
    </Box>
  );
}

export default BF_RMD_HM_07_Content;