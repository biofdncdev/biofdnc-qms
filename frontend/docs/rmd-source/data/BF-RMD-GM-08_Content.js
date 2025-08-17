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

function BF_RMD_GM_08_Content() {
  return (
    <Box sx={{ padding: '20px', backgroundColor: '#fff', borderRadius: '8px' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <Box>{/* 불만 처리 규정*/}
          <Typography>문서번호: BF-RMD-GM-08</Typography>
          
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
        본 규정은 (주)바이오에프디엔씨(이하 "당사"라 함)에서 생산되는 화장품 원료에 대한 불만의 처리에 대하여 필요한 사항을 정하여 적절하고 신속한 처리와 불만의 재발 방지 및 품질이 보증된 우수 화장품 원료를 제조, 공급하는 것을 목적으로 한다.
      </Paragraph>

      <Divider sx={{ marginY: '50px' }} />

      <SectionTitle>2. 적용범위</SectionTitle>
      <Paragraph>
        본 규정은 당사에서 제조, 출하하는 화장품 원료의 품질 및 운송 등에 관한 불만이 발생한 경우 불만의 접수, 원인조사, 조치, 보고, 회신 등 불만처리 전반에 걸쳐 각 관련부서에서 취해야 할 사항과 그 절차에 대하여 적용한다.
      </Paragraph>

      <Divider sx={{ marginY: '50px' }} />

      <SectionTitle>3. 책임과 권한</SectionTitle>
      <SubsectionTitle>3.1 품질경영최고책임자</SubsectionTitle>
      <StyledList>
        <StyledListItem>3.1.1 불만처리 관련 최종 의사결정</StyledListItem>
      </StyledList>

      <SubsectionTitle>3.2 품질보증책임자</SubsectionTitle>
      <StyledList>
        <StyledListItem>3.2.1 불만처리에 관한 업무를 주관하며 다른 부서와 협의하여 정보 수집, 집계, 분석, 조치 및 대책을 마련한다.</StyledListItem>
        <StyledListItem>3.2.2 불만처리에 관해 관련부서와 함께 후속조치를 수립한다.</StyledListItem>
        <StyledListItem>3.2.3 불만처리에 관한 보고업무를 주관한다.</StyledListItem>
        <StyledListItem>3.2.4 불만처리에 관련된 문서를 유지 관리한다.</StyledListItem>
        <StyledListItem>3.2.5 불만처리 후의 사후 관리를 주관한다.</StyledListItem>
      </StyledList>

      <SubsectionTitle>3.3 제조생산책임자</SubsectionTitle>
      <StyledList>
        <StyledListItem>3.3.1 불만 사항에 대한 제조 관련 시정 조치를 한다.</StyledListItem>
      </StyledList>

      <SubsectionTitle>3.4 업무담당자</SubsectionTitle>
      <StyledList>
        <StyledListItem>3.4.1 불만 사항을 접수한다.</StyledListItem>
        <StyledListItem>3.4.2 불만 사항을 접수하여 불만 제품 및 불만내용을 품질보증책임자에게 통보한다.</StyledListItem>
        <StyledListItem>3.4.3 불만 사항의 처리내용을 불만을 제기한 고객에게 회신한다.</StyledListItem>
        <StyledListItem>3.4.4 불만 사항의 원인분석 및 그에 따른 재발방지 조치를 취한다.</StyledListItem>
      </StyledList>
      <Divider sx={{ marginY: '50px' }} />

      <SectionTitle>4. 용어의 정의</SectionTitle>
      <SubsectionTitle>4.1 불만</SubsectionTitle>
      <Paragraph>
        생산된 화장품 원료를 사용하는 고객 등이 제품의 품질 이상에 대하여 개선 및 불만처리를 요구하는 사항과, 고객으로부터의 인터넷, 유선, 구두, 우편 등의 형태로 접수된 제품 품질 관련 불만족 (클레임 포함)
      </Paragraph>
      <SubsectionTitle>4.2 고객</SubsectionTitle>
      <Paragraph>
        거래선, 고객, 유통업체 등 당사 제품을 구입한 주체.
      </Paragraph>

      <Divider sx={{ marginY: '50px' }} />

      <SectionTitle>5. 불만 사항의 접수</SectionTitle>
      <SubsectionTitle>5.1 고객 정보 입수</SubsectionTitle>
      <StyledList>
        <StyledListItem>5.1.1 고객 정보: 회사명, 담당자명, 연락처 등</StyledListItem>
        <StyledListItem>5.1.2 불만 제품 정보: 제품명, 제조번호, 입수경위, 불만발생 형태, 고객 피해 상태 및 정도 등</StyledListItem>
        <StyledListItem>5.1.3 불만 사항을 접수한 업무담당자는 ERP 시스템에 파악한 내용을 기록한다.</StyledListItem>
        <StyledListItem>5.1.4 고객이 불만 사항으로 인해 피해를 입은 것에 대하여 보상 등 원하는 사항이 있을 경우 그 내용 및 정도를 파악한다.</StyledListItem>
        <StyledListItem>5.1.5 중대한 불만 발생시 이를 즉각 품질보증책임자에게 보고하여 신속한 현물 입수 및 대책을 수립하여 조치를 취할 수 있도록 한다.</StyledListItem>
      </StyledList>

      <SubsectionTitle>5.2 현물 입수</SubsectionTitle>
      <StyledList>
        <StyledListItem>5.2.1 업무담당자는 사안의 중대성 여부를 판단하여 현물을 입수하도록 한다.</StyledListItem>
        <StyledListItem>5.2.2 현물 입수 외에 사건 파악을 위한 추가적인 자료의 필요 시 사진 촬영, 녹취도 가능하다.</StyledListItem>
        <StyledListItem>5.2.3 고객이 불만 제품의 제공을 거부할 경우, 원인 규명 및 조치가 신속히 이루어질 수 없음을 고객에게 알린다.</StyledListItem>
      </StyledList>

      <Divider sx={{ marginY: '50px' }} />

      <SectionTitle>6. 불만 사항의 현상 파악, 분석 및 처리</SectionTitle>
      <Paragraph>
        6.1 고객 불만 내용 및 불만 제품을 통보 받은 품질보증책임자는 다음과 같이 관련부서와 협의하여 접수된 불만 사항을 처리한다.
      </Paragraph>
      <StyledList>
        <StyledListItem>6.1.1 정확한 현상 파악</StyledListItem>
        <StyledListItem>6.1.2 원인 조사, 분석</StyledListItem>
        <StyledListItem>6.1.3 재발 방지 대책 수립</StyledListItem>
        <StyledListItem>6.1.4 처리 방법 결정</StyledListItem>
      </StyledList>
      <Divider sx={{ marginY: '50px' }} />

      <SectionTitle>7. 불만처리 처리기한</SectionTitle>
      <StyledList>
        <StyledListItem>7.1 고객불만 접수 즉시 품질보증책임자에게 통보한다.</StyledListItem>
        <StyledListItem>7.2 품질보증책임자는 관련 부서와 협의하여 원인 조사 및 시정조치 계획을 수립하여 품질경영최고책임자에게 보고한다.</StyledListItem>
        <StyledListItem>7.3 품질경영최고책임자는 보고된 원인 조사 및 시정 조치 계획을 검토하고 승인한다.</StyledListItem>
        <StyledListItem>7.4 업무담당자는 7일 이내에 고객에게 처리 방안을 통보하고 처리한다.</StyledListItem>
      </StyledList>

      <Divider sx={{ marginY: '50px' }} />

      <SectionTitle>8. 불만처리 결과의 회신</SectionTitle>
      <StyledList>
        <StyledListItem>8.1 업무담당자는 상기 6항에 따른 원인 조사 결과 및 불만 처리대책을 품질보증부서로부터 전달받아 해당 고객에게 회신한다.</StyledListItem>
      </StyledList>

      <Divider sx={{ marginY: '50px' }} />

      <SectionTitle>9. 불만처리의 후속조치</SectionTitle>
      <StyledList>
        <StyledListItem>9.1 업무담당자는 불만처리에 관련된 모든 정보를 ERP 시스템에 기록하고 관리한다.</StyledListItem>
        <StyledListItem>9.2 품질보증책임자는 고객 불만에 대한 재발 방지 대책이 계획대로 실행되었는지 확인한다.</StyledListItem>
      </StyledList>

    </Box>
  );
}

export default BF_RMD_GM_08_Content;