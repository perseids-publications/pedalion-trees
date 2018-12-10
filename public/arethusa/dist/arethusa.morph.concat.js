'use strict';
angular.module('arethusa.morph', []);

"use strict";

// This is a workaround for restrictions within the an accordion directive.
// An accordion-heading cannot receive a class before it's converted to a dd
// element (the foundation equivalent for an accordion-heading). We therefore
// place a class toggling directive onto a child element of it and set the class
// on the parent... Hacky, but effective.

angular.module('arethusa.morph').directive('accordionHighlighter', function() {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      var className = 'accordion-selected';

      scope.$watch('form.selected', function(newVal, oldVal) {
        if (newVal) {
          element.parent().addClass(className);
        } else {
          element.parent().removeClass(className);
        }
      });
    }
  };
});

'use strict';
angular.module('arethusa.morph').directive('formSelector', function () {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      var id = scope.id;

      function action(event) {
        event.stopPropagation();
        scope.$apply(function() {
          if (scope.form.selected) {
            scope.plugin.unsetState(id);
          } else {
            scope.plugin.setState(id, scope.form);
          }
        });
        // remove focus so shortcut keys can work
        event.target.blur();
      }

      scope.$watch('form.selected', function(newVal, oldVal) {
        scope.iconClass = newVal ? 'minus' : 'plus';
        scope.title     = newVal ? 'deselect' : 'select';
      });

      element.bind('click', action);
    },
    template: '\
      <input\
        type="checkbox"\
        class="postag-selector"\
        ng-checked="form.selected">\
      </input>\
    '
  };
});

"use strict";

angular.module('arethusa.morph').directive('mirrorMorphForm', [
  'morph',
  function(morph) {
    return {
      restrict: 'A',
      scope: {
        form: '=mirrorMorphForm',
        tokenId: '='
      },
      link: function(scope, element, attrs) {
        var morphToken = morph.analyses[scope.tokenId];
        var menuId = 'mfc' + scope.tokenId;

        function newCustomForm() {
          var form = angular.copy(scope.form);

          // We might want to clean up even more here - such as the
          // lexical inventory information. Revisit later.
          delete form.origin;

          return form;
        }

        element.bind('click', function() {
          scope.$apply(function() {
            morphToken.customForm = newCustomForm();
          });
        });
      }
    };
  }
]);

'use strict';
// unused right now
angular.module('arethusa.morph').directive('morphForm', function () {
  return {
    restrict: 'E',
    scope: true,
    templateUrl: 'js/templates/morph_form.html'
  };
});
"use strict";

angular.module('arethusa.morph').directive('morphFormAttributes', [
  'morph',
  'notifier',
  'state',
  function(morph, notifier, state) {
    return {
      restrict: 'A',
      scope: {
        form: '=morphFormAttributes',
        tokenId: '='
      },
      link: function(scope, element, attrs) {
        var id = scope.tokenId;

        scope.m = morph;
        scope.attrs = morph.sortAttributes(scope.form.attributes);
        scope.inv = scope.form.lexInv;

        scope.askForRemoval = function() {
          scope.confirmationRequested = true;
        };

        scope.skipRemoval = function() {
          scope.confirmationRequested = false;
        };

        scope.removeForm = function() {
          if (scope.form.selected) {
            morph.unsetState(id);
          }
          morph.removeForm(id, scope.form);
          notifier.success('Removed form of ' + state.asString(id));
        };
      },
      templateUrl: 'js/arethusa.morph/templates/morph_form_attributes.html'
    };
  }
]);

'use strict';

angular.module('arethusa.morph').directive('morphFormCreate', [
  'morph',
  'state',
  'notifier',
  'translator',
  'morphLocalStorage',
  function(morph, state, notifier, translator, morphLocalStorage) {
    return {
      restrict: 'E',
      scope: {
        token: '=morphToken',
        id: '=morphId'
      },
      link: function (scope, element, attrs, form) {
        var inArray = arethusaUtil.isIncluded;
        var lemmaForm = element.find('#lemma-form');

        scope.translations = translator({
          'morph.createSuccess': 'createSuccess',
          'morph.createError': 'createError'
        });


        scope.m = morph;
        scope.form = scope.token.customForm;
        scope.forms = scope.token.forms;

        function depdencencyMet(dependencies, type) {
          if (!dependencies) {
            return true;
          }
          var ok = true;
          for (var k in dependencies) {
            var condition;
            condition = checkAttribute(dependencies, k);
            condition = type ? condition : !condition;
            if (condition) {
              ok = false;
              break;
            }
          }
          return ok;
        }

        function checkAttribute(dependencies, attr) {
          var value = dependencies[attr];
          if (value === "*") {
            return angular.isDefined(scope.form.attributes[attr]);
          } else {
            return inArray(arethusaUtil.toAry(value), scope.form.attributes[attr]);
          }
        }

        function ifDependencyMet(dependencies) {
          return depdencencyMet(dependencies, false);
        }

        function unlessDependencyMet(dependencies) {
          return depdencencyMet(dependencies, true);
        }

        function rulesMet(rules) {
          // No rules, everything ok
          var isOk;
          if (!rules) {
            isOk = true;
          } else {
            for (var i = rules.length - 1; i >= 0; i--){
              var rule = rules[i];
              var ifDep = ifDependencyMet(rule['if']);
              var unDep = unlessDependencyMet(rule.unless);
              if (ifDep && unDep) {
                isOk = true;
                break;
              }
            }
          }
          return isOk;
        }

        function getVisibleAttributes() {
          return arethusaUtil.inject([], morph.postagSchema, function (memo, attr) {
            if (rulesMet(morph.rulesOf(attr))) {
              memo.push(attr);
            }
          });
        }

        function setVisibleAttributes() {
          scope.visibleAttributes = getVisibleAttributes();
        }

        function addLemmaHint() {
          lemmaForm.find('input').addClass('warn');
          translator('morph.lemmaHint', function(translation) {
            scope.lemmaHint = translation;
          });
        }

        function removeLemmaHint() {
          lemmaForm.find('input').removeClass('warn');
          scope.lemmaHint = '';
        }

        scope.declareOk = function() {
          removeLemmaHint();
        };

        scope.reset = function() {
          scope.resetAlert();
          addLemmaHint();
          morph.resetCustomForm(scope.token, scope.id);
        };

        scope.resetAlert = function() {
          scope.alert = false;
        };

        scope.save = function(valid) {
          if (valid) {
            cleanUpAttributes();
            addOrigin();
            addForm();
            scope.reset();
          } else {
            scope.alert = true;
          }
        };

        // At the point of saving we have undefined values around in the
        // forms attributes - we clean them up as to not distort our output
        function cleanUpAttributes() {
          var cleanAttrs = arethusaUtil.inject({}, scope.visibleAttributes, function(memo, attr) {
            memo[attr] = scope.form.attributes[attr];
          });
          scope.form.attributes = cleanAttrs;
          scope.form.postag = morph.attributesToPostag(scope.form.attributes);
        }

        function addOrigin() {
          scope.form.origin = 'you';
        }

        // Most of this functionality should be moved into the service!
        function addForm() {
          var newForm = angular.copy(scope.form);
          scope.forms.push(newForm);
          morph.setState(scope.id, newForm);
          morph.addToLocalStorage(scope.token.string, newForm);
          propagateToEqualTokens(newForm);
          var str = state.asString(scope.id);
          var msg = scope.translations.createSuccess({ form: str });
          notifier.success(msg);
        }

        function propagateToEqualTokens(form) {
          var str = scope.token.string;
          angular.forEach(state.tokens, function(token, id) {
            if (id !== scope.id) {
              if (token.string === str) {
                var morphForm = morph.analyses[id];
                var newForm = angular.copy(form);
                newForm.selected = false;
                morphForm.forms.push(newForm);
                if (!morph.hasSelection(morphForm)) {
                  morph.setState(id, newForm);
                }
              }
            }
          });
        }

        scope.$watch('form.attributes', function (newVal, oldVal) {
          setVisibleAttributes();
        }, true);

        scope.$watch('token.customForm', function(newVal, oldVal) {
          scope.form = newVal;
        });

        element.on('show-mfc' + scope.id, function() {
          // This hardcodes the idea of a sidepanel. Might rethink how to do this
          // at a later stage.
          var container = angular.element(document.getElementById('sidepanel'));
          // We need to scroll to the first child - the element itself is placed
          // at a completely different place in the DOM.
          container.scrollTo(element.children(), 0, 500);
        });

        addLemmaHint();
      },
      templateUrl: 'js/templates/morph_form_create.html'
    };
  }
]);

