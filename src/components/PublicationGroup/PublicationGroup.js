import React from 'react';

import { configType } from '../../lib/types';

import Header from '../Header';
import Hero from '../Hero';
import Collection from '../Collection';

const renderCollection = (collection) => {
  const { title, publications } = collection;

  return (
    <Collection
      key={title}
      title={title}
      publications={publications}
    />
  );
};

const PublicationGroup = ({
  config: {
    logo,
    link,
    title,
    subtitle,
    collections,
  },
}) => (
  <>
    <Header logo={logo} link={link}>
      {title}
      <ul className="navbar-nav ml-auto">
        <li className="nav-item">
          <a className="nav-link" href={`${process.env.PUBLIC_URL}/`}>
            Home
          </a>
        </li>
      </ul>
    </Header>
    <Hero title={title} subtitle={subtitle} />
    {collections.map((c) => renderCollection(c))}
  </>
);

PublicationGroup.propTypes = {
  config: configType.isRequired,
};

export default PublicationGroup;
