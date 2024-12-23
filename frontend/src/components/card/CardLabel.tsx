import { Text } from '@mantine/core';

interface CardLabelProps {
  label: string;
}

const CardLabel: React.FC<CardLabelProps> = ({ label }) => (
  <Text
    style={{
      position: 'absolute',
      top: 0,
      left: 0,
      backgroundColor: '#d0ebff',
      padding: '4px',
      borderBottomRightRadius: '8px',
      zIndex: 1,
    }}
  >
    {label}
  </Text>
);

export default CardLabel;
