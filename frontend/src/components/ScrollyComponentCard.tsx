import { FC } from 'react';
import { Button, Card, Center, Modal, Space, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useScrollyStore } from '../store';

interface ScrollyComponentCardProps {
  id: string;
  isNew?: boolean;
  isOpen?: boolean;
}

const ScrollyComponentCard: FC<ScrollyComponentCardProps> = ({ id, isOpen }) => {
  const [isModalOpened, { open, close }] = useDisclosure(false);
  const setViewElement = useScrollyStore((state) => state.setViewElement);
  const removeElement = useScrollyStore((state) => state.removeElement);

  const getGradient = () => {
    if (isOpen) {
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
    <>
      <Text>Component {id}</Text>
      <Space h="lg" />
      <Center>
        <Button.Group>
          <Button
            onClick={() => {
              setViewElement(id, true);
            }}
            variant="gradient"
            gradient={getGradient()}
          >
            Edit
          </Button>
          <Button variant="subtle" color="red" onClick={open}>
            Delete
          </Button>
        </Button.Group>
      </Center>
    </>
  );
  return (
    <>
      <Card withBorder shadow="xl">
        {cardDisplay}
      </Card>
      <Modal
        centered
        opened={isModalOpened}
        onClose={close}
        title={`Are you sure you want to delete component ${id}? The animation (if any) will be removed as well`}
      >
        <Button
          color="red"
          onClick={() => {
            close();
            onDelete(id);
          }}
        >
          Delete
        </Button>
        <Button
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
