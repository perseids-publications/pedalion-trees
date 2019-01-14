import React from 'react';
import PropTypes from 'prop-types';

import './Hero.css';

const renderSubtitle = subtitle => (
  <p>
    <span>
      {subtitle}
    </span>
  </p>
);

const Hero = ({ title, subtitle }) => (
  <div className="jumbotron jumbotron-fluid jumbotron-small bg-dark">
    <div className="container text-light">
      <h1 className="display-4">
        {title}
      </h1>
      {subtitle && renderSubtitle(subtitle)}
    </div>
  </div>
);

Hero.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string.isRequired,
};

export default Hero;
