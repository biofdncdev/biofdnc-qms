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

function BF_RMD_GM_03_Content() {
  return (
    <Box sx={{ padding: '20px', backgroundColor: '#fff', borderRadius: '8px' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <Box>
          {/* 기록 관리 규정 */}
          <Typography>문서번호: BF-RM-GM-03</Typography>
          
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
        본 규정은 (주)바이오에프디엔씨(이하 '당사'라 한다)의 제품에 규정된 요구사항의 적합성과 품질경영시스템의 효과적인 운영을 입증할 수 있도록 기록의 유지 및 관리를 하는데 그 목적이 있다.
      </Paragraph>

      <Divider sx={{ marginY: '50px' }} />

      <SectionTitle>2. 적용범위</SectionTitle>
      <Paragraph>
        이 규정은 당사의 모든 기록의 식별, 수집, 색인, 열람, 파일링, 보관, 유지 및 폐기에 대한 업무에 적용한다.
      </Paragraph>

      <Divider sx={{ marginY: '50px' }} />

      <SectionTitle>3. 책임과 권한</SectionTitle>
      <SubsectionTitle>3.1 품질경영최고책임자</SubsectionTitle>
      <StyledList>
        <StyledListItem>3.1.1 기록관리에 대한 총괄 책임</StyledListItem>
      </StyledList>

      <SubsectionTitle>3.2 품질보증책임자</SubsectionTitle>
      <StyledList>
        <StyledListItem>3.2.1 기록관리 규정의 수립 및 개정</StyledListItem>
        <StyledListItem>3.2.2 기록관리 실태 점검 및 개선</StyledListItem>
        <StyledListItem>3.2.3 품질 관련 기록의 관리 감독</StyledListItem>
      </StyledList>

      <SubsectionTitle>3.3 제조생산책임자</SubsectionTitle>
      <StyledList>
        <StyledListItem>3.3.1 제조 및 생산 관련 기록의 관리 감독</StyledListItem>
      </StyledList>

      <SubsectionTitle>3.4 업무담당자</SubsectionTitle>
      <StyledList>
        <StyledListItem>3.4.1 해당 업무 관련 기록의 작성, 유지 및 관리</StyledListItem>
      </StyledList>

      <Divider sx={{ marginY: '50px' }} />

      <SectionTitle>4. 세부절차</SectionTitle>

      <SubsectionTitle>4.1 기록의 파악</SubsectionTitle>
      <StyledList>
        <StyledListItem>4.1.1 당사에서 파악 및 수집되어야 할 기록은 품질 관련 기록, 협력업체 관련 기록, 검사 및 시험기록, 계측기 관련 기록, 부적합 보고서, 일탈관리 기록, 내부 감사 기록, 교육 훈련 기록, 제품회수 기록, 변경관리 기록, 안정성 시험 기록, 위생관리 기록, 제조 및 포장 기록 등으로 분류되고 기타 상세 사항은 각 절차서 및 지침서에 따른다.</StyledListItem>
      </StyledList>

      <SubsectionTitle>4.2 기록의 식별 및 수집</SubsectionTitle>
      <StyledList>
        <StyledListItem>4.2.1 해당부서에서 파악된 기록은 식별이 되고 빠짐없이 수집되어야 하며, 변조되지 않았다는 것이 명확하여야 한다.</StyledListItem>
        <StyledListItem>4.2.2 수집된 기록은 작성자의 서명이 있어야 하고 기재된 내용이 개정될 경우 다음과 같이 정정한다.</StyledListItem>
        <StyledListItem sx={{ paddingLeft: '40px' }}>4.2.2.1 정정해야 할 기록을 확인할 수 있도록 두줄을 긋는다</StyledListItem>
        <StyledListItem sx={{ paddingLeft: '40px' }}>4.2.2.2 정정할 내용을 기록한 후 정정자의 서명을 기록한다.</StyledListItem>
      </StyledList>

      <SubsectionTitle>4.3 색인 및 파일링</SubsectionTitle>
      <SubsectionTitle sx={{ paddingLeft: '20px' }}>4.3.1 색인</SubsectionTitle>
      <StyledList>
        <StyledListItem>4.3.1.1 수집되어 보관되는 기록은 검색이 용이하고 분실 및 훼손의 상태를 식별하기 위해 적절히 색인되어야 한다.</StyledListItem>
        <StyledListItem>4.3.1.2 디지털 기록의 경우, 문서 관리 시스템 내에서 기록명, 소속팀(부서명), 작성년도 등의 메타데이터를 포함하여 관리한다.</StyledListItem>
      </StyledList>

      <SubsectionTitle sx={{ paddingLeft: '20px' }}>4.3.2 파일링</SubsectionTitle>
      <StyledList>
        <StyledListItem>4.3.2.1 문서 기록의 경우, 파일의 구성은 겉표지, 목록표 및 기록으로 구성되어야 한다.</StyledListItem>
        <StyledListItem>4.3.2.2 디지털 기록의 경우, 사용 중인 시스템(ERP, 클라우드 스토리지, 그룹웨어 등)의 특성에 맞게 체계적으로 관리한다.</StyledListItem>
        <StyledListItem>4.3.2.3 각 시스템에서 제공하는 기능을 활용하여 효율적인 저장, 검색 및 접근이 가능하도록 한다.</StyledListItem>
        <StyledListItem>4.3.2.4 파일명이나 분류 체계는 해당 부서의 업무 특성과 시스템의 기능을 고려하여 결정한다.</StyledListItem>
      </StyledList>

      <Divider sx={{ marginY: '50px' }} />

      <SectionTitle>5. 기록의 보관 및 보존</SectionTitle>
      <StyledList>
        <StyledListItem>5.1 문서 기록은 사무실 내 지정된 파일 보관함에 손상, 손실 및 노후로부터 보호될 수 있도록 보관한다.</StyledListItem>
        <StyledListItem>5.2 디지털 기록은 사용 중인 시스템(ERP, 클라우드 스토리지, 그룹웨어 등)에 안전하게 저장한다. 시스템이 백업 기능을 지원하거나 스토리지 형태인 경우, 연 1회 정기적인 백업을 실시한다.</StyledListItem>
        <StyledListItem>5.3 기록은 내용별로 분류 보관한다. 디지털 기록의 경우, 각 시스템에서 제공하는 분류 기능(폴더 구조, 태그, 메타데이터 등)을 활용하여 체계적으로 분류한다.</StyledListItem>
        <StyledListItem>5.4 기록은 생성 시점부터 보존 연한을 설정하여 관리한다.</StyledListItem>
        <StyledListItem sx={{ paddingLeft: '40px' }}>5.4.1 문서 기록의 경우, 보존 연한에 따라 적절히 라벨링하여 관리한다.</StyledListItem>
        <StyledListItem sx={{ paddingLeft: '40px' }}>5.4.2 디지털 기록의 경우, 각 시스템에서 제공하는 기능을 활용하여 생성 시점에 보존 연한을 설정하고, 시스템이 자동으로 보존 기간을 추적하고 관리할 수 있도록 한다. </StyledListItem>
        <StyledListItem sx={{ paddingLeft: '40px' }}>5.4.3 보존 연한이 만료된 기록은 규정된 절차에 따라 검토 후 폐기하거나 보존 연장을 결정한다.</StyledListItem>
        <StyledListItem>5.5 보존되어야 할 기록이 자주 열람되거나 사용될 경우에는 각 부서에서 보관관리 할 수 있다. 디지털 기록의 경우, 각 시스템의 접근 권한 설정 기능을 활용하여 필요한 부서에서 열람 및 관리할 수 있도록 한다.</StyledListItem>
        <StyledListItem>5.6 디지털 기록의 경우, 데이터의 무결성을 보장하기 위해 각 시스템에서 제공하는 보안 기능(접근 권한 관리, 변경 이력 추적, 암호화 등)을 활용한다.</StyledListItem>
        <StyledListItem>5.7 중요한 디지털 기록의 경우, 필요에 따라 출력하거나 별도의 저장 매체에 백업하여 보관할 수 있다.</StyledListItem>
      </StyledList>

      <Divider sx={{ marginY: '50px' }} />

      <SectionTitle>6. 기록 보존 연한</SectionTitle>
      <StyledList>
        <StyledListItem>6.1 기록의 관리에 대한 기록보관은 각각의 절차서 또는 지침서에서 정한 기록보존 연한에 따른다.</StyledListItem>
        <StyledListItem>6.2 기타의 기록 보존 연한이 규정되지 않은 기록은 최소 4년간 보존한다.</StyledListItem>
        <StyledListItem>6.3 디지털 기록의 경우, 각 시스템의 기능을 활용하여 보존 연한을 설정하고 관리한다.</StyledListItem>
      </StyledList>

      <Divider sx={{ marginY: '50px' }} />

      <SectionTitle>7. 전자문서 시스템 관리</SectionTitle>
      <StyledList>
        <StyledListItem>7.1 전자문서 시스템 사용 시 접근 권한을 관리하고 데이터의 무결성을 보장한다.</StyledListItem>
        <StyledListItem>7.2 전자문서 시스템의 백업 및 복구 절차를 수립하고 정기적으로 실행한다.</StyledListItem>
        <StyledListItem>7.3 전자문서의 보안을 위해 암호화 등의 적절한 조치를 취한다.</StyledListItem>
      </StyledList>

      <Divider sx={{ marginY: '50px' }} />

      <SectionTitle>8. 기록의 폐기</SectionTitle>
      <StyledList>
        <StyledListItem>8.1 보존 기간이 만료된 기록은 품질보증책임자의 승인 하에 폐기한다.</StyledListItem>
        <StyledListItem>8.2 기록 폐기 시 기밀성을 유지할 수 있는 방법으로 처리한다.</StyledListItem>
        <StyledListItem>8.3 기록 폐기에 대한 이력을 남기고 관리한다.</StyledListItem>
      </StyledList>
    </Box>
  );
}

export default BF_RMD_GM_03_Content;