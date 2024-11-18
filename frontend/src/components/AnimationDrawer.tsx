import React from 'react';
import { Box, Button, Drawer, Stack, Title } from '@mantine/core';
import { useScrollyStore } from '../store';

const AnimationDrawer: React.FC = () => {
  const isAnimationWindowOpen = useScrollyStore((state) => state.isAnimationWindowOpen);
  const currentElementId = useScrollyStore((state) => state.currentElementId);
  const upsertData = useScrollyStore((state) => state.upsertData);
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
    <Drawer opened={isAnimationWindowOpen} onClose={onClose} position="right">
      <Stack>
        <Title order={2}>
          {targetElement.isNew ? `Create new animation` : `Edit animation ${currentElementId}`}
        </Title>
        <Box>Animation Content</Box>
        <Box style={{ position: 'fixed', bottom: 0, right: 0, padding: '12px' }}>
          <Button
            onClick={() => {
              onClose();
              upsertData(targetData);
              upsertElement(targetElement);
            }}
          >
            Save
          </Button>
        </Box>
      </Stack>
    </Drawer>
  );
};

export default AnimationDrawer;
