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

function BF_RMD_PM_03_Content() {
  return (
    <Box sx={{ padding: '20px', backgroundColor: '#fff', borderRadius: '8px' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <Box>{/* 구매 및 공급업체 관리 규정*/}
          <Typography>문서번호: BF-RM-PM-03</Typography>
          
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
        본 규정은 (주)바이오에프디엔씨(이하 '당사'라 함)에서 제품 제조에 사용되는 원료 및 자재의 구매 절차, 원료 및 자재 공급업체와 외주생산 협력업체에 대한 관리절차를 규정하고 준수함으로써 보다 효율적인 업무 수행은 물론 우수한 제품을 생산 공급하는데 그 목적이 있다.
      </Paragraph>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>2. 적용범위</SectionTitle>
      <Paragraph>
        본 규정은 당사의 제품 제조에 사용되는 원료 및 자재의 구매, 원료 및 자재 공급업체와 외주생산 협력업체 관리 전반에 대하여 적용한다.
      </Paragraph>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>3. 책임과 권한</SectionTitle>
      <SubsectionTitle>3.1 품질경영최고책임자</SubsectionTitle>
      <StyledList>
        <StyledListItem>3.1.1 공급업체 관리 정책 수립 및 승인</StyledListItem>
        <StyledListItem>3.1.2 주요 규정 최종 승인</StyledListItem>
      </StyledList>
      <SubsectionTitle>3.2 품질보증책임자</SubsectionTitle>
      <StyledList>
        <StyledListItem>3.2.1 원료, 자재 및 외주생산 협력업체 선정</StyledListItem>
        <StyledListItem>3.2.2 원료, 자재 및 외주생산품에 대한 검사 및 시험 전반 관리</StyledListItem>
        <StyledListItem>3.2.3 부적합 원료, 자재 및 외주생산품에 대한 원인 조사 및 시정조치 요구</StyledListItem>
        <StyledListItem>3.2.4 위수탁생산 및 서비스 관리</StyledListItem>
      </StyledList>
      <SubsectionTitle>3.3 제조생산책임자</SubsectionTitle>
      <StyledList>
        <StyledListItem>3.3.1 외주생산업무 총괄</StyledListItem>
        <StyledListItem>3.3.2 외주생산용 자재 및 반제품의 해당 협력업체 출고 관리</StyledListItem>
        <StyledListItem>3.3.3 공급업체 평가작성 및 관리</StyledListItem>
      </StyledList>
      <SubsectionTitle>3.4 생산관리담당자</SubsectionTitle>
      <StyledList>
        <StyledListItem>3.4.1 원료 및 부자재 구매 관리</StyledListItem>
        <StyledListItem>3.4.2 원료 발주</StyledListItem>
        <StyledListItem>3.4.3 자재 발주</StyledListItem>
      </StyledList>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>4. 구매 절차</SectionTitle>
      <SubsectionTitle>4.1 구매 발주</SubsectionTitle>
      <StyledList>
        <StyledListItem>4.1.1 생산관리담당자는 생산계획과 재고조사를 토대로 원료 및 자재의 구매 소요량을 파악한다.</StyledListItem>
        <StyledListItem>4.1.2 생산관리담당자는 산출된 구매 소요량에 따라 해당 공급업체별로 발주한다.</StyledListItem>
        <StyledListItem>4.1.3 원료 및 자재 발주는 당사의 공급업체 평가 결과 적합으로 판정되어 공급업체 관리대장에 등록된 업체에 한하여 이행한다.</StyledListItem>
        <StyledListItem>4.1.4 발주서에는 품명/규격, 구매수량, 단가, 납기 등을 표시하고 그 외 첨부사항이 있을 경우 발주서와 함께 발송한다.</StyledListItem>
      </StyledList>
      <SubsectionTitle>4.2 입고 절차</SubsectionTitle>
      <StyledList>
        <StyledListItem>4.2.1 발주된 원료, 자재 또는 외주 생산품은 거래명세서와 함께 입고한다. 또한 원료 및 자재는 시험성적서를 첨부하여 입고하도록 한다.</StyledListItem>
        <StyledListItem>4.2.2 원료입고담당자는 입고된 구매품에 대하여 거래명세서와 대조하여 일치 여부를 확인하고, 포장 용기 파손 / 오염 여부 확인 후 이상이 없을 경우 품질보증부에 입고검사를 의뢰한다. 만일 이상이 발견되면 해당 공급업체에 통보하여 반품 등의 조치를 취한다.</StyledListItem>
        <StyledListItem>4.2.3 품질관리담당자는 해당 입고검사 기준서에 준하여 품질검사를 실시하고 그 결과를 시험성적서에 기록 관리한다.</StyledListItem>
        <StyledListItem>4.2.4 판정결과 적합품은 입고 처리하고, 부적합품은 "부적합품 관리 규정"에 따라 조치한다.</StyledListItem>
      </StyledList>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>5. 납기 관리</SectionTitle>
      <Paragraph>
        생산관리담당자는 고객주문을 근거로 각 해당 업체의 납기일정을 점검하여 제품 생산 일정에 차질이 없도록 관리한다.
      </Paragraph>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>6. 공급업체 선정</SectionTitle>
      <Paragraph>
        당사는 다음과 같은 기준을 고려하여 공급업체를 선정한다:
      </Paragraph>
      <StyledList>
        <StyledListItem>6.1 제품 품질</StyledListItem>
        <StyledListItem>6.2 가격 경쟁력</StyledListItem>
        <StyledListItem>6.3 납기 준수 능력</StyledListItem>
      </StyledList>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>7. 공급업체 평가</SectionTitle>
      <StyledList>
        <StyledListItem>7.1 제조생산책임자는 연간 거래액이 1000만원을 초과하는 공급업체에 대해 연 1회 이상 평가를 실시한다.</StyledListItem>
        <StyledListItem>7.2 평가는 품질, 납기, 가격, 서비스 등의 항목을 포함하며, 필요시 현장 실사를 진행할 수 있다.</StyledListItem>
        <StyledListItem>7.3 평가 결과에 따라 공급업체를 등급화하고, 등급에 따른 관리 방침을 수립한다.</StyledListItem>
        <StyledListItem>7.4 평가 결과가 미흡한 공급업체에 대해서는 개선을 요구하거나 거래를 중지할 수 있다.</StyledListItem>
        <StyledListItem>7.5 품질보증책임자는 제조생산책임자가 실시한 공급업체 평가 결과를 확인한다.</StyledListItem>
      </StyledList>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>8. 공급리스크 관리</SectionTitle>
      <Paragraph>
        안정적인 원료 공급과 생산 연속성 유지를 위해 다음과 같은 공급리스크 관리 체계를 운영한다:
      </Paragraph>
      <StyledList>
        <StyledListItem>8.1 주요 원료에 대해 최소 2개 이상의 공급업체를 확보하여 관리한다.</StyledListItem>
        <StyledListItem>8.2 새로운 잠재 공급업체를 발굴하고 평가한다.</StyledListItem>
        <StyledListItem>8.3 공급 계약을 통해 안정적인 원료 확보를 도모한다.</StyledListItem>
      </StyledList>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>9. 공급업체 등록</SectionTitle>
      <StyledList>
        <StyledListItem>9.1 생산관리담당자는 공급업체를 ERP 시스템에 등록하여 관리한다.</StyledListItem>
        <StyledListItem>9.2 ERP 시스템에 등록되는 정보는 공급업체명, 주소, 연락처, 주요 공급 품목 등을 포함한다.</StyledListItem>
        <StyledListItem>9.3 품질보증책임자는 ERP 시스템에 등록된 공급업체 정보의 정확성을 주기적으로 확인한다.</StyledListItem>
      </StyledList>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>10. 공급업체 관리</SectionTitle>
      <StyledList>
        <StyledListItem>10.1 입고된 원료 및 자재는 관련 입고검사 규정에 따라 검사시험 한다.</StyledListItem>
        <StyledListItem>10.2 품질보증책임자는 수시로 공급업체 변동사항을 파악하여 품질에 영향을 주는 사항이 있을 경우 관련 부서와 협의하여 대책을 수립한다.</StyledListItem>
        <StyledListItem>10.3 원료, 자재 및 외주생산 공급업체가 생산조건, 설비 등을 변경할 경우 변경 스펙 및 견본을 자사에 송부하도록 요구한다.</StyledListItem>
      </StyledList>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>11. 공급업체의 변경</SectionTitle>
      <StyledList>
        <StyledListItem>11.1 공급업체의 평가 결과가 저조할 경우 해당 공급업체에 개선을 요구하고 개선효과 정도에 따라 공급업체의 변경여부를 결정한다.</StyledListItem>
        <StyledListItem>11.2 품질보증책임자는 타당한 변경사유가 있을 시 공급업체를 변경한다.</StyledListItem>
      </StyledList>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>12. 첨부</SectionTitle>
      <StyledList>
        <StyledListItem>첨부1) 공급업체 평가표</StyledListItem>
      </StyledList>
    </Box>
  );
}

export default BF_RMD_PM_03_Content;
