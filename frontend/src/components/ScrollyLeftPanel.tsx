import { IconPlus } from '@tabler/icons-react';
import { Box, Button, Center } from '@mantine/core';
import { useScrollyStore } from '../store';
import { ScrollyContainerElementProps } from '../types';
import ScrollyComponentCard from './ScrollyComponentCard';

const ScrollyLeftPanel: React.FC = () => {
  const elements = useScrollyStore((state) => state.elements);
  const setElement = useScrollyStore((state) => state.setElement);
  const setCurrentElementId = useScrollyStore((state) => state.setCurrentElementId);
  const onCreateNew = (element: ScrollyContainerElementProps) => {
    setElement(element.id, { ...element });
    setCurrentElementId(element.id);
  };
  return (
    <Box>
      {elements.map((element) => {
        if (element.isNew) {
          return (
            <Center key={element.id}>
              <Button leftSection={<IconPlus />} onClick={() => onCreateNew(element)} color="blue">
                New
              </Button>
            </Center>
          );
        }
        return (
          <Box key={element.id} py={8}>
            <ScrollyComponentCard {...element} />
          </Box>
        );
      })}
    </Box>
  );
};

export default ScrollyLeftPanel;
