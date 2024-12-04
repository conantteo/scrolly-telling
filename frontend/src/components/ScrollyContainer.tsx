import { useEffect } from 'react';
import { Grid, Paper } from '@mantine/core';
import { useScrollyStore } from '../store';

const ScrollyContainer: React.FC = () => {
  const elements = useScrollyStore((state) => state.elements);
  const data = useScrollyStore((state) => state.data);
  const currentElementId = useScrollyStore((state) => state.currentElementId);

  const targetData = data.find((d) => d.id === currentElementId) ?? {
    id: currentElementId,
    type: 'component',
    metadata: {},
  };

  useEffect(() => {
    console.log(currentElementId);
    console.log(data.find((d) => d.id === currentElementId));
  }, [data]);

  const viewableElements = [...elements];
  viewableElements.pop();
  console.log(targetData.metadata['numColumns']);
  return (
    <Paper p="sm">
      <Grid
        columns={
          'numColumns' in targetData.metadata ? Number(targetData.metadata['numColumns']) : 1
        }
      >
        {[...Array(targetData.metadata.numColumns)].map((_, v) => (
          <Grid.Col span={1} key={v}>
            Configure on the animations pane first
          </Grid.Col>
        ))}
      </Grid>
    </Paper>
  );
};

export default ScrollyContainer;
