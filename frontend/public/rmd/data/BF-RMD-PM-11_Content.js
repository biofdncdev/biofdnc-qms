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

function BF_RMD_PM_11_Content() {
  return (
    <Box sx={{ padding: '20px', backgroundColor: '#fff', borderRadius: '8px' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <Box>{/* 부적합품 관리 규정*/}
          <Typography>문서번호: BF-RMD-PM-11</Typography>
          
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
        본 규정은 (주)바이오에프디엔씨(이하 "당사"라 함)의 제조소 내에서 생산된 제품에 대하여 규정된 요건 및 고객의 요구사항에 적합하지 않은 부적합한 원료, 자재, 반제품, 제품의 사용을 방지하고 부적합한 제품이 출하되는 것을 방지하여 제품의 품질을 보증하는 것을 목적으로 한다.
      </Paragraph>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>2. 적용범위</SectionTitle>
      <Paragraph>
        본 규정은 당사의 제조소 내에서 규정된 요구사항에 적합하지 않은 부적합 원료, 자재, 반제품, 제품의 관리, 검토, 처리에 대해 적용한다.
      </Paragraph>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>3. 책임과 권한</SectionTitle>
      <SubsectionTitle>3.1 제조생산책임자</SubsectionTitle>
      <StyledList>
        <StyledListItem>3.1.1 품질보증책임자와 협의하여 부적합품에 대한 처리 방안을 강구한다.</StyledListItem>
        <StyledListItem>3.1.2 부적합품에 대한 처리방안에 따라 최종 폐기일 경우 폐기기안을 작성하여 처리한다.</StyledListItem>
      </StyledList>
      <SubsectionTitle>3.2 제조담당자</SubsectionTitle>
      <StyledList>
        <StyledListItem>3.2.1 부적합 원료, 자재, 반제품 및 제품에 대하여 결정된 처리 방안에 따라 처리한다.</StyledListItem>
      </StyledList>
      <SubsectionTitle>3.3 품질보증책임자</SubsectionTitle>
      <StyledList>
        <StyledListItem>3.3.1 원료, 자재, 반제품, 제품에 대한 시험 및 적부판정에 대한 책임과 권한을 갖는다.</StyledListItem>
        <StyledListItem>3.3.2 제조생산부와 협의하여 부적합품에 대한 처리 방안을 결정한다.</StyledListItem>
        <StyledListItem>3.3.3 부적합품이 결정된 처리 방안에 따라 처리되었는지를 확인한다.</StyledListItem>
        <StyledListItem>3.3.4 시정 및 예방 조치를 관리한다.</StyledListItem>
      </StyledList>
      <SubsectionTitle>3.4 품질관리담당자</SubsectionTitle>
      <StyledList>
        <StyledListItem>3.4.1 원료, 자재, 반제품, 제품에 대한 시험을 수행하며 그 적부판정 결과를 의뢰부서에 통보한다.</StyledListItem>
        <StyledListItem>3.4.2 원료, 자재, 반제품, 제품에 대한 부적합 발생 시 ERP 시스템을 통해 부적합 보고를 관리한다.</StyledListItem>
        <StyledListItem>3.4.3 부적합품에 대해서는 부적합 라벨을 부착하여 구분한다.</StyledListItem>
        <StyledListItem>3.4.4 부적합품은 처리가 결정될 때까지 구분된 장소에 보관하거나 명확하게 식별될 수 있도록 표시하여 후속 공정에 투입되지 않도록 한다.</StyledListItem>
        <StyledListItem>3.4.5 부적합품을 재작업 시 재검사 및 시험을 한다.</StyledListItem>
      </StyledList>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>4. 부적합품의 처리</SectionTitle>
      <StyledList>
        <StyledListItem>4.1 부적합품의 처리 방법은 품질보증책임자와 관련부서 책임자의 협의 하에 결정한다.</StyledListItem>
        <StyledListItem>4.2 부적합품의 처리 방안에는 재작업, 반품 또는 폐기로 구분하며 경우에 따라 적절한 방법으로 결정하여 처리한다.</StyledListItem>
      </StyledList>
      <SubsectionTitle>4.3 부적합품의 검토 결과 재작업을 할 경우에는 다음과 같이 실시한다.</SubsectionTitle>
      <SubsectionTitle>4.3.1 반제품</SubsectionTitle>
      <StyledList>
        <StyledListItem>4.3.1.1 품질관리담당자는 부적합 내용을 조사하여 ERP 시스템에 기록한다.</StyledListItem>
        <StyledListItem>4.3.1.2 제조생산책임자는 부적합 내용을 분석하여 수정(재작업) 방법을 결정하고 제조생산부에 통보한다.</StyledListItem>
        <StyledListItem>4.3.1.3 제조생산부는 제조생산책임자가 결정한 수정(재작업) 방법에 따라 재작업을 실시하고 검체를 채취하여 품질보증부에 송부한다.</StyledListItem>
        <StyledListItem>4.3.1.4 품질보증부는 재작업 반제품에 대하여 재검사를 실시하여 결과가 이상이 없으면 적합 처리하고, 부적합이면 폐기처리 하도록 한다. 재검사 결과는 "반제품 시험 성적서"에 기록한다.</StyledListItem>
      </StyledList>
      <SubsectionTitle>4.3.2 제품</SubsectionTitle>
      <StyledList>
        <StyledListItem>4.3.2.1 자재(라벨 포함)가 부적합일 경우, 제조생산책임자는 재작업 방법을 결정하여 생산공정에 지시한다.</StyledListItem>
        <StyledListItem>4.3.2.2 내용물이 부적합일 경우, 제품을 폐기처리 한다.</StyledListItem>
      </StyledList>
      <StyledList>
        <StyledListItem>4.4 품질보증책임자는 부적합품의 처리가 적절하게 시행되었는지를 확인한다.</StyledListItem>
        <StyledListItem>4.5 품질보증부는 원료, 자재 입고 검사 중 중대 부적합 발생 시 해당 협력업체에 부적합 사항을 통보하고 원인조사 및 시정 및 예방조치를 요구한다.</StyledListItem>
        <StyledListItem>4.6 품질보증부는 제품의 중대 부적합품에 대해 해당부서에 부적합 보고를 작성하여 원인조사 및 시정조치를 요구하고, 이를 ERP 시스템을 통해 기록 관리한다.</StyledListItem>
        <StyledListItem>4.7 부적합품관련 해당부서 또는 협력업체는 원인분석결과와 시정 및 예방조치 계획을 작성하여 품질보증부에 통보한다.</StyledListItem>
        <StyledListItem>4.8 품질보증부는 접수 받은 시정 및 예방조치 계획을 평가하고 조치내용이 타당하면 종결하고, 타당하지 않으면 반려한다. 이 과정의 기록도 ERP 시스템을 통해 관리한다.</StyledListItem>
      </StyledList>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>5. 용어의 정의</SectionTitle>
      <StyledList>
        <StyledListItem>5.1 재작업 : 부적합품을 재가공 또는 다른 시정 방법에 의해 본래의 특성에 일치하도록 하는 작업</StyledListItem>
        <StyledListItem>5.2 폐기 : 부적합품이 재작업을 해도 회복이 불가능하여 본래의 용도를 상실 시키는 것</StyledListItem>
        <StyledListItem>5.3 반품 : 부적합 원료·자재 처리의 일환으로 특성이 불량하여 공정에 투입하여 사용할 수 없어 납품업체로 보내는 것</StyledListItem>
      </StyledList>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>6. 부적합품의 처리방법 결정</SectionTitle>
      <SubsectionTitle>6.1 재작업 후</SubsectionTitle>
      <StyledList>
        <StyledListItem>(1) "시험중" 라벨 부착 후 "시험대기" 구역에 옮긴다.</StyledListItem>
        <StyledListItem>(2) 재검사 후 적합 판정이 나면 "적합" 표시를 하고 보관소로 이동하여 보관 및 불출한다.</StyledListItem>
      </StyledList>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>7. 첨부</SectionTitle>
      <Paragraph>
        첨부 1) 부적합품 관리 보고서
      </Paragraph>
    </Box>
  );
}

export default BF_RMD_PM_11_Content;