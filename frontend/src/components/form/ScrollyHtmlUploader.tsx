import imageCompression from 'browser-image-compression';
import { Box, FileInput } from '@mantine/core';
import { useUploadImage } from '../../hooks/useUploadImage';
import { useScrollyStore } from '../../store';
import { ScrollyComponent, ScrollyHtmlComponent } from '../../types';

const ALLOWED_FILE_TYPES = ['text/html', 'text/css'];

interface ScrollyHtmlUploaderProps {
  formError: { type: string; file: string };
  setFormError: ({ type, file }: { type: string; file: string }) => void;
  component: ScrollyComponent & ScrollyHtmlComponent;
  setComponent: (data: ScrollyComponent) => void;
}

const ScrollyHtmlUploader: React.FC<ScrollyHtmlUploaderProps> = ({
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
    if (ALLOWED_FILE_TYPES.includes(file.type)) {
      uploadFile({ file, articleId });
      imageCompression(file, { maxSizeMB: 0.01, maxWidthOrHeight: 500 }).then((compressedFile) => {
        const reader = new FileReader();
        reader.readAsDataURL(compressedFile);
        reader.onload = () => {
          const base64 = reader.result as string;
          if (file.type === 'text/css') {
            setComponent({
              ...component,
              type: 'html',
              metadata: {
                ...component.metadata,
                css: file.name,
                cssFileBase64: base64,
                cssFileSize: `${compressedFile.size}`,
                cssFile: compressedFile,
              },
            });
          } else {
            setComponent({
              ...component,
              type: 'html',
              metadata: {
                ...component.metadata,
                html: file.name,
                htmlFileBase64: base64,
                htmlFileSize: `${compressedFile.size}`,
                htmlFile: compressedFile,
              },
            });
          }
        };
      });
      setFormError({
        ...formError,
        file: '',
      });
    } else {
      setFormError({
        ...formError,
        file: `Only the following file type(s) are allowed: ${ALLOWED_FILE_TYPES.join(', ')}`,
      });
    }
  };
  return (
    <>
      <Box>
        <FileInput
          radius="xl"
          label="Upload html/css here"
          withAsterisk
          description="Accepts .html, .css"
          error={formError.file ? formError.file : null}
          placeholder="Select html/css file(s) to upload"
          value={component.metadata?.htmlFile ? component.metadata?.htmlFile : null}
          onChange={onFileUpload}
        />
      </Box>
    </>
  );
};

export default ScrollyHtmlUploader;
