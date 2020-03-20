import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import {
  MessagingService,
  ResponseMessage,
  WindowIframeDestination as Destination,
} from 'alpheios-messaging';

const config = {
  name: 'treebank',
  targetIframeID: 'string-not-used',
  targetURL: 'string-not-used',
  commModes: [Destination.commModes.RECEIVE],
};

const error = (request, message) => ResponseMessage.Error(request, new Error(message));

class TreebankService extends Component {
  constructor(props) {
    super(props);

    this.state = { redirectTo: null };
    this.messageHandler = this.messageHandler.bind(this);
  }

  componentDidMount() {
    this.service = new MessagingService('treebank-service', new Destination({ ...config, receiverCB: this.messageHandler }));
  }

  componentWillUnmount() {
    this.service.deregister();
  }

  messageHandler(request, responseFn) {
    const { body } = request;
    const [name] = Object.keys(body);

    switch (name) {
      case 'gotoSentence':
        this.setState({ redirectTo: body[name].sentenceId });

        responseFn(ResponseMessage.Success(request, { status: 'success' }));
        break;

      default:
        responseFn(error(`Unsupported request: ${name}`));
    }
  }

  render() {
    const { redirectTo } = this.state;

    return (
      redirectTo && <Redirect to={redirectTo} />
    );
  }
}

export default TreebankService;
