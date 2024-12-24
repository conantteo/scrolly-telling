import { useEffect, useState } from 'react';
import _ from 'lodash';
import { Group, Select, SelectProps } from '@mantine/core';
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
      if (!component.pageIndex || !component.frameIndex) {
        return {
          label: `[Current page] ${_.upperFirst(component.type)} (${_.upperFirst(component.position)})`,
          value: `${componentIndex}`,
          metadata: { ...component },
        };
      }
      return {
        label: `[Page ${_.toNumber(component.pageIndex) + 1} - Frame ${_.toNumber(component.frameIndex) + 1}] ${_.upperFirst(component.type)} (${_.upperFirst(component.position)})`,
        value: `${componentIndex}`,
        metadata: { ...component },
      };
    });

  const onComponentSelect = (componentIndex: string | null) => {
    console.log({ componentIndex, component: allComponents[Number(componentIndex)] });
    if (componentIndex) {
      setValue(componentIndex);
      onComponentChanged(allComponents[Number(componentIndex)]);
    } else {
      onComponentChanged(null);
    }
  };

  const renderSelectOption: SelectProps['renderOption'] = ({ option }) => (
    <Group
      onMouseEnter={() => setFocusValue({ ...allComponents[Number(option.value)] })}
      onMouseLeave={() => setFocusValue(null)}
    >
      {option.label}
    </Group>
  );

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
      onChange={(value) => onComponentSelect(value)}
      value={value}
      renderOption={renderSelectOption}
    />
  );
};

export default ScrollyComponentSelect;
