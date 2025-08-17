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

function BF_RMD_HM_06_Content() {
  return (
    <Box sx={{ padding: '20px', backgroundColor: '#fff', borderRadius: '8px' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <Box>{/* 작업원 위생관리 규정*/}
          <Typography>문서번호: BF-RMD-HM-06</Typography>
          
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
        본 규정은 (주)바이오에프디엔씨(이하 "당사"라 함)의 제품 제조, 관리 및 보관 업무에 종사하는 업무담당자의 건강유지 및 업무담당자가 지켜야 할 위생사항 및 위생기준을 규정함으로써 우수한 제품 제조 및 품질관리 기준을 달성하는 데 목적이 있다.
      </Paragraph>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>2. 적용범위</SectionTitle>
      <Paragraph>
        본 규정은 당사의 제품 제조 관련 모든 업무담당자에게 적용한다.
      </Paragraph>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>3. 책임과 권한</SectionTitle>
      <SubsectionTitle>3.1 품질경영최고책임자</SubsectionTitle>
      <StyledList>
        <StyledListItem>3.1.1 업무담당자 위생관리 규정의 승인</StyledListItem>
      </StyledList>

      <SubsectionTitle>3.2 품질보증책임자</SubsectionTitle>
      <StyledList>
        <StyledListItem>3.2.1 업무담당자 위생관리 규정의 수립 및 이행 감독</StyledListItem>
        <StyledListItem>3.2.2 위생관리 담당자 지정 승인</StyledListItem>
      </StyledList>

      <SubsectionTitle>3.3 제조생산책임자</SubsectionTitle>
      <StyledList>
        <StyledListItem>3.3.1 제조 구역의 위생관리 총괄</StyledListItem>
        <StyledListItem>3.3.2 위생관리 담당자 지정</StyledListItem>
        <StyledListItem>3.3.3 작업장 및 작업원 위생관리 실행 감독</StyledListItem>
        <StyledListItem>3.3.4 위생관리 개선사항 제안 및 실행</StyledListItem>
      </StyledList>

      <SubsectionTitle>3.4 위생관리 담당자</SubsectionTitle>
      <StyledList>
        <StyledListItem>3.4.1 해당 구역의 청소, 환경유지, 개인위생 상태를 규정된 주기로 점검</StyledListItem>
        <StyledListItem>3.4.2 각 구역의 업무담당자 건강 검진 관리 및 건강상태 확인</StyledListItem>
      </StyledList>

      <SubsectionTitle>3.5 업무담당자</SubsectionTitle>
      <StyledList>
        <StyledListItem>3.5.1 본 규정에 따른 개인위생 준수</StyledListItem>
      </StyledList>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>4. 업무 절차</SectionTitle>
      <SubsectionTitle>4.1 위생관리 담당자의 지정 및 업무 수행</SubsectionTitle>
      <StyledList>
        <StyledListItem>4.1.1 제조생산책임자는 제품 제조 및 품질관리에 관한 지식과 경험을 소유하고 작업장 및 개인 위생관리 업무를 적절히 수행할 수 있는 자를 위생관리 담당자로 지정한다.</StyledListItem>
        <StyledListItem>4.1.2 위생관리 담당자로 지정받은 자는 "제조 위생관리 기준서"에 준하여 당사의 작업장 및 업무담당자 위생관리를 한다.</StyledListItem>
      </StyledList>

      <SubsectionTitle>4.2 위생관리 구역의 설정 및 관리</SubsectionTitle>
      <Paragraph>
        당사의 "작업장 위생관리 규정"에 따라 제품 생산 구역, 보관 구역, 품질관리 및 부대 구역을 구분하여 구획하고 위생관리를 한다.
      </Paragraph>
      <StyledList>
        <StyledListItem>4.2.1 생산 구역에는 칭량실, 제조 구역, 세척실이 있다.</StyledListItem>
        <StyledListItem>4.2.2 보관 구역에는 원료, 자재, 반제품 및 제품 보관소가 있다.</StyledListItem>
        <StyledListItem>4.2.3 품질관리 구역에는 품질관리 시험실, 미생물 시험실 및 관리품 보관소 등이 있다.</StyledListItem>
        <StyledListItem>4.2.4 부대 구역에는 탈의실, 화장실 등이 있다.</StyledListItem>
      </StyledList>

      <SubsectionTitle>4.3 개인 위생관리</SubsectionTitle>
      <StyledList>
        <StyledListItem>4.3.1 위생복장 착용</StyledListItem>
        <StyledList>
          <StyledListItem>4.3.1.1 "위생복 착용 규정"에 따라 구역별로 적절한 위생복, 위생모, 위생화를 착용하고 필요 시 장갑과 마스크를 착용한다.</StyledListItem>
          <StyledListItem>4.3.1.2 청결도가 다른 구역에 출입할 경우 필요에 따라 옷을 갈아 입는다.</StyledListItem>
          <StyledListItem>4.3.1.3 제조실 입실 시 신발장에서 위생화를 들고 제조실 앞에서 신고 입실한다.</StyledListItem>
          <StyledListItem>4.3.1.4 위생복은 "위생복 착용 규정"에 따라 주기적으로 세척 및 교환한다.</StyledListItem>
        </StyledList>
        <StyledListItem>4.3.2 수세 및 소독관리</StyledListItem>
        <StyledList>
          <StyledListItem>4.3.2.1 모든 작업장 출입자는 "업무담당자 수세 및 소독관리 규정"에 따라 생산구역 출입 전 및 화장실 사용 후, 기타 오염물에 접촉 시 손을 씻는다.</StyledListItem>
          <StyledListItem>4.3.2.2 위생관리 담당자는 수세 지역에 규정된 세정제와 소독액을 비치하여 관리한다.</StyledListItem>
        </StyledList>
        <StyledListItem>4.3.3 개인 위생관리</StyledListItem>
        <StyledList>
          <StyledListItem>4.3.3.1 손톱은 짧게 자른다.</StyledListItem>
          <StyledListItem>4.3.3.2 작업실에 들어가기 전에 과도한 화장, 매니큐어, 마스카라, 속눈썹 등은 지우고 들어간다.</StyledListItem>
          <StyledListItem>4.3.3.3 작업실 내에서는 흡연, 음식물 섭취, 개인세탁 등을 금한다.</StyledListItem>
          <StyledListItem>4.3.3.4 작업 중에는 반지, 목걸이, 넥타이핀, 머리핀, 귀걸이 및 담배, 라이터, 머리 빗 등 휴대용품의 착용 및 휴대를 금한다.</StyledListItem>
          <StyledListItem>4.3.3.5 사물은 반드시 개인 사물함에 보관하여 작업실 내로 들고 가지 않는다.</StyledListItem>
          <StyledListItem>4.3.3.6 작업실 내에서는 화재 등 긴급사항의 발생 이외에는 뛰어다니지 않고 과도한 행동을 하지 않도록 관리한다.</StyledListItem>
        </StyledList>
        <StyledListItem>4.3.4 개인 위생교육</StyledListItem>
        <StyledList>
          <StyledListItem>4.3.4.1 위생관리 담당자는 당사의 모든 제조 및 품질관리 관련자에 대해 "교육훈련 규정"에 따라 위생관리 교육을 정기적으로 실시하고 그 결과를 기록한다.</StyledListItem>
        </StyledList>
      </StyledList>

      <SubsectionTitle>4.4 업무담당자 건강진단 및 관리</SubsectionTitle>
      <StyledList>
        <StyledListItem>4.4.1 신규 업무담당자 건강 진단</StyledListItem>
        <Paragraph sx={{ paddingLeft: '20px' }}>
          신규 업무담당자 채용 시에는 건강검진을 받게 하거나, 문진을 하여 "업무담당자 건강관리 규정"에 따라 업무 배치를 결정한다.
        </Paragraph>
        <StyledListItem>4.4.2 정기 건강진단</StyledListItem>
        <Paragraph sx={{ paddingLeft: '20px' }}>
          "업무담당자 건강관리 규정"에 따라 제품 품질에 영향을 미치는 작업 담당자는 정기적으로 건강진단을 실시하고 건강진단 결과 제품 품질 및 안전성에 영향을 미칠 수 있는 질환이 발견되면 제품을 직접 취급하는 업무에서 격리시킨다.
        </Paragraph>
      </StyledList>

      <Divider sx={{ marginY: '50px' }} />
      <SectionTitle>5. 첨부</SectionTitle>
      <StyledList>
        <StyledListItem>첨부1) 위생관리기록서</StyledListItem>
      </StyledList>

    </Box>
  );
}

export default BF_RMD_HM_06_Content;