'use strict';
angular.module('arethusa.morph').directive('morphFormEdit', function () {
  return {
    restrict: 'E',
    templateUrl: 'js/templates/morph_form_edit.html'
  };
});
'use strict';
/* A newable factory to handle the Morphology service
 *
 * The constructor functions takes a configuration object (that typically
 * contains a resource object for this service).
 *
 */
angular.module('arethusa.morph').factory('BspMorphRetriever', [
  'configurator',
  function (configurator) {
    function deleteUnwantedKeys(obj, keys) {
      keys.forEach(function (el) {
        delete obj[el];
      });
    }

    function flattenAttributes(form) {
      for (var el in form) { 
        if (form[el].$) {
          var flat = form[el].$;
          form[el] = flat;
        }
      }
    }

    function renameAttributes(form, mappings) {
      if (!mappings) return;
      for (var oldName in mappings) {
        var newName = mappings[oldName];
        var val = form[oldName];
        delete form[oldName];
        form[newName] = val;
      }
    }

    function renameValues(form, mappings) {
      if (!mappings) return;
      for (var category in mappings) {
        var val = form[category];
        var actions = mappings[category];
        var actual = actions[val];
        if (actual) {
          form[category] = actual;
        }
      }
    }

    function formatLexInvData(uri) {
      if (uri) {
        return {
          uri: uri,
          urn: uri.slice(uri.indexOf('urn:'))
        };
      }
    }

    return function (conf) {
      var self = this;
      var resource = configurator.provideResource(conf.resource);

      this.getWord = function (word) {
        return resource.get({ 'word': word });
      };

      this.abort = resource.abort;
      this.flattenAttributes = flattenAttributes;

      this.getData = function (string, callback) {
        self.getWord(string).then(function (res) {
          try {
            // The body can contain a single object or an array of objects.
            // Can also be undefined, in that case we will just throw an exception
            // eventually - and we will end up in catch path and just return
            // an empty array.
            var entries = arethusaUtil.toAry(res.data.RDF.Annotation.Body);
            var results = arethusaUtil.inject([], entries, function (results, el) {
                var entry = el.rest.entry;
                var lemma = entry.dict.hdwd.$;
                // We might have multiple inflections for each entry and need to wrap
                // the array vs. object problem again.
                arethusaUtil.toAry(entry.infl).forEach(function (form) {
                  // form is an object with some key/val pairs we have no use for right
                  // now - we just ditch them. The rest we take and form another object,
                  // which will wrap up the morphological attributes and contain lemma
                  // information.
                  // There are actually more than these original 3 - we might want to do
                  // this differently at some point.
                  deleteUnwantedKeys(form, [
                    'term',
                    'stemtype'
                  ]);
                  // If the form has a case attribute, it wrapped in another object we
                  // don't want and need. Flatten it to a plain expression.
                  // The same goes for part of speech.
                  flattenAttributes(form);
                  renameAttributes(form, self.mapping.attributes);
                  renameValues(form, self.mapping.values);

                  results.push({
                    lexInvLocation: formatLexInvData(entry.uri),
                    lemma: lemma,
                    attributes: form,
                    origin: 'bsp/morpheus'
                  });
                });
              });
            callback(results);
          } catch (err) {
            return [];
          }
        });
        return [];
      };
    };
  }
]);

'use strict';
// Deprecated and not working, we don't need this anymore as we can just use the real deal.
// Kept for sudden mind changes.
angular.module('arethusa.morph').service('fakeMorphRetriever', function () {
  this.getStubData = function (callback) {
    var result;
    var request = $.ajax({
        url: './static/analyses.json',
        async: false
      });
    request.done(callback);
  };
  var stubData;
  this.getStubData(function (res) {
    stubData = res;
  });
  this.getData = function (string, callback) {
    var result = stubData[string] || [];
    callback(result);
  };
});

"use strict";

angular.module('arethusa.morph').service('LexicalInventoryRetriever', [
  'configurator',
  function(configurator) {
    function buildDictionaryLinksQuery(urn) {
      var q = '\
        select ?object from <http://data.perseus.org/ds/lexical>\
        where {' +
          '<' + urn  + '>\
          <http://purl.org/dc/terms/isReferencedBy> ?object\
        }\
      ';
      return q;
    }

    function linkProvider(link) {
      if (link.match('alpheios')) {
        return 'Alpheios';
      } else {
        if (link.match('logeion')) {
          return 'Logeion';
        } else {
          if (link.match('perseus')) {
            return 'Perseus';
          }
        }
      }
    }

    function extractLinks(data) {
      var objs = data.results.bindings;
      return arethusaUtil.inject({}, objs, function(memo, obj) {
        var link = obj.object.value;
        memo[linkProvider(link)] = link;
      });
    }

    return function(conf) {
      var resource = configurator.provideResource(conf.resource);

      this.getData = function(urn, form) {
        form.lexInv = {
          uri: form.lexInvLocation.uri,
          urn: form.lexInvLocation.urn
        };

        var query = buildDictionaryLinksQuery(urn);
        resource.get({ query: query }).then(function(res) {
          form.lexInv.dictionaries = extractLinks(res.data);
        });
      };
    };
  }
]);

'use strict';

