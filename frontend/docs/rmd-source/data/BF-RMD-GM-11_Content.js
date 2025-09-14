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

function BF_RMD_GM_11_Content() {
  return (
    <Box sx={{ padding: '20px', backgroundColor: '#fff', borderRadius: '8px' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <Box>{/* 회수반품처리규정*/}
          <Typography>문서번호: BF-RM-GM-11</Typography>
          
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
        본 규정은 (주)바이오에프디엔씨(이하 "당사"라 함)에서 생산한 화장품 원료 중 결함이 발견된 제품의 회수, 반품, 폐기 또는 그 밖의 필요한 조치를 할 때 절차와 기준 등을 마련하여 체계적이고 신속한 업무처리로 제품의 위해성을 사전에 방지하며, 재발방지대책을 수립하여 제품의 품질향상 및 당사의 신뢰도를 높이는데 그 목적이 있다. 
      </Paragraph>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>2. 적용범위</SectionTitle>
      <StyledList>
        <StyledListItem>2.1 당사 제조소에서 제조, 판매된 화장품 원료 중 회수의 필요가 결정된 제품에 적용한다.</StyledListItem>
        <StyledListItem>2.2 당사 제조소에서 제조 후 출하한 화장품 원료 중 유통 및 영업 상의 이유로 반품되는 모든 제품에 적용한다.</StyledListItem>
      </StyledList>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>3. 책임과 권한</SectionTitle>
      <SubsectionTitle>3.1 품질보증책임자</SubsectionTitle>
      <StyledList>
        <StyledListItem>3.1.1 회수 및 반품 처리에 관한 최종 승인</StyledListItem>
        <StyledListItem>3.1.2 회수처리의 책임자로써 책임과 권한을 갖는다.</StyledListItem>
        <StyledListItem>3.1.3 회수처리에 관한 업무를 총괄하며 원인규명, 개선조치의 검토 및 실시를 관리 감독한다.</StyledListItem>
        <StyledListItem>3.1.4 회수 사항의 원인분석 및 그에 따른 조치를 취한다.</StyledListItem>
        <StyledListItem>3.1.5 회수 또는 반품된 제품의 입고 및 폐기 내역을 확인할 책임이 있다.</StyledListItem>
        <StyledListItem>3.1.6 해당 제품의 폐기 시까지 반품과 다른 제품의 보관구역 및 동선을 격리하여 보관하고 혼입을 방지할 책임이 있다.</StyledListItem>
        <StyledListItem>3.1.7 회수 종료 후 관련 문서 및 자료를 취합하여 보관할 책임이 있다.</StyledListItem>
      </StyledList>

      <SubsectionTitle>3.2 제조생산책임자</SubsectionTitle>
      <StyledList>
        <StyledListItem>3.2.1 회수된 제품의 보관 및 처리 방안에 따라 처리한다.</StyledListItem>
        <StyledListItem>3.2.2 해당 제품의 출하 내역을 파악한다.</StyledListItem>
        <StyledListItem>3.2.3 회수한 제품에 '회수품'임을 식별한 후 격리 보관한다.</StyledListItem>
        <StyledListItem>3.2.4 결정된 최종 회수품의 처리 방법에 따라 회수품을 처리한다.</StyledListItem>
      </StyledList>

      <SubsectionTitle>3.3 업무담당자</SubsectionTitle>
      <StyledList>
        <StyledListItem>3.3.1 고객으로부터 자사 제품 결함으로 인한 피해보상 또는 제품회수 요구사항을 접수하면 이를 즉시 품질보증책임자에게 보고한다.</StyledListItem>
        <StyledListItem>3.3.2 수출제품의 경우 해당 해외 바이어에게 제품명, 제조번호를 통보하여 제품의 회수를 요청한다.</StyledListItem>
        <StyledListItem>3.3.3 내수제품의 경우 해당 납품처에 제품명, 제조번호를 통보하여 제품의 회수를 요청한다.</StyledListItem>
        <StyledListItem>3.3.4 제품 회수처리 내역을 해당 고객사에 통보한다.</StyledListItem>
      </StyledList>
      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>4. 용어의 정의</SectionTitle>
      <SubsectionTitle>4.1 회수(리콜)</SubsectionTitle>
      <Paragraph>
        회수라 함은 판매한 제품 가운데 품질결함이나 안전성 문제 등으로 나타난 제조번호의 제품(필요 시 여타 제조번호 포함)을 제조소로 거두어들이는 활동을 말한다.
      </Paragraph>

      <SubsectionTitle>4.2 회수의 종류</SubsectionTitle>
      <StyledList>
        <StyledListItem>4.2.1 사전적 회수: 결함 원료로 인해 고객사에 피해가 발생하기 전에 실시하는 회수로서, 원료가 고객사에 납품되기 전 단계에서 실시되는 경우가 많기 때문에 사후에 취하는 회수보다 효율적이고 적은 비용으로 실시가 가능함.</StyledListItem>
        <StyledListItem>4.2.2 사후적 회수: 결함 원료의 사용으로 인해 고객사의 제품에 문제가 발생한 후에 시행하는 회수로서, 고객사의 피해 확산을 신속히 방지하는데 의의가 있음.</StyledListItem>
        <StyledListItem>4.2.3 자발적 회수: 당사가 자발적 의사에 따라 결함 원료에 대한 자진 수거, 폐기 등 회수처리 이행을 뜻함.</StyledListItem>
      </StyledList>

      <SubsectionTitle>4.3 결함</SubsectionTitle>
      <Paragraph>
        결함이라 함은 당해 제조 원료에 다음 항에 해당하는 제조, 설계 또는 표시상의 결함이나 기타 통상적으로 기대할 수 있는 품질 및 안전성이 결여되어 있는 것을 말한다.
      </Paragraph>
      <StyledList>
        <StyledListItem>4.3.1 설계상의 결함: 설계상의 결함이란 원료의 특성을 충분히 고려하여 처방하였으면 고객사의 제품에 피해나 위험을 줄이거나 피할 수 있었음에도 불구하고 그러지 못해서 원료가 안전하지 못하게 된 경우를 말한다.</StyledListItem>
        <StyledListItem>4.3.2 제조상의 결함: 제조상의 결함이란 원료 제조상의 주의의무를 이행했음에도 불구하고 원료가 원래 의도한 설계와 다르게 제조되어 품질이나 안전성에 문제가 생긴 경우를 말한다.</StyledListItem>
        <StyledListItem>4.3.3 표시상의 결함: 표시상의 결함이란 합리적인 설명·지시·경고 기타의 표시를 하였더라면 당해 원료에 의하여 발생될 수 있는 고객사의 제품 피해나 위험을 줄이거나 피할 수 있었음에도 이를 하지 아니한 경우를 말한다.</StyledListItem>
      </StyledList>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>5. 회수절차</SectionTitle>
      <StyledList>
        <StyledListItem>5.1 회수의 필요성이 발생되거나 당사의 고객사로부터 회수요청을 받았을 경우에는 신속하게 관련 회수사유를 품질보증책임자에게 보고한다.</StyledListItem>
        <StyledListItem>5.2 품질보증책임자는 신속하게 제품 수거 및 원인규명, 개선조치를 하도록 해당 부서에 지시한다.</StyledListItem>
        <StyledListItem>5.3 제조생산책임자는 해당 제품의 출하 내역을 파악한다.</StyledListItem>
        <StyledListItem>5.4 업무담당자는 파악된 제품 출하 내역에 따라 해당 고객사에게 제품 회수를 요청한다.</StyledListItem>
        <StyledListItem>5.5 제조생산책임자는 회수한 제품에 '회수품'임을 식별한 후 격리 보관한다.</StyledListItem>
        <StyledListItem>5.6 품질보증책임자는 회수 내용을 "회수처리 결과 보고서"에 작성하고 그 내용을 관련부서에 통보한다.</StyledListItem>
        <StyledListItem>5.7 품질보증책임자는 제품 결함 원인 및 조치사항, 제품 처리 방안을 해당부서와 협의한다.</StyledListItem>
        <StyledListItem>5.8 제조생산책임자는 결정된 최종 회수품의 처리 방법에 따라 회수품을 처리한다.</StyledListItem>
        <StyledListItem>5.9 업무담당자는 제품 회수처리 내역을 해당 고객사에 통보한다.</StyledListItem>
      </StyledList>
      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>6. 제품회수 체제 관리</SectionTitle>
      <SubsectionTitle>6.1 품질보증책임자는 다음 사항을 이행하는 회수 책임자 역할을 한다.</SubsectionTitle>
      <StyledList>
        <StyledListItem>6.1.1 전체 회수과정에 대한 고객사와의 조정역할</StyledListItem>
        <StyledListItem>6.1.2 결함 제품의 회수 및 관련 기록 보존</StyledListItem>
        <StyledListItem>6.1.3 소비자 안전에 영향을 주는 회수의 경우 즉시 관련 기관에 보고</StyledListItem>
        <StyledListItem>6.1.4 회수된 제품은 확인 후 제조소 내 격리보관 조치</StyledListItem>
        <StyledListItem>6.1.5 회수과정의 주기적인 평가 (모의회수)</StyledListItem>
      </StyledList>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>7. 제품 회수과정의 주기적 평가</SectionTitle>
      <StyledList>
        <StyledListItem>7.1 품질보증책임자는 매년 1회 모의제품회수를 실시한다.</StyledListItem>
        <StyledListItem>7.2 모의제품회수 훈련 종료 후 훈련결과를 첨부 "모의회수 실시 결과 보고서"에 작성한다.</StyledListItem>
        <StyledListItem>7.3 모의회수 결과를 종합 평가하여 필요 시 개선을 지시한다.</StyledListItem>
        <StyledListItem>7.4 개선 지시를 받은 해당 책임자는 해당 조치를 취하고 품질보증책임자에게 그 결과를 보고한다.</StyledListItem>
      </StyledList>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>8. 회수품 분류</SectionTitle>
      <SubsectionTitle>8.1 재입고 가능한 제품</SubsectionTitle>
      <Paragraph>
        내용물에 이상이 없으며 포장상태가 양호하여 상품가치에 이상이 없는 제품을 말한다.
      </Paragraph>
      <SubsectionTitle>8.2 재포장 및 재생 가능한 제품</SubsectionTitle>
      <Paragraph>
        포장재가 훼손되었으나, 재포장 및 재생 시 재입고 가능한 제품으로 분류되는 제품을 말한다. 품목 및 제조번호에 따라 "충진 포장 지시 및 기록서"에 의해 작업하고, 품질보증부서의 품질검사 결과가 적합으로 판정된 후에 입고한다.
      </Paragraph>
      <SubsectionTitle>8.3 폐기제품</SubsectionTitle>
      <Paragraph>
        회수품 중 다음에 해당하는 제품을 말한다.
      </Paragraph>
      <StyledList>
        <StyledListItem>- 제조번호를 알 수 없는 제품</StyledListItem>
        <StyledListItem>- 파손, 변질, 누액 등으로 제품의 품질에 이상이 있는 제품</StyledListItem>
        <StyledListItem>- 1차 포장재가 파손된 제품</StyledListItem>
        <StyledListItem>- 화재, 수해를 입은 제품</StyledListItem>
      </StyledList>
      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>9. 반품관리</SectionTitle>
      <SubsectionTitle>9.1 반품접수</SubsectionTitle>
      <Paragraph>
        해당하는 제품이 반품으로 입고되면 ERP 시스템의 반품 입력 기능을 사용하여 기록하고 처리한다.
      </Paragraph>
      
      <SubsectionTitle>9.2 반품처리절차</SubsectionTitle>
      <StyledList>
        <StyledListItem>9.2.1 반품된 제품은 품질보증책임자의 검토를 거쳐 폐기, 재포장을 결정한 후 시행한다.</StyledListItem>
        <StyledListItem>9.2.2 반품수령자는 인수된 반품의 품명, 수량, 포장 상태를 확인하고 '회수반품접수 및 관리대장'에 접수한 후 담당자에게 인계하여 반품보관함에 보관한다.</StyledListItem>
        <StyledListItem>9.2.3 품질보증책임자는 반품내역을 검토하여 재포장 가능 여부를 판단하고, 재포장이 불가능한 경우 폐기를 결정한다.</StyledListItem>
        <StyledListItem>9.2.4 담당자는 반품내역과 대조하여 확인하고, 폐기 대상 제품은 '폐기물 처리 규정'에 따라 처리한다.</StyledListItem>
      </StyledList>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>10. 첨부</SectionTitle>
      <StyledList>
        <StyledListItem>첨부1) 회수처리 결과 보고서</StyledListItem>
        <StyledListItem>첨부2) 모의회수 실시 결과 보고서</StyledListItem>
        <StyledListItem>첨부3) 회수반품접수 및 관리대장</StyledListItem>
        <StyledListItem>첨부4) 회수반품폐기 기록서</StyledListItem>
      </StyledList>
    </Box>
  );
}

export default BF_RMD_GM_11_Content;