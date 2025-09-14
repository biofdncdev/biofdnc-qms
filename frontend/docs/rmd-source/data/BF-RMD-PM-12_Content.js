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

function BF_RMD_PM_12_Content() {
  return (
    <Box sx={{ padding: '20px', backgroundColor: '#fff', borderRadius: '8px' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <Box>{/* 창고 관리 규정*/}
          <Typography>문서번호: BF-RM-PM-12</Typography>
          
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
        본 규정은 (주)바이오에프디엔씨(이하 '당사')의 원자재, 반제품, 완제품의 효율적인 관리와 추적성 확보를 위한 창고관리 기준을 정립하여 제품 품질 보증 및 생산성 향상에 기여함을 목적으로 한다.
      </Paragraph>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>2. 적용범위</SectionTitle>
      <Paragraph>
        본 규정은 당사의 모든 원자재, 반제품, 완제품의 입고, 보관, 출고 및 재고관리에 적용된다.
      </Paragraph>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>3. 용어 정의</SectionTitle>
      <StyledList>
        <StyledListItem>3.1 입고: 원자재, 반제품, 완제품이 창고에 들어오는 것</StyledListItem>
        <StyledListItem>3.2 출고: 원자재, 반제품, 완제품이 창고에서 나가는 것</StyledListItem>
        <StyledListItem>3.3 재고: 창고에 보관 중인 원자재, 반제품, 완제품의 수량</StyledListItem>
        <StyledListItem>3.4 LOT: 동일한 제조 조건에서 일괄 생산된 제품 단위</StyledListItem>
        <StyledListItem>3.5 ERP: Enterprise Resource Planning, 전사적 자원관리 시스템</StyledListItem>
      </StyledList>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>4. 책임과 권한</SectionTitle>
      <SubsectionTitle>4.1 제조생산책임자</SubsectionTitle>
      <StyledList>
        <StyledListItem>4.1.1 창고관리 업무 총괄</StyledListItem>
        <StyledListItem>4.1.2 입출고 및 재고관리 정책 수립</StyledListItem>
      </StyledList>
      <SubsectionTitle>4.2 생산관리담당자</SubsectionTitle>
      <StyledList>
        <StyledListItem>4.2.1 원료 및 부자재 구매 관리</StyledListItem>
        <StyledListItem>4.2.2 생산 계획에 따른 자재 출고 요청</StyledListItem>
        <StyledListItem>4.2.3 재고 현황 모니터링 및 보고</StyledListItem>
      </StyledList>
      <SubsectionTitle>4.3 제조담당자</SubsectionTitle>
      <StyledList>
        <StyledListItem>4.3.1 원료 칭량 및 출고 요청</StyledListItem>
        <StyledListItem>4.3.2 반제품 및 완제품 입출고 관리</StyledListItem>
      </StyledList>
      <SubsectionTitle>4.4 품질보증담당자</SubsectionTitle>
      <StyledList>
        <StyledListItem>4.4.1 입고된 원자재, 반제품, 완제품의 품질 확인</StyledListItem>
        <StyledListItem>4.4.2 보관 조건 적합성 검토</StyledListItem>
      </StyledList>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>5. 입고 관리</SectionTitle>
      <SubsectionTitle>5.1 입고 절차</SubsectionTitle>
      <StyledList>
        <StyledListItem>5.1.1 모든 입고는 ERP 시스템을 통해 관리한다.</StyledListItem>
        <StyledListItem>5.1.2 입고 담당자는 납품서와 실제 입고 품목을 대조 확인한다.</StyledListItem>
        <StyledListItem>5.1.3 확인이 완료된 후 ERP 시스템에 입고 정보를 등록한다.</StyledListItem>
      </StyledList>
      <SubsectionTitle>5.2 검수 및 품질 확인</SubsectionTitle>
      <StyledList>
        <StyledListItem>5.2.1 품질보증담당자는 입고된 품목의 품질을 확인한다.</StyledListItem>
        <StyledListItem>5.2.2 품질 확인 결과를 ERP 시스템에 등록한다.</StyledListItem>
      </StyledList>
      <SubsectionTitle>5.3 입고 기록</SubsectionTitle>
      <StyledList>
        <StyledListItem>5.3.1 입고 일자, 품목명, 수량, LOT 번호 등을 ERP 시스템에 기록한다.</StyledListItem>
        <StyledListItem>5.3.2 입고 라벨을 출력하여 해당 품목에 부착한다.</StyledListItem>
      </StyledList>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>6. 보관 관리</SectionTitle>
      <SubsectionTitle>6.1 보관 조건 및 환경 관리</SubsectionTitle>
      <StyledList>
        <StyledListItem>6.1.1 품목별 적정 보관 조건(온도, 습도 등)을 설정하고 관리한다.</StyledListItem>
        <StyledListItem>6.1.2 창고의 실내 온도는 실온 조건을 유지한다.</StyledListItem>
        <StyledListItem>6.1.3 창고의 온도를 매일 1회 점검하고 기록한다.</StyledListItem>
      </StyledList>
      <SubsectionTitle>6.2 재고 관리 방법</SubsectionTitle>
      <StyledList>
        <StyledListItem>6.2.1 모든 재고는 ERP 시스템을 통해 실시간으로 관리한다.</StyledListItem>
        <StyledListItem>6.2.2 품목별로 적정 재고량을 설정하고 관리한다.</StyledListItem>
      </StyledList>
      <SubsectionTitle>6.3 유효기간 관리</SubsectionTitle>
      <StyledList>
        <StyledListItem>6.3.1 ERP 시스템을 통해 품목별 유효기간을 관리한다.</StyledListItem>
        <StyledListItem>6.3.2 유효기간 임박 품목에 대해 알림 기능을 활용하여 관리한다.</StyledListItem>
      </StyledList>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>7. 출고 관리</SectionTitle>
      <SubsectionTitle>7.1 출고 요청 및 승인 절차</SubsectionTitle>
      <StyledList>
        <StyledListItem>7.1.1 출고 요청은 ERP 시스템을 통해 이루어진다.</StyledListItem>
        <StyledListItem>7.1.2 생산관리담당자 또는 제조담당자가 출고를 요청하고, 제조생산책임자가 승인한다.</StyledListItem>
      </StyledList>
      <SubsectionTitle>7.2 선입선출(FIFO) 원칙</SubsectionTitle>
      <StyledList>
        <StyledListItem>7.2.1 ERP 시스템은 선입선출 원칙에 따라 출고할 품목을 자동으로 선정한다.</StyledListItem>
        <StyledListItem>7.2.2 특별한 사유로 선입선출 원칙을 따르지 않을 경우, 그 사유를 ERP 시스템에 기록한다.</StyledListItem>
      </StyledList>
      <SubsectionTitle>7.3 출고 기록</SubsectionTitle>
      <StyledList>
        <StyledListItem>7.3.1 출고 일자, 품목명, 수량, LOT 번호 등을 ERP 시스템에 기록한다.</StyledListItem>
        <StyledListItem>7.3.2 출고 후 재고 현황이 자동으로 업데이트된다.</StyledListItem>
      </StyledList>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>8. 재고 관리</SectionTitle>
      <SubsectionTitle>8.1 정기 재고 조사</SubsectionTitle>
      <StyledList>
        <StyledListItem>8.1.1 월 1회 이상 정기적인 재고 조사를 실시한다.</StyledListItem>
        <StyledListItem>8.1.2 재고 조사 결과를 ERP 시스템에 입력하여 실제 재고와 시스템 재고를 비교한다.</StyledListItem>
      </StyledList>
      <SubsectionTitle>8.2 재고 불일치 처리 절차</SubsectionTitle>
      <StyledList>
        <StyledListItem>8.2.1 재고 불일치 발견 시 즉시 제조생산책임자에게 보고한다.</StyledListItem>
        <StyledListItem>8.2.2 불일치 원인을 조사하고 그 결과를 ERP 시스템에 기록한다.</StyledListItem>
        <StyledListItem>8.2.3 필요시 시정 조치를 실시하고 그 내용을 ERP 시스템에 기록한다.</StyledListItem>
      </StyledList>


    </Box>
  );
}

export default BF_RMD_PM_12_Content;