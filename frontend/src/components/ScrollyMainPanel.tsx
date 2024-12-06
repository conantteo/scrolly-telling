import { Card, Space, Stack, Title } from '@mantine/core';
import { useScrollyStore } from '../store';
import { ScrollyComponent } from '../types';

const ScrollyMainPanel: React.FC = () => {
  const data = useScrollyStore((state) => state.data);

  const renderContainerItem = (item: ScrollyComponent) => {
    if (item.metadata.type === 'text') {
      return <div dangerouslySetInnerHTML={{ __html: item.metadata.content }} />;
    }
    if (item.metadata.type === 'image') {
      return <div>Preview Image Here</div>;
    }
  };

  return (
    <>
      <Title order={1}>Showing {data.length - 1 < 0 ? 0 : data.length - 1} storyboard items:</Title>
      <Space h="xl" />
      <Stack align="stretch" justify="center" gap="xs">
        {data.map((element) => (
          <Card key={element.id} withBorder shadow="xl">
            {renderContainerItem(element)}
          </Card>
        ))}
      </Stack>
    </>
  );
};

export default ScrollyMainPanel;
