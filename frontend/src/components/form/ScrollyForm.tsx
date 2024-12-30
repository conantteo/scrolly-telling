import { useEffect, useState } from 'react';
import { IconDeviceFloppy, IconPlaylistAdd, IconX } from '@tabler/icons-react';
import _ from 'lodash';
import {
  Accordion,
  ActionIcon,
  Box,
  Button,
  Divider,
  Group,
  Radio,
  Select,
  Space,
  Stack,
  Title,
  Tooltip,
} from '@mantine/core';
import { useScrollyStore } from '../../store';
import {
  LEFT_RIGHT,
  ScrollyComponent,
  ScrollyContainerElementProps,
  ScrollyFrame,
  ScrollyPage,
  SINGLE,
  TOP_BOTTOM,
} from '../../types';
import FrameFormLabel from './FrameFormLabel';
import ScrollyComponentForm from './ScrollyComponentForm';

const PINNABLE_LAYOUTS = [SINGLE, LEFT_RIGHT, TOP_BOTTOM];
const DEFAULT_LAYOUTS = [SINGLE];

const LEFT_RIGHT_TEMPLATE_ORDER = ['left', 'right'] as const;
const TOP_BOTTOM_TEMPLATE_ORDER = ['top', 'bottom'] as const;
const SINGLE_TEMPLATE_ORDER = ['center'] as const;

const LAYOUT_TEMPLATES = {
  [LEFT_RIGHT]: LEFT_RIGHT_TEMPLATE_ORDER,
  [TOP_BOTTOM]: TOP_BOTTOM_TEMPLATE_ORDER,
  [SINGLE]: SINGLE_TEMPLATE_ORDER,
};

const DEFAULT_ANIMATION_FORM_DATA = 'fade';

