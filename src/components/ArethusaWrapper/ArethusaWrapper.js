import { defaultConfig, sidepanelConfig } from './ArethusaConfig';

const elementId = 'treebank_container';
const remoteUrl = `${process.env.PUBLIC_URL}/arethusa`;

const removeToastContainer = ($) => {
  $('#toast-container').remove();
};

const getConfig = (config) => {
  if (config === 'sidepanel') {
    return sidepanelConfig;
  }

  return defaultConfig;
};

const wordsDiffer = (a, b) => {
  const aList = (a || []).sort().join(',');
  const bList = (b || []).sort().join(',');

  return aList !== bList;
};

class ArethusaWrapper {
  constructor() {
    this.render = this.render.bind(this);
  }

  render(doc, chunk, { config, w }) {
    // eslint-disable-next-line no-undef
    const { Arethusa, $ } = window;

    if (this.widget) {
      if (this.doc === doc && (this.chunk !== chunk || wordsDiffer(this.w, w))) {
        this.gotoSentence(chunk, w);
        removeToastContainer($);
      }
    } else {
      this.widget = new Arethusa();

      this.widget
        .on(elementId)
        .from(remoteUrl)
        .with(getConfig(config))
        .start({ doc, chunk, w });

      this.api = this.widget.api();
    }

    this.doc = doc;
    this.chunk = chunk;
    this.w = w;
  }

  gotoSentence(chunk, words) {
    return this.api.gotoSentence(chunk, words);
  }

  getSubdoc() {
    return this.api.getSubdoc();
  }

  getMorph(sentenceId, wordId) {
    return this.api.getMorph(sentenceId, wordId);
  }

  refreshView() {
    return this.api.refreshView();
  }

  findWord(sentenceId, word, prefix, suffix) {
    return this.api.findWord(sentenceId, word, prefix, suffix);
  }
}

export default ArethusaWrapper;
