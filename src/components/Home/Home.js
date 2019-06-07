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

const Home = ({ config }) => {
  const { title, subtitle, collections } = config;

  return (
    <React.Fragment>
      <PerseidsHeader>
        {title}
      </PerseidsHeader>
      <Hero title={title} subtitle={subtitle} />
      {collections.map(c => renderCollection(c))}
    </React.Fragment>
  );
};

Home.propTypes = {
  config: configType.isRequired,
};

export default Home;
