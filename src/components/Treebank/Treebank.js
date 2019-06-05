import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { chunksType, publicationMatchType } from '../../lib/types';

import styles from './Treebank.module.css';

import ArethusaWrapper from '../ArethusaWrapper';
import ControlPanel from '../ControlPanel';

class Treebank extends Component {
  static propTypes = {
    arethusa: PropTypes.instanceOf(ArethusaWrapper).isRequired,
    chunks: chunksType.isRequired,
    match: publicationMatchType.isRequired,
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
          <div id="treebank_container" className={styles.treebankContainer} />
        </div>
      </React.Fragment>
    );
  }
}

export default Treebank;
