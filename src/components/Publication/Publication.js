import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { PerseidsHeader } from 'perseids-react-components';

import { chunksType, publicationMatchType } from '../../lib/types';

import styles from './Publication.module.css';

import ArethusaWrapper from '../ArethusaWrapper';
import Treebank from '../Treebank';
import Markdown from '../Markdown';

const renderText = (text) => {
  if (Array.isArray(text)) {
    return (
      <div>
        {text.map(t => (
          <span key={t}>
            {t}
            <br />
          </span>
        ))}
      </div>
    );
  }

  return text;
};

const renderRow = (title, text) => (
  <tr>
    <th scope="col">{title}</th>
    <td className={styles.publicationRow}>
      {renderText(text)}
    </td>
  </tr>
);

const renderLinkRow = (title, link) => (
  <tr>
    <th scope="col">{title}</th>
    <td>
      <a href={link}>{link}</a>
    </td>
  </tr>
);

const renderMarkdownRow = (title, markdown) => (
  <tr>
    <th scope="col">{title}</th>
    <td className={styles.publicationRow}>
      <Markdown source={markdown} />
    </td>
  </tr>
);

const renderLocusRow = (title, text, publicationPath) => (
  <tr>
    <th scope="col">{title}</th>
    <td className={styles.publicationRow}>
      {text}
      {' '}
      <a href={`../${publicationPath}`}>
        (See all)
      </a>
    </td>
  </tr>
);

class Publication extends Component {
  static propTypes = {
    publicationPath: PropTypes.string.isRequired,
    author: PropTypes.string.isRequired,
    work: PropTypes.string.isRequired,
    editors: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.arrayOf(PropTypes.string),
    ]).isRequired,
    locus: PropTypes.string.isRequired,
    link: PropTypes.string,
    notes: PropTypes.string,
    xml: PropTypes.string.isRequired,
    chunks: chunksType.isRequired,
    match: publicationMatchType.isRequired,
  };

  static defaultProps = {
    link: undefined,
    notes: undefined,
  };

  constructor(props) {
    super(props);

    this.arethusa = new ArethusaWrapper();
  }

  render() {
    const {
      publicationPath,
      author,
      work,
      editors,
      locus,
      link,
      notes,
      xml,
      chunks,
      match,
    } = this.props;

    return (
      <React.Fragment>
        <PerseidsHeader>
          <span>
            <i>{work}</i>
          </span>
          <ul className="navbar-nav ml-auto">
            <li className="nav-item">
              <a className="nav-link" href={`${process.env.PUBLIC_URL}/`}>
                Home
              </a>
            </li>
          </ul>
        </PerseidsHeader>
        <div className="container pt-3">
          <h2>
            <span>
              {author}
              ,
              <i>
                {' '}
                {work}
                {' '}
              </i>
              {locus}
            </span>
          </h2>
          <table className="table">
            <tbody>
              {author && renderRow('Author', author)}
              {work && renderRow('Work', work)}
              {locus && renderLocusRow('Locus', locus, publicationPath)}
              {editors && renderRow('Editors', editors)}
              {link && renderLinkRow('Link', link)}
              {notes && renderMarkdownRow('Notes', notes)}
            </tbody>
          </table>
          <div className={styles.treebankWrapper}>
            <Treebank xml={xml} chunks={chunks} match={match} arethusa={this.arethusa} />
          </div>
          <div className="pt-1 pb-4 text-right">
            <a href={`${process.env.PUBLIC_URL}/xml/${xml}`} target="_blank" rel="noopener noreferrer">
              View XML
            </a>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default Publication;
