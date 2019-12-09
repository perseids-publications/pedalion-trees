import React from 'react';
import { string, node } from 'prop-types';
import { PerseidsHeader } from 'perseids-react-components';

const Header = ({ logo, link, children }) => {
  if (link !== undefined) {
    return <PerseidsHeader logo={logo} props={{ href: link }}>{children}</PerseidsHeader>;
  }

  return <PerseidsHeader logo={logo}>{children}</PerseidsHeader>;
};

Header.propTypes = {
  logo: string,
  link: string,
  children: node.isRequired,
};

Header.defaultProps = {
  logo: undefined,
  link: undefined,
};

export default Header;
