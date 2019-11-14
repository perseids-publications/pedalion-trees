import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import config from '../../config.json';

import Page from '../Page';
import Embedded from '../Embedded';

const App = () => (
  <Router basename={process.env.PUBLIC_URL}>
    <Switch>
      <Route path="/embed/" component={() => <Embedded config={config} />} />
      <Route path="/" component={() => <Page config={config} />} />
    </Switch>
  </Router>
);

export default App;
