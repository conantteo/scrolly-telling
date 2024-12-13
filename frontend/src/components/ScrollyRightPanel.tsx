import { useScrollyStore } from '../store';
import ScrollyForm from './form/ScrollyForm';

const ScrollyRightPanel: React.FC = () => {
  const currentElementId = useScrollyStore((state) => state.currentElementId);

  return <div>{currentElementId ? <ScrollyForm /> : null}</div>;
};

export default ScrollyRightPanel;
