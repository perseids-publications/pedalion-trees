"use strict";
angular.module('arethusa.artificialToken', []);

"use strict";

angular.module('arethusa.artificialToken').directive('artificialTokenInsertionPointer', [
  'artificialToken',
  'state',
  'translator',
  function(artificialToken, state, translator) {
    return {
      restrict: 'A',
      scope: {},
      link: function(scope, element, attrs) {
        var modeClass = 'crosshair-cursor';
        var selectMode;
        var watch;

        scope.aT = artificialToken;

        var trsl = {};
        function updateAndTrigger(key) {
          return function(translation) {
            trsl[key] = translation();
            setInsertDirText();
          };
        }
        translator('aT.insertBehind',      updateAndTrigger('behind'));
        translator('aT.insertInFront',     updateAndTrigger('inFront'));
        translator('aT.insertBehindHint',  updateAndTrigger('behindHint'));
        translator('aT.insertInFrontHint', updateAndTrigger('inFrontHint'));

        function setInsertDirText() {
          var dir = scope.aT.insertBehind ? 'behind' : 'inFront';
          scope.insertDirText = trsl[dir];
          scope.insertDirHint = trsl[dir + 'Hint'];
          scope.arrow = scope.aT.insertBehind ? 'right' : 'left';
        }

        function tokens() {
          return angular.element('[token]');
        }

        scope.state = state;

        scope.enterSelectMode = function() {
          selectMode = true;
          state.deselectAll();
          tokens().addClass(modeClass);
          setWatch();
        };

        scope.toggleDir = function() {
          scope.aT.insertBehind = !scope.aT.insertBehind;
          setInsertDirText();
        };

        function leaveSelectMode() {
          selectMode = false;
          tokens().removeClass(modeClass);
          watch(); // to deregister
        }

        function setInsertionPoint(id) {
          artificialToken.model.insertionPoint = state.getToken(id);
        }

        function setWatch() {
          watch = scope.$watchCollection('state.selectedTokens', function(newVal, oldVal) {
            for (var id in newVal) {
              if (newVal[id] === 'click') {
                setInsertionPoint(id);
                state.deselectAll();
                leaveSelectMode();
                break;
              }
            }
          }, true);
        }

        scope.$watch('aT.model.insertionPoint', function(newVal, oldVal) {
          scope.insertionPoint = newVal;
        });

        scope.$watch('aT.insertBehind', setInsertDirText);

        setInsertDirText();
      },
      templateUrl: 'js/arethusa.artificial_token/templates/artificial_token_insertion_pointer.html'
    };
  }
]);

"use strict";

angular.module('arethusa.artificialToken').directive('artificialTokenEdit', [
  'artificialToken',
  'state',
  '$timeout',
  function(artificialToken, state, $timeout) {
    return {
      restrict: 'A',
      scope: {
        token: '=artificialTokenEdit'
      },
      link: function(scope, element, attrs) {
        scope.aT = artificialToken;
        scope.string = scope.token.string;
        scope.type   = scope.token.type;

        scope.changeType = function() {
          state.change(scope.token.id, 'type', scope.type);
        };

        // We don't want to change the string with every keystroke, we
        // therefore do it timeouted.
        var timer;
        scope.changeString = function() {
          if (timer) $timeout.cancel(timer);
          timer = $timeout(function() {
            state.change(scope.token.id, 'string', scope.string);
          }, 500);
        };

      },
      templateUrl: 'js/arethusa.artificial_token/templates/artificial_token_edit.html'
    };
  }
]);

"use strict";

angular.module('arethusa.artificialToken').directive('artificialTokenList', [
  'artificialToken',
  'idHandler',
  function(artificialToken, idHandler) {
    return {
      restrict: 'A',
      scope: true,
      link: function(scope, element, attrs) {
        scope.aT = artificialToken;
        scope.formatId = function(id) {
          return idHandler.formatId(id, '%s-%w');
        };
      },
      templateUrl: 'js/arethusa.artificial_token/templates/artificial_token_list.html'
    };
  }
]);

"use strict";

