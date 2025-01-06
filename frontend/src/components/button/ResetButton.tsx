import { IconRestore } from '@tabler/icons-react';
import { Box, Button, Group, Modal, Stack, Title, Tooltip } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useScrollyStore } from '../../store';
import { deleteArticleFromLocalStorage } from '../../util/localStorageUtil';

const ResetButton: React.FC = () => {
  const [isModalOpened, { open, close }] = useDisclosure(false);
  const articleId = useScrollyStore((state) => state.articleId);
  const pages = useScrollyStore((state) => state.pages);
  const resetStore = useScrollyStore((state) => state.resetStore);

  return (
    <>
      <Tooltip label="Click here to reset this article.">
        <Button
          size="sm"
          leftSection={<IconRestore />}
          onClick={open}
          disabled={pages.length === 0 || !articleId}
        >
          Reset
        </Button>
      </Tooltip>
      {isModalOpened ? (
        <Modal
          centered
          opened={isModalOpened}
          onClose={close}
          title={<Title order={2}>Are you sure you want to reset?</Title>}
        >
          <Stack>
            <Box>
              Article that has been resetted cannot be restored. Have you downloaded them before
              reset?
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
                color="red"
                size="sm"
                onClick={() => {
                  deleteArticleFromLocalStorage();
                  resetStore();
                  close();
                }}
              >
                Reset
              </Button>
            </Group>
          </Stack>
        </Modal>
      ) : null}
    </>
  );
};

export default ResetButton;
