const ArethusaConfig = {
  main: {
    debug: false,
    showKeys: false,
    chunkParam: 'chunk',
    auxConfPath: 'https://services.perseids.org/arethusa-configs',
    retrievers: {
      TreebankRetriever: {
        resource: 'Gardener',
        docIdentifier: 'treebank',
        preselector: 'w',
      },
    },
    plugins: [
      'text',
      'morph',
      'relation',
      'depTree',
    ],
    layouts: [
      {
        name: 'widget',
        template: 'js/templates/widget.html',
      },
    ],
  },
  notifier: {
    disable: true,
  },
  navigator: {
    chunkSize: 1,
  },
  navbar: false,
  resources: {
    Gardener: {
      route: `${process.env.PUBLIC_URL}/xml/:doc`,
      params: [
        'doc',
      ],
    },
    lexInvFusekiEndpoint: {
      route: 'http://fuseki.perseids.org/fuseki/ds/query?format=json',
    },
    morphologyServiceLat: {
      route: 'http://services.perseids.org/bsp/morphologyservice/analysis/word?lang=lat&engine=morpheuslat',
    },
    newMorphologyServiceLat: {
      route: 'http://morph.perseids.org/analysis/word?lang=lat&engine=morpheuslat',
    },
    morphologyServiceGrc: {
      route: 'http://services.perseids.org/bsp/morphologyservice/analysis/word?lang=grc&engine=morpheusgrc',
    },
    newMorphologyServiceGrc: {
      route: 'http://morph.perseids.org/analysis/word?lang=grc&engine=morpheusgrc',
    },
    morphologyServicePer: {
      route: 'http://localhost/extapi/morphologyservice/analysis/word?lang=per&engine=hazm',
    },
    citeMapper: {
      route: 'http://services.perseids.org/cite_mapper/find_cite',
    },
    sgGrammar: {
      route: 'http://services.perseids.org/sg/:doc.html',
    },
  },
  plugins: {
    text: {
      main: true,
      template: 'js/templates/text_with_context.html',
    },
    depTree: {
      main: true,
      contextMenu: false,
      contextMenuTemplate: 'js/arethusa.dep_tree/templates/context_menu.html',
      template: 'js/templates/dep_tree.html',
    },
    morph: {
      noRetrieval: 'online',
      contextMenu: true,
      contextMenuTemplate: 'js/arethusa.morph/templates/context_menu.html',
    },
    relation: {
      advancedMode: true,
      relations: {},
    },
  },
  keyCapture: {
    regex: {
      greek: {
        α: '[\u03b1\u1f01\u1f05\u1f03\u1f07\u1f00\u1f04\u1f02\u1f06\u03ac\u1f70\u1fb6\u1f81\u1f85\u1f83\u1f87\u1f80\u1f84\u1f82\u1f86\u1fb4\u1fb2\u1fb7\u1fb3]',
        ε: '[\u03b5\u03ad\u1f72\u1f10\u1f11\u1f14\u1f12\u1f15\u1f13]',
        η: '[\u03b7\u1f21\u1f25\u1f23\u1f27\u1f20\u1f24\u1f22\u1f26\u03ae\u1f74\u1fc6\u1f91\u1f95\u1f93\u1f97\u1f90\u1f94\u1f92\u1f96\u1fc4\u1fc2\u1fc7\u1fc3]',
        ι: '[\u03b9\u1f31\u1f35\u1f33\u1f37\u1f30\u1f34\u1f32\u1f36\u03af\u1f76\u1fd6]',
        ο: '[\u03bf\u03cc\u1f78\u1f40\u1f41\u1f44\u1f42\u1f45\u1f43]',
        υ: '[\u03c5\u1f51\u1f55\u1f53\u1f57\u1f50\u1f54\u1f52\u1f56\u03cd\u1f7a\u1fe6]',
        ω: '[\u03c9\u1f61\u1f65\u1f63\u1f67\u1f60\u1f64\u1f62\u1f66\u03ce\u1f7c\u1ff6\u1fa1\u1fa5\u1fa3\u1fa7\u1fa0\u1fa4\u1fa2\u1fa6\u1ff4\u1ff2\u1ff7\u1ff3]',
      },
    },
    keys: {},
  },
};

export default ArethusaConfig;
