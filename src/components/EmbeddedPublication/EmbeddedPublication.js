import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { publicationMatchType, locationType } from '../../lib/types';

import ArethusaWrapper from '../ArethusaWrapper';
import EmbeddedTreebank from '../EmbeddedTreebank';

class EmbeddedPublication extends Component {
  constructor(props) {
    super(props);

    this.arethusa = new ArethusaWrapper();
  }

  render() {
    const {
      xml,
      match,
      location,
    } = this.props;

    return (
      <div>
        <EmbeddedTreebank
          xml={xml}
          location={location}
          match={match}
          arethusa={this.arethusa}
        />
      </div>
    );
  }
}

EmbeddedPublication.propTypes = {
  xml: PropTypes.string.isRequired,
  match: publicationMatchType.isRequired,
  location: locationType.isRequired,
};

export default EmbeddedPublication;
