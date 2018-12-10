import React from 'react';
import { PerseidsHeader, PerseidsFooter } from 'perseids-react-components';
import { BrowserRouter as Router, Route, Switch, Link } from 'react-router-dom';

import Hero from './Hero';
import TreebankCollection from './TreebankCollection';
import TreebankCollection2 from './TreebankCollection2';
import Treebank from './Treebank';

const Index = () => (
  <React.Fragment>
    <PerseidsHeader>
      Example Treebanks
    </PerseidsHeader>
    <Hero />
    <TreebankCollection label="Collection 1" />
    <TreebankCollection2 label="Collection 2" />
  </React.Fragment>
);

const Aeschines = () => (
  <React.Fragment>
    <PerseidsHeader>
      <span>
        Aeschines,
        <i> Against Timarchus </i>
        1-50
      </span>
      <ul className="navbar-nav ml-auto">
        <li className="nav-item">
          <Link className="nav-link" to="/">
            Home
          </Link>
        </li>
      </ul>
    </PerseidsHeader>
    <div className="container pt-3">
      <h2>
        <span>
          Aeschines,
          <i> Against Timarchus </i>
          1-50
        </span>
      </h2>
      <table className="table">
        <tbody>
          <tr>
            <th scope="col">Author</th>
            <td scope="row">Aeschines</td>
          </tr>
          <tr>
            <th scope="col">Work</th>
            <td>Against Timarchus</td>
          </tr>
          <tr>
            <th scope="col">Editors</th>
            <td>Vanessa Gorman, Bob Gorman</td>
          </tr>
          <tr>
            <th scope="col">Locus</th>
            <td>1-50</td>
          </tr>
          <tr>
            <th scope="col">Notes</th>
            <td>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</td>
          </tr>
        </tbody>
      </table>
      <div style={{ "minHeight": "400px" }}>
        <Treebank url="aeschines.xml" />
      </div>
    </div>
  </React.Fragment>
)

const Lysias = () => (
  <React.Fragment>
    <PerseidsHeader>
      <span>
        Lysias,
        <i> Against Agoratus </i>
        1-261
      </span>
      <ul className="navbar-nav ml-auto">
        <li className="nav-item">
          <Link className="nav-link" to="/">
            Home
          </Link>
        </li>
      </ul>
    </PerseidsHeader>
    <div className="container pt-3">
      <h2>
        <span>
          Lysias,
          <i> Against Agoratus </i>
          1-261
        </span>
      </h2>
      <table className="table">
        <tbody>
          <tr>
            <th scope="col">Author</th>
            <td scope="row">Lysias</td>
          </tr>
          <tr>
            <th scope="col">Work</th>
            <td>Against Agoratus</td>
          </tr>
          <tr>
            <th scope="col">Editors</th>
            <td>Vanessa Gorman</td>
          </tr>
          <tr>
            <th scope="col">Locus</th>
            <td>1-261</td>
          </tr>
          <tr>
            <th scope="col">Notes</th>
            <td>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</td>
          </tr>
        </tbody>
      </table>
      <div style={{ "minHeight": "400px" }}>
        <Treebank url="lysias.xml" />
      </div>
    </div>
  </React.Fragment>
);

const Polybius = () => (
  <React.Fragment>
    <PerseidsHeader>
      <span>
        Polybius,
        <i> Histories </i>
        1-9
      </span>
      <ul className="navbar-nav ml-auto">
        <li className="nav-item">
          <Link className="nav-link" to="/">
            Home
          </Link>
        </li>
      </ul>
    </PerseidsHeader>
    <div className="container pt-3">
      <h2>
        <span>
          Polybius,
          <i> Histories </i>
          1-9
        </span>
      </h2>
      <table className="table">
        <tbody>
          <tr>
            <th scope="col">Author</th>
            <td scope="row">Polybius</td>
          </tr>
          <tr>
            <th scope="col">Work</th>
            <td>Histories</td>
          </tr>
          <tr>
            <th scope="col">Editors</th>
            <td>Bob Gorman</td>
          </tr>
          <tr>
            <th scope="col">Locus</th>
            <td>1-9</td>
          </tr>
          <tr>
            <th scope="col">Notes</th>
            <td>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</td>
          </tr>
        </tbody>
      </table>
      <div style={{ "minHeight": "400px" }}>
        <Treebank url="polybius.xml" />
      </div>
    </div>
  </React.Fragment>
);

const Polybius2 = () => (
  <React.Fragment>
    <PerseidsHeader>
      <span>
        Polybius,
        <i> Histories </i>
        10-19
      </span>
      <ul className="navbar-nav ml-auto">
        <li className="nav-item">
          <Link className="nav-link" to="/">
            Home
          </Link>
        </li>
      </ul>
    </PerseidsHeader>
    <div className="container pt-3">
      <h2>
        <span>
          Polybius,
          <i> Histories </i>
          10-19
        </span>
      </h2>
      <table className="table">
        <tbody>
          <tr>
            <th scope="col">Author</th>
            <td scope="row">Polybius</td>
          </tr>
          <tr>
            <th scope="col">Work</th>
            <td>Histories</td>
          </tr>
          <tr>
            <th scope="col">Editors</th>
            <td>Bob Gorman</td>
          </tr>
          <tr>
            <th scope="col">Locus</th>
            <td>10-19</td>
          </tr>
          <tr>
            <th scope="col">Notes</th>
            <td>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</td>
          </tr>
        </tbody>
      </table>
      <div style={{ "minHeight": "400px" }}>
        <Treebank url="polybius2.xml" />
      </div>
    </div>
  </React.Fragment>
);

const App = () => (
  <Router basename={process.env.PUBLIC_URL}>
    <React.Fragment>
      <Switch>
        <Route exact path="/" component={Index} />
        <Route exact path="/aeschines" component={Aeschines} />
        <Route exact path="/lysias" component={Lysias} />
        <Route exact path="/polybius" component={Polybius} />
        <Route exact path="/polybius-2" component={Polybius2} />
      </Switch>
      <PerseidsFooter
        github="https://github.com/perseids-publications/treebank-template"
        report="https://github.com/perseids-publications/treebank-template/issues"
      />
    </React.Fragment>
  </Router>
);

export default App;
