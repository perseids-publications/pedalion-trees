import conf from './conf.json';

class ArethusaWrapper {
  elementId = "treebank_container";
  remoteUrl = "/arethusa/";
  appConf = conf; 

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
