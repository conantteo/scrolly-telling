import { Anchor, Box, Breadcrumbs } from '@mantine/core';

interface HeaderProps {
  articleId: string;
}

const Header: React.FC<HeaderProps> = ({ articleId }) => {
  const items = [
    { title: 'Articles', href: '#' },
    { title: `${articleId}`, href: `${articleId}` },
  ].map((item, index) => (
    <Anchor href={item.href} key={index}>
      {item.title}
    </Anchor>
  ));
  return (
    <Box>
      <Breadcrumbs>{items}</Breadcrumbs>
    </Box>
  );
};

export default Header;
