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

function BF_RMD_GM_04_Content() {
  return (
    <Box sx={{ padding: '20px', backgroundColor: '#fff', borderRadius: '8px' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <Box>
          {/*교육훈련 규정 */}
          <Typography>문서번호: BF-RM-GM-04</Typography>
          
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
        본 규정은 (주)바이오에프디엔씨(이하 "당사"라 함)의 화장품 원료 생산 및 설비 관리, 위생관리, 원료와 부자재 및 완제품 관리, 품질관리, 내부감사 등에 관련된 교육훈련 절차를 규정하고 효율적으로 실행함으로써 품질경영시스템의 효과적인 운영을 보장하는데 그 목적이 있다.
      </Paragraph>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>2. 적용범위</SectionTitle>
      <Paragraph>
        본 규정은 당사의 모든 업무담당자에게 적용된다.
      </Paragraph>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>3. 책임과 권한</SectionTitle>
      
      <SubsectionTitle>3.1 품질경영최고책임자</SubsectionTitle>
      <StyledList>
        <StyledListItem>3.1.1 교육훈련에 대한 총괄 책임을 진다.</StyledListItem>
        <StyledListItem>3.1.2 연간 교육훈련 계획을 최종 승인한다.</StyledListItem>
      </StyledList>

      <SubsectionTitle>3.2 품질보증책임자</SubsectionTitle>
      <StyledList>
        <StyledListItem>3.2.1 연간 교육훈련 계획을 수립하고 품질경영최고책임자의 승인을 받는다.</StyledListItem>
        <StyledListItem>3.2.2 사외 교육훈련 결과 보고서를 승인한다.</StyledListItem>
        <StyledListItem>3.2.3 전 업무담당자에 대한 교육 필요성을 파악한다.</StyledListItem>
        <StyledListItem>3.2.4 품질보증담당자 중 교육훈련 담당자를 지정하여 교육훈련을 총괄관리한다.</StyledListItem>
        <StyledListItem>3.2.5 교육훈련을 진행한다.</StyledListItem>
        <StyledListItem>3.2.6 전체 교육훈련 프로그램을 총괄 관리한다.</StyledListItem>
      </StyledList>

      <SubsectionTitle>3.3 부서별 책임자</SubsectionTitle>
      <StyledList>
        <StyledListItem>3.3.1 신입 및 전입 업무담당자에 대한 직무교육(OJT) 계획을 수립하고 시행한다.</StyledListItem>
        <StyledListItem>3.3.2 OJT 시행 시 지도사원을 선임한다.</StyledListItem>
        <StyledListItem>3.3.3 해당 부서 업무담당자에 대한 교육 필요성 파악 및 연간 교육훈련 계획에 반영한다.</StyledListItem>
      </StyledList>

      <SubsectionTitle>3.4 업무담당자</SubsectionTitle>
      <StyledList>
        <StyledListItem>3.4.1 교육훈련에 성실히 참여할 의무가 있다.</StyledListItem>
        <StyledListItem>3.4.2 교육훈련 내용을 업무에 적용하고 개선사항을 제안한다.</StyledListItem>
      </StyledList>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>4. 용어 정의</SectionTitle>
      <SubsectionTitle>4.1 직무교육 (OJT: On The Job Training)</SubsectionTitle>
      <Paragraph>
        직무 수행에 필요한 기능 또는 문제점 해결방법 등을 상사가 부하직원을 대상으로 집단 또는 개인적으로 업무 현장에서 지도 육성하는 활동.
      </Paragraph>
      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>5. 업무 절차</SectionTitle>

      <SubsectionTitle>5.1 교육훈련 종류별 실행 내용</SubsectionTitle>

      <SubsectionTitle sx={{ paddingLeft: '20px' }}>5.1.1 신입 업무담당자 입문교육 (오리엔테이션)</SubsectionTitle>
      <Paragraph sx={{ paddingLeft: '20px' }}>교육 내용은 다음과 같다:</Paragraph>
      <StyledList>
        <StyledListItem>1) 회사연혁 및 회사조직 소개</StyledListItem>
        <StyledListItem>2) 화장품 원료의 개요</StyledListItem>
        <StyledListItem>3) 품질경영시스템 개념</StyledListItem>
        <StyledListItem>4) 위생관리</StyledListItem>
        <StyledListItem>5) 안전 및 환경 관리</StyledListItem>
      </StyledList>

      <SubsectionTitle sx={{ paddingLeft: '20px' }}>5.1.2 직무교육 (OJT)</SubsectionTitle>
      <Paragraph sx={{ paddingLeft: '20px' }}>신입업무담당자와 직무 변경된 업무담당자를 대상으로 하는 교육으로 다음 내용에 대해 지도사원이 교육훈련을 실시한다:</Paragraph>
      <StyledList>
        <StyledListItem>1) 품질경영시스템 관련 규정</StyledListItem>
        <StyledListItem>2) 칭량, 제조, 충진 또는 포장관련 업무, 품질관리, 자재관리 방법</StyledListItem>
        <StyledListItem>3) 작업장 위생관리 (청소 및 소독) 및 개인위생 관리 방법</StyledListItem>
        <StyledListItem>4) 기록 작성 방법</StyledListItem>
        <StyledListItem>5) 기타 품질경영시스템 관련사항</StyledListItem>
      </StyledList>

      <SubsectionTitle sx={{ paddingLeft: '20px' }}>5.1.3 기존 업무담당자 교육</SubsectionTitle>
      <Paragraph sx={{ paddingLeft: '20px' }}>기존 업무담당자들의 품질의식 향상을 위하여 다음과 같이 정기교육을 실행한다:</Paragraph>
      <StyledList>
        <StyledListItem>1) 실시 주기: 최소 1회/년 (필요에 따라 추가 교육 실시 가능)</StyledListItem>
        <StyledListItem>2) 대상: 제조, 충진 및 포장, 원자재, 완제품 보관관리 및 품질관리 관련 전 업무담당자</StyledListItem>
        <StyledListItem>3) 교육 시간: 매회 최소 1시간 이상</StyledListItem>
        <StyledListItem>4) 교육 내용:</StyledListItem>
        <StyledList sx={{ paddingLeft: '40px' }}>
          <StyledListItem>a) 품질경영시스템 기본교육</StyledListItem>
          <StyledListItem>b) 화장품 법규</StyledListItem>
          <StyledListItem>c) 품질관리</StyledListItem>
          <StyledListItem>d) 생산관리</StyledListItem>
          <StyledListItem>e) 화장품 특성</StyledListItem>
          <StyledListItem>f) 고객불만 처리 방법</StyledListItem>
          <StyledListItem>g) 안전 관리</StyledListItem>
          <StyledListItem>h) 기타 필요한 사항</StyledListItem>
        </StyledList>
      </StyledList>
      <SubsectionTitle sx={{ paddingLeft: '20px' }}>5.2 교육훈련 관리</SubsectionTitle>

      <SubsectionTitle sx={{ paddingLeft: '40px' }}>5.2.1 교육훈련 계획 수립</SubsectionTitle>
      <StyledList>
        <StyledListItem>1) 품질보증 부서장은 매년 말 해당 부서로부터 교육훈련 필요성을 파악하여 년간 교육훈련계획을 작성하고 승인한다. (첨부: 년간 교육훈련 계획서)</StyledListItem>
        <StyledListItem>2) 교육훈련계획 수립 시 다음 사항을 반영하되 필요 시 외부의 교육훈련 정보를 참고한다.</StyledListItem>
      </StyledList>

      <TableContainer component={Paper} sx={{ marginTop: '10px', marginBottom: '20px' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>번호</TableCell>
              <TableCell>교육구분</TableCell>
              <TableCell>교육 시기</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>1</TableCell>
              <TableCell>오리엔테이션</TableCell>
              <TableCell>신입사원 채용 시</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>2</TableCell>
              <TableCell>현장교육</TableCell>
              <TableCell>해당 공정 투입 직전 (필요 시)</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>3</TableCell>
              <TableCell>내부 정기교육</TableCell>
              <TableCell>매 반기</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>4</TableCell>
              <TableCell>외부위탁교육</TableCell>
              <TableCell>수시</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
      <SubsectionTitle sx={{ paddingLeft: '40px' }}>5.2.2 교육훈련 실시</SubsectionTitle>
      <StyledList>
        <StyledListItem>1) 품질보증 부서 또는 해당 부서는 년간 교육훈련 계획에 따라 다음과 같이 사내∙외 교육훈련을 시행한다.</StyledListItem>
      </StyledList>

      <TableContainer component={Paper} sx={{ marginTop: '10px', marginBottom: '20px' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>구분</TableCell>
              <TableCell>사 내</TableCell>
              <TableCell>사 외</TableCell>
              <TableCell>비 고</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>계획</TableCell>
              <TableCell>사내 외 강사 선정</TableCell>
              <TableCell>교육 품의 (기안)</TableCell>
              <TableCell></TableCell>
            </TableRow>
            <TableRow>
              <TableCell>통보</TableCell>
              <TableCell>부문별 직접 통보 또는 게시판 공고</TableCell>
              <TableCell>개별 직접 통보</TableCell>
              <TableCell></TableCell>
            </TableRow>
            <TableRow>
              <TableCell rowSpan={2}>실시</TableCell>
              <TableCell>교육장 준비</TableCell>
              <TableCell>-</TableCell>
              <TableCell></TableCell>
            </TableRow>
            <TableRow>
              <TableCell>사내교육 교육훈련 보고서 작성</TableCell>
              <TableCell>사외교육 훈련 보고서 작성 또는 수료증 제출</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
      <StyledList>
        <StyledListItem>2) 교육대상자로 선정될 경우, 해당 교육에 성실히 참여할 의무가 있다.</StyledListItem>
        <StyledListItem>3) 부득이한 사유로 불참이 예상되는 교육대상자는 품질보증 부서와 협의하여 교육연기 또는 대상자를 변경하여 시행 할 수 있다.</StyledListItem>
      </StyledList>
         
      <SectionTitle>6. 기록관리</SectionTitle>
      <StyledList>
        <StyledListItem>본 규정을 실행한 결과 기록은 "기록관리 절차서"에 따라 관리한다.</StyledListItem>
      </StyledList>

      
      
      
      
      
     

    </Box>
  );
}

export default BF_RMD_GM_04_Content;