import React from 'react';
import { PerseidsFooter } from 'perseids-react-components';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import config from './config.json';

import Home from './Home';
import PublicationDirector from './PublicationDirector';

const App = () => (
  <Router basename={process.env.PUBLIC_URL}>
    <React.Fragment>
      <Switch>
        <Route exact path="/" component={() => <Home config={config} />} />
        <Route path="/:publication/:chunk" render={(props) => <PublicationDirector {...props} config={config} />} />
      </Switch>
      <PerseidsFooter
        github="https://github.com/perseids-publications/treebank-template"
        report="https://github.com/perseids-publications/treebank-template/issues"
      />
    </React.Fragment>
  </Router>
);

export default App;
