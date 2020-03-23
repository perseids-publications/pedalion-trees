import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router-dom';
import {
  MessagingService,
  ResponseMessage,
  WindowIframeDestination as Destination,
} from 'alpheios-messaging';

import ArethusaWrapper from '../ArethusaWrapper';

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
    const { arethusa } = this.props;
    const { body } = request;
    const [name] = Object.keys(body);

    try {
      switch (name) {
        case 'gotoSentence':
          this.setState({ redirectTo: body.gotoSentence.sentenceId });

          responseFn(ResponseMessage.Success(request, { status: 'success' }));
          break;
        case 'getMorph':
          responseFn(ResponseMessage.Success(
            request,
            arethusa.getMorph(body.getMorph.sentenceId, body.getMorph.wordId),
          ));
          break;
        case 'refreshView':
          responseFn(ResponseMessage.Success(request, arethusa.refreshView()));
          break;
        default:
          responseFn(error(`Unsupported request: ${name}`));
      }
    } catch (err) {
      responseFn(ResponseMessage.Error(request, err));
    }
  }

  render() {
    const { redirectTo } = this.state;

    return (
      redirectTo && <Redirect to={redirectTo} />
    );
  }
}

TreebankService.propTypes = {
  arethusa: PropTypes.instanceOf(ArethusaWrapper).isRequired,
};

export default TreebankService;
