import React from 'react';
import { Link } from 'react-router-dom';

import { configType } from '../../lib/types';

import Header from '../Header';

const NotFound = ({ config: { logo, link } }) => (
  <>
    <Header logo={logo} link={link}>
      <span>
        Not Found
      </span>
      <ul className="navbar-nav ml-auto">
        <li className="nav-item">
          <Link className="nav-link" to="/">
            Home
          </Link>
        </li>
      </ul>
    </Header>
    <div className="container pt-5">
      <div className="row col-12 pt-5 pb-3">
        <div className="col-12 text-center">
          <h1>Error 404</h1>
        </div>
      </div>
      <div className="row col-12 pb-3">
        <div className="col-12 text-center">
          <h2>Publication not found</h2>
        </div>
      </div>
      <div className="row col-12 pb-3">
        <div className="col-12 text-center">
          <h2>
            <Link to="/">
              Return to homepage
            </Link>
          </h2>
        </div>
      </div>
    </div>
  </>
);

NotFound.propTypes = {
  config: configType.isRequired,
};

export default NotFound;
