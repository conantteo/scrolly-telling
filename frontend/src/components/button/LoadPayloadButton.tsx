import { useState } from 'react';
import { IconCheck, IconCopy, IconDeviceDesktopDown } from '@tabler/icons-react';
import {
  ActionIcon,
  Box,
  Button,
  Code,
  CopyButton,
  Group,
  Modal,
  Stack,
  TextInput,
  Title,
  Tooltip,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useScrollyStore } from '../../store';
import {
  deleteArticleFromLocalStorage,
  getArticleFromRemoteStorage,
} from '../../util/localStorageUtil';

const LoadPayloadButton: React.FC = () => {
  const [isModalOpened, { open, close }] = useDisclosure(false);
  const currentArticleId = useScrollyStore((state) => state.articleId);
  const resetStore = useScrollyStore((state) => state.resetStore);
  const [articleId, setArticleId] = useState('');
  return (
    <>
      <Tooltip label="Click here to load article from storage using an article ID.">
        <Button size="sm" leftSection={<IconDeviceDesktopDown />} onClick={open}>
          Load Payload
        </Button>
      </Tooltip>

      {isModalOpened ? (
        <Modal
          centered
          opened={isModalOpened}
          onClose={close}
          title={<Title order={2}>Load article from storage</Title>}
          size="auto"
        >
          <Stack>
            <Box>
              Your current article will be replaced, are you sure you want to continue?
              <Group>
                Current article ID:
                <Code block>{currentArticleId}</Code>
                <CopyButton value={currentArticleId} timeout={2000}>
                  {({ copied, copy }) => (
                    <Tooltip
                      label={copied ? 'Copied' : 'Copy article ID'}
                      withArrow
                      position="right"
                    >
                      <ActionIcon color={copied ? 'teal' : 'gray'} variant="subtle" onClick={copy}>
                        {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                      </ActionIcon>
                    </Tooltip>
                  )}
                </CopyButton>
              </Group>
            </Box>
            <Box>
              <TextInput
                label="Article ID"
                placeholder="Input article ID to be loaded here"
                onChange={(event) => setArticleId(event.currentTarget.value)}
              />
            </Box>
            <Group>
              <Button
                size="sm"
                variant="subtle"
                onClick={() => {
                  close();
                }}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  deleteArticleFromLocalStorage();
                  resetStore();
                  getArticleFromRemoteStorage(articleId);
                }}
              >
                Submit
              </Button>
            </Group>
          </Stack>
        </Modal>
      ) : null}
    </>
  );
};

export default LoadPayloadButton;
