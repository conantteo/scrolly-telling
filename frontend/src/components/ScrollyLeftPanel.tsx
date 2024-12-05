import { useState } from 'react';
import { IconClick, IconComponents, IconPlus } from '@tabler/icons-react';
import { Box, Button, Center, Group } from '@mantine/core';
import { useScrollyStore } from '../store';
import { ScrollyContainerElementProps } from '../types';
import ScrollyAnimationCard from './ScrollyAnimationCard';
import ScrollyComponentCard from './ScrollyComponentCard';

const ScrollyLeftPanel: React.FC = () => {
  const elements = useScrollyStore((state) => state.elements);
  const setElement = useScrollyStore((state) => state.setElement);
  const setViewElement = useScrollyStore((state) => state.setViewElement);
  const [buttonState, setButtonState] = useState<'initial' | 'expanded'>('initial');
  const onCreateNew = (element: ScrollyContainerElementProps) => {
    setElement(element.id, { ...element });
    setButtonState('initial');
    setViewElement(element.id, true);
  };
  return (
    <Box>
      {elements.map((element) => {
        if (element.isNew) {
          return buttonState === 'initial' ? (
            <Center key={element.id}>
              <Button
                leftSection={<IconPlus />}
                onClick={() => setButtonState('expanded')}
                color="blue"
              >
                New
              </Button>
            </Center>
          ) : (
            <Center key={element.id}>
              <Group>
                <Button
                  leftSection={<IconComponents />}
                  color="green"
                  onClick={() => onCreateNew({ ...element, type: 'component', isOpen: true })}
                >
                  Component
                </Button>
                <Button
                  leftSection={<IconClick />}
                  color="purple"
                  onClick={() => onCreateNew({ ...element, type: 'animation', isOpen: true })}
                >
                  Animation
                </Button>
              </Group>
            </Center>
          );
        } else if (element.type === 'animation') {
          return (
            <Box key={element.id}>
              <ScrollyAnimationCard {...element} />
            </Box>
          );
        } else if (element.type === 'component') {
          return (
            <Box key={element.id} py={8}>
              <ScrollyComponentCard {...element} />
            </Box>
          );
        }
        return null;
      })}
    </Box>
  );
};

export default ScrollyLeftPanel;
