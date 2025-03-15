import React, { useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { AppShell, Box, Flex, Group } from '@mantine/core';
import DownloadButton from './components/button/DownloadButton';
import LoadPayloadButton from './components/button/LoadPayloadButton';
import ResetButton from './components/button/ResetButton';
import Header from './layout/Header';
import ScrollyLeftPanel from './layout/ScrollyLeftPanel';
import ScrollyMainPanel from './layout/ScrollyMainPanel';
import ScrollyRightPanel from './layout/ScrollyRightPanel';
import { useScrollyStore } from './store';
import { getArticleFromLocalStorage } from './util/localStorageUtil';

const App: React.FC = () => {
  const setArticleId = useScrollyStore((state) => state.setArticleId);
  const setArticleTitle = useScrollyStore((state) => state.setArticleTitle);
  const setPages = useScrollyStore((state) => state.setPages);

  useEffect(() => {
    const article = getArticleFromLocalStorage();
    if (article === null) {
      const articleId = uuidv4();
      setArticleId(articleId);
    } else {
      if (article.articleId) {
        setArticleId(article.articleId);
      }
      if (article.title) {
        setArticleTitle(article.title);
      }
      if (article.pages) {
        setPages(article.pages);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AppShell
      header={{ height: 60 }}
      padding="md"
      navbar={{ collapsed: { desktop: false }, width: 250, breakpoint: 'sm' }}
      aside={{ collapsed: { desktop: false }, width: 750, breakpoint: 'sm' }}
    >
      <AppShell.Header>
        <Flex justify="space-between" align="center" h="100%" ml={24} mr={24}>
          <Header />
          <Box>
            <Group>
              <LoadPayloadButton />
              <ResetButton />
              <DownloadButton />
            </Group>
          </Box>
        </Flex>
      </AppShell.Header>
      <AppShell.Navbar
        withBorder
        p={16}
        style={{
          overflowY: 'scroll',
          scrollbarWidth: 'none',
        }}
      >
        <ScrollyLeftPanel />
      </AppShell.Navbar>
      <AppShell.Main
        style={{
          backgroundColor: '#f8f8f8',
          overflowY: 'scroll',
          scrollbarWidth: 'none',
        }}
        h="calc(100vh - 92px)"
      >
        <ScrollyMainPanel />
      </AppShell.Main>
      <AppShell.Aside
        p={24}
        style={{
          overflowY: 'scroll',
          overflowX: 'hidden',
        }}
      >
        <ScrollyRightPanel />
      </AppShell.Aside>
    </AppShell>
  );
};

export default App;
