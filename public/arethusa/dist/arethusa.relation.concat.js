'use strict';
angular.module('arethusa.relation', []);

"use strict";

angular.module('arethusa.relation').directive('labelSelector', [
  'relation',
  '$timeout',
  function(relation, $timeout) {
    return {
      restrict: 'A',
      scope: {
        obj: '=',
        change: '&'
      },
      link: function(scope, element, attrs) {
        scope.plugin = relation;
        scope.showMenu = true;

        scope.$watch('plugin.mode', function(newVal, oldVal) {
          scope.showMenu = relation.canEdit();
        });

        scope.$on('nestedMenuSelection', function(event, obj) {
          if (attrs.change && angular.isFunction(scope.change)) {
            scope.change();
          } else {
            var oldAncestors = angular.copy(obj.ancestors);
            $timeout(function() {
              relation.changeState(obj, oldAncestors);
            });
          }
        });
      },
      templateUrl: 'js/arethusa.relation/templates/label_selector.html'
    };
  }
]);

"use strict";

angular.module('arethusa.relation').directive('nestedMenu', [
  '$compile',
  '$timeout',
  '$window',
  'saver',
  'navigator',
  function($compile, $timeout, $window, saver, navigator) {
    return {
      restrict: 'A',
      scope: {
        relObj: '=',
        labelObj: '=',
        label: '=',
        labelAs: '=',
        property: '=',
        ancestors: '='
      },
      link: function(scope, element, attrs) {
        var html = '\
          <ul\
            nested-menu-collection\
            current="relObj"\
            property="property"\
            ancestors="ancestors"\
            label-as="labelAs"\
            all="labelObj.nested">\
          </ul>\
        ';

        var win = angular.element($window);

        scope.labelRepresentation = scope.label ? scope.label : '---';

        var nested = scope.labelObj.nested;

        if (nested) {
          element.addClass('nested');

          element.bind('mouseenter', function() {
            var menu = $compile(html)(scope);
            var maxHeight = win.height() - 10;
            var items = Object.keys(nested).length;
            var menuHeight = items * element.height(); // height per element
            var topPos = element.offset().top;
            var bottom = topPos + menuHeight;
            if (bottom > maxHeight) {
              var space = maxHeight - topPos;
              var shift = menuHeight - space;
              menu.css('top', '-' + shift + 'px');
            }
            element.append(menu);
            element.unbind('mouseenter');
          });
        }

        scope.selectLabel = function() {
          if (scope.property) {
            scope.relObj[scope.property] = scope.label;
            scope.$emit('nestedMenuSelection', scope.relObj);
          }
        };

        scope.addAncestor = function(obj, ancestor) {
          obj.ancestors.unshift(ancestor);
        };

        scope.resetAncestors = function(obj) {
          var ancestors = obj.ancestors;
          while (ancestors.length > 0) {
            ancestors.pop();
          }
        };

        function markChange() {
          if (angular.isFunction(scope.relObj.markChange)) {
            scope.relObj.markChange();
          }
        }

        element.bind('click', function(event) {
          scope.$apply(function() {
            // Temporary solution. Eventually we want to trigger a tokenChange
            // event here, so that other plugins can listen to it. This event
            // would also notifiy the saver that a save is needed.
            navigator.markChunkChanged();
            saver.needsSave = true;

            if (event.eventPhase === 2) { // at target, three would be bubbling!
              markChange();
              scope.selectLabel();
              if (scope.ancestors) {
                scope.resetAncestors(scope.relObj);
              }
            }
            if (scope.ancestors) {
              scope.addAncestor(scope.relObj, scope.labelObj);
            }
          });
        });


        var p = angular.element(document.getElementById('sidepanel'));
        var leftDistance;
        if (scope.labelObj.nested) {
          element.on('mouseenter', function() {
            // This is pretty crazy to do really right. We add a timeout so that
            // we can still blaze through the list without triggering scroll
            // events all the time. For that we have to check that when the
            // timeout is run out we're still hovering the element.
            $timeout(function() {
              if (element.is(':hover')) {
                var domPanel = p[0];
                var totalW = p.width();
                var leftScroll = element.scrollLeft();
                var leftDistance = domPanel.scrollWidth - leftScroll - totalW;
                if (leftDistance > 0) {
                  p.scrollLeft(leftScroll + leftDistance, 500);
                }
              }
            }, 500);
          });
          // Would be nice to get back somehow too. Sadly, the event only fires
          // when the whole menu is left - which makes no sense...
          // It's logically also not very sound - work on this later.
          //element.on('mouseleave', function() {
            //if (leftDistance > 0) {
              //console.log(element.scrollLeft());
              //p.scrollLeft(element.scrollLeft() - leftDistance, 500);
            //}
          //});
        }
      },
      template: '{{ labelRepresentation }}'
    };
  }
]);

