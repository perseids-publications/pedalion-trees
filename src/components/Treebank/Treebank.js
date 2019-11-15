import React, { Component } from 'react';
import PropTypes from 'prop-types';
import queryString from 'query-string';

import { chunksType, publicationMatchType, locationType } from '../../lib/types';

import styles from './Treebank.module.css';

import ArethusaWrapper from '../ArethusaWrapper';
import ControlPanel from '../ControlPanel';

class Treebank extends Component {
  constructor(props) {
    super(props);

    this.additionalArgs = this.additionalArgs.bind(this);
    this.refreshControlPanel = this.refreshControlPanel.bind(this);
    this.renderArethusa = this.renderArethusa.bind(this);
  }

  componentDidMount() {
    this.renderArethusa();
  }

  componentDidUpdate() {
    this.renderArethusa();
  }

  additionalArgs() {
    const { location: { search } } = this.props;
    const parsed = queryString.parse(search);
    const result = {};

    ['w'].forEach((n) => {
      if (Object.prototype.hasOwnProperty.call(parsed, n)) {
        result[n] = parsed[n];
      }
    });

    return result;
  }

  refreshControlPanel() {
    return Object.keys(this.additionalArgs()).length !== 0;
  }

  renderArethusa() {
    const {
      xml,
      match: { params: { chunk } },
      arethusa: { render },
    } = this.props;
    const additionalArgs = this.additionalArgs();

    render(xml, chunk, additionalArgs);
  }

  render() {
    const { chunks, match } = this.props;
    const refreshControlPanel = this.refreshControlPanel();

    return (
      <>
        <ControlPanel match={match} chunks={chunks} refresh={refreshControlPanel} />
        <div className="__artsa">
          <div id="treebank_container" className={styles.treebankContainer} />
        </div>
      </>
    );
  }
}

Treebank.propTypes = {
  arethusa: PropTypes.instanceOf(ArethusaWrapper).isRequired,
  chunks: chunksType.isRequired,
  match: publicationMatchType.isRequired,
  location: locationType.isRequired,
  xml: PropTypes.string.isRequired,
};

export default Treebank;
