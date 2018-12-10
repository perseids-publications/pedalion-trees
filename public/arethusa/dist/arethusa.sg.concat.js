"use strict";

angular.module('arethusa.sg', []);

"use strict";

angular.module('arethusa.sg').directive('sgAncestors', [
  'sg',
  function(sg) {
    return {
      restrict: 'A',
      scope: {
        obj: '=sgAncestors'
      },
      link: function(scope, element, attrs) {
        scope.requestGrammar = function(el) {
          if (el.sections) {
            if (sg.readerRequested === el) {
              sg.readerRequested = false;
            } else {
              sg.readerRequested = el;
            }
          }
        };

        scope.requested = function(obj) {
          return sg.readerRequested.short === obj.short;
        };

        function updateHierarchy(ancestors) {
          scope.hierarchy = scope.obj.definingAttrs.concat(scope.obj.ancestors);
        }

        scope.$watch('obj.hasChanged', function(newVal, oldVal) {
          if (newVal) {
            updateHierarchy();
            scope.obj.hasChanged = false;
          }
        });

        scope.$watchCollection('obj.ancestors', function(newVal, oldVal) {
          updateHierarchy();
        });
      },
      templateUrl: 'js/arethusa.sg/templates/ancestors.html'
    };
  }
]);

"use strict";

angular.module('arethusa.sg').directive('sgContextMenuSelector', [
  'sg',
  function(sg) {
    return {
      restrict: 'A',
      scope: {
        obj: '='
      },
      link: function(scope, element, attrs) {
        scope.sg = sg;

        function ancestorChain(chain) {
          return arethusaUtil.map(chain, function(el) {
            return el.short;
          }).join(' > ');
        }

        scope.$watchCollection('obj.ancestors', function(newVal, oldVal) {
          scope.heading = (newVal.length === 0) ?
            'Select Smyth Categories' :
            ancestorChain(newVal);
        });
      },
      templateUrl: 'js/arethusa.sg/templates/sg_context_menu_selector.html'
    };
  }
]);

"use strict";

angular.module('arethusa.sg').directive('sgGrammarReader', [
  'sg',
  'state',
  function(sg, state) {
    return {
      restrict: 'A',
      link: function(scope, element, attrs) {
        function reader() {
          return angular.element(document.getElementById('sg-g-r'));
        }

        function clearReader() {
          reader().empty();
        }

        function addGrammar(el) {
          var r = reader();
          sg.requestGrammar(el.sections, function(sections) {
            r.append(sections);
          });
        }

        scope.s = state;
        scope.sg = sg;
        scope.isVisible = function() {
          return sg.readerRequested && state.hasSelections();
        };

        scope.$watch('sg.readerRequested', function(newVal, oldVal) {
          if (newVal) {
            clearReader();
            addGrammar(newVal);
          }
        });
      },
      templateUrl: 'js/arethusa.sg/templates/sg_grammar_reader.html'
    };
  }
]);

"use strict";

angular.module('arethusa.sg').factory('Range', function() {
  return function(a, b) {
    var self = this;

    // for new Range('1-5')
    try {
      if (a.match(/-/)) {
        a = a.split('-');
      }
    } catch(err) {}

    // for new Range([1, 5])
    if (arethusaUtil.isArray(a)) {
      this.start = a[0];
      this.end   = a[1] || a[0];
    // for new Range(1, 5)
    } else {
      this.start = a;
      this.end   = b || this.start;
    }

    this.start = parseInt(this.start);
    this.end   = parseInt(this.end);
    this.length = this.end - this.start + 1;

    if (this.end < this.start) {
      throw new RangeError('End (' + b + ') is less than start (' + a + ')');
    }

    this.includes = function(integer) {
      return integer >= self.start && integer <= self.end;
    };

    this.includesOtherRange = function(range) {
      return self.includes(range.start) && self.includes(range.end);
    };

    this.sharesElements = function(range) {
      var a = self;
      var b = range;
      return a.includes(b.start) || b.includes(a.start) ||
             a.includes(b.end)   || b.includes(a.end);
    };

    this.take = function(count, startingIndex) {
      if (startingIndex) {
        count = startingIndex + count;
      } else {
        startingIndex = 0;
      }
      var boundary = count > self.length ? self.length : count;
      var res = [];
      for (var i = startingIndex; i < boundary; i++){
        res.push(self.start + i);
      }
      return res;
    };

    this.toString = function() {
      return self.start + '-' + self.end;
    };

    this.toArray = function() {
      var res = [];
      for (var i = self.start; i <= self.end; i++) { res.push(i); }
      return res;
    };
  };
});

