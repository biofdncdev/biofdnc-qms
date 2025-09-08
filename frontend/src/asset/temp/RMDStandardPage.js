import React, { useState, useRef, useEffect, useCallback } from 'react';
import { styled } from '@mui/system';
import { Box, Typography, Divider, Button, TextField, InputAdornment, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ReactDOMServer from 'react-dom/server';
import rmdRegulations from '../data/rmdStandards';
import CircularProgress from '@mui/material/CircularProgress';

const PageWrapper = styled(Box)({
  paddingTop: '100px',
  paddingLeft: '300px',
  minHeight: '60vh',
  backgroundColor: '#fff',
});

// 메인 컨테이너는 뷰포트 기반의 고정 높이를 사용해 좌우 영역이 서로의 콘텐츠 높이에 영향을 주지 않도록 한다
const Container = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'stretch',
  padding: theme.spacing(2),
  position: 'fixed',
  top: '150px',
  left: '200px',
  right: 0,
  bottom: 0,
  height: 'calc(100vh - 150px)', // 좌우 컬럼 높이를 뷰포트 기반으로 고정
  backgroundColor: '#fff',
}));

const LeftSection = styled(Box)(({ theme }) => ({
  width: '35%',
  display: 'flex',
  flexDirection: 'column',
  paddingLeft: theme.spacing(10),
  paddingRight: theme.spacing(15),
  borderRight: `1px solid ${theme.palette.divider}`,
  height: '100%', // 컨테이너의 고정 높이만큼 사용
  overflow: 'hidden', // 내부 스크롤 영역으로 분리
}));

const RightSection = styled(Box)(({ theme }) => ({
  width: '65%',
  overflowY: 'auto',
  paddingLeft: theme.spacing(10),
  marginRight: theme.spacing(20),
  height: '100%', // 컨테이너의 고정 높이만큼 사용 — 좌측과 독립
  backgroundColor: '#fff',
  '&::-webkit-scrollbar': {
    display: 'none',
  },
  '-ms-overflow-style': 'none',
  'scrollbar-width': 'none',
  '& p, & li': {
    lineHeight: '1.8',
    marginBottom: '0.5em',
  },
}));

const CategoryTitle = styled(Typography)(({ theme }) => ({
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(1),
  fontWeight: 'bold',
}));

const RegulationButton = styled(Button)(({ theme, selected }) => ({
  marginBottom: theme.spacing(1),
  justifyContent: 'flex-start',
  textTransform: 'none',
  backgroundColor: selected ? theme.palette.action.hover : 'inherit',
  color: selected ? theme.palette.primary.main : 'inherit',
}));

const LeftSectionHeader = styled(Box)({
  position: 'sticky',
  top: 0,
  backgroundColor: '#fff',
  zIndex: 1,
  paddingBottom: '20px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
});

const SearchContainer = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  marginBottom: '20px',
  width: '100%',
});

const SearchInputContainer = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  width: '300px', // 검색창의 고정 너비
  marginRight: '10px',
});

const StyledTextField = styled(TextField)({
  '& .MuiInputBase-root': {
    height: '36px',
    fontSize: '0.875rem',
  },
  '& .MuiInputBase-input': {
    padding: '4px 8px',
  },
  flexGrow: 1,
});

const SearchNavigation = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  whiteSpace: 'nowrap',
});

const NavigationArrow = styled(IconButton)({
  padding: '4px',
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
});

const ContentContainer = styled(Box)({
  '& > *': {
    maxWidth: '800px',  // 본문 최대 너비 제한
    margin: '0 auto',  // 중앙 정렬
  },
  '& h1, & h2, & h3, & h4, & h5, & h6': {
    marginTop: '1.5em',
    marginBottom: '0.8em',
  },
});

