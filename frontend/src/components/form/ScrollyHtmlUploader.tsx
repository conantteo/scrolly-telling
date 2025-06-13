import imageCompression from 'browser-image-compression';
import { Box, FileInput } from '@mantine/core';
import { useUploadImage } from '../../hooks/useUploadImage';
import { useScrollyStore } from '../../store';
import { ScrollyComponent, ScrollyHtmlComponent } from '../../types';

const ALLOWED_EXTENSIONS = ['html', 'css'];

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
    const fileExtension = file.name.split('.').pop();
    if (fileExtension && ALLOWED_EXTENSIONS.includes(fileExtension?.toLowerCase())) {
      uploadFile({ file, articleId });
      imageCompression(file, { maxSizeMB: 0.01, maxWidthOrHeight: 500 }).then((compressedFile) => {
        const reader = new FileReader();
        reader.readAsDataURL(compressedFile);
        reader.onload = () => {
          const base64 = reader.result as string;
          if (fileExtension === 'css') {
            setComponent({
              ...component,
              type: 'html',
              metadata: {
                ...component.metadata,
                css: file.name,
                cssFileBase64: base64,
                cssFileExtension: fileExtension,
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
                htmlFileExtension: fileExtension,
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
        file: `Only the following file extensions are allowed: ${ALLOWED_EXTENSIONS.join(', ')}`,
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
