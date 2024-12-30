import { useEffect, useState } from 'react';
import { IconDeviceFloppy, IconPlaylistAdd } from '@tabler/icons-react';
import _ from 'lodash';
import {
  Accordion,
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
  ScrollyComponent,
  ScrollyContainerElementProps,
  ScrollyFrame,
  ScrollyPage,
} from '../../types';
import FrameFormLabel from './FrameFormLabel';
import ScrollyComponentForm from './ScrollyComponentForm';

const PINNABLE_LAYOUTS = ['single', 'left-right', 'top-bottom'];
const DEFAULT_LAYOUTS = ['single'];

const LEFT_RIGHT_TEMPLATE = ['left', 'right'] as const;
const TOP_BOTTOM_TEMPLATE = ['top', 'bottom'] as const;
const SINGLE_TEMPLATE = ['center'] as const;

const LAYOUT_TEMPLATES = {
  'left-right': LEFT_RIGHT_TEMPLATE,
  'top-bottom': TOP_BOTTOM_TEMPLATE,
  single: SINGLE_TEMPLATE,
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

  const DEFAULT_COMPONENT_FORM_DATA: ScrollyComponent = {
    id: `-1`,
    type: 'text',
    position: LAYOUT_TEMPLATES.single[0],
    animation: DEFAULT_ANIMATION_FORM_DATA,
  };

  const DEFAULT_FRAME_FORM_DATA_FOR_LEFT_RIGHT: ScrollyFrame = {
    id: `-1`,
    components: [
      { ...DEFAULT_COMPONENT_FORM_DATA, position: 'left' },
      { ...DEFAULT_COMPONENT_FORM_DATA, position: 'right' },
    ],
  };

  const DEFAULT_FRAME_FORM_DATA_FOR_TOP_BOTTOM: ScrollyFrame = {
    id: `-1`,
    components: [
      { ...DEFAULT_COMPONENT_FORM_DATA, position: 'top' },
      { ...DEFAULT_COMPONENT_FORM_DATA, position: 'bottom' },
    ],
  };

  const DEFAULT_FRAME_FORM_DATA_FOR_SINGLE: ScrollyFrame = {
    id: `-1`,
    components: [DEFAULT_COMPONENT_FORM_DATA],
  };

  const DEFAULT_PINNED_FRAME_FORM_DATA: ScrollyFrame = {
    id: `-1`,
    components: [DEFAULT_COMPONENT_FORM_DATA],
  };

  const DEFAULT_SINGLE_PAGE_FORM_DATA: ScrollyPage = {
    id: currentElement.id,
    pinnable: false,
    layout: {
      template: 'single',
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
    if (updatedPage.layout.template === 'single') {
      updatedPage.frames.push(DEFAULT_FRAME_FORM_DATA_FOR_SINGLE);
    } else {
      updatedPage.frames.push(DEFAULT_PINNED_FRAME_FORM_DATA);
    }
    setModifiedPage(updatedPage);
    setCurrentFrameId(updatedPage.frames.length - 1);
  };

  const onPinnedValueChanged = (value: string) => {
    const updatedPage = _.cloneDeep(modifiedPage);
    if (value === 'yes') {
      updatedPage.frames = [DEFAULT_PINNED_FRAME_FORM_DATA];
      setModifiedPage({
        ...updatedPage,
        pinnable: true,
        layout: {
          template: 'single',
        },
      });
    } else {
      updatedPage.frames = [DEFAULT_FRAME_FORM_DATA_FOR_SINGLE];
      setModifiedPage({ ...updatedPage, pinnable: false, layout: { template: 'single' } });
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
        {modifiedPage.pinnable ? (
          <Box>
            <Tooltip label="Add multiple frames to one page to view them sequentially">
              <Button leftSection={<IconPlaylistAdd />} color="teal" onClick={onNextFrame}>
                Add Frame
              </Button>
            </Tooltip>
          </Box>
        ) : null}
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
          if (value === 'top-bottom') {
            setModifiedPage({
              ...updatedPage,
              frames: [DEFAULT_FRAME_FORM_DATA_FOR_TOP_BOTTOM],
              layout: { ...updatedPage.layout, template: value },
            });
          } else if (value === 'left-right' || value === 'top-bottom') {
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
                template: 'single',
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
