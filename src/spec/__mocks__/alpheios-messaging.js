function MessagingService(_name, { receiverCB }) {
  global.sendRequestToMock = receiverCB;
}

const ResponseMessage = {
  errorCodes: {
    SERVICE_UNINITIALIZED: 'SERVICE_UNINITIALIZED',
    UNKNOWN_REQUEST: 'UNKNOWN_REQUEST',
    INTERNAL_ERROR: 'INTERNAL_ERROR',
  },
  Error: (request, error) => ({ type: 'error', request, error }),
  Success: (request, message) => ({ type: 'success', request, message }),
};

function WindowIframeDestination({ receiverCB }) {
  return {
    receiverCB,
    deregister: () => {},
  };
}
WindowIframeDestination.commModes = { RECEIVE: 'RECEIVE' };

export {
  MessagingService,
  ResponseMessage,
  WindowIframeDestination,
};
