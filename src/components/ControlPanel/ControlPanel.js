import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Octicon, { Settings } from '@primer/octicons-react';
import queryString from 'query-string';

import { chunksType, publicationMatchType, queryType } from '../../lib/types';

import styles from './ControlPanel.module.css';

const min = (a, b) => (a < b ? a : b);
const max = (a, b) => (a > b ? a : b);

const getFbcnlFromNumbers = (chunk, numbers) => {
  const index = numbers.indexOf(chunk);

  return [
    numbers[0],
    numbers[max(0, index - 1)],
    chunk,
    numbers[min(numbers.length - 1, index + 1)],
    numbers[numbers.length - 1],
  ];
};

class ControlPanel extends Component {
  constructor(props) {
    super(props);

    this.state = {
      refIsOpen: false,
      settingsIsOpen: false,
    };

    this.getLines = this.getLines.bind(this);
    this.getFbcnl = this.getFbcnl.bind(this);
    this.createLink = this.createLink.bind(this);
    this.toggleRefOpen = this.toggleRefOpen.bind(this);
    this.toggleSettingsOpen = this.toggleSettingsOpen.bind(this);
    this.renderSettingsLinks = this.renderSettingsLinks.bind(this);
  }

  getLines() {
    const { chunks: { start, end, numbers } } = this.props;

    if (numbers) {
      return numbers;
    }

    const lines = [];
    for (let ii = start; ii <= end; ii += 1) {
      lines.push(ii);
    }

    return lines;
  }

  getFbcnl() {
    const { chunks: { start, end, numbers }, match } = this.props;
    const { params: { chunk } } = match;
    const index = Number(chunk);

    if (numbers) {
      return getFbcnlFromNumbers(chunk, numbers);
    }

    return [
      start,
      max(start, index - 1),
      chunk,
      min(end, index + 1),
      end,
    ];
  }

  createLink(to) {
    const { linkQuery } = this.props;
    const link = `./${to}`;

    if (Object.entries(linkQuery).length > 0) {
      const query = queryString.stringify(linkQuery);

      return `${link}?${query}`;
    }

    return link;
  }

  toggleRefOpen() {
    this.setState(({ refIsOpen }) => ({ refIsOpen: !refIsOpen }));
  }

  toggleSettingsOpen() {
    this.setState(({ settingsIsOpen }) => ({ settingsIsOpen: !settingsIsOpen }));
  }

  renderSettingsLinks() {
    const { fullQuery } = this.props;
    const { config } = fullQuery;
    const newConfig = config === 'sidepanel' ? 'default' : 'sidepanel';
    const text = config === 'sidepanel' ? 'Hide morphology' : 'Show morphology';

    return (
      <a
        href={`?${queryString.stringify({ ...fullQuery, config: newConfig })}`}
        className="dropdown-item"
      >
        {text}
      </a>
    );
  }

  render() {
    const { refIsOpen, settingsIsOpen } = this.state;
    const [first, back, current, next, last] = this.getFbcnl();
    const lines = this.getLines();

    return (
      <nav className="navbar navbar-expand navbar-dark bg-dark">
        <div className="collapse navbar-collapse" id="controlPanel">
          <ul className={`navbar-nav mr-auto ${styles.dummyIcon}`} />
          <ul className="navbar-nav mx-auto">
            <li className="nav-item">
              <Link className={`nav-link text-light ${styles.link}`} to={this.createLink(first)}>
                &laquo; First
              </Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link text-light ${styles.link}`} to={this.createLink(back)}>
                &#8249; Back
              </Link>
            </li>
            <li className="nav-item dropdown">
              <button className={`btn btn-link nav-link text-light dropdown-toggle ${styles.dropdownButton}`} type="button" aria-haspopup="true" aria-expanded={refIsOpen} onClick={this.toggleRefOpen}>
                {current}
              </button>
              <div className={`dropdown-menu ${styles.dropdownScroll} ${refIsOpen ? 'show' : ''}`}>
                {
                  lines.map((n) => (
                    <Link className="dropdown-item" key={n} to={this.createLink(n)} onClick={this.toggleRefOpen}>
                      {n}
                    </Link>
                  ))
                }
              </div>
            </li>
            <li className="nav-item">
              <Link className={`nav-link text-light ${styles.link}`} to={this.createLink(next)}>
                Next &#8250;
              </Link>
            </li>
            <li>
              <Link className={`nav-link text-light ${styles.link}`} to={this.createLink(last)}>
                Last &raquo;
              </Link>
            </li>
          </ul>
          <ul className="navbar-nav ml-auto">
            <li className="nav-item dropdown dropleft">
              <button className="btn btn-link nav-link text-light" type="button" aria-haspopup="true" aria-expanded={settingsIsOpen} onClick={this.toggleSettingsOpen}>
                <Octicon icon={Settings} />
              </button>
              <div className={`dropdown-menu ${styles.dropdownScroll} ${settingsIsOpen ? 'show' : ''}`}>
                {this.renderSettingsLinks()}
              </div>
            </li>
          </ul>
        </div>
      </nav>
    );
  }
}

ControlPanel.propTypes = {
  chunks: chunksType.isRequired,
  match: publicationMatchType.isRequired,
  fullQuery: queryType.isRequired,
  linkQuery: queryType.isRequired,
};

export default ControlPanel;
