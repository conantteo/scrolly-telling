import { FC } from 'react';
import { IconInfoSquare } from '@tabler/icons-react';
import _ from 'lodash';
import { Box, Button, Card, Center, Modal, Stack, Tooltip } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useScrollyStore } from '../../store';
import CardBody from './CardBody';
import CardLabel from './CardLabel';

interface ScrollyComponentCardProps {
  id: string;
}

const ScrollyComponentCard: FC<ScrollyComponentCardProps> = ({ id }) => {
  const [isModalOpened, { open, close }] = useDisclosure(false);
  const currentElementId = useScrollyStore((state) => state.currentElementId);
  const setCurrentElementId = useScrollyStore((state) => state.setCurrentElementId);
  const removeElement = useScrollyStore((state) => state.removeElement);
  const isCurrent = currentElementId === id;
  const pages = useScrollyStore((state) => state.pages);
  const pageItem = pages[_.toNumber(id)];
  const frames = pageItem.frames;
  const components = frames.flatMap((frame) => frame.components || []);
  const imageComponents = components.filter((component) => component.type === 'image');
  const textComponents = components.filter((component) => component.type === 'text');
  const htmlComponents = components.filter((component) => component.type === 'html');
  const currentScrollyFocusElement = useScrollyStore((state) => state.currentElementId);

  const getGradient = () => {
    if (isCurrent) {
      return {
        from: 'red',
        to: 'orange',
        deg: 90,
      };
    }
    return {
      from: 'blue',
      to: 'cyan',
      deg: 90,
    };
  };

  const onDelete = (deletedId: string) => {
    removeElement(deletedId);
  };

  const cardDisplay = (
    <Center mt={8}>
      <Button.Group>
        <Tooltip label="Edit this page">
          <Button
            size="sm"
            onClick={() => {
              setCurrentElementId(id);
            }}
            variant="gradient"
            gradient={getGradient()}
          >
            Edit
          </Button>
        </Tooltip>
        <Tooltip label="Delete this page">
          <Button size="sm" variant="subtle" color="red" onClick={open}>
            Delete
          </Button>
        </Tooltip>
      </Button.Group>
    </Center>
  );
  return (
    <>
      <Card withBorder shadow="xl">
        <CardLabel
          label={`Page ${_.toNumber(id) + 1}`}
          backgroundColor={currentScrollyFocusElement === id ? '#a5d8ff' : '#d0ebff'}
        />
        <CardLabel
          label={
            <Tooltip
              label={
                <Stack gap={0}>
                  <Box>{frames.length} Frame(s)</Box>
                  <Box>{textComponents.length} Text(s)</Box>
                  <Box>{imageComponents.length} Image(s)</Box>
                  <Box>{htmlComponents.length} HTML</Box>
                </Stack>
              }
              position="right"
            >
              <IconInfoSquare />
            </Tooltip>
          }
          position="right"
          backgroundColor="#fff"
        />
        <CardBody>{cardDisplay}</CardBody>
      </Card>
      <Modal
        centered
        opened={isModalOpened}
        onClose={close}
        title={`Are you sure you want to delete page ${id}? All the frames/components within this page will be removed.`}
      >
        <Button
          size="sm"
          color="red"
          onClick={() => {
            close();
            onDelete(id);
          }}
        >
          Delete
        </Button>
        <Button
          size="sm"
          variant="subtle"
          onClick={() => {
            close();
          }}
        >
          Cancel
        </Button>
      </Modal>
    </>
  );
};

export default ScrollyComponentCard;