angular.module('arethusa.artificialToken').service('artificialToken', [
  'state',
  'configurator',
  'idHandler',
  'commons',
  function(state, configurator, idHandler, commons) {
    var self = this;
    this.name = "artificialToken";

    var confKeys = [
      "defaultInsertionPoint"
    ];

    this.defaultConf = {
      displayName: "aT"
    };

    function configure() {
      configurator.getConfAndDelegate(self, confKeys);
      self.createdTokens = {};
      self.count = 0;
      delete self.mode;
      resetModel();
    }

    function addDefaultInsertionPoint() {
      if (!self.model.insertionPoint) {
        var lastId = aU.last(Object.keys(state.tokens).sort());
        var unextended = idHandler.stripExtension(lastId);
        self.model.insertionPoint = state.getToken(unextended);
        self.insertBehind = true;
      }
    }


    function resetModel() {
      self.model = new ArtificialToken();
      if (self.defaultInsertionPoint) addDefaultInsertionPoint();
    }

    function ArtificialToken (string, type) {
      var self = this;
      this.string = string;
      this.type   = type || 'elliptic';
      this.artificial = true;
      this.idMap = new idHandler.Map();
    }

    this.supportedTypes = [
      'elliptic'
    ];


    this.setType = function(type) {
      self.model.type = type;
    };

    this.hasType = function(type) {
      return self.model.type === type;
    };

    this.toggleMode = function(mode) {
      if (self.mode === mode) {
        delete self.mode;
      } else {
        self.mode = mode;
      }
    };

    var count;
    function setString() {
      if (! self.model.string) {
        self.model.string = '[' + count + ']';
        count++;
      }
    }

    function findNextPlacerHolderCount() {
      var strings = arethusaUtil.inject([], self.createdTokens, function(memo, id, token) {
        var match = /\[(\d+)\]/.exec(token.string);
        if (match) {
          memo.push(match[1]);
        }
      }).sort();
      count = strings.length === 0 ? 0 : parseInt(strings[strings.length - 1]) + 1;
    }

    this.modelValid = function() {
      return self.model.type && self.model.insertionPoint;
    };

    function recountATs() {
      self.count = Object.keys(self.createdTokens).length;
    }

    function findArtificialTokensInState() {
      angular.forEach(state.tokens, function(token, id) {
        if (token.artificial) {
          addArtificialToken(id, token);
        }
      });
    }

    function addArtificialToken(id, token) {
      self.createdTokens[id] = token;
      recountATs();
    }

    function removeArtificialToken(id) {
      delete self.createdTokens[id];
      recountATs();
    }

    this.removeToken = state.removeToken;

    function findNextNewId(id) {
      var artificialIds = Object.keys(self.createdTokens);
      while (arethusaUtil.isIncluded(artificialIds, id)) {
        id = idHandler.increment(id);
      }
      return id;
    }

    function handleTerminatorState() {
      if (self.insertBehind) {
        var iP = self.model.insertionPoint;
        if (iP.terminator) {
          self.model.terminator = true;
          iP.terminator = false;
        } else {
          // Could be that this token is inserted behind the last token
          // of a sentence, which might not a terminator anymore, when
          // another aT claimed that place.
          var lastATInFront = self.createdTokens[idHandler.decrement(self.model.id)];
          if (lastATInFront) {
            self.model.terminator = true;
            lastATInFront.terminator = false;
          }
        }
      }
    }

    this.insertBehind = false;

    this.propagateToState = function() {
      setString();
      var iP = self.model.insertionPoint;
      var id = iP.id;
      var newId = self.insertBehind ? id : idHandler.decrement(id);
      if (!idHandler.isExtendedId(id)) {
        newId = idHandler.extendId(newId);
      }
      newId = findNextNewId(newId);
      self.model.id = newId;
      self.model.sentenceId = iP.sentenceId;

      handleTerminatorState();

      state.addToken(self.model, newId);
      resetModel();
    };

    state.on('tokenAdded', function(event, token) {
      addArtificialToken(token.id, token);
    });

    state.on('tokenRemoved', function(event, token) {
      removeArtificialToken(token.id);
    });

    this.settings = [
      { directive: 'artificial-token-toggle' },
      commons.setting(
        'Activate default insertion point',
        'defaultInsertionPoint',
        addDefaultInsertionPoint
      )
    ];


    this.init = function() {
      configure();
      findArtificialTokensInState();
      findNextPlacerHolderCount();
    };
  }
]);

