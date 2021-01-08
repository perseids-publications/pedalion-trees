const jQueryMock = (selector) => {
  if (selector === '#toast-container') {
    return { remove: () => {} };
  }
};
global.$ = jQueryMock;

const ArethusaMock = function() {
  this.on = () => this;
  this.from = () => this;
  this.with = () => this;
  this.start = () => this;
  this.api = () => ({
    gotoSentence: (_chunk) => {},
    getSubdoc: () => global.arethusaApiGetSubdocFun(),
  });
};
global.Arethusa = ArethusaMock;

// This is not exactly a mock but `ArethusaMock#getSubdoc` calls this function.
// Setting it allows a test to test what happens when the Arethusa instance API
// returns different results for `getSubdoc`.
global.arethusaApiGetSubdocFun = () => { throw 'Error' };

// This function is required by Alpheios messaging
// which uses the https://github.com/uuidjs/uuid package
// that relies on `window.crypto.getRandomValues`
global.crypto = {
  getRandomValues: array => array.map(() => Math.random()),
};

process.env.PUBLIC_URL = 'https://www.example.com';
