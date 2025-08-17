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

function BF_RMD_GM_12_Content() {
  return (
    <Box sx={{ padding: '20px', backgroundColor: '#fff', borderRadius: '8px' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <Box>
          <Typography>문서번호: BF-RMD-GM-12</Typography>
        </Box>
        <Box>
          <Typography>개정번호: 00</Typography>
          <Typography>제·개정일: 2024.07.01</Typography>
        </Box>
      </Box>
      <Typography variant="h6" gutterBottom>
        자격인증 규정
      </Typography>
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
        본 규정은 (주)바이오에프디엔씨 (이하 "당사"라 함)의 품질 경영 활동의 운영 및 관리자의 적격성과 품질검사자와 내부심사 업무를 수행할 수 있는 심사원 자격을 인정하여 관리함으로써 합리적이고 효율적인 업무수행에 그 목적이 있다.
      </Paragraph>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>2. 적용범위</SectionTitle>
      <Paragraph>
        본 절차서는 당사의 검사 및 시험, 내부 품질감사 업무를 수행하기 위한 요원의 자격인정에 대하여 적용한다.
      </Paragraph>
      <StyledList>
        <StyledListItem>2.1 품질검사자(검사원)</StyledListItem>
        <StyledListItem>2.2 내부심사자 (내부심사원)</StyledListItem>
      </StyledList>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>3. 책임과 권한</SectionTitle>
      <SubsectionTitle>3.1 품질경영최고책임자</SubsectionTitle>
      <Paragraph>
        품질검사자 및 내부심사자의 자격 인증에 대하여 검토/승인할 책임과 권한이 있다.
      </Paragraph>

      <SubsectionTitle>3.2 품질보증책임자</SubsectionTitle>
      <StyledList>
        <StyledListItem>3.2.1 품질검사자 및 내부심사자의 자격 인증에 대하여 검토할 책임과 권한이 있다.</StyledListItem>
        <StyledListItem>3.2.2 품질검사자 및 내부심사자의 자격 인증에 대하여 기안할 책임과 권한이 있다.</StyledListItem>
      </StyledList>

      <SubsectionTitle>3.3 기타 부서장</SubsectionTitle>
      <Paragraph>
        해당 부서 작업원의 교육실시 및 자격인증에 대한 기안할 책임이 있다.
      </Paragraph>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>4. 자격의 요건</SectionTitle>
      <SubsectionTitle>4.1 검사원의 선정</SubsectionTitle>
      <StyledList>
        <StyledListItem>4.1.1 업무 집중 및 성실성</StyledListItem>
        <StyledListItem>4.1.2 의사소통 능력, 분석 능력, 판단력, 문서작성 능력, 융통성</StyledListItem>
        <StyledListItem>4.1.3 CGMP 자격인증 교육 평가에서 80점 이상인 자</StyledListItem>
        <StyledListItem>4.1.4 고등학교 졸업 이상의 학력 소지자</StyledListItem>
      </StyledList>

      <SubsectionTitle>4.2 내부 심사원</SubsectionTitle>
      <Paragraph>
        다음 각 항의 수행업무 항목 중 (필수)항목을 포함 또는 이상을 만족하는 관리자
      </Paragraph>
      <StyledList>
        <StyledListItem>4.2.1 고등학교 졸업 이상의 학력 소지자(필수)</StyledListItem>
        <StyledListItem>4.2.2 CGMP 내부감사 교육을 이수한 자로서 필기평가 80점 이상인 자</StyledListItem>
        <StyledListItem>4.2.3 외부 품질경영 전문 진단지도기관의 지도위원</StyledListItem>
        <StyledListItem>4.2.4 품질관리 자격증 소지자</StyledListItem>
        <StyledListItem>4.2.5 바이오, 제약, 화장품 분야 5년 이상 경력자(타사 경력 포함)(필수)</StyledListItem>
        <StyledListItem>4.2.6 외부 기관의 "내부심사원 교육"을 이수한 자</StyledListItem>
      </StyledList>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>5. 업무 절차</SectionTitle>
      <SubsectionTitle>5.1 자격의 부여 및 승인</SubsectionTitle>
      <StyledList>
        <StyledListItem>5.1.1 품질보증책임자는 자격의 요건에 의거하여 해당되는 자의 관련 기록을 검토하고 자격인정서와 자격근거자료를 수집하여 품질경영최고책임자의 승인을 득한다.</StyledListItem>
        <StyledListItem>5.1.2 필요시 품질보증책임자는 자격인정서의 작성 시 관련되는 문서를 첨부할 수 있다.</StyledListItem>
        <StyledListItem>5.1.3 품질보증책임자는 해당되는 자의 자격인정에 대한 품질경영최고책임자의 승인 시 자격 인정 관리대장을 작성하여 유지, 관리한다.</StyledListItem>
      </StyledList>

      <SubsectionTitle>5.2 자격 인증의 유지 관리</SubsectionTitle>
      <StyledList>
        <StyledListItem>5.2.1 검사 및 시험요원의 자격 인증은 자격 인증이 부여된 자가 타 부서로 보직 변경하기 전까지는 유효한 것으로 한다.</StyledListItem>
        <StyledListItem>5.2.2 자격이 부여된 자가 퇴사 시에는 퇴사와 동시에 자격이 상실된다.</StyledListItem>
      </StyledList>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>6. 기록관리</SectionTitle>
      <Paragraph>
        본 절차서를 실행한 결과 기록은 "기록관리 절차서"에 따라 관리한다.
      </Paragraph>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>7. 관련 문서</SectionTitle>
      <StyledList>
        <StyledListItem>7.1 기록관리 규정</StyledListItem>
        <StyledListItem>7.2 문서 및 자료 관리 규정</StyledListItem>
      </StyledList>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>8. 첨부양식</SectionTitle>
      <StyledList>
        <StyledListItem>8.1 자격인정서</StyledListItem>
        <StyledListItem>8.2 자격인정관리대장</StyledListItem>
      </StyledList>
    </Box>
  );
}

export default BF_RMD_GM_12_Content;