"use strict";

angular.module('arethusa.sg').factory('SgGrammarRetriever', [
  'configurator',
  'Range',
  function(configurator, Range) {
    var fileIndex = {
      "body.1_div1.1_div2.1"  : new Range(1, 45),
      "body.1_div1.1_div2.2"  : new Range(46, 76),
      "body.1_div1.1_div2.3"  : new Range(77, 132),
      "body.1_div1.1_div2.4"  : new Range(133),
      "body.1_div1.1_div2.5"  : new Range(134, 137),
      "body.1_div1.1_div2.6"  : new Range(138, 148),
      "body.1_div1.1_div2.7"  : new Range(149, 187),
      "body.1_div1.1_div2.8"  : new Range(188),
      "body.1_div1.2_div2.1"  : new Range(189, 193),
      "body.1_div1.2_div2.2"  : new Range(194, 204),
      "body.1_div1.2_div2.3"  : new Range(205, 210),
      "body.1_div1.2_div2.4"  : new Range(211, 312),
      "body.1_div1.2_div2.5"  : new Range(313, 324),
      "body.1_div1.2_div2.6"  : new Range(325, 340),
      "body.1_div1.2_div2.7"  : new Range(341, 346),
      "body.1_div1.2_div2.8"  : new Range(347, 354),
      "body.1_div1.2_div2.9"  : new Range(355, 495),
      "body.1_div1.2_div2.10" : new Range(496, 821),
      "body.1_div1.3_div2.17" : new Range(838, 856),
      "body.1_div1.3_div2.18" : new Range(857, 858),
      "body.1_div1.3_div2.19" : new Range(859, 865),
      "body.1_div1.3_div2.20" : new Range(866, 868),
      "body.1_div1.3_div2.21" : new Range(869, 899),
      "body.1_div1.4_div2.1"  : new Range(900, 905),
      "body.1_div1.4_div2.2"  : new Range(906, 920),
      "body.1_div1.4_div2.3"  : new Range(921),
      "body.1_div1.4_div2.4"  : new Range(922, 924),
      "body.1_div1.4_div2.5"  : new Range(925, 926),
      "body.1_div1.4_div2.6"  : new Range(927, 928),
      "body.1_div1.4_div2.7"  : new Range(929, 937),
      "body.1_div1.4_div2.8"  : new Range(938, 943),
      "body.1_div1.4_div2.9"  : new Range(944, 948),
      "body.1_div1.4_div2.10" : new Range(949, 995),
      "body.1_div1.4_div2.11" : new Range(996, 1012),
      "body.1_div1.4_div2.12" : new Range(1013, 1015),
      "body.1_div1.4_div2.13" : new Range(1016, 1017),
      "body.1_div1.4_div2.14" : new Range(1018, 1093),
      "body.1_div1.4_div2.15" : new Range(1094, 1098),
      "body.1_div1.4_div2.16" : new Range(1099, 1189),
      "body.1_div1.4_div2.17" : new Range(1190, 1278),
      "body.1_div1.4_div2.18" : new Range(1279, 1635),
      "body.1_div1.4_div2.19" : new Range(1636, 1702),
      "body.1_div1.4_div2.20" : new Range(1703, 1965),
      "body.1_div1.4_div2.21" : new Range(1966, 2038),
      "body.1_div1.4_div2.22" : new Range(2039, 2148),
      "body.1_div1.4_div2.23" : new Range(2149, 2152),
      "body.1_div1.4_div2.24" : new Range(2153, 2158),
      "body.1_div1.4_div2.25" : new Range(2159, 2161),
      "body.1_div1.4_div2.26" : new Range(2162, 2172),
      "body.1_div1.4_div2.27" : new Range(2173, 2188),
      "body.1_div1.4_div2.28" : new Range(2189, 2190),
      "body.1_div1.4_div2.29" : new Range(2191, 2487),
      "body.1_div1.4_div2.30" : new Range(2488, 2573),
      "body.1_div1.4_div2.31" : new Range(2574, 2635),
      "body.1_div1.4_div2.32" : new Range(2636, 2662),
      "body.1_div1.4_div2.33" : new Range(2663, 2680),
      "body.1_div1.4_div2.34" : new Range(2681, 2687),
      "body.1_div1.4_div2.35" : new Range(2688, 2768),
      "body.1_div1.4_div2.36" : new Range(2769, 3003),
      "body.1_div1.4_div2.37" : new Range(3004, 3048)
    };

    function parseSections(sections) {
      var intervals = sections.split(';');
      return arethusaUtil.map(intervals, function(interval) {
        return new Range(interval.split('-'));
      });
    }

    function time(x) {
      var t = new Date();
      return t.getMinutes() + ':' + t.getSeconds() + ' - ' + x;
    }

    function filesToUse(ranges) {
      return arethusaUtil.inject({}, ranges, function(memo, range) {
        var files = arethusaUtil.inject([], fileIndex, function(memo, file, r) {
          if (range.sharesElements(r)) {
            memo.push(file);
          }
        });
        if (files.length) {
          memo[range.toString()] = files;
        }
      });
    }

    function selectAndCallback(doc, range, callback) {
      var selections = arethusaUtil.inject([], range.take(5), function(memo, idNum) {
        var id = "#s" + idNum;
        var el = angular.element(id, angular.element(doc));
        memo.push(el.prev(':header'));
        memo.push(el);
      });
      callback(selections);
    }

    return function(conf) {
      var docs = {};
      var self = this;
      var resource = configurator.provideResource(conf.resource);

      function getFile(name) {
        return resource.get({ doc: name });
      }

      this.getData = function(sections, callback) {
        var ranges = parseSections(sections);
        var rangesAndFiles = filesToUse(ranges);
        angular.forEach(rangesAndFiles, function(files, rangeString) {
          var range = new Range(rangeString);
          angular.forEach(files, function(file, i) {
            var doc = docs[file];
            if (doc) {
              selectAndCallback(doc, range, callback);
            } else {
              getFile(file).then(function(res) {
                doc = res.data;
                docs[file] = doc;
                selectAndCallback(doc, range, callback);
              });
            }
          });
        });
      };
    };
  }
]);

