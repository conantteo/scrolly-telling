import { useScrollyStore } from '../store';
import ScrollyAnimationForm from './ScrollyAnimationForm';
import ScrollyComponentForm from './ScrollyComponentForm';

const ScrollyRightPanel: React.FC = () => {
  const currentElementId = useScrollyStore((state) => state.currentElementId);
  const elements = useScrollyStore((state) => state.elements);
  const currentElement = elements[Number(currentElementId)];

  return currentElement.type === 'animation' ? <ScrollyAnimationForm /> : <ScrollyComponentForm />;
};

export default ScrollyRightPanel;
