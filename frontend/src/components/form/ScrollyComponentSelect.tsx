import { useEffect, useState } from 'react';
import _ from 'lodash';
import { ComboboxLikeRenderOptionInput, Group, Select, SelectProps } from '@mantine/core';
import { useDebouncedState } from '@mantine/hooks';
import { useScrollyStore } from '../../store';
import { ScrollyComponent } from '../../types';

interface ScrollyComponentSelectProps {
  onComponentChanged: (component: ScrollyComponent | null) => void;
  currentComponents: ScrollyComponent[];
}

const ScrollyComponentSelect: React.FC<ScrollyComponentSelectProps> = ({
  onComponentChanged,
  currentComponents,
}) => {
  const [value, setValue] = useState('');
  const [focusValue, setFocusValue] = useDebouncedState<ScrollyComponent | null>(null, 500);
  const pages = useScrollyStore((state) => state.pages);
  const setScrollyFocusElement = useScrollyStore((state) => state.setScrollyFocusElement);
  const components = pages.flatMap((page) =>
    page.frames.flatMap((frame) => frame.components || [])
  );
  const allComponents = [...components, ...currentComponents];
  const selectData = allComponents
    .filter(
      (component) =>
        (component.type === 'image' && component.metadata?.fileBase64) ||
        (component.type === 'text' && component.metadata?.htmlContent)
    )
    .map((component, componentIndex) => {
      if (
        component.frameIndex !== undefined &&
        component.frameIndex >= 0 &&
        component.pageIndex !== undefined &&
        component.pageIndex >= 0
      ) {
        return {
          label: `[Page ${_.toNumber(component.pageIndex) + 1} - Frame ${_.toNumber(component.frameIndex) + 1}] ${_.upperFirst(component.type)} (${_.upperFirst(component.position)})`,
          value: `${componentIndex}`,
          data: component,
        };
      }
      return {
        label: `[New] ${_.upperFirst(component.type)} (${_.upperFirst(component.position)})`,
        value: `${componentIndex}`,
        data: component,
      };
    });

  const onComponentSelect = (
    componentIndex: string | null,
    option: { label: string; value: string; data?: ScrollyComponent }
  ) => {
    if (componentIndex) {
      setValue(componentIndex);
      if (option.data) {
        const component = option.data;
        onComponentChanged(_.cloneDeep(component));
      }
    } else {
      onComponentChanged(null);
    }
  };

  const renderSelectOption: SelectProps['renderOption'] = ({
    option,
  }: ComboboxLikeRenderOptionInput<{ label: string; value: string; data?: ScrollyComponent }>) => {
    if (option.data) {
      const component = option.data;
      return (
        <Group
          onMouseOver={() => setFocusValue(_.cloneDeep(component))}
          onMouseLeave={() => setFocusValue(null)}
          w="100%"
        >
          {option.label}
        </Group>
      );
    }
  };

  useEffect(() => {
    setScrollyFocusElement(focusValue);
  }, [focusValue, setScrollyFocusElement]);

  return (
    <Select
      disabled={selectData.length === 0}
      label="Use existing component?"
      placeholder="Select a component previously created"
      description="Previously created components can be reused here"
      data={selectData}
      searchable
      clearable
      allowDeselect={false}
      onChange={onComponentSelect}
      value={value}
      renderOption={renderSelectOption}
    />
  );
};

export default ScrollyComponentSelect;