"use strict";

angular.module('arethusa.relation').directive('nestedMenuCollection', [
  '$window',
  function($window) {
    return {
      restrict: 'A',
      replace: 'true',
      scope: {
        current: '=',
        all: '=',
        property: '=',
        ancestors: '=',
        emptyVal: '@',
        labelAs: "=",
      },
      link: function(scope, element, attrs) {
        var win = angular.element($window);

        scope.emptyLabel = "";
        scope.emptyObj = {};

        scope.labelView = function(labelObj) {
          if (scope.labelAs) {
            return labelObj[scope.labelAs];
          } else {
            return labelObj.short;
          }
        };

        if (element.hasClass('top-menu')) {
          var items = Object.keys(scope.all || {}).length + 1; // an empty val
          // Don't try to be clever when the list is really long. Chances are
          // that repositioning would cause the menu to go beyond the upper
          // border of the viewport, which is even worse.
          if (items < 15) {
            var menuHeight = items * 18; // hard to access, we therefore hardcode...
            var maxHeight = win.height() - 15;
            var topPos = element.parent().offset().top;
            var bottom = topPos + menuHeight;
            if (bottom > maxHeight) {
              element.css({ top: 'auto', bottom: '100%'});
            }
          }
        }
      },
      template: '\
        <ul>\
          <li ng-if="emptyVal"\
            nested-menu\
            property="property"\
            rel-obj="current"\
            ancestors="ancestors"\
            label="emptyLabel"\
            label-obj="emptyObj">\
          </li>\
          <li\
            ng-repeat="label in all | keys"\
            nested-menu\
            property="property"\
            rel-obj="current"\
            ancestors="ancestors"\
            label="labelView(all[label])"\
            label-as="labelAs"\
            label-obj="all[label]">\
          </li>\
        </ul>\
      '
    };
  }
]);

"use strict";

angular.module('arethusa.relation').directive('relationMultiChanger', [
  'relation',
  function(relation) {
    return {
      restrict: 'A',
      link: function(scope, element, attrs) {
        scope.isPossible = relation.multiChangePossible;
        scope.apply = relation.applyMultiChanger;
        scope.r = relation;

        scope.$watch('r.mode', function(newVal, oldVal) {
          if (relation.canEdit()) {
            element.show();
          } else {
            element.hide();
          }
        });
      },
      templateUrl: 'js/arethusa.relation/templates/relation_multi_changer.html'
    };
  }
]);

"use strict";

