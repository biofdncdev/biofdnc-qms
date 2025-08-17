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

function BF_RMD_PM_10_Content() {
  return (
    <Box sx={{ padding: '20px', backgroundColor: '#fff', borderRadius: '8px' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <Box>{/* 변경 관리 규정*/}
          <Typography>문서번호: BF-RMD-PM-10</Typography>
          
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
        본 규정은 (주)바이오에프디엔씨(이하 '당사'라 함)의 제품 품질에 영향을 미칠 수 있는 작업자, 설비, 원료 및 자재, 제조공정 등을 변경할 경우 이를 문서화하고 품질보증책임자가 승인한 후 수행함으로써 제품의 품질을 보증하는데 그 목적이 있다.
      </Paragraph>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>2. 적용범위</SectionTitle>
      <Paragraph>
        본 규정은 당사의 제품 품질 또는 안전에 영향을 미치는 다음의 4M 요소에 대한 변경 사항에 적용한다:
      </Paragraph>
      <StyledList>
        <StyledListItem>2.1 작업자(Man): 주요 작업자의 변경, 작업자 교육 훈련 방식의 변경</StyledListItem>
        <StyledListItem>2.2 설비(Machine): 생산 설비, 시험 장비의 변경 또는 신규 도입</StyledListItem>
        <StyledListItem>2.3 원료 및 자재(Material): 원료, 자재의 규격, 공급업체 변경</StyledListItem>
        <StyledListItem>2.4 제조공정(Method): 제조 방법, 공정 조건, 시험 방법의 변경</StyledListItem>
      </StyledList>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>3. 책임과 권한</SectionTitle>
      <SubsectionTitle>3.1 품질보증책임자</SubsectionTitle>
      <StyledList>
        <StyledListItem>3.1.1 4M 요소의 변경에 대한 최종 승인 권한을 갖는다.</StyledListItem>
        <StyledListItem>3.1.2 변경 사항의 적합성 평가 및 결과 판정에 대한 책임을 갖는다.</StyledListItem>
      </StyledList>
      <SubsectionTitle>3.2 품질보증담당자</SubsectionTitle>
      <StyledList>
        <StyledListItem>3.2.1 4M 요소의 변경에 대한 검토 및 평가를 실시한다.</StyledListItem>
      </StyledList>
      <SubsectionTitle>3.3 제조생산책임자</SubsectionTitle>
      <StyledList>
        <StyledListItem>3.3.1 제조공정 및 설비 변경에 대한 평가를 품질보증부서와 공동으로 실시한다.</StyledListItem>
      </StyledList>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>4. 변경 체제 관리</SectionTitle>
      <Paragraph>
        4M 요소의 변경 시 이를 문서화하고 품질보증책임자의 승인을 받은 후 수행한다.
      </Paragraph>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>5. 변경관리의 적용 대상</SectionTitle>
      <SubsectionTitle>5.1 작업자(Man)</SubsectionTitle>
      <StyledList>
        <StyledListItem>5.1.1 주요 생산 담당자의 변경</StyledListItem>
        <StyledListItem>5.1.2 작업자 교육 훈련 방식의 변경</StyledListItem>
      </StyledList>
      <SubsectionTitle>5.2 설비(Machine)</SubsectionTitle>
      <StyledList>
        <StyledListItem>5.2.1 주요 생산 설비의 변경 또는 신규 도입</StyledListItem>
        <StyledListItem>5.2.2 품질 관리용 시험 장비의 변경</StyledListItem>
      </StyledList>
      <SubsectionTitle>5.3 원료 및 자재(Material)</SubsectionTitle>
      <StyledList>
        <StyledListItem>5.3.1 원료와 자재의 규격, 제조업자 및 구입처의 변경</StyledListItem>
        <StyledListItem>5.3.2 포장 재료의 변경</StyledListItem>
      </StyledList>
      <SubsectionTitle>5.4 제조공정(Method)</SubsectionTitle>
      <StyledList>
        <StyledListItem>5.4.1 제조 방법 및 공정 조건의 변경</StyledListItem>
        <StyledListItem>5.4.2 시험 방법의 변경</StyledListItem>
        <StyledListItem>5.4.3 제조 및 품질관리 기준의 변경</StyledListItem>
      </StyledList>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>6. 변경관리의 실시 절차</SectionTitle>
      <SubsectionTitle>6.1 변경 신청</SubsectionTitle>
      <Paragraph>
        변경을 신청하고자 하는 업무담당자는 변경관리 보고서에 변경 목적, 변경 내용, 제품의 품질에 대한 영향의 확인결과 등의 필요사항을 기재하고, 해당 부서장의 승인을 얻어 품질보증책임자에게 제출한다.
      </Paragraph>
      <SubsectionTitle>6.2 신청한 변경사항을 검토 및 결정</SubsectionTitle>
      <StyledList>
        <StyledListItem>6.2.1 품질보증책임자는 변경 여부를 검토하여 제품 품질과 안전에 영향을 미치지 않다고 판단되면 변경을 승인한다.</StyledListItem>
        <StyledListItem>6.2.2 변경 검토 시 제품의 품질과 안전에 미치는 영향을 검사시험 자료 또는 관련 자료를 통해 검토한다.</StyledListItem>
      </StyledList>
      <SubsectionTitle>6.3 문서 개정</SubsectionTitle>
      <StyledList>
        <StyledListItem>6.3.1 변경사항 검토 결과 해당 내용의 변경이 결정된 경우 관련 문서를 개정한다.</StyledListItem>
      </StyledList>
      <SubsectionTitle>6.4 교육훈련</SubsectionTitle>
      <StyledList>
        <StyledListItem>6.4.1 품질보증책임자는 변경사항을 "교육훈련 규정"에 따라 해당 팀에 교육훈련을 실시한다.</StyledListItem>
      </StyledList>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>7. 변경관리의 영향성 평가</SectionTitle>
      <SubsectionTitle>7.1 주요 변경</SubsectionTitle>
      <Paragraph>
        최종 제품의 품질에 직접적인 영향을 주는 변경으로, 안정성시험 추가 여부를 검토해야 하는 변경사항. 변경의 영향을 평가하기 위해 적절한 시험을 실시한다.
      </Paragraph>
      <SubsectionTitle>7.2 경미한 변경</SubsectionTitle>
      <Paragraph>
        최종제품과의 직접적인 접촉은 없으나 제품의 품질에 영향이 있다고 판단되는 변경. 적절한 시험을 통해 변경된 내용이 제품 품질에 부정적 영향을 미치지 않음을 확인한다.
      </Paragraph>
      <SubsectionTitle>7.3 기타 변경</SubsectionTitle>
      <Paragraph>
        제품의 품질에 영향이 없으나 변경관리가 필요하다고 품질보증부에서 판단하는 변경사항.
      </Paragraph>
      <SubsectionTitle>7.4 고객사 통보</SubsectionTitle>
      <StyledList>
        <StyledListItem>7.4.1 경미하지 않은 변경사항에 대해서는 제품을 사용하는 고객사에 변경사항을 통보한다.</StyledListItem>
        <StyledListItem>7.4.2 통보 내용에는 변경 사항의 개요, 변경 사유, 변경으로 인한 영향 평가 결과를 포함한다.</StyledListItem>
        <StyledListItem>7.4.3 고객사의 승인이 필요한 경우, 승인을 받은 후에 변경을 실행한다.</StyledListItem>
      </StyledList>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>8. 결과</SectionTitle>
      <SubsectionTitle>8.1 변경관리 절차</SubsectionTitle>
      <StyledList>
        <StyledListItem>- 변경 계획 수립 후 1회 시험 실시</StyledListItem>
        <StyledListItem>- 시험 결과가 적합한 경우에만 변경 실행</StyledListItem>
      </StyledList>
      <SubsectionTitle>8.2 부적합 시 조치</SubsectionTitle>
      <StyledList>
        <StyledListItem>- 결과가 부적합한 경우, 제품 생산 및 변경 중단</StyledListItem>
        <StyledListItem>- 문제점 개선 후 재시험 실시</StyledListItem>
      </StyledList>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>9. 첨부</SectionTitle>
      <Paragraph>
        첨부 1) 변경관리 보고서
      </Paragraph>
    </Box>
  );
}

export default BF_RMD_PM_10_Content;