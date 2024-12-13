import { useEffect, useState } from 'react';
import _ from 'lodash';
import { Box, Button, Group, Radio, Select, Stack, Title } from '@mantine/core';
import { useScrollyStore } from '../../store';
import {
  ScrollyAnimation,
  ScrollyComponent,
  ScrollyContainerElementProps,
  ScrollyPage,
} from '../../types';
import ScrollyComponentForm from './ScrollyComponentForm';

const LAYOUTS = ['left-right', 'top-bottom', 'single'];

const LAYOUT_TEMPLATES = {
  'left-right': ['left', 'right'],
  'top-bottom': ['top', 'bottom'],
  single: ['left', 'center', 'right'],
};

const DEFAULT_ANIMATION_FORM_DATA: ScrollyAnimation = {
  id: `0`,
  type: 'fade-in',
  metadata: {
    pin: false,
    transition: '',
    duration: 1000,
  },
};

const DEFAULT_COMPONENT_FORM_DATA: ScrollyComponent = {
  id: `0`,
  type: 'text',
  position: 'left',
  animation: DEFAULT_ANIMATION_FORM_DATA,
};

const ScrollyForm: React.FC = () => {
  const currentElementId = useScrollyStore((state) => state.currentElementId);
  const setCurrentElementId = useScrollyStore((state) => state.setCurrentElementId);
  const elements = useScrollyStore((state) => state.elements);
  const appendDefaultElement = useScrollyStore((state) => state.appendDefaultElement);
  const setElement = useScrollyStore((state) => state.setElement);
  const pages = useScrollyStore((state) => state.pages);
  const setPage = useScrollyStore((state) => state.setPage);
  const addComponentToFrame = useScrollyStore((state) => state.addComponentToFrame);

  const existingElement = elements.find((element) => element.id === currentElementId);
  const currentElement: ScrollyContainerElementProps = existingElement ?? {
    id: currentElementId ?? `${elements.length}`,
    isNew: true,
  };

  const DEFAULT_PAGE_FORM_DATA: ScrollyPage = {
    id: currentElement.id,
    pinnable: false,
    layout: {
      template: 'single',
    },
    frames: [
      {
        id: `0`,
        components: [DEFAULT_COMPONENT_FORM_DATA],
      },
    ],
  };

  const [currentFrameId, setCurrentFrameId] = useState(0);
  const [modifiedPage, setModifiedPage] = useState<ScrollyPage>({
    ...DEFAULT_PAGE_FORM_DATA,
  });
  const [formError, setFormError] = useState({ type: '', file: '' });
  const formHasError = Object.keys(formError).every(
    (key) => formError[key as keyof typeof formError]
  );

  useEffect(() => {
    if (currentElementId) {
      const page =
        pages.find((_d, index) => index === Number(currentElement.id)) ?? DEFAULT_PAGE_FORM_DATA;
      setModifiedPage(_.cloneDeep(page));
    }
  }, [pages, currentElementId]);

  useEffect(() => {
    console.log({ pages });
  });

  const onReset = () => {
    if (currentElementId) {
      if (currentElement.isNew) {
        appendDefaultElement();
        setElement(currentElementId, { ..._.cloneDeep(currentElement), isNew: false });
      }
    }
    setCurrentElementId(null);
    setModifiedPage(_.cloneDeep(DEFAULT_PAGE_FORM_DATA));
  };

  const onSave = () => {
    if (currentElementId) {
      const updatedPage = _.cloneDeep(modifiedPage);
      setPage(currentElementId, updatedPage);
    }
    onReset();
  };

  const onNext = () => {
    if (currentElementId) {
      const updatedPage = _.cloneDeep(modifiedPage);
      setPage(currentElementId, updatedPage);
      addComponentToFrame(
        currentElementId,
        currentFrameId,
        _.cloneDeep(DEFAULT_COMPONENT_FORM_DATA)
      );
      setCurrentFrameId(modifiedPage.frames.length);
    }
  };

  return (
    <Stack>
      <Title order={2}>
        {currentElement.isNew ? `Create new component` : `Edit component ${currentElementId}`}
      </Title>
      <Box>
        <Radio.Group
          label="Do you want to pin multiple content on the same view?"
          description="Contents that are pinned in the same group will be animated together until all content is scrolled past"
          value={modifiedPage.pinnable ? 'yes' : 'no'}
          onChange={(value) => {
            const updatedPage = _.cloneDeep(modifiedPage);
            if (value === 'yes') {
              setModifiedPage({
                ...updatedPage,
                pinnable: true,
              });
            } else {
              setModifiedPage({
                ...updatedPage,
                pinnable: false,
              });
            }
          }}
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
        description="Layout determines how your text or images are placed"
        data={LAYOUTS}
        searchable
        clearable
        value={modifiedPage.layout.template ?? ''}
        onChange={(value) => {
          const updatedPage = _.cloneDeep(modifiedPage);
          if (value === 'left-right' || value === 'top-bottom' || value === 'single') {
            setModifiedPage({
              ...updatedPage,
              layout: { ...updatedPage.layout, template: value },
            });
          } else {
            setModifiedPage({
              ...updatedPage,
              layout: { ...updatedPage.layout, template: 'single' },
            });
          }
        }}
      />
      {modifiedPage.frames.map((frame, frameIndex) => (
        <Stack key={frameIndex}>
          <Title size="h3">The following components are in the same frame</Title>
          {frame.components.map((component, componentIndex) => (
            <Box key={componentIndex}>
              <Title size="h4">
                {_.upperFirst(component.type)} component ({component.position})
              </Title>
              <ScrollyComponentForm
                layoutTemplates={LAYOUT_TEMPLATES[modifiedPage.layout.template]}
                formError={formError}
                setFormError={setFormError}
                modifiedData={component}
                setModifiedData={(componentData) => {
                  const updatedPage = _.cloneDeep(modifiedPage);
                  updatedPage.frames[frameIndex].components[componentIndex] = componentData;
                  setModifiedPage(updatedPage);
                }}
                resetAnimation={(animationData) => {
                  const updatedPage = _.cloneDeep(modifiedPage);
                  const component = updatedPage.frames[frameIndex].components[componentIndex];
                  if (component.animation) {
                    const updatedComponent = {
                      ...component,
                      animation: {
                        ...component.animation,
                        metadata: { ...component.animation?.metadata, ...animationData },
                      },
                    };
                    updatedPage.frames[frameIndex].components[componentIndex] = updatedComponent;
                    setModifiedPage(updatedPage);
                  }
                }}
              />
            </Box>
          ))}
        </Stack>
      ))}
      {modifiedPage.pinnable ? (
        <Box>
          <Button onClick={onNext}>Add</Button>
        </Box>
      ) : null}
      <Box style={{ position: 'fixed', bottom: 0, right: 0, padding: '12px' }}>
        <Button disabled={formHasError} onClick={onSave}>
          Save
        </Button>
      </Box>
    </Stack>
  );
};

export default ScrollyForm;
