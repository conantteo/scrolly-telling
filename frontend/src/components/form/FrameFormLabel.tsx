import { IconTrash } from '@tabler/icons-react';
import { Accordion, ActionIcon, Center, Group, Text, Tooltip } from '@mantine/core';
import { ScrollyFrame } from '../../types';

interface FrameFormLabelProps {
  frameIndex: number;
  currentFrameId: number;
  currentFrames: ScrollyFrame[];
  setCurrentFrameId: (frameId: number) => void;
  onRemoveFrame: (frameIndex: number) => void;
}

const FrameFormLabel: React.FC<FrameFormLabelProps> = ({
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
      <Tooltip label="Delete this frame. Other frames will be unaffected.">
        <ActionIcon size="lg" variant="subtle" color="red">
          <IconTrash onClick={() => onRemoveFrame(frameIndex)} />
        </ActionIcon>
      </Tooltip>
    ) : null}
  </Center>
);

export default FrameFormLabel;