angular.module('arethusa.relation').directive('syntacticalDescription', [
  '$compile',
  'state',
  'relation',
  '_',
  function(
    $compile,
    state,
    relation,
    _
  ) {
    var HEAD_PROPERTY = 'head.id';

    var TEMPLATES = {
      // When a token has no head
      '1-0': [
        '<div>',
          tokenTpl('target'),
          'is {{ content.target.article}}',
          labelTpl('target') + '.',
        '</div>'
      ].join(' '),

      // When a token has a head
      '1-1': [
        '<div>',
          tokenTpl('target'),
          'is {{ content.target.article}}',
          labelTpl('target'),
          'of the',
          labelTpl('head'),
          tokenTpl('head') + '.',
        '</div>'
      ].join(' ')

      // When a coordinated token has no head

      // When a coordinated token has a head

      // When a coordinated token has a coordinated head

      // When a token is in apposition

      // ...
    };

    function labelTpl(arg) {
      return [
        '<span ng-style="{{ content.' + arg + '.style }}">',
          '{{ content.' + arg + '.label}}',
        '</span>'
      ].join('');
    }

    function tokenTpl(arg) {
      return [
        '<span ng-if=" content.' + arg + '.token"',
          'token="content.' + arg + '.token"',
          'class="syntax-token"',
          'click="true"',
          'hover="true">',
        '</span>',
        '<span ng-if="!content.' + arg + ' .token"',
          'class="syntax-token">',
          '{{ content.' + arg + '.string}}',
        '</span>'
      ].join(' ');
    }

    function getTpl(counts) {
      var id = [counts.left, counts.right].join('-');
      return TEMPLATES[id];
    }

    return {
      restrict: 'EA',
      scope: {
        tokenId: '='
      },
      link: function(scope, element, attrs) {
        var counts, token, head, tracker = [], watchers = [];
        var left, right;

        scope.$watch('tokenId', init);

        addWatcher('head.id');
        addWatcher('relation.label');

        scope.$on('$destroy', removeWatchers);

        function init(id) {
          reset();

          left.token  = getToken(id);
          right.head  = getHead(left.token);

          calculateCounts();
          recompile();
        }

        function update(newVal, oldVal, event) {
          if (isTracked(event.token.id)) {
            init(scope.tokenId);
          }
        }

        function addWatcher(property) {
          watchers.push(state.watch(property, update));
        }

        function removeWatchers() {
          while (watchers.length) {
            watchers.pop()(); // deregister
          }
        }

        function isTracked(id) {
          return _.contains(tracker, id);
        }

        function getToken(id) {
          if (id) {
            addToTracker(id);
            return state.getToken(id);
          } else {
            removeFromTracker(id);
          }
        }

        function getHead(token) {
          var id;
          if (token) id = aU.getProperty(token, HEAD_PROPERTY);
          return id ? state.getToken(id) : undefined;
        }

        function addToTracker(id) {
          if (!isTracked(id)) {
            tracker.push(id);
          }
        }

        function removeFromTracker(id) {
          var i = tracker.indexOf(id);
          if (i) {
            tracker.splice(i, 1);
          }
        }

        function calculateCounts() {
          if (left.token) addLeft();
          if (right.head) addRight();
        }

        function addLeft() {
          counts.left += 1;
        }

        function addRight() {
          counts.right += 1;
        }

        function reset() {
          resetContainers();
          resetCounts();
          resetContent();
        }

        function resetCounts() {
          counts = { left: 0, right: 0 };
        }

        function resetContainers() {
          left  = {};
          right = {};
        }

        function resetContent() {
          scope.content= {};
        }

        function setContent(name, obj) {
          if (!obj) return;
          scope.content[name] = obj;
        }

        function getContent(name) {
          return scope.content[name];
        }

        function recompile() {
          element.empty();

          var template = getTpl(counts);

          if (template) {
            setContent('target', toScopeObj(left.token));
            setContent('head', toScopeObj(right.head));

            var content = $compile(template)(scope);
            element.append(content);
          }

        }

        function getArticle(label) {
          label = label || '';
          return label.match(/^[aeiou]/) ? 'an' : 'a';
        }

        function toScopeObj(token) {
          if (!token) return;

          var string, label, style;
          if (isRoot(token)) {
            string = 'root of the sentence';
            token = undefined;
          } else {
            var relObj = relation.getLabelObj(token);
            // @balmas there are probably various circumstances
            // where the relObj is undefined here - most
            // obvious is when the loaded document has labels
            // which don't match the current set, but other
            // situations may be possible. We shouldn't
            // crash if this is the case but just gracefully
            // try not to read attributes from it. This is a
            // workaround -- a better solution might be to 
            // code a default relation object for this situation
            if (relObj) {
              label = relObj.long;
              style = relObj.style;
            } else {
              label = "[]";
              style = "";
            }
            string = token.string;
          }
          return {
            token: token,
            string: string,
            label: label,
            style: style,
            article: getArticle(label),
          };
        }

        function isRoot(token) {
          // no good way to detect this right now - as state.getToken is returning
          // an empty object when a token cannot be found in the store, this will
          // in all cases right now be the root. Very brittle!
          return angular.equals(token, {});
        }
      }
    };
  }
]);

