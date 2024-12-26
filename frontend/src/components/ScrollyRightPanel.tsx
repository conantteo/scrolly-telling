import { Box } from '@mantine/core';
import { useScrollyStore } from '../store';
import ScrollyForm from './form/ScrollyForm';

const ScrollyRightPanel: React.FC = () => {
  const currentElementId = useScrollyStore((state) => state.currentElementId);

  return <Box>{currentElementId ? <ScrollyForm /> : null}</Box>;
};

export default ScrollyRightPanel;
