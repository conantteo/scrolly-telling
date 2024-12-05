import { useScrollyStore } from '../store';
import AnimationDrawer from './AnimationDrawer';
import ComponentDrawer from './ComponentDrawer';

const ScrollyRightPanel: React.FC = () => {
  const currentElementId = useScrollyStore((state) => state.currentElementId);
  const elements = useScrollyStore((state) => state.elements);
  const currentElement = elements[Number(currentElementId)];

  return currentElement.type === 'animation' ? <AnimationDrawer /> : <ComponentDrawer />;
};

export default ScrollyRightPanel;
