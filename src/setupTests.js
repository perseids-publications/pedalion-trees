const ArethusaMock = function() {
  this.on = () => this;
  this.from = () => this;
  this.with = () => this;
  this.start = () => this;
};
global.Arethusa = ArethusaMock;