"use strict";

angular.module('arethusa.sg').service('sg', [
  'state',
  'configurator',
  '$cacheFactory',
  'plugins',
  'notifier',
  function(state, configurator, $cacheFactory, plugins, notifier) {
    var self = this;
    this.name = 'sg';

    var retriever;
    this.labelAs = "long";
    this.defineAncestors = true;

    var sgCache = $cacheFactory('sg', { number:  100 });

    this.defaultConf = {
      displayName: "SG"
    };

    function configure() {
      configurator.getConfAndDelegate(self, ['labels']);
      retriever = configurator.getRetriever(self.conf.retriever);
    }

    function SgTemplate() {
      var self = this;

      this.morph = {};
      this.ancestors = [];
      this.definingAttrs = [];
      this.menu = {};
      this.hasChanged = true;
      this.isSgTemplate = true;
      this.markChange = function() {
        self.hasChanged = true;
      };
    }

    function grammarReset(grammar) {
      arethusaUtil.empty(grammar.ancestors);
      // We have to redefine this property - it's untouchable now
      // that it's cached!
      grammar.definingAttrs = [];
    }

    function sgFromStateComplete(sg) {
      return sg && sg.isSgTemplate;
    }

    function sgFromRetriever(sg) {
      return sg && sg.ancestors && !sg.isTemplate;
    }

    function createNewSgObject(token) {
      var grammar = new SgTemplate();
      var morph = token.morphology || {};
      grammar.string = token.string;
      checkAndUpdateGrammar(morph, grammar);
      return grammar;
    }

    function createInternalState() {
      // 3 possibilites here:
      //
      // 1 When we have seen this token set before, we don't need to do anything
      //   and can take the info we already created earlier in time.
      // 2 We have not seen the tokens, but they have info from the retrieved
      //   document. In such a case we build a new SgTemplate and add the sg
      //   ancestors from the token to it.
      // 3 We have to start from scratch.
      return arethusaUtil.inject({}, state.tokens, function(memo, id, token) {
        var grammar;
        var fromState = token.sg;
        if (sgFromStateComplete(fromState)) {
          grammar = fromState;
        } else {
          grammar = createNewSgObject(token);
          if (sgFromRetriever(fromState)) {
            addAncestorsFromState(fromState, grammar);
          }
        }
        memo[id] = grammar;
      });
    }

    function sgParseError(str, ancs, anc) {
      var ancsString = ancs.join(' ');
      return "Failed to parse SG annotation (in " + ancsString+ " at " + anc + " for " + str + ")";
    }

    var sgIncompatibilityWarning = "You might be using an incompatible version of the SG tagset";

    function addAncestorsFromState(sg, grammar) {
      var ancestors = sg.ancestors;
      var menu = grammar.menu;
      angular.forEach(ancestors, function(ancestor, i) {
        if (menu) {
          // The || menu.nested party is very hacky, but effective.
          // It can appear in menus that show a morph preselection -
          // I guess... Check a word with a dative proper e.g.
          var expandedAncestor = menu[ancestor] || menu.nested;
          if (!expandedAncestor) {
            notifier.error(sgParseError(grammar.string, ancestors, ancestor));
            notifier.warning(sgIncompatibilityWarning);
            menu = undefined;
            return;
          }
          grammar.ancestors.push(expandedAncestor);
          menu = expandedAncestor.nested;
        }
      });
    }

    var hint = "Please select a morphological form first!";

    this.currentGrammar = function() {
      return arethusaUtil.inject({}, state.selectedTokens, function(memo, id, event) {
        var morph = state.tokens[id].morphology;
        var grammar = self.grammar[id];
        if (grammar) {
          if (morph && morph.attributes) {
            delete grammar.hint;
            checkAndUpdateGrammar(morph, grammar);
          } else {
            grammarReset(grammar);
            grammar.morph = {};
            grammar.hint = hint;
          }
          memo[id] = grammar;
        }
      });
    };

    function morphHasChanged(a, b) {
      return !angular.equals(a, b);
    }

    function checkAndUpdateGrammar(morph, grammar) {
      if (morphHasChanged(grammar.morph, morph.attributes)) {
        // Need to empty first, otherwise we might mix attributes
        // of various part of speech types together!
        arethusaUtil.empty(grammar.morph);
        angular.extend(grammar.morph, morph.attributes);
        updateGrammar(self.labels, grammar);
      }
      return grammar;
    }

    function updateGrammar(labels, grammar) {
      grammarReset(grammar);
      findDefiningAttributes(self.labels, grammar, grammar.definingAttrs);
      extractMenu(grammar);
      cacheUpdateProcess(grammar);
      grammar.markChange();
    }

    function cacheUpdateProcess(grammar) {
      var key = cacheKey(grammar);
      if (!sgCache.get(key)) {
        sgCache.put(key, grammar.definingAttrs);
      }
    }

    function cacheKey(grammar) {
      return arethusaUtil.inject([], grammar.morph, function(memo, k, v) {
        memo.push(k + '-' + v);
      }).sort().join('|');
    }

    function findDefiningAttributes(labels, grammar, target) {
      var cached = sgCache.get(cacheKey(grammar));
      if (cached) {
        arethusaUtil.pushAll(target, cached);
      } else {
        arethusaUtil.inject(target, labels, function(memo, label, val) {
          var dep = val.dependency;
          if (dep) {
            var morph = grammar.morph;
            var nextLevel;
            angular.forEach(dep, function(depVal, depCat) {
              if (dependencyMet(morph[depCat], depVal)) {
                val = angular.copy(val);
                memo.push(val);
                nextLevel = val.nested;
                if (nextLevel) {
                  angular.forEach(nextLevel, function(nestedMenu, nestedLabel) {
                    if (nestedMenu.nestedDependency) {
                      var nextNestedLevel = [];
                      findDefiningAttributes(nestedMenu.nested, grammar, nextNestedLevel);
                      nestedMenu.nested = { nested: nextNestedLevel.pop() };
                    }
                  });
                  findDefiningAttributes(nextLevel, grammar, target);
                }
              }
            });
          }
        });
      }
    }

    function dependencyMet(morphValue, depValue) {
      if (angular.isDefined(morphValue)) {
        return morphValue === depValue || depValue === "*";
      }
    }

    // We already captured the defining attributes at this point - they
    // are all stored as full objects with their full nested structure.
    // The menu we want to present to the user is therefore the last one
    // in this array structure.
    function extractMenu(grammar) {
      var attrs = grammar.definingAttrs;
      // Could be that this array is empty!
      var lastAttr = attrs[attrs.length - 1] || {};
      grammar.menu = lastAttr.nested;
    }

    function propagateToState() {
      angular.forEach(self.grammar, function(val, id) {
        state.tokens[id].sg = val;
      });
    }

    this.requestGrammar = function(sections, callback) {
      retriever.getData(sections, callback);
    };

    this.canEdit = function() {
      return self.mode === "editor";
    };

    state.on('tokenAdded', function(event, token) {
      self.grammar[token.id] = createNewSgObject(token);
    });

    state.on('tokenRemoved', function(event, token) {
      delete self.grammar[token.id];
    });

    this.init = function() {
      plugins.doAfter('morph', function() {
        configure();
        self.grammar = createInternalState();
        self.readerRequested = false;
        propagateToState();
      });
    };
  }
]);

