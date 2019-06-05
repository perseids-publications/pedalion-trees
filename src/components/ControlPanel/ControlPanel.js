import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import { chunksType, publicationMatchType } from '../../lib/types';

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
  static propTypes = {
    chunks: chunksType.isRequired,
    match: publicationMatchType.isRequired,
  };

  state = {
    isOpen: false,
  };

  constructor(props) {
    super(props);

    this.toggleOpen = this.toggleOpen.bind(this);
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

  toggleOpen() {
    this.setState(({ isOpen }) => ({ isOpen: !isOpen }));
  }

  render() {
    const { isOpen } = this.state;
    const [first, back, current, next, last] = this.getFbcnl();
    const lines = this.getLines();

    return (
      <nav className="navbar navbar-expand navbar-dark bg-dark">
        <div className="collapse navbar-collapse justify-content-center" id="navbarsExample10">
          <ul className="navbar-nav">
            <li className="nav-item">
              <Link className={`nav-link text-light ${styles.link}`} to={`./${first}`}>
                &laquo; First
              </Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link text-light ${styles.link}`} to={`./${back}`}>
                &#8249; Back
              </Link>
            </li>
            <li className="nav-item dropdown">
              <button className={`btn btn-link nav-link text-light dropdown-toggle ${styles.dropdownButton}`} type="button" aria-haspopup="true" aria-expanded={isOpen} onClick={this.toggleOpen}>
                {current}
              </button>
              <div className={`dropdown-menu ${styles.dropdownScroll} ${isOpen ? 'show' : ''}`}>
                {
                  lines.map(n => (
                    <Link className="dropdown-item" key={n} to={`./${n}`} onClick={this.toggleOpen}>
                      {n}
                    </Link>
                  ))
                }
              </div>
            </li>
            <li className="nav-item">
              <Link className={`nav-link text-light ${styles.link}`} to={`./${next}`}>
                Next &#8250;
              </Link>
            </li>
            <li>
              <Link className={`nav-link text-light ${styles.link}`} to={`./${last}`}>
                Last &raquo;
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    );
  }
}

export default ControlPanel;
