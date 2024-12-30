import { IconSun } from '@tabler/icons-react';
import { Box, Button, Group, Modal, Stack, Title, Tooltip } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useGenerateWebsite } from '../../hooks/useGenerateWebsite';
import { useScrollyStore } from '../../store';

const DownloadButton: React.FC = () => {
  const [isModalOpened, { open, close }] = useDisclosure(false);
  const articleId = useScrollyStore((state) => state.articleId);
  const title = useScrollyStore((state) => state.articleTitle);
  const { mutate: generateWebsite } = useGenerateWebsite();
  const pages = useScrollyStore((state) => state.pages);

  return (
    <Box>
      <Tooltip label="Click here to generate all the pages you've created. A download link will be generated.">
        <Button
          size="sm"
          leftSection={<IconSun />}
          onClick={open}
          disabled={pages.length === 0 || !articleId}
        >
          Generate
        </Button>
      </Tooltip>
      {isModalOpened ? (
        <Modal
          centered
          opened={isModalOpened}
          onClose={close}
          title={<Title order={2}>Scrolly Article Completed</Title>}
        >
          <Stack>
            <Box>Would you like to preview online or download a copy offline to view?</Box>
            <Group>
              <Button
                size="sm"
                variant="subtle"
                onClick={() => {
                  generateWebsite({ articleId, title, pages });
                  close();
                }}
              >
                Download
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  generateWebsite({ articleId, title, pages });
                  close();
                }}
              >
                Preview
              </Button>
            </Group>
          </Stack>
        </Modal>
      ) : null}
    </Box>
  );
};

export default DownloadButton;
