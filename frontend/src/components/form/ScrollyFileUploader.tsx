import imageCompression from 'browser-image-compression';
import { Box, FileInput, Group, Radio, TextInput } from '@mantine/core';
import { useUploadImage } from '../../hooks/useUploadImage';
import { useScrollyStore } from '../../store';
import { ScrollyComponent, ScrollyImageComponent } from '../../types';

const ALLOWED_EXTENSIONS = ['png', 'jpg', 'jpeg'];

interface ScrollyFileUploaderProps {
  formError: { type: string; file: string };
  setFormError: ({ type, file }: { type: string; file: string }) => void;
  component: ScrollyComponent & ScrollyImageComponent;
  setComponent: (data: ScrollyComponent) => void;
}

const ScrollyFileUploader: React.FC<ScrollyFileUploaderProps> = ({
  component,
  setComponent,
  formError,
  setFormError,
}) => {
  const articleId = useScrollyStore((state) => state.articleId);
  const { mutate: uploadFile } = useUploadImage();
  const onFileUpload = (file: File | null) => {
    if (!file) {
      return;
    }
    const fileExtension = file.name.split('.').pop();
    if (fileExtension && ALLOWED_EXTENSIONS.includes(fileExtension?.toLowerCase())) {
      uploadFile({ file, articleId });
      imageCompression(file, { maxSizeMB: 0.01, maxWidthOrHeight: 500 }).then((compressedFile) => {
        const reader = new FileReader();
        reader.readAsDataURL(compressedFile);
        reader.onload = () => {
          const base64 = reader.result as string;
          setComponent({
            ...component,
            type: 'image',
            metadata: {
              ...component.metadata,
              image: file.name,
              fileBase64: base64,
              fileExtension,
              fileSize: `${compressedFile.size}`,
              file: compressedFile,
              isDisplayFullscreen:
                component.type === 'image'
                  ? (component.metadata?.isDisplayFullscreen ?? false)
                  : false,
            },
          });
        };
      });
      setFormError({
        ...formError,
        file: '',
      });
    } else {
      setFormError({
        ...formError,
        file: `Only the following file extensions are allowed: ${ALLOWED_EXTENSIONS.join(', ')}`,
      });
    }
  };
  return (
    <>
      <Radio.Group
        value={`${component.metadata?.isDisplayFullscreen ? 'yes' : 'no'}`}
        defaultValue="no"
        onChange={(value) => {
          if (value) {
            setComponent({
              ...component,
              metadata: {
                ...component.metadata,
                isDisplayFullscreen: value === 'yes',
              },
            });
          }
        }}
        label="Display image in fullscreen?"
        description="Image will either be displayed in default size or fullscreen"
        withAsterisk
      >
        <Group mt="xs">
          <Radio label="No" value="no" />
          <Radio label="Yes" value="yes" />
        </Group>
      </Radio.Group>
      <Box>
        <FileInput
          radius="xl"
          label="Upload image here"
          withAsterisk
          description="Accepts .png, .jpg, .jpeg"
          error={formError.file ? formError.file : null}
          placeholder="Select an image"
          value={component.metadata?.file ? component.metadata?.file : null}
          onChange={onFileUpload}
        />
        <TextInput
          label="Caption"
          placeholder="Input caption here"
          value={component.metadata?.caption}
          onChange={(event) => {
            setComponent({
              ...component,
              metadata: {
                ...component.metadata,
                caption: event.currentTarget.value,
              },
            });
          }}
        />
      </Box>
    </>
  );
};

export default ScrollyFileUploader;
