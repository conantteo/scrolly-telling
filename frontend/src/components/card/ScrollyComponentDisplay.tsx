import { AspectRatio, Box, Image } from '@mantine/core';
import { useScrollyStore } from '../../store';
import { ScrollyComponent } from '../../types';

interface ScrollyComponentDisplayProps {
  component: ScrollyComponent;
}

const ScrollyComponentDisplay: React.FC<ScrollyComponentDisplayProps> = ({ component }) => {
  const currentScrollyFocusElement = useScrollyStore((state) => state.currentScrollyFocusElement);

  const renderComponentOnFocus = (componentInProp: ScrollyComponent, isFocused: boolean) => {
    const componentToRender =
      componentInProp.type === 'image' ? (
        <AspectRatio ratio={1080 / 720} maw={500} mx="auto">
          <Image src={componentInProp.metadata?.fileBase64} />
        </AspectRatio>
      ) : (
        <div dangerouslySetInnerHTML={{ __html: componentInProp.metadata?.htmlContent ?? '' }} />
      );
    if (isFocused) {
      return <Box style={{ backgroundColor: 'red', minHeight: 25 }}>{componentToRender}</Box>;
    }
    return <Box style={{ minHeight: 25 }}>{componentToRender}</Box>;
  };

  const isFocused =
    currentScrollyFocusElement?.pageIndex === component.pageIndex &&
    currentScrollyFocusElement?.frameIndex === component.frameIndex;

  return <>{renderComponentOnFocus(component, isFocused)}</>;
};

export default ScrollyComponentDisplay;
