'use strict';
angular.module('arethusa.depTree', []);

"use strict";

angular.module('arethusa.depTree').directive('depTreeNavigator', [
  '$timeout',
  function($timeout) {
    return {
      restrict: 'A',
      link: function(scope, element, attrs) {
        scope.$watch('groupSize', function(newVal, oldVal) {
          launch();
        });

        function launch() {
          var triggers = [];
          if (scope.groupSize > 1) {
            for (var i = 0; i  < scope.groupSize; i ++) {
              triggers.push(i);
            }
          }
          scope.focusTriggers = triggers;
        }

        scope.setCurrentFocus = function(focus) {
          scope.currentFocus = focus;
        };
      },
      templateUrl: 'js/arethusa.dep_tree/templates/dep_tree_navigator.html'
    };
  }
]);

'use strict';
/* Draws a dependencyTree
 *
 * Can be used in isolation and awaits tokens passed into it, which have
 * a head.id property.
 *
 * Styling of the tree can be customized by passing a styles object as
 * attribute.
 * This object should be a dictionary of token ids with style information
 * in three categories: edge, label and token.
 * These properties should hold regular css style information. Example
 *
 *   {
 *     '0001' : {
 *       edge: { stroke: 'blue' },
 *       token: { color: 'white' }
 *     }
 *   } *
 * This would draw the edge of the token 0001 one blue and the textual
 * representation of the token itself in white.
 *
 * Tokens are rendered by the token directive. If no styles object has
 * been passed to the dependencyTree directive, the token itself will
 * decide its styling.
 * Hover and click events for tokens are activated. An option to customize
 * this will follow.
 *
 * Watches are in effect for changes of a tokens head.id value, changes
 * in the styles object, as well as in the tokens object.
 *
 * Example, given a tokens and a styles object in the current scope:
 *
 *   <div dependency-tree tokens="tokens" styles="styles/>
 *
 * The element carrying the directive can contain additional html elements.
 * They will be rendered on top of the tree's SVG canvas and are therefore
 * a good option to add additional control elements. The directive uses this
 * space itself and will place some span elements there.
 *
 */

angular.module('arethusa.depTree').directive('dependencyTree', [
  'Tree',
  function (Tree) {
    return {
      restrict: 'A',
      scope: {
        tokens: '=',
        styles: '='
      },
      link: function (scope, element, attrs) {
        var tree = new Tree(scope, element, {
          mainAttribute: 'head.id',
          parentPlugin: 'depTree',
          syntheticRoot: true
        });

        tree.launch();
      },
    };
  }
]);

"use strict";

angular.module('arethusa.depTree').directive('treeSetting', function() {
  return {
    restrict: 'A',
    scope: {
      title: '@',
      val: '=treeSetting'
    },
    link: function(scope, element, attrs) {
      scope.increment = function() {
        scope.val++;
      };
      scope.decrement = function() {
        scope.val--;
      };
    },
    templateUrl: 'js/arethusa.dep_tree/templates/tree_setting.html'
  };

});

'use strict';
/* Dependency Tree Handler with Diff capabilities
 *
 * This service has not much to do - the tree itself is handled
 * completely by the dependencyTree directive.
 *
 * It has however additional diff capabilities, that are triggered
 * by a global diffLoaded event.
 * Knows how to pass style information to the tree visualization in
 * case a comparison/review was done.
 * * One could experiment here that this code should go back to a diff plugin
 * itself.
 * A diff plugin would calculate style information and pass this data load
 * through the diffLoaded event. The depTree service would listen to this
 * and pass the style info to its tree.
 *
 * Let's wait on a decision for this until we have done more work on the
 * diff plugin itself and resolved issue #80.
 * (https://github.com/latin-language-toolkit/llt-annotation_environment/issues/80)
 */
