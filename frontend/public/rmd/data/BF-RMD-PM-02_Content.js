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

function BF_RMD_PM_02_Content() {
  return (
    <Box sx={{ padding: '20px', backgroundColor: '#fff', borderRadius: '8px' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <Box>{/* 건물,시설 및 설비관리규정*/}
          <Typography>문서번호: BF-RMD-PM-02</Typography>
          
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
        본 규정은 (주)바이오에프디엔씨(이하 "당사"라 함)의 제품 생산용 건물, 시설 및 설비의 유지관리 기준을 명확히 하고 이를 실행함으로서 우수제조 및 품질관리 기준에 부합함을 목적으로 한다.
      </Paragraph>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>2. 적용 범위</SectionTitle>
      <Paragraph>
        본 규정은 당사의 제품 생산 및 품질관리에 필요한 건물, 시설 및 설비에 대하여 적용한다.
      </Paragraph>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>3. 용어의 정의</SectionTitle>
      <SubsectionTitle>3.1 생산설비</SubsectionTitle>
      <Paragraph>
        제품을 생산하는데 필요한 직접 또는 간접적으로 사용하는 설비로서 소모성부품이나 도구류는 포함하지 않는다.
      </Paragraph>
      <SubsectionTitle>3.2 제조관리시설목록</SubsectionTitle>
      <Paragraph>
        설비의 종류, 사양 등을 기재하여 효율적인 운영관리를 위한 대장
      </Paragraph>
      <SubsectionTitle>3.3 설비 점검기록서</SubsectionTitle>
      <Paragraph>
        설비예방 및 보전을 위하여 설비의 정기적인 상태를 점검하는 문서
      </Paragraph>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>4. 책임과 권한</SectionTitle>
      <SubsectionTitle>4.1 품질경영최고책임자</SubsectionTitle>
      <StyledList>
        <StyledListItem>4.1.1 설비 구입 및 폐기 안의 승인</StyledListItem>
      </StyledList>
      <SubsectionTitle>4.2 품질보증책임자</SubsectionTitle>
      <StyledList>
        <StyledListItem>4.2.1 품질관리에 필요한 설비의 유지관리 승인</StyledListItem>
      </StyledList>
      <SubsectionTitle>4.3 제조생산책임자</SubsectionTitle>
      <StyledList>
        <StyledListItem>4.3.1 제조 및 포장 설비의 예방정비 계획 수립 및 실행</StyledListItem>
        <StyledListItem>4.3.2 제조 및 포장 설비의 사용 이상 시 수리 요청</StyledListItem>
        <StyledListItem>4.3.3 제조 및 포장 관련 설비의 유지관리 및 설비 점검기록서 작성 및 보관 관리</StyledListItem>
      </StyledList>
      <SubsectionTitle>4.4 생산관리담당자</SubsectionTitle>
      <StyledList>
        <StyledListItem>4.4.1 건물 및 지원 설비 유지관리 및 이상 시 보수활동</StyledListItem>
        <StyledListItem>4.4.2 제조 및 포장 설비 이상 시 보수 활동</StyledListItem>
        <StyledListItem>4.4.3 화재경보 및 감지기 점검 결과 확인</StyledListItem>
      </StyledList>
      <SubsectionTitle>4.5 업무담당자</SubsectionTitle>
      <StyledList>
        <StyledListItem>4.5.1 설비 점검 및 기록 수행</StyledListItem>
      </StyledList>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>5. 업무절차</SectionTitle>
      <SubsectionTitle>5.1 설비 등록</SubsectionTitle>
      <StyledList>
        <StyledListItem>5.1.1 제조생산책임자는 구입한 설비가 외주업체로부터 입고 시 외주업체와 시운전 후 그 결과를 검토하여 적합한 경우 ERP 시스템에 설비를 등록한다.</StyledListItem>
        <StyledListItem>5.1.2 ERP 시스템은 등록 설비에 대하여 다섯 자리의 일련번호로 구성된 관리번호를 자동으로 부여한다.</StyledListItem>
        <StyledListItem sx={{ paddingLeft: '40px' }}>예) 00001 </StyledListItem>
        <StyledListItem sx={{ paddingLeft: '40px' }}>(00001: 일련번호 다섯 자리)</StyledListItem>
        <StyledListItem>5.1.3 업무담당자는 ERP 시스템에 설비 이력 정보를 입력하고, 제조생산책임자의 승인을 득한다.</StyledListItem>
      </StyledList>

      <SubsectionTitle>5.2 설비 유지관리</SubsectionTitle>
      <StyledList>
        <StyledListItem>5.2.1 업무담당자는 ERP 시스템에서 생성된 "설비 점검기록서"에 따라 배치된 설비에 대해서 점검하고, 결과를 ERP 시스템에 기록한다.</StyledListItem>
        <StyledListItem>5.2.2 설비 일상 점검 결과 이상이 있을 경우 제조생산책임자는 ERP 시스템의 "설비 점검기록"을 검토하여 적절한 조치를 취하도록 지시한다. 만일 자체적으로 수리가 불가능할 경우 전문 외주업체에 요청하여 설비보수를 한다.</StyledListItem>
        <StyledListItem>5.2.3 작업 중 설비 이상 발생 시 업무담당자는 제조생산책임자에게 보고하고, 제조생산책임자는 품질보증책임자와 협의하여 생산 중 또는 생산중단 후 보수여부를 결정한 후 수리한다.</StyledListItem>
        <StyledListItem>5.2.4 업무담당자는 설비보수 내역을 ERP 시스템의 "설비 이력" 정보에 기록한다.</StyledListItem>
        <StyledListItem>5.2.5 결함 발생 및 정비 중인 설비는 ERP 시스템에서 "고장" 상태로 표시하고, 실제 설비에도 "고장" 식별표를 부착한다. 고장의 상태가 심각한 경우에는 작업장에서 분리하여 조치한다.</StyledListItem>
        <StyledListItem>5.2.6 시설 및 설비 유지관리 작업은 제품의 품질에 영향을 주지 않도록 제조작업 중 유지관리 업무를 금지하거나, 유지관리 설비에 비닐 등 차단 후 시행한다.</StyledListItem>
        <StyledListItem>5.2.7 설비 수리 후 세척한 설비는 다음 사용 시까지 오염되지 아니하도록 뚜껑을 덮어서 관리한다.</StyledListItem>
      </StyledList>

      <SubsectionTitle>5.3 비상구 표지판, 화재경보 및 감지기 점검</SubsectionTitle>
      <StyledList>
        <StyledListItem>5.3.1 비상구 표지판, 화재경보 시스템 및 감지기에 대한 점검은 건물 시설 관리 사무소에서 주기적으로 일괄 실시한다.</StyledListItem>
        <StyledListItem>5.3.2 이상이 있을 시 생산관리담당자는 건물 시설 관리 사무소로부터 내역을 확인하고 즉시 제조생산책임자에게 보고한다.</StyledListItem>
        <StyledListItem>5.3.3 필요한 경우 적절한 조치를 취하여 안전을 확보한다.</StyledListItem>
      </StyledList>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>6. 생산 설비의 재질</SectionTitle>
      <StyledList>
        <StyledListItem>6.1 생산 설비에는 제품과 직접 접촉하는 부분에 제품을 변질시키거나 인체에 유해하지 않은 재료를 적용한다.</StyledListItem>
        <StyledListItem>6.2 각 제조시설과 기구에 대해 상기 6.1항에 부합한지 확인하고 이상이 없으면 승인하여 제조관리시설목록에 등록한다.</StyledListItem>
      </StyledList>

    </Box>
  );
}

export default BF_RMD_PM_02_Content;
