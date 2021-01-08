import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Treebank as TB,
  Sentence,
  Text,
  Graph,
  PartOfSpeech,
  Xml,
  Collapse,
} from 'treebank-react';
import fetch from 'cross-fetch';

import { chunksType, publicationMatchType, locationType } from '../../lib/types';

import styles from './Treebank.module.css';

import ControlPanel from '../ControlPanel';

import { parse, linkParams } from '../../lib/params';

class Treebank extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loadedXml: false,
    };

    this.additionalArgs = this.additionalArgs.bind(this);
    this.linkQuery = this.linkQuery.bind(this);
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

  linkQuery() {
    const { location: { search } } = this.props;

    return linkParams(search);
  }

  render() {
    const { chunks, match } = this.props;
    const { params: { chunk } } = match;
    const linkQuery = this.linkQuery();
    const fullQuery = this.additionalArgs();

    const { loadedXml } = this.state;
    const { setSubdoc } = this.props;

    if (!loadedXml) {
      return (
        <div>
          Loading...
        </div>
      );
    }

    return (
      <>
        <ControlPanel
          match={match}
          chunks={chunks}
          fullQuery={fullQuery}
          linkQuery={linkQuery}
        />
        <div className="mb-4">
          <TB treebank={loadedXml}>
            <Sentence id={chunk} callback={({ $: { subdoc } }) => setSubdoc(subdoc)}>
              <div className={styles.text}>
                <Text />
              </div>
              <div className={styles.graph}>
                <Graph />
              </div>
              <PartOfSpeech />
              <Collapse title="XML">
                <Xml />
              </Collapse>
            </Sentence>
          </TB>
        </div>
      </>
    );
  }
}

Treebank.propTypes = {
  chunks: chunksType.isRequired,
  match: publicationMatchType.isRequired,
  location: locationType.isRequired,
  xml: PropTypes.string.isRequired,
  setSubdoc: PropTypes.func.isRequired,
};

export default Treebank;
