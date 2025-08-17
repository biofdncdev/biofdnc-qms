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

function BF_RMD_HM_04_Content() {
  return (
    <Box sx={{ padding: '20px', backgroundColor: '#fff', borderRadius: '8px' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <Box>{/* 작업원 건강관리 규정*/}
          <Typography>문서번호: BF-RMD-HM-04</Typography>
          
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
      <SectionTitle>1. 목적</SectionTitle>
      <Paragraph>
        본 규정은 (주)바이오에프디엔씨(이하 "당사"라 함)의 제품 제조에 종사하는 업무담당자의 건강관리 방법을 규정함으로써 우수한 제품을 제조 및 품질관리하는 데 목적이 있다.
      </Paragraph>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>2. 적용범위</SectionTitle>
      <Paragraph>
        당사의 제품 제조 관련 모든 업무담당자에 적용한다.
      </Paragraph>

      <Divider sx={{ marginY: '50px' }} />

      <SectionTitle>3. 책임과 권한</SectionTitle>
      <SubsectionTitle>3.1 품질경영최고책임자</SubsectionTitle>
      <StyledList>
        <StyledListItem>3.1.1 업무담당자 건강관리 규정의 승인</StyledListItem>
      </StyledList>

      <SubsectionTitle>3.2 품질보증책임자</SubsectionTitle>
      <StyledList>
        <StyledListItem>3.2.1 업무담당자 건강관리 규정의 수립 및 이행 감독</StyledListItem>
        <StyledListItem>3.2.2 업무담당자 건강상태 점검 및 개선 조치</StyledListItem>
      </StyledList>

      <SubsectionTitle>3.3 제조생산책임자</SubsectionTitle>
      <StyledList>
        <StyledListItem>3.3.1 제조 구역 내 업무담당자 건강관리 실행</StyledListItem>
        <StyledListItem>3.3.2 업무담당자 건강 관련 시설물 유지 관리</StyledListItem>
      </StyledList>

      <SubsectionTitle>3.4 업무담당자</SubsectionTitle>
      <StyledList>
        <StyledListItem>3.4.1 건강관리 규정 준수</StyledListItem>
        <StyledListItem>3.4.2 개인 건강 상태 자진 신고</StyledListItem>
      </StyledList>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>4. 신규 업무담당자 채용 시 건강진단</SectionTitle>
      <StyledList>
        <StyledListItem>4.1 신규 업무담당자 채용 시에는 관련 법규에 따라 필요한 건강 정보를 확인한다.</StyledListItem>
        <StyledListItem>4.2 건강진단 결과 아래 5.3.1 항에 부합하지 않을 경우 채용하지 않는 것을 원칙으로 한다.</StyledListItem>
      </StyledList>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>5. 업무담당자 건강관리</SectionTitle>
      <Paragraph>
        기존 업무담당자의 건강 상태를 다음과 같이 정기 및 수시로 파악한다.
      </Paragraph>
      <SubsectionTitle>5.1 정기 건강진단</SubsectionTitle>
      <StyledList>
        <StyledListItem>5.1.1 산업안전 보건법에 따라 생산직 및 기타 관련 임직원은 1년에 1회 실시한다.</StyledListItem>
      </StyledList>
      <SubsectionTitle>5.2 수시 건강진단</SubsectionTitle>
      <StyledList>
        <StyledListItem>5.2.1 작업 중 건강에 이상이 있는 업무담당자는 즉시 인근 진료소에서 진료를 받도록 한다.</StyledListItem>
        <StyledListItem>5.2.2 업무담당자는 정기적인 진단 외에도 필요 시 수시로 실시되는 전염병 예방접종을 받아야 한다.</StyledListItem>
      </StyledList>
      <SubsectionTitle>5.3 건강상태 파악 및 보고</SubsectionTitle>
      <StyledList>
        <StyledListItem>5.3.1 위생관리 책임자는 업무담당자의 건강진단 결과 또는 일상 건강 상태가 다음과 같이 제품 품질에 영향을 미칠 수 있다고 판단되는 질병에 걸렸거나 외상을 입었는지 파악한다.</StyledListItem>
        <StyledList>
          <StyledListItem>5.3.1.1 화농성 피부병, 만성축농증, 중이염과 같은 감염성 질환</StyledListItem>
          <StyledListItem>5.3.1.2 알레르기 등 피부질환</StyledListItem>
          <StyledListItem>5.3.1.3 폐결핵 등 전염성 질환</StyledListItem>
          <StyledListItem>5.3.1.4 간염, 매독 등</StyledListItem>
          <StyledListItem>5.3.1.5 수인성 세균질환</StyledListItem>
          <StyledListItem>5.3.1.6 원료, 용매, 화학약품 등의 접촉에 의한 각종 중독질환</StyledListItem>
          <StyledListItem>5.3.1.7 기타 제품의 품질 및 안전성에 영향을 미칠 수 있는 질환</StyledListItem>
        </StyledList>
        <StyledListItem>5.3.2 건강상태 자진신고</StyledListItem>
        <StyledList>
          <StyledListItem>5.3.2.1 업무담당자가 상기 5.3.1.1~5.3.1.7 항의 질환을 앓고 있을 경우 업무담당자는 작업시작 전에 위생관리 담당자에게 반드시 신고하여야 한다.</StyledListItem>
          <StyledListItem>5.3.2.2 상기 5.3.2.1항과 같이 신고를 받은 위생관리 담당자는 업무담당자의 자진신고 내용을 검토하여 그 작업에 종사하는 것이 부적당하다고 판단될 경우 해당 부서장에게 보고하여 조치를 한다.</StyledListItem>
        </StyledList>
      </StyledList>
      <SubsectionTitle>5.4 조치사항</SubsectionTitle>
      <StyledList>
        <StyledListItem>5.4.1 업무담당자의 질병이 법정 전염병일 경우에는 관계법령에 의거 의사의 지시에 따라 격리 또는 취업을 중단시킨다.</StyledListItem>
        <StyledListItem>5.4.2 의사의 진단 결과 전염성 질환이나 보균자로 판명된 업무담당자는 완치하여 작업에 영향이나 지장이 없다는 진단이 나올 때까지 출근을 하지 않도록 하거나 격리조치 등을 취한다.</StyledListItem>
        <StyledListItem>5.4.3 전염성 질환이 의심되거나 노출된 피부에 질환을 앓고 있는 경우에는 정확한 진단을 받도록 한다.</StyledListItem>
        <StyledListItem>5.4.4 제품을 취급, 접촉 및 흡입 등으로 가려움증, 피부 발작, 두통 등 과민반응을 나타내는 특이 체질을 가진 업무담당자 발견 시는 작업을 중지시키거나 타 작업장으로 재배치한다.</StyledListItem>
      </StyledList>

    </Box>
  );
}

export default BF_RMD_HM_04_Content;