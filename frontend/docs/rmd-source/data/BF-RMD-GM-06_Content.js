import React from 'react';
import { Box, Typography, Divider, List, ListItem,TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';
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

function BF_RMD_GM_06_Content() {
  return (
    <Box sx={{ padding: '20px', backgroundColor: '#fff', borderRadius: '8px' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <Box>{/* 내부감사 규정*/}
          <Typography>문서번호: BF-RMD-GM-06</Typography>
          
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
        본 규정은 (주)바이오에프디엔씨(이하 '당사'라 한다)의 모든 품질경영 활동계획에 따라 실행되며, 품질경영시스템과 일치하는가를 확인하고 평가함으로써 품질경영시스템의 유효성을 판단하고, 유지·개선하는데 그 목적이 있다.
      </Paragraph>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>2. 적용범위</SectionTitle>
      <Paragraph>
        본 규정은 당사의 품질경영시스템의 적합성 및 유효성을 평가하기 위해 실시하는 내부감사에 대하여 적용한다.
      </Paragraph>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>3. 책임과 권한</SectionTitle>
      <SubsectionTitle>3.1 품질경영최고책임자</SubsectionTitle>
      <StyledList>
        <StyledListItem>3.1.1 내부감사 결과에 대한 최종 검토 및 승인</StyledListItem>
      </StyledList>

      <SubsectionTitle>3.2 품질보증책임자</SubsectionTitle>
      <StyledList>
        <StyledListItem>3.2.1 내부 감사의 계획, 실행, 결과 및 감사원의 자격 관리</StyledListItem>
        <StyledListItem>3.2.2 감사 실행계획 수립 및 감사원 선임</StyledListItem>
        <StyledListItem>3.2.3 정기 및 특별감사계획 수립 및 시행</StyledListItem>
        <StyledListItem>3.2.4 문제점 사전 예방 대책 수립 및 시행</StyledListItem>
        <StyledListItem>3.2.5 문제점 발생 시 조치 및 재발방지대책 수립</StyledListItem>
        <StyledListItem>3.2.6 새로운 정보에 따른 내부감사 규정의 개정</StyledListItem>
      </StyledList>

      <SubsectionTitle>3.3 제조생산책임자</SubsectionTitle>
      <StyledList>
        <StyledListItem>3.3.1 감사활동에 적극 협조</StyledListItem>
        <StyledListItem>3.3.2 지적된 부적합 사항에 대한 적절한 조치</StyledListItem>
      </StyledList>

      <SubsectionTitle>3.4 업무담당자</SubsectionTitle>
      <StyledList>
        <StyledListItem>3.4.1 내부감사 수행 및 보고서 작성</StyledListItem>
        <StyledListItem>3.4.2 시정조치 이행 및 확인</StyledListItem>
      </StyledList>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>4. 내부감사 관리체계</SectionTitle>
      <StyledList>
        <StyledListItem>4.1 당사의 품질경영체계가 계획된 사항에 부합하는지를 주기적으로 검증하기 위하여 내부감사를 계획 및 실행한다.</StyledListItem>
        <StyledListItem>4.2 감사원은 품질경영 교육 및 내부감사원 과정 교육 이수자 또는 경력자로서, 감사대상과 독립적인 자를 선임한다.</StyledListItem>
        <StyledListItem>4.3 감사 결과는 기록되어 품질보증책임자 및 피감사 부서의 책임자에게 공유하고 감사 중에 발견된 결함에 대하여 시정조치 한다.</StyledListItem>
        <StyledListItem>4.4 감사원은 시정조치에 대한 후속 감사활동을 행하고 이를 기록한다.</StyledListItem>
      </StyledList>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>5. 내부감사 계획 수립</SectionTitle>
      <StyledList>
        <StyledListItem>5.1 품질보증책임자는 "연간감사계획서"를 매년 12월 말까지 수립하여 각 부서에 통보한다.</StyledListItem>
        <StyledListItem>5.2 품질보증책임자는 연간감사계획에 따라 해당 시점에 여유를 두고 "내부감사 일정계획서"를 작성하여 회사 내에 공고한다.</StyledListItem>
        <StyledListItem>5.3 감사계획에 외부 전문가를 초빙하여 감사할 필요가 있을 시 이를 상세하게 기록한다.</StyledListItem>
        <StyledListItem>5.4 감사원은 자신의 소속 부서를 감사할 수 없다.</StyledListItem>
        <StyledListItem>5.5 정기감사는 최소한 연 1회 이상 시행되도록 계획한다.</StyledListItem>
        <StyledListItem>5.6 특별 내부 품질 감사는 특별 내부 품질 감사의 실시사유 발생 시 실시한다.</StyledListItem>
      </StyledList>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>6. 내부감사의 절차</SectionTitle>
      <SubsectionTitle>6.1 준비단계</SubsectionTitle>
      <StyledList>
        <StyledListItem>6.1.1 품질보증책임자는 내부품질감사 1주일 전에 감사일정, 목적, 대상부서를 선정한다.</StyledListItem>
        <StyledListItem>6.1.2 내부감사 항목을 선정하여 "감사 체크 리스트"를 준비한다.</StyledListItem>
        <StyledListItem>6.1.3 내부감사 일정 계획을 사내에 공지한다.</StyledListItem>
      </StyledList>
      <SubsectionTitle>6.2 감사단계</SubsectionTitle>
      <StyledList>
        <StyledListItem>6.2.1 내부품질감사 항목은 "감사 체크 리스트"에 의거한다.</StyledListItem>
        <StyledListItem>6.2.2 경미한 문제점은 현장 조치한다.</StyledListItem>
      </StyledList>
      <SubsectionTitle>6.3 평가 및 사후관리 단계</SubsectionTitle>
      <StyledList>
        <StyledListItem>6.3.1 내부품질감사 실시 후 실시일 또는 익일 이내에 실시한다.</StyledListItem>
        <StyledListItem>6.3.2 부적합에 대하여 해당부서에 시정조치 요구를 한다.</StyledListItem>
        <StyledListItem>6.3.3 부적합 관련 부서는 문제점의 원인조사 및 재발방지 대책을 수립한다.</StyledListItem>
      </StyledList>
      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>7. 특별 내부감사</SectionTitle>
      <SubsectionTitle>7.1 실시사유</SubsectionTitle>
      <StyledList>
        <StyledListItem>7.1.1 정제수가 미생물 오염 등의 문제점이 발생했을 경우</StyledListItem>
        <StyledListItem>7.1.2 출하된 제조번호의 제품 전체에 문제점이 발생하였을 경우</StyledListItem>
        <StyledListItem>7.1.3 화장품법 상 중대한 문제점이 발생하였을 경우</StyledListItem>
        <StyledListItem>7.1.4 기타 제품 제조 및 품질관리에 문제가 발생하였거나 발생할 우려가 있을 경우</StyledListItem>
      </StyledList>
      <Paragraph>7.2 특별 내부품질감사의 절차는 정기 내부품질감사와 동일하게 시행한다.</Paragraph>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>8. 감사 결과 보고 기록 및 처리</SectionTitle>
      <StyledList>
        <StyledListItem>8.1 정기 및 특별 내부품질감사 시 발견한 부적합사항은 평가단계를 거쳐 "내부감사 보고서"에 그 내용을 작성하여 피감사 부서장의 확인을 받고 처리한다.</StyledListItem>
        <StyledListItem>8.2 발견된 부적합사항은 관련 부서의 협의 후 원인, 시정조치 결과에 따른 후속 감사활동을 행하고 재발방지 대책 등을 수립하여 품질경영최고책임자에게 보고한다.</StyledListItem>
      </StyledList>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>9. 감사 결과의 시정조치</SectionTitle>
      <StyledList>
        <StyledListItem>9.1 피감사팀으로부터 시정조치 요구서가 접수되면 감사팀장은 그 이행여부 및 유효성을 확인한다.</StyledListItem>
        <StyledListItem>9.2 감사팀장은 시정조치 확인결과를 검토하여 조치결과가 완료되면 종결처리하고, 미흡하거나 부적합 사항이 발견된 경우 해당 피감사팀장에게 재시정을 요구한다.</StyledListItem>
      </StyledList>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>10. 첨부</SectionTitle>
      <StyledList>
        <StyledListItem>10.1 연간 내부감사 계획서</StyledListItem>
        <StyledListItem>10.2 내부감사 일정 계획서</StyledListItem>
        <StyledListItem>10.3 내부감사 보고서</StyledListItem>
        <StyledListItem>10.4 시정 및 예방조치 요구서</StyledListItem>
        <StyledListItem>10.5 내부감사점검표</StyledListItem>
      </StyledList>
    </Box>
  );
}

export default BF_RMD_GM_06_Content;