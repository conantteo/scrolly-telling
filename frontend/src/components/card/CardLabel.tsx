import React from 'react';
import { Text } from '@mantine/core';

interface CardLabelProps {
  label: React.ReactNode;
  position?: 'left' | 'right';
  backgroundColor?: string;
}

const CardLabel: React.FC<CardLabelProps> = ({
  label,
  position = 'left',
  backgroundColor = '#d0ebff',
}) => {
  const stylePositions = position === 'left' ? { left: 0, backgroundColor } : { right: 0 };
  const styleBackground = { backgroundColor };
  return (
    <Text
      style={{
        ...stylePositions,
        ...styleBackground,
        position: 'absolute',
        top: 0,
        padding: '4px',
        borderBottomRightRadius: '8px',
        zIndex: 1,
      }}
    >
      {label}
    </Text>
  );
};

export default CardLabel;
