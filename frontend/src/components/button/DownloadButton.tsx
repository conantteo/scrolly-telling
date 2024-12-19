import { IconDownload } from '@tabler/icons-react';
import { Box, Button } from '@mantine/core';
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
      <Button
        leftSection={<IconDownload />}
        onClick={() => generateWebsite({ articleId, title, pages })}
        disabled={pages.length === 0 || !articleId}
      >
        Download
      </Button>
    </Box>
  );
};

export default DownloadButton;
