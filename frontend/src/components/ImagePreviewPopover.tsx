import { Button, Image, Popover } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

const ImagePreviewPopover: React.FC = () => {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <Popover opened={opened} onClose={close} position="bottom" withArrow shadow="md">
      <Popover.Target>
        <Button onMouseEnter={open} onMouseLeave={close}>
          Hover to see image preview
        </Button>
      </Popover.Target>
      <Popover.Dropdown>
        <Image
          src="https://via.placeholder.com/150"
          alt="Preview"
          radius="md"
          fit="contain"
          h={150}
          w={150}
        />
      </Popover.Dropdown>
    </Popover>
  );
};

export default ImagePreviewPopover;
