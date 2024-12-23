import { IconTrash } from '@tabler/icons-react';
import { Accordion, ActionIcon, Center, Group, Text } from '@mantine/core';
import { ScrollyFrame } from '../types';

interface FrameControlProps {
  frameIndex: number;
  currentFrameId: number;
  currentFrames: ScrollyFrame[];
  setCurrentFrameId: (frameId: number) => void;
  onRemoveFrame: (frameIndex: number) => void;
}

const FrameControl: React.FC<FrameControlProps> = ({
  frameIndex,
  currentFrameId,
  currentFrames,
  setCurrentFrameId,
  onRemoveFrame,
}) => (
  <Center>
    <Accordion.Control
      onClick={() => setCurrentFrameId(currentFrameId !== frameIndex ? frameIndex : -1)}
    >
      <Group>
        <Text fw={750}>{`Frame ${frameIndex + 1}`}</Text>
      </Group>
    </Accordion.Control>
    {currentFrames.length > 1 ? (
      <ActionIcon size="lg" variant="subtle" color="red">
        <IconTrash onClick={() => onRemoveFrame(frameIndex)} />
      </ActionIcon>
    ) : null}
  </Center>
);

export default FrameControl;