/**
 * @ngdoc service
 * @name arethusa.morph.morph
 *
 * @description
 * Morphology Plugin Service
 *
 *
 * @requires arethusa.core.state
 * @requires arethusa.core.configurator
 * @requires arethusa.core.plugins
 * @requires arethusa.core.globalSettings
 * @requires arethusa.core.keyCapture
 * @requires arethusa.core.saver
 * @requires arethusa.core.navigator
 * @requires arethusa.core.exitHandler
 * @requires arethusa.morph.morphLocalStorage
 * @requires arethusa.util.commons
 */
angular.module('arethusa.morph').service('morph', [
  'state',
  'configurator',
  'plugins',
  'globalSettings',
  'keyCapture',
  'morphLocalStorage',
  'commons',
  'saver',
  'navigator',
  'exitHandler',
  function (
    state,
    configurator,
    plugins,
    globalSettings,
    keyCapture,
    morphLocalStorage,
    commons,
    saver,
    navigator,
    exitHandler
  ) {

    var morphRetrievers;
    var inventory;
    var searchIndex;
    var self = this;

    // SETTINGS & CONFIGURATIONS
    // -------------------------
    this.name = 'morph';
    // Shows a need to define the plugins name upfront - would also spare a first configure round when the service is injected for the first time. Part of a larger change though to be done a little later.
    globalSettings.addColorizer(self.name);
    this.canSearch = true;
    this.canEdit = function() {
      return self.mode === "editor";
    };

    this.defaultConf = {
      mappings: {},
      gloss: false,
      matchAll: true,
      preselect: false,
      localStorage: true,
      storePreferences: true
    };
    var emptyAttribute = {
      long: '---',
      short: '---',
      postag: '_'
    };

    // ANALYSES - FORMS - BEGIN
    function Forms(string) {
      this.string = string;
      this.forms  = [];
      this.analyzed = false;
    }
    this.emptyForm = function(string) {
      return {
        lemma: string,
        postag: self.emptyPostag,
        attributes: emptyAttributes()
      };

      function emptyAttributes() {
        return arethusaUtil.inject({}, self.postagSchema, function(memo, el) {
          memo[el] = undefined;
        });
      }
    };

    // UODATE AND HANDLE POSTAGS
    // -------------------------
    this.updatePostag = function (form, attr, val) {
      var index = self.postagSchema.indexOf(attr);
      var postag = self.postagValue(attr, val);
      form.postag = arethusaUtil.replaceAt(form.postag, index, postag);
    };
    this.postagToAttributes = function (form) {
      var attrs = {};
      angular.forEach(form.postag, function (postagVal, i) {
        var postagClass = self.postagSchema[i];
        var possibleVals = self.attributeValues(postagClass);
        var attrObj = arethusaUtil.findObj(possibleVals, function (obj) {
            return obj.postag === postagVal;
          });
        // attrObj can be undefined when the postag is -
        if (attrObj) {
          attrs[postagClass] = attrObj.short;
        }
      });
      form.attributes = attrs;
    };
    this.attributesToPostag = function (attrs) {
      var postag = '';
      var postagArr = arethusaUtil.map(self.postagSchema, function (el) {
          var attrVals = self.attributeValues(el);
          var val = attrs[el];
          var valObj = arethusaUtil.findObj(attrVals, function (e) {
            return e.short === val || e.long === val;
          });
          return valObj ? valObj.postag : '-';
        });
      return postagArr.join('');
    };

    // RETRIEVAL OF ANALYSES
    // ---------------------
    /**
     * @ngdoc function
     * @name arethusa.morph.morph.canRetrieveFrom
     * @methodOf arethusa.morph.morph
     *
     * @description
     * Checks to see if the plugin is enabled to
     * retrieve from the named morph retriever
     *
     * @param {String} string the name of the retriever
     *        for backwards compatibility, in addition to
     *        named retrievers, the following special values
     *        are supported: 'document','external'
     *
     * @returns {Boolean} true if the retriever is active otherwise false
     *
     */
    this.canRetrieveFrom = function(a_retriever) {
      var canRetrieve = false;
      // if it hasn't been configured at all, default is to retrieve from anything
      if (! self.noRetrieval) {
        canRetrieve = true;
      }
      // the only way to disable retrieval from the document is to turn off all retrieving
      else if (a_retriever === 'document') {
        canRetrieve = self.noRetrieval !== "all";
      // for backwards compatibility, 'external' means everything except the documen itself
      } else if (a_retriever === 'external') {
        canRetrieve = self.noRetrieval !== "online" && self.noRetrieval !== 'all';
      } else {
        var matchString = new RegExp("\\b" + a_retriever + "\\b");
        canRetrieve = self.noRetrieval !== "online" && self.noRetrieval !== 'all' && ! self.noRetrieval.match(matchString);
      }
      return canRetrieve;
    };
    this.getExternalAnalyses = function (analysisObj, id) {
      var loadedExternalAnalyses = {};
      angular.forEach(morphRetrievers, function (retriever, name) {
        if (self.canRetrieveFrom(name)) {
          loadedExternalAnalyses[name] = {};
          retriever.getData(analysisObj.string, function (res) {
            loadedExternalAnalyses[name][analysisObj.string] = true;
            res.forEach(function (el) {
              // need to parse the attributes now
              el.attributes = mapAttributes(el.attributes);
              // and build a postag
              el.postag = self.attributesToPostag(el.attributes);
              // try to obtain additional info from the inventory
              getDataFromInventory(el);
            });
            var str = analysisObj.string;
            var forms = analysisObj.forms;
            // we should not assume that an analysisObj (i.e. token)
            // has already been populated with any forms - only
            // merge duplicates if we have any to begin with
            if (forms.length > 0) {
              self.mergeDuplicateForms(forms[0], res);
            }
            var newForms = makeUnique(res);
            arethusaUtil.pushAll(forms, newForms);

            // wait until the last retriever finishes before handling
            // preselections
            var allDone = true;
            angular.forEach(loadedExternalAnalyses, function (retrieved, name) {
              if (! retrieved[analysisObj.string]) {
                allDone = false;
              }
            });
            if (allDone) {
              if (self.storePreferences) {
                sortByPreference(str, forms);
              }

              if (self.preselect) {
                preselectForm(forms[0], id);
              }

              unsetStyleWithoutAnalyses(forms, id);
            }
          });
        }
      });

      function mapAttributes(attrs) {
        // We could use inject on attrs directly, but this wouldn't give us
        // the correct order of properties inside the newly built object.
        // Let's iterate over the postag schema for to guarantee it.
        // Sorting of objects is a problem we need a solution for in other
        // places as well.
        // This solution comes at a price - if we cannot find a key (not every
        // form has a tense attribute for example), we might stuff lots of undefined
        // stuff into this object. We pass over this with a conditional.
        return arethusaUtil.inject({}, self.postagSchema, function (memo, k) {
          var v = attrs[k];
          if (v) {
            var values = self.attributeValues(k);
            var obj = arethusaUtil.findObj(values, function (el) {
              return el.short === v || el.long === v;
            });
            memo[k] = obj ? obj.short : v;
          }
        });
      }
      function getDataFromInventory(form) {
        if (inventory && form.lexInvLocation) {
          var urn = form.lexInvLocation.urn;
          inventory.getData(urn, form);
        }
      }
      // The BspMorphRetriever at times returns quite a lot of duplicate
      // forms - especially identical forms classified as coming from a
      // different dialect. We don't need this information right now, so
      // we can ignore such forms
      function makeUnique(forms) {
        return aU.unique(forms, function(a, b) {
          return a.lemma === b.lemma && a.postag === b.postag;
        });
      }
      function preselectForm(form, id) {
        // we should only preselect a form
        // if one isn't already selected
        if (form && ! self.hasSelection(self.analyses[id])) {
          state.doSilent(function() {
            self.setState(id, form);
          });
        }
      }
      function sortByPreference(string, forms) {
        return morphLocalStorage.sortByPreference(string, forms);
      }

    };
    /**
     * @ngdoc function
     * @name arethusa.morph.morph#mergeDuplicateForms
     * @methodOf arethusa.morph.morph
     *
     * @description
     * Compares the firstForm supplied with a list of
     * potential duplicate objects. If a duplicate is found
     * it extends the original form with any additional information
     * and removes the duplicate from the passed in list.
     * N.B. the only reason this function is public is so that
     * we can write a unit test for it.
     *
     * @param {Object} the morphology analysis object of original form
     * @param {Array} a list of other potentially duplicate form analyses
     *
     */
    this.mergeDuplicateForms = function(firstForm, otherForms) {
      if (firstForm) {
        var duplicate;
        for (var i = otherForms.length - 1; i >= 0; i--){
          var el = otherForms[i];
          if (isSameForm(firstForm, el)) {
            duplicate = el;
            break;
          }
        }
        if (duplicate) {
          var oldSelectionState = firstForm.selected;
          // we extend the original form with data from the
          // duplicate because morph info from one source, such
          // as the document, might only be a subset of that from
          // another (such as a morph service)
          // we retain the original origin of the first form kept
          var firstFormOrigin = firstForm.origin;
          angular.extend(firstForm, duplicate);
          firstForm.origin = firstFormOrigin;
          firstForm.selected = oldSelectionState;
          otherForms.splice(otherForms.indexOf(duplicate), 1);
        }
      }
    };
    /**
     * @ngdoc function
     * @name arethusa.morph.morph#isSameForm
     * @methodOf arethusa.morph.morph
     *
     * @description
     * Tests if two forms are the same by comparing
     * the lemma and the postag
     *
     */
    function isSameForm(a,b) {
      return a.lemma === b.lemma && a.postag === b.postag;
    }
    function loadToken(val, id) {
      getAnalysisFromState(val, id);
      if (self.canRetrieveFrom('external')) {
        self.getExternalAnalyses(val, id);
      } else {
        // We only need to do this when we don't
        // retrieve externally. If we do, we call
        // this function from within the request's
        // callback.
        unsetStyleWithoutAnalyses(val.forms, id);
      }
      val.analyzed = true;
      self.resetCustomForm(val, id);

      // Gets a from the inital state - if we load an already annotated
      // template, we have to take it inside the morph plugin.
      // In the concrete use case of treebanking this would mean that
      // we have a postag value sitting there, which we have to expand.
      //
      // Once we have all information we need, the plugin also tries to
      // write back style information to the state object, e.g. to colorize
      // tokens according to their Part of Speech value.
      function getAnalysisFromState (val, id) {
        var analysis = state.tokens[id].morphology;
        // We could always have no analysis sitting in the data we are
        // looking at - no data also means that the postag is an empty
        // string or an empty postag.
        //
        // The other case we might encounter here is an object that has
        // only attributes defined, but no postag
        if (analysis) {
          var attrs = analysis.attributes;

          if (postagNotEmpty(analysis.postag)) {
            self.postagToAttributes(analysis);
          } else if (attrs) {
            analysis.postag = self.attributesToPostag(attrs);
          } else {
            return;
          }
          // a good retriever should set the origin of an analysis
          // for those that don't we will mark simply as 'state'
          if (!analysis.origin) {
            analysis.origin = 'state';
          }
          analysis.selected = true;
          setGloss(id, analysis);
          val.forms.push(analysis);

          if (isColorizer()) state.addStyle(id, self.styleOf(analysis));
        }

        function postagNotEmpty(postag) {
          return postag && !postag.match(/^-*$/);
        }
        function setGloss(id, form) {
          if (self.gloss) self.analyses[id].gloss = form.gloss;
        }

      }
    }

    // UPDATE AND QUERY SELECTIONS IN STATE
    // ------------------------------------
    function deselectAll(id) {
      angular.forEach(self.analyses[id].forms, function(form, i) {
        form.selected = false;
      });
    }
    function selectedForm(id) {
      return state.getToken(id).morphology;
    }
    this.hasSelection = function(analysis) {
      var hasSelection;
      for (var i = analysis.forms.length - 1; i >= 0; i--){
        if (analysis.forms[i].selected) {
          hasSelection = true;
          break;
        }
      }
      return hasSelection;
    };
    self.preselectToggled = function() {
      if (self.preselect) applyPreselections();

      function applyPreselections() {
        angular.forEach(self.analyses, applyPreselection);

        function applyPreselection(analysis, id) {
          if (analysis.forms.length > 0) {
            if (!self.hasSelection(analysis)) {
              self.setState(id, analysis.forms[0]);
            }
          }
        }
      }
    };
    this.settings = [
      commons.setting('Expand Selected', 'expandSelection'),
      commons.setting('Store Preferences', 'storePreferences'),
      commons.setting('Preselect', 'preselect', this.preselectToggled),
      commons.setting('Local Storage', 'localStorage')
    ];

    // MORE FORMS AND ANALYSES WHATEVER !!!

    self.resetCustomForm = function(val, id) {
      var string = state.asString(id);
      val.customForm = self.emptyForm(string);
    };

    this.currentAnalyses = function () {
      var analyses = self.analyses;
      return arethusaUtil.inject({}, state.selectedTokens, function (obj, id, val) {
        var token = analyses[id];
        if (token) {
          obj[id] = token;
        }
      });
    };

    // QUERY AND TRANSFORM ATTRIBUTES
    // ------------------------------
    this.selectAttribute = function (attr) {
      return self.attributes[attr] || {};
    };
    this.longAttributeName = function (attr) {
      return self.selectAttribute(attr).long;
    };
    this.attributeValues = function (attr) {
      return self.selectAttribute(attr).values || {};
    };
    this.attributeValueObj = function (attr, val) {
      return self.attributeValues(attr)[val] || {};
    };
    this.longAttributeValue = function (attr, val) {
      return self.attributeValueObj(attr, val).long;
    };
    this.abbrevAttributeValue = function (attr, val) {
      return self.attributeValueObj(attr, val).short;
    };
    this.postagValue = function (attr, val) {
      return self.attributeValueObj(attr, val).postag;
    };
    this.concatenatedAttributes = function (form) {
      var res = [];
      angular.forEach(form.attributes, function (value, key) {
        if(self.abbrevAttributeValue(key, value) !== '---')
          res.push(self.abbrevAttributeValue(key, value));
      });
      return res.join('.');
    };
    this.sortAttributes = function(attrs) {
      return arethusaUtil.inject([], self.postagSchema, function(memo, p) {
        var val = attrs[p];
        if (val) {
          memo.push({
            attr: p,
            val: val
          });
        }
      });
    };
    this.rulesOf = function (attr) {
      return self.selectAttribute(attr).rules;
    };

    // QUERY AND MANAGE STYLE
    // ----------------------
    var colorMap;
    this.colorMap = function() {
      if (!colorMap) colorMap = createColorMap();
      return colorMap;

      function createColorMap() {
        var keys = ['long', 'postag'];
        var maps = [];
        var map = { header: keys, maps: maps };

        angular.forEach(self.attributes, function(value, key) {
          var colors = {};
          var obj = { label: value.long, colors: colors };
          aU.inject(colors, value.values, function(memo, k, v) {
            var key = aU.flatten(aU.map(keys, v)).join(' || ');
            memo[key] = v.style;
          });
          maps.push(obj);
        });

        return map;
      }
    };
    this.applyStyling = function() {
      angular.forEach(state.tokens, function(token, id) {
        var form = token.morphology;
        if (form) {
          state.addStyle(id, self.styleOf(form));
        } else {
          state.unsetStyle(id);
        }
      });
    };
    this.styleOf = function (form) {
      var fullStyle = {};
      angular.forEach(form.attributes, function(value, key) {
        var style = self.attributeValueObj(key, value).style;
        angular.extend(fullStyle, style);
      });
      return fullStyle;
    };
    // When we find no form even after retrieving, we need to unset
    // the token style. This is important when we move from chunk
    // to chunk, as token might still have style from a former chunk.
    // When no analysis is present, this can be very misleading.
    function unsetStyleWithoutAnalyses(forms, id) {
      if (forms.length === 0 && isColorizer()) {
        state.unsetStyle(id);
      }
    }
    function isColorizer() {
      return globalSettings.isColorizer(self.name);
    }

    // LOCAL STORAGE
    // -------------
    this.removeForm = function(id, form) {
      var forms = self.analyses[id].forms;
      var i = forms.indexOf(form);
      self.removeFromLocalStorage(state.asString(id), form);
      forms.splice(i, 1);
    };
    this.addToLocalStorage = function(string, form) {
      if (self.localStorage) {
        morphLocalStorage.addForm(string, form);
      }
    };
    this.removeFromLocalStorage = function(string, form) {
      if (self.localStorage) {
        morphLocalStorage.removeForm(string, form);
      }
    };

    // LOCAL STORAGE - END

    this.updateGloss = function(id, form) {
      if (self.gloss) {
        state.broadcast('tokenChange');
        var gloss = self.analyses[id].gloss || '';
        form = form || selectedForm(id);
        form.gloss = gloss;
      }
    };

    this.setState = function (id, form) {
      self.updateGloss(id,form);
      state.change(id, 'morphology', form, undoFn(id), preExecFn(id, form));

      function undoFn(id) {
        var current = selectedForm(id);
        if (current) {
          return function() { self.setState(id, current); };
        } else
          return function() { self.unsetState(id); };
      }
      function preExecFn(id, form) {
        return function() {
          deleteFromIndex(id);
          addToIndex(form, id);
          deselectAll(id);
          form.selected = true;

          if (isColorizer()) state.addStyle(id, self.styleOf(form));
        };
      }
    };
    this.unsetState = function (id) {
      state.change(id, 'morphology', null, unsetUndo(id), unsetPreExec(id));

      function unsetUndo(id) {
        var current = selectedForm(id);
        return function() {
          self.setState(id, current);
        };
      }
      function unsetPreExec(id) {
        return function() {
          deleteFromIndex(id);
          deselectAll(id);
          selectedForm(id).selected = false;

          if (isColorizer()) state.unsetStyle(id);
        };
      }
    };

    // USE AND UPDATE INVERSE INDEX ON ATTRIBUTES
    // ---------------------------
    this.queryForm = function() {
      var keywords = self.formQuery.split(' ');
      // The private fns return an object and not an array, even if we only
      // need ids - but we avoid duplicate keys that way.
      var ids = self.matchAll ? findThroughAll(keywords) : findThroughOr(keywords);
      state.multiSelect(Object.keys(ids));

      function findThroughOr(keywords) {
        return arethusaUtil.inject({}, keywords, function(memo, keyword) {
          var hits = searchIndex[keyword] || [];
          angular.forEach(hits, function(id, i) {
            memo[id] = true;
          });
        });
      }
      function findThroughAll(keywords) {
        // we need to fill a first array which we can check against first
        var firstKw = keywords.shift();
        var hits = searchIndex[firstKw] || [];
        angular.forEach(keywords, function(keyword, i) {
          var moreHits = searchIndex[keyword] || [];
          hits = arethusaUtil.intersect(hits, moreHits);
        });
        // and know return something with unique values
        return arethusaUtil.inject({}, hits, function(memo, id) {
          memo[id] = true;
        });
      }
    };
    function addToIndex(form, id) {
      var attrs = form.attributes || {};
      angular.forEach(attrs, function(val, key) {
        if (!searchIndex[val]) {
          searchIndex[val] = [];
        }
        searchIndex[val].push(id);
      });
    }
    function deleteFromIndex(id) {
      var form = state.getToken(id).morphology || {};
      var attrs = form.attributes || {};
      angular.forEach(attrs, function(value, key) {
        // the index might contain duplicate ids
        var ids = searchIndex[value];
        if (ids) {
          var i = ids.indexOf(id);
          while (i !== -1) {
            ids.splice(i, 1);
            i = ids.indexOf(id);
          }
        }
      });
    }

    // REGISTER KEYS FOR SELECTION
    // ---------------------------
    this.activeKeys = {};
    var keys = keyCapture.initCaptures(function(kC) {
      return {
        morph: [
          kC.create('selectNextForm', function() { kC.doRepeated(selectNext); }, '↓'),
          kC.create('selectPrevForm', function() { kC.doRepeated(selectPrev); }, '↑')
        ]
      };

      function guardSelection(fn) {
        if (plugins.isSelected(self)) {
          var selectionCount = state.hasClickSelections();
          if (selectionCount === 1) fn();
        }
      }
      function selectSurroundingForm(dir) {
        var id = Object.keys(state.clickedTokens)[0];
        var forms = self.analyses[id].forms;
        var currentIndex = forms.indexOf(selectedForm(id));

        var index;
        if (dir) {
          index = (currentIndex === forms.length - 1) ? 0 : currentIndex + 1;
        } else {
          index = (currentIndex === 0) ? forms.length - 1 : currentIndex - 1;
        }
        self.setState(id, forms[index]);
      }
      function selectNext() {
        guardSelection(function() {
          selectSurroundingForm(true);
        });
      }
      function selectPrev() {
        guardSelection(function() {
          selectSurroundingForm();
        });
      }
    });
    angular.extend(self.activeKeys, keys.selections);

    // REGISTER EVENT LISTENERS WITH OTHER CORE SERVICES
    // -------------------------------------------------
    var shouldSavePreference;
    function afterSave() {
      shouldSavePreference = true;
    }
    function savePreferences() {
      if (shouldSavePreference && self.storePreferences) {
        angular.forEach(state.tokens, savePreference);
        shouldSavePreference = false;
      }

      function savePreference(token) {
        if (token.morphology && token.morphology.postag) {
          morphLocalStorage.addPreference(token.string, token.morphology);
        }
      }
    }
    saver.onSuccess(afterSave);
    navigator.onMove(savePreferences);
    exitHandler.onLeave(savePreferences);
    state.on('tokenAdded', function(event, token) {
      var id = token.id;
      var forms = new Forms(token.string);
      self.analyses[id] = forms;
      token.morphology = {};
      loadToken(forms, id);
    });
    state.on('tokenRemoved', function(event, token) {
      var id = token.id;
      deleteFromIndex(id);
      delete self.analyses[id];
    });

    // CONFIGURE AND INIT
    // ------------------
    function configure() {
      var props = [
        'postagSchema',
        'attributes',
        'mappings',
        'noRetrieval',
        'gloss',
        'localStorage',
        'storePreferences'
      ];

      configurator.getConfAndDelegate(self, props);
      configurator.getStickyConf(self, ['preselect', 'matchAll']);

      self.analyses = {};
      morphRetrievers = configurator.getRetrievers(self.conf.retrievers);
      propagateMappings(morphRetrievers);

      if (self.localStorage) {
        morphRetrievers.localStorage = morphLocalStorage.retriever;
        morphLocalStorage.comparator = isSameForm;
      }

      // This is useful for the creation of new forms. Usually we want to
      // validate if all attributes are set properly - the inclusion of
      // special empty attributes allows to say specifically that something
      // should be left unannotated/unknown. Useful for elliptic nodes etc.
      addSpecialEmptyAttributes();

      if (self.conf.lexicalInventory) {
        inventory = configurator.getRetriever(self.conf.lexicalInventory.retriever);
      }

      colorMap = undefined;
      searchIndex = {};

      function addSpecialEmptyAttributes() {
        angular.forEach(self.attributes, addSpecialEmptyAttribute);

        function addSpecialEmptyAttribute(attrObj, name) {
          attrObj.values['---'] = emptyAttribute;
        }
      }
      function propagateMappings(retrievers) {
        angular.forEach(retrievers, propagateMapping);
        function propagateMapping(retriever, name) {
          retriever.mapping = mappingFor(name);
          function mappingFor(name) {
            // this exists so that mapping instances can refer to each
            // other through providing a string instead of an mappings
            // object.
            var mappings = self.mappings[name];
            while (angular.isString(mappings)) {
              mappings = self.mappings[name];
            }
            return mappings || {};
          }
        }
      }
    }

    this.init = function () {
      // When a user is moving fast between chunks, a lot of outstanding
      // requests can build up in the retrievers. As they are all asynchronous
      // their callbacks fire when we have already moved away from the chunk which
      // started the calls.
      // This can lead to quite a bit of confusion and is generally not a very
      // good solution.
      // We therefore use the new abort() API of Resource to cancel all requests
      // we don't need anymore. All morph retrievers need to provide an abort()
      // function now (usually just a delegator to Resource.abort).
      //
      // On init, we check if morphRetrievers were already defined and if they
      // are we abort all outstanding requests.
      function abortOutstandingRequests() {
        function abortRetriever(retriever) {
          var fn = retriever.abort;
          if (angular.isFunction(fn)) fn();
        }

        if (morphRetrievers) {
          angular.forEach(morphRetrievers, abortRetriever);
        }
      }
      abortOutstandingRequests();
      configure();
      function createEmptyPostag() {
        return arethusaUtil.map(self.postagSchema, function (el) {
          return '-';
        }).join('');
      }
      self.emptyPostag = createEmptyPostag();
      self.analyses = seedAnalyses();
      loadInitalAnalyses();
      loadSearchIndex();
      plugins.declareReady(self);

      function seedAnalyses() {
        return arethusaUtil.inject({}, state.tokens, function (obj, id, token) {
          obj[id] = new Forms(token.string);
        });
      }
      function loadInitalAnalyses() {
        if (self.canRetrieveFrom('document')) {
          angular.forEach(self.analyses, loadToken);
        }
      }
      function loadSearchIndex() {
        angular.forEach(state.tokens, function(token, id) {
          var form = token.morphology || {};
          addToIndex(form, id);
        });
      }
    };
  }
]);

