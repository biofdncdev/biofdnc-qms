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

function BF_RMD_QC_09_Content() {
  return (
    <Box sx={{ padding: '20px', backgroundColor: '#fff', borderRadius: '8px' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <Box>{/* 표준품관리규정*/}
          <Typography>문서번호: BF-RM-QC-09</Typography>
          
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
        본 규정은 (주)바이오에프디엔씨(이하 '당사'라 한다.)의 품질관리 업무를 수행하면서 원료, 자재, 제품 등의 표준품에 대한 제반 사항을 규정함으로서 정확하고 효율적인 품질관리 및 제품 제조시의 오류발생을 방지하는데 그 목적이 있다.
      </Paragraph>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>2. 적용범위</SectionTitle>
      <Paragraph>
        본 규정은 당사의 제품 제조 관련 모든 업무담당자에 적용한다.
      </Paragraph>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>3. 용어의 정의</SectionTitle>
      <StyledList>
        <StyledListItem>3.1 표준품: 원료, 자재, 제품 등의 품질을 평가하기 위한 기준이 되는 물질로, 품질검사 시 비교 대상으로 사용된다.</StyledListItem>
        <StyledListItem>3.2 관리품: 제품의 품질을 장기적으로 모니터링하기 위해 보관하는 제품 샘플로, 필요시 품질 검사에 사용될 수 있다.</StyledListItem>
      </StyledList>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>4. 책임과 권한</SectionTitle>
      <SubsectionTitle>4.1 품질경영최고책임자</SubsectionTitle>
      <StyledList>
        <StyledListItem>4.1.1 본 규정에 대한 최종 승인 권한을 가진다.</StyledListItem>
      </StyledList>
      <SubsectionTitle>4.2 품질보증책임자</SubsectionTitle>
      <StyledList>
        <StyledListItem>4.2.1 표준품 관리 규정의 승인 및 운영을 총괄한다.</StyledListItem>
        <StyledListItem>4.2.2 표준품 관리에 대한 지시 및 감독을 수행한다.</StyledListItem>
      </StyledList>
      <SubsectionTitle>4.3 품질보증담당자</SubsectionTitle>
      <StyledList>
        <StyledListItem>4.3.1 표준품을 선정하고 이에 대한 보관관리를 수행한다.</StyledListItem>
        <StyledListItem>4.3.2 표준품을 기준으로 원료, 자재, 제품 등의 적부판정을 내린다.</StyledListItem>
        <StyledListItem>4.3.3 표준품의 보관조건 및 보관상태를 정기적으로 확인한다.</StyledListItem>
      </StyledList>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>5. 표준품 선정</SectionTitle>
      <SubsectionTitle>5.1 제품 표준품</SubsectionTitle>
      <StyledList>
        <StyledListItem>5.1.1 신제품은 초도 포장 제품을 표준으로 설정함을 원칙으로 한다.</StyledListItem>
        <StyledListItem>5.1.2 자재의 변경, 원료의 변경 및 외관, 물성변화 등으로 인하여 표준 재설정의 필요가 있을 시 품질보증담당자가 지정하여 설정한 후 품질보증책임자가 승인한다.</StyledListItem>
      </StyledList>
      <SubsectionTitle>5.2 자재 표준품</SubsectionTitle>
      <StyledList>
        <StyledListItem>5.2.1 자재는 특별한 경우를 제외하고 표준품 관리대상에서 제외한다.</StyledListItem>
        <StyledListItem>5.2.2 특별한 경우, 초도 입고 시 품질보증책임자가 지정한 견본을 표준으로 한다.</StyledListItem>
      </StyledList>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>6. 표준품의 관리 지침</SectionTitle>
      <StyledList>
        <StyledListItem>6.1 표준품에 "표준품 라벨"을 붙이고, 표준품 손상 또는 변질우려가 없는 적합한 조건의 장소에서 표준품을 보관하고, 품질 검사시험 시 비교, 판정한다.</StyledListItem>
        <StyledListItem>6.2 특별한 보관조건이 라벨상에 지시되어 있는 경우에는 그에 부합되게 보관한다. 일반적으로는 열과 빛이 닿지 않으며 습기를 피할 수 있도록 보관한다.</StyledListItem>
        <StyledListItem>6.3 표준품 제정 시나 변경 시에 "표준품 관리대장"에 기록한 후 관리한다.</StyledListItem>
        <StyledListItem>6.4 원료 표준품의 사용기한이 도달한 경우에는 최근의 동일한 원료로 소분하여 표준품을 설정한다.</StyledListItem>
      </StyledList>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>7. 표준품의 채취량</SectionTitle>
      <SubsectionTitle>7.1 원료</SubsectionTitle>
      <StyledList>
        <StyledListItem>7.1.1 분말(고체)상 원료: 최초 입고시 1 ~ 100g을 채취한다.</StyledListItem>
        <StyledListItem>7.1.2 액상 원료: 최초 입고시 1 ~ 100g을 채취한다.</StyledListItem>
        <StyledListItem>7.1.3 고가의 원료는 소량 채취한다.</StyledListItem>
        <StyledListItem>7.1.4 추출원재료: 필요시에만 적정량을 채취한다.</StyledListItem>
      </StyledList>
      <SubsectionTitle>7.2 자재</SubsectionTitle>
      <StyledList>
        <StyledListItem>7.2.1 자재는 특별한 경우를 제외하고 표준품 관리대상에서 제외한다.</StyledListItem>
      </StyledList>
      <SubsectionTitle>7.3 제품</SubsectionTitle>
      <StyledList>
        <StyledListItem>7.3.1 표준품 (초도 제품 또는 교체품): 1개</StyledListItem>
        <StyledListItem>7.3.2 관리품: 1개</StyledListItem>
      </StyledList>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>8. 표준품 및 관리품의 보관 기간 및 교체주기</SectionTitle>
      <StyledList>
        <StyledListItem>8.1 원료 및 제품의 표준품은 실온에서 제품 사용기한 후 1년간 보관하며, 필요시 연장한다.</StyledListItem>
        <StyledListItem>8.2 관리품의 보관기간은 기본적으로 표준품의 보관 기간과 동일하며, 제품의 생산빈도, 제품특성, 기타사항을 고려하여 품질보증담당자가 정한다.</StyledListItem>
        <StyledListItem>8.3 불필요한 표준품 및 관리품에 대해서는 품질보증 담당자의 판단에 따라 폐기할 수 있다.</StyledListItem>
        <StyledListItem>8.4 표준품의 교체주기</StyledListItem>
      </StyledList>
      <StyledList sx={{ paddingLeft: '20px' }}>
        <StyledListItem>8.4.1 표준품의 교체주기는 제품의 특성, 안정성, 사용빈도 등을 고려하여 품질보증책임자가 설정한다.</StyledListItem>
        <StyledListItem>8.4.2 일반적인 교체주기는 다음과 같으나, 제품별로 다르게 설정할 수 있다:</StyledListItem>
        <StyledList sx={{ paddingLeft: '20px' }}>
          <StyledListItem>a) 안정성이 높은 제품: 2-3년</StyledListItem>
          <StyledListItem>b) 일반 제품(천연물 유래): 1년</StyledListItem>
          <StyledListItem>c) 안정성이 낮은 제품: 6개월-1년</StyledListItem>
        </StyledList>
        <StyledListItem>8.4.3 교체주기 도래 시, 품질보증담당자는 표준품의 품질을 재평가하여 교체 여부를 결정한다.</StyledListItem>
        <StyledListItem>8.4.4 품질에 이상이 없을 경우, 품질보증책임자의 승인 하에 교체주기를 연장할 수 있다.</StyledListItem>
        <StyledListItem>8.4.5 교체주기 내에도 표준품의 품질에 이상이 발견될 경우, 즉시 새로운 표준품으로 교체한다.</StyledListItem>
      </StyledList>

    </Box>
  );
}

export default BF_RMD_QC_09_Content;