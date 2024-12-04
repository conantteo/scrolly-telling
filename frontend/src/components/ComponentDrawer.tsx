import { useState } from 'react';
import { Box, Button, Drawer, FileInput, Group, Radio, Stack, Title } from '@mantine/core';
import { useScrollyStore } from '../store';
import { ScrollyElementData } from '../types';

const ALLOW_EXTENSIONS = ['png', 'jpg', 'jpeg'];

const ComponentDrawer: React.FC = () => {
  const isComponentWindowOpen = useScrollyStore((state) => state.isComponentWindowOpen);
  const currentElementId = useScrollyStore((state) => state.currentElementId);
  const upsertData = useScrollyStore((state) => state.upsertData);
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
  const targetData = data.find((d) => d.id === currentElementId) ?? {
    id: currentElementId,
    type: 'component',
    metadata: {},
  };
  const [modifiedData, setModifiedData] = useState<ScrollyElementData>({ ...targetData });
  const [formError, setFormError] = useState({ type: '', file: '' });

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
    } else {
      setFormError((prev) => ({
        ...prev,
        file: `Only the following file extensions are allowed: ${ALLOW_EXTENSIONS.join(', ')}`,
      }));
    }
  };
  return (
    <Drawer opened={isComponentWindowOpen} onClose={onClose} position="right" size="xl">
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
        <Box style={{ position: 'fixed', bottom: 0, right: 0, padding: '12px' }}>
          <Button
            onClick={() => {
              onClose();
              upsertData(modifiedData);
              upsertElement(targetElement);
            }}
          >
            Save
          </Button>
        </Box>
      </Stack>
    </Drawer>
  );
};

export default ComponentDrawer;
