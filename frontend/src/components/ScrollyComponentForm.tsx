import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  FileInput,
  Group,
  InputLabel,
  InputWrapper,
  Radio,
  Select,
  Slider,
  Stack,
  TextInput,
  Title,
} from '@mantine/core';
import { useScrollyStore } from '../store';
import {
  ANIMATION_TYPES,
  ScrollyAnimation,
  ScrollyComponent,
  ScrollyContainerElementProps,
} from '../types';
import ScrollyRichTextEditor from './ScrollyRichTextEditor';

const ALLOW_EXTENSIONS = ['png', 'jpg', 'jpeg'];

const ScrollyComponentForm: React.FC = () => {
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
    type: 'component',
    metadata: {
      type: 'image',
      position: 'center',
    },
    animation: null,
  };
  const DEFAULT_ANIMATION_FORM_DATA: ScrollyAnimation = {
    id: `${currentElementId}-animation`,
    type: 'animation',
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

  const onSave = () => {
    if (currentElementId) {
      if (currentElement.isNew) {
        appendDefaultElement();
      }
      setElement(currentElementId, { ...currentElement, isNew: false });
      setData(currentElementId, modifiedData);
      setCurrentElementId(null);
      setModifiedData(DEFAULT_COMPONENT_FORM_DATA);
    }
  };

  const onFileUpload = (file: File | null) => {
    if (!file) {
      return;
    }
    const fileExtension = file.name.split('.').pop();
    if (fileExtension && ALLOW_EXTENSIONS.includes(fileExtension?.toLowerCase())) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = reader.result as string;
        setModifiedData({
          ...modifiedData,
          metadata: {
            ...modifiedData.metadata,
            fileBase64: base64,
            fileName: file.name,
            fileExtension,
            fileSize: `${file.size}`,
          },
        });
      };
      setFormError((prev) => ({
        ...prev,
        file: '',
      }));
    } else {
      setFormError((prev) => ({
        ...prev,
        file: `Only the following file extensions are allowed: ${ALLOW_EXTENSIONS.join(', ')}`,
      }));
    }
  };

  const onContentChange = (content: string) => {
    setModifiedData({
      ...modifiedData,
      metadata: {
        ...modifiedData.metadata,
        content,
      },
    });
  };

  return (
    <Stack>
      <Title order={2}>
        {currentElement.isNew ? `Create new component` : `Edit component ${currentElementId}`}
      </Title>
      <Box>
        <Radio.Group
          value={`${modifiedData.metadata.type}`}
          onChange={(value) =>
            setModifiedData((prev) => ({
              ...prev,
              metadata: {
                ...prev.metadata,
                type: value,
              },
            }))
          }
          label="Choose a component to create"
          description="Select either an image or text component"
          withAsterisk
        >
          <Group mt="xs">
            <Radio label="Image" value="image" />
            <Radio label="Text" value="text" />
          </Group>
        </Radio.Group>
      </Box>
      <Box>
        <Radio.Group
          value={modifiedData.metadata.position}
          onChange={(value) => {
            if (value === 'center' || value === 'left' || value === 'right') {
              setModifiedData((prev) => ({
                ...prev,
                metadata: {
                  ...prev.metadata,
                  position: value,
                },
              }));
            }
          }}
          label="Choose a position"
          description="Select to place content on either left, center, or right"
          withAsterisk
        >
          <Group mt="xs">
            <Radio label="Left" value="left" />
            <Radio label="Center" value="center" />
            <Radio label="Right" value="right" />
          </Group>
        </Radio.Group>
      </Box>
      {modifiedData.metadata.type === 'image' && (
        <Box>
          <FileInput
            radius="xl"
            label="Upload image(s)"
            withAsterisk
            description="Accepts .png, .jpg, .jpeg"
            error={formError.file ? formError.file : null}
            placeholder="Select an image"
            onChange={onFileUpload}
          />
        </Box>
      )}
      {modifiedData.metadata.type === 'text' && (
        <Box>
          <InputLabel required>Enter content below</InputLabel>
          <ScrollyRichTextEditor
            value={`${modifiedData.metadata.text ?? ''}`}
            onChange={onContentChange}
          />
        </Box>
      )}
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
          label="Pin content?"
          description="Pinned content xxx"
        >
          <Group mt="xs">
            <Radio label="Yes" value="yes" />
            <Radio label="No" value="no" />
          </Group>
        </Radio.Group>
      </Box>
      <Box>
        <Select
          label="Type of transition"
          placeholder="Select a transition"
          description="Transitions allow you to animate the appearance of your current content"
          data={ANIMATION_TYPES}
          searchable
          clearable
          value={modifiedData.animation?.metadata.transition ?? ''}
          onChange={(value) => {
            if (modifiedData.animation) {
              setModifiedData({
                ...modifiedData,
                animation: {
                  ...modifiedData.animation,
                  metadata: {
                    ...modifiedData.animation.metadata,
                    transition: value ? value : '',
                  },
                },
              });
            } else {
              setModifiedData({
                ...modifiedData,
                animation: {
                  ...DEFAULT_ANIMATION_FORM_DATA,
                  metadata: {
                    ...DEFAULT_ANIMATION_FORM_DATA.metadata,
                    transition: value ? value : '',
                  },
                },
              });
            }
          }}
        />
      </Box>
      <Box>
        <InputWrapper label="Enter duration (ms)" description="Duration XXX">
          <Box mt="sm">
            <Slider
              value={modifiedData.animation?.metadata.duration ?? 1000}
              onChange={(value) => {
                if (modifiedData.animation) {
                  setModifiedData({
                    ...modifiedData,
                    animation: {
                      ...modifiedData.animation,
                      metadata: {
                        ...modifiedData.animation.metadata,
                        duration: value ? value : 1000,
                      },
                    },
                  });
                } else {
                  setModifiedData({
                    ...modifiedData,
                    animation: {
                      ...DEFAULT_ANIMATION_FORM_DATA,
                      metadata: {
                        ...DEFAULT_ANIMATION_FORM_DATA.metadata,
                        duration: value ? value : 1000,
                      },
                    },
                  });
                }
              }}
              min={1000}
              max={10000}
              step={100}
              marks={[
                { value: 1000, label: '1s' },
                { value: 5000, label: '5s' },
                { value: 10000, label: '10s' },
              ]}
            />
          </Box>
          <Box mt="xl">
            <TextInput
              value={modifiedData.animation?.metadata.duration ?? 1000}
              onChange={(event) => {
                if (modifiedData.animation) {
                  setModifiedData({
                    ...modifiedData,
                    animation: {
                      ...modifiedData.animation,
                      metadata: {
                        ...modifiedData.animation.metadata,
                        duration: event.target.value ? Number(event.target.value) : 1000,
                      },
                    },
                  });
                } else {
                  setModifiedData({
                    ...modifiedData,
                    animation: {
                      ...DEFAULT_ANIMATION_FORM_DATA,
                      metadata: {
                        ...DEFAULT_ANIMATION_FORM_DATA.metadata,
                        duration: event.target.value ? Number(event.target.value) : 1000,
                      },
                    },
                  });
                }
              }}
              type="number"
              min={1000}
              max={10000}
              placeholder="Enter duration between 1000-10000 ms"
            />
          </Box>
        </InputWrapper>
      </Box>
      <Box style={{ position: 'fixed', bottom: 0, right: 0, padding: '12px' }}>
        <Button disabled={formHasError} onClick={onSave}>
          Save
        </Button>
      </Box>
    </Stack>
  );
};

export default ScrollyComponentForm;
