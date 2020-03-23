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

const setIntervalMock = (callback, _time) => {
  global.intervalCallback = () => callback();
}
global.setInterval = setIntervalMock;

const clearIntervalMock = (_interval) => {
  global.intervalCallback = undefined;
};
global.clearInterval = clearIntervalMock;
