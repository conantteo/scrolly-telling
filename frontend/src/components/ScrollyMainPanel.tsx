import { AspectRatio, Box, Card, Group, Image, Space, Stack, Title } from '@mantine/core';
import { useScrollyStore } from '../store';
import { ScrollyComponent, ScrollyFrame, ScrollyPage } from '../types';

const LEFT_RIGHT_ORDER_MAP = {
  left: 0,
  right: 1,
};

const TOP_BOTTOM_ORDER_MAP = {
  top: 0,
  bottom: 1,
};

const SINGLE_ORDER_MAP = {
  left: 0,
  center: 0,
  right: 0,
};

const ScrollyMainPanel: React.FC = () => {
  const data = useScrollyStore((state) => state.pages);

  const renderComponent = (component: ScrollyComponent) => {
    if (component.type === 'text') {
      return <div dangerouslySetInnerHTML={{ __html: component.metadata?.htmlContent ?? '' }} />;
    }
    if (component.type === 'image') {
      return (
        <AspectRatio ratio={1080 / 720} maw={500} mx="auto">
          <Image src={component.metadata?.fileBase64} />
        </AspectRatio>
      );
    }
  };

  const reorderComponents = (components: ScrollyComponent[], layoutTemplate: string) => {
    let orderMap: { [key: string]: number } = {};
    if (layoutTemplate === 'left-right') {
      orderMap = LEFT_RIGHT_ORDER_MAP;
    } else if (layoutTemplate === 'top-bottom') {
      orderMap = TOP_BOTTOM_ORDER_MAP;
    } else {
      orderMap = SINGLE_ORDER_MAP;
    }
    return components.sort((a, b) => {
      return (orderMap[b.position] || Infinity) - (orderMap[a.position] || Infinity);
    });
  };

  const renderFrame = (frame: ScrollyFrame, layoutTemplate: string) => {
    const components = reorderComponents(frame.components, layoutTemplate);
    return layoutTemplate === 'top-bottom' ? (
      <Stack align="stretch" justify="center" gap="xs">
        {components.map((component, componentIndex) => (
          <Box key={componentIndex}>{renderComponent(component)}</Box>
        ))}
      </Stack>
    ) : (
      <Group grow>
        {components.map((component, componentIndex) => (
          <Box key={componentIndex}>{renderComponent(component)}</Box>
        ))}
      </Group>
    );
  };

  const renderPage = (page: ScrollyPage) => {
    if (!page.frames) {
      return null;
    }
    return page.frames.map((frame, frameIndex) => (
      <Box key={frameIndex} pt={4} pb={4}>
        <Card withBorder shadow="xl">
          {renderFrame(frame, page.layout.template)}
        </Card>
      </Box>
    ));
  };

  return (
    <>
      <Title order={1}>Showing {data.length} storyboard items:</Title>
      <Space h="xl" />
      <Stack align="stretch" justify="center" gap="xs">
        {data.map((element) => (
          <Card key={element.id} withBorder shadow="xl">
            {renderPage(element)}
          </Card>
        ))}
      </Stack>
    </>
  );
};

export default ScrollyMainPanel;
