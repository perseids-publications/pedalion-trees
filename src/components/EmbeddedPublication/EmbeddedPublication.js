import React from 'react';
import PropTypes from 'prop-types';

import { publicationMatchType, locationType } from '../../lib/types';

import EmbeddedTreebank from '../EmbeddedTreebank';

const EmbeddedPublication = ({ xml, match, location }) => (
  <div>
    <EmbeddedTreebank
      xml={xml}
      location={location}
      match={match}
    />
  </div>
);

EmbeddedPublication.propTypes = {
  xml: PropTypes.string.isRequired,
  match: publicationMatchType.isRequired,
  location: locationType.isRequired,
};

export default EmbeddedPublication;
