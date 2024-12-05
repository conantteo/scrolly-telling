import React from 'react';
import { Box, Button, Stack, Title } from '@mantine/core';
import { useScrollyStore } from '../store';

const AnimationDrawer: React.FC = () => {
  const currentElementId = useScrollyStore((state) => state.currentElementId);
  const setData = useScrollyStore((state) => state.setData);
  const upsertElement = useScrollyStore((state) => state.upsertElement);
  const setViewElement = useScrollyStore((state) => state.setViewElement);

  const elements = useScrollyStore((state) => state.elements);
  const data = useScrollyStore((state) => state.data);
  const targetElement = elements.find((element) => element.id === currentElementId) ?? {
    id: currentElementId,
    type: 'animation',
    isNew: true,
    isOpen: false,
  };
  const targetData = data.find((d) => d.id === currentElementId) ?? {
    id: currentElementId,
    type: 'animation',
    metadata: {},
  };
  const onClose = () => {
    setViewElement(currentElementId, false);
  };
  return (
    <Stack>
      <Title order={2}>
        {targetElement.isNew ? `Create new animation` : `Edit animation ${currentElementId}`}
      </Title>
      <Box>Animation Content</Box>
      <Box style={{ position: 'fixed', bottom: 0, right: 0, padding: '12px' }}>
        <Button
          onClick={() => {
            onClose();
            setData(currentElementId, targetData);
            upsertElement(targetElement);
          }}
        >
          Save
        </Button>
      </Box>
    </Stack>
  );
};

export default AnimationDrawer;
