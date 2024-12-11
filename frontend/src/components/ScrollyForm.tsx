import { useEffect, useState } from 'react';
import { Box, Button, Group, Radio, Stack, Title } from '@mantine/core';
import { useScrollyStore } from '../store';
import { ScrollyAnimation, ScrollyComponent, ScrollyContainerElementProps } from '../types';
import ScrollyComponentForm from './ScrollyComponentForm';

const ScrollyForm: React.FC = () => {
  const currentElementId = useScrollyStore((state) => state.currentElementId);
  const setCurrentElementId = useScrollyStore((state) => state.setCurrentElementId);
  const elements = useScrollyStore((state) => state.elements);
  const appendDefaultElement = useScrollyStore((state) => state.appendDefaultElement);
  const setElement = useScrollyStore((state) => state.setElement);
  const data = useScrollyStore((state) => state.data);
  const setData = useScrollyStore((state) => state.setData);

  const existingElement = elements.find((element) => element.id === currentElementId);
  const DEFAULT_COMPONENT_FORM_DATA: ScrollyComponent = {
    id: currentElementId ?? '',
    type: 'image',
    position: 'center',
    animation: null,
  };
  const DEFAULT_ANIMATION_FORM_DATA: ScrollyAnimation = {
    id: `${currentElementId}-animation`,
    type: 'fade-in',
    metadata: {
      pin: false,
      transition: '',
      duration: 1000,
    },
  };

  const currentElement: ScrollyContainerElementProps = existingElement ?? {
    id: currentElementId ?? '',
    isNew: true,
  };
  const [modifiedData, setModifiedData] = useState<ScrollyComponent>({
    ...DEFAULT_COMPONENT_FORM_DATA,
  });
  const [formError, setFormError] = useState({ type: '', file: '' });
  const formHasError = Object.keys(formError).every(
    (key) => formError[key as keyof typeof formError]
  );

  useEffect(() => {
    if (currentElementId) {
      setModifiedData(data.find((d) => d.id === currentElementId) ?? DEFAULT_COMPONENT_FORM_DATA);
    }
  }, [data, currentElementId]);

  const onReset = () => {
    if (currentElementId) {
      if (currentElement.isNew) {
        appendDefaultElement();
        setElement(currentElementId, { ...currentElement, isNew: false });
      }
    }
    setCurrentElementId(null);
    setModifiedData(DEFAULT_COMPONENT_FORM_DATA);
  };

  const onSave = () => {
    if (currentElementId) {
      setData(currentElementId, {
        pinnable: false,
        layout: { template: 'single' },
        componentGroups: [{ components: [{ ...modifiedData }] }],
      });
    }
    onReset();
  };

  const onNext = () => {
    if (currentElementId) {
      setData(currentElementId, {
        pinnable: true,
        layout: { template: 'left-right' },
        componentGroups: [{ components: [{ ...modifiedData }] }],
      });
    }
    onReset();
  };

  return (
    <Stack>
      <Title order={2}>
        {currentElement.isNew ? `Create new component` : `Edit component ${currentElementId}`}
      </Title>
      <Box>
        <Radio.Group
          value={modifiedData.animation?.metadata.pin ? 'yes' : 'no'}
          onChange={(value) => {
            if (modifiedData.animation) {
              setModifiedData({
                ...modifiedData,
                animation: {
                  ...modifiedData.animation,
                  metadata: {
                    ...modifiedData.animation.metadata,
                    pin: value === 'yes',
                  },
                },
              });
            } else {
              setModifiedData({
                ...modifiedData,
                animation: {
                  ...DEFAULT_ANIMATION_FORM_DATA,
                  metadata: { ...DEFAULT_ANIMATION_FORM_DATA.metadata, pin: value === 'yes' },
                },
              });
            }
          }}
          label="Do you want to pin multiple content on the same view?"
          description="Contents that are pinned in the same group will be animated together until all content is scrolled past"
        >
          <Group mt="xs">
            <Radio label="Yes" value="yes" />
            <Radio label="No" value="no" />
          </Group>
        </Radio.Group>
      </Box>
      <ScrollyComponentForm
        formError={formError}
        setFormError={setFormError}
        modifiedData={modifiedData}
        setModifiedData={setModifiedData}
        resetAnimation={(animationData) => {
          setModifiedData({
            ...modifiedData,
            animation: {
              ...DEFAULT_ANIMATION_FORM_DATA,
              metadata: {
                ...DEFAULT_ANIMATION_FORM_DATA.metadata,
                ...animationData,
              },
            },
          });
        }}
      />
      <Box style={{ position: 'fixed', bottom: 0, right: 0, padding: '12px' }}>
        <Button disabled={formHasError} onClick={onSave}>
          Save
        </Button>
      </Box>
    </Stack>
  );
};

export default ScrollyForm;