angular.module('arethusa.depTree').service('depTree', [
  'state',
  'configurator',
  'globalSettings',
  'notifier',
  'translator',
  'idHandler',
  function (state, configurator, globalSettings, notifier, translator, idHandler) {
    var self = this;
    this.name = "depTree";

    this.externalDependencies = {
      ordered: [
        "../../vendor/d3-3.4.13/d3.min.js",
        window.dagred3path
      ]
    };

    function configure() {
      configurator.getConfAndDelegate(self);
      self.diffMode = false;
      self.diffPresent = false;
      self.diffInfo = {};
    }

    this.toggleDiff = function () {
      self.diffMode = !self.diffMode;
    };

    // We have three things we can colorize as wrong in the tree
    //   Label
    //   Head
    //   and the word itself for morphological stuff
    function analyseDiffs(tokens) {
      return arethusaUtil.inject({}, tokens, function (memo, id, token) {
        var diff = token.diff;
        if (diff) {
          memo[id] = analyseDiff(diff);
        }
      });
    }

    function analyseDiff(diff) {
      return arethusaUtil.inject({}, diff, function (memo, key, val) {
        if (key === 'relation') {
          memo.label = { color: 'red' };
        } else {
          if (key === 'head') {
            memo.edge = {
              stroke: 'red',
              'stroke-width': '1px'
            };
          } else {
            memo.token = { color: 'red' };
          }
        }
      });
    }

    this.diffStyles = function () {
      if (self.diffMode) {
        return self.diffInfo;
      } else {
        return false;
      }
    };

    state.on('diffLoaded', function () {
      self.diffPresent = true;
      self.diffInfo = analyseDiffs(state.tokens);
      self.diffMode = true;
    });

    function addMissingHeadsToState() {
      angular.forEach(state.tokens, addHead);
    }

    function addHead(token) {
      if (!token.head) token.head = {};
    }

    function hasHead(token) {
      return token.head.id;
    }

    state.on('tokenAdded', function(event, token) {
      addHead(token);
    });

    state.on('tokenRemoved', function(event, token) {
      // We need to disconnect manually, so that this event
      // can be properly undone.
      if (hasHead(token)) self.disconnect(token);
      var id = token.id;
      angular.forEach(state.tokens, function(t, i) {
        if (t.head.id === id) {
          self.disconnect(t);
        }
      });
    });

    // Used inside the context menu
    this.disconnect = function(token) {
      state.change(token, 'head.id', '');
    };

    this.toRoot = function(token) {
      var rootId = idHandler.getId('0', token.sentenceId);
      state.change(token, 'head.id', rootId);
    };

    function getHeadsToChange(token) {
      var sentenceId = token.sentenceId;
      var id  = token.id;
      var notAllowed;
      var res = [];
      for (var otherId in state.clickedTokens) {
        var otherToken = state.getToken(otherId);
        if (otherToken.sentenceId !== sentenceId) {
          notAllowed = true;
          break;
        }
        if (id !== otherId) {
          res.push(otherToken);
        }
      }
      return notAllowed ? 'err': (res.length ? res : false);
    }

    function changeHead(tokenToChange, targetToken) {
      if (isDescendant(targetToken, tokenToChange)) {
        state.change(targetToken, 'head.id', tokenToChange.head.id);
      }
      state.change(tokenToChange, 'head.id', targetToken.id);
    }

    function isDescendant(targetToken, token) {
      var current = targetToken;
      var currHead = aU.getProperty(current, 'head.id');
      var tokenId = token.id;
      var desc = false;
      while ((!desc) && current && currHead) {
        if (tokenId === currHead) {
          desc = true;
        } else {
          current = state.getToken(currHead);
          currHead = current ? aU.getProperty(current, 'head.id') : false;
        }
      }
      return desc;
    }

    var translations = {};
    translator('depTree.errorAcrossSentences', translations, 'errorAcrossSentences');

    this.changeHead = function(idOrToken) {
      var token = angular.isString(idOrToken) ? state.getToken(idOrToken) : idOrToken;
      var headsToChange = getHeadsToChange(token);
      if (headsToChange) {
        if (headsToChange === 'err') {
          notifier.error(translations.errorAcrossSentences);
          return;
        }
        state.doBatched(function() {
          angular.forEach(headsToChange, function(otherToken, i) {
            changeHead(otherToken, token);
          });
        });
        return true;
      } else {
        return false;
      }
    };

    function changeHeadAction(id) {
      var headHasChanged = self.changeHead(id);
      if (!headHasChanged) {
        globalSettings.defaultClickAction(id);
      }
    }

    function awaitingHeadChange(id, event) {
      return !state.isSelected(id) && state.hasClickSelections() && !event.ctrlKey;
    }

    function preHeadChange() {
      return {
        'mouseenter' : function(id, element, event) {
          if (awaitingHeadChange(id, event)) {
            element.addClass('copy-cursor');
          }
        },
        'mouseleave' : function(id, element, event) {
          element.removeClass('copy-cursor');
        }
      };
    }

    var clickActionName = 'change head';

    globalSettings.addClickAction(clickActionName, changeHeadAction, preHeadChange());
    globalSettings.deselectAfterAction('head.id');

    this.init = function () {
      configure();
      addMissingHeadsToState();

      if (self.mode === 'editor') {
        globalSettings.setClickAction(clickActionName);
      }
    };
  }
]);

