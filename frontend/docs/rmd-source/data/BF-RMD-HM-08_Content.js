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

function BF_RMD_HM_08_Content() {
  return (
    <Box sx={{ padding: '20px', backgroundColor: '#fff', borderRadius: '8px' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <Box>{/* 작업장 청소 및 소독관리 규정*/}
          <Typography>문서번호: BF-RM-HM-08</Typography>
          
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
        본 규정은 (주)바이오에프디엔씨(이하 '당사'라 한다.) 제조소에서 작업소 및 보관소, 품질관리 구역의 환경을 위생 관리하는데 필요한 업무 지침을 정함으로서 제품 오염을 방지하여 우수한 품질의 제품을 생산하는데 그 목적이 있다.
      </Paragraph>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>2. 적용범위</SectionTitle>
      <Paragraph>
        본 규정은 당사의 제품 제조 관련 모든 업무담당자에 적용한다.
      </Paragraph>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>3. 책임과 권한</SectionTitle>
      <SubsectionTitle>3.1 품질경영최고책임자</SubsectionTitle>
      <StyledList>
        <StyledListItem>3.1.1 본 규정에 대한 최종 승인 권한을 가진다.</StyledListItem>
      </StyledList>

      <SubsectionTitle>3.2 품질보증책임자</SubsectionTitle>
      <StyledList>
        <StyledListItem>3.2.1 본 규정의 제정 및 개정에 대한 승인 권한을 가진다.</StyledListItem>
        <StyledListItem>3.2.2 위생관리 상태를 총괄 관리, 감독한다.</StyledListItem>
      </StyledList>

      <SubsectionTitle>3.3 제조생산책임자</SubsectionTitle>
      <StyledList>
        <StyledListItem>3.3.1 작업소 및 보관소의 위생관리 계획을 수립하고 실시한다.</StyledListItem>
        <StyledListItem>3.3.2 위생관리 상태를 관리, 감독한다.</StyledListItem>
        <StyledListItem>3.3.3 작업장 및 작업원 위생관리를 총괄한다.</StyledListItem>
      </StyledList>

      <SubsectionTitle>3.4 업무담당자</SubsectionTitle>
      <StyledList>
        <StyledListItem>3.4.1 본 규정에 따라 청소 및 소독 업무를 수행한다.</StyledListItem>
        <StyledListItem>3.4.2 위생 상태 부적합 사항 발생 시 즉시 보고한다.</StyledListItem>
      </StyledList>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>4. 작업소의 관리체제 기준</SectionTitle>
      <StyledList>
        <StyledListItem>4.1 각 작업소는 청결하고 위생적인 상태로 유지한다.</StyledListItem>
        <StyledListItem>4.2 각 작업소는 환기가 잘되고 청소, 소독을 철저히 하여 청결하게 유지한다.</StyledListItem>
        <StyledListItem>4.3 각 작업소에는 해당 작업에 필요한 물품 이외의 것들은 제거하여 작업 중 상호간의 혼동 및 교차오염이 일어나지 않아야 한다.</StyledListItem>
        <StyledListItem>4.4 가루가 날리는 작업소는 비산에 의한 오염을 방지하는 제진 시설을 갖추고 유지, 관리한다.</StyledListItem>
        <StyledListItem>4.5 쥐, 해충 및 먼지 등을 막을 수 있는 시설을 갖춘다.</StyledListItem>
      </StyledList>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>5. 작업소 구분</SectionTitle>
      <Paragraph>
        작업소 및 그 부속 시설은 제조의 대상과 형태 등에 따라 아래와 같이 구분한다.
      </Paragraph>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>작업실</TableCell>
              <TableCell>해당 부서</TableCell>
              <TableCell>작업 내용</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>칭량실</TableCell>
              <TableCell>제조생산부</TableCell>
              <TableCell>원료 칭량</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>제조실</TableCell>
              <TableCell>제조생산부</TableCell>
              <TableCell>제품 제조</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>세척실</TableCell>
              <TableCell>제조생산부</TableCell>
              <TableCell>제조시 사용한 용기 및 도구 등을 세척</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>충진실</TableCell>
              <TableCell>제조생산부</TableCell>
              <TableCell>제조된 제품의 충진</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>포장실</TableCell>
              <TableCell>제조생산부</TableCell>
              <TableCell>충진제품의 포장</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>반제품 보관소</TableCell>
              <TableCell>제조생산부</TableCell>
              <TableCell>제조된 반제품의 보관 및 불출</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>완제품 보관소</TableCell>
              <TableCell>제조생산부</TableCell>
              <TableCell>제품 보관 및 출하</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>원료 보관소</TableCell>
              <TableCell>제조생산부</TableCell>
              <TableCell>입고된 원료의 보관 및 불출</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>자재 보관소</TableCell>
              <TableCell>제조생산부</TableCell>
              <TableCell>입고된 자재의 보관 및 불출</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>미생물 실험실</TableCell>
              <TableCell>품질보증부</TableCell>
              <TableCell>미생물 시험</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>기타</TableCell>
              <TableCell>관련부서</TableCell>
              <TableCell>작업소내의 복도, 갱의실 등의 장소</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>6. 청소 도구 및 세척제, 소독제의 구분</SectionTitle>
      <SubsectionTitle>6.1 청소 도구</SubsectionTitle>
      <StyledList>
        <StyledListItem>6.1.1 빗자루: 작업소 및 보관소의 바닥 등의 이물질이나 먼지 등을 제거하는데 사용한다.</StyledListItem>
        <StyledListItem>6.1.2 걸레: 작업소 및 보관소의 바닥, 작업대, 기타 부속물의 먼지 등을 제거하는데 사용한다.</StyledListItem>
        <StyledListItem>6.1.3 위생수건: 청소 후 작업대, 기계 등에 남아 있는 이물질을 제거하는데 사용한다.</StyledListItem>
        <StyledListItem>6.1.4 수세미: 기계, 기구류에 붙어 있는 것들을 제거하는데 사용한다.</StyledListItem>
      </StyledList>

      <SubsectionTitle>6.2 청소용수</SubsectionTitle>
      <Paragraph>상수를 사용한다.</Paragraph>

      <SubsectionTitle>6.3 세제 및 소독제</SubsectionTitle>
      <StyledList>
        <StyledListItem>6.3.1 중성 세제</StyledListItem>
        <StyledListItem>6.3.2 소독액</StyledListItem>
        <StyledList>
          <StyledListItem>6.3.2.1 70% 에탄올: 기계, 작업장 소독에 사용한다.</StyledListItem>
        </StyledList>
      </StyledList>

      <SubsectionTitle>6.4 청소 도구의 관리</SubsectionTitle>
      <StyledList>
        <StyledListItem>6.4.1 청소 도구함: 청소 도구함을 별도로 설치하여 청소도구를 넣어 관리한다.</StyledListItem>
        <StyledListItem>6.4.2 청소 도구의 세척 및 소독: 불결한 청소도구는 오히려 작업소를 오염시킬 수 있으므로 세척 후 건조하여 청결하게 보관한다.</StyledListItem>
      </StyledList>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>7. 작업소별 청소 및 소독방법, 점검방법 및 주기</SectionTitle>
      <StyledList>
        <StyledListItem>7.1 작업소별 청소 방법, 점검 방법 및 주기는 첨부 2와 같이 실시한다.</StyledListItem>
        <StyledListItem>7.2 휴무 시 작업 전 먼지제거 및 청소를 실시하고 점검 후 이상이 없을 경우 작업에 들어간다. 만일 이상이 발견되면 재 청소 및 재 소독을 실시한 후 작업에 들어간다.</StyledListItem>
      </StyledList>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>8. 청소, 소독 시 유의 사항</SectionTitle>
      <StyledList>
        <StyledListItem>8.1 청소, 소독 시에는 눈에 보이지 않는 곳, 하기 힘든 곳 등에 특히 유의하여 세밀하게 한다.</StyledListItem>
        <StyledListItem>8.2 물청소 후에는 물기를 완전히 제거한다.</StyledListItem>
        <StyledListItem>8.3 청소 도구는 사용 후 세척하여 건조 또는 필요시 소독하여 오염원이 되지 않도록 한다.</StyledListItem>
        <StyledListItem>8.4 소독 시에는 기계, 기구류, 내용물 등에 절대 오염이 되지 않도록 한다.</StyledListItem>
        <StyledListItem>8.5 청소 후에는 그 상태를 필히 재확인하여 이상이 없도록 한다.</StyledListItem>
      </StyledList>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>9. 이상 발생 시 관리</SectionTitle>
      <StyledList>
        <StyledListItem>9.1 작업소 및 보관소의 위생상태가 제품이나 보관품목의 품질에 영향을 줄 수 있다고 판단될 때는 작업을 금한다.</StyledListItem>
        <StyledListItem>9.2 작업소 및 보관소별 관리담당자는 점검 결과 이상 발생시 생산관리책임자에게 보고하여 즉시 조치를 받는다.</StyledListItem>
        <StyledListItem>9.3 생산관리책임자는 이상 발생 사항의 중대성 등을 고려하여 즉시 조치를 취한다.</StyledListItem>
      </StyledList>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>10. 첨부</SectionTitle>
      <StyledList>
        <StyledListItem>첨부1) 청소 및 소독에 사용되는 소독제/세제</StyledListItem>
      </StyledList>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>소독제/세제</TableCell>
              <TableCell>용도</TableCell>
              <TableCell>조제 방법</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>70% 에탄올</TableCell>
              <TableCell>작업장/작업대/기계 소독</TableCell>
              <TableCell>에탄올 736ml + 정제수 264ml을 칭량하여 희석 용기에 넣고 혼합한다.</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>중성세제</TableCell>
              <TableCell>작업장 바닥/작업대</TableCell>
              <TableCell>중성세제 5ml에 물을 가하여 1L로 한다.</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      <StyledList>
        <StyledListItem>첨부2) 작업소 별 표준 청소 방법, 점검 방법</StyledListItem>
      </StyledList>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>대상 구역</TableCell>
              <TableCell>청소 방법</TableCell>
              <TableCell>청소 주기</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>입고 장소</TableCell>
              <TableCell>바닥 청소, 걸레로 닦기</TableCell>
              <TableCell>주 1회 이상</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>원료 보관소</TableCell>
              <TableCell>바닥 청소, 걸레로 닦기</TableCell>
              <TableCell>주 1회 이상</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>자재 보관소</TableCell>
              <TableCell>바닥 청소, 걸레로 닦기</TableCell>
              <TableCell>주 1회 이상</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>반제품 보관소</TableCell>
              <TableCell>바닥 청소, 걸레로 닦기</TableCell>
              <TableCell>주 1회 이상</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>완제품 보관소</TableCell>
              <TableCell>바닥 청소, 걸레로 닦기</TableCell>
              <TableCell>주 1회 이상</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>칭량실</TableCell>
              <TableCell>바닥 청소, 걸레로 닦기, 70% 에탄올로 소독, 중성세제로 찌든때 제거</TableCell>
              <TableCell>매일 1회 이상</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>제조실</TableCell>
              <TableCell>바닥 청소, 걸레로 닦기, 70% 에탄올로 소독, 중성세제로 찌든때 제거</TableCell>
              <TableCell>매일 1회 이상</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>충진실</TableCell>
              <TableCell>바닥 청소, 걸레로 닦기, 70% 에탄올로 소독, 중성세제로 찌든때 제거</TableCell>
              <TableCell>매일 1회 이상</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>미생물 실험실</TableCell>
              <TableCell>바닥 청소, 걸레로 닦기, 70% 에탄올로 소독, 중성세제로 찌든때 제거</TableCell>
              <TableCell>매일 1회 이상</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>세척실</TableCell>
              <TableCell>바닥 청소, 걸레로 닦기, 70% 에탄올로 소독, 중성세제로 찌든때 제거</TableCell>
              <TableCell>매일 1회 이상</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>포장실</TableCell>
              <TableCell>바닥 청소, 걸레로 닦기, 중성세제로 찌든때 제거</TableCell>
              <TableCell>매일 1회 이상</TableCell>
            </TableRow>
            <TableRow>
              <TableCell colSpan={3} align="center">
                * 모든 장소는 육안으로 점검하며, 각 작업 및 보관 담당자가 청소를 수행하고 확인합니다.<br />
                * 일일 청소는 매일 1회 이상 실시하며, 필요에 따라 수시로 실시합니다.<br />
                * 주간 청소는 주 1회 이상 실시하며, 필요에 따라 추가로 실시합니다.<br />
                * 모든 청소 주기에 관계없이, 오염이 발견되거나 필요하다고 판단될 경우 즉시 청소를 실시합니다.
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

    </Box>
  );
}

export default BF_RMD_HM_08_Content;