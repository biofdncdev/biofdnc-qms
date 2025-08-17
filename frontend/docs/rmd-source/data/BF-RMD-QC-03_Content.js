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

function BF_RMD_QC_03_Content() {
  return (
    <Box sx={{ padding: '20px', backgroundColor: '#fff', borderRadius: '8px' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <Box>{/* 계측기 검교정 관리 규정*/}
          <Typography>문서번호: BF-RMD-QC-03</Typography>
          
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
        이 규정은 (주)바이오에프디엔씨(이하 "당사"라 함)에서 보유 및 사용하고 있는 모든 계량·측정기에 대하여 검교정 관리체계를 규정함으로서 제품 품질 안정과 향상을 도모한다.
      </Paragraph>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>2. 적용 범위</SectionTitle>
      <Paragraph>
        이 규정은 당사 제품의 품질에 영향을 미치는 계량·측정기 관리 활동의 기본으로서의 계량·측정기의 구입, 관리, 교정, 수리, 폐기 및 자체관리에 관하여 적용한다.
      </Paragraph>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>3. 용어의 정의</SectionTitle>
      <Paragraph>
        계량·측정기 관리에 관한 용어는 다음과 같이 정의한다.
      </Paragraph>
      <SubsectionTitle>3.1 검·교정 (Verification & Calibration)</SubsectionTitle>
      <Paragraph>
        검정과 교정검사를 합하여 말한다.
      </Paragraph>
      <SubsectionTitle>3.2 검정 (Verification)</SubsectionTitle>
      <Paragraph>
        계량·측정기의 규정된 허용 공차 내에 들어오는지 아닌지를 판별하여 적합, 부적합 판정함을 말한다.
      </Paragraph>
      <SubsectionTitle>3.3 교정검사 (Calibration)</SubsectionTitle>
      <Paragraph>
        국가표준과의 소급성 유지를 위하여 하위급 기기의 정도 변화를 절차에 따라 비교 측정 및 검사하는 것을 말한다. 약칭하여 교정이라 한다. 
      </Paragraph>
      <SubsectionTitle>3.4 교정주기 (Calibration Interval)</SubsectionTitle>
      <Paragraph>
        계량·측정기의 정도를 유지하기 위한 교정 유효기간으로서 교정 완료일로부터 차기 교정일 까지의 기간을 말한다.
      </Paragraph>
      <SubsectionTitle>3.5 검증 (Certification)</SubsectionTitle>
      <Paragraph>
        측정에서 사용되는 기기를 교정 또는 측정하여 정도를 증명해주는 행위를 말한다. 
      </Paragraph>
      <SubsectionTitle>3.6 정확도 (Accuracy)</SubsectionTitle>
      <Paragraph>
        측정 평균값과 참값과의 차이를 말하며 이 차이가 작을수록 측정값은 정확하다.
      </Paragraph>
      <SubsectionTitle>3.7 정밀도 (Precision)</SubsectionTitle>
      <Paragraph>
        측정값의 분산도를 말하며 이 분산도가 작을수록 측정값은 정밀하다.
      </Paragraph>
      <SubsectionTitle>3.8 정도</SubsectionTitle>
      <Paragraph>
        정확도와 정밀도를 종합한 것을 말한다. 
      </Paragraph>
      <SubsectionTitle>3.9 자체점검</SubsectionTitle>
      <Paragraph>
        제품의 품질측정에 사용되지만 정밀정확도가 현저히 낮아 표준기에 의한 주기적 교정 검사가 불필요하여 사용부서에서 주기적인 점검을 필요로 하는 계량 측정기를 말한다.
      </Paragraph>
      <SubsectionTitle>3.10 공차</SubsectionTitle>
      <Paragraph>
        규정된 최대값과 최소값의 차이다.
      </Paragraph>
      <SubsectionTitle>3.11 유휴 측정기</SubsectionTitle>
      <Paragraph>
        사용 가능하나 보유 부서에서 용도가 없어 사용하지 않는 계량·측정기
      </Paragraph>
      <SubsectionTitle>3.12 폐기대상 측정기</SubsectionTitle>
      <Paragraph>
        수리가 불가능하여 수리 불가 판정을 받은 계량·측정기
      </Paragraph>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>4. 책임과 권한</SectionTitle>
      <SubsectionTitle>4.1 품질보증책임자</SubsectionTitle>
      <StyledList>
        <StyledListItem>4.1.1 검교정 계획 수립 및 승인</StyledListItem>
        <StyledListItem>4.1.2 계측기의 검교정 및 관리업무 총괄</StyledListItem>
        <StyledListItem>4.1.3 계측기 이상 발생 시 조사 및 조치 결정</StyledListItem>
      </StyledList>
      <SubsectionTitle>4.2 품질관리담당자</SubsectionTitle>
      <StyledList>
        <StyledListItem>4.2.1 검교정 계획 실행 및 관리</StyledListItem>
        <StyledListItem>4.2.2 계측기 ERP 등록 및 관리 정보 유지</StyledListItem>
        <StyledListItem>4.2.3 검교정 결과 검토 및 보고</StyledListItem>
        <StyledListItem>4.2.4 계측기의 일상점검 및 관리</StyledListItem>
        <StyledListItem>4.2.5 계측기 검교정 실시 (자체 검교정의 경우)</StyledListItem>
        <StyledListItem>4.2.6 계측기 이상 발생 시 품질보증책임자에게 보고</StyledListItem>
      </StyledList>
      <SubsectionTitle>4.3 계측기 사용자</SubsectionTitle>
      <StyledList>
        <StyledListItem>4.3.1 지급된 계측기의 올바른 사용 및 관리</StyledListItem>
        <StyledListItem>4.3.2 계측기 이상 발생 시 품질관리담당자에게 보고</StyledListItem>
      </StyledList>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>5. 업무절차</SectionTitle>
      <SubsectionTitle>5.1 계측기 등록</SubsectionTitle>
      <StyledList>
        <StyledListItem>5.1.1 품질관리담당자는 계측기를 ERP 시스템에 등록한다.</StyledListItem>
        <StyledListItem>5.1.2 계측기 사용법이 복잡하거나 측정결과에 대한 편차보정이 필요한 경우 계측기 공급업체로부터 사용 설명서 또는 매뉴얼을 입수하여 적용한다.</StyledListItem>
        <StyledListItem>5.1.3 단순한 게이지 및 검사 기구는 기능, 동작상태 및 성능만을 관리한다.</StyledListItem>
      </StyledList>
      <SubsectionTitle>5.2 검·교정</SubsectionTitle>
      <StyledList>
        <StyledListItem>5.2.1 다음의 방법으로 계측기에 대한 검·교정을 수행한다.</StyledListItem>
        <StyledList>
          <StyledListItem>5.2.1.1 국가적으로 공인된 검 교정 기관에 의뢰</StyledListItem>
          <StyledListItem>5.2.1.2 공인된 표준기와 자체적으로 비교 검정</StyledListItem>
          <StyledListItem>5.2.1.3 국가적으로 공인된 표준기가 없는 경우 장비의 메이커가 추천하는 검·교정 방법.</StyledListItem>
        </StyledList>
        <StyledListItem>5.2.2 검·교정 주기</StyledListItem>
        <StyledList>
          <StyledListItem>5.2.2.1 검·교정 주기는 국가 검·교정 주기표를 적용한다.</StyledListItem>
          <StyledListItem>5.2.2.2 위의 5.2.2.1항에 해당되지 않는 장비는 메이커의 지침에 따르거나 자체적으로 결정한 합당한 근거를 바탕으로 결정한다.</StyledListItem>
        </StyledList>
        <StyledListItem>5.2.3 검·교정 상태의 유지</StyledListItem>
        <StyledList>
          <StyledListItem>5.2.3.1 품질관리담당자는 검·교정이 완료된 계측기에 대하여 교정기관이 발행한 교정필증을 계측기에 부착하여 식별한다.</StyledListItem>
          <StyledListItem>5.2.3.2 검교정이 완료된 측정장비에 대하여는 측정결과를 무효화 시킬 수 있는 조정 및 방법으로부터 보호 될 수 있도록 한다.</StyledListItem>
          <StyledListItem>5.2.3.3 자체점검이 필요한 계측기를 위해 품질관리담당자는 외부 교정이 된 표준 계측기 또는 표준물질을 입수하여 비교 검정한다.</StyledListItem>
          <StyledListItem>5.2.3.4 품질관리담당자는 자체적으로 실시한 내부검정성적서를 작성하고, 해당 계측기에 "비교검정 필증"을 부착하여 관리한다.</StyledListItem>
          <StyledListItem>5.2.3.5 계측기 사용자는 온도 등 환경에 의한 성능저하 요인이 발생하지 않도록 관리하고 규정된 성능을 유지 및 도난, 분실, 파손 등을 방지한다.</StyledListItem>
        </StyledList>
      </StyledList>
      <SubsectionTitle>5.3 부적합 계측기의 처리</SubsectionTitle>
      <StyledList>
        <StyledListItem>5.3.1 품질관리담당자는 계측기가 검교정 기준에서 벗어나 있는 것이 발견되면 해당 장비의 사용을 금하고 검사결과에 대한 유효성 확인을 한다.</StyledListItem>
        <StyledListItem>5.3.2 품질관리담당자는 부적합 장비를 검토하여 재검정 또는 재교정 하거나 수리한다. 만일 자체 수리가 어려울 경우 외부에서 수리 하도록 한다.</StyledListItem>
        <StyledListItem>5.3.3 수리된 장비는 초기와 동일한 방법으로 검·교정을 실시하며 검·교정기준에 적합한 경우에만 사용할 수 있다.</StyledListItem>
        <StyledListItem>5.3.4 설비담당은 장비의 수리내용을 ERP 시스템에 기록하고 유지한다.</StyledListItem>
        <StyledListItem>5.3.5 품질관리담당자는 수리가 불가능한 부적합 측정장비는 품질보증책임자의 승인을 얻어 폐기 처분한다.</StyledListItem>
      </StyledList>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>6. 저울관리</SectionTitle>
      <StyledList>
        <StyledListItem>6.1 모든 저울은 연 1회 이상 국가공인기관 또는 공인된 외부 검교정 기관에 의뢰하여 검교정을 실시한다.</StyledListItem>
        <StyledListItem>6.2 외주 검사 결과는 품질관리담당자가 검토하고 품질보증책임자의 승인을 받아 보관한다.</StyledListItem>
        <StyledListItem>6.3 외주 검사 결과 부적합 판정을 받은 저울은 즉시 사용을 중지하고, 수리 또는 교체 후 재검교정을 실시한다.</StyledListItem>
      </StyledList>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>7. pH미터 관리</SectionTitle>
      <StyledList>
        <StyledListItem>7.1 pH미터는 외부 검사 기관에 의뢰하여 검교정을 실시한다.</StyledListItem>
        <StyledListItem>7.2 pH미터 사용 전 후에 전극을 증류수로 세척하고 보관용액에 담가 보관한다.</StyledListItem>
        <StyledListItem>7.3 주기적으로 캘리브레이션을 실시하여 정확도를 유지한다.</StyledListItem>
      </StyledList>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>8. 인큐베이터 관리</SectionTitle>
      <StyledList>
        <StyledListItem>8.1 인큐베이터는 디지털 온도계를 사용하여 온도를 측정하며, 수은 온도계로 이를 교차 검증한다.</StyledListItem>
      </StyledList>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>9. 클린벤치 관리</SectionTitle>
      <StyledList>
        <StyledListItem>9.1 필터 교체: HEPA 필터는 12-18개월마다, 프리필터는 3-6개월마다 또는 육안으로 오염이 확인될 때 교체한다.</StyledListItem>
        <StyledListItem>9.2 UV 램프: 5,000-6,000 작동 시간 후 또는 매년 교체하며, 사용 전후 멸균 처리한다.</StyledListItem>
        <StyledListItem>9.3 교체 주기는 제조업체 권장사항, 사용 빈도, 환경 조건에 따라 조정할 수 있다.</StyledListItem>
        <StyledListItem>9.4 클린벤치 관리는 필요시 외부 검사 기관에 의뢰하여 위탁할 수 있다.</StyledListItem>
      </StyledList>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>10. 백필터 관리</SectionTitle>
      <StyledList>
        <StyledListItem>10.1 백필터 점검</StyledListItem>
        <StyledList>
          <StyledListItem>10.1.1 시각적 점검을 실시하여 손상 여부를 확인하고 백필터 점검 기록서에 기록한다.</StyledListItem>
        </StyledList>
        <StyledListItem>10.2 백필터 교체</StyledListItem>
        <StyledList>
          <StyledListItem>10.2.1 백필터는 정해진 주기에 따라 교체하며, 육안으로 오염이 확인될 경우 즉시 교체한다.</StyledListItem>
          <StyledListItem>10.2.2 교체 이력을 백필터 점검 기록서에 기록하고 관리한다.</StyledListItem>
          <StyledListItem>10.2.3 교체 주기는 사용 빈도 및 제조환경을 고려하여 품질보증책임자가 결정한다.</StyledListItem>
        </StyledList>
      </StyledList>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>11. 첨부</SectionTitle>
      <StyledList>
        <StyledListItem>첨부 1) 저울 점검기록서</StyledListItem>
        <StyledListItem>첨부 2) 저울 검교정 성적서</StyledListItem>
        <StyledListItem>첨부 3) pH미터 교정 기록서</StyledListItem>
        <StyledListItem>첨부 4) 클린벤치 점검 기록서</StyledListItem>
        <StyledListItem>첨부 5) 백필터 점검 기록서</StyledListItem>
      </StyledList>
    </Box>
  );
}

export default BF_RMD_QC_03_Content;
