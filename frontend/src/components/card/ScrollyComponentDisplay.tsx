import { AspectRatio, Box, Image, Text } from '@mantine/core';
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
        <>
          <AspectRatio ratio={1080 / 720} maw={500} mx="auto">
            <Image src={componentInProp.metadata?.fileBase64} />
          </AspectRatio>
          {componentInProp.metadata?.caption ? (
            <Text maw="500px" c="grey" mx="auto">
              {componentInProp.metadata?.caption}
            </Text>
          ) : null}
        </>
      ) : (
        <div
          style={{ overflowWrap: 'break-word' }}
          dangerouslySetInnerHTML={{ __html: componentInProp.metadata?.htmlContent ?? '' }}
        />
      );
    if (isFocused) {
      return <Box style={{ backgroundColor: '#d0ebff', minHeight: 25 }}>{componentToRender}</Box>;
    }
    return <Box style={{ minHeight: 25 }}>{componentToRender}</Box>;
  };

  const isFocused =
    currentScrollyFocusElement?.pageIndex === component.pageIndex &&
    currentScrollyFocusElement?.frameIndex === component.frameIndex;

  return <>{renderComponentOnFocus(component, isFocused)}</>;
};

export default ScrollyComponentDisplay;
