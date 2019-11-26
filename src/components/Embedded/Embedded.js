import React from 'react';
import { Route, Switch } from 'react-router-dom';

import { configType } from '../../lib/types';

import EmbeddedPublicationDirector from '../EmbeddedPublicationDirector';
import EmbeddedNotFound from '../EmbeddedNotFound';

const Embedded = ({ config }) => (
  <Switch>
    <Route exact path="/embed/:publication/:chunk" render={(props) => <EmbeddedPublicationDirector {...props} config={config} />} />
    <Route path="/" component={() => <EmbeddedNotFound config={config} />} />
  </Switch>
);

Embedded.propTypes = {
  config: configType.isRequired,
};

export default Embedded;
