import React, { useEffect } from 'react';
import _ from 'lodash';
import { Box, FileInput, Group, InputLabel, Radio, Stack } from '@mantine/core';
import { Positions, ScrollyComponent } from '../../types';
import ScrollyComponentSelect from './ScrollyComponentSelect';
import ScrollyRichTextEditor from './ScrollyRichTextEditor';

interface ScrollyComponentFormProps {
  layoutTemplates: readonly Positions[];
  formError: { type: string; file: string };
  setFormError: ({ type, file }: { type: string; file: string }) => void;
  component: ScrollyComponent;
  setComponent: (data: ScrollyComponent) => void;
  defaultComponent: ScrollyComponent;
}

const ALLOW_EXTENSIONS = ['png', 'jpg', 'jpeg'];

const ScrollyComponentForm: React.FC<ScrollyComponentFormProps> = ({
  layoutTemplates,
  formError,
  setFormError,
  component,
  setComponent,
  defaultComponent,
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
        setComponent({
          ...component,
          type: 'image',
          metadata: {
            ...component.metadata,
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
    setComponent({
      ...component,
      type: 'text',
      metadata: {
        ...component.metadata,
        htmlContent,
      },
    });
  };

  useEffect(() => {
    if (!layoutTemplates.includes(component.position)) {
      setComponent({
        ...component,
        position: layoutTemplates[0],
      });
    }
  }, [component, layoutTemplates]);

  const onComponentChanged = (componentSelected: ScrollyComponent | null) => {
    if (
      componentSelected &&
      component.type === 'text' &&
      component.type === componentSelected.type
    ) {
      setComponent({
        ...component,
        ...componentSelected,
        type: 'text',
      });
    } else if (
      componentSelected &&
      component.type === 'image' &&
      component.type === componentSelected.type
    ) {
      setComponent({
        ...component,
        ...componentSelected,
        type: 'image',
      });
    } else {
      setComponent({ ...defaultComponent });
    }
  };

  return (
    <Stack gap="xs">
      <Box>
        <ScrollyComponentSelect
          onComponentChanged={(componentSelected) => onComponentChanged(componentSelected)}
        />
      </Box>
      <Box>
        <Radio.Group
          value={`${component.type}`}
          onChange={(value) => {
            if (value === 'image' || value === 'text') {
              setComponent({
                ...component,
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
            <Radio label="Text" value="text" />
            <Radio label="Image" value="image" />
          </Group>
        </Radio.Group>
      </Box>
      <Box>
        <Radio.Group
          value={component.position}
          onChange={(value) => {
            if (
              value === 'center' ||
              value === 'left' ||
              value === 'right' ||
              value === 'top' ||
              value === 'bottom'
            ) {
              setComponent({
                ...component,
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
      {component.type === 'image' && (
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
      {component.type === 'text' && (
        <Box>
          <InputLabel required>Enter content below</InputLabel>
          <ScrollyRichTextEditor
            value={`${component.metadata?.htmlContent ?? ''}`}
            onChange={onContentChange}
          />
        </Box>
      )}
    </Stack>
  );
};

export default ScrollyComponentForm;
