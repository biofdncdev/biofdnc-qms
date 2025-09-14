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

function BF_RMD_QC_02_Content() {
  return (
    <Box sx={{ padding: '20px', backgroundColor: '#fff', borderRadius: '8px' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <Box>{/* 일탈 관리 규정*/}
          <Typography>문서번호: BF-RM-QC-02</Typography>
          
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
        본 규정은 (주)바이오에프디엔씨(이하 "당사"라 함) 내에서 제품 제조 또는 품질관리에 관한 일탈을 정의하고 발생된 일탈에 대하여 근본적인 원인을 조사 및 시정함으로써 재발을 방지하는데 그 목적이 있다.
      </Paragraph>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>2. 적용범위</SectionTitle>
      <Paragraph>
        본 규정은 당사 제품 제조소 내에서 규정된 요구사항에 적합하지 않은 일탈관리의 검토, 처리에 대한 사항과 이의 예방 및 조치에 적용한다.
      </Paragraph>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>3. 용어의 정의</SectionTitle>
      <StyledList>
        <StyledListItem>3.1 일탈: 규정된 요구사항, 절차, 또는 기준으로부터 벗어난 상태를 말한다.</StyledListItem>
        <StyledListItem>3.2 시정조치: 발견된 부적합 또는 기타 바람직하지 않은 상황의 원인을 제거하기 위한 조치를 말한다.</StyledListItem>
        <StyledListItem>3.3 예방조치: 잠재적 부적합 또는 기타 바람직하지 않은 잠재적 상황의 원인을 제거하기 위한 조치를 말한다.</StyledListItem>
        <StyledListItem>3.4 재작업: 부적합 제품을 규정된 요구사항에 일치시키기 위해 취해지는 조치를 말한다.</StyledListItem>
        <StyledListItem>3.5 선별: 부적합 제품 중에서 적합한 것을 골라내는 작업을 말한다.</StyledListItem>
        <StyledListItem>3.6 폐기: 부적합 제품을 사용하지 못하도록 처리하는 것을 말한다.</StyledListItem>
      </StyledList>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>4. 책임과 권한</SectionTitle>
      <SubsectionTitle>4.1 품질경영최고책임자</SubsectionTitle>
      <StyledList>
        <StyledListItem>4.1.1 일탈관리 규정의 최종 승인</StyledListItem>
      </StyledList>
      <SubsectionTitle>4.2 품질보증책임자</SubsectionTitle>
      <StyledList>
        <StyledListItem>4.2.1 일탈관리 프로세스 총괄 관리</StyledListItem>
        <StyledListItem>4.2.2 일탈관리에 대한 시험 및 적부판정 책임</StyledListItem>
      </StyledList>
      <SubsectionTitle>4.3 제조생산책임자</SubsectionTitle>
      <StyledList>
        <StyledListItem>4.3.1 품질보증부와 협의하여 일탈관리 처리 방안 수립</StyledListItem>
        <StyledListItem>4.3.2 일탈관리 처리 업무 주관</StyledListItem>
      </StyledList>
      <SubsectionTitle>4.4 품질보증담당자</SubsectionTitle>
      <StyledList>
        <StyledListItem>4.4.1 일탈관리 프로세스 실무 주관</StyledListItem>
        <StyledListItem>4.4.2 관련부서와 협의하여 일탈관리 처리 방안 결정</StyledListItem>
        <StyledListItem>4.4.3 일탈사항에 대한 시정 및 예방조치 주관</StyledListItem>
        <StyledListItem>4.4.4 일탈 관련 문서 및 기록 관리</StyledListItem>
      </StyledList>
      <SubsectionTitle>4.5 품질관리담당자</SubsectionTitle>
      <StyledList>
        <StyledListItem>4.5.1 일탈에 대한 검사시험 수행</StyledListItem>
      </StyledList>
      <SubsectionTitle>4.6 제조담당자</SubsectionTitle>
      <StyledList>
        <StyledListItem>4.6.1 해당 일탈관리에 대한 시정 및 예방 조치 실행</StyledListItem>
        <StyledListItem>4.6.2 일탈기준 부적합 품목에 대해 결정된 처리 방안 이행</StyledListItem>
      </StyledList>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>5. 일탈 처리</SectionTitle>
      <StyledList>
        <StyledListItem>5.1 일탈 발견자는 해당 부서장에게 그 내용을 즉시 보고한다.</StyledListItem>
        <StyledListItem>5.2 일탈 보고를 받은 부서장은 품질보증책임자와 협의하여 발견된 일탈의 처리 방법을 결정한다.</StyledListItem>
        <StyledListItem>5.3 일탈의 처리 방안에는 재작업, 선별, 폐기로 구분하며 경우에 따라 적절한 방법으로 선택하여 처리한다.</StyledListItem>
        <StyledListItem>5.4 일탈의 검토 결과 재작업 또는 선별인 경우는 해당 작업 후에 재검사를 실시한다.</StyledListItem>
        <StyledListItem>5.5 일탈 제품이 사용 불가능한 경우 폐기하거나 반품 처리한다.</StyledListItem>
        <StyledListItem>5.6 일탈의 처리는 해당 부서에서 담당하며, 일탈조사보고서를 작성하여 보고한다.</StyledListItem>
        <StyledListItem>5.7 일탈로 판정된 부적합품의 폐기처리는 관련부서에서 담당한다.</StyledListItem>
        <StyledListItem>5.8 품질보증책임자는 일탈의 처리가 적절하게 시행되었는지를 확인한다.</StyledListItem>
        <StyledListItem>5.9 일탈이 발생된 부서의 부서장은 일탈에 대한 원인 분석 후, 재발되지 않도록 조치한다.</StyledListItem>
      </StyledList>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>6. 환경설비에 대한 일탈</SectionTitle>
      <StyledList>
        <StyledListItem>6.1 에어컨, 보일러, 에어컴프레셔 등 환경 설비가 다음 중 한가지 이상 발생 시 일탈로 분류한다.</StyledListItem>
        <StyledList>
          <StyledListItem>6.1.1 온도 일탈</StyledListItem>
          <StyledListItem>6.1.2 설비의 정상 작동 범위를 벗어난 압력, 유량</StyledListItem>
          <StyledListItem>6.1.3 제어 시스템의 오작동 또는 이상 신호</StyledListItem>
        </StyledList>
        <StyledListItem>6.2 설비 담당은 상기 일탈 발생 시 해당 설비를 즉시 가동 중지 시키고, 일탈 원인 파악 후 시정 및 예방조치를 취한다.</StyledListItem>
        <StyledListItem>6.3 품질관리담당자는 시정 및 예방조치가 유효한지 확인 후 적합할 경우 설비를 재가동하도록 해당 부서에 통보한다.</StyledListItem>
      </StyledList>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>7. 일탈의 시정 조치 결과의 확인</SectionTitle>
      <StyledList>
        <StyledListItem>7.1 품질보증책임자는 일탈 조치 결과의 유효성을 확인하여 미흡할 경우 재차 시정을 요구한다.</StyledListItem>
        <StyledListItem>7.2 일탈기준의 변경이 필요할 때는 해당 문서를 개정하며, 해당 생산관리담당자는 이를 준수한다.</StyledListItem>
      </StyledList>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>8. 첨부</SectionTitle>
      <Paragraph>
        첨부1) 일탈조사 보고서
      </Paragraph>
    </Box>
  );
}

export default BF_RMD_QC_02_Content;