import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import { NavbarToggler, Collapse } from 'reactstrap';
import { string } from 'prop-types';

import { configType } from '../../../lib/types';

import Header from '../../Header';

class InstructionsHeader extends Component {
  constructor(props) {
    super(props);

    this.state = { collapsed: true };

    this.toggleNavbar = this.toggleNavbar.bind(this);
  }

  toggleNavbar() {
    this.setState(({ collapsed }) => ({ collapsed: !collapsed }));
  }

  render() {
    const { title, config: { logo, link } } = this.props;
    const { collapsed } = this.state;

    return (
      <Header logo={logo} link={link}>
        <span className="mr-auto">
          {title}
        </span>
        <NavbarToggler onClick={this.toggleNavbar} aria-label="navigation menu" />
        <Collapse isOpen={!collapsed} navbar>
          <ul className="navbar-nav ml-auto">
            <li className="nav-item">
              <NavLink exact className="nav-link" to="/">
                Home
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink exact className="nav-link" to="/instructions/getting-started">
                Getting started
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink exact className="nav-link" to="/instructions/doi">
                DOI
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink exact className="nav-link" to="/instructions/updating">
                Updating
              </NavLink>
            </li>
          </ul>
        </Collapse>
      </Header>
    );
  }
}

InstructionsHeader.propTypes = {
  config: configType.isRequired,
  title: string.isRequired,
};

export default InstructionsHeader;
