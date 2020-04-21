import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { chunksType, publicationMatchType, locationType } from '../../lib/types';

import styles from './Treebank.module.css';

import ArethusaWrapper from '../ArethusaWrapper';
import ControlPanel from '../ControlPanel';

import { parse, linkParams } from '../../lib/params';

class Treebank extends Component {
  constructor(props) {
    super(props);

    this.additionalArgs = this.additionalArgs.bind(this);
    this.linkQuery = this.linkQuery.bind(this);
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

    return parse(search);
  }

  linkQuery() {
    const { location: { search } } = this.props;

    return linkParams(search);
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
    const linkQuery = this.linkQuery();
    const fullQuery = this.additionalArgs();

    return (
      <>
        <ControlPanel
          match={match}
          chunks={chunks}
          fullQuery={fullQuery}
          linkQuery={linkQuery}
        />
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
