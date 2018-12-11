import React, { Component } from 'react';

const min = (a, b) => (a < b ? a : b);
const max = (a, b) => (a > b ? a : b);

class ControlPanel extends Component {
  state = {
    isOpen: false,
  };

  constructor(props) {
    super(props);

    this.toggleOpen = this.toggleOpen.bind(this);
  }

  toggleOpen() {
    this.setState({
      isOpen: !this.state.isOpen,
    });
  }

  getLines() {
    const { start, end } = this.props.chunks;

    const lines = [];
    for (let ii = start; ii <= end; ii += 1) {
      lines.push(ii);
    }

    return lines;
  }

  getFbcnl () {
    const { chunks, match } = this.props;
    const { chunk } = match.params;

    const index = Number(chunk);
    const start = chunks.start;
    const end = chunks.end;

    return [
      start,
      max(start, index - 1),
      index,
      min(end, index + 1),
      end
    ]
  }

  render () {
    const [first, back, current, next, last] = this.getFbcnl();
    const { url } = this.props.match;
    const lines = this.getLines();

    return (
      <nav className="navbar navbar-expand navbar-light bg-light">
        <div className="collapse navbar-collapse justify-content-center" id="navbarsExample10">
          <ul className="navbar-nav">
            <li className="nav-item">
              <a className="nav-link" href={`./${first}`}>
                &laquo; First
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href={`./${back}`}>
                &#8249; Back
              </a>
            </li>
            <li className="nav-item dropdown">
              <a className="nav-link dropdown-toggle" aria-haspopup="true" aria-expanded={this.state.isOpen} onClick={this.toggleOpen} style={{ cursor: "pointer" }}>
                {current}
              </a>
              <div className={`dropdown-menu ${this.state.isOpen ? "show" : ""}`}>
                {
                  lines.map((n) => (
                    <a className="dropdown-item" key={n} href={n} onClick={this.toggleOpen}>
                      {n}
                    </a>
                  ))
                }
              </div>
            </li>
            <li className="nav-item">
              <a className="nav-link" href={`./${next}`}>
                Next &#8250;
              </a>
            </li>
            <li>
              <a className="nav-link" href={`./${last}`}>
                Last &raquo;
              </a>
            </li>
          </ul>
        </div>
      </nav>
    );
  }
}

export default ControlPanel;
