import React from 'react';
import { AppShell, Flex } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import AnimationContainer from './components/AnimationContainer';
import Header from './components/Header';
import ScrollyContainer from './components/ScrollyContainer';
import ScrollySideBar from './components/ScrollySideBar';
import { useScrollyStore } from './store';

const App: React.FC = () => {
  const isComponentWindowOpen = useScrollyStore((state) => state.isComponentWindowOpen);
  const [opened] = useDisclosure();

  return (
    <AppShell
      header={{ height: 60 }}
      padding="md"
      navbar={{ width: 300, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      aside={{ width: 300, breakpoint: 'md' }}
    >
      <AppShell.Header>
        <Flex justify="start" align="center" h="100%" ml={24}>
          <Header />
        </Flex>
      </AppShell.Header>
      <AppShell.Navbar p="md">
        <ScrollySideBar />
      </AppShell.Navbar>
      <AppShell.Main style={{ backgroundColor: '#f8f8f8' }}>
        {isComponentWindowOpen ? <ScrollyContainer /> : ''}
      </AppShell.Main>
      <AppShell.Aside p="md">
        <AnimationContainer />
      </AppShell.Aside>
    </AppShell>
  );
};

export default App;