'use strict';
angular.module('arethusa.relation').service('relation', [
  'state',
  'configurator',
  'globalSettings',
  'commons',
  '_',
  function (state, configurator, globalSettings, commons, _) {
    var self = this;
    this.name = "relation";

    this.canSearch = true;

    globalSettings.addColorizer('relation');

    var props = [
      'advancedMode',
      'syntaxDescriptions'
    ];

    function configure() {
      configurator.getConfAndDelegate(self);
      configurator.getStickyConf(self, props);
      self.relationValues = self.conf.relations;
      addParentsToRelationConf();
      self.relations = {};
      colorMap = undefined;
    }

    function addParentsToRelationConf() {
      angular.forEach(self.relationValues.labels, addParentsToNested);
    }

    function addParentsToNested(obj) {
      var nested = obj.nested;
      if (nested) {
        angular.forEach(nested, function(rel, key) {
          rel.parent = obj;
          addParentsToNested(rel);
        });
      }
    }

    // Currently selected labels
    this.currentLabels = function () {
      return arethusaUtil.inject({}, state.selectedTokens, function (memo, id, event) {
        memo[id] = self.relations[id];
      });
    };

    // Label handling
    function splitLabel(relation, label) {
      label = angular.isDefined(label) ? label : relation.label;
      var split = label.split('_');
      relation.prefix = split.shift() || '';
      relation.suffix = split.join('_');
    }

    this.buildLabel = function (relation, doNotSet) {
      var elements = [
          relation.prefix,
          relation.suffix
        ];
      var clean = arethusaUtil.inject([], elements, function (memo, el) {
          if (el) {
            memo.push(el);
          }
        });

      var label = clean.join('_');
      if (!doNotSet) {
        relation.label = label;
      }
      return label;
    };

    this.prefixWithAncestors = function(relation) {
      return arethusaUtil.inject([], relation.ancestors, function(memo, ancestor) {
        memo.push(ancestor.short);
      }).join(' > ') || '---';
    };

    this.suffixOrPlaceholder = function(relation) {
      return relation.suffix || '---';
    };

    this.usePrefix = 'prefix';
    this.useSuffix = 'suffix';
    this.defineAncestors = true;

    function findLabel(key, container) {
      var k, v, res;
      for (k in container) {
        if (key === k) {
          return container[k];
        } else {
          v = container[k];
          if (v.nested) {
            res = findLabel(key, v.nested);
            if (res) {
              return res;
            }
          }
        }
      }
    }

    function addParents(parents, obj) {
      var parent = obj.parent;
      if (parent) {
        addParents(parents, parent);
        parents.unshift(parent);
      }
      return parents;
    }

    this.initAncestors = function(relation) {
      // calculate a real ancestor chain here if need be
      var prefix = relation.prefix;
      var ancestors = [];
      if (prefix) {
        var obj = findLabel(prefix, self.relationValues.labels);
        if (obj) {
          ancestors = addParents([], obj);
          ancestors.push(obj);
        }
      }
      relation.ancestors = ancestors;
    };

    this.expandRelation = function (relation) {
      splitLabel(relation);
      self.initAncestors(relation);
      return relation;
    };

    // Empty template for relation objects
    this.relationTemplate = function () {
      return {
        prefix: '',
        suffix: '',
        label: '',
        ancestors: []
      };
    };

    // Search/Selector
    this.resetSearchedLabel = function () {
      self.searchedLabel = self.relationTemplate();
    };

    // TODO
    // This should be more flexible and take pre/suffixing into account,
    // at least as optional feature
    this.selectByLabel = function (label) {
      var ids = arethusaUtil.inject([], self.relations, function (memo, id, rel) {
        if (rel.relation.label === label) {
          memo.push(id);
        }
      });
      state.multiSelect(ids);
    };

    this.buildLabelAndSearch = function(rel) {
      rel = rel ? rel : self.searchedLabel;
      self.buildLabel(rel);
      self.selectByLabel(rel.label);
    };

    // Multi-changer
    this.resetMultiChanger = function () {
      this.multiChanger = self.relationTemplate();
    };

    this.multiChangePossible = function () {
      // We check for the prefix, as only a suffix, which would
      // fill the label already would not be allowed.
      //
      // Tokens need to be selected to of course.
      return self.multiChanger.prefix !== '' &&
        state.hasSelections();
    };

    // Pretty ridiculous changes to gain compatibility with the
    // new state eventing.
    //
    // There is some duplicate stuff happening, to blame is the
    // whole nestedMenu directive logic, which has to be redone
    // for other reasons as well.
    //
    // Prefix/Suffix and Ancestors have already been built by
    // the directive when we enter relation.stateChange, only
    // the label has to be built.
    //
    // Because we need to define proper values for prefix/suffix
    // and ancestors when we want to undo/redo our changes, we
    // have to recreate them during during stateChange, which
    // leads to a redefinition on the initial event. It's not
    // really a problem, it's just not very pretty...
    //
    this.applyMultiChanger = function () {
      // We have to copy the multiChanger, so that its model
      // stays intact, when we remove the label. We need to do
      // this because we will rebuild it through changeState.
      var cleanChanger = angular.copy(self.multiChanger);
      delete cleanChanger.label;

      state.doBatched(function() {
        angular.forEach(self.currentLabels(), function (obj, id) {
          var oldAncestors = obj.relation.ancestors;
          angular.extend(obj.relation, cleanChanger);
          self.changeState(obj.relation, oldAncestors);
        });
      });
    };

    function undoFn(id, obj, val, oldAncestors) {
      oldAncestors = oldAncestors || angular.copy(obj.ancestors);
      return function() {
        splitLabel(obj, val);
        obj.ancestors = oldAncestors;
        if (isColorizer()) setStyle(id, oldAncestors);
        state.change(obj.id, 'relation.label', val);
      };
    }

    function preExecFn(id, obj, val) {
      var newAncestors = angular.copy(obj.ancestors);
      return function() {
        obj.ancestors = newAncestors;
        splitLabel(obj, val);
        if (isColorizer()) setStyle(id, newAncestors);
      };
    }

    function isColorizer() {
      return globalSettings.isColorizer('relation');
    }

    this.changeState = function(relObj, oldAncestors) {
      var id = relObj.id;
      var oldVal = relObj.label;
      var newVal = self.buildLabel(relObj, !!id);

      if (id) {
        state.change(id, 'relation.label', newVal,
                    undoFn(id, relObj, oldVal, oldAncestors),
                    preExecFn(id, relObj, newVal));
      }
    };

    // Init
    function addToInternalState(container, id, token) {
      if (!token.relation) token.relation = self.relationTemplate();
      // Passing the id is a hacky shortcut to allow access to
      // state.change. If we ever have to change ids on the fly,
      // this will call for trouble. Watch out.
      token.relation.id = id;
      container[id] = {
        string: token.string,
        relation: self.expandRelation(token.relation || '')
      };
    }

    this.createInternalState = function () {
      return arethusaUtil.inject({}, state.tokens, addToInternalState);
    };

    this.canEdit = function() {
      return self.mode === "editor";
    };

    state.on('tokenAdded', function(event, token) {
      addToInternalState(self.relations, token.id, token);
    });

    state.on('tokenRemoved', function(event, token) {
      delete self.relations[token.id];
    });

    function extractColor(obj, target, keys) {
      angular.forEach(obj, function(rel, name) {
        var style  = rel.style;
        var nested = rel.nested;
        if (style) {
          var key = aU.flatten(aU.map(keys, rel)).join(' || ');
          target[key] = style;
        }

        if (nested) {
          extractColor(nested, target, keys);
        }
      });
    }

    function createColorMap() {
      var keys = ['short', 'long'];
      var colors = {};
      var map = { header: keys, maps: [{ label: 'Label', colors: colors }] };

      extractColor(self.relationValues.labels, colors, keys);
      return map;
    }

    var colorMap;
    this.colorMap = function() {
      if (!colorMap) colorMap = createColorMap();
      return colorMap;
    };

    function setStyle(id, ancestors) {
      var anc = aU.last(ancestors || self.relations[id].relation.ancestors) || {};
      var style = anc.style || {};
      state.addStyle(id, style);
    }

    this.applyStyling = function() {
      angular.forEach(state.tokens, function(token, id) {
        if (token.relation.label) {
          setStyle(id);
        } else {
          state.unsetStyle(id);
        }
      });
    };

    this.settings = [
      commons.setting('Advanced Mode', 'advancedMode'),
      commons.setting('Show Syntax Descriptions', 'syntaxDescriptions')
    ];

    function getLabelObj(token) {
      return _.last(getAncestors(token));
    }

    function getAncestors(token) {
      return (token.relation || {}).ancestors || [];
    }

    this.getLabelObj = getLabelObj;

    this.init = function () {
      configure();
      self.relations = self.createInternalState();
      self.resetSearchedLabel();
      self.resetMultiChanger();
      if (isColorizer()) self.applyStyling();
    };
  }
]);