const ScrollyForm: React.FC = () => {
  const currentElementId = useScrollyStore((state) => state.currentElementId);
  const setCurrentElementId = useScrollyStore((state) => state.setCurrentElementId);
  const elements = useScrollyStore((state) => state.elements);
  const appendDefaultElement = useScrollyStore((state) => state.appendDefaultElement);
  const setElement = useScrollyStore((state) => state.setElement);
  const pages = useScrollyStore((state) => state.pages);
  const setPage = useScrollyStore((state) => state.setPage);

  const existingElement = elements.find((element) => element.id === currentElementId);
  const currentElement: ScrollyContainerElementProps = existingElement ?? {
    id: currentElementId ?? `${elements.length}`,
    isNew: true,
  };

  const UNASSIGNED_ID = `-1`;

  const DEFAULT_COMPONENT_FORM_DATA: ScrollyComponent = {
    id: UNASSIGNED_ID,
    type: 'text',
    position: LAYOUT_TEMPLATES.single[0],
    animation: DEFAULT_ANIMATION_FORM_DATA,
  };

  const DEFAULT_FRAME_FORM_DATA_FOR_LEFT_RIGHT: ScrollyFrame = {
    id: UNASSIGNED_ID,
    components: [
      { ...DEFAULT_COMPONENT_FORM_DATA, position: 'left' },
      { ...DEFAULT_COMPONENT_FORM_DATA, position: 'right' },
    ],
  };

  const DEFAULT_FRAME_FORM_DATA_FOR_TOP_BOTTOM: ScrollyFrame = {
    id: UNASSIGNED_ID,
    components: [
      { ...DEFAULT_COMPONENT_FORM_DATA, position: 'top' },
      { ...DEFAULT_COMPONENT_FORM_DATA, position: 'bottom' },
    ],
  };

  const DEFAULT_FRAME_FORM_DATA_FOR_SINGLE: ScrollyFrame = {
    id: UNASSIGNED_ID,
    components: [DEFAULT_COMPONENT_FORM_DATA],
  };

  const DEFAULT_SINGLE_PAGE_FORM_DATA: ScrollyPage = {
    id: currentElement.id,
    pinnable: false,
    layout: {
      template: SINGLE,
    },
    frames: [DEFAULT_FRAME_FORM_DATA_FOR_SINGLE],
  };

  const [currentFrameId, setCurrentFrameId] = useState(0);
  const [modifiedPage, setModifiedPage] = useState<ScrollyPage>({
    ...DEFAULT_SINGLE_PAGE_FORM_DATA,
  });
  const [formError, setFormError] = useState({ type: '', file: '' });
  const formHasError = Object.keys(formError).every(
    (key) => formError[key as keyof typeof formError]
  );

  useEffect(() => {
    if (currentElementId) {
      const page =
        pages.find((_d, index) => index === Number(currentElement.id)) ??
        DEFAULT_SINGLE_PAGE_FORM_DATA;
      setModifiedPage(_.cloneDeep(page));
    }
  }, [pages, currentElementId]);

  const onReset = () => {
    if (currentElementId) {
      if (currentElement.isNew) {
        appendDefaultElement();
        setElement(currentElementId, { ..._.cloneDeep(currentElement), isNew: false });
      }
    }
    setCurrentElementId(null);
    setModifiedPage(_.cloneDeep(DEFAULT_SINGLE_PAGE_FORM_DATA));
  };

  const onSave = () => {
    if (currentElementId) {
      const updatedPage = _.cloneDeep(modifiedPage);
      setPage(currentElementId, updatedPage);
    }
    onReset();
  };

  const onRemoveFrame = (frameIndex: number) => {
    const updatedPage = _.cloneDeep(modifiedPage);
    const frames = updatedPage.frames;
    if (frameIndex >= 0 && frameIndex < frames.length) {
      _.pullAt(frames, [frameIndex]);
    }
    setModifiedPage(updatedPage);
    setCurrentFrameId(0);
  };

  const onNextFrame = () => {
    const updatedPage = _.cloneDeep(modifiedPage);
    if (updatedPage.layout.template === LEFT_RIGHT) {
      updatedPage.frames.push(DEFAULT_FRAME_FORM_DATA_FOR_LEFT_RIGHT);
    } else if (updatedPage.layout.template === TOP_BOTTOM) {
      updatedPage.frames.push(DEFAULT_FRAME_FORM_DATA_FOR_TOP_BOTTOM);
    } else {
      updatedPage.frames.push(DEFAULT_FRAME_FORM_DATA_FOR_SINGLE);
    }
    setModifiedPage(updatedPage);
    setCurrentFrameId(updatedPage.frames.length - 1);
  };

  const onPinnedValueChanged = (value: string) => {
    const updatedPage = _.cloneDeep(modifiedPage);
    if (value === 'yes') {
      updatedPage.frames = [DEFAULT_FRAME_FORM_DATA_FOR_SINGLE];
      setModifiedPage({
        ...updatedPage,
        pinnable: true,
        layout: {
          template: SINGLE,
        },
      });
    } else {
      updatedPage.frames = [DEFAULT_FRAME_FORM_DATA_FOR_SINGLE];
      setModifiedPage({ ...updatedPage, pinnable: false, layout: { template: SINGLE } });
    }
  };

  return (
    <Stack gap="xs">
      <Group justify="space-between">
        <Title order={2}>
          {currentElement.isNew
            ? `Create new page`
            : `Edit page ${_.toNumber(currentElementId) + 1}`}
        </Title>
        <Group>
          {modifiedPage.pinnable ? (
            <Tooltip label="Add multiple frames to one page to view them sequentially">
              <Button
                size="xs"
                leftSection={<IconPlaylistAdd />}
                color="teal"
                onClick={onNextFrame}
              >
                Add Frame
              </Button>
            </Tooltip>
          ) : null}
          <Tooltip label="Close this form without saving">
            <ActionIcon size="lg" variant="subtle" color="red">
              <IconX onClick={() => setCurrentElementId(null)} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Group>
      <Box>
        <Radio.Group
          label="Add multiple frames to this page for scrolly content?"
          description="Stack multiple frames to create scrolly content."
          value={modifiedPage.pinnable ? 'yes' : 'no'}
          onChange={onPinnedValueChanged}
        >
          <Group mt="xs">
            <Radio label="Yes" value="yes" />
            <Radio label="No" value="no" />
          </Group>
        </Radio.Group>
      </Box>
      <Select
        label="Type of layout"
        placeholder="Select a layout"
        description="Layout determines how your content are placed. If you want multiple content in the same frame, you can choose to pin your frame above."
        data={modifiedPage.pinnable ? PINNABLE_LAYOUTS : DEFAULT_LAYOUTS}
        searchable
        clearable
        value={modifiedPage.layout.template ?? ''}
        onChange={(value) => {
          const updatedPage = _.cloneDeep(modifiedPage);
          if (value === TOP_BOTTOM) {
            setModifiedPage({
              ...updatedPage,
              frames: [DEFAULT_FRAME_FORM_DATA_FOR_TOP_BOTTOM],
              layout: { ...updatedPage.layout, template: value },
            });
          } else if (value === LEFT_RIGHT) {
            setModifiedPage({
              ...updatedPage,
              frames: [DEFAULT_FRAME_FORM_DATA_FOR_LEFT_RIGHT],
              layout: { ...updatedPage.layout, template: value },
            });
          } else {
            setModifiedPage({
              ...updatedPage,
              frames: [DEFAULT_FRAME_FORM_DATA_FOR_SINGLE],
              layout: {
                ...updatedPage.layout,
                template: SINGLE,
              },
            });
          }
        }}
      />
      <Accordion defaultValue="0" value={`${currentFrameId}`} variant="contained">
        {modifiedPage.frames.map((frame, frameIndex) => (
          <Accordion.Item key={frameIndex} value={`${frameIndex}`}>
            <FrameFormLabel
              frameIndex={frameIndex}
              currentFrameId={currentFrameId}
              currentFrames={modifiedPage.frames}
              setCurrentFrameId={setCurrentFrameId}
              onRemoveFrame={onRemoveFrame}
            />
            <Accordion.Panel>
              <Stack>
                {frame.components.map((component, componentIndex) => (
                  <Box key={componentIndex}>
                    <Box>
                      <Space h="xs" />
                      <Title size="h5">
                        {_.upperFirst(component.position)}: {_.upperFirst(component.type)}
                      </Title>
                      <ScrollyComponentForm
                        layoutTemplates={LAYOUT_TEMPLATES[modifiedPage.layout.template]}
                        formError={formError}
                        setFormError={setFormError}
                        component={component}
                        currentComponents={modifiedPage.frames.flatMap(
                          (frame) => frame.components || []
                        )}
                        setComponent={(componentData) => {
                          const updatedPage = _.cloneDeep(modifiedPage);
                          updatedPage.frames[frameIndex].components[componentIndex] = componentData;
                          setModifiedPage(updatedPage);
                        }}
                        defaultComponent={DEFAULT_COMPONENT_FORM_DATA}
                      />
                    </Box>
                    <Divider />
                  </Box>
                ))}
              </Stack>
            </Accordion.Panel>
          </Accordion.Item>
        ))}
      </Accordion>
      <Box style={{ position: 'fixed', bottom: 0, right: 0, padding: '24px', zIndex: 1 }}>
        <Tooltip label="Click here to save your changes for current page. You can still edit afterwards.">
          <Button leftSection={<IconDeviceFloppy />} disabled={formHasError} onClick={onSave}>
            Save Page
          </Button>
        </Tooltip>
      </Box>
    </Stack>
  );
};

export default ScrollyForm;
