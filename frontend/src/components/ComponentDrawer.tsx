import { Box, Button, Drawer, Stack, Title } from '@mantine/core';
import { useScrollyStore } from '../store';

const ComponentDrawer: React.FC = () => {
  const isComponentWindowOpen = useScrollyStore((state) => state.isComponentWindowOpen);
  const currentElementId = useScrollyStore((state) => state.currentElementId);

  const upsertData = useScrollyStore((state) => state.upsertData);
  const upsertElement = useScrollyStore((state) => state.upsertElement);
  const setViewElement = useScrollyStore((state) => state.setViewElement);

  const elements = useScrollyStore((state) => state.elements);
  const data = useScrollyStore((state) => state.data);
  const targetElement = elements.find((element) => element.id === currentElementId) ?? {
    id: currentElementId,
    type: 'component',
    isNew: true,
    isOpen: false,
  };
  const targetData = data.find((d) => d.id === currentElementId) ?? {
    id: currentElementId,
    type: 'component',
    metadata: {},
  };
  const onClose = () => {
    setViewElement(currentElementId, false);
  };
  return (
    <Drawer opened={isComponentWindowOpen} onClose={onClose} position="right" size="xl">
      <Stack>
        <Title order={2}>
          {targetElement.isNew ? `Create new component` : `Edit component ${currentElementId}`}
        </Title>
        <Box>Component Content</Box>
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

export default ComponentDrawer;
