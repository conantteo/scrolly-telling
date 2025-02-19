import { IconCheck, IconCopy, IconSun } from '@tabler/icons-react';
import {
  ActionIcon,
  Box,
  Button,
  Code,
  CopyButton,
  Group,
  Modal,
  Stack,
  Title,
  Tooltip,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  useGenerateAndDownloadWebsite,
  useGenerateAndPreviewWebsite,
} from '../../hooks/useGenerateWebsite';
import { useScrollyStore } from '../../store';

const DownloadButton: React.FC = () => {
  const [isModalOpened, { open, close }] = useDisclosure(false);
  const articleId = useScrollyStore((state) => state.articleId);
  const title = useScrollyStore((state) => state.articleTitle);
  const { mutate: generateAndDownloadWebsite } = useGenerateAndDownloadWebsite();
  const { mutate: generateAndPreviewWebsite, data, isPending } = useGenerateAndPreviewWebsite();
  const pages = useScrollyStore((state) => state.pages);

  return (
    <>
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
          size="auto"
        >
          {!isPending && data?.url ? (
            <Stack>
              <Box>You can paste the following code into the HTML macro in Confluence:</Box>
              <Box>
                <Group>
                  <Code
                    block
                  >{`<iframe height="100%" width="100%" src="${data?.url}"></iframe>`}</Code>
                  <CopyButton
                    value={`<iframe height="100%" width="100%" src="${data?.url}"></iframe>`}
                    timeout={2000}
                  >
                    {({ copied, copy }) => (
                      <Tooltip label={copied ? 'Copied' : 'Copy'} withArrow position="right">
                        <ActionIcon
                          color={copied ? 'teal' : 'gray'}
                          variant="subtle"
                          onClick={copy}
                        >
                          {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                        </ActionIcon>
                      </Tooltip>
                    )}
                  </CopyButton>
                </Group>
              </Box>
              <Group>
                <Button
                  size="sm"
                  variant="subtle"
                  onClick={() => {
                    generateAndDownloadWebsite({ articleId, title, pages });
                    close();
                  }}
                >
                  Download
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    window.open(data?.url, '_blank', 'noopener,noreferrer');
                    close();
                  }}
                >
                  View page
                </Button>
              </Group>
            </Stack>
          ) : (
            <Stack>
              <Box>Would you like to preview online or download a copy offline to view?</Box>
              <Group>
                <Button
                  size="sm"
                  variant="subtle"
                  onClick={() => {
                    generateAndDownloadWebsite({ articleId, title, pages });
                    close();
                  }}
                >
                  Download
                </Button>
                <Button
                  size="sm"
                  onClick={() => generateAndPreviewWebsite({ articleId, title, pages })}
                >
                  Preview
                </Button>
              </Group>
            </Stack>
          )}
        </Modal>
      ) : null}
    </>
  );
};

export default DownloadButton;