'use strict';
angular.module('arethusa.depTree').service('subtreeFinder', function () {
  var roots;
  function createRoot(id) {
    var root = {};
    root[id] = true;
    roots[id] = root;
    return root;
  }
  function isRoot(id) {
    return roots.hasOwnProperty(id);
  }
  function takeRoot(id) {
    var n = roots[id];
    delete roots[id];
    return n;
  }
  function addNode(headId, id) {
    if (!isRoot(headId)) {
      createRoot(headId);
    }
    var head = roots[headId];
    var childrenIds = isRoot(id) ? takeRoot(id) : createRoot(id);
    angular.extend(head, childrenIds);
  }
  function removeEmptyRoots() {
    angular.forEach(roots, function (obj, id) {
      if (Object.keys(obj).length === 1) {
        delete roots[id];
      }
    });
  }
  function collectTopDown() {
    return arethusaUtil.inject({}, roots, function (memo, id, children) {
      memo[id] = collectChildren(id, children);
    });
  }
  function collectChildren(id, children) {
    var res = {};
    angular.extend(res, children);
    angular.forEach(children, function (val, childId) {
      if (id !== childId) {
        if (isRoot(childId)) {
          var addChildren = takeRoot(childId);
          var recurse = collectChildren(childId, addChildren);
          angular.extend(res, recurse);
        }
      }
    });
    return res;
  }
  this.find = function (tokens) {
    roots = {};
    createRoot('0000');
    angular.forEach(tokens, function (token, id) {
      if ((token.head || {}).id) {
        addNode(token.head.id, token.id);
      } else {
        createRoot(token.id);
      }
    });
    removeEmptyRoots();
    return collectTopDown();
  };
});

angular.module('arethusa.depTree').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('js/arethusa.dep_tree/templates/context_menu.html',
    "<div class=\"button-group\">\n" +
    "  <span class=\"button micro radius\" ng-click=\"plugin.disconnect(token)\" translate=\"tree.disconnect\" />\n" +
    "  <span class=\"button micro radius\" ng-click=\"plugin.toRoot(token)\" translate=\"tree.toRoot\" />\n" +
    "  <span class=\"button micro radius\" ng-click=\"plugin.changeHead(token.id)\" translate=\"tree.makeHead\" />\n" +
    "</div>\n"
  );


  $templateCache.put('js/arethusa.dep_tree/templates/dep_tree_navigator.html',
    "<div class=\"left tree-focus-trigger-controls\" to-bottom>\n" +
    "  <div\n" +
    "    ng-repeat=\"trigger in focusTriggers\"\n" +
    "    class=\"tree-focus-trigger clickable\"\n" +
    "    ng-class=\"{ 'tree-focus-sel': trigger === currentFocus }\"\n" +
    "    ng-click=\"setCurrentFocus(trigger)\">\n" +
    "  </div>\n" +
    "<div/>\n"
  );


  $templateCache.put('js/arethusa.dep_tree/templates/settings.html',
    "<span\n" +
    "  title=\"{{ translations.compact() }}\"\n" +
    "  class=\"settings-span-button\"\n" +
    "  ng-click=\"compactTree()\">\n" +
    "  <i class=\"fa fa-compress\"></i>\n" +
    "</span>\n" +
    "<span\n" +
    "  title=\"{{ translations.widen() }}\"\n" +
    "  class=\"settings-span-button\"\n" +
    "  ng-click=\"wideTree()\">\n" +
    "  <i class=\"fa fa-expand\"></i>\n" +
    "</span>\n" +
    "<span\n" +
    "  title=\"{{ translations.changeDir() }} {{ keyHints.directionChange }}\"\n" +
    "  class=\"settings-span-button\"\n" +
    "  ng-click=\"changeDir()\">\n" +
    "  <i class=\"fi-loop rotate-on-hover\"></i>\n" +
    "</span>\n" +
    "<span\n" +
    "  title=\"{{ translations.focusRoot() }}\"\n" +
    "  class=\"settings-span-button\"\n" +
    "  ng-click=\"focusRoot()\">\n" +
    "  <i class=\"fa fa-crosshairs rotate-on-hover\"></i>\n" +
    "</span>\n" +
    "<span\n" +
    "  title=\"{{ translations.focusSel() }} {{ keyHints.focusSelection}}\"\n" +
    "  class=\"settings-span-button\"\n" +
    "  ng-click=\"focusSelection()\">\n" +
    "  <i class=\"fi-target-two rotate-on-hover\"></i>\n" +
    "</span>\n" +
    "<span\n" +
    "  title=\"{{ translations.centerTree() }} {{ keyHints.centerTree }}\"\n" +
    "  class=\"settings-span-button\"\n" +
    "  ng-click=\"centerGraph()\">\n" +
    "  <i class=\"fa fa-dot-circle-o\"></i>\n" +
    "</span>\n" +
    "<span\n" +
    "  title=\"{{ translations.perfectWidth() }} {{ keyHints.perfectWidth }}\"\n" +
    "  class=\"settings-span-button\"\n" +
    "  ng-click=\"perfectWidth()\">\n" +
    "  <i class=\"fa fa-arrows-h\"></i>\n" +
    "</span>\n" +
    "\n"
  );


  $templateCache.put('js/arethusa.dep_tree/templates/tree_setting.html',
    "<span>\n" +
    "  <span class=\"note\">{{ title }}</span>\n" +
    "  <input style=\"display: inline; height: 1.2rem; width: 3rem\" type=\"text\" ng-model=\"val\"/> \n" +
    "  <span ng-click=\"increment()\">+</span>\n" +
    "  <span ng-click=\"decrement()\">-</span>\n" +
    "</span>\n"
  );

}]);
