import { useState } from 'react';
import { Box, Button, Group, TextInput, Tooltip } from '@mantine/core';
import { useScrollyStore } from '../store';

const DEFAULT_TITLE = 'Enter title';

const Header: React.FC = () => {
  const [isEditable, setIsEditable] = useState(false);
  const setArticleTitle = useScrollyStore((state) => state.setArticleTitle);
  const [title, setTitle] = useState(DEFAULT_TITLE);

  return (
    <Box>
      {isEditable ? (
        <Group>
          <TextInput
            maxLength={255}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
          <Tooltip label="Save title">
            <Button
              size="sm"
              onClick={() => {
                setTitle(title);
                setArticleTitle(title);
                setIsEditable(false);
              }}
            >
              Save
            </Button>
          </Tooltip>
        </Group>
      ) : (
        <Box onClick={() => setIsEditable(true)} key={0}>
          {title}
        </Box>
      )}
    </Box>
  );
};

export default Header;
