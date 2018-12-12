import config from './arethusa.json';

import './custom.css';

class ArethusaWrapper {
  elementId = "treebank_container";
  remoteUrl = "/treebank-template/arethusa/";
  appConf = config; 

  removeToastContainer() {
    window.$("#toast-container").remove();
  }

  render(doc, chunk) {
    if (this.widget) {
      if (this.doc === doc && this.chunk !== chunk) {
        window.arethusaGoto(chunk);
        this.removeToastContainer();
      }
    } else {
      this.widget = new window.Arethusa();

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
