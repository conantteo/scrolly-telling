import { useEffect, useState } from 'react';
import { Box, Button, FileInput, Group, InputLabel, Radio, Stack, Title } from '@mantine/core';
import { useScrollyStore } from '../store';
import { ScrollyElementData } from '../types';
import ScrollyRichTextEditor from './ScrollyRichTextEditor';

const ALLOW_EXTENSIONS = ['png', 'jpg', 'jpeg'];

const ComponentDrawer: React.FC = () => {
  const currentElementId = useScrollyStore((state) => state.currentElementId);
  const setData = useScrollyStore((state) => state.setData);
  const upsertElement = useScrollyStore((state) => state.upsertElement);
  const setViewElement = useScrollyStore((state) => state.setViewElement);
  const elements = useScrollyStore((state) => state.elements);
  const data = useScrollyStore((state) => state.data);

  const targetElement = elements.find((element) => element.id === currentElementId) ?? {
    id: currentElementId,
    type: 'component',
    isNew: true,
    isOpen: false,
  };
  const [modifiedData, setModifiedData] = useState<ScrollyElementData>({
    id: currentElementId,
    type: 'component',
    metadata: {},
  });
  const [formError, setFormError] = useState({ type: '', file: '' });
  const formHasError = Object.keys(formError).every(
    (key) => formError[key as keyof typeof formError]
  );

  useEffect(() => {
    if (currentElementId) {
      setModifiedData(
        data.find((d) => d.id === currentElementId) ?? {
          id: currentElementId,
          type: 'component',
          metadata: {},
        }
      );
    }
  }, [data, currentElementId]);

  const onClose = () => {
    setViewElement(currentElementId, false);
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

  const onTextChange = (text: string) => {
    setModifiedData({
      ...modifiedData,
      metadata: {
        ...modifiedData.metadata,
        text,
      },
    });
  };

  useEffect(() => {
    console.log(currentElementId, elements, data, targetElement, modifiedData);
  });
  return (
    <Stack>
      <Title order={2}>
        {targetElement.isNew ? `Create new component` : `Edit component ${currentElementId}`}
      </Title>
      <Box>
        <Radio.Group
          value={modifiedData.metadata.type}
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
        >
          <Group mt="xs">
            <Radio label="Image" value="image" />
            <Radio label="Text" value="text" />
          </Group>
        </Radio.Group>
      </Box>
      {modifiedData.metadata.type === 'image' && (
        <Box>
          <FileInput
            radius="xl"
            label="Upload Image"
            withAsterisk
            description=".png"
            error={formError.file ? formError.file : null}
            placeholder={
              modifiedData.metadata.fileName ? modifiedData.metadata.fileName : 'Select an image'
            }
            onChange={onFileUpload}
          />
        </Box>
      )}
      {modifiedData.metadata.type === 'text' && (
        <Box>
          <InputLabel required>Enter content below</InputLabel>
          <ScrollyRichTextEditor value={modifiedData.metadata.text} onChange={onTextChange} />
        </Box>
      )}
      <Box style={{ position: 'fixed', bottom: 0, right: 0, padding: '12px' }}>
        <Button
          disabled={formHasError}
          onClick={() => {
            onClose();
            setData(currentElementId, modifiedData);
            upsertElement(targetElement);
          }}
        >
          Save
        </Button>
      </Box>
    </Stack>
  );
};

export default ComponentDrawer;
