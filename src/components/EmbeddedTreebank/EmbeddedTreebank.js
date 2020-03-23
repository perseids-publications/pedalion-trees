import React, { Component } from 'react';
import PropTypes from 'prop-types';
import queryString from 'query-string';

import { publicationMatchType, locationType } from '../../lib/types';

import styles from './EmbeddedTreebank.module.css';

import ArethusaWrapper from '../ArethusaWrapper';
import TreebankService from '../TreebankService';

class EmbeddedTreebank extends Component {
  constructor(props) {
    super(props);

    this.additionalArgs = this.additionalArgs.bind(this);
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
    const { match, arethusa } = this.props;
    const { params: { publication, chunk } } = match;

    return (
      <>
        <div className="__artsa">
          <div id="treebank_container" className={styles.treebankContainer} />
        </div>
        <div className={styles.links}>
          <a href={`${process.env.PUBLIC_URL}/${publication}/${chunk}`} target="_blank" rel="noopener noreferrer">
            Credits and more information
          </a>
        </div>
        <TreebankService arethusa={arethusa} />
      </>
    );
  }
}

EmbeddedTreebank.propTypes = {
  arethusa: PropTypes.instanceOf(ArethusaWrapper).isRequired,
  match: publicationMatchType.isRequired,
  location: locationType.isRequired,
  xml: PropTypes.string.isRequired,
};

export default EmbeddedTreebank;
