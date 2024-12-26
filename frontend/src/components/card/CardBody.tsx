import { ReactNode } from 'react';
import { Box } from '@mantine/core';

interface CardBodyProps {
  children: ReactNode;
}

const CardBody: React.FC<CardBodyProps> = ({ children }) => <Box mt={20}>{children}</Box>;

export default CardBody;
