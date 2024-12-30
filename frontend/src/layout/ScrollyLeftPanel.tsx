import { IconPlus } from '@tabler/icons-react';
import _ from 'lodash';
import { Box, Button, Center, Tooltip } from '@mantine/core';
import ScrollyComponentCard from '../components/card/ScrollyComponentCard';
import { useScrollyStore } from '../store';
import { ScrollyContainerElementProps } from '../types';

const ScrollyLeftPanel: React.FC = () => {
  const elements = useScrollyStore((state) => state.elements);
  const setElement = useScrollyStore((state) => state.setElement);
  const setCurrentElementId = useScrollyStore((state) => state.setCurrentElementId);
  const onCreateNew = (element: ScrollyContainerElementProps) => {
    setElement(element.id, _.cloneDeep(element));
    setCurrentElementId(element.id);
  };
  return (
    <Box>
      {elements.map((element) => {
        if (element.isNew) {
          return (
            <Center key={element.id}>
              <Tooltip label="Add new page">
                <Button
                  leftSection={<IconPlus />}
                  onClick={() => onCreateNew(element)}
                  color="blue"
                >
                  New
                </Button>
              </Tooltip>
            </Center>
          );
        }
        return (
          <Box key={element.id} py={8}>
            <ScrollyComponentCard {...element} />
          </Box>
        );
      })}
    </Box>
  );
};

export default ScrollyLeftPanel;
