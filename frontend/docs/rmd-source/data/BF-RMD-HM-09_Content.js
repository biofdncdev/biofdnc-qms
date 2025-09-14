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

function BF_RMD_HM_09_Content() {
  return (
    <Box sx={{ padding: '20px', backgroundColor: '#fff', borderRadius: '8px' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <Box>{/* 설비 기구 세척 및 소독관리 규정*/}
          <Typography>문서번호: BF-RM-HM-09</Typography>
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
        본 규정은 (주)바이오에프디엔씨(이하 '당사'라 한다.) 제조소 내 제품 제조 및 품질관리에 관련된 설비(기계, 기구 등) 위생관리 기준을 명확히 하여 최적의 위생상태를 유지 관리 하는데 그 목적이 있다. 
      </Paragraph>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>2. 적용범위</SectionTitle>
      <Paragraph>
        본 규정은 당사 제조소 내에서 사용되는 칭량, 제조, 충진, 포장 등과 품질관리에 관련된 설비(기계, 기구)에 적용한다.
      </Paragraph>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>3. 책임과 권한</SectionTitle>
      <SubsectionTitle>3.1 품질경영최고책임자</SubsectionTitle>
      <StyledList>
        <StyledListItem>3.1.1 본 규정에 대한 최종 승인을 담당한다.</StyledListItem>
      </StyledList>
      <SubsectionTitle>3.2 품질보증책임자</SubsectionTitle>
      <StyledList>
        <StyledListItem>3.2.1 본 규정의 제정 및 개정을 승인한다.</StyledListItem>
        <StyledListItem>3.2.2 설비 위생관리 상태를 총괄 관리한다.</StyledListItem>
      </StyledList>
      <SubsectionTitle>3.3 제조생산책임자</SubsectionTitle>
      <StyledList>
        <StyledListItem>3.3.1 생산 설비(기계, 기구)의 세척 및 소독 실시를 총괄 관리한다.</StyledListItem>
      </StyledList>
      <SubsectionTitle>3.4 제조담당자</SubsectionTitle>
      <StyledList>
        <StyledListItem>3.4.1 해당 생산 설비(기계, 기구)의 세척 및 소독을 실시하며, 위생관리 상태를 점검한다.</StyledListItem>
      </StyledList>
      <SubsectionTitle>3.5 품질관리담당자</SubsectionTitle>
      <StyledList>
        <StyledListItem>3.5.1 생산 설비의 세척상태를 평가한다.</StyledListItem>
      </StyledList>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>4. 기계, 기구의 선정</SectionTitle>
      <StyledList>
        <StyledListItem>4.1 기계, 기구를 선택할 때는 제품의 변질 및 품질저하를 일으키지 않고 인체에 유해하지 않는 재질, 형태로 선정한다.</StyledListItem>
        <StyledListItem>4.2 내용물이 접하는 부분의 재질은 스테인레스 스틸(316L 또는 304 등급), 유리, PTFE, 또는 승인된 등급의 실리콘을 원칙으로 한다.</StyledListItem>
        <StyledListItem>4.3 설비(기계, 기구)는 세척 및 소독이 용이하고 위생상 관리가 용이해야 한다.</StyledListItem>
      </StyledList>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>5. 세척 및 소독 구분, 시기 및 관리 담당자</SectionTitle>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>구 분</TableCell>
              <TableCell>시 기</TableCell>
              <TableCell>세척대상</TableCell>
              <TableCell>작업담당자</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>수시</TableCell>
              <TableCell>매 작업 종료 후</TableCell>
              <TableCell>칭량실내 기계, 기구</TableCell>
              <TableCell>제조담당자</TableCell>
            </TableRow>
            <TableRow>
              <TableCell></TableCell>
              <TableCell></TableCell>
              <TableCell>제조실내 기계, 기구</TableCell>
              <TableCell>제조담당자</TableCell>
            </TableRow>
            <TableRow>
              <TableCell></TableCell>
              <TableCell></TableCell>
              <TableCell>충진실내 기계, 기구</TableCell>
              <TableCell>제조담당자</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>6. 세척 도구 및 세척제, 소독제의 종류와 용도</SectionTitle>
      <StyledList>
        <StyledListItem>6.1 세척도구: 솔/브러쉬, 걸레, 위생수건, 수세미</StyledListItem>
        <StyledListItem>6.2 세척용수: 상수 및 정제수</StyledListItem>
        <StyledListItem>6.3 세제 및 소독액: 중성 세제, 70% 에탄올</StyledListItem>
      </StyledList>
      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>7. 세척방법 및 유의사항</SectionTitle>
      <StyledList>
        <StyledListItem>7.1 고정설비와 이동가능설비는 상수, 정제수, 세제(중성세제), 70% 에탄올 등으로 세척한다.</StyledListItem>
        <StyledListItem>7.2 세척, 소독 시에는 눈에 보이지 않는 곳, 하기 힘든 곳 등에 특히 유의하면서 세밀하게 세척한다.</StyledListItem>
        <StyledListItem>7.3 세척 및 소독 후 해당 설비 기구를 완전 건조시킨 후 오염되지 않도록 덮개 또는 밀봉하여 보관한다.</StyledListItem>
        <StyledListItem>7.4 사용하지 않은 설비를 사용할 시는 필히 사용 전 재 세척 또는 소독을 실시한다.</StyledListItem>
      </StyledList>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>8. 세척의 평가 및 조치</SectionTitle>
      <StyledList>
        <StyledListItem>8.1 각 설비(기계, 기구) 작업 담당자는 세척 완료 후 세척 및 소독 상태를 점검한다.</StyledListItem>
        <StyledListItem>8.2 부적합 시 작업 담당자는 즉시 재 세척 및 재 소독을 실시한다.</StyledListItem>
      </StyledList>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>9. 세척의 평가 방법</SectionTitle>
      <SubsectionTitle>9.1 육안 평가</SubsectionTitle>
      <Paragraph>
        설비 세척 후 육안 및 면봉으로 세척부위를 문질러서 세척여부를 확인한다.
      </Paragraph>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>10. 소독액 제조 방법 및 확인 절차</SectionTitle>
      <SubsectionTitle>10.1 70% 에탄올 제조 (1 kg 제조, 95% 에탄올 사용)</SubsectionTitle>
      <Paragraph>
        에탄올 736ml + 정제수 264ml을 칭량하여 희석 용기에 넣고 스테인레스/유리 봉으로 혼합한다.
      </Paragraph>
      <SubsectionTitle>10.2 제조 시 주의 사항</SubsectionTitle>
      <StyledList>
        <StyledListItem>10.2.1 인화성 물질로 작업 시 화재에 주의하며, 소화기 비치 여부를 확인 한 후 작업한다.</StyledListItem>
        <StyledListItem>10.2.2 규정된 복장을 갖추고 작업한다.</StyledListItem>
      </StyledList>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>11. 첨부</SectionTitle>
      <SubsectionTitle>11.1 설비 세척 및 소독관리 표준</SubsectionTitle>

<TableContainer component={Paper}>
  <Table>
    <TableHead>
      <TableRow>
        <TableCell colSpan={2} align="center"><strong style={{ fontSize: '1.1em' }}>1. 공통 사항</strong></TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      <TableRow>
        <TableCell>1.1 세척도구 및 약품</TableCell>
        <TableCell>
          <ul>
            <li>도구: 헤라, 브러쉬/솔, 수세미, 위생수건</li>
            <li>세척제: 중성세제 희석액</li>
            <li>소독액: 70% 에탄올</li>
          </ul>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell>1.2 주기</TableCell>
        <TableCell>
          <ul>
            <li>제품 변경 시, 일일 작업 완료 후</li>
            <li>밀폐되지 않은 상태로 방치 시</li>
            <li>오염이 발생되었거나 시스템 문제 발생 시</li>
          </ul>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell>1.3 점검방법</TableCell>
        <TableCell>육안으로 확인 및 흰색 위생 수건으로 문질러서 점검 (각 작업실의 위생관리 담당자)</TableCell>
      </TableRow>
    </TableBody>
  </Table>
</TableContainer>
<TableContainer component={Paper}>
  <Table>
    <TableHead>
      <TableRow>
        <TableCell colSpan={3} align="center"><strong style={{ fontSize: '1.1em' }}>2. 기계·기구별 세척 및 소독방법</strong></TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      <TableRow>
        <TableCell rowSpan={2}>2.1 제조탱크</TableCell>
        <TableCell sx={{ width: '15%' }}>세척방법</TableCell>
        <TableCell sx={{ width: '65%' }}>
          <ol type="a">
            <li>제품 배출 후 헤라로 제품 잔여물을 제거한다.</li>
            <li>상수를 탱크에 넣고 80'C로 가온 후 30분 교반한다.</li>
            <li>헹굼수를 배출시킨 후 브러쉬/솔/수세미에 중성세제 희석액을 묻혀 잔여물을 제거한다.</li>
            <li>정제수를 75'C로 가온 후 탱크를 헹군다.</li>
            <li>미세척 이물질 발견 시 c)~d) 단계를 반복한다.</li>
            <li>세척이 완료된 탱크에 Air Gun을 사용하여 건조시킨다.</li>
          </ol>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell>소독방법</TableCell>
        <TableCell>
          <ol type="a">
            <li>세척이 완료된 제조탱크에 에탄올 70% 용액을 스프레이 한 후 뚜껑을 닫아 놓는다.</li>
            <li>원료 주입구 및 토출구를 밀봉하여 보관한다.</li>
          </ol>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell rowSpan={2}>2.2 저장 용기, 칭량 용기</TableCell>
        <TableCell>세척방법</TableCell>
        <TableCell>
          <ol type="a">
            <li>칭량, 충진 완료 후 세척실로 반입된 용기내의 잔량을 헤라 등으로 제거한다.</li>
            <li>상수를 분사하여 1차 세척한다.</li>
            <li>브러쉬/솔/수세미에 중성세제 희석액을 묻혀 잔여물을 제거한다.</li>
            <li>상수를 분사하여 세척제 제거 후, 정제수로 마무리 헹굼 한다.</li>
            <li>잔여물 확인 후 이상이 없으면 마른 수건을 사용하여 물기를 제거한다. 이상 발견 시 b)~d) 반복.</li>
          </ol>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell>소독방법</TableCell>
        <TableCell>
          <ol type="a">
            <li>세척이 완료된 용기에 에탄올 70% 용액을 스프레이 한다.</li>
            <li>제조실로 이동하여 비닐로 덮은 상태로 보관한다.</li>
          </ol>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell rowSpan={2}>2.3 포장기구류</TableCell>
        <TableCell>세척방법</TableCell>
        <TableCell>
          <ol type="a">
            <li>노즐 및 호스를 장비 매뉴얼에 따라 분해한다.</li>
            <li>상수로 제품 잔재를 제거한다.</li>
            <li>세척제를 브러쉬/수세미에 묻혀 안과 밖을 닦는다.</li>
            <li>상수로 세척제를 씻어낸 후 정제수로 헹군다.</li>
            <li>제품잔재 여부를 조사하고 필요하면 b)~d) 방법을 반복한다.</li>
            <li>Air Gun으로 건조 시킨다.</li>
          </ol>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell>소독방법</TableCell>
        <TableCell>
          <ol type="a">
            <li>노즐 및 호스에 소독액(70% 알코올)을 담그거나 분사한다.</li>
            <li>건조대로 이동하여 건조시킨다.</li>
          </ol>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell rowSpan={2}>2.4 정제수 설비</TableCell>
        <TableCell>세척방법</TableCell>
        <TableCell>
          <ol type="a">
            <li>정제수 탱크 후단 필터를 탈착한다.</li>
            <li>기존 정제수 80% 유지 및 열수를 공급하여 (80℃ 이상)를 만든다.</li>
            <li>순환펌프를 가동한다.(1시간정도)</li>
            <li>열수를 드레인 시킨다.</li>
            <li>세척기로 탱크 내면을 세척한다.</li>
            <li>정제수로 최종 헹구고 건조 시킨다.</li>
            <li>제품잔재 여부를 조사하고 필요하면 위의 방법을 반복한다.</li>
          </ol>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell>소독방법</TableCell>
        <TableCell>
          <ol type="a">
            <li>소독액(70% 알코올)을 제조탱크에 스프레이로 분사한 후 잘 건조시킨다.</li>
            <li>정제수로 최종 헹구고 건조시킨다.</li>
            <li>제품잔재 여부를 조사하고 필요하면 위의 방법을 반복한다.</li>
          </ol>
        </TableCell>
      </TableRow>
    </TableBody>
  </Table>
</TableContainer>
      <SubsectionTitle>11.2 설비세척 및 소독관리 점검표</SubsectionTitle>
    </Box>
  );
}

export default BF_RMD_HM_09_Content;