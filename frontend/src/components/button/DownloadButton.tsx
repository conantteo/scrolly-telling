import { IconDownload } from '@tabler/icons-react';
import { Box, Button, Tooltip } from '@mantine/core';
import { useGenerateWebsite } from '../../hooks/useGenerateWebsite';
import { useScrollyStore } from '../../store';

interface DownloadButtonProps {
  articleId: string;
  title: string;
}

const DownloadButton: React.FC<DownloadButtonProps> = ({ articleId, title }) => {
  const { mutate: generateWebsite } = useGenerateWebsite();
  const pages = useScrollyStore((state) => state.pages);

  return (
    <Box>
      <Tooltip label="Click here to generate all the pages you've created. A download link will be generated.">
        <Button
          leftSection={<IconDownload />}
          onClick={() => generateWebsite({ articleId, title, pages })}
          disabled={pages.length === 0 || !articleId}
        >
          Download
        </Button>
      </Tooltip>
    </Box>
  );
};

export default DownloadButton;
