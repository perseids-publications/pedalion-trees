'use strict';
angular.module('arethusa.search', []);

"use strict";

angular.module('arethusa.search').directive('pluginSearch', function() {
  return {
    restrict: 'AE',
    scope: true,
    replace: true,
    link: function(scope, element, attrs) {
      scope.plugin = scope.$eval(attrs.pluginSearch);
      scope.template = 'js/arethusa.' + scope.plugin.name + '/templates/search.html';
    },
    template: '<div ng-include="template"></div>'
  };
});

"use strict";

angular.module('arethusa.search').directive('searchByString', [
  'search',
  'state',
  'sidepanel',
  function(search, state, sidepanel) {
    return {
      restrict: 'A',
      scope: {},
      link: function(scope, element, attrs) {
        scope.search = search;
        scope.state = state;

        // Mind that the following watches aren't active all the time!
        // When it is used from within the search plugins template, and it
        // is inactive through ngIf, they won't fire. This is generally a good
        // thing and we won't delete this code: We can still use it on isolation,
        // or we might at some point display it together with plugins that can
        // edit text.
        // Right now only the artificialToken plugin does this: Both are never
        // shown at the same time, which means this watches actually never fire
        // right now.

        var stringWatches = {};
        function initStringWatch(token, id) {
          var childScope = scope.$new();
          childScope.token = token;
          childScope.$watch('token.string', function(newVal, oldVal) {
            if (newVal !== oldVal) {
              search.removeTokenFromIndex(token.id, oldVal);
              search.collectTokenString(search.strings, id, token);
            }
          });
          stringWatches[id] = childScope;
        }

        function initStringWatches() {
          angular.forEach(state.tokens, initStringWatch);
        }

        function removeStringWatch(scope) {
          scope.$destroy();
        }

        function destroyStringWatch() {
          angular.forEach(stringWatches, removeStringWatch);
          stringWatches = {};
        }

        scope.$watch('state.tokens', function(newVal, oldVal) {
          initStringWatches();
        });

        var inputField = element.find('input')[0];
        var inSidepanel = element.parents('#sidepanel')[0];
        scope.$watch('search.focusStringSearch', function(newVal, oldVal) {
          if (newVal) {
            if (inSidepanel) {
              if (sidepanel.folded) sidepanel.toggle();
            }
            inputField.focus();
            search.focusStringSearch = false;
          }
        });
      },
      templateUrl: 'js/arethusa.search/templates/search_by_string.html'
    };
  }
]);

'use strict';
angular.module('arethusa.search').service('search', [
  'state',
  'configurator',
  'keyCapture',
  'plugins',
  function (state, configurator, keyCapture, plugins) {
    var self = this;
    this.name = 'search';

    this.defaultConf = {
      displayName: 'selector',
      queryByRegex: true
    };

    function configure() {
      var props = [
        'queryByRegex'
      ];

      configurator.getConfAndDelegate(self);
      configurator.getStickyConf(self, props);

      self.focusStringSearch = false;
      self.greekRegex = keyCapture.conf('regex').greek;
    }

    this.findByRegex = function(str) {
      // We might need to escape some chars here, we need to try
      // this out more
      angular.forEach(self.greekRegex, function(diacr, plain) {
        var toBeSubstituted = new RegExp(plain, 'g');
        str = str.replace(toBeSubstituted, diacr);
      });
      var regex = new RegExp(str, 'i');
      return arethusaUtil.inject([], self.strings, function (memo, string, ids) {
        if (string.match(regex)) {
          arethusaUtil.pushAll(memo, ids);
        }
      });
    };

    this.queryTokens = function () {
      if (self.tokenQuery === '') {
        state.deselectAll();
        return;
      }
      var tokens = self.tokenQuery.split(' ');
      var ids = arethusaUtil.inject([], tokens, function (memo, token) {
          var hits = self.queryByRegex ? self.findByRegex(token) : self.strings[token];
          arethusaUtil.pushAll(memo, hits);
        });
      state.multiSelect(ids);
    };

    // Init
    this.collectTokenString = function(container, id, token) {
      var str = token.string;
      if (!container[str]) {
        container[str] = [];
      }
      container[str].push(id);
    };

    function collectTokenStrings() {
      return arethusaUtil.inject({}, state.tokens, self.collectTokenString);
    }

    this.removeTokenFromIndex = function(id, string) {
      var ids = self.strings[string];
      ids.splice(ids.indexOf(id), 1);
      if (ids.length === 0) {
        delete self.strings[string];
      }
    };


    state.on('tokenAdded', function(event, token) {
      self.collectTokenString(self.strings, token.id, token);
    });

    state.on('tokenRemoved', function(event, token) {
      self.removeTokenFromIndex(token.id, token.string);
    });

    function focusSearch() {
      plugins.setActive(self);
      self.focusStringSearch = true;
    }

    keyCapture.initCaptures(function(kC) {
      return {
        search: [
          kC.create('focus', focusSearch, 'A')
        ]
      };
    });

    function getSearchPlugins() {
      return arethusaUtil.inject([], plugins.all, function(memo, name, plugin) {
        if (plugin.canSearch) memo.push(plugin);
      });
    }

    this.init = function () {
      configure();
      self.searchPlugins = getSearchPlugins();
      self.strings = collectTokenStrings();
      self.tokenQuery = '';  // model used by the input form
    };
  }
]);

angular.module('arethusa.search').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('js/arethusa.search/templates/search_by_string.html',
    "<div class=\"row\">\n" +
    "  <div class=\"small-12 columns\">\n" +
    "    <label>\n" +
    "      <span translate=\"search.searchByToken\"/>\n" +
    "      <div class=\"row collapse\">\n" +
    "        <div class=\"small-10 columns\">\n" +
    "          <input type=\"search\"\n" +
    "            foreign-keys\n" +
    "            ng-change=\"search.queryTokens()\"\n" +
    "            ng-model=\"search.tokenQuery\" />\n" +
    "        </div>\n" +
    "        <div class=\"small-2 columns\">\n" +
    "          <label class=\"postfix\">\n" +
    "            regex\n" +
    "            <input\n" +
    "              id=\"regex-checkbox\"\n" +
    "              type=\"checkbox\"\n" +
    "              ng-change=\"search.queryTokens()\"\n" +
    "              ng-model=\"search.queryByRegex\"/>\n" +
    "          </label>\n" +
    "        </div>\n" +
    "      </div>\n" +
    "    </label>\n" +
    "  </div>\n" +
    "</div>\n"
  );

}]);
