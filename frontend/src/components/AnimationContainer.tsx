import { useState } from 'react';
import {
  Box,
  Button,
  FileInput,
  Group,
  NumberInput,
  Radio,
  Space,
  Stack,
  Title,
} from '@mantine/core';
import { useScrollyStore } from '../store';
import { ScrollyElementData } from '../types';

const ALLOW_EXTENSIONS = ['png', 'jpg', 'jpeg'];

const AnimationContainer: React.FC = () => {
  const elements = useScrollyStore((state) => state.elements);
  const data = useScrollyStore((state) => state.data);
  const setViewElement = useScrollyStore((state) => state.setViewElement);
  const currentElementId = useScrollyStore((state) => state.currentElementId);
  const upsertData = useScrollyStore((state) => state.upsertData);
  const upsertElement = useScrollyStore((state) => state.upsertElement);
  const isComponentWindowOpen = useScrollyStore((state) => state.isComponentWindowOpen);

  const viewableElements = [...elements];
  viewableElements.pop();

  const targetElement = elements.find((element) => element.id === currentElementId) ?? {
    id: Math.max(...elements.map((v) => Number(v.id))) + 1,
    type: 'component',
    isNew: true,
    isOpen: false,
  };
  const targetData = data.find((d) => d.id === currentElementId) ?? {
    id: Math.max(...elements.map((v) => Number(v.id))) + 1,
    type: 'component',
    metadata: {
      numColumns: 1,
      columns: {},
    },
  };
  const [modifiedData, setModifiedData] = useState<ScrollyElementData>({ ...targetData });
  const [formError, setFormError] = useState({ type: '', file: '' });
  const [numColumns, setNumColumns] = useState<Number>(
    targetElement.isOpen ? Number(targetData.metadata.numColumns) : 0
  );
  console.log(elements);
  const onClose = () => {
    console.log(String(targetElement.id));
    setViewElement(String(targetElement.id), false);
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
    <>
      <Title order={5}>Animations pane</Title>
      <Space h="sm" />
      {isComponentWindowOpen ? (
        <NumberInput
          label="Number of columns"
          startValue={1}
          defaultValue={Number(numColumns)}
          onChange={(value) => {
            setNumColumns(Number(value));
          }}
        />
      ) : (
        ''
      )}
      <Stack align="stretch" justify="center" gap="xs">
        <Space h="sm" />
        {isComponentWindowOpen
          ? [...Array(numColumns)].map((_, v) => (
              <Box key={v}>
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
                  label={`Column ${v + 1}`}
                  description="Select either an image or text component"
                >
                  <Group mt="xs">
                    <Radio label="Image" value="image" />
                    <Radio label="Text" value="text" />
                  </Group>
                </Radio.Group>
                <Space h="sm" />
              </Box>
            ))
          : ''}
        {isComponentWindowOpen
          ? modifiedData.metadata.type === 'image' && (
              <Box>
                <FileInput
                  radius="xl"
                  label="Upload Image"
                  withAsterisk
                  description=".png"
                  error={formError.file ? formError.file : null}
                  placeholder={
                    modifiedData.metadata.fileName
                      ? modifiedData.metadata.fileName
                      : 'Select an image'
                  }
                  onChange={onFileUpload}
                />
              </Box>
            )
          : ''}
        {/* {viewableElements.map((element) => (
          <Card key={element.id} withBorder shadow="xl">
            <div> {element.type == "component" ? "Component" : "Animation"} {element.id}</div>
          </Card>
        ))} */}
        {isComponentWindowOpen ? (
          <Box style={{ position: 'fixed', bottom: 0, right: 0, padding: '12px' }}>
            <Button
              onClick={() => {
                targetData.metadata['numColumns'] = Number(numColumns);
                upsertData(targetData);
                upsertElement(targetElement);
              }}
            >
              Save
            </Button>
            <Button
              color="gray"
              variant="light"
              onClick={() => {
                onClose();
              }}
            >
              Close
            </Button>
          </Box>
        ) : (
          ''
        )}
      </Stack>
    </>
  );
};

export default AnimationContainer;
