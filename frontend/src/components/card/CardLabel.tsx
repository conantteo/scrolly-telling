import React from 'react';
import { Text } from '@mantine/core';

interface CardLabelProps {
  label: React.ReactNode;
  position?: 'left' | 'right';
  background?: boolean;
}

const CardLabel: React.FC<CardLabelProps> = ({ label, position = 'left', background = true }) => {
  const stylePositions =
    position === 'left' ? { left: 0, backgroundColor: '#d0ebff' } : { right: 0 };
  const styleBackground = background ? { backgroundColor: '#d0ebff' } : {};
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
