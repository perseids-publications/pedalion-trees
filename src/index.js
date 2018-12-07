import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'perseids-react-components/build/css/index.css';

ReactDOM.render(<App />, document.getElementById('root'));

serviceWorker.register();
