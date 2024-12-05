import React from 'react';
import { AppShell, Flex, Grid } from '@mantine/core';
import Header from './components/Header';
import ScrollyContainer from './components/ScrollyContainer';
import ScrollyRightPanel from './components/ScrollyRightPanel';
import ScrollySideBar from './components/ScrollySideBar';

const App: React.FC = () => {
  return (
    <AppShell header={{ height: 60 }} padding="md">
      <AppShell.Header>
        <Flex justify="start" align="center" h="100%" ml={24}>
          <Header />
        </Flex>
      </AppShell.Header>
      <AppShell.Main>
        <Grid>
          <Grid.Col span={3}>
            <ScrollySideBar />
          </Grid.Col>
          <Grid.Col span={6}>
            <ScrollyContainer />
          </Grid.Col>
          <Grid.Col span={3}>
            <ScrollyRightPanel />
          </Grid.Col>
        </Grid>
      </AppShell.Main>
    </AppShell>
  );
};

export default App;
