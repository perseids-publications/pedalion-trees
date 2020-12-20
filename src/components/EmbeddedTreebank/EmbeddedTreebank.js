import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { publicationMatchType, locationType } from '../../lib/types';

import styles from './EmbeddedTreebank.module.css';

import ArethusaWrapper from '../ArethusaWrapper';
import TreebankStyles from '../TreebankStyles';
import TreebankService from '../TreebankService';

import { parse } from '../../lib/params';

class EmbeddedTreebank extends Component {
  componentDidMount() {
    this.renderArethusa();
  }

  componentDidUpdate() {
    this.renderArethusa();
  }

  renderArethusa() {
    const {
      xml,
      match: { params: { chunk } },
      arethusa: { render },
      location: { search },
    } = this.props;
    const additionalArgs = parse(search);

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
        <TreebankStyles />
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
