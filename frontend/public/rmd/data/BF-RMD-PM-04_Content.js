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

function BF_RMD_PM_04_Content() {
  return (
    <Box sx={{ padding: '20px', backgroundColor: '#fff', borderRadius: '8px' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <Box>{/* 원료 관리 규정*/}
          <Typography>문서번호: BF-RMD-PM-04</Typography>
          
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
        본 규정은 (주)바이오에프디엔씨(이하 '당사'라 함.) 제조소의 제품 제조에 필요한 원료를 정확하게 입출고, 보관관리하기 위한 규정으로서 원료의 혼동, 교차오염 등의 품질 저하 위험 요소 및 인위적인 과오를 예방하고자 함에 그 목적이 있다. 
      </Paragraph>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>2. 적용범위</SectionTitle>
      <Paragraph>
        본 규정은 당사의 제품 제조에 사용되는 모든 원료에 적용한다.
      </Paragraph>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>3. 책임과 권한</SectionTitle>
      <SubsectionTitle>3.1 제조생산책임자</SubsectionTitle>
      <StyledList>
        <StyledListItem>3.1.1 원료의 입출고 및 보관에 대한 총괄 관리 책임</StyledListItem>
        <StyledListItem>3.1.2 출고의뢰에 따른 원료 출고 관리</StyledListItem>
      </StyledList>
      <SubsectionTitle>3.2 원료입고 담당자</SubsectionTitle>
      <StyledList>
        <StyledListItem>3.2.1 원료 인수 및 입고검수 (품목, 수량, 원료 포장 용기의 오염 및 파손 상태 등 점검)</StyledListItem>
        <StyledListItem>3.2.2 입고검사 적합품의 입고 및 보관 관리</StyledListItem>
      </StyledList>
      <SubsectionTitle>3.3 품질보증책임자</SubsectionTitle>
      <StyledList>
        <StyledListItem>3.3.1 입고검사 결과에 대한 최종 승인 및 부적합 시 조치에 대한 총괄관리</StyledListItem>
      </StyledList>
      <SubsectionTitle>3.4 품질관리담당자</SubsectionTitle>
      <StyledList>
        <StyledListItem>3.4.1 필요시 입고품 검체 채취 및 품질 시험 수행</StyledListItem>
        <StyledListItem>3.4.2 원료의 적합 여부 판단</StyledListItem>
        <StyledListItem>3.4.3 부적합 입고품에 대한 원인 조사 및 해당 협력업체에 시정조치 요구</StyledListItem>
        <StyledListItem>3.4.4 원료 보관 조건 모니터링 및 기록</StyledListItem>
      </StyledList>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>4. 업무 절차</SectionTitle>
      <SubsectionTitle>4.1 원료 인수 및 입고 검수</SubsectionTitle>
      <StyledList>
        <StyledListItem>4.1.1 원료 입고 담당자는 원료 인수 시 외관상태, 라벨상태, 품목 및 수량, 밀봉상태, 성상, 사용기한, 시험성적서 동봉 여부, 이물질 유무 등을 확인한다. 이상이 없을 경우 입고 내역을 전산에 입력한다.</StyledListItem>
        <StyledListItem>4.1.2 원료 입고 담당자는 필요시 품질보증부서에 입고검사를 의뢰한다.</StyledListItem>
        <StyledListItem>4.1.3 원료에 이상이 있을 경우 협력업체에 통보하여 반품 또는 교환 등의 적절한 조치를 취한다.</StyledListItem>
        <StyledListItem>4.1.4 원료 입고검사 담당자는 입고품에 식별을 위한 표시라벨을 부착한다.</StyledListItem>
      </StyledList>

      <SubsectionTitle>4.2 원료 검체 채취 및 품질 시험</SubsectionTitle>
      <StyledList>
        <StyledListItem>4.2.1 품질관리담당자는 필요시 입고 검사용 검체를 채취하고 품질 시험을 수행한다.</StyledListItem>
        <StyledListItem>4.2.2 입고되는 원료의 로트가 동일하다 하더라도 모든 원료에 식별표시를 붙인다.</StyledListItem>
      </StyledList>

      <SubsectionTitle>4.3 적합품의 처리</SubsectionTitle>
      <Paragraph>
        시험결과 적합이면 해당 원료라벨에 "적합" 표시를 하여 원료 보관소로 옮긴다.
      </Paragraph>

      <SubsectionTitle>4.4 부적합품의 처리</SubsectionTitle>
      <StyledList>
        <StyledListItem>4.4.1 시험결과 부적합이면 해당 원료라벨에 "부적합" 표시를 하여 구분된 부적합품 보관 장소로 옮긴다.</StyledListItem>
        <StyledListItem>4.4.2 품질보증책임자는 부적합 내용을 검토하고 그 원인을 조사하여 전산에 기록한다.</StyledListItem>
        <StyledListItem>4.4.3 부적합 원료는 협력업체에 반품 처리한다.</StyledListItem>
      </StyledList>

      <SubsectionTitle>4.5 원료 보관</SubsectionTitle>
      <Paragraph>4.5.1 원료 보관조건</Paragraph>
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
              <TableCell>일반 원료</TableCell>
              <TableCell>온도 : 1 ~ 30℃</TableCell>
              <TableCell>원료보관소내 보관</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>저온 보관 원료</TableCell>
              <TableCell>온도 : 15℃ 이하</TableCell>
              <TableCell>냉장고</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>냉동 보관 원료</TableCell>
              <TableCell>온도 : -10℃ 이하</TableCell>
              <TableCell>냉동고</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
      <StyledList>
        <StyledListItem>4.5.1.1 온도 상태를 매일 1회 점검하여 기록한다.</StyledListItem>
      </StyledList>
      <Paragraph>4.5.2 원료 보관 관리</Paragraph>
      <StyledList>
        <StyledListItem>4.5.2.1 혼동의 방지</StyledListItem>
        <StyledList>
          <StyledListItem>4.5.2.1.1 각 원료의 종류에 따라 구분하여 보관한다.</StyledListItem>
          <StyledListItem>4.5.2.1.2 원료 간 적절한 공간과 거리를 확보한다.</StyledListItem>
        </StyledList>
        <StyledListItem>4.5.2.2 오염 및 변질의 예방</StyledListItem>
        <StyledList>
          <StyledListItem>4.5.2.2.1 원료는 창고바닥이 아닌 파렛트/선반 위에 보관하고 통풍, 방습 및 청소가 용이한 장소에 보관한다.</StyledListItem>
          <StyledListItem>4.5.2.2.2 별도로 저장방법이 지정된 것은 지정사항을 준수한다.</StyledListItem>
        </StyledList>
      </StyledList>

      <SubsectionTitle>4.6 원료 출고</SubsectionTitle>
      <StyledList>
        <StyledListItem>4.6.1 제조담당자는 "칭량 지시 및 기록서"에 따라 해당 원료를 칭량하고, 원료를 출고한다.</StyledListItem>
        <StyledListItem>4.6.2 원료 출고 시 선입선출 원칙을 적용하여 입고일 순으로 출고한다. 다만, 다음의 경우 우선적으로 출고한다:</StyledListItem>
        <StyledList>
          <StyledListItem>4.6.2.1 이미 개봉되어 잔량이 남은 원료</StyledListItem>
          <StyledListItem>4.6.2.2 입고 전 시험을 실시한 원료 패키지 ("V" 표시로 구분)</StyledListItem>
        </StyledList>
      </StyledList>

      <SubsectionTitle>4.7 원료의 재고 조사 및 사용기한 관리</SubsectionTitle>
      <StyledList>
        <StyledListItem>4.7.1 협력업체의 기준 또는 타당한 근거를 바탕으로 원료 종류별 사용기한을 설정하여 관리한다.</StyledListItem>
        <StyledListItem>4.7.2 제조담당자는 매 분기별 원료 입출고 내역과 원료 보관소내의 현품을 비교하여, 재고조사를 한다.</StyledListItem>
        <StyledListItem>4.7.3 만일 입출고 대장상의 재고와 실재고 상의 재고 차이가 5% 이상 날 경우 그 원인을 분석하고 조치하여, 그 결과를 제조생산책임자에게 보고한다.</StyledListItem>
        <StyledListItem>4.7.4 재고조사 결과 품질이 의심스러운 원료는 품질보증 부서에 의뢰하여 재검사를 실시한다.</StyledListItem>
        <StyledListItem>4.7.5 재검사 결과 "적합"으로 판정되면 제조에 사용한다.</StyledListItem>
        <StyledListItem>4.7.6 재검사 결과 "부적합"으로 판정된 원료는 폐기처리 한다.</StyledListItem>
        <StyledListItem>4.7.7 사용기한이 경과한 원료는 폐기처리 한다.</StyledListItem>
        <StyledListItem>4.7.8 원료 보관 중 용기가 훼손되었거나 장기보관으로 인해 이상이 생겼다고 판단될 경우에는 폐기처리 한다.</StyledListItem>
      </StyledList>

      <SubsectionTitle>4.8 원료관리</SubsectionTitle>
      <StyledList>
        <StyledListItem>4.8.1 주요 원료의 안전재고와 리드타임을 설정한다.</StyledListItem>
        <StyledList>
          <StyledListItem>4.8.1.1 안전재고는 원료 사용량과 리드타임을 고려하여 결정한다.</StyledListItem>
          <StyledListItem>4.8.1.2 리드타임은 원료 발주부터 입고까지 소요되는 기간을 기준으로 설정한다.</StyledListItem>
          <StyledListItem>4.8.1.3 안전재고와 리드타임은 상황에 따라 적절히 조정한다.</StyledListItem>
        </StyledList>
      </StyledList>
    </Box>
  );
}

export default BF_RMD_PM_04_Content;
