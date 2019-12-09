import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { PerseidsFooter } from 'perseids-react-components';

import { configType } from '../../lib/types';

import Home from '../Home';
import PublicationDirector from '../PublicationDirector';
import PublicationGroupDirector from '../PublicationGroupDirector';
import NotFound from '../NotFound';

const Page = ({
  config,
  config: {
    copyright,
    report,
    github,
    twitter,
  },
}) => (
  <>
    <Switch>
      <Route exact path="/" component={() => <Home config={config} />} />
      <Route exact path="/:publication/" render={(props) => <PublicationGroupDirector {...props} config={config} />} />
      <Route exact path="/:publication/:chunk" render={(props) => <PublicationDirector {...props} config={config} />} />
      <Route path="/" component={() => <NotFound config={config} />} />
    </Switch>
    <PerseidsFooter
      copyright={copyright}
      report={report}
      github={github}
      twitter={twitter}
    />
  </>
);

Page.propTypes = {
  config: configType.isRequired,
};

export default Page;
