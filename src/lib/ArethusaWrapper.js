import ArethusaConfig from './ArethusaConfig';

import './custom.css';

const removeToastContainer = ($) => {
  $('#toast-container').remove();
};

class ArethusaWrapper {
  elementId = 'treebank_container';

  remoteUrl = `${process.env.PUBLIC_URL}/arethusa/`;

  appConf = ArethusaConfig;

  constructor() {
    this.render = this.render.bind(this);
  }

  render(doc, chunk) {
    // eslint-disable-next-line no-undef
    const { arethusaGoto, Arethusa, $ } = window;

    if (this.widget) {
      if (this.doc === doc && this.chunk !== chunk) {
        arethusaGoto(chunk);
        removeToastContainer($);
      }
    } else {
      this.widget = new Arethusa();

      this.widget
        .on(this.elementId)
        .from(this.remoteUrl)
        .with(this.appConf)
        .start({ doc, chunk });
    }

    this.doc = doc;
    this.chunk = chunk;
  }
}

export default ArethusaWrapper;
