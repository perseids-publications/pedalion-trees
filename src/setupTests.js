const arethusaGotoMock = (chunk) => {};
global.arethusaGoto = arethusaGotoMock;

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
};
global.Arethusa = ArethusaMock;
