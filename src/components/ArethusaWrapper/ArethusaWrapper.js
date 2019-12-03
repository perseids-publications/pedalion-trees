import { defaultConfig, sidepanelConfig } from './ArethusaConfig';

import './custom.css';

const elementId = 'treebank_container';
const remoteUrl = `${process.env.PUBLIC_URL}/arethusa/`;

const removeToastContainer = ($) => {
  $('#toast-container').remove();
};

const getConfig = (config) => {
  if (config === 'sidepanel') {
    return sidepanelConfig;
  }

  return defaultConfig;
};

class ArethusaWrapper {
  constructor() {
    this.render = this.render.bind(this);
  }

  render(doc, chunk, { config, w }) {
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
        .on(elementId)
        .from(remoteUrl)
        .with(getConfig(config))
        .start({ doc, chunk, w });
    }

    this.doc = doc;
    this.chunk = chunk;
  }
}

export default ArethusaWrapper;
