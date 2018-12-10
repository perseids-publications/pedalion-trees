import React from 'react';
import { PerseidsHeader, PerseidsFooter } from 'perseids-react-components';

import Hero from './Hero';
import TreebankCollection from './TreebankCollection';
import TreebankCollection2 from './TreebankCollection2';

const App = () => (
  <React.Fragment>
    <PerseidsHeader>
      Example Treebanks
    </PerseidsHeader>
    <Hero />
    <TreebankCollection label="Collection 1" />
    <TreebankCollection2 label="Collection 2" />
    <PerseidsFooter
      github="https://github.com/perseids-publications/treebank-template"
      report="https://github.com/perseids-publications/treebank-template/issues"
    />
  </React.Fragment>
);

export default App;
