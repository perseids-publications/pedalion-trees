import React, { Component } from 'react';

const remoteUrl = `${process.env.PUBLIC_URL}/arethusa`;

const styleSheets = [
  `${remoteUrl}/css/arethusa.min.css`,
  `${remoteUrl}/css/colorpicker.css`,
  `${remoteUrl}/css/font-awesome.min.css`,
  `${remoteUrl}/css/foundation-icons.css`,
  `${remoteUrl}/css/widget.css`,
];

class TreebankStyles extends Component {
  componentDidMount() {
  }

  render() {
    return (
      <>
        {styleSheets.map((st) => <link key={st} rel="stylesheet" type="text/css" href={st} />)}
      </>
    );
  }
}

export default TreebankStyles;
