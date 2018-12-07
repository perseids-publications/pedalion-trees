import React from 'react';

import { PerseidsHeader, PerseidsFooter } from 'perseids-react-components';

const App = () => (
  <React.Fragment>
    <PerseidsHeader>
      Example Treebanks
    </PerseidsHeader>
    <div className="container text-center">
      <h1 className="h3 pt-4 mb-1 font-weight-normal">
        Hello World
      </h1>
    </div>
    <PerseidsFooter
      github="https://github.com/perseids-publications/treebank-template"
      report="https://github.com/perseids-publications/treebank-template/issues"
    />
  </React.Fragment>
);

export default App;
