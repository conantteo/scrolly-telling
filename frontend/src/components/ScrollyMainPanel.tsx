import _ from 'lodash';
import { Box, Card, Group, Space, Stack, Title } from '@mantine/core';
import { useScrollyStore } from '../store';
import { LEFT_RIGHT, ScrollyComponent, ScrollyFrame, ScrollyPage, TOP_BOTTOM } from '../types';
import CardBody from './card/CardBody';
import CardLabel from './card/CardLabel';
import ScrollyComponentDisplay from './card/ScrollyComponentDisplay';

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
  const pages = useScrollyStore((state) => state.pages);

  const reorderComponents = (components: ScrollyComponent[], layoutTemplate: string) => {
    let orderMap: { [key: string]: number } = {};
    if (layoutTemplate === LEFT_RIGHT) {
      orderMap = LEFT_RIGHT_ORDER_MAP;
    } else if (layoutTemplate === TOP_BOTTOM) {
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
    return layoutTemplate === TOP_BOTTOM ? (
      <Stack align="stretch" justify="center" gap="xs">
        {components.map((component, componentIndex) => (
          <ScrollyComponentDisplay key={componentIndex} component={component} />
        ))}
      </Stack>
    ) : (
      <Group grow>
        {components.map((component, componentIndex) => (
          <ScrollyComponentDisplay key={componentIndex} component={component} />
        ))}
      </Group>
    );
  };

  const renderPage = (page: ScrollyPage) => {
    if (!page.frames) {
      return null;
    }
    return page.frames.map((frame, frameIndex) => (
      <Box key={frameIndex} mt={8}>
        <Card withBorder shadow="xl">
          <CardLabel label={`Frame ${_.toNumber(frameIndex) + 1}`} />
          <CardBody>{renderFrame(frame, page.layout.template)}</CardBody>
        </Card>
      </Box>
    ));
  };

  const components = pages.flatMap((page) =>
    page.frames.flatMap((frame) => frame.components || [])
  );
  const imageComponents = components.filter((component) => component.type === 'image');
  const textComponents = components.filter((component) => component.type === 'text');

  return (
    <>
      <Group justify="space-between">
        <Title order={2}>Showing {pages.length} pages</Title>
        <Title order={5}>
          {imageComponents.length} images + {textComponents.length} text content
        </Title>
      </Group>
      <Space h="md" />
      <Stack align="stretch" justify="center" gap="xs">
        {pages.map((page) => (
          <Card key={page.id} withBorder shadow="xl">
            <CardLabel label={`Page ${_.toNumber(page.id) + 1}`} />
            <CardBody>{renderPage(page)}</CardBody>
          </Card>
        ))}
      </Stack>
    </>
  );
};

export default ScrollyMainPanel;
