'use strict';

/**
 * @ngdoc overview
 * @name arethusa
 *
 * @description
 * Arethusa's main module. Handles routing.
 *
 */
angular.module('arethusa', [
  'angulartics',
  'angulartics.google.analytics',
  'ngRoute',
  'arethusa.core',
  'arethusa.contextMenu',
  'arethusa.history',
  'arethusa.tools'
]);

angular.module('arethusa').constant('_', window._);

angular.module('arethusa').config([
  '$translateProvider',
  'localStorageServiceProvider',
  'LOCALES',
  function ($translateProvider, localStorageServiceProvider,
            LOCALES) {

    var localesMap = {};
    for (var i = LOCALES.length - 1; i >= 0; i--){
      var locale = LOCALES[i];
      localesMap[locale + '_*'] = locale;
    }

    $translateProvider
      .useStaticFilesLoader({
        prefix: window.i18npath,
        suffix: '.json'
      })

      .registerAvailableLanguageKeys(LOCALES, localesMap)
      .determinePreferredLanguage()
      .fallbackLanguage('en')
      .addInterpolation('translatorNullInterpolator');

    localStorageServiceProvider.setPrefix('arethusa');
  },
]).config([
  // This config prevents URL changes done using the browser's History API
  // from causing Angular to enter an infinite loop.
  // See https://stackoverflow.com/questions/18611214/turn-off-url-manipulation-in-angularjs
  '$provide',
  function ($provide) {
    $provide.decorator('$browser', ['$delegate', function ($delegate) {
      $delegate.onUrlChange = function () {};
      $delegate.url = function () { return '' };

      return $delegate;
    }]);
  }
]);

angular.module('arethusa').value('CONF_PATH', '/configs');

