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

function BF_RMD_PM_06_Content() {
  return (
    <Box sx={{ padding: '20px', backgroundColor: '#fff', borderRadius: '8px' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <Box>{/* 제조 관리 규정*/}
          <Typography>문서번호: BF-RMD-PM-06</Typography>
          
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
        본 규정은 (주)바이오에프디엔씨(이하 "당사"라 함) 제조소 내에서 제품의 제조에 관한 사항을 규정하여 균일하고 품질이 보증된 제품을 제조하는데 그 목적이 있다. 
      </Paragraph>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>2. 적용범위</SectionTitle>
      <Paragraph>
        본 규정은 당사의 제조소 내 제품 제조에 관여된 모든 사항에 대하여 적용한다. 
      </Paragraph>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>3. 책임과 권한</SectionTitle>
      <SubsectionTitle>3.1 품질경영최고책임자</SubsectionTitle>
      <StyledList>
        <StyledListItem>3.1.1 제조관리 규정의 승인을 담당한다.</StyledListItem>
      </StyledList>
      <SubsectionTitle>3.2 품질보증책임자</SubsectionTitle>
      <StyledList>
        <StyledListItem>3.2.1 제품의 품질관리 업무를 총괄 관리한다.</StyledListItem>
        <StyledListItem>3.2.2 원료 및 제품에 대한 시험 결과를 확인하고 적부 판정에 대한 책임과 권한을 갖는다.</StyledListItem>
      </StyledList>
      <SubsectionTitle>3.3 제조생산책임자</SubsectionTitle>
      <StyledList>
        <StyledListItem>3.3.1 제품 제조관리 업무를 총괄 관리한다.</StyledListItem>
        <StyledListItem>3.3.2 제조관리 규정 및 제품표준서에 준하여 제품의 제조가 이루어지는지 관리한다.</StyledListItem>
        <StyledListItem>3.3.3 제조관리 규정의 제·개정 업무를 주관한다.</StyledListItem>
      </StyledList>
      <SubsectionTitle>3.4 제조담당자</SubsectionTitle>
      <StyledList>
        <StyledListItem>3.4.1 원료 칭량 및 제품을 제조하며 이에 관한 제반 업무를 수행한다.</StyledListItem>
        <StyledListItem>3.4.2 원료 칭량 및 제품 제조공정 내용을 기록 및 확인한다.</StyledListItem>
        <StyledListItem>3.4.3 원료 칭량 및 제품 제조설비에 관한 일상적 유지 관리 업무를 한다.</StyledListItem>
        <StyledListItem>3.4.4 제품의 입출고 및 보관관리에 관련된 업무를 수행한다.</StyledListItem>
      </StyledList>
      <SubsectionTitle>3.5 품질관리담당자</SubsectionTitle>
      <StyledList>
        <StyledListItem>3.5.1 원료 및 제품의 검사시험 업무를 수행하여 결과를 기록하고, 해당 검사시험 결과를 해당 부서에 통보한다.</StyledListItem>
        <StyledListItem>3.5.2 제품 제조 시 발생되는 기록의 관리를 주관한다.</StyledListItem>
      </StyledList>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>4. 칭량 및 제조공정 관리</SectionTitle>
      <SubsectionTitle>4.1 칭량실의 관리</SubsectionTitle>
      <StyledList>
        <StyledListItem>4.1.1 칭량실은 청결히 관리하여 원료 오염을 방지한다.</StyledListItem>
      </StyledList>
      <SubsectionTitle>4.2 칭량 기기의 관리</SubsectionTitle>
      <StyledList>
        <StyledListItem>4.2.1 계측기는 "계측기 검교정 관리 규정"에 따라 관리한다.</StyledListItem>
        <StyledListItem>4.2.2 칭량 기기는 청결하게 유지한다.</StyledListItem>
        <StyledListItem>4.2.3 칭량 작업은 적절한 기기를 사용하며, 기기의 최대 허용 범위 내에서 칭량한다.</StyledListItem>
      </StyledList>
      <SubsectionTitle>4.3 제조 지시 및 기록서 관리</SubsectionTitle>
      <StyledList>
        <StyledListItem>4.3.1 ERP 시스템을 통해 "제조 지시 및 기록서"를 관리한다.</StyledListItem>
      </StyledList>
      <SubsectionTitle>4.4 칭량 및 제조 작업 방법</SubsectionTitle>
      <StyledList>
        <StyledListItem>4.4.1 칭량 및 제조 작업은 "제조 지시 및 기록서"에 따라 수행한다.</StyledListItem>
        <StyledListItem>4.4.2 품질관리팀의 시험을 거쳐 적합 판정된 원료만 사용한다.</StyledListItem>
        <StyledListItem>4.4.3 칭량 및 제조 관련 사항은 ERP 시스템에 기록한다.</StyledListItem>
        <StyledListItem>4.4.4 원료는 선입선출 원칙을 따른다.</StyledListItem>
        <StyledListItem>4.4.5 개봉 후 변질 우려가 있는 원료는 밀봉하여 보관한다.</StyledListItem>
        <StyledListItem>4.4.6 칭량이 끝난 후 원료 용기는 청결하게 관리하고 밀봉하여 보관한다.</StyledListItem>
        <StyledListItem>4.4.7 원료를 소분하여 보관할 경우, 원료명을 식별하여 관리한다.</StyledListItem>
      </StyledList>
      <SubsectionTitle>4.5 칭량한 원료의 제조공정으로의 이동</SubsectionTitle>
      <StyledList>
        <StyledListItem>4.5.1 칭량을 마친 원료는 식별하여 혼동이 없도록 한다.</StyledListItem>
        <StyledListItem>4.5.2 칭량을 마친 원료는 오염되지 않도록 제조공정으로 이동한다.</StyledListItem>
      </StyledList>
      <SubsectionTitle>4.6 제조 설비 기구의 점검 확인</SubsectionTitle>
      <Paragraph>
        제조담당자는 제조 전에 시설 및 기구의 청결상태, 조정 및 작동 상태를 점검한다.
      </Paragraph>
      <SubsectionTitle>4.7 제조 작업</SubsectionTitle>
      <StyledList>
        <StyledListItem>4.7.1 제품의 제조는 "제조 지시 및 기록서"에 따라 수행한다.</StyledListItem>
        <StyledListItem>4.7.2 제조 작업 결과는 ERP 시스템에 기록한다.</StyledListItem>
        <StyledListItem>4.7.3 제조 작업은 위생적으로 수행하며 오염이 발생하지 않도록 한다.</StyledListItem>
        <StyledListItem>4.7.4 제조 완료 시 "제품 관리 규정"에 따라 처리한다.</StyledListItem>
      </StyledList>
      <SubsectionTitle>4.8 작업중인 기계 기구 표시방법</SubsectionTitle>
      <StyledList>
        <StyledListItem>4.8.1 사용 중인 기계 및 기구에 상태를 표시한다.</StyledListItem>
        <StyledListItem>4.8.2 제조중인 제품의 정보를 기록하고 "제조 지시 및 기록서"와 비교 확인한다.</StyledListItem>
        <StyledListItem>4.8.3 연속 작업일 경우 제조번호만 바꾸어 표시한다.</StyledListItem>
        <StyledListItem>4.8.4 이전 작업 표시를 제거하고 현 작업상태 표시로 교체한다.</StyledListItem>
      </StyledList>
      <SubsectionTitle>4.9 제조된 제품의 보관소로의 이동</SubsectionTitle>
      <Paragraph>
        제조된 제품은 "제품 관리 규정"에 따라 관리한다.
      </Paragraph>
      <SubsectionTitle>4.10 이상 발생시 조치사항</SubsectionTitle>
      <Paragraph>
        제조 공정 중 이상 발생 시 "일탈관리규정"에 따라 제조생산책임자에게 보고하고 적절한 조치를 취한다.
      </Paragraph>
      <SubsectionTitle>4.11 폐기물 처리 방법</SubsectionTitle>
      <Paragraph>
        작업 중 발생한 폐기물은 "폐기물 처리 규정"에 따라 처리한다.
      </Paragraph>
      <SubsectionTitle>4.12 제품의 식별 및 추적성 관리</SubsectionTitle>
      <StyledList>
        <StyledListItem>4.12.1 "제품식별 및 추적성 관리 규정"에 따라 제품의 식별 및 추적이 가능하도록 관리한다.</StyledListItem>
      </StyledList>
      <SubsectionTitle>4.13 변경관리</SubsectionTitle>
      <StyledList>
        <StyledListItem>4.13.1 제조공정 또는 설비의 변경이 필요한 경우 "변경관리 규정"에 따라 처리한다.</StyledListItem>
      </StyledList>
      
      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>5. 첨부</SectionTitle>
      <StyledList>
        <StyledListItem>첨부1) 제조 지시 및 기록서</StyledListItem>
        <StyledListItem>첨부2) 칭량 지시 및 기록서</StyledListItem>
      </StyledList>
    </Box>
  );
}

export default BF_RMD_PM_06_Content;