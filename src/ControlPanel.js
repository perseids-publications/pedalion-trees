import React, { Component } from 'react';
import { Link } from "react-router-dom";

const min = (a, b) => (a < b ? a : b);
const max = (a, b) => (a > b ? a : b);

class ControlPanel extends Component {
  state = {
    isOpen: false,
  };

  constructor (props) {
    super(props);

    this.toggleOpen = this.toggleOpen.bind(this);
  }

  toggleOpen () {
    this.setState({
      isOpen: !this.state.isOpen,
    });
  }

  getFbcnl () {
    const { lines, match } = this.props;
    const { id } = match.params;
    const length = lines.length;

    const index = lines.indexOf(id);

    return [
      0,
      max(0, index - 1),
      index,
      min(length - 1, index + 1),
      length - 1,
    ].map((n) => lines[n]);
  }

  render () {
    const [first, back, current, next, last] = this.getFbcnl();
    const { url } = this.props.match;
    window.foo = this.props.match;

    return (
      <nav className="navbar navbar-expand navbar-light bg-light">
        <div className="collapse navbar-collapse justify-content-center" id="navbarsExample10">
          <ul className="navbar-nav">
            <li className="nav-item">
              <Link className="nav-link" to={first}>
                &laquo; First
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to={back}>
                &#8249; Back
              </Link>
            </li>
            <li className="nav-item dropdown">
              <a className="nav-link dropdown-toggle" aria-haspopup="true" aria-expanded={this.state.isOpen} onClick={this.toggleOpen} style={{ cursor: "pointer" }}>
                {current}
              </a>
              <div className={`dropdown-menu ${this.state.isOpen ? "show" : ""}`}>
                {
                  this.props.lines.map((n) => (
                    <Link className="dropdown-item" key={n} to={n} onClick={this.toggleOpen}>
                      {n}
                    </Link>
                  ))
                }
              </div>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to={next}>
                Next &#8250;
              </Link>
            </li>
              <Link className="nav-link" to={last}>
                Last &raquo;
              </Link>
          </ul>
        </div>
      </nav>
    );
  }
}

export default ControlPanel;


  // render () {
  //   return (
  //     <div>
  //       <i class="fi-previous" />
  //       <i class="fi-arrow-left" />
  //       <i class="fi-arrow-right" />
  //       <i class="fi-next" />
  //     </div>
  //   );
  // }
//
//
// render () {
//             <li className="nav-item dropdown">
//               <a className="nav-link dropdown-toggle" href="https://example.com" id="dropdown10" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Dropdown</a>
//               <div className="dropdown-menu" aria-labelledby="dropdown10">
//                 <a className="dropdown-item" href="#">Action</a>
//                 <a className="dropdown-item" href="#">Another action</a>
//                 <a className="dropdown-item" href="#">Something else here</a>
//               </div>
//             </li>
//             }
