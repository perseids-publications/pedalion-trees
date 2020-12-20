import React from 'react';
import { Route, Switch } from 'react-router-dom';

import GettingStarted from './GettingStarted';
import Doi from './Doi';
import Updating from './Updating';
import NotFound from '../NotFound';

import { configType } from '../../lib/types';

const Instructions = ({ config }) => (
  <>
    <Switch>
      <Route exact path="/instructions/getting-started" component={() => <GettingStarted config={config} />} />
      <Route exact path="/instructions/doi" component={() => <Doi config={config} />} />
      <Route exact path="/instructions/updating" component={() => <Updating config={config} />} />
      <Route component={() => <NotFound config={config} />} />
    </Switch>
  </>
);

Instructions.propTypes = {
  config: configType.isRequired,
};

export default Instructions;
