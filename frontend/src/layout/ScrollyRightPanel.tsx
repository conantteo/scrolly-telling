import { Box } from '@mantine/core';
import ScrollyForm from '../components/form/ScrollyForm';
import { useScrollyStore } from '../store';

const ScrollyRightPanel: React.FC = () => {
  const currentElementId = useScrollyStore((state) => state.currentElementId);

  return <Box>{currentElementId ? <ScrollyForm /> : null}</Box>;
};

export default ScrollyRightPanel;
