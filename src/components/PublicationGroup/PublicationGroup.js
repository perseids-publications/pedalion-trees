import React from 'react';
import { PerseidsHeader } from 'perseids-react-components';

import { configType } from '../../lib/types';

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

const PublicationGroup = ({ config: { title, subtitle, collections } }) => (
  <React.Fragment>
    <PerseidsHeader>
      {title}
      <ul className="navbar-nav ml-auto">
        <li className="nav-item">
          <a className="nav-link" href={`${process.env.PUBLIC_URL}/`}>
            Home
          </a>
        </li>
      </ul>
    </PerseidsHeader>
    <Hero title={title} subtitle={subtitle} />
    {collections.map(c => renderCollection(c))}
  </React.Fragment>
);

PublicationGroup.propTypes = {
  config: configType.isRequired,
};

export default PublicationGroup;
