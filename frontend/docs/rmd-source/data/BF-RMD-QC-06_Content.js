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

function BF_RMD_QC_06_Content() {
  return (
    <Box sx={{ padding: '20px', backgroundColor: '#fff', borderRadius: '8px' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <Box>{/* 미생물시험 규정*/}
          <Typography>문서번호: BF-RMD-QC-06</Typography>
          
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
        본 규정은 (주)바이오에프디엔씨(이하 "당사"라 함)의 제품 제조에 사용되는 정제수 및 제품의 미생물 시험 방법 및 기준을 규정하여 미생물에 의한 제품의 오염과 오염된 제품의 출하를 방지하여 제품의 품질을 보증하는데 그 목적이 있다. 
      </Paragraph>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>2. 적용범위</SectionTitle>
      <Paragraph>
        본 규정은 당사의 아래와 같은 미생물 시험에 대하여 적용한다.
      </Paragraph>
      <StyledList>
        <StyledListItem>제품 제조에 사용되는 정제수</StyledListItem>
        <StyledListItem>제품</StyledListItem>
      </StyledList>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>3. 책임과 권한</SectionTitle>
      <SubsectionTitle>3.1 품질경영최고책임자</SubsectionTitle>
      <StyledList>
        <StyledListItem>3.1.1 미생물 시험에 관한 전반적인 사항을 총괄 관리한다.</StyledListItem>
      </StyledList>
      <SubsectionTitle>3.2 품질보증책임자</SubsectionTitle>
      <StyledList>
        <StyledListItem>3.2.1 정제수 및 제품의 미생물시험에 대한 총괄 책임을 가지며 미생물 시험 담당자를 관리감독한다.</StyledListItem>
        <StyledListItem>3.2.2 미생물 시험 결과를 확인하고 이에 대한 적부 판정의 책임을 진다.</StyledListItem>
      </StyledList>
      <SubsectionTitle>3.3 품질관리담당자</SubsectionTitle>
      <StyledList>
        <StyledListItem>3.3.1 정제수 및 제품 미생물 시험 업무를 수행하며 그 결과를 기록, 확인, 보고하고 해당 부서에 통보한다.</StyledListItem>
        <StyledListItem>3.3.2 시험에 필요한 배지, 시약 등을 유지, 관리한다.</StyledListItem>
        <StyledListItem>3.3.3 미생물 실험실, 크린벤치 등 미생물 시험과 관련된 실험 설비를 관리한다.</StyledListItem>
      </StyledList>
      <SubsectionTitle>3.4 제조생산책임자</SubsectionTitle>
      <StyledList>
        <StyledListItem>3.4.1 정제수 및 제품의 시험결과에 따른 처리 업무를 한다.</StyledListItem>
      </StyledList>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>4. 검체의 채취</SectionTitle>
      <StyledList>
        <StyledListItem>4.1 검체 채취에 사용할 용기 및 기타 도구는 오토클레이브를 이용하여 멸균하며 용기는 검체 채취 전까지 마개를 열어서는 안 된다.</StyledListItem>
        <StyledListItem>4.2 검체는 충분하게 무작위로 선별하여 채취한다.</StyledListItem>
        <StyledListItem>4.3 검체를 채취할 때는 검체 채취용 용기의 마개를 열어 신속하게 채취하고 다시 마개를 닫아 환경 균의 오염에 주의하여야 한다.</StyledListItem>
        <StyledListItem>4.4 검체를 채취한 후에는 최대한 빨리 시험을 실시하되 시험이 늦추어질 경우, 실온에서 보관한 뒤 시험을 실시한다. 시험 전 배양, 냉장, 냉동하지 않아야 한다.</StyledListItem>
      </StyledList>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>5. 검체의 전처리</SectionTitle>
      <SubsectionTitle>5.1 정제수</SubsectionTitle>
      <Paragraph>
        별다른 전처리를 하지 않고 채취한 검체를 검액으로 하여 그대로 시험한다.
      </Paragraph>
      <SubsectionTitle>5.2 원료 검체</SubsectionTitle>
      <StyledList>
        <StyledListItem>5.2.1 원료 검체는 그 특성에 따라 적절한 방법으로 전처리한다.</StyledListItem>
        <StyledListItem>5.2.2 일반적으로 검체 1g(ml)에 희석액 9ml을 넣어 10배로 희석하고 필요시 추가로 희석한다.</StyledListItem>
        <StyledListItem>5.2.3 희석액에 균일하게 분산되지 않는 원료의 경우, 분산제(예: Tween80)를 사용하여 균질화할 수 있다.</StyledListItem>
        <StyledListItem>5.2.4 필요에 따라 유리구슬 등을 사용하여 균질화를 돕는다.</StyledListItem>
      </StyledList>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>6. 총 호기성 생균 수 시험</SectionTitle>
      <Paragraph>
        총 호기성 생균 수 시험법은 검체 중 총 호기성 생균(세균, 진균)수를 측정하는 시험법을 말하며 총 호기성 생균 수는 하기된 한천평판 도말법을 사용하여 검출된 세균 수와 진균 수의 합으로 한다.
      </Paragraph>
      <SubsectionTitle>6.1 검액의 조제</SubsectionTitle>
      <Paragraph>
        희석액은 하기의 희석액을 사용하는 것을 원칙으로 하며 "배지의 적합성 시험"과 "미생물 발육 저지물질의 확인 시험"을 통해 검증된 다른 희석액도 사용 가능하다.
      </Paragraph>
      <StyledList>
        <StyledListItem>1) 변형레틴 액체 배지 (Modified letheen broth)</StyledListItem>
        <StyledListItem>2) Sodium Chloride Peptone broth</StyledListItem>
      </StyledList>
      <Paragraph>
        검증된 희석액을 사용하여 검체의 전처리 방법에 따라 검액을 조제한다.
      </Paragraph>

      <SubsectionTitle>6.2 사용 배지</SubsectionTitle>
      <SubsectionTitle>6.2.1 검출용 한천 배지</SubsectionTitle>
      <Paragraph>
        하기의 검출용 한천 배지를 사용하는 것을 원칙으로 하며 "배지성능시험"과 "시험법 적합성 시험"을 통해 검증된 다른 검출용 한천 배지도 사용 가능하다.
      </Paragraph>
      <StyledList>
        <StyledListItem>1) 세균용 배지 : 대두카제인소화한천배지(Tryptic soy agar)</StyledListItem>
        <StyledListItem>2) 진균용 배지 : 감자포도당한천배지(Potato dextrose agar, PDA) 또는 Sabouraud Dextrose Agar with Chloramphenicol (SDAC)</StyledListItem>
      </StyledList>

      <SubsectionTitle>6.3 조작</SubsectionTitle>
      <SubsectionTitle>6.3.1 세균 수 시험</SubsectionTitle>
      <StyledList>
        <StyledListItem>1) 직경 9cm Petri dish에 오토클레이브한 세균시험용 배지를 15~20ml 분주하고 굳힌다.</StyledListItem>
        <StyledListItem>2) 굳힌 세균 시험용 배지 표면에 전처리 검액 0.1ml를 도말한다.</StyledListItem>
        <StyledListItem>3) 30~35℃에서 최소 48시간 배양한다.</StyledListItem>
        <StyledListItem>4) 배양 후, 균 집락을 확인하여 총 세균 수를 측정한 다음, 희석배율을 곱하여 이를 세균 수로 한다.</StyledListItem>
      </StyledList>

      <SubsectionTitle>6.3.2 진균 수 시험</SubsectionTitle>
      <StyledList>
        <StyledListItem>1) 직경 9cm Petri dish에 오토클레이브한 진균 시험용 배지(PDA 또는 SDAC)를 15~20ml 분주하고 굳힌다</StyledListItem>
        <StyledListItem>2) 굳힌 진균 시험용 배지 표면에 전처리 검액 0.1ml를 도말한다.</StyledListItem>
        <StyledListItem>3) 20~25℃에서 최소 5일간 배양한다.</StyledListItem>
        <StyledListItem>4) 배양 후, 균 집락을 확인하여 총 진균 수를 측정한 다음, 희석배율을 곱하여 이를 진균 수로 한다.</StyledListItem>
      </StyledList>

      <SubsectionTitle>6.3.3 총 호기성 생균 수 계산</SubsectionTitle>
      <Paragraph>
        세균 수와 진균 수를 합하여 총 호기성 생균 수로 한다.
      </Paragraph>

      <SubsectionTitle>6.4 결과의 판정 기준</SubsectionTitle>
      <StyledList>
        <StyledListItem>6.4.1 정제수의 총 호기성 생균 수의 적합 판정 기준은 100cfu/ml 이하로 한다.</StyledListItem>
        <StyledListItem>6.4.2 제품의 총 호기성 생균 수의 적합 판정 기준은 세균 및 진균 각각 100cfu/g(ml) 이하로 한다.</StyledListItem>
      </StyledList>
      <Paragraph>
        제품성적서에는 일반세균 100cfu/g(ml) 이하로 하여 적/부 판정을 한다.
        진균 시험은 제품 미생물 시험일지에 기록하여 관리한다.
        (단, 1차 시험 시 부적합으로 판정되었을 경우 재시험하여 균수의 변화를 확인하는데, 그 결과 100cfu/g(ml) 이하로 감소하지 않을 경우에는 부적합으로 판정한다)
      </Paragraph>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>7. 특정세균 시험</SectionTitle>
      <SubsectionTitle>7.1 대장균 시험</SubsectionTitle>
      <Paragraph>
        대장균은 그람 음성 간균으로 운동성을 갖는 장내세균이며, 유당을 발효하여 가스를 생성하는 통성 혐기성 세균을 말한다. 시험 방법은 다음과 같다.
      </Paragraph>

      <SubsectionTitle>7.1.1 검액의 조제 및 조작</SubsectionTitle>
      <StyledList>
        <StyledListItem>1) 검체 1g 또는 1ml를 달아 유당액체배지를 사용하여 10ml로 하여 30~35℃에서 24~72시간 배양한다.</StyledListItem>
        <StyledListItem>2) 배양액을 가볍게 흔든 다음 백금이 등으로 취하여 맥콘키 한천배지위에 도말하고 30~35℃에서 18~24시간 배양한다.</StyledListItem>
        <StyledListItem>3) 주위에 적색의 침강선띠를 갖는 적갈색의 그람음성균의 집락이 검출되지 않으면 대장균 음성으로 판정한다.</StyledListItem>
        <StyledListItem>4) 위의 특징을 나타내는 집락이 검출되는 경우에는 에오신 메칠렌블루 한천배지에서 각각의 집락을 도말한다.</StyledListItem>
        <StyledListItem>5) 30~35℃에서 18~24시간 배양한다.</StyledListItem>
        <StyledListItem>6) 에오신 메칠렌블루 한천 배지에서 금속광택을 나타내는 집락 또는 투과광선 하에서 흑청색을 나타내는 집락이 검출되지 않으면 대장균 음성으로 판정한다.</StyledListItem>
        <StyledListItem>7) 위의 특징을 나타내는 집락이 발견되면 백금이등으로 취하여 발효시험관이 든 유당 액체배지에 접종한다.</StyledListItem>
        <StyledListItem>8) 44.3~44.7℃에서 22~26시간 배양한다.</StyledListItem>
        <StyledListItem>9) 가스발생이 나타나지 않는 경우에는 대장균 음성으로 하고, 나타나는 경우에는 대장균 양성으로 판정한다.</StyledListItem>
      </StyledList>

      <SubsectionTitle>7.1.2 배지</SubsectionTitle>
      <StyledList>
        <StyledListItem>1) 유당 액체배지</StyledListItem>
        <StyledListItem>2) 맥콘키 한천배지</StyledListItem>
        <StyledListItem>3) 에오신 메칠렌블루 한천배지</StyledListItem>
      </StyledList>

      <SubsectionTitle>7.2 녹농균 시험방법</SubsectionTitle>
      <Paragraph>
        녹농균은 그람음성, 단모성 또는 쌍모성 편모를 가진 무아포성간균이며 운동성이 있는 호기성 세균으로 시험방법은 다음과 같다.
      </Paragraph>

      <SubsectionTitle>7.2.1 검체의 조제 및 조작</SubsectionTitle>
      <StyledList>
        <StyledListItem>1) 검체 1g 또는 1ml를 달아 카제인대두소화 액체배지를 사용하여 10ml로 하여30~35℃에서 24~48시간 증균 배양한다.</StyledListItem>
        <StyledListItem>2) 증식이 나타나는 경우는 백금이 등으로 취하여 세트리미드 한천배지에 도말하여30~35℃에서 24~48시간 배양한다.</StyledListItem>
        <StyledListItem>3) 미생물의 증식이 관찰되지 않는 경우 녹농균 음성으로 판정한다.</StyledListItem>
        <StyledListItem>4) 그람음성간균으로 녹색 형광물질을 나타내는 집락을 확인하는 경우에는 증균배양액을 녹농균 한천배지 P 및 F에 도말하여 30~35℃에서 24~72시간 배양한다.</StyledListItem>
        <StyledListItem>5) 위의 특징을 나타내는 집락이 검출되면 옥시다제 시험을 실시한다.</StyledListItem>
        <StyledListItem>
          가) 옥시다제 시험<br/>
          집락을 염화 N, N-디메칠 p-페닐렌디아민이 묻은 여지에 옮겨 5~10초 이내에 자색으로 변색되면 옥시다제 양성으로 판정한다.
        </StyledListItem>
        <StyledListItem>6) 옥시다제 반응 음성인 경우에는 녹농균 음성으로 판정한다.</StyledListItem>
      </StyledList>

      <SubsectionTitle>7.2.2 배지</SubsectionTitle>
      <StyledList>
        <StyledListItem>1) 카제인 대두 소화 액체배지</StyledListItem>
        <StyledListItem>2) 세트리미드 한천배지</StyledListItem>
      </StyledList>

      <SubsectionTitle>7.3 황색포도상구균 시험방법</SubsectionTitle>
      <Paragraph>
        황색포도상구균은 그람양성 무아포 비운동성 구균이 불규칙하게 포도송이 모양으로 배열되어 있는 호기성 또는 통성 혐기성균으로서 혈장응집반응이 양성인 균을 말하며 시험방법은 다음과 같다.
      </Paragraph>

      <SubsectionTitle>7.3.1 검체의 조제 및 조작</SubsectionTitle>
      <StyledList>
        <StyledListItem>1) 검체 1g 또는 1ml를 달아 카제인대두소화 액체배지를 사용하여 10ml로 하여30~35℃에서 24~48시간 증균 배양한다.</StyledListItem>
        <StyledListItem>2) 증균 배양액을 보겔존슨 한천배지에 도말하여 30~35℃에서 24시간 배양한다.</StyledListItem>
        <StyledListItem>3) 균의 집락이 검정색이고 집락주위에 황색투명대가 형성되며 그람염색법에 따라 염색하여 시험한 결과 그람 양성균으로 나타나면 응고효소 시험을 실시한다.</StyledListItem>
        <StyledListItem>4) 응고효소시험<br/>
          백금이등으로 의심이 되는 집락을 취하여 포유류 유래의 0.5ml의 혈장을 포함하는 시험관에 접종하고 대조군과 함께 37℃에서 배양한다. 3시간 후에 응고 유무를 1차 확인하고 그 후 24시간까지 응고 유무를 확인한다.</StyledListItem>
        <StyledListItem>5) 응고가 관찰되면 황색포도상구균 양성으로 판정한다.</StyledListItem>
      </StyledList>

      <SubsectionTitle>7.3.2 배지</SubsectionTitle>
      <StyledList>
        <StyledListItem>1) 카제인 대두 소화 액체배지</StyledListItem>
        <StyledListItem>2) 보겔존슨 한천배지(Vogel-Johnson agar)</StyledListItem>
      </StyledList>

      <SubsectionTitle>7.4 결과의 판정 기준</SubsectionTitle>
      <Paragraph>
        대장균(Escherichia coli), 녹농균(Pseudomonas aeruginosa), 황색포도상구균 (Staphylococcus aureus)은 제품 1g(ml)에서 검출되어서는 안 된다.
      </Paragraph>

      <Divider sx={{ marginY: '50px' }} />

      <SectionTitle>8. 미생물의 폐기</SectionTitle>
      <SubsectionTitle>8.1 미생물 처리 시 준수 수칙</SubsectionTitle>
      <StyledList>
        <StyledListItem>8.1.1 모든 미생물은 잠재적인 병원균이며 감염성이 있는 것으로 간주한다.</StyledListItem>
        <StyledListItem>8.1.2 오염된 기구와 배양 물은 초자기구 세척장소에 보내거나 처분하기 전에 멸균을 확실히 하여야 한다.</StyledListItem>
        <StyledListItem>8.1.3 절대로 살아있는 미생물을 배수구나 일반 쓰레기통에 버려서는 안 된다.</StyledListItem>
        <StyledListItem>8.1.4 미생물에 관련된 모든 사고와 상해는 가능한 빨리 품질보증책임자에게 보고하여 신속히 처리한다.</StyledListItem>
      </StyledList>

      <SubsectionTitle>8.2 미생물의 멸균</SubsectionTitle>
      <SubsectionTitle>8.2.1 고압증기멸균</SubsectionTitle>
      <StyledList>
        <StyledListItem>1) 초자기구, 배지, 오염배지, 시험재료, 오염된 용기 등에 대해 실시한다.</StyledListItem>
        <StyledListItem>2) 오토클레이브를 이용하여 121℃에서 15분간 멸균한다.</StyledListItem>
      </StyledList>

      <SubsectionTitle>8.2.2 화학적 소독</SubsectionTitle>
      <StyledList>
        <StyledListItem>1) 초자, 작업대 표면, 엎지른 오염 물 등에 대해 실시한다.</StyledListItem>
        <StyledListItem>2) 70% 에탄올을 이용한다.</StyledListItem>
      </StyledList>

      <SubsectionTitle>8.3 멸균된 폐기물의 처리</SubsectionTitle>
      <StyledList>
        <StyledListItem>8.3.1 재활용이 가능한 미생물 실험 관련 물품은 완전 멸균 후 세척하여 사용한다.</StyledListItem>
        <StyledListItem>8.3.2 재활용이 불가능한 폐기물은 완전 멸균 후 2차 오염이 되지 않도록 밀봉한 후 처리한다.</StyledListItem>
      </StyledList>

      <Divider sx={{ marginY: '50px' }} />

      <SectionTitle>9. 배지적합성 시험</SectionTitle>
      <Paragraph>
        9.1 시험용 배지를 사용시 입고처에서 배지성능시험에 관한 성적서를 입수한 후 사용하거나 또는 아래와 같은 표준화된 시험법을 거친 후 배지를 사용한다.
      </Paragraph>
      <SubsectionTitle>9.2 배지적합성시험방법</SubsectionTitle>
      <StyledList>
        <StyledListItem>1) Pellet이 있는 바이알의 마개를 제거하고 이 Pellet을 복원용액의 바이알에 오염되지 않게 이동시킨다.</StyledListItem>
        <StyledListItem>2) 복원용액과 Pellet이 담긴 바이알을 34~37℃에서 30분간 방치하여 균을 활성화시킨다.</StyledListItem>
        <StyledListItem>3) 활성화 이후 Vortex를 사용해 완전히 혼합시킨다.</StyledListItem>
        <StyledListItem>4) 균주를 100cfu이하 접종하여 혼합시킨 액을 해당 배지에 0.1ml 투여하여 도말한다.</StyledListItem>
        <StyledListItem>5) 도말시 완전히 건조시켜야 한다.</StyledListItem>
        <StyledListItem>6) 건조시킨 배지를 세균은 30~35℃에서 48시간 배양하고, 진균은 20~25℃에서 5일간 배양한다.</StyledListItem>
        <StyledListItem>7) 배양 후 배지에서 확인된 균을 카운팅한다.</StyledListItem>
      </StyledList>

      <SubsectionTitle>표1. 배지성능시험용 균주</SubsectionTitle>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>시험균주</TableCell>
              <TableCell>준비배양조건</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>Escherichia coli (ATCC No.8739)</TableCell>
              <TableCell>호기배양 / 30~35℃ / 48시간</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Candida albicans (ATCC No.2091 or 10231)</TableCell>
              <TableCell>호기배양 / 20~25℃ / 5일</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      <Divider sx={{ marginY: '50px' }} />

      <SectionTitle>10. 사용 희석액 및 배지</SectionTitle>
      <Paragraph>
        10.1 식약처 고시 "유통화장품 안전관리 기준"에 준한다.
      </Paragraph>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>11. 기록 및 문서보관</SectionTitle>
      <StyledList>
        <StyledListItem>11.1 미생물 시험 결과는 각 시험 성적서에 기록한다.</StyledListItem>
      </StyledList>
    </Box>
  );
}

export default BF_RMD_QC_06_Content;
