import conf from './conf.json';

class ArethusaWrapper {
  elementId = "treebank_container";
  remoteUrl = "/arethusa/";
  appConf = conf; 

  render(doc, chunk) {
    if (this.widget) {
      if (this.doc === doc && this.chunk !== chunk) {
        window.arethusaGoto(chunk);
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