angular.module('arethusa.artificialToken').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('js/arethusa.artificial_token/templates/artificial_token.html',
    "<div class=\"small-12 columns text-center\">\n" +
    "  <span\n" +
    "    class=\"button tiny radius\"\n" +
    "    ng-click=\"plugin.toggleMode('create')\">\n" +
    "    <span translate=\"create\"/>\n" +
    "  </span>\n" +
    "  <span\n" +
    "    class=\"button tiny radius\"\n" +
    "    ng-click=\"plugin.toggleMode('list')\">\n" +
    "    <span translate=\"list\"/>\n" +
    "  </span>\n" +
    "  <div delimiter/>\n" +
    "  <div ng-if=\"plugin.mode === 'create'\">\n" +
    "    <form name=\"cAT\">\n" +
    "      <label>\n" +
    "        <span translate=\"aT.visualRepresentation\"/>\n" +
    "        <input\n" +
    "          type=\"text\"\n" +
    "          foreign-keys\n" +
    "          ng-model=\"plugin.model.string\"/>\n" +
    "      </label>\n" +
    "      <div class=\"text-left\">\n" +
    "        <select\n" +
    "          class=\"compact\"\n" +
    "          required\n" +
    "          ng-model=\"plugin.model.type\"\n" +
    "          ng-options=\"type for type in plugin.supportedTypes\">\n" +
    "        </select>\n" +
    "      </div>\n" +
    "      <span artificial-token-insertion-pointer/>\n" +
    "      <div delimiter/>\n" +
    "    </form>\n" +
    "    <button\n" +
    "      class=\"tiny radius\"\n" +
    "      ng-disabled=\"!plugin.modelValid()\"\n" +
    "      ng-click=\"plugin.propagateToState()\">\n" +
    "      <span translate=\"aT.addToken\"/>\n" +
    "    </button>\n" +
    "  </div>\n" +
    "  <div\n" +
    "    ng-if=\"plugin.mode === 'list'\"\n" +
    "    artificial-token-list>\n" +
    "  </div>\n" +
    "</div>\n"
  );


  $templateCache.put('js/arethusa.artificial_token/templates/artificial_token_edit.html',
    "<input foreign-keys type=\"text\" ng-change=\"changeString()\" ng-model=\"string\"/>\n" +
    "<select\n" +
    "  class=\"compact\"\n" +
    "  required\n" +
    "  ng-model=\"type\"\n" +
    "  ng-change=\"changeType()\"\n" +
    "  ng-options=\"opt for opt in aT.supportedTypes\">\n" +
    "</select>\n"
  );


  $templateCache.put('js/arethusa.artificial_token/templates/artificial_token_insertion_pointer.html',
    "<div class=\"small-12 columns\">\n" +
    "  <label>\n" +
    "    <span translate=\"aT.insertionPoint\"/>\n" +
    "    <div class=\"small-panel row text-left\">\n" +
    "      <span ng-if=\"!insertionPoint\">-</span>\n" +
    "      <span ng-if=\" insertionPoint\">\n" +
    "        <span>{{ insertDirText }}</span>\n" +
    "        <span\n" +
    "          token-with-id\n" +
    "          value=\"insertionPoint.string\"\n" +
    "          token-id=\"insertionPoint.id\">\n" +
    "        </span>\n" +
    "      </span>\n" +
    "      <span class=\"right\">\n" +
    "        <span\n" +
    "          ng-click=\"enterSelectMode()\"\n" +
    "          class=\"button micro radius\">\n" +
    "          <i class=\"fa fa-crosshairs rotate-on-hover\"></i>\n" +
    "        </span>\n" +
    "        <span class=\"button micro radius\"\n" +
    "          ng-click=\"toggleDir()\"\n" +
    "          title=\"{{ insertDirHint }}\">\n" +
    "          <i class=\"fa fa-arrow-{{ arrow }}\"></i>\n" +
    "        </span>\n" +
    "      </span>\n" +
    "    </div>\n" +
    "  </label>\n" +
    "</div>\n"
  );


  $templateCache.put('js/arethusa.artificial_token/templates/artificial_token_list.html',
    "<p\n" +
    "  ng-if=\"aT.count === 0\"\n" +
    "  class=\"text\"\n" +
    "  style=\"margin-left: 0.75rem\">\n" +
    "  <span translate=\"aT.noArtTokensPresent\"/>\n" +
    "</p>\n" +
    "\n" +
    "<div class=\"panel\" ng-repeat=\"(id, token) in aT.createdTokens\">\n" +
    "  <div>\n" +
    "    <span class=\"left\">\n" +
    "      <span\n" +
    "        class=\"normal-size\"\n" +
    "        token=\"token\"\n" +
    "        colorize=\"true\"\n" +
    "        click=\"true\"\n" +
    "        hover=\"true\">\n" +
    "      </span>\n" +
    "      <sup\n" +
    "        class=\"note\">\n" +
    "        {{ formatId(id) }}\n" +
    "      </sup>\n" +
    "    </span>\n" +
    "    <span class=\"right\">\n" +
    "      <span\n" +
    "        ng-click=\"aT.removeToken(id)\"\n" +
    "        class=\"button tiny radius\">\n" +
    "        <span translate=\"delete\"/>\n" +
    "      </span>\n" +
    "    </span>\n" +
    "  </div>\n" +
    "\n" +
    "  <div artificial-token-edit=\"token\"/>\n" +
    "</div>\n"
  );

}]);
