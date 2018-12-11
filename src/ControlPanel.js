import React, { Component } from 'react';

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

  render () {
    return (
      <nav className="navbar navbar-expand navbar-light bg-light">
        <div className="collapse navbar-collapse justify-content-center" id="navbarsExample10">
          <ul className="navbar-nav">
            <li className="nav-item">
              <a className="nav-link" href="#">&laquo; First</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#">&#8249; Back</a>
            </li>
            <li className="nav-item dropdown">
              <a className="nav-link dropdown-toggle" href="#" aria-haspopup="true" aria-expanded={this.state.isOpen} onClick={this.toggleOpen}>
                1
              </a>
              <div className={`dropdown-menu ${this.state.isOpen ? "show" : ""}`}>
                <a className="dropdown-item" href="#">1</a>
                <a className="dropdown-item" href="#">2</a>
                <a className="dropdown-item" href="#">3</a>
              </div>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#">Next &#8250;</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#">Last &raquo;</a>
            </li>
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
