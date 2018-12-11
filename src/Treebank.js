import React, { Component } from 'react';

import ControlPanel from './ControlPanel';

class Treebank extends Component {
  constructor (props) {
    super(props);

    this.state = {
      id: null,
    };
  }

  componentDidMount() {
    const { id } = this.props.match.params;
    const base = this.props.url;

    this.props.arethusa.render(base, id)
  }

  componentDidUpdate() {
    const { id } = this.props.match.params;
    const base = this.props.url;

    this.props.arethusa.render(base, id)
  }

  render() {
    return (
      <React.Fragment>
        <ControlPanel
          match={this.props.match}
          lines={["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]}
        />
        <div className="__artsa">
          <div id="treebank_container" style={{ position: "relative" }}>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default Treebank;
