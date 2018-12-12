import React from 'react';
import { PerseidsFooter } from 'perseids-react-components';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import config from './config.json';

import Home from './Home';
import PublicationDirector from './PublicationDirector';
import NotFound from './NotFound';

const { copyright, report, github, twitter } = config;

const App = () => (
  <Router basename={process.env.PUBLIC_URL}>
    <React.Fragment>
      <Switch>
        <Route exact path="/" component={() => <Home config={config} />} />
        <Route path="/:publication/:chunk" render={(props) => <PublicationDirector {...props} config={config} />} />
        <Route component={NotFound} />
      </Switch>
      <PerseidsFooter
        copyright={copyright}
        report={report}
        github={github}
        twitter={twitter}
      />
    </React.Fragment>
  </Router>
);

export default App;
