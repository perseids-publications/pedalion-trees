import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { chunksType, matchType } from './types';
import ArethusaWrapper from './lib/ArethusaWrapper';

import ControlPanel from './ControlPanel';

class Treebank extends Component {
  static propTypes = {
    arethusa: PropTypes.instanceOf(ArethusaWrapper).isRequired,
    chunks: chunksType.isRequired,
    match: matchType.isRequired,
    xml: PropTypes.string.isRequired,
  };

  componentDidMount() {
    this.renderArethusa();
  }

  componentDidUpdate() {
    this.renderArethusa();
  }

  renderArethusa() {
    const { xml, match: { params: { chunk } }, arethusa: { render } } = this.props;

    render(xml, chunk);
  }

  render() {
    const { chunks, match } = this.props;

    return (
      <React.Fragment>
        <ControlPanel match={match} chunks={chunks} />
        <div className="__artsa">
          <div id="treebank_container" style={{ position: 'relative' }} />
        </div>
      </React.Fragment>
    );
  }
}

export default Treebank;
