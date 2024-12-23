import { useEffect, useState } from 'react';
import _ from 'lodash';
import { Group, Select, SelectProps } from '@mantine/core';
import { useDebouncedState } from '@mantine/hooks';
import { useScrollyStore } from '../../store';
import { ScrollyComponent } from '../../types';

interface ScrollyComponentSelectProps {
  onComponentChanged: (component: ScrollyComponent | null) => void;
}

const ScrollyComponentSelect: React.FC<ScrollyComponentSelectProps> = ({ onComponentChanged }) => {
  const [value, setValue] = useState('');
  const [focusValue, setFocusValue] = useDebouncedState<ScrollyComponent | null>(null, 500);
  const data = useScrollyStore((state) => state.pages);
  const setScrollyFocusElement = useScrollyStore((state) => state.setScrollyFocusElement);
  const components = data.flatMap((page) => page.frames.flatMap((frame) => frame.components || []));
  const selectData = components.map((component, componentIndex) => ({
    label: `[Page ${_.toNumber(component.pageIndex) + 1} - Frame ${_.toNumber(component.frameIndex) + 1}] ${_.upperFirst(component.type)} (${_.upperFirst(component.position)})`,
    value: `${componentIndex}`,
    metadata: { ...component },
  }));

  const onComponentSelect = (componentIndex: string | null) => {
    if (componentIndex) {
      setValue(componentIndex);
      onComponentChanged(components[Number(componentIndex)]);
    } else {
      onComponentChanged(null);
    }
  };

  const renderSelectOption: SelectProps['renderOption'] = ({ option }) => (
    <Group
      onMouseEnter={() => setFocusValue({ ...components[Number(option.value)] })}
      onMouseLeave={() => setFocusValue(null)}
    >
      {option.label}
    </Group>
  );

  useEffect(() => {
    setScrollyFocusElement(focusValue);
  }, [focusValue]);

  return (
    <Select
      disabled={selectData.length === 0}
      label="Use existing component?"
      placeholder="Select a component previously created"
      description="Previously created components can be reused here"
      data={selectData}
      searchable
      clearable
      onChange={(value) => onComponentSelect(value)}
      value={value}
      renderOption={renderSelectOption}
    />
  );
};

export default ScrollyComponentSelect;