angular.module('arethusa.sg').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('js/arethusa.sg/templates/ancestors.html',
    "<div class=\"text\">\n" +
    "  <div\n" +
    "    ng-repeat=\"o in hierarchy\"\n" +
    "    ng-class=\"{underline: hover, italic: requested(o)}\"\n" +
    "    ng-mouseenter=\"hover = o.sections\"\n" +
    "    ng-mouseleave=\"hover = false\"\n" +
    "    ng-click=\"requestGrammar(o)\"\n" +
    "    style=\"padding: 2px 0\"\n" +
    "    ng-style=\"{'margin-left': 0.75 * $index + 'em'}\">\n" +
    "    ‣ {{ o.long }}\n" +
    "  </div>\n" +
    "</div>\n"
  );


  $templateCache.put('js/arethusa.sg/templates/context_menu.html',
    "<div sg-context-menu-selector obj=\"token.sg\"></div>\n"
  );


  $templateCache.put('js/arethusa.sg/templates/sg_context_menu_selector.html',
    "<ul class=\"nested-dropdown\">\n" +
    "  <li class=\"first-item\">{{ heading }}\n" +
    "    <ul\n" +
    "      class=\"top-menu\"\n" +
    "      nested-menu-collection\n" +
    "      property=\"\"\n" +
    "      current=\"obj\"\n" +
    "      ancestors=\"sg.defineAncestors\"\n" +
    "      all=\"obj.menu\"\n" +
    "      label-as=\"sg.labelAs\"\n" +
    "      empty-val=\"true\">\n" +
    "    </ul>\n" +
    "  </li>\n" +
    "</ul>\n" +
    "\n"
  );


  $templateCache.put('js/arethusa.sg/templates/sg_grammar_reader.html',
    "<div ng-if=\"isVisible()\">\n" +
    "  <hr class=\"small\"/>\n" +
    "  <div id=\"sg-g-r\"/>\n" +
    "<div/>\n" +
    "\n"
  );

}]);
