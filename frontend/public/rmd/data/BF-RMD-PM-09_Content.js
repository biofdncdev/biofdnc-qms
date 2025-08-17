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

function BF_RMD_PM_09_Content() {
  return (
    <Box sx={{ padding: '20px', backgroundColor: '#fff', borderRadius: '8px' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <Box>{/*제품 관리 규정*/}
          <Typography>문서번호: BF-RMD-PM-09</Typography>
          
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
        본 규정은 (주)바이오에프디엔씨(이하 "당사"라 함) 제품의 입고에서 출하까지의 관리방법을 규정하여 제품을 최적의 상태로 유지․관리하고, 우수한 제품을 제조하는 데 그 목적이 있다.
      </Paragraph>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>2. 용어의 정의</SectionTitle>
      <StyledList>
        <StyledListItem>2.1 제품: 모든 제조 공정을 거쳐 최종적으로 완성된 상태의 물품</StyledListItem>
      </StyledList>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>3. 책임과 권한</SectionTitle>
      <SubsectionTitle>3.1 품질경영최고책임자</SubsectionTitle>
      <StyledList>
        <StyledListItem>3.1.1 제품 관리에 대한 총괄 책임을 갖는다.</StyledListItem>
      </StyledList>
      <SubsectionTitle>3.2 품질보증책임자</SubsectionTitle>
      <StyledList>
        <StyledListItem>3.2.1 제품의 품질관리 업무를 총괄한다.</StyledListItem>
        <StyledListItem>3.2.2 제품 시험 결과의 적부 판정에 대한 책임과 권한을 갖는다.</StyledListItem>
      </StyledList>
      <SubsectionTitle>3.3 제조생산책임자</SubsectionTitle>
      <StyledList>
        <StyledListItem>3.3.1 제품의 입고, 보관, 출하에 대한 책임을 갖는다.</StyledListItem>
        <StyledListItem>3.3.2 제품 관리 업무의 이행사항을 검토한다.</StyledListItem>
      </StyledList>
      <SubsectionTitle>3.4 품질보증담당자</SubsectionTitle>
      <StyledList>
        <StyledListItem>3.4.1 제품의 품질관리 업무를 수행한다.</StyledListItem>
      </StyledList>
      <SubsectionTitle>3.5 제조담당자</SubsectionTitle>
      <StyledList>
        <StyledListItem>3.5.1 제품의 입고, 보관, 출하 관련 업무를 수행한다.</StyledListItem>
        <StyledListItem>3.5.2 제품의 재고를 관리한다.</StyledListItem>
        <StyledListItem>3.5.3 제품의 식별 및 추적성을 관리한다.</StyledListItem>
      </StyledList>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>4. 입고</SectionTitle>
      <StyledList>
        <StyledListItem>4.1 제조담당자는 제품 생산이 완료되면 제품을 입고한다.</StyledListItem>
        <StyledListItem>4.2 제조담당자는 입고한 제품에 대해 다음 사항을 확인한다.</StyledListItem>
      </StyledList>
      <StyledList sx={{ paddingLeft: '40px' }}>
        <StyledListItem>4.2.1 제품 입고상태</StyledListItem>
        <StyledListItem>4.2.2 제품명, 제조번호, 제조연월일</StyledListItem>
        <StyledListItem>4.2.3 제품 생산수량</StyledListItem>
      </StyledList>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>5. 보관</SectionTitle>
      <StyledList>
        <StyledListItem>5.1 제품을 쉽게 구분할 수 있도록 표시부분을 판별할 수 있는 위치에 적재한다.</StyledListItem>
        <StyledListItem>5.2 출하 횟수가 많은 제품은 출하하기 쉬운 곳에 적재한다.</StyledListItem>
        <StyledListItem>5.3 최하단에 있는 제품이 손상되지 않을 정도의 무게로 알맞게 적재한다.</StyledListItem>
        <StyledListItem>5.4 적절한 제품 보관 조건 및 방충 방서 조건을 유지하기 위해 주기적으로 상태를 모니터링한다.</StyledListItem>
        <StyledListItem>5.5 제품의 재고관리</StyledListItem>
      </StyledList>
      <StyledList sx={{ paddingLeft: '40px' }}>
        <StyledListItem>5.5.1 제조담당자는 매 분기당 1회 실재고를 확인한다.</StyledListItem>
        <StyledListItem>5.5.2 만일 실재고가 일치하지 않을 경우 그 원인을 분석하여 조치하고 제조생산책임자에게 보고한다.</StyledListItem>
      </StyledList>
      <StyledList>
        <StyledListItem>5.6 제품의 재고 조사 및 사용기한 관리</StyledListItem>
      </StyledList>
      <StyledList sx={{ paddingLeft: '40px' }}>
        <StyledListItem>5.6.1 제품 종류별 사용기한을 설정하여 관리한다.</StyledListItem>
        <StyledListItem>5.6.2 제조담당자는 매 분기별 제품 입출고 내역과 제품 보관소내의 현품을 비교하여, 재고조사를 한다.</StyledListItem>
        <StyledListItem>5.6.3 만일 입출고 대장상의 재고와 실재고 상의 재고 차이가 5% 이상 날 경우 그 원인을 분석하고 조치하여, 그 결과를 제조생산책임자에게 보고한다.</StyledListItem>
        <StyledListItem>5.6.4 재고조사 결과 사용기한에 근접하고 품질이 의심스러운 제품은 품질보증 부서에 의뢰하여 재검사를 실시한다.</StyledListItem>
        <StyledListItem>5.6.5 재검사 결과 "적합"으로 판정되면 출하 가능한 상태로 관리한다.</StyledListItem>
        <StyledListItem>5.6.6 재검사 결과 "부적합"으로 판정된 제품은 폐기처리 한다.</StyledListItem>
        <StyledListItem>5.6.7 제품 보관 중 포장이 훼손되었거나 장기보관으로 인해 이상이 생겼다고 판단될 경우에는 별도 구분 보관 후 품질보증 부서에 시험의뢰 하고 그 결과에 따라 조치한다.</StyledListItem>
      </StyledList>
      <SubsectionTitle>5.7 제품 보관</SubsectionTitle>
      <Paragraph>5.7.1 제품 보관조건</Paragraph>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>구 분</TableCell>
              <TableCell>조 건</TableCell>
              <TableCell>비 고</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>일반 제품</TableCell>
              <TableCell>온도 : 1 ~ 30℃</TableCell>
              <TableCell>제품보관소내 보관</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>저온 보관 제품</TableCell>
              <TableCell>온도 : 1 ~ 15℃</TableCell>
              <TableCell>냉장고</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
      <StyledList>
        <StyledListItem>5.7.1.1 온도 상태를 매일 1회 점검하여 기록한다.</StyledListItem>
      </StyledList>
      <Paragraph>5.7.2 제품 보관 관리</Paragraph>
      <StyledList>
        <StyledListItem>5.7.2.1 혼동의 방지</StyledListItem>
        <StyledList>
          <StyledListItem>5.7.2.1.1 각 제품의 종류에 따라 구분하여 보관한다.</StyledListItem>
          <StyledListItem>5.7.2.1.2 제품 간 적절한 공간과 거리를 확보한다.</StyledListItem>
        </StyledList>
        <StyledListItem>5.7.2.2 오염 및 변질의 예방</StyledListItem>
        <StyledList>
          <StyledListItem>5.7.2.2.1 제품은 창고바닥이 아닌 파렛트/선반 위에 보관하고 통풍, 방습 및 청소가 용이한 장소에 보관한다.</StyledListItem>
          <StyledListItem>5.7.2.2.2 별도로 저장방법이 지정된 제품은 지정사항을 준수한다.</StyledListItem>
        </StyledList>
      </StyledList>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>6. 출하</SectionTitle>
      <SubsectionTitle>6.1 절차</SubsectionTitle>
      <StyledList>
        <StyledListItem>6.1.1 생산관리담당자는 ERP를 통해 제조담당자에게 출하지시한다.</StyledListItem>
        <StyledListItem>6.1.2 제조담당자는 품질검사 결과 "적합" 판정이 난 제품에 대하여 출하한다.</StyledListItem>
        <StyledListItem>6.1.3 제조담당자는 제품 출하 시 다음 사항을 확인한다.</StyledListItem>
      </StyledList>
      <StyledList sx={{ paddingLeft: '40px' }}>
        <StyledListItem>6.1.3.1 제품명</StyledListItem>
        <StyledListItem>6.1.3.2 제조일자 및 사용기한</StyledListItem>
        <StyledListItem>6.1.3.3 시험성적서</StyledListItem>
        <StyledListItem>6.1.3.4 제품의 포장상태 및 파렛트 적재상태</StyledListItem>
        <StyledListItem>6.1.3.5 Lot. No.</StyledListItem>
      </StyledList>
      <StyledList>
        <StyledListItem>6.1.4 제품 출하 시 선입선출을 원칙으로 한다.</StyledListItem>
        <StyledListItem>6.1.5 출하 기록을 유지하고 관리한다.</StyledListItem>
      </StyledList>

    </Box>
  );
}

export default BF_RMD_PM_09_Content;
