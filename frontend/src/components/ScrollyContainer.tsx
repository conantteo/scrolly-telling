import { Card, Space, Stack, Title } from '@mantine/core';
import { useScrollyStore } from '../store';

const ScrollyContainer: React.FC = () => {
  const elements = useScrollyStore((state) => state.elements);
  const data = useScrollyStore((state) => state.data);

  console.log({ elements, data });
  const viewableElements = [...elements];
  viewableElements.pop();
  return (
    <>
      <Title order={1}>Showing {elements.length - 1} storyboard items:</Title>
      <Space h="xl" />
      <Stack align="stretch" justify="center" gap="xs">
        {viewableElements.map((element) => (
          <Card key={element.id} withBorder shadow="xl">
            <div>
              {element.type === 'component' ? 'Component' : 'Animation'} {element.id}
            </div>
          </Card>
        ))}
      </Stack>
    </>
  );
};

export default ScrollyContainer;
