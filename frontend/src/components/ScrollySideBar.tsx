import { Box, Space, Title } from '@mantine/core';
import { useScrollyStore } from '../store';
import ScrollyAnimationCard from './ScrollyAnimationCard';
import ScrollyComponentCard from './ScrollyComponentCard';

const ScrollySideBar: React.FC = () => {
  const elements = useScrollyStore((state) => state.elements);

  return (
    <Box>
      <Title order={5}>Your Storyboard components ({elements.length - 1})</Title>
      <Space h="md" />
      {elements.map((element) => {
        if (element.type === 'animation') {
          return (
            <Box key={element.id}>
              <ScrollyAnimationCard {...element} />
            </Box>
          );
        } else if (element.type === 'component') {
          return (
            <Box key={element.id}>
              <ScrollyComponentCard {...element} />
            </Box>
          );
        }
        return null;
      })}
    </Box>
  );
};

export default ScrollySideBar;