"use strict";

/**
 * @ngdoc service
 * @name arethusa.morph.morph_local_storage
 *
 * @description
 * Manages local storage of a user's morphological forms
 * and preferences 
 *
 *
 * @requires arethusa.core.local_storage
 * @requires arethusa.core.plugins
 * @requires lodash.underscore
 */

angular.module('arethusa.morph').service('morphLocalStorage', [
  'plugins',
  'arethusaLocalStorage',
  '_',
  function(plugins, arethusaLocalStorage, _) {
    var MAX_PREFS_VERSION = '1';
    var MIN_PREFS_VERSION = '1';
    var CURRENT_PREFS_VERSION = '1';
    var VERSION_DELIMITER = '$$';
    var PREFERENCE_DELIMITER = ';;';
    var PREFERENCE_COUNT_DELIMITER = '@@';
    var LEMMA_POSTAG_DELIMITER = '|-|';
    var self = this;

    this.localStorageKey = 'morph.forms';
    this.preferenceKey = 'morph.prefs';

    this.delimiters = {
      preference: PREFERENCE_DELIMITER,
      count: PREFERENCE_COUNT_DELIMITER,
      lemmaToPostag: LEMMA_POSTAG_DELIMITER,
      version: VERSION_DELIMITER
    };

    /**
     * @ngdoc property
     * @name arethusa.morph.morph_local_storage.retriever
     * @methodOf arethusa.morph.morph_local_storage
     *
     * @description
     * Encaspulated Arethusa Retriever Implementation
     *
     */
    this.retriever = {
      getData: getData,
      abort: function() {}
    };

    this.addForm = addForm;
    this.addForms = addForms;
    this.removeForm = removeForm;

    this.addPreference = addPreference;
    this.addPreferences = addPreferences;
    this.sortByPreference = sortByPreference;

    this.getForms = getForms;
    this.getPreferences = getPreferences;
    this.readPreference = readPreference;

    // formats a key for local storage of forms
    function key(k) {
      return self.localStorageKey + '.' + k;
    }

    // formats a key for local storage of preferences
    function preferenceKey(k) {
      return self.preferenceKey + '.' + k;
    }


    // required method of an Arethusa retriever
    // executes callback after retrieving the data
    // requested by the string
    // only used to retrieve form data not preference
    // data
    function getData(string, callback) {
      var forms = retrieve(string);
      callback(forms);
    }

    // retrieve form data from local storage
    function retrieve(string) {
      return arethusaLocalStorage.get(key(string)) || [];
    }

    // retrieve preference data from local storage
    function retrievePreference(string) {
      return arethusaLocalStorage.get(preferenceKey(string)) || '';
    }

    // persist form data to local storage
    function persist(string, value) {
      arethusaLocalStorage.set(key(string), value);
    }

    // persist form preference data to local storage
    function persistPreference(string, value) {
      var versionedValue = CURRENT_PREFS_VERSION + VERSION_DELIMITER + value;
      return arethusaLocalStorage.set(preferenceKey(string), versionedValue);

    }

    /**
     * @ngdoc function
     * @name arethusa.morph.morph_local_storage.addForm
     * @methodOf arethusa.morph.morph_local_storage
     *
     * @description
     * Adds a new morphological form to local storage
     *
     * @param {String} string the form as a string
     * @param {Object} form the morphological form properties 
     *
     * @returns {int} the number of forms added (1 or 0)
     */
    function addForm(string, form) {
      // Check if we already stored info about this word,
      // if not add a need array to the store
      var forms = retrieve(string) || [];

      // Store a copy and set the selected property to false!
      if (isValidForm(form)) {
        var newForm = angular.copy(form);
        newForm.selected = false;
        forms.push(newForm);
        persist(string, forms);
        return 1;
      } else {
        return 0;
      }
    }

    /**
     * @ngdoc function
     * @name arethusa.morph.morph_local_storage.addForms
     * @methodOf arethusa.morph.morph_local_storage
     *
     * @description
     * Adds a set of morphological forms to local storage
     *
     * @param {String} string the form as a string
     * @param {Array} forms a list of objects containing
     *                the morphological form properties 
     *
     * @returns {int} the number of forms added
     */
    function addForms(string, newForms) {
      var forms = retrieve(string) || [];
      var added = 0;
      var keys = _.map(forms, formToKey);
      _.forEach(newForms, function(form) {
        if (isValidForm(form) && !_.contains(keys, formToKey(form))) {
          forms.push(form);
          added++;
        }
      });
      persist(string, forms);
      return added;
    }

    /**
     * @ngdoc function
     * @name arethusa.morph.morph_local_storage.removeForm
     * @methodOf arethusa.morph.morph_local_storage
     *
     * @description
     * Removes a form from local storage
     *
     * @param {String} string the form as a string
     * @param {Object} form morphological properties
     *                 to remove
     *
     */
    function removeForm(string, form) {
      var forms = retrieve(string);
      if (forms) {
        // find element and remove it, when it's present
        var stored = aU.find(forms, function (otherForm) {
          // @balmas this is a little weird -- the comparator
          // is set in arethusa.morph.configure - not sure
          // if this was intentional to make it possible for
          // the calling code to be able to use its own comparator
          // or if it was because we don't have a formal 
          // class to hold a form and its functions
          return self.comparator(form, otherForm);
        });
        if (stored) {
          forms.splice(forms.indexOf(stored), 1);
        }
        persist(string, forms);
      }
    }

    /**
     * @ngdoc function
     * @name arethusa.morph.morph_local_storage.addPreference
     * @methodOf arethusa.morph.morph_local_storage
     *
     * @description
     * Adds a user's selection of a given form to the
     * history of their selections of that form, or if it
     * is already there, increments the frequency count
     *
     * @param {String} string the form as a string
     * @param {Object} form the selected morphological properties
     * @param {int} additor Optional - an amount to increment by 
     *             (if more than the default count of 1)
     *
     * @return {int} the number of preferences added
     */
    function addPreference(string, form, additor) {
      additor = parseInt(additor) || 1;
      if (isValidForm(form)) {
        var key = formToKey(form);
        var counts = preferencesToCounts(string);
        var counter = counts[key];
        var newCount = counter ? counter + additor : additor;
        counts[key] = newCount;
        var sortedCounts = toSortedArray(counts);
        var toStore = _.map(sortedCounts, function(countArr) {
          return countArr[0] + PREFERENCE_COUNT_DELIMITER + countArr[1];
        }).join(PREFERENCE_DELIMITER);
        persistPreference(string, toStore);
        return 1;
      } else {
        return 0;
      }
    }

    /**
     * @ngdoc function
     * @name arethusa.morph.morph_local_storage.addPreferences
     * @methodOf arethusa.morph.morph_local_storage
     *
     * @description
     * Adds a precomposed set of frequency data for a form
     * to local storage. Currently used when importing data
     * from an external source (such as a downloaded backup).
     *
     * @param {String} string the form as a string
     * @param {String} frequencies the frequency data formatted per requirements
     *                  
     */
    function addPreferences(string, frequencies) {
      var data = readPreference(frequencies);
      _.forEach(data, function(datum) {
        addPreference(string, datum.form, datum.count);
      });
      return data.length;
    }

    // Sorts frequency data for a form by the counts (most counts first)
    // takes as input an object which maps the morphology properties (string form)
    // to the frequency count (as produced by preferencesToCounts)
    function toSortedArray(counts) {
      return _.map(counts, function(v, k) {
        return [k, v];
      }).sort(function(a, b) {
        return a[1] < b[1];
      });
    }

    // maps morphology properties (string form) to the frequency count
    function preferencesToCounts(string) {
      var prefs = readPreference(retrievePreference(string));
      return _.inject(_.filter(prefs), function(memo, pref) {
        memo[formToKey(pref.form)] = parseInt(pref.count);
        return memo;
      }, {});
    }

    /**
     * @ngdoc function
     * @name arethusa.morph.morph_local_storage.sortByPreference
     * @methodOf arethusa.morph.morph_local_storage
     *
     * @description
     * Returns user's prior selections of the supplied forms
     * sorted according to the frequency with which those 
     * forms were previously selected by the user
     *
     * @param {String} string the form as a string
     * @param {Array} forms a list of forms to check for the supplied
     *                string
     *
     * @return {Array} the supplied forms resorted by frequency
     */
    function sortByPreference(string, forms) {
      var counts = preferencesToCounts(string);
      var selectors = _.inject(forms, function(memo, form) {
        memo[formToKey(form)] = form;
        return memo;
      }, {});

      _.forEachRight(toSortedArray(counts), function(counter) {
        var form = selectors[counter[0]];
        if (form) {
          var i = forms.splice(forms.indexOf(form), 1);
          forms.unshift(form);
        }
      });
      return forms;
    }

    // forms morphological properties as a string for storage
    // in the format <lemma>|-|<postag>
    function formToKey(form) {
      return form.lemma + LEMMA_POSTAG_DELIMITER + form.postag;
    }

    /**
     * @ngdoc function
     * @name arethusa.morph.morph_local_storage.getForms
     * @methodOf arethusa.morph.morph_local_storage
     *
     * @description
     * Retrieves user-created forms from local storage
     *
     * @return {Object} the user-created forms
     */
    function getForms() {
      return collectFromStore(self.localStorageKey);
    }

    /**
     * @ngdoc function
     * @name arethusa.morph.morph_local_storage.gepreferences
     * @methodOf arethusa.morph.morph_local_storage
     *
     * @description
     * Retrieves user's form frequency selections from
     * local storage
     *
     * @return {Object} the user form frequency data
     */
    function getPreferences() {
      return collectFromStore(self.preferenceKey);
    }

    // retrieves morphological  data from local
    // storage - looks for all data which starts with the preference
    // key (morph.prefs. or morph.forms.) and returns them in an object 
    // mapping the form string to data (preferences or forms)
    function collectFromStore(keyFragment) {
      return _.inject(arethusaLocalStorage.keys(), function(memo, key) {
        var match = key.match('^' + keyFragment + '.(.*)');
        if (match) {
          memo[match[1]] = arethusaLocalStorage.get(key);
        }
        return memo;
      }, {});
    }

    // checks to see if the preference version is supported
    function prefVersionIsSupported(ver) {
      return ver >= MIN_PREFS_VERSION && ver <= MAX_PREFS_VERSION;
    }

    // reads a preference string and converts it into its internal
    // representation - will ignore invalid strings or those with
    // an unsupported version 
    function readPreference(prefString) {
      var prefs,version;
      var validPrefs = [];
      var parts = prefString.split(VERSION_DELIMITER);
      if (parts.length == 2) {
          version = parts[0];
          prefs = parts[1].split(PREFERENCE_DELIMITER);
      }
      if (prefVersionIsSupported(version)) {
        for (var i=0; i<prefs.length; i++) {
          var formAndCount = prefs[i].split(PREFERENCE_COUNT_DELIMITER);
          if (formAndCount.length == 2) {
            var count = parseInt(formAndCount[1]);
            var lemmaAndPostag = formAndCount[0].split(LEMMA_POSTAG_DELIMITER);
            if (lemmaAndPostag.length == 2) {
              var lemma = lemmaAndPostag[0];
              var postag  = lemmaAndPostag[1];
              validPrefs.push({ 'form' : { 'lemma': lemma, 'postag': postag }, 'count' :count });
            }
          }
        }
      }
      return validPrefs;    
    }

    // checks to see that the supplied object is a valid, preservable morph form
    function isValidForm(form) {
      return form.lemma && form.postag && typeof form.lemma === 'string' && typeof form.postag === 'string';
    }
  }
]);

