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

function BF_RMD_HM_02_Content() {
  return (
    <Box sx={{ padding: '20px', backgroundColor: '#fff', borderRadius: '8px' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <Box>{/* 위생복 착용 규정*/}
          <Typography>문서번호: BF-RM-HM-02</Typography>
          
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
        본 규정은 (주)바이오에프디엔씨 (이하 "당사"라 함)의 화장품 원료 생산에 종사하는 업무담당자들이 작업의 종류에 따라 착용할 위생복, 위생모, 위생화 등에 대한 규격과 착용방법, 관리방법을 규정함으로써 작업장을 청결하고 위생적으로 유지하는데 그 목적이 있다. 
      </Paragraph>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>2. 적용범위</SectionTitle>
      <Paragraph>
        본 규정은 당사의 작업장 및 보관소에 출입하는 업무담당자 및 외부 방문자에게 적용된다.
      </Paragraph>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>3. 책임과 권한</SectionTitle>
      <SubsectionTitle>3.1 품질경영최고책임자</SubsectionTitle>
      <StyledList>
        <StyledListItem>3.1.1 위생복 착용 규정의 승인</StyledListItem>
      </StyledList>

      <SubsectionTitle>3.2 품질보증책임자</SubsectionTitle>
      <StyledList>
        <StyledListItem>3.2.1 위생복 착용 규정의 수립 및 이행 감독</StyledListItem>
        <StyledListItem>3.2.2 위생복 착용 상태 점검 및 개선 조치</StyledListItem>
      </StyledList>

      <SubsectionTitle>3.3 제조생산책임자</SubsectionTitle>
      <StyledList>
        <StyledListItem>3.3.1 제조 구역 내 위생복 착용 관리 실행</StyledListItem>
        <StyledListItem>3.3.2 위생복 관련 시설물 유지 관리</StyledListItem>
        <StyledListItem>3.3.3 작업장 및 작업원 위생관리 총괄</StyledListItem>
      </StyledList>

      <SubsectionTitle>3.4 업무담당자</SubsectionTitle>
      <StyledList>
        <StyledListItem>3.4.1 위생복 착용 규정 준수</StyledListItem>
        <StyledListItem>3.4.2 개인 위생 유지 및 관리</StyledListItem>
        <StyledListItem>3.4.3 위생복 착용 관련 문제점 보고</StyledListItem>
      </StyledList>
      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>4. 위생복 착용 규정</SectionTitle>
      <SubsectionTitle>4.1 업무담당자용 위생복</SubsectionTitle>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>종류</TableCell>
              <TableCell>재질</TableCell>
              <TableCell>색상</TableCell>
              <TableCell>착용형태</TableCell>
              <TableCell>남녀구분</TableCell>
              <TableCell>착용 구역</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>위생복</TableCell>
              <TableCell>폴리에스텔 + 면</TableCell>
              <TableCell>하늘색</TableCell>
              <TableCell>상·하의 분리</TableCell>
              <TableCell>없음</TableCell>
              <TableCell>제조구역</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>위생모</TableCell>
              <TableCell>폴리에스텔 + 면</TableCell>
              <TableCell>흰색</TableCell>
              <TableCell>머리카락이 밖으로 나오지 않도록 할 것</TableCell>
              <TableCell>있음</TableCell>
              <TableCell>제조구역</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>위생화</TableCell>
              <TableCell>폴리에스텔 + 면 또는 고무</TableCell>
              <TableCell>흰색</TableCell>
              <TableCell>꺾어신지 않음</TableCell>
              <TableCell>없음</TableCell>
              <TableCell>제조구역</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>실험가운</TableCell>
              <TableCell>폴리에스텔 + 면</TableCell>
              <TableCell>흰색</TableCell>
              <TableCell>상하의 통합</TableCell>
              <TableCell>없음</TableCell>
              <TableCell>품질 실험실, 연구소</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      <SubsectionTitle sx={{ marginTop: '30px' }}>4.2 방문자용 위생복</SubsectionTitle>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>종류</TableCell>
              <TableCell>재질</TableCell>
              <TableCell>색상</TableCell>
              <TableCell>착용형태</TableCell>
              <TableCell>남녀구분</TableCell>
              <TableCell>착용 구역</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>위생모</TableCell>
              <TableCell>부직포</TableCell>
              <TableCell>흰색</TableCell>
              <TableCell>일회용 위생모</TableCell>
              <TableCell>없음</TableCell>
              <TableCell>제조구역</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>위생화</TableCell>
              <TableCell>부직포</TableCell>
              <TableCell>흰색</TableCell>
              <TableCell>일회용 덧신</TableCell>
              <TableCell>없음</TableCell>
              <TableCell>제조구역</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>5. 위생복 착용 지침</SectionTitle>
      <SubsectionTitle>5.1 위생화 및 위생복 착용</SubsectionTitle>
      <StyledList>
        <StyledListItem>5.1.1 작업장 입장 전 신발장에서 외부 신발을 위생화로 갈아 신는다.</StyledListItem>
        <StyledListItem>5.1.2 탈의장에서 외부 의복을 위생복으로 환복한 후 작업장에 입장한다.</StyledListItem>
        <StyledList>
          <StyledListItem>5.1.2.1 내의 등 모든 개인 복장이 위생복 밖으로 나오지 않도록 착용한다.</StyledListItem>
          <StyledListItem>5.1.2.2 상의가 하의 겉으로 나오도록 착용한다.</StyledListItem>
          <StyledListItem>5.1.2.3 머리카락이 밖으로 나오지 않도록 위생모를 착용한다.</StyledListItem>
          <StyledListItem>5.1.2.4 미생물 실험실, 칭량실, 제조실, 충진실 등의 공정을 출입 시에는 필요 시 마스크, 장갑을 착용한다.</StyledListItem>
        </StyledList>
      </StyledList>
      <SubsectionTitle>5.2 구역간 이동 시 위생복 착용</SubsectionTitle>
      <StyledList>
        <StyledListItem>5.2.1 제조구역 업무담당자가 일반구역으로 이동 시에는 탈의실에서 위생복을 해당 구역에 맞는 작업복 또는 실외복으로 교체한 후 이동한다.</StyledListItem>
        <StyledListItem>5.2.2 일반구역에서 제조구역으로 출입할 경우에는 위생복 및 위생화로 갱의한 후 출입한다.</StyledListItem>
      </StyledList>

      <Divider sx={{ marginY: '50px' }} />
      
      <SectionTitle>6. 위생복 관리 지침</SectionTitle>
      <SubsectionTitle>6.1 구입 및 유지관리</SubsectionTitle>
      <Paragraph>
        위생복을 1인당 2벌 구입하여, 적절한 시기에 세탁하여 교체할 수 있도록 한다.
      </Paragraph>
      <SubsectionTitle>6.2 세탁관리</SubsectionTitle>
      <StyledList>
        <StyledListItem>6.2.1 위생복은 최소 매주 1회 세탁한다.</StyledListItem>
        <StyledListItem>6.2.2 세탁은 정해진 일정마다 개인별로 청결히 세탁을 한다.</StyledListItem>
      </StyledList>
    </Box>
  );
}

export default BF_RMD_HM_02_Content;