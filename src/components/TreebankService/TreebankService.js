import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router-dom';
import {
  MessagingService,
  ResponseMessage,
  WindowIframeDestination as Destination,
} from 'alpheios-messaging';
import { buildQueryString } from '../../lib/params';

import ArethusaWrapper from '../ArethusaWrapper';

const config = {
  name: 'treebank',
  targetIframeID: 'string-not-used',
  targetURL: 'string-not-used',
  commModes: [Destination.commModes.RECEIVE],
};

const error = (request, message, code) => ResponseMessage.Error(request, new Error(message), code);

const redirectLink = ({ wordIds, config: c, sentenceId }) => {
  const query = buildQueryString({ w: wordIds, config: c });

  if (query === '') {
    return sentenceId;
  }

  return `${sentenceId}?${query}`;
};

class TreebankService extends Component {
  constructor(props) {
    super(props);

    this.state = {
      arethusaLoaded: false,
      redirectTo: null,
    };
    this.messageHandler = this.messageHandler.bind(this);
    this.setArethusaLoaded = this.setArethusaLoaded.bind(this);
  }

  componentDidMount() {
    this.destination = new Destination({ ...config, receiverCB: this.messageHandler });
    this.service = new MessagingService('treebank-service', this.destination);

    // eslint-disable-next-line no-undef
    window.document.body.addEventListener('ArethusaLoaded', this.setArethusaLoaded);
  }

  componentWillUnmount() {
    this.destination.deregister();

    // eslint-disable-next-line no-undef
    window.document.body.removeEventListener('ArethusaLoaded', this.setArethusaLoaded);
  }

  setArethusaLoaded() {
    this.setState({ arethusaLoaded: true });
  }

  messageHandler(request, responseFn) {
    const { arethusa } = this.props;
    const { arethusaLoaded } = this.state;
    const { body } = request;
    const [name] = Object.keys(body);

    if (!arethusaLoaded) {
      responseFn(error(request, 'Arethusa is Not Loaded', ResponseMessage.errorCodes.SERVICE_UNINITIALIZED));
      return;
    }

    try {
      switch (name) {
        case 'gotoSentence':
          this.setState({
            redirectTo: redirectLink(body.gotoSentence),
          });

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
        case 'findWord':
          responseFn(
            ResponseMessage.Success(
              request,
              arethusa.findWord(
                body.findWord.sentenceId,
                body.findWord.word,
                body.findWord.prefix,
                body.findWord.suffix,
              ),
            ),
          );
          break;
        default:
          responseFn(error(request, `Unsupported request: ${name}`, ResponseMessage.errorCodes.UNKNOWN_REQUEST));
      }
    } catch (err) {
      responseFn(ResponseMessage.Error(request, err, ResponseMessage.errorCodes.INTERNAL_ERROR));
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
