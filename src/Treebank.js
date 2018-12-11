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
    const { chunk } = this.props.match.params;
    const base = this.props.xml;

    this.props.arethusa.render(base, chunk)
  }

  componentDidUpdate() {
    const { chunk } = this.props.match.params;
    const base = this.props.xml;

    this.props.arethusa.render(base, chunk)
  }

  render() {
    const { chunks, match } = this.props;

    return (
      <React.Fragment>
        <ControlPanel match={match} chunks={chunks} />
        <div className="__artsa">
          <div id="treebank_container" style={{ position: "relative" }}>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default Treebank;