function Arethusa() {

  var self = this;

  this.on = function(id) {
    self.id = id.match(/^#/) ? id : '#' + id;
    var template = document.createElement("div");
    template.setAttribute("ng-include",'gS.layout.template');
    template.setAttribute("class",'fade slow');
    template.setAttribute("key-capture",'');
    var navbar = document.createElement("arethusa-navbar");
    template.appendChild(navbar);
    document.getElementById(self.id.slice(1)).appendChild(template);
    var target = angular.element(self.id);
    target.attr('ng-controller','ArethusaCtrl');
    return self;
  };

  this.from = function(url) {
    var arethusa = angular.module('arethusa');
    var arethusa_core = angular.module('arethusa.core');
    arethusa.value('CONF_PATH',url+"/configs");
    arethusa.value('BASE_PATH',url);
    arethusa_core.value('BASE_PATH',url);
    return self;
  };
  this.with = function(conf) {
    self.conf = conf.main ? $.when(conf) : $.getJSON(conf) ;
    return self;
  };
  this.start = function(resourceConf) {
    self.conf.then(function(conf) {
      var injector = angular.bootstrap(self.id,['arethusa']);
      var configurator = injector.get('configurator');
      self._api = injector.get('api')

      for (var k in resourceConf) {
        var locator = injector.get('locator');
        locator.watchUrl(false);
        locator.set(k, resourceConf[k]);
      }
      configurator.defineConfiguration(conf);
    });
  };

  this.api = function() {
    return this._api
  };
};

"use strict";

angular.module('arethusa').factory('ConstituentTreebankRetriever', [
  'configurator',
  'documentStore',
  'retrieverHelper',
  'idHandler',
  'globalStore',
  'commons',
  function(configurator, documentStore, retrieverHelper, idHandler,
           globalStore, commons) {
    // Parse functions

    function parseDocument(json, docId) {
      resetSentenceIdCounter();
      setUpConstituents();
      var constituents = new Container();
      var sentences = parseSentences(json.book.sentence, constituents, docId);
      angular.extend(globalStore.constituents, constituents.container);
      return sentences;
    }

    function parseSentences(sentences, constituents, docId) {
      return aU.toAry(sentences).map(function(sentence) {
        return parseSentence(sentence, constituents, docId);
      });
    }

    function parseSentence(sentence, constituents, docId) {
      var sourceId = sentence._ID;
      var internalId = getSentenceId();
      var tokens = new Container();

      // Hack to resolve the ambiguity between sentence and subject
      var wgNode = sentence.wg;
      wgNode._role = 'sent';

      parseWordGroup(wgNode, docId, internalId, constituents, tokens);

      var s = commons.sentence(tokens.container);
      var ids = Object.keys(s.tokens).sort();
      s.tokens[ids[ids.length - 1]].terminator = true;
      retrieverHelper.generateId(s, internalId, sourceId, docId);
      return s;
    }

    function parseWordGroup(wg, docId, sentenceId, constituents, tokens, parentId) {
      var id = wg._nodeId;
      var constituent = commons.constituent(
        wg._class,
        wg._role,
        id,
        sentenceId,
        parentId
      );

      constituents.add(constituent);

      angular.forEach(aU.toAry(wg.wg), function(childWg, i) {
        parseWordGroup(childWg, docId, sentenceId, constituents, tokens, id);
      });

      angular.forEach(aU.toAry(wg.w), function(w, i) {
        parseWord(w, docId, sentenceId, tokens, id);
      });

    }

    function parseWord(w, docId, sentenceId, tokens, parentId) {
      var token = commons.token(w.__text, sentenceId);

      var sourceId = w._morphId;
      var internalId = idHandler.getId(getWordId(sourceId), sentenceId);
      retrieverHelper.generateId(token, internalId, sourceId, docId);

      parseMorph(token, w);
      addConstituent(token, w, parentId);

      tokens.add(token);
    }

    function parseMorph(token, w) {
      var attrs = {}, key, expandedKey,  attrKey, val;
      for (key in morphKeys) {
        attrKey = morphKeys[key] || key;
        val = w['_' + key];
        if (val) attrs[attrKey] = val;
      }

      token.morphology = {
        lemma: w._lemma,
        attributes: attrs
      };
    }

    function addConstituent(token, w, parentId) {
      token.constituency = {
        parent: parentId,
        role: w._role
      };
    }

    // Helpers

    function Container() {
      var self = this;
      this.container = {};
      this.add = function(el) {
        self.container[el.id] = el;
      };
    }

    function setUpConstituents() {
      if (!globalStore.constituents) globalStore.constituents = {};
    }

    var morphKeys = {
      'class': 'pos',
      'person': 'pers',
      'number': 'num',
      'tense': null,
      'mood': null,
      'voice': null,
      'gender': 'gend',
      'case': null,
      'degree': null
    };

    var sIdCounter;
    function resetSentenceIdCounter() { sIdCounter = 0; }
    function getSentenceId() { sIdCounter += 1; return sIdCounter; }

    function getWordId(source) {
      return source.substr(source.length - 3);
    }


    return function(conf) {
      var self = this;
      var resource = configurator.provideResource(conf.resource);
      var docId = conf.docIdentifier;

      this.parse = function(xml, callback) {
        var json = arethusaUtil.xml2json(xml);
        documentStore.addDocument(docId, commons.doc(xml, json));

        callback(parseDocument(json, docId));
      };

      this.get = function(callback) {
        resource.get().then(function(res) {
          var data = res.data;
          self.parse(res.data, callback);
        });
      };
    };
  }
]);

"use strict";

angular.module('arethusa').factory('GlobalErrorHandler', [
  '$window',
  '$analytics',
  function($window, $analytics) {
    var oldErrorHandler = $window.onerror;
    $window.onerror = function errorHandler(errorMessage, url, lineNumber) {
      var trace = printStackTrace();
      $analytics.eventTrack(errorMessage + " @" + url + " : " + lineNumber, {
        category: 'error', label: trace.join(', ')
      });

      if (oldErrorHandler)
        return oldErrorHandler(errorMessage, url, lineNumber);

      return false;
    };
  }
]);

angular.module('arethusa').factory('$exceptionHandler', [
  '$analytics',
  '$log',
  function($analytics, $log) {
    return function errorHandler(exception, cause) {
      $log.error.apply($log, arguments);
      var trace = printStackTrace();
      $analytics.eventTrack(exception + ': ' + cause, {
        category: 'error', label: trace.join(', ')
      });
    };
  }
]);

"use strict";

angular.module('arethusa').factory('HebrewPersister', [
  'documentStore',
  'configurator',
  'navigator',
  'idHandler',
  function (documentStore, configurator, navigator, idHandler) {
    return function (conf) {
      var self = this;
      var resource = configurator.provideResource(conf.resource);
      var identifier = conf.docIdentifier;

      function updateDocument() {

      }

      function updateXml() {

      }

      function doc() {
        return documentStore.store[identifier];
      }


      this.saveData = function (callback, errCallback) {
        updateDocument();
        updateXml();
        resource.save(doc().xml,'text/xml').then(callback, errCallback);
      };
    };
  }
]);


"use strict";

angular.module('arethusa').factory('HebrewRetriever', [
  'documentStore',
  'configurator',
  'idHandler',
  'languageSettings',
  'hebrewMorph',
  function (documentStore, configurator, idHandler, languageSettings, hebrewMorph) {
    return function (conf) {
      var self = this;
      var resource = configurator.provideResource(conf.resource);
      var docIdentifier = conf.docIdentifier;

      function Token(id, string, map, terminator) {
        this.id = id;
        this.string = string;
        this.idMap = map;
        this.terminator = terminator;
      }

      function createIds(id,sentence) {
        var match = /^ref\.(\d+\.){3}(\d+)\.(\d+)$/.exec(id);
        var internalId = idHandler.getId(match[2]) + '-' + idHandler.getId(match[3]);
        var sourceId   = id;
        var idMap = new idHandler.Map();
        idMap.add(docIdentifier, internalId, sourceId, sentence);
        return { map: idMap, id: internalId };
      }

      function extractTokens(paragraph) {
        var result = {};

        angular.forEach(arethusaUtil.toAry(paragraph.sentence), function(sentence, i) {
          var tokens = arethusaUtil.toAry(sentence.token);
          var lastTokenI = tokens.length - 1;
          angular.forEach(tokens, function(token, otherI) {
            var ids = createIds(token._id,sentence._id);
            var string = token._surface;
            var term = otherI === lastTokenI;
            var id = ids.id;
            var t = new Token(id, string, ids.map, term);
            hebrewMorph.parse(token, t);
            result[id] = t;
          });
        });

        return result;
      }

      function parseDocument(doc, identifier) {
        var paragraphs = arethusaUtil.toAry(doc.corpus.article.paragraph);
        return arethusaUtil.map(paragraphs, function(p) {
          var id = p._id;
          var tokens = extractTokens(p);
          return {
            id: id,
            tokens: tokens,
          };
        });

      }

      this.getData = function (callback) {
        languageSettings.setFor(docIdentifier, 'heb');
        resource.get().then(function (res) {
          var xml = res.data;
          var json = arethusaUtil.xml2json(res.data);
          documentStore.addDocument(docIdentifier, {
            json: json,
            xml: xml
          });
          callback(parseDocument(json, docIdentifier));
        });
      };
    };
  }
]);


"use strict";

angular.module('arethusa').factory('PhaidraTreebankRetriever', [
  'configurator',
  'documentStore',
  'retrieverHelper',
  'idHandler',
  'languageSettings',
  'locator',
  'commons',
  function(configurator, documentStore, retrieverHelper,
           idHandler, languageSettings, locator, commons) {
    // Single sentence documents for now.
    function parseDocument(doc, docId) {
      var sentenceId = '1';
      var tokens = {};

      var words = doc.words;

      for (var i=0; i < words.length; i++) {
        var word = words[i];
        var token = commons.token(word.value, sentenceId);
        var intId = idHandler.getId(word.tbwid, sentenceId);
        retrieverHelper.generateId(token, intId, word.CTS, docId);

        var head = word.head;
        if (angular.isDefined(head)) {
          token.head = { id: idHandler.getId(head, sentenceId) };
        }

        var relation = word.relation;
        if (relation) {
          token.relation = { label: relation };
        }

        token.morphology = {
          lemma: word.lemma,
          attributes: parseMorph(word)
        };

        tokens[token.id] = token;
      }

      var s = commons.sentence(tokens, doc.CTS);
      retrieverHelper.generateId(s, sentenceId, sentenceId, docId);
      return [s];
    }

    // This is a little ugly (and slow), as the morphology is just thrown
    // into the object.
    var morphKeys = {
      'pos': null,
      'person': 'pers',
      'number': 'num',
      'tense': null,
      'mood': null,
      'voice': null,
      'gender': 'gend',
      'case': null,
      'degree': null
    };

    function parseMorph(word) {
      var attrs = {}, key, attrKey, val;
      for (key in morphKeys) {
        attrKey = morphKeys[key] || key;
        val = word[key];
        if (val) attrs[attrKey] = val;
      }

      return attrs;
    }

    function inferLanguage(doc) {
      // For now we assume that all tokens have the same language
      return doc.words[0].lang;
    }

    return function(conf) {
      var self = this;
      var resource = configurator.provideResource(conf.resource);
      var docId = conf.docIdentifier;

      this.preselections = retrieverHelper.getPreselections(conf);

      this.get = function(callback) {
        resource.get().then(function(res) {
          var data = res.data;
          documentStore.addDocument(docId, commons.doc(null, data, null));
          languageSettings.setFor(docId, inferLanguage(data));
          callback(parseDocument(data, docId));
        });
      };
    };
  }
]);

'use strict';

angular.module('arethusa').factory('TreebankPersister', [
  'documentStore',
  'configurator',
  'navigator',
  'idHandler',
  function (documentStore, configurator, navigator, idHandler) {
    return function(conf) {
      var self = this;
      var resource = configurator.provideResource(conf.resource);
      var identifier = conf.docIdentifier;

      function updateXml() {
        doc().xml = arethusaUtil.json2xml(doc().json);
      }

      function updateWord(word, stateWord, fullMap) {
        // This whole function is horrificly ugly and could be refactored
        // to use more function calls - but this is not done on purpose.
        //
        // We want saving to be as fast as possible and avoid more calls.
        //
        // The if/else dancing is used to determine whether we should write
        // to the document or not.
        //
        // We write
        // - when a value is set in the current state
        // - when no value is set in the current state, but present in the
        //   source document (i.e.: user has unannotated on purpose
        //
        // We don't write
        // - when no value is present in state or document

        var head = stateWord.head;
        if ((head && head.id)) {
          // If the token has a head and it's not inside the full map,
          // it's the root token.
          word._head = fullMap[head.id] || 0;
        } else {
          // react against 0 values in head
          if (angular.isDefined(word._head)) word._head = '';
        }

        var relation = stateWord.relation;
        if (relation) {
          word._relation = relation.label;
        } else {
          if (word._relation) word._relation = '';
        }

        var morph = stateWord.morphology;
        if (morph) {
          if (angular.isDefined(morph.lemma))  word._lemma = morph.lemma;
          if (angular.isDefined(morph.postag)) word._postag= morph.postag;
          if (angular.isDefined(morph.gloss))  word._gloss = morph.gloss;
          if (angular.isDefined(morph.alternateGloss))  word._alternateGloss = morph.alternateGloss;
          if (angular.isDefined(morph.semanticRole))  word._semanticRole = morph.semanticRole;
          if (angular.isDefined(morph.include))  word._include = morph.include;
          if (angular.isDefined(morph.multiword))  word._multiword = morph.multiword;
          if (angular.isDefined(morph.notes))  word._notes = morph.notes;
        } else {
          if (word._lemma || word._postag) {
            word._lemma = word._postag = '';
          }
        }

        var sg = stateWord.sg;
        if (sg) {
          word._sg = arethusaUtil.map(sg.ancestors, function(el) {
            return el.short;
          }).join(' ');
        } else {
          if (word._sg) word._sg = '';
        }

        var comment = stateWord.comment;
        if (comment) {
          word._comment = stateWord.comment;
        }

        word._form = stateWord.string;
      }

      function ArtificialNode(id, insertionId, type) {
        this._id = id;

        // We have to strip the sentence id for now, as the insertionId
        // won't make it through Perseids validation process.
        // It won't affect the import, as we're catching such cases there
        // for backwards compatibility anyway.
        //
        // Mind that this is a temporal solution and tightly couples this
        // process to the current id formatting.
        this._insertion_id = insertionId.split('-')[1];
        this._artificial = type || 'elliptic';
      }

      var lastId;
      function idCreator() {
        lastId++;
        return lastId;
      }

      function updateSentence(sentences, sentence) {
        var updated = sentences[sentence._id];

        // Check for changes - we might have nothing to do.
        if (!updated.changed) return;

        var wordsInXml = arethusaUtil.toAry(sentence.word);
        // We create a new object that holds all tokens of a sentence,
        // identified by their mappings in the original document.
        // Formerly unmapped tokens are exposed through an array to allow
        // postprocessing on them (such as adding artificialToken information)
        lastId = wordsInXml[wordsInXml.length - 1]._id;

        var tokens = idHandler.transformToSourceIds(updated.tokens, identifier, idCreator);
        var withMappings = tokens.mapped;
        var fullMap = tokens.fullMap;
        var toDelete = [];
        angular.forEach(wordsInXml, function(word, i) {
          var stateWord = withMappings[word._id];
          if (stateWord) {
            updateWord(word, stateWord, fullMap);
          } else {
            toDelete.unshift(i); // unshift, because we want reverse order
          }
        });

        angular.forEach(toDelete, function(index, i) {
          wordsInXml.splice(index, 1);
        });

        // tokens - the result of the id.Handler.transfomToSource call -
        // exposes all previously unmapped ids in an Array.
        // When artificialTokens were added during the last call of this function
        // and now, the unmapped Array will contain them - we have to add
        // the artificialToken information now to complete the insertion of such
        // new nodes in the XML document.
        // After they have been inserted once, they will already have their id
        // mapping, so an artificialToken can never end up in the unmapped Array
        // twice.
        angular.forEach(tokens.unmapped, function(token, i) {
          var internalId = token.id;
          var sourceId   = token.idMap.sourceId(identifier);
          var newWord = new ArtificialNode(sourceId, internalId);
          updateWord(newWord, token, fullMap);
          wordsInXml.push(newWord);
        });
        updated.changed = false;
      }

      function updateDocument() {
        var stored = arethusaUtil.toAry(doc().json.treebank.sentence);
        // navigator has to provide means to retrieve sentences by id
        // and not only through a flat array!
        var sentences = navigator.sentencesById;

        angular.forEach(stored, function(sentence, i) {
          updateSentence(sentences, sentence);
        });
      }

      function doc() {
        return documentStore.store[identifier];
      }

      this.output = function(noFormat) {
        updateDocument();
        updateXml();
        var xml = doc().xml;
        return noFormat ? xml : aU.formatXml(xml);
      };

      this.saveData = function(callback, errCallback) {
        resource.save(self.output(true), self.mimeType).then(callback, errCallback);
      };

      this.identifier = identifier;
      this.mimeType = 'text/xml';
      this.fileType = 'xml';
    };
  }
]);


'use strict';
/* A newable factory to handle xml files using the Perseus Treebank Schema
 *
 * The constructor functions takes a configuration object (that typically
 * contains a resource object for this service).
 *
 */
angular.module('arethusa').factory('TreebankRetriever', [
  'configurator',
  'documentStore',
  'retrieverHelper',
  'idHandler',
  'commons',
  'editors',
  function (configurator, documentStore, retrieverHelper,
            idHandler, commons, editors) {
    function parseDocument(json, docId) {
      var annotators = arethusaUtil.toAry(json.treebank.annotator || []);
      parseEditors(annotators, docId);
      var sentences = arethusaUtil.toAry(json.treebank.sentence);
      return parseSentences(sentences, docId);
    }

    function parseEditors(annotators, docId) {
      angular.forEach(annotators, function(annotator, i) {
        if (isHumanAnnotator(annotator)) {
          editors.addEditor(docId, {
            name: annotator.short,
            fullName: annotator.name,
            page: annotator.url,
            mail: annotator.address
          });
        }
      });
    }

    function parseSentences(sentences, docId) {
      return sentences.map(function(sentence) {
        var cite = extractCiteInfo(sentence);
        var subdoc = sentence._subdoc || '';
        var words = arethusaUtil.toAry(sentence.word);
        return parseSentence(sentence, sentence._id, docId, cite, subdoc);
      });
    }

    function parseSentence(sentence, id, docId, cite, subdoc) {
      var words = aU.toAry(sentence.word);
      var tokens = {};

      var artificials = extractArtificials(words, id);

      var lastI = words.length - 1;
      angular.forEach(words, function (word, i) {
        var token = parseWord(word, id, docId, artificials);
        if (i === lastI) token.terminator = true;
        tokens[token.id] = token;
      });

      var sentenceObj = commons.sentence(tokens, cite, subdoc);
      retrieverHelper.generateId(sentenceObj, id, id, docId);

      return sentenceObj;
    }

    function parseWord(word, sentenceId, docId, artificials) {
      // One could formalize this to real rules that are configurable...
      //
      // Remember that attributes of the converted xml are prefixed with underscore
      var token = commons.token(word._form, sentenceId);

      parseMorphology(token, word);
      parseRelation(token, word);
      parseSg(token, word);
      parseArtificial(token, word);
      parseHead(token, word, artificials);
      parseComment(token,word);

      var internalId = generateInternalId(word, sentenceId);
      var sourceId   = word._id;
      retrieverHelper.generateId(token, internalId, sourceId, docId);

      return token;
    }

    function parseHead(token, word, artificials) {
      var headId = word._head;
      if (angular.isDefined(headId) && headId !== "") {
        var newHead = {};
        var artHeadId = artificials[headId];
        var sentenceId = token.sentenceId;
        newHead.id = artHeadId ? artHeadId : idHandler.getId(headId, sentenceId);

        token.head = newHead;
      }
    }


    function parseMorphology(token, word) {
      token.morphology = {
        lemma: word._lemma,
        postag: word._postag
      };

      // if we have any morphology info from the document
      // mark the origin as such
      token.morphology.origin = 'document';

      var fields = ['gloss', 'alternateGloss', 'semanticRole', 'include', 'multiword', 'notes'];

      angular.forEach(fields, function (field) {
        var value = word['_' + field];

        if (value) {
          token.morphology[field] = value;
        }
      });
    }

    function parseRelation(token, word) {
      var relation = word._relation;
      var label = (relation && relation !== 'nil') ? relation : '';

      token.relation = {
        label: label
      };
    }

    function parseSg(token, word) {
      var sg = word._sg;
      if (sg && !sg.match(/^\s*$/)) {
        token.sg = { ancestors: sg.split(' ') };
      }
    }

    function parseArtificial(token, word) {
      if (word._artificial) {
        token.artificial = true;
        token.type = word._artificial;
      }
    }

    function parseComment(token, word) {
      var comment = word._comment;
      if (comment) {
        token.comment = comment;
      }
    }
    // Helpers


    function extractArtificials(words, sentenceId) {
      return arethusaUtil.inject({}, words, function(memo, word, i) {
        extractArtificial(memo, word, sentenceId);
      });
    }

    function extractArtificial(memo, word, sentenceId) {
      if (word._artificial) {
        memo[word._id] = padWithSentenceId(word._insertion_id, sentenceId);
      }
    }

    function generateInternalId(word, sentenceId) {
      if (word._artificial) {
        return padWithSentenceId(word._insertion_id, sentenceId);
      } else {
        return idHandler.getId(word._id, sentenceId);
      }
    }

    // This is for backwards compatibility - we still might encounter documents, which
    // stored the insertion id without the sentence id. This is a little hacky but a
    // must have.
    function padWithSentenceId(id, sentenceId) {
      return (id.match(/-/)) ? id : idHandler.padIdWithSId(id, sentenceId);
    }

    // Try to support the new as well as the old schema for now
    function extractCiteInfo(sentence) {
      var cite = sentence._cite;
      if (cite) {
        return cite;
      } else {
        var docId = sentence._document_id;
        var subdoc = sentence._subdoc;
        if (subdoc) {
          return docId + ':' + subdoc;
        } else {
          return docId;
        }
      }
    }

    function findAdditionalConfInfo(json) {
      var linkInfo = json.treebank.link;
      var links =  linkInfo ? arethusaUtil.toAry(linkInfo) : [];
      var confs = arethusaUtil.inject({}, links, function(memo, link) {
        memo[link._title] = link._href;
      });
      var format = json.treebank._format;
      if (format) {
        // For backwards compatibility to older days
        if (format == 'aldt') {
          format = 'aldt2' + json.treebank['_xml:lang'];
        }
        confs.fullFile = format;
      }
      return confs;
    }

    function isHumanAnnotator(annotator) {
      // Machine services don't come with a name attached to them
      return annotator.name && annotator.short;
    }



    return function (conf) {
      var self = this;
      var resource = configurator.provideResource(conf.resource);
      var docId = conf.docIdentifier;

      this.preselections = retrieverHelper.getPreselections(conf);

      this.parse = function(xml, callback) {
        var json = arethusaUtil.xml2json(xml);
        var moreConf = findAdditionalConfInfo(json);
        var doc = commons.doc(xml, json, moreConf);

        documentStore.addDocument(docId, doc);
        callback(parseDocument(json, docId));
      };

      // Called with either one, or two params
      this.get = function (params, callback) {
        if (!callback) {
          callback = params;
          params = {};
        }

        resource.get(params).then(function (res) {
          self.parse(res.data, callback);
        });
      };
    };
  }
]);

"use strict";

// This should rather be a factory, that returns a constructor -
// and the constructor takes customized idGenerator functions.
// TODO: Like the generateID function in the TreeBankRetriever?

/**
 * This service provides functionality to retrievers that covers mapping between external and internal IDs,
 * and announcing pre-selections to the state.
 */
angular.module('arethusa').service('retrieverHelper', [
  'idHandler',
  'locator',
  function(idHandler, locator) {

      /**
       * This adds a mapping to the idHandler and extends the stateToken with it
       * @param stateToken token located in the state
       * @param internalId local token ID (usually sentence index plus word index internal to a chunk)
       * @param sourceId token ID in the containing document
       * @param docId ID for the containing document
       */
    this.generateId = function(stateToken, internalId, sourceId, docId) {
      var idMap = new idHandler.Map();
      idMap.add(docId, internalId, sourceId, stateToken.sentenceId);
      stateToken.id = internalId;
      stateToken.idMap = idMap;
    };

    // Currently disfunct - needs sentence id to work again
    // Preselections = selection specified in config, to be declared to state
    /**
     * This gets and formats pre-selection IDs for declaration to the state during init
     * @param conf configuration for retriever
     * @returns {*} state ids for pre-selections
       */
    this.getPreselections = function(conf) {
      var preselections = aU.toAry(locator.get(conf.preselector));
      return arethusaUtil.map(preselections, function(id) {
        return idHandler.getId(id);
      });
    };
  }
]);

'use strict';

angular.module('arethusa').constant('VERSION', {
  revision: 'b1ea495d3eddee718bc2729b69fe2fc1202d7775',
  branch: 'gardener_widget',
  version: '0.2.5',
  date: '2020-04-27T14:42:52.306Z',
  repository: 'http://github.com/latin-language-toolkit/arethusa'
});

angular.module('arethusa').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('js/templates/conf_editor.html',
    "<arethusa-navbar></arethusa-navbar>\n" +
    "\n" +
    "<div class=\"row panel\">\n" +
    "  <div class=\"colums small-12\">\n" +
    "    <h3>Conf editor</h3>\n" +
    "      <strong>{{ fileName() }}</strong>\n" +
    "    <div>\n" +
    "      <ul class=\"button-group right\">\n" +
    "        <li><button ng-click=\"save()\" class=\"small\">Save</button></li>\n" +
    "        <li><button ng-clikc=\"saveAs()\" class=\"small\">Save as...</button></li>\n" +
    "        <!--needs something like dropdown where we can enter a new filename-->\n" +
    "        <li><button ng-click=\"reset()\" class=\"small\">Reset</button></li>\n" +
    "        <li><button ng-click=\"toggleDebugMode()\" class=\"small\">Debug</button></li>\n" +
    "      </ul>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "  <div debug=\"conf\"></div>\n" +
    "</div>\n" +
    "\n" +
    "<div class=\"row panel\">\n" +
    "  <div class=\"columns large-12\">\n" +
    "    <div class=\"columns large-3\">\n" +
    "      <simple-form text=\"Main Template\" model=\"main().template\"></simple-form>\n" +
    "      <input type=\"checkbox\" ng-model=\"main().colorize\"/><label>Colorize tokens</label>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</div>\n" +
    "\n" +
    "<div class=\"row panel\">\n" +
    "  <h5>Data Sources</h5>\n" +
    "    <!--this is going to be a directive once the markup takes-->\n" +
    "    <!--more shape-->\n" +
    "    <ul class=\"button-group\">\n" +
    "      <li ng-repeat=\"(name, conf) in main().retrievers\"\n" +
    "          ng-click=\"toggleSelection('source', name)\">\n" +
    "        <span class=\"tiny button\">\n" +
    "          {{ name }}\n" +
    "        </span>\n" +
    "      </li>\n" +
    "    </ul>\n" +
    "    <div ng-repeat=\"(name, conf) in main().retrievers\" ng-show=\"isSelected('source', name)\">\n" +
    "      <!--\n" +
    "        Note on the remover attribute: We pass a function here through a\n" +
    "        one-way binding here. This function takes an argument, in this case\n" +
    "        removePlugin() takes the name of the plugin to remove. The name of this\n" +
    "        param in the attribute declaration is meaningless. It's just here to tell\n" +
    "        the pluginConf directive (which is in an isolated scope) that the function\n" +
    "        in fact takes an argument. It wouldn't need to be name here, it could be\n" +
    "        'foo' too.\n" +
    "      -->\n" +
    "      <retriever-conf\n" +
    "        name=\"name\"\n" +
    "        retriever=\"main().retrievers[name]\"\n" +
    "        remover=\"removeDataSource(name)\">\n" +
    "      </retriever-conf>\n" +
    "    </div>\n" +
    "    <conf-adder\n" +
    "      text=\"Add a data source\"\n" +
    "      submitter=\"addDataSource(input)\">\n" +
    "    </conf-adder>\n" +
    "</div>\n" +
    "\n" +
    "<div class=\"row panel\">\n" +
    "  <h5>Plugins</h5>\n" +
    "  <div>\n" +
    "    <ul class=\"button-group\">\n" +
    "      <li ng-repeat=\"name in main().plugins\">\n" +
    "        <span\n" +
    "          class=\"tiny button\"\n" +
    "          ng-class=\"{alert: isMainPlugin(name)}\"\n" +
    "          ng-click=\"toggleSelection('plugin', name)\">\n" +
    "          {{ name }}\n" +
    "        </span>\n" +
    "      </li>\n" +
    "    </ul>\n" +
    "  </div>\n" +
    "  <div ng-repeat=\"name in main().plugins\" ng-show=\"isSelected('plugin', name)\">\n" +
    "    <plugin-conf name=\"name\"></plugin-conf>\n" +
    "  </div>\n" +
    "  <conf-adder\n" +
    "    text=\"Add a plugin\"\n" +
    "    submitter=\"addPlugin(input)\">\n" +
    "  </conf-adder>\n" +
    "</div>\n" +
    "\n" +
    "<div class=\"row panel\">\n" +
    "  <h5>Resources</h5>\n" +
    "  <div>\n" +
    "    <ul class=\"button-group\">\n" +
    "      <li ng-repeat=\"(name, resource) in resources()\">\n" +
    "        <span class=\"tiny button\" ng-click=\"toggleSelection('resource', name)\">\n" +
    "          {{ name }}\n" +
    "        </span>\n" +
    "      </li>\n" +
    "    </ul>\n" +
    "  </div>\n" +
    "  <div ng-repeat=\"(name, resource) in resources()\" ng-show=\"isSelected('resource', name)\">\n" +
    "    <resource-conf\n" +
    "      name=\"name\"\n" +
    "      resource=\"resource\"\n" +
    "      remover=\"removeResource(name)\">\n" +
    "    </resource-conf>\n" +
    "  </div>\n" +
    "  <conf-adder\n" +
    "    text=\"Create a resource\"\n" +
    "    submitter=\"addResource(input)\">\n" +
    "  </conf-adder>\n" +
    "</div>\n" +
    "\n" +
    "<div class=\"row panel\">\n" +
    "  <h5>Navbar</h5>\n" +
    "  <div class=\"columns large-3\">\n" +
    "    <simple-form text=\"Template\" model=\"navbar().template\"></simple-form>\n" +
    "    <span ng-repeat=\"key in navbarBooleans\">\n" +
    "      <input type=\"checkbox\" ng-model=\"navbar()[key]\"/><label>{{ key }}</label>\n" +
    "    </span>\n" +
    "  </div>\n" +
    "</div>\n"
  );


  $templateCache.put('js/templates/dep_tree.html',
    "<div class=\"tree-canvas\">\n" +
    "  <div class=\"tree-settings\">\n" +
    "    <span token-selector=\"state.tokens\"></span>\n" +
    "    <span\n" +
    "      class=\"note right settings-span-button\"\n" +
    "      ng-show=\"plugin.diffPresent\"\n" +
    "      ng-click=\"plugin.toggleDiff()\">\n" +
    "      Toggle Diff\n" +
    "    </span>\n" +
    "  </div>\n" +
    "\n" +
    "  <div\n" +
    "    lang-specific\n" +
    "    dependency-tree\n" +
    "    tokens=\"state.tokens\"\n" +
    "    styles=\"plugin.diffStyles()\"\n" +
    "    to-bottom>\n" +
    "  </div>\n" +
    "</div>\n"
  );


  $templateCache.put('js/templates/dep_tree2.html',
    "<div>\n" +
    "  <div class=\"tree-settings\">\n" +
    "    <span token-selector=\"state.tokens\"></span>\n" +
    "    <span\n" +
    "      class=\"note right settings-span-button\"\n" +
    "      ng-show=\"plugin.diffPresent\"\n" +
    "      ng-click=\"plugin.toggleDiff()\">\n" +
    "      Toggle Diff\n" +
    "    </span>\n" +
    "    <span\n" +
    "      class=\"note right settings-span-button\"\n" +
    "      style=\"margin-left: 10px\"\n" +
    "      unused-token-highlighter\n" +
    "      uth-check-property=\"head.id\">\n" +
    "    </span>\n" +
    "  </div>\n" +
    "\n" +
    "  <div\n" +
    "    lang-specific\n" +
    "    dependency-tree\n" +
    "    tokens=\"state.tokens\"\n" +
    "    styles=\"plugin.diffStyles()\"\n" +
    "    to-bottom>\n" +
    "  </div>\n" +
    "</div>\n"
  );


  $templateCache.put('js/templates/dep_tree_widget.html',
    "<div class=\"tree-canvas\">\n" +
    "  <div\n" +
    "    lang-specific\n" +
    "    dependency-tree\n" +
    "    tokens=\"state.tokens\"\n" +
    "    styles=\"plugin.diffStyles()\"\n" +
    "    to-bottom>\n" +
    "  </div>\n" +
    "</div>\n"
  );


  $templateCache.put('js/templates/exercise_demo.html',
    "<arethusa-navbar></arethusa-navbar>\n" +
    "<p/>\n" +
    "<div id=\"canvas\" class=\"row panel full-height not-scrollable\" full-height>\n" +
    "  <div id=\"main-body\" class=\"columns small-7\">\n" +
    "    <div ng-repeat=\"pl in mainPlugins\">\n" +
    "      <plugin name=\"pl\"/>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "\n" +
    "  <div id=\"sidepanel\" class=\"columns small-5\">\n" +
    "    <div id=\"sidepanel-resizer\" full-height resizable></div>\n" +
    "    <div id=\"sidepanel-body\">\n" +
    "      <tabset>\n" +
    "        <tab\n" +
    "          ng-click=\"declareActive(pl.name)\"\n" +
    "          ng-repeat=\"pl in subPlugins\"\n" +
    "          heading=\"{{ pl.name }}\">\n" +
    "          <plugin name=\"pl\" ng-if=\"isActive(pl)\"/>\n" +
    "        </tab>\n" +
    "      </tabset>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</div>\n"
  );


  $templateCache.put('js/templates/external_history.html',
    "<p>(jQuery implementation)</p>\n" +
    "\n" +
    "<span id=\"undo\" class=\"label radius\">Undo</span>\n" +
    "<span id=\"redo\" class=\"label radius\">Redo</span>\n" +
    "<div id=\"ext-hist-elements\"></div>\n" +
    "\n" +
    "<script src=\"./js/other/external_history.js\"></script>\n"
  );


  $templateCache.put('js/templates/history.html',
    "<div>\n" +
    "  <span class=\"settings-span-button right\" hist-redo/>\n" +
    "  <span class=\"settings-span-button right\" hist-undo/>\n" +
    "  <div delimiter/>\n" +
    "  <div history-list/>\n" +
    "</div>\n"
  );


  $templateCache.put('js/templates/landing_page.html',
    "<arethusa-navbar></arethusa-navbar>\n" +
    "\n" +
    "<div class=\"canvas-border\"></div>\n" +
    "\n" +
    "<div class=\"panel row large-12 columns\">\n" +
    "  <div class=\"section\">\n" +
    "    <a href=\"https://github.com/latin-language-toolkit/arethusa\"><img style=\"position: absolute; top: 0; right: 0; border: 0;\" src=\"https://camo.githubusercontent.com/e7bbb0521b397edbd5fe43e7f760759336b5e05f/68747470733a2f2f73332e616d617a6f6e6177732e636f6d2f6769746875622f726962626f6e732f666f726b6d655f72696768745f677265656e5f3030373230302e706e67\" alt=\"Fork me on GitHub\" data-canonical-src=\"https://s3.amazonaws.com/github/ribbons/forkme_right_green_007200.png\"/></a>\n" +
    "    <p class=\"italic\"><span translate=\"landing.description\"/></p>\n" +
    "    <p><span translate=\"landing.goalsDescription\"/></p>\n" +
    "\n" +
    "    <div style=\"margin: auto\">\n" +
    "      <img src=\"../dist/examples/images/grid.png\" style=\"display: block; padding: 0 2rem; margin: auto\"/>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "\n" +
    "  <div class=\"large-12 columns\" style=\"padding: 1rem 0\"/>\n" +
    "\n" +
    "  <div class=section>\n" +
    "    <h3><span translate=\"useCases\"/></h3>\n" +
    "    <p><span translate=\"landing.modularNature\"/></p>\n" +
    "\n" +
    "    <div class=\"large-12 columns\">\n" +
    "      <div ng-repeat=\"useCase in useCases\">\n" +
    "        <h3 class=\"italic\"><span translate=\"{{ useCase.name }}\"/></h4>\n" +
    "        <div ng-repeat=\"example in useCase.examples\">\n" +
    "          <div\n" +
    "            class=\"large-4 columns panel clickable\"\n" +
    "            ng-click=\"goTo(example.url)\">\n" +
    "            <h4 translate=\"{{ example.name }}\"></h4>\n" +
    "            <img ng-src=\"{{ example.img }}\"/>\n" +
    "            <p>{{ example.caption }}</p>\n" +
    "          </div>\n" +
    "        </div>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "\n" +
    "  <div class=\"large-12 columns\" style=\"padding: 1rem 0\"/>\n" +
    "\n" +
    "  <div class=\"section\">\n" +
    "    <h3><span translate=\"gettingStarted\"/></h3>\n" +
    "    <iframe width=\"640\" height=\"360\" src=\"//www.youtube.com/embed/FbRRoVnVuDs\" frameborder=\"0\" allowfullscreen></iframe>\n" +
    "    <iframe width=\"640\" height=\"360\" src=\"//www.youtube.com/embed/hp-bhasd96g\" frameborder=\"0\" allowfullscreen></iframe>\n" +
    "    <p>\n" +
    "    <a href=\"http://sites.tufts.edu/perseids/instructions/screencasts/\"><span translate=\"landing.moreScreencasts\"/></a>\n" +
    "    </p>\n" +
    "  </div>\n" +
    "\n" +
    "  <div class=\"large-12 columns\" style=\"padding: 1rem 0\"/>\n" +
    "\n" +
    "  <div class=\"section\">\n" +
    "    <h3><span translate=\"development\"/></h3>\n" +
    "    <p><span translate=\"landing.devDescription\"/></p>\n" +
    "  </div>\n" +
    "\n" +
    "  <div class=\"large-12 columns\" style=\"padding: 1rem 0\"/>\n" +
    "\n" +
    "  <div style=\"section\">\n" +
    "    <h3><span translate=\"landing.partners\"/></h3>\n" +
    "    <div class=\"large-12 columns\">\n" +
    "      <div class=\"img-container\" style=\"display: inline-block\">\n" +
    "        <a href=\"{{ partners[0].href }}\">\n" +
    "          <img class=\"center\" style=\"height: 200px\" ng-src=\"{{ partners[0].img }}\"/>\n" +
    "        </a>\n" +
    "      </div>\n" +
    "      <div class=\"img-container\" style=\"display: inline-block\">\n" +
    "        <a href=\"{{ partners[1].href }}\">\n" +
    "          <img class=\"center\" style=\"height: 150px\" ng-src=\"{{ partners[1].img }}\"/>\n" +
    "        </a>\n" +
    "      </div>\n" +
    "      <div class=\"img-container\" style=\"display: inline-block\">\n" +
    "        <a href=\"{{ partners[2].href }}\" target=\"_blank\">\n" +
    "          <img class=\"center\" style=\"height: 70px; margin: 2rem\" ng-src=\"{{ partners[2].img }}\"/>\n" +
    "        </a>\n" +
    "      </div>\n" +
    "      <div class=\"img-container\" style=\"display: inline-block\">\n" +
    "        <a href=\"{{ partners[3].href }}\" target=\"_blank\">\n" +
    "          <img class=\"center\" style=\"height: 200px\" ng-src=\"{{ partners[3].img }}\"/>\n" +
    "        </a>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "    <p>\n" +
    "  </div>\n" +
    "\n" +
    "  <div class=\"large-12 columns\" style=\"padding: 1rem 0\"/>\n" +
    "\n" +
    "  <div style=\"section\">\n" +
    "    <h3><span translate=\"landing.awards\"/></h3>\n" +
    "    <div class=\"large-12 columns\">\n" +
    "      <div class=\"img-container\" style=\"display: inline-block\">\n" +
    "        <a href=\"{{ awards[0].href }}\">\n" +
    "          <img class=\"center\" style=\"height: 120px\" ng-src=\"{{ awards[0].img }}\"/>\n" +
    "        </a>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "\n" +
    "  <div class=\"large-12 columns\" style=\"padding: 1rem 0\"/>\n" +
    "\n" +
    "  <div>\n" +
    "    <h3><span translate=\"landing.funders\"/></h3>\n" +
    "    <p><span translate=\"landing.fundersDescription\"/></p>\n" +
    "  </div>\n" +
    "</div>\n" +
    "\n"
  );


  $templateCache.put('js/templates/main.html',
    "<div class=\"row panel\">\n" +
    "  <div class=\"columns small-12\">\n" +
    "    <h3>Main Controller</h3>\n" +
    "    Selected tokens: {{ state.currentTokensAsStringList() }}\n" +
    "  </div>\n" +
    "</div>\n" +
    "\n" +
    "<div ng-repeat=\"pl in plugins\" class=\"row panel\">\n" +
    "  <div class=\"columns small-12\">\n" +
    "    <plugin name=\"{{ pl }}\"/>\n" +
    "  </div>\n" +
    "</div>\n"
  );


  $templateCache.put('js/templates/main2.html',
    "<arethusa-navbar></arethusa-navbar>\n" +
    "\n" +
    "<div class=\"row panel\">\n" +
    "  <div class=\"columns small-12\">\n" +
    "    <div>\n" +
    "      <h3>Main State</h3>\n" +
    "      <p>\n" +
    "        {{ state.selectedTokens }}\n" +
    "        <button deselector class=\"right small\">Deselect all</button>\n" +
    "        <button ng-click=\"toggleDebugMode()\" class=\"right small\">Debug</button>\n" +
    "      </p>\n" +
    "    </div>\n" +
    "    <div debug=\"state.tokens\"></div>\n" +
    "  </div>\n" +
    "</div>\n" +
    "\n" +
    "\n" +
    "<div class=\"row panel full-height\">\n" +
    "  <div class=\"columns small-6\">\n" +
    "    <div ng-repeat=\"pl in mainPlugins\">\n" +
    "      <plugin name=\"pl\"/>\n" +
    "      <hr>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "\n" +
    "  <div class=\"columns small-6\">\n" +
    "    <tabset>\n" +
    "      <tab ng-repeat=\"pl in subPlugins\" heading=\"{{ pl.name }}\">\n" +
    "        <plugin name=\"pl\"/>\n" +
    "      </tab>\n" +
    "    </tabset>\n" +
    "  </div>\n" +
    "</div>\n"
  );


  $templateCache.put('js/templates/main3.html',
    "<arethusa-navbar></arethusa-navbar>\n" +
    "\n" +
    "<div class=\"canvas-border\"></div>\n" +
    "\n" +
    "<div class=\"panel\">\n" +
    "<a href=\"https://github.com/latin-language-toolkit/arethusa\"><img style=\"position: absolute; top: 0; right: 0; border: 0;\" src=\"https://camo.githubusercontent.com/e7bbb0521b397edbd5fe43e7f760759336b5e05f/68747470733a2f2f73332e616d617a6f6e6177732e636f6d2f6769746875622f726962626f6e732f666f726b6d655f72696768745f677265656e5f3030373230302e706e67\" alt=\"Fork me on GitHub\" data-canonical-src=\"https://s3.amazonaws.com/github/ribbons/forkme_right_green_007200.png\"></a>\n" +
    "<h3>Arethusa</h3>\n" +
    "<p>TODO description</p>\n" +
    "\n" +
    "<h3>Use cases or configurations</h3>\n" +
    "<p>Through its modular nature Arethusa can be configured for different use cases:<p>\n" +
    "TODO\n" +
    "<div class=\"row\" data-equalizer>\n" +
    "  <div class=\"large-4 columns panel\" data-equalizer-watch>\n" +
    "    <h4>Treebanking</h4>\n" +
    "    TODO description\n" +
    "    <a href=\"/app/#/staging2?doc=1&s=2\">Example</a>\n" +
    "    TODO image\n" +
    "  </div>\n" +
    "  <div class=\"large-4 columns panel\" data-equalizer-watch>\n" +
    "    <h4>Review mode</h4>\n" +
    "    <a href=\"/app/#/review_test?doc=1&gold=11\">Example</a>\n" +
    "  </div>\n" +
    "  <div class=\"large-4 columns panel\" data-equalizer-watch>\n" +
    "    <h4>Review mode</h4>\n" +
    "    <a href=\"/app/#/review_test?doc=1&gold=11\">Example</a>\n" +
    "  </div>\n" +
    "</div>\n" +
    "The new Grid layout\n" +
    "http://localhost:8081/app/#/staging3?doc=1\n" +
    "\n" +
    "\n" +
    "\n" +
    "A Greek document, including the SG plugin\n" +
    "http://localhost:8081/app/#/sg?doc=athenaeus12&s=1\n" +
    "\n" +
    "An empty document to play around (saving disabled)\n" +
    "http://localhost:8081/app/#/clean?doc=clean1\n" +
    "\n" +
    "<h3>Getting started</h3>\n" +
    "<iframe width=\"640\" height=\"360\" src=\"//www.youtube.com/embed/FbRRoVnVuDs\" frameborder=\"0\" allowfullscreen></iframe>\n" +
    "<iframe width=\"640\" height=\"360\" src=\"//www.youtube.com/embed/hp-bhasd96g\" frameborder=\"0\" allowfullscreen></iframe>\n" +
    "<p>\n" +
    "<a href=\"http://sites.tufts.edu/perseids/instructions/screencasts/\">More screencasts</a>\n" +
    "</p>\n" +
    "\n" +
    "<h3>Development</h3>\n" +
    "<p>\n" +
    "Arethusa is built on the <a href=\"https://angularjs.org/angular.js\">AngularJS</a> javascript web application framework \n" +
    "and provides a back-end independent plugin infrastructure for accessing texts, annotations and linguistic services from a variety of sources. \n" +
    "Extensibility is a guiding design goal - Arethusa includes tools for automatic generation of new plugin skeletons \n" +
    "(<a href=\"https://github.com/latin-language-toolkit/arethusa-cli\">Arethusa::CLI</a>) and detailed development guides are currently in progress (TODO link?), \n" +
    "with the hopes that others will be able to reuse and build upon the platform to add support for other annotation types, \n" +
    "languages and back-end repositories and workflow engines.\n" +
    "</p>\n" +
    "\n" +
    "\n" +
    "<h3>Funders</h3>\n" +
    "<p>This project has received support from the <a href=\"http://www.mellon.org/\">Andrew W. Mellon Foundation</a> and the <a href=\"http://imls.gov/\">Institute of Museum and Library Services</a>.</p>\n" +
    "</div>\n" +
    "\n"
  );


  $templateCache.put('js/templates/main_grid.html',
    "<div>\n" +
    "  <div id=\"arethusa-editor\">\n" +
    "    <div class=\"canvas-border\"/>\n" +
    "\n" +
    "    <div arethusa-grid/>\n" +
    "\n" +
    "    <div arethusa-context-menus tokens=\"state.tokens\" plugins=\"plugins.withMenu\"/>\n" +
    "  </div>\n" +
    "  <div notifications/>\n" +
    "  <div id=\"arethusa-sentence-list\" class=\"hide\"/>\n" +
    "</div>\n"
  );


  $templateCache.put('js/templates/main_grid_widget.html',
    "<div>\n" +
    "  <div id=\"arethusa-editor\">\n" +
    "    <div class=\"canvas-border\"/>\n" +
    "\n" +
    "    <div arethusa-grid/>\n" +
    "\n" +
    "    <div arethusa-context-menus tokens=\"state.tokens\" plugins=\"plugins.withMenu\"/>\n" +
    "  </div>\n" +
    "  <div notifications/>\n" +
    "  <div id=\"arethusa-sentence-list\" class=\"hide\"/>\n" +
    "  <arethusa-navbar/>\n" +
    "</div>\n"
  );


  $templateCache.put('js/templates/main_with_sidepanel.html',
    "<div>\n" +
    "  <div id=\"arethusa-editor\">\n" +
    "    <div class=\"canvas-border\"/>\n" +
    "\n" +
    "    <div id=\"canvas\" class=\"row panel full-height not-scrollable\" full-height>\n" +
    "      <div id=\"main-body\" to-bottom>\n" +
    "        <div ng-repeat=\"pl in plugins.main\" plugin name=\"{{ pl.name }}\"/>\n" +
    "        <div keys-to-screen/>\n" +
    "      </div>\n" +
    "\n" +
    "      <div id=\"sidepanel\" sidepanel to-bottom class=\"scrollable\">\n" +
    "        <div id=\"sidepanel-resizer\" resizable to-bottom></div>\n" +
    "        <div id=\"sidepanel-body\" arethusa-tabs=\"plugins.sub\"/>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <div arethusa-context-menus tokens=\"state.tokens\" plugins=\"plugins.withMenu\"/>\n" +
    "  </div>\n" +
    "  <div notifications/>\n" +
    "  <div id=\"arethusa-sentence-list\" class=\"hide\"/>\n" +
    "</div>\n"
  );


  $templateCache.put('js/templates/morph.html',
    "<h3>Morph plugin</h3>\n" +
    "<ul>\n" +
    "  <li ng-repeat=\"analysis in plugin.currentAnalyses()\">\n" +
    "    Forms of {{ analysis.string}}\n" +
    "    <ol>\n" +
    "      <li ng-repeat=\"form in analysis.forms\">\n" +
    "        <morph-form></morph-form>\n" +
    "      </li>\n" +
    "    </ol>\n" +
    "  </li>\n" +
    "</ul>\n"
  );


  $templateCache.put('js/templates/morph2.html',
    "<div class=\"right\">\n" +
    "  <prev-token><span class=\"label radius\">prev</span></prev-token>\n" +
    "  <next-token><span class=\"label radius\">next</span></next-token>\n" +
    "</div>\n" +
    "\n" +
    "<!--{{ plugin.analyses }}-->\n" +
    "\n" +
    "<div ng-repeat=\"(id, analysis) in plugin.currentAnalyses()\">\n" +
    "  <p token-with-id value=\"analysis.string\" token-id=\"id\"/>\n" +
    "  <accordion close-others=\"oneAtATime\">\n" +
    "    <accordion-group ng-repeat=\"form in analysis.forms\" >\n" +
    "      <accordion-heading>\n" +
    "         <div class=\"row\">\n" +
    "           <div class=\"columns small-5\">\n" +
    "             • <span ng-style=\"plugin.styleOf(form)\">{{ form.lemma }}\n" +
    "             <br>\n" +
    "             </span> {{ plugin.concatenatedAttributes(form) }}\n" +
    "           </div>\n" +
    "           <div class=\"columns small-2\">{{ form.postag }}</div>\n" +
    "           <div class=\"columns small-2 note\">{{ form.origin }}</div>\n" +
    "           <div form-selector class=\"columns small-2 right end\"></div>\n" +
    "         </div>\n" +
    "      </accordion-heading>\n" +
    "      <morph-form-edit></morph-form-edit>\n" +
    "    </accordion-group>\n" +
    "    <accordion-group heading=\"Create new form\">\n" +
    "      <morph-form-create></morph-form-create>\n" +
    "    </accordion-group>\n" +
    "  </accordion>\n" +
    "</div>\n"
  );


  $templateCache.put('js/templates/morph3.html',
    "<div\n" +
    "  class=\"note right span-settings-button\"\n" +
    "  style=\"margin-top: 10px\"\n" +
    "  unused-token-highlighter\n" +
    "  uth-check-property=\"morphology\"\n" +
    "  uth-auxiliary-property=\"postag\">\n" +
    "</div>\n" +
    "\n" +
    "<div ng-repeat=\"(id, analysis) in plugin.currentAnalyses()\">\n" +
    "  <div class=\"small-12 columns\" lang-specific>\n" +
    "    <p token-with-id value=\"analysis.string\" token-id=\"id\"/>\n" +
    "    <p ng-if=\"plugin.gloss\">\n" +
    "      <label>\n" +
    "        <span translate=\"morph.lemmaTranslation\"/>\n" +
    "        <input class=\"compact\"\n" +
    "          type=\"text\"\n" +
    "          ng-change=\"plugin.updateGloss(id)\"\n" +
    "          ng-model=\"analysis.gloss\">\n" +
    "        </input>\n" +
    "      </label>\n" +
    "    </p>\n" +
    "    <p ng-if=\"plugin.additionalFields\">\n" +
    "      <label>\n" +
    "        <span translate=\"morph.alternateGloss\"/>\n" +
    "        <input class=\"compact\"\n" +
    "          type=\"text\"\n" +
    "          ng-change=\"plugin.updateAlternateGloss(id)\"\n" +
    "          ng-model=\"analysis.alternateGloss\">\n" +
    "        </input>\n" +
    "      </label>\n" +
    "      <label>\n" +
    "        <span translate=\"morph.semanticRole\"/>\n" +
    "        <input class=\"compact\"\n" +
    "          type=\"text\"\n" +
    "          ng-change=\"plugin.updateSemanticRole(id)\"\n" +
    "          ng-model=\"analysis.semanticRole\">\n" +
    "        </input>\n" +
    "      </label>\n" +
    "      <label>\n" +
    "        <span translate=\"morph.include\"/>\n" +
    "        <input class=\"compact\"\n" +
    "          type=\"text\"\n" +
    "          ng-change=\"plugin.updateInclude(id)\"\n" +
    "          ng-model=\"analysis.include\">\n" +
    "        </input>\n" +
    "      </label>\n" +
    "      <label>\n" +
    "        <span translate=\"morph.multiword\"/>\n" +
    "        <input class=\"compact\"\n" +
    "          type=\"text\"\n" +
    "          ng-change=\"plugin.updateMultiword(id)\"\n" +
    "          ng-model=\"analysis.multiword\">\n" +
    "        </input>\n" +
    "      </label>\n" +
    "      <label>\n" +
    "        <span translate=\"morph.notes\"/>\n" +
    "        <input class=\"compact\"\n" +
    "          type=\"text\"\n" +
    "          ng-change=\"plugin.updateNotes(id)\"\n" +
    "          ng-model=\"analysis.notes\">\n" +
    "        </input>\n" +
    "      </label>\n" +
    "    </p>\n" +
    "    <accordion close-others=\"oneAtATime\">\n" +
    "      <accordion-group\n" +
    "        ng-repeat=\"form in analysis.forms\"\n" +
    "        is-open=\"plugin.expandSelection && form.selected\">\n" +
    "        <accordion-heading>\n" +
    "          <div class=\"row\" accordion-highlighter>\n" +
    "            <div form-selector class=\"columns large-1 small-1\"></div>\n" +
    "            <div class=\"columns large-3 small-5 text\">\n" +
    "              <span ng-style=\"plugin.styleOf(form)\" lang-specific>{{ form.lemma }}\n" +
    "              <br>\n" +
    "              </span> {{ plugin.concatenatedAttributes(form) }}\n" +
    "            </div>\n" +
    "            <div\n" +
    "              class=\"columns large-4 small-5 postag\">\n" +
    "              {{ form.postag }}\n" +
    "            </div>\n" +
    "            <div class=\"columns large-1 hide-for-small hide-for-medium note end\">{{ form.origin }}</div>\n" +
    "          </div>\n" +
    "          <hr class=\"small\">\n" +
    "        </accordion-heading>\n" +
    "        <div class=\"small-12 columns\" morph-form-attributes=\"form\" token-id=\"id\"></div>\n" +
    "        <p class=\"small-12 columns\"/>\n" +
    "        <hr>\n" +
    "      </accordion-group>\n" +
    "    </accordion>\n" +
    "  </div>\n" +
    "  <div ng-if=\"plugin.canEdit()\">\n" +
    "    <div class=\"small-6 columns\">\n" +
    "      <button\n" +
    "        reveal-toggle=\"mfc{{ id }}\"\n" +
    "        class=\"micro radius\">\n" +
    "        <span translate=\"morph.createNewForm\"/>\n" +
    "      </button>\n" +
    "    </div>\n" +
    "    <morph-form-create\n" +
    "      id=\"mfc{{ id }}\"\n" +
    "      morph-id=\"id\"\n" +
    "      morph-token=\"analysis\"\n" +
    "      class=\"hide\">\n" +
    "    </morph-form-create>\n" +
    "  </div>\n" +
    "  <div delimiter/>\n" +
    "</div>\n"
  );


  $templateCache.put('js/templates/morph_form.html',
    "<ul>\n" +
    "  <li ng-repeat=\"(attr, val) in form.attributes\">\n" +
    "    {{ plugin.longAttributeName(attr) }}: {{ plugin.abbrevAttributeValue(attr, val) }}\n" +
    "  </li>\n" +
    "</ul>\n"
  );


  $templateCache.put('js/templates/morph_form_create.html',
    "<div class=\"small-6 columns\">\n" +
    "  <ul class=\"button-group right\">\n" +
    "    <li>\n" +
    "      <span\n" +
    "        class=\"button micro radius\"\n" +
    "        ng-click=\"reset()\"\n" +
    "        translate=\"reset\">\n" +
    "      </span>\n" +
    "    </li>\n" +
    "    <li>\n" +
    "      <span\n" +
    "        class=\"button micro radius\"\n" +
    "        ng-click=\"save(mFCForm.$valid)\"\n" +
    "        translate=\"save\">\n" +
    "      </span>\n" +
    "    </li>\n" +
    "  </ul>\n" +
    "</div>\n" +
    "\n" +
    "<div delimiter></div>\n" +
    "\n" +
    "<form name=\"mFCForm\">\n" +
    "  <div class=\"small-12 columns\">\n" +
    "    <alert\n" +
    "      ng-if=\"alert\"\n" +
    "      class=\"radius center fade-in error\"\n" +
    "      close=\"resetAlert()\">\n" +
    "      {{ translations.createError() }}\n" +
    "    </alert>\n" +
    "  </div>\n" +
    "\n" +
    "  <div class=\"small-12 columns\">\n" +
    "    <div class=\"small-3 columns\">\n" +
    "      <label class=\"right\">Lemma</label>\n" +
    "    </div>\n" +
    "    <div class=\"small-9 columns\">\n" +
    "      <ng-form\n" +
    "        id=\"lemma-form\"\n" +
    "        tooltip-placement=\"top\"\n" +
    "        tooltip=\"{{ lemmaHint }}\">\n" +
    "        <input\n" +
    "          foreign-keys\n" +
    "          class=\"compact error\"\n" +
    "          type=\"text\"\n" +
    "          required\n" +
    "          ng-change=\"declareOk()\"\n" +
    "          ng-model=\"form.lemma\">\n" +
    "        </input>\n" +
    "      </ng-form>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "\n" +
    "  <div\n" +
    "    ng-repeat=\"attr in visibleAttributes\"\n" +
    "    ng-init=\"options= m.attributeValues(attr)\">\n" +
    "    <div class=\"small-12 columns\">\n" +
    "      <div class=\"small-3 columns\">\n" +
    "        <label class=\"right\">{{ m.longAttributeName(attr) }}</label>\n" +
    "      </div>\n" +
    "\n" +
    "      <div class=\"small-9 columns\">\n" +
    "        <select\n" +
    "          class=\"compact\"\n" +
    "          required\n" +
    "          ng-model=\"form.attributes[attr]\"\n" +
    "          ng-options=\"options[key].long for key in options | keys\"\n" +
    "          ng-change=\"m.updatePostag(form, attr, form.attributes[attr])\">\n" +
    "        </select>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</form>\n"
  );


  $templateCache.put('js/templates/morph_form_edit.html',
    "<div class=\"row\" ng-repeat=\"(attr, val) in form.attributes\">\n" +
    "  <div class=\"small-3 columns\">\n" +
    "    <label class=\"right\">{{ plugin.longAttributeName(attr) }}</label>\n" +
    "  </div>\n" +
    "\n" +
    "  <div class=\"small-9 columns\">\n" +
    "    <select\n" +
    "      ng-model=\"form.attributes[attr]\"\n" +
    "      ng-init=\"opt.short\"\n" +
    "      ng-options=\"name as opt.long for (name, opt) in plugin.attributeValues(attr)\"\n" +
    "      fire-event=\"{target: 'form', property: 'attr', value: 'val'}\"\n" +
    "      synchronize-postag=\"{form: 'form', attr: 'attr', val: 'val'}\">\n" +
    "    </select>\n" +
    "  </div>\n" +
    "</div>\n" +
    "<small ng-show=\"form.lexInvUri\">Lexical Inventory: {{ form.lexInvUri }}</small>\n"
  );


  $templateCache.put('js/templates/navbar.widget.html',
    "<div class=\"absolute_top\">\n" +
    "  <nav class=\"top-bar\" data-topbar>\n" +
    "    <ul class=\"title-area\">\n" +
    "      <li class=\"name\">\n" +
    "      <h1><a href=\"#\"><img ng-src=\"{{ logo }}\"/></a></h1>\n" +
    "      </li>\n" +
    "    </ul>\n" +
    "    <section class=\"top-bar-section\">\n" +
    "      <ul navbar-navigation/>\n" +
    "      <ul navbar-buttons class=\"right\"/>\n" +
    "    </section>\n" +
    "  </nav>\n" +
    "  <div help-panel class=\"hide row panel\"/>\n" +
    "</div>\n" +
    "<div global-settings-panel class=\"hide row panel\"/>\n"
  );


  $templateCache.put('js/templates/navbar1.html',
    "<div class=\"fixed\">\n" +
    "  <nav class=\"top-bar\" data-topbar>\n" +
    "    <ul class=\"title-area\">\n" +
    "      <li class=\"name\">\n" +
    "      <h1><a href=\"#\"><img ng-src=\"{{ logo }}\"/></a></h1>\n" +
    "      </li>\n" +
    "    </ul>\n" +
    "    <section class=\"top-bar-section\">\n" +
    "      <ul navbar-search/>\n" +
    "      <ul navbar-navigation/>\n" +
    "      <ul navbar-buttons class=\"right\"/>\n" +
    "    </section>\n" +
    "  </nav>\n" +
    "</div>\n" +
    "<div help-panel class=\"hide row panel\"/>\n" +
    "<div global-settings-panel class=\"hide row panel\"/>\n"
  );


  $templateCache.put('js/templates/navbar_landing.html',
    "<div class=\"fixed\">\n" +
    "  <nav class=\"top-bar\" data-topbar>\n" +
    "    <ul class=\"title-area\">\n" +
    "      <li class=\"name\">\n" +
    "      <h1><a href=\"#\"><img ng-src=\"{{ logo }}\"/></a></h1>\n" +
    "      </li>\n" +
    "    </ul>\n" +
    "    <section class=\"top-bar-section\">\n" +
    "      <ul class=\" has-form right\">\n" +
    "        <li><a class=\"button\" translate-language/></li>\n" +
    "      </ul>\n" +
    "    </section>\n" +
    "  </nav>\n" +
    "</div>\n"
  );


  $templateCache.put('js/templates/relation.html',
    "<div\n" +
    "  class=\"note right span-settings-button\"\n" +
    "  style=\"margin-top: 10px\"\n" +
    "  unused-token-highlighter\n" +
    "  uth-check-property=\"relation.label\">\n" +
    "</div>\n" +
    "\n" +
    "<div ng-if=\"plugin.advancedMode\">\n" +
    "  <div relation-multi-changer class=\"small-12 columns\"/>\n" +
    "  <div delimiter/>\n" +
    "</div>\n" +
    "\n" +
    "<div ng-repeat=\"(id, obj) in plugin.currentLabels()\">\n" +
    "    <div class=\"small-12 columns\" style=\"padding-bottom: 1rem\">\n" +
    "      <div token-with-id value=\"obj.string\" token-id=\"id\" style=\"padding-bottom: .4rem\"/>\n" +
    "      <div label-selector obj=\"obj.relation\"/>\n" +
    "        <syntactical-description\n" +
    "          ng-if=\"plugin.syntaxDescriptions\"\n" +
    "          token-id=\"id\">\n" +
    "        </syntactical-description>\n" +
    "    </div>\n" +
    "</div>\n" +
    "\n"
  );


  $templateCache.put('js/templates/search.html',
    "<div class=\"small-12 columns\">\n" +
    "  <div search-by-string/>\n" +
    "</div>\n" +
    "\n" +
    "<div class=\"small-12 columns\" ng-repeat=\"pl in plugin.searchPlugins\">\n" +
    "  <div plugin-search=\"pl\"></div>\n" +
    "</div>\n" +
    "\n" +
    "<div class=\"small-12 columns\">\n" +
    "  <label class=\"inline\">\n" +
    "    <span translate=\"search.foundTokens\"/>\n" +
    "  </label>\n" +
    "  <ul lang-specific>\n" +
    "    <li\n" +
    "      ng-repeat=\"(id, type) in state.selectedTokens\"\n" +
    "      class=\"fade fast clickable\"\n" +
    "      ng-mouseenter=\"hovered = true\"\n" +
    "      ng-mouseleave=\"hovered = false\"\n" +
    "      ng-class=\"{ 'search-result-hovered': hovered }\"\n" +
    "      ng-click=\"state.deselectToken(id, type)\"\n" +
    "      token-with-id\n" +
    "      value=\"state.asString(id)\"\n" +
    "      token-id=\"id\">\n" +
    "    </li>\n" +
    "  </ul>\n" +
    "</div>\n"
  );


  $templateCache.put('js/templates/sg.html',
    "<div class=\"small-12 columns\">\n" +
    "  <div ng-repeat=\"(id, grammar) in plugin.currentGrammar()\">\n" +
    "    <p token-with-id value=\"grammar.string\" token-id=\"id\"/>\n" +
    "    <p class=\"text\" style=\"margin-left: 0.75rem\">{{ grammar.hint }}</p>\n" +
    "    <div ng-hide=\"grammar.hint\">\n" +
    "      <div sg-ancestors=\"grammar\"/>\n" +
    "      <br/>\n" +
    "      <ul ng-if=\"plugin.canEdit()\" class=\"nested-dropdown\">\n" +
    "        <li class=\"first-item\">Select Smyth Categories\n" +
    "          <ul\n" +
    "            class=\"top-menu\"\n" +
    "            nested-menu-collection\n" +
    "            property=\"\"\n" +
    "            current=\"grammar\"\n" +
    "            ancestors=\"plugin.defineAncestors\"\n" +
    "            all=\"grammar.menu\"\n" +
    "            label-as=\"plugin.labelAs\"\n" +
    "            empty-val=\"true\">\n" +
    "          </ul>\n" +
    "        </li>\n" +
    "      </ul>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "\n" +
    "  <div sg-grammar-reader>\n" +
    "  </div>\n" +
    "</div>\n"
  );


  $templateCache.put('js/templates/text.html',
    "<h3>Text plugin</h3>\n" +
    "<table>\n" +
    "  <tr>\n" +
    "    <td ng-repeat=\"token in state.tokens\">\n" +
    "      {{ token.id }}\n" +
    "    </td>\n" +
    "  </tr>\n" +
    "  <tr>\n" +
    "      <!--this mouse behavior should get moved\n" +
    "          inside the token directive eventually-->\n" +
    "    <td\n" +
    "      ng-repeat=\"token in state.tokens\"\n" +
    "      ng-click=\"state.toggleSelection(token.id, 'click')\"\n" +
    "      ng-mouseenter=\"state.selectToken(token.id, 'hover')\"\n" +
    "      ng-mouseleave=\"state.deselectToken(token.id, 'hover')\">\n" +
    "      <token ng-class=\"{selected: state.isSelected(token.id)}\"></token>\n" +
    "    </td>\n" +
    "  </tr>\n" +
    "</table>\n"
  );


  $templateCache.put('js/templates/text2.html',
    "<p lang-specific>\n" +
    "  <span ng-repeat=\"token in plugin.tokens\">\n" +
    "    <span\n" +
    "      token=\"token\"\n" +
    "      colorize=\"true\"\n" +
    "      click=\"true\"\n" +
    "      hover=\"true\"\n" +
    "      highlight=\"true\">\n" +
    "    </span>\n" +
    "    <!--Deactivated for now - not safe to use with ellipsis-->\n" +
    "    <!--<br ng-if=\"token.terminator && !$last\"/>-->\n" +
    "  </span>\n" +
    "</p>\n"
  );


  $templateCache.put('js/templates/text_with_context.html',
    "<p lang-specific>\n" +
    "  <span\n" +
    "    ng-if=\"plugin.showContext\"\n" +
    "    text-context=\"plugin.context.pre\">\n" +
    "  </span>\n" +
    "  <span ng-repeat=\"token in plugin.tokens\">\n" +
    "    <span\n" +
    "      token=\"token\"\n" +
    "      colorize=\"true\"\n" +
    "      click=\"true\"\n" +
    "      hover=\"true\"\n" +
    "      highlight=\"true\">\n" +
    "    </span>\n" +
    "  </span>\n" +
    "  <span\n" +
    "    ng-if=\"plugin.showContext\"\n" +
    "    text-context=\"plugin.context.post\">\n" +
    "  </span>\n" +
    "</p>\n" +
    "\n"
  );


  $templateCache.put('js/templates/token.html',
    "<!--tcm is for tokenContextMenu-->\n" +
    "<span\n" +
    "  ng-class=\"selectionClass()\"\n" +
    "  context-menu\n" +
    "  menu-trigger=\"rightclick\"\n" +
    "  menu-id=\"tcm{{ token.id }}\"\n" +
    "  menu-position=\"bottom\"\n" +
    "  menu-obj=\"token\">{{ token.string }}</span>\n"
  );


  $templateCache.put('js/templates/tree.html',
    "<arethusa-navbar></arethusa-navbar>\n" +
    "\n" +
    "<div class=\"row panel\">\n" +
    "  <div class=\"columns small-12\">\n" +
    "    <div>\n" +
    "      <h3>Main State</h3>\n" +
    "      <p>\n" +
    "        {{ state.selectedTokens }}\n" +
    "        <button deselector class=\"right small\">Deselect all</button>\n" +
    "        <button ng-click=\"toggleDebugMode()\" class=\"right small\">Debug</button>\n" +
    "      </p>\n" +
    "    </div>\n" +
    "    <div debug=\"state.tokens\"></div>\n" +
    "  </div>\n" +
    "</div>\n" +
    "\n" +
    "\n" +
    "<div class=\"row panel full-height\">\n" +
    "  <div class=\"columns small-12\">\n" +
    "    <div ng-repeat=\"pl in mainPlugins\">\n" +
    "      <plugin name=\"pl\"/>\n" +
    "      <hr>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</div>\n" +
    "\n"
  );


  $templateCache.put('js/templates/widget.html',
    "<div>\n" +
    "  <div id=\"arethusa-editor\">\n" +
    "    <div class=\"canvas-border\"/>\n" +
    "\n" +
    "    <div id=\"canvas\" class=\"row panel full-height\" full-height>\n" +
    "      <div id=\"main-body\" class=\"widget\" to-bottom>\n" +
    "        <div arethusa-context-menus tokens=\"state.tokens\" plugins=\"plugins.withMenu\"/>\n" +
    "        <div ng-repeat=\"pl in plugins.main\" plugin name=\"{{ pl.name }}\"/>\n" +
    "        <div keys-to-screen/>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "  <arethusa-navbar/>\n" +
    "  <div notifications/>\n" +
    "  <div id=\"arethusa-sentence-list\" class=\"hide\"/>\n" +
    "</div>\n"
  );

}]);
