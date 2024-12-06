import { useScrollyStore } from '../store';
import ScrollyComponentForm from './ScrollyComponentForm';

const ScrollyRightPanel: React.FC = () => {
  const currentElementId = useScrollyStore((state) => state.currentElementId);

  return <div>{currentElementId ? <ScrollyComponentForm /> : null}</div>;
};

export default ScrollyRightPanel;
