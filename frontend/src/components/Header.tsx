import { v4 as uuidv4 } from 'uuid';
import { Anchor, Box, Breadcrumbs } from '@mantine/core';

const MOCK_UUID = uuidv4();

const items = [
  { title: 'Articles', href: '#' },
  { title: `${MOCK_UUID}`, href: `${MOCK_UUID}` },
].map((item, index) => (
  <Anchor href={item.href} key={index}>
    {item.title}
  </Anchor>
));

const Header = () => {
  return (
    <Box>
      <Breadcrumbs>{items}</Breadcrumbs>
    </Box>
  );
};

export default Header;