function RMDStandardPage() {
  const [selectedRegulation, setSelectedRegulation] = useState(null);
  const [content, setContent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [highlightedNodes, setHighlightedNodes] = useState([]);
  const [currentHighlightIndex, setCurrentHighlightIndex] = useState(-1);
  const rightSectionRef = useRef(null);
  const contentRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [searchData, setSearchData] = useState([]);

  useEffect(() => {
    loadSearchData();
  }, []);

  const loadSearchData = async () => {
    setIsLoading(true);
    try {
      const data = [];
      for (const category of rmdRegulations) {
        for (const item of category.items) {
          const module = await import(`../data/${item.id}_Content`);
          const contentComponent = <module.default />;
          const htmlString = ReactDOMServer.renderToString(contentComponent);
          data.push({ ...item, category: category.category, content: htmlString });
        }
      }
      setSearchData(data);
    } catch (error) {
      console.error('데이터 로딩 오류:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegulationClick = async (regulation) => {
    setSelectedRegulation({
      ...regulation,
      revisionNumber: '00',
      revisionDate: '2024.07.01',
    });
    try {
      const module = await import(`../data/${regulation.id}_Content`);
      let contentComponent = <module.default />;
      // 하이라이트 기능 제거
      setContent(contentComponent);
      if (rightSectionRef.current) {
        rightSectionRef.current.scrollTop = 0;
      }
    } catch (error) {
      console.error('콘텐츠 로딩 오류:', error);
      setContent(
        <Typography variant="body1">
          콘텐츠를 불러올 수 없습니다. ({regulation.id})
        </Typography>
      );
    }
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      const term = e.target.value;
      setSearchTerm(term);

      if (!term) {
        setSearchResults([]);
        setHighlightedNodes([]);
        setCurrentHighlightIndex(-1);
        return;
      }

      const results = searchData.filter(item =>
        item.content.toLowerCase().includes(term.toLowerCase())
      );
      setSearchResults(results);
      highlightSearchTerm(term);
    }
  };

  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const highlightSearchTerm = useCallback((term) => {
    if (term && contentRef.current) {
      const textNodes = [];
      const walker = document.createTreeWalker(
        contentRef.current,
        NodeFilter.SHOW_TEXT,
        null,
        false
      );

      let node;
      while ((node = walker.nextNode())) {
        if (node.nodeValue.toLowerCase().includes(term.toLowerCase())) {
          textNodes.push(node);
        }
      }

      // Remove previous highlights
      highlightedNodes.forEach((node) => {
        if (node.parentElement) {
          node.parentElement.replaceWith(node);
        }
      });

      const newHighlightedNodes = textNodes.map((textNode) => {
        const regex = new RegExp(`(${term})`, 'gi');
        const newNode = document.createElement('span');
        newNode.innerHTML = textNode.nodeValue.replace(regex, '<mark style="background-color: yellow;">$1</mark>');
        textNode.parentNode.replaceChild(newNode, textNode);
        return newNode;
      });

      setHighlightedNodes(newHighlightedNodes);
      setCurrentHighlightIndex(newHighlightedNodes.length > 0 ? 0 : -1);

      if (newHighlightedNodes.length > 0) {
        newHighlightedNodes[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, []);

  useEffect(() => {
    if (searchTerm) {
      highlightSearchTerm(searchTerm);
    }
  }, [searchTerm, content, highlightSearchTerm]);

  const navigateHighlight = (direction) => {
    if (highlightedNodes.length === 0) return;

    let newIndex;
    if (direction === 'next') {
      newIndex = (currentHighlightIndex + 1) % highlightedNodes.length;
    } else {
      newIndex = (currentHighlightIndex - 1 + highlightedNodes.length) % highlightedNodes.length;
    }

    setCurrentHighlightIndex(newIndex);
    highlightedNodes[newIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handlePrint = () => {
    const originalTitle = document.title;
    document.title = `${selectedRegulation.id} ${selectedRegulation.title}`;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>${document.title}</title>
          <style>
            @page {
              size: auto;
              margin: 30mm 0mm; 
            }
            @media print {
              body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
            }
            body { 
              font-family: Arial, sans-serif; 
              margin: 0mm 25mm;
              font-size: 12px;
              line-height: 1.6;
              -webkit-print-color-adjust: exact;
            }
            h1 { 
              font-size: 24px; 
              text-align: center; 
              margin-bottom: 20px;
            }
            table { 
              border-collapse: collapse; 
              width: 100%; 
              margin-bottom: 20px;
            }
            th, td { 
              border: 1px solid black; 
              padding: 6px; 
              text-align: left; 
              font-size: 12px;
            }
            th {
              background-color: #f2f2f2;
            }
            .document-header {
              display: flex;
              justify-content: space-between;
              margin-bottom: 20px;
            }
          </style>
        </head>
        <body>
          <h1>${selectedRegulation.title}</h1>
          ${contentRef.current.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();

    printWindow.onload = function () {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    };

    setTimeout(() => {
      document.title = originalTitle;
    }, 100);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      clearSearch();
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchTerm('');
    setSearchResults([]);
    setHighlightedNodes([]);
    setCurrentHighlightIndex(-1);

    // Remove highlights from the content
    if (contentRef.current) {
      const highlights = contentRef.current.querySelectorAll('mark');
      highlights.forEach(highlight => {
        const textNode = document.createTextNode(highlight.textContent);
        highlight.parentNode.replaceChild(textNode, highlight);
      });
    }
  };

  return (
    <PageWrapper>
      <Container>
        <LeftSection>
          <LeftSectionHeader>
            <Typography variant="h5" style={{ marginBottom: '30px' }}>
              원료제조팀 규정
            </Typography>
            <SearchContainer>
              <SearchInputContainer>
                <StyledTextField
                  variant="outlined"
                  size="small"
                  placeholder="검색"
                  value={searchQuery}
                  onChange={handleInputChange}
                  onKeyDown={(e) => {
                    handleSearch(e);
                    handleKeyDown(e);
                  }}
                  disabled={isLoading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" />
                      </InputAdornment>
                    ),
                    endAdornment: searchQuery && (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="clear search"
                          onClick={clearSearch}
                          edge="end"
                          size="small"
                        >
                          <ClearIcon fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                {isLoading && (
                  <CircularProgress size={24} style={{ marginLeft: '10px' }} />
                )}
              </SearchInputContainer>
              {searchTerm && highlightedNodes.length > 0 && (
                <SearchNavigation>
                  <Typography variant="body2" sx={{ mr: 1 }}>
                    {currentHighlightIndex + 1} / {highlightedNodes.length}
                  </Typography>
                  <NavigationArrow onClick={() => navigateHighlight('prev')} size="small">
                    <ArrowUpwardIcon fontSize="small" />
                  </NavigationArrow>
                  <NavigationArrow onClick={() => navigateHighlight('next')} size="small">
                    <ArrowDownwardIcon fontSize="small" />
                  </NavigationArrow>
                </SearchNavigation>
              )}
            </SearchContainer>
          </LeftSectionHeader>
          {/* 좌측 목록은 자체 스크롤 영역으로 분리해 우측 높이에 영향을 주지 않도록 한다 */}
          {searchTerm ? (
            <Box sx={{ overflowY: 'auto', flex: 1 }}>
              {searchResults.length > 0 ? (
                searchResults.map((item) => (
                  <RegulationButton
                    key={item.id}
                    variant="text"
                    fullWidth
                    onClick={() => handleRegulationClick(item)}
                    selected={selectedRegulation?.id === item.id}
                  >
                    {`${item.id}. ${item.title}`}
                  </RegulationButton>
                ))
              ) : (
                <Typography variant="body2" sx={{ marginTop: '10px' }}>
                  검색 결과가 없습니다.
                </Typography>
              )}
            </Box>
          ) : (
            rmdRegulations.map((category) => (
              <Box key={category.category} sx={{ overflowY: 'auto', flex: 1 }}>
                <Divider />
                <CategoryTitle variant="subtitle1">{category.category}</CategoryTitle>
                {category.items.map((item) => (
                  <RegulationButton
                    key={item.id}
                    variant="text"
                    fullWidth
                    onClick={() => handleRegulationClick(item)}
                    selected={selectedRegulation?.id === item.id}
                  >
                    {`${item.id}. ${item.title}`}
                  </RegulationButton>
                ))}
              </Box>
            ))
          )}
        </LeftSection>
        <RightSection ref={rightSectionRef}>
          <Box sx={{ paddingBottom: '20px', backgroundColor: '#fff' }}>
            {selectedRegulation ? (
              <Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h5">
                    {`${selectedRegulation.title}`}
                  </Typography>
                  <Box>
                    <Button variant="contained" onClick={handlePrint} sx={{ marginRight: '10px' }}>
                      출력
                    </Button>
                  </Box>
                </Box>
                <ContentContainer ref={contentRef}>
                  {content}
                </ContentContainer>
              </Box>
            ) : (
              <Typography variant="h6">
                규정을 선택해주세요.
              </Typography>
            )}
          </Box>
        </RightSection>
      </Container>
    </PageWrapper>
  );
}

export default RMDStandardPage;
