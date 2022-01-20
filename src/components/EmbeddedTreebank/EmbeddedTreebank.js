import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Treebank as TB,
  Sentence,
  Text,
  Graph,
  PartOfSpeech,
} from 'treebank-react';
import fetch from 'cross-fetch';

import { publicationMatchType, locationType } from '../../lib/types';

import styles from './EmbeddedTreebank.module.css';

import TreebankService from '../TreebankService';

import { parse } from '../../lib/params';

const renderLoading = () => (
  <div>
    Loading...
  </div>
);

class EmbeddedTreebank extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loadedXml: false,
      configuration: undefined,
      treebank: undefined,
    };

    this.additionalArgs = this.additionalArgs.bind(this);
    this.callback = this.callback.bind(this);
    this.renderTreebank = this.renderTreebank.bind(this);
  }

  componentDidMount() {
    const { xml } = this.props;

    fetch(`${process.env.PUBLIC_URL}/xml/${xml}`)
      .then((response) => response.text())
      .then((loadedXml) => {
        this.setState({ loadedXml });
      });
  }

  additionalArgs() {
    const { location: { search } } = this.props;

    return parse(search);
  }

  callback({ treebank, configuration }) {
    this.setState({ treebank, configuration });
  }

  renderTreebank() {
    const { match } = this.props;
    const { loadedXml } = this.state;

    const { params: { publication, chunk } } = match;
    const fullQuery = this.additionalArgs();

    const { w: highlight } = fullQuery;

    return (
      <div className={styles.treebankContainer}>
        <TB treebank={loadedXml}>
          <Sentence
            id={chunk}
            highlight={highlight || []}
            callback={this.callback}
          >
            <div className={styles.text}>
              <Text />
            </div>
            <div className={styles.graph}>
              <Graph />
            </div>
            <PartOfSpeech />
          </Sentence>
        </TB>
        <div className={styles.links}>
          <p>
            <a href={`${process.env.PUBLIC_URL}/${publication}/${chunk}`} target="_blank" rel="noopener noreferrer">
              Credits and more information
            </a>
          </p>
        </div>
      </div>
    );
  }

  render() {
    const { loadedXml, treebank, configuration } = this.state;
    const loaded = !!(loadedXml && treebank && configuration);

    return (
      <>
        {!loaded && renderLoading()}
        {loadedXml && this.renderTreebank()}
        <TreebankService
          loaded={loaded}
          treebank={treebank}
          configuration={configuration}
        />
      </>
    );
  }
}

EmbeddedTreebank.propTypes = {
  match: publicationMatchType.isRequired,
  location: locationType.isRequired,
  xml: PropTypes.string.isRequired,
};

export default EmbeddedTreebank;
