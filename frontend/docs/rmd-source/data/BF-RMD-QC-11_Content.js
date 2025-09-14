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

function BF_RMD_QC_11_Content() {
  return (
    <Box sx={{ padding: '20px', backgroundColor: '#fff', borderRadius: '8px' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <Box>
          <Typography>문서번호: BF-RM-QC-11</Typography>
          <Typography>문서명: 중금속 함량 시험 규정</Typography>
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
        본 규정은 (주)바이오에프디엔씨(이하 "당사"라 한다.)의 제품에 대한 중금속 함량을 확인하고 관리하여 제품의 안전성을 보장하는데 그 목적이 있다.
      </Paragraph>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>2. 적용범위</SectionTitle>
      <Paragraph>
        본 규정은 당사에서 생산하는 모든 제품에 적용되며, 다음의 경우에 중금속 시험을 실시한다.
      </Paragraph>
      <StyledList>
        <StyledListItem>2.1 신제품 개발 시</StyledListItem>
        <StyledListItem>2.2 원자재 변경 시</StyledListItem>
      </StyledList>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>3. 책임과 권한</SectionTitle>
      <SubsectionTitle>3.1 품질경영최고책임자</SubsectionTitle>
      <StyledList>
        <StyledListItem>3.1.1 본 규정에 대한 최종 승인 권한을 가진다.</StyledListItem>
      </StyledList>
      <SubsectionTitle>3.2 품질보증책임자</SubsectionTitle>
      <StyledList>
        <StyledListItem>3.2.1 중금속 시험 규정의 승인 및 운영을 총괄한다.</StyledListItem>
        <StyledListItem>3.2.2 중금속 시험 결과에 대한 최종 평가 및 승인을 한다.</StyledListItem>
      </StyledList>
      <SubsectionTitle>3.3 품질보증담당자</SubsectionTitle>
      <StyledList>
        <StyledListItem>3.3.1 중금속 시험 계획을 수립하고 실행한다.</StyledListItem>
        <StyledListItem>3.3.2 중금속 시험 결과를 검토 및 평가한다.</StyledListItem>
        <StyledListItem>3.3.3 중금속 시험 관리를 총괄한다.</StyledListItem>
      </StyledList>
      <SubsectionTitle>3.4 품질관리담당자</SubsectionTitle>
      <StyledList>
        <StyledListItem>3.4.1 중금속 시험을 위한 시료를 준비하고 공인시험기관에 의뢰한다.</StyledListItem>
        <StyledListItem>3.4.2 중금속 시험 결과를 기록하고 보관한다.</StyledListItem>
      </StyledList>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>4. 용어의 정의</SectionTitle>
      <SubsectionTitle>4.1 중금속</SubsectionTitle>
      <Paragraph>
        비중이 4.0 이상인 금속 원소로, 주로 납, 카드뮴, 수은, 비소 등을 지칭한다.
      </Paragraph>
      <SubsectionTitle>4.2 공인시험기관</SubsectionTitle>
      <Paragraph>
        국가로부터 공인받은 시험 및 검사 능력을 갖춘 기관을 말한다.
      </Paragraph>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>5. 중금속 시험 방법 및 업무분장</SectionTitle>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>업무</TableCell>
              <TableCell>담당자</TableCell>
              <TableCell>내용</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>시험 의뢰</TableCell>
              <TableCell>품질관리담당자</TableCell>
              <TableCell>공인시험기관에 시험 의뢰 및 샘플 발송</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>결과 확인</TableCell>
              <TableCell>품질보증담당자</TableCell>
              <TableCell>시험 결과 검토 및 평가</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>조치 결정</TableCell>
              <TableCell>품질보증책임자</TableCell>
              <TableCell>시험 결과에 따른 후속 조치 결정</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>6. 시험 항목</SectionTitle>
      <Paragraph>
        납, 카드뮴, 수은, 비소 등 관련 법규에서 정한 중금속
      </Paragraph>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>7. 시험결과의 관리</SectionTitle>
      <StyledList>
        <StyledListItem>7.1 시험기관에서 보내준 시험성적서를 보관한다.</StyledListItem>
        <StyledListItem>7.2 시험결과가 기준치를 초과할 경우, 즉시 품질보증책임자에게 보고하고 적절한 조치를 취한다.</StyledListItem>
      </StyledList>

    </Box>
  );
}

export default BF_RMD_QC_11_Content;
