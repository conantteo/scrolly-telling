import React from 'react';
import _ from 'lodash';
import {
  Box,
  FileInput,
  Group,
  InputLabel,
  InputWrapper,
  Radio,
  Select,
  Slider,
  TextInput,
} from '@mantine/core';
import { ANIMATION_TYPES, ScrollyComponent } from '../../types';
import ScrollyRichTextEditor from './ScrollyRichTextEditor';

interface ScrollyComponentFormProps {
  layoutTemplates: string[];
  formError: { type: string; file: string };
  setFormError: ({ type, file }: { type: string; file: string }) => void;
  modifiedData: ScrollyComponent;
  setModifiedData: (data: ScrollyComponent) => void;
  resetAnimation: (animationData: { [key: string]: string | number | boolean }) => void;
}

const ALLOW_EXTENSIONS = ['png', 'jpg', 'jpeg'];

const ScrollyComponentForm: React.FC<ScrollyComponentFormProps> = ({
  layoutTemplates,
  formError,
  setFormError,
  modifiedData,
  setModifiedData,
  resetAnimation,
}) => {
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
          type: 'image',
          metadata: {
            ...modifiedData.metadata,
            fileBase64: base64,
            fileName: file.name,
            fileExtension,
            fileSize: `${file.size}`,
          },
        });
      };
      setFormError({
        ...formError,
        file: '',
      });
    } else {
      setFormError({
        ...formError,
        file: `Only the following file extensions are allowed: ${ALLOW_EXTENSIONS.join(', ')}`,
      });
    }
  };

  const onContentChange = (htmlContent: string) => {
    setModifiedData({
      ...modifiedData,
      type: 'text',
      metadata: {
        ...modifiedData.metadata,
        htmlContent,
      },
    });
  };

  return (
    <>
      <Box>
        <Radio.Group
          value={`${modifiedData.type}`}
          onChange={(value) => {
            if (value === 'image' || value === 'text') {
              setModifiedData({
                ...modifiedData,
                type: value,
                metadata: undefined,
              });
            }
          }}
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
          value={modifiedData.position}
          onChange={(value) => {
            if (
              value === 'center' ||
              value === 'left' ||
              value === 'right' ||
              value === 'top' ||
              value === 'bottom'
            ) {
              setModifiedData({
                ...modifiedData,
                position: value,
              });
            }
          }}
          label="Choose a position"
          description="Select to place content on either left, center, or right"
          withAsterisk
        >
          <Group mt="xs">
            {layoutTemplates.map((value) => (
              <Radio key={value} label={_.upperFirst(value)} value={value} />
            ))}
          </Group>
        </Radio.Group>
      </Box>
      {modifiedData.type === 'image' && (
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
      {modifiedData.type === 'text' && (
        <Box>
          <InputLabel required>Enter content below</InputLabel>
          <ScrollyRichTextEditor
            value={`${modifiedData.metadata?.htmlContent ?? ''}`}
            onChange={onContentChange}
          />
        </Box>
      )}
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
              resetAnimation({ transition: value ? value : '' });
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
                  resetAnimation({ duration: value ? value : 1000 });
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
                  resetAnimation({
                    duration: event.target.value ? Number(event.target.value) : 1000,
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
    </>
  );
};

export default ScrollyComponentForm;
