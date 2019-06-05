import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';

import config from '../../config.json';

import Page from '../Page';

const App = () => (
  <Router basename={process.env.PUBLIC_URL}>
    <Page config={config} />
  </Router>
);

export default App;
