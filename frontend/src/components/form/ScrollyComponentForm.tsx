import React, { useEffect } from 'react';
import _ from 'lodash';
import { Box, Group, InputLabel, Radio, Select, Stack } from '@mantine/core';
import { useAnimationOptions } from '../../hooks/useAnimationOptions';
import { Positions, ScrollyComponent } from '../../types';
import ScrollyComponentSelect from './ScrollyComponentSelect';
import ScrollyHtmlUploader from './ScrollyHtmlUploader';
import ScrollyImageUploader from './ScrollyImageUploader';
import ScrollyRichTextEditor from './ScrollyRichTextEditor';

interface ScrollyComponentFormProps {
  layoutTemplates: readonly Positions[];
  formError: { type: string; file: string };
  setFormError: ({ type, file }: { type: string; file: string }) => void;
  component: ScrollyComponent;
  setComponent: (data: ScrollyComponent) => void;
  defaultComponent: ScrollyComponent;
  currentComponents: ScrollyComponent[];
}

const ScrollyComponentForm: React.FC<ScrollyComponentFormProps> = ({
  layoutTemplates,
  formError,
  setFormError,
  component,
  setComponent,
  defaultComponent,
  currentComponents,
}) => {
  const { data: animationOptionsResponse } = useAnimationOptions();

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
  }, [component, layoutTemplates, setComponent]);

  const onComponentChanged = (componentSelected: ScrollyComponent | null) => {
    if (componentSelected && componentSelected.type === 'image') {
      setComponent({
        ...component,
        type: componentSelected.type,
        metadata: _.cloneDeep(componentSelected.metadata),
      });
    } else if (componentSelected && componentSelected.type === 'text') {
      setComponent({
        ...component,
        type: componentSelected.type,
        metadata: _.cloneDeep(componentSelected.metadata),
      });
    } else {
      setComponent(_.cloneDeep(defaultComponent));
    }
  };

  return (
    <Stack gap="xs">
      <Box>
        <ScrollyComponentSelect
          onComponentChanged={(componentSelected) => onComponentChanged(componentSelected)}
          currentComponents={currentComponents}
        />
      </Box>
      <Box>
        <Radio.Group
          value={`${component.type}`}
          onChange={(value) => {
            if (value === 'image' || value === 'text' || value === 'html') {
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
            <Radio label="Html" value="html" />
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
          description="Select where to place the content"
          withAsterisk
        >
          <Group mt="xs">
            {layoutTemplates.map((value) => (
              <Radio key={value} label={_.upperFirst(value)} value={value} />
            ))}
          </Group>
        </Radio.Group>
      </Box>
      <Select
        label="Choose an animation"
        placeholder="Select an animation"
        description="Animation affects how your content will appear on the screen"
        data={animationOptionsResponse['animation-options']}
        searchable
        value={component.animation}
        onChange={(value) => {
          if (value) {
            setComponent({
              ...component,
              animation: value,
            });
          }
        }}
      />
      {component.type === 'image' && (
        <ScrollyImageUploader
          component={component}
          setComponent={setComponent}
          formError={formError}
          setFormError={setFormError}
        />
      )}
      {component.type === 'text' && (
        <Box>
          <InputLabel required>Enter content below</InputLabel>
          <ScrollyRichTextEditor
            value={component.metadata?.htmlContent ? `${component.metadata.htmlContent}` : ''}
            onChange={onContentChange}
          />
        </Box>
      )}
      {component.type === 'html' && (
        <ScrollyHtmlUploader
          component={component}
          setComponent={setComponent}
          formError={formError}
          setFormError={setFormError}
        />
      )}
    </Stack>
  );
};

export default ScrollyComponentForm;
