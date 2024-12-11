import { Card, Image, Space, Stack, Title } from '@mantine/core';
import { useScrollyStore } from '../store';
import { ScrollyComponent } from '../types';

const ScrollyMainPanel: React.FC = () => {
  const data = useScrollyStore((state) => state.data);

  const renderContainerItem = (item: ScrollyComponent) => {
    if (item.type === 'text') {
      return <div dangerouslySetInnerHTML={{ __html: item.metadata?.htmlContent ?? '' }} />;
    }
    if (item.type === 'image') {
      return <Image src={item.metadata?.fileBase64} />;
    }
  };

  return (
    <>
      <Title order={1}>Showing {data.length} storyboard items:</Title>
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
