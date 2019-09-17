import React from 'react';

import { configType } from '../../lib/types';

import Header from '../Header';
import Hero from '../Hero';
import Collection from '../Collection';

const renderCollection = (collection) => {
  const { title, text, publications } = collection;

  return (
    <Collection
      key={title}
      title={title}
      text={text}
      publications={publications}
    />
  );
};

const Home = ({ config }) => {
  const {
    logo,
    link,
    title,
    subtitle,
    collections,
  } = config;

  return (
    <>
      <Header logo={logo} link={link}>
        {title}
      </Header>
      <Hero title={title} subtitle={subtitle} />
      {collections.map((c) => renderCollection(c))}
    </>
  );
};

Home.propTypes = {
  config: configType.isRequired,
};

export default Home;
