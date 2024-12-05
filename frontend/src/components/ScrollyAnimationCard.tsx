import React from 'react';
import { IconBoltFilled } from '@tabler/icons-react';
import { ActionIcon, Divider } from '@mantine/core';
import { useScrollyStore } from '../store';

export interface ScrollyAnimationCardProps {
  id: string;
  isNew?: boolean;
  isOpen?: boolean;
}

const ScrollyAnimationCard: React.FC<ScrollyAnimationCardProps> = ({ id, isOpen = false }) => {
  const setViewElement = useScrollyStore((state) => state.setViewElement);
  const getGradient = () => {
    if (isOpen) {
      return {
        from: 'red',
        to: 'orange',
        deg: 90,
      };
    }
    return {
      from: 'blue',
      to: 'cyan',
      deg: 90,
    };
  };
  return (
    <Divider
      my="lg"
      variant="solid"
      labelPosition="center"
      label={
        <ActionIcon
          variant="gradient"
          size="xl"
          aria-label="Gradient action icon"
          gradient={getGradient()}
          onClick={() => {
            setViewElement(id, !isOpen);
          }}
        >
          <IconBoltFilled size={12} />
        </ActionIcon>
      }
    />
  );
};

export default ScrollyAnimationCard;