angular.module('arethusa.morph').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('js/arethusa.morph/templates/context_menu.html',
    "<div>{{ plugin.concatenatedAttributes(token.morphology) }}</div>\n"
  );


  $templateCache.put('js/arethusa.morph/templates/morph_form_attributes.html',
    "<div class=\"small-12 columns note\">\n" +
    "  <alert\n" +
    "    class=\"error radius center fade-in\"\n" +
    "    ng-if=\"confirmationRequested\">\n" +
    "    Do you really want to remove this form?\n" +
    "    <div class=\"small-1 columns\">\n" +
    "      <i ng-click=\"removeForm()\" class=\"clickable fi-check\"></i>\n" +
    "    </div>\n" +
    "    <div class=\"small-1 columns\">\n" +
    "      <i ng-click=\"skipRemoval()\" class=\"clickable fi-x\"></i>\n" +
    "    </div>\n" +
    "  </alert>\n" +
    "\n" +
    "  <div class=\"right\">\n" +
    "    <a\n" +
    "      mirror-morph-form=\"form\"\n" +
    "      reveal-toggle=\"mfc{{ tokenId }}\"\n" +
    "      always-reveal=\"true\"\n" +
    "      token-id=\"tokenId\">\n" +
    "      Create new\n" +
    "    </a>\n" +
    "    <span>&nbsp;-&nbsp;</span>\n" +
    "    <a\n" +
    "      ng-click=\"askForRemoval()\">\n" +
    "      Remove Form\n" +
    "    </a>\n" +
    "  </div>\n" +
    "</div>\n" +
    "<div class=\"small-12 columns text\" ng-repeat=\"o in attrs\">\n" +
    "  <span class=\"small-5 columns note\">\n" +
    "    <span class=\"right\">{{ m.longAttributeName(o.attr) }}</span>\n" +
    "  </span>\n" +
    "  <span class=\"small-7 columns\"> {{ m.longAttributeValue(o.attr, o.val) }}</span>\n" +
    "</div>\n" +
    "\n" +
    "\n" +
    "<div ng-if=\"inv\" class=\"small-12 columns\">\n" +
    "  <hr>\n" +
    "  <div>\n" +
    "    <p>\n" +
    "      <span class=\"small-8 columns\"><em>Lexical Inventory</em></span>\n" +
    "      <span class=\"small-4 columns note\">\n" +
    "        <a href=\"{{ inv.uri }}\" target=\"_blank\">{{ inv.urn }}</a>\n" +
    "      </span>\n" +
    "    </p>\n" +
    "  </div>\n" +
    "  <br>\n" +
    "  <div class=\"small-12 columns\" style=\"margin-top: 1em\">\n" +
    "    <ul class=\"text\">\n" +
    "      <li>Dictionary Entries\n" +
    "        <ul class=\"text\">\n" +
    "          <li ng-repeat=\"(name, link) in inv.dictionaries\">\n" +
    "            <a href=\"{{ link }}\" target=\"_blank\">{{ name }}</a>\n" +
    "          </li>\n" +
    "        </ul>\n" +
    "      </li>\n" +
    "    </ul>\n" +
    "  </div>\n" +
    "</div>\n"
  );


  $templateCache.put('js/arethusa.morph/templates/search.html',
    "<div class=\"row\">\n" +
    "<div class=\"small-12 columns\">\n" +
    "  <label>\n" +
    "    <span translate=\"morph.searchByForm\"/>\n" +
    "    <div class=\"row collapse\">\n" +
    "    <div class=\"small-10 columns\">\n" +
    "      <input type=\"search\"\n" +
    "        ng-change=\"plugin.queryForm()\"\n" +
    "        ng-model=\"plugin.formQuery\" />\n" +
    "    </div>\n" +
    "    <div class=\"small-2 columns\">\n" +
    "    <label class=\"postfix\">\n" +
    "      <span translate=\"morph.matchAll\"/>\n" +
    "      <input\n" +
    "        type=\"checkbox\"\n" +
    "        ng-change=\"plugin.queryForm()\"\n" +
    "        ng-model=\"plugin.matchAll\"/>\n" +
    "    </label>\n" +
    "    </div>\n" +
    "    </div>\n" +
    "  </label>\n" +
    "</div>\n" +
    "</div>\n" +
    "\n"
  );

}]);