angular.module('arethusa.relation').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('js/arethusa.relation/templates/context_menu.html',
    "<div label-selector obj=\"token.relation\"></div>\n"
  );


  $templateCache.put('js/arethusa.relation/templates/label_selector.html',
    "<ul class=\"nested-dropdown\">\n" +
    "  <li class=\"first-item\">{{ plugin.prefixWithAncestors(obj) }}\n" +
    "    <ul\n" +
    "      ng-if=\"showMenu\"\n" +
    "      class=\"top-menu\"\n" +
    "      nested-menu-collection\n" +
    "      property=\"plugin.usePrefix\"\n" +
    "      current=\"obj\"\n" +
    "      ancestors=\"plugin.defineAncestors\"\n" +
    "      all=\"plugin.relationValues.labels\"\n" +
    "      empty-val=\"true\">\n" +
    "    </ul>\n" +
    "  </li>\n" +
    "</ul>\n" +
    "<ul class=\"nested-dropdown\" ng-if=\"plugin.relationValues.suffixes\">\n" +
    "  <li class=\"first-item\">{{ plugin.suffixOrPlaceholder(obj) }}\n" +
    "    <ul\n" +
    "      ng-if=\"showMenu\"\n" +
    "      class=\"top-menu\"\n" +
    "      nested-menu-collection\n" +
    "      property=\"plugin.useSuffix\"\n" +
    "      current=\"obj\"\n" +
    "      all=\"plugin.relationValues.suffixes\"\n" +
    "      empty-val=\"true\">\n" +
    "    </ul>\n" +
    "  </li>\n" +
    "</ul>\n" +
    "\n"
  );


  $templateCache.put('js/arethusa.relation/templates/relation_multi_changer.html',
    "<div>\n" +
    "  <label class=\"note\">\n" +
    "    <span translate=\"relation.changeAll\"/>\n" +
    "  </label>\n" +
    "  <span\n" +
    "    label-selector\n" +
    "    obj=\"r.multiChanger\">\n" +
    "  </span>\n" +
    "  <button\n" +
    "    class=\"micro radius\"\n" +
    "    ng-disabled=\"! isPossible()\"\n" +
    "    ng-click=\"apply()\">\n" +
    "    <span translate=\"apply\"/>\n" +
    "  </button>\n" +
    "</div>\n"
  );


  $templateCache.put('js/arethusa.relation/templates/search.html',
    "<div class=\"row\">\n" +
    "  <div class=\"small-12 columns\">\n" +
    "    <label>\n" +
    "      <span translate=\"relation.searchByLabel\"/>\n" +
    "    <div\n" +
    "      label-selector\n" +
    "      obj=\"plugin.searchedLabel\"\n" +
    "      change=\"plugin.buildLabelAndSearch()\">\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</div>\n" +
    "\n"
  );

}]);
