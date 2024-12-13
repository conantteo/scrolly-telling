import React from 'react';
import { AppShell, Flex } from '@mantine/core';
import Header from './components/Header';
import ScrollyLeftPanel from './components/ScrollyLeftPanel';
import ScrollyMainPanel from './components/ScrollyMainPanel';
import ScrollyRightPanel from './components/ScrollyRightPanel';

const App: React.FC = () => {
  return (
    <AppShell
      header={{ height: 60 }}
      padding="md"
      navbar={{ collapsed: { desktop: false }, width: 250, breakpoint: 'sm' }}
      aside={{ collapsed: { desktop: false }, width: 500, breakpoint: 'sm' }}
    >
      <AppShell.Header>
        <Flex justify="start" align="center" h="100%" ml={24}>
          <Header />
        </Flex>
      </AppShell.Header>
      <AppShell.Navbar
        withBorder
        p={8}
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
        p={8}
        style={{
          overflowY: 'scroll',
          overflowX: 'hidden',
          scrollbarWidth: 'none',
        }}
      >
        <ScrollyRightPanel />
      </AppShell.Aside>
    </AppShell>
  );
};

export default App;
