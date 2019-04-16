'use strict';
angular.module('arethusa.review', []);

"use strict";

angular.module('arethusa.review').directive('reviewDiffReport', [
  'review',
  'state',
  function(review, state) {
    return {
      restrict: 'A',
      scope: {},
      compile: function() {
        return {
          pre: function(scope, element, attrs) {
            scope.rev = review;
          }
        };
      },
      templateUrl: 'js/arethusa.review/templates/review_diff_report.html'
    };
  }
]);


"use strict";

// This is severly hacky as it hardcodes stuff - only an interim solution

angular.module('arethusa.review').directive('reviewElement', [
  'review',
  'morph',
  'state',
  function(review, morph, state) {
    return {
      restrict: 'A',
      scope: {
        cat: '=reviewElement',
        diff: '='
      },
      link: function(scope, element, attrs) {
        function initHeadDiff() {
          var arr = scope.diff.id;
          scope.wrong = state.getToken(arr[0]);
          scope.right = state.getToken(arr[1]);
        }

        function initRelationDiff() {
          var arr = scope.diff.label;
          scope.wrong = arr[0];
          scope.right = arr[1];
        }

        function initMorphDiff() {
          scope.errors = [];
          var lDiff = scope.diff.lemma;
          if (lDiff) scope.errors.push(lDiff);
          var pDiff = scope.diff.postag;
          if (pDiff) scope.errors.push(pDiff);
        }

        function init() {
          if (scope.cat === 'head')       initHeadDiff();
          if (scope.cat === 'relation')   initRelationDiff();
          if (scope.cat === 'morphology') initMorphDiff();

          scope.template = 'js/arethusa.review/templates/review_element_' + scope.cat + '.html';
        }

        scope.$watch('cat', init);
      },
      template: '<div ng-include="template"/>'
    };
  }
]);

"use strict";

angular.module('arethusa.review').directive('reviewLinker', [
  'review',
  'translator',
  function(review, translator) {
    return {
      restrict: 'A',
      scope: {},
      link: function(scope, element, attrs) {
        scope.review = review;

        scope.translations = translator({
          'review.link' : 'link',
          'review.unlink' : 'unlink'
        });

        function setTitle(prop) {
          element.attr('title', scope.translations[scope.icon]());
        }

        scope.$watch('translations', function(newVal, oldVal) {
          if (newVal !== oldVal) setTitle();
        }, true);

        scope.$watch('review.link', function(newVal, oldVal) {
          if (newVal) {
            scope.icon = 'unlink';
            if (newVal !== oldVal) {
              review.goToCurrentChunk();
            }
          } else {
            scope.icon = 'link';
          }
          setTitle();
        });
      },
      templateUrl: 'js/arethusa.review/templates/review_linker.html'
    };
  }
]);

"use strict";

angular.module('arethusa.review').directive('reviewStats', [
  'review',
  'state',
  function(review, state) {
    return {
      restrict: 'A',
      scope: {},
      link: function(scope, element, attrs) {
        scope.rev = review;
        scope.$watch('rev.diffActive', function(newVal) {
          if (newVal) {
            scope.tokens = review.diffCounts.tokens;
            scope.attrs  = review.diffCounts.attrs;
            var percentage = arethusaUtil.toPercent(state.totalTokens, scope.tokens);
            scope.rgbCode = arethusaUtil.percentToRgb(percentage, 0.3);
          }
        });
      },
      templateUrl: 'js/arethusa.review/templates/review_stats.html'
    };
  }
]);

'use strict';

/* global jsondiffpatch */

angular.module('arethusa.review').service('review', [
  'configurator',
  'state',
  '$rootScope',
  'navigator',
  'plugins',
  function (configurator, state, $rootScope, navigator, plugins) {
    var self = this;
    this.name = "review";

    var retriever;
    var doc;

    this.externalDependencies = [
      "https://cdnjs.cloudflare.com/ajax/libs/jsondiffpatch/0.1.43/jsondiffpatch.min.js"
    ];

    self.goldTokens = {};

    self.defaultConf = {
      link : true,
      contextMenu : true,
      contextMenuTemplate : "js/arethusa.review/templates/context_menu.html"
    };

    function DiffCounts() {
      this.tokens = 0;
      this.attrs  = 0;
    }

    var lazyMorph;
    function morph() {
      if (!lazyMorph) lazyMorph = plugins.get('morph');
      return lazyMorph;
    }

    function configure() {
      configurator.getConfAndDelegate(self, ['hideMode']);
      configurator.getStickyConf(self, ['link', 'autoDiff']);
      self.comparators = [
        'morphology.lemma',
        'morphology.postag',
        'head.id',
        'relation.label'
      ];
      if (self.hideMode) {
        self.contextMenu = false;
        self.autoDiff = false;
        self.link = true;
      }
      var retrievers = configurator.getRetrievers(self.conf.retrievers);
      retriever = retrievers.TreebankRetriever;
      self.diffActive = false;
    }

    function addStyleInfo(tokens) {
      angular.forEach(tokens, function (token, id) {
        var form = token.morphology;
        if (form) {
          morph().postagToAttributes(form);
          token.style = morph().styleOf(form);
        }
      });
    }

    function broadcast() {
      self.diffActive = true;
      $rootScope.$broadcast('diffLoaded');
    }

    self.goToCurrentChunk = function() {
      self.pos = navigator.status.currentPos;
      self.goldTokens = doc[self.pos].tokens;
      addStyleInfo(self.goldTokens);
    };

    function loadDocument() {
      retriever.get(function (res) {
        doc = res;
        postInit(true);
      });
    }


    function extract(obj) {
      return arethusaUtil.inject({}, obj, function(memo, id, token) {
        memo[id] = arethusaUtil.copySelection(token, self.comparators);
      });
    }

    function countDiffs() {
      var dC = self.diffCounts = new DiffCounts();
      angular.forEach(self.diff, function(d) {
        dC.tokens++;
        angular.forEach(d, function(attr) { dC.attrs++; });
      });
    }

    this.compare = function () {
      self.diff = jsondiffpatch.diff(
        extract(state.tokens),
        extract(self.goldTokens)
      );

      countDiffs();

      angular.forEach(self.diff, function (diff, id) {
        state.setState(id, 'diff', diff);
      });
      broadcast();
    };

    function postInit(initialLoad) {
      if (self.link || initialLoad) self.goToCurrentChunk();

      plugins.doAfter('depTree', function() {
        if (self.autoDiff) self.compare();
      });
    }

    this.init = function () {
      configure();

      if (!doc) {
        loadDocument();
      } else {
        postInit();
      }
    };
  }
]);

angular.module('arethusa.review').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('js/arethusa.review/templates/context_menu.html',
    "<div>\n" +
    "  <div\n" +
    "    ng-repeat=\"(cat, diff) in token.diff\"\n" +
    "    review-element=\"cat\"\n" +
    "    diff=\"diff\">\n" +
    "  </div>\n" +
    "  <hr ng-if=\"token.diff\" class=\"small\"/>\n" +
    "</div>\n"
  );


  $templateCache.put('js/arethusa.review/templates/review.html',
    "<div class=\"small-12 columns\" ng-if=\"!plugin.hideMode\">\n" +
    "  <span>\n" +
    "    <span class=\"settings-span-button right\" review-linker/>\n" +
    "    <span>\n" +
    "      <label class=\"margined-hor-tiny right\"> Auto-compare\n" +
    "        <input type=\"checkbox\" ng-model=\"plugin.autoDiff\"/>\n" +
    "      </label>\n" +
    "    </span>\n" +
    "  </span>\n" +
    "</div>\n" +
    "<div review-stats ng-if=\"plugin.diffActive\"/>\n" +
    "<div delimiter/>\n" +
    "<div class=\"small-12 columns\">\n" +
    "  <div ng-class=\"{ 'tree-canvas': !plugin.hideMode }\">\n" +
    "    <div class=\"tree-settings\">\n" +
    "      <span class=\"button radius tiny right\" ng-click=\"plugin.compare()\">Compare</span>\n" +
    "    <div>\n" +
    "    <div\n" +
    "      ng-if=\"!plugin.hideMode\"\n" +
    "      dependency-tree\n" +
    "      tokens=\"plugin.goldTokens\"\n" +
    "      to-bottom\n" +
    "      class=\"full-width\">\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</div>\n"
  );


  $templateCache.put('js/arethusa.review/templates/review_diff_report.html',
    "<div class=\"columns\" ng-repeat=\"(id, diff) in rev.diff\">\n" +
    "  <div\n" +
    "    token=\"id\"\n" +
    "    colorize=\"true\"\n" +
    "    click=\"true\"\n" +
    "    hover=\"true\"\n" +
    "    highlight=\"true\">\n" +
    "  </div>\n" +
    "  <div ng-if=\"!rev.hideMode\">\n" +
    "    <ul class=\"no-list\">\n" +
    "      <li ng-repeat=\"(cat, res) in diff\">\n" +
    "        <div review-element=\"cat\" diff=\"res\"/>\n" +
    "      </li>\n" +
    "    </ul>\n" +
    "  </div>\n" +
    "</div>\n"
  );


  $templateCache.put('js/arethusa.review/templates/review_element_head.html',
    "<div class=\"text\">\n" +
    "  <span class=\"review-el-cat\">{{ cat }}</span>\n" +
    "  <span\n" +
    "    class=\"error-message-dark\"\n" +
    "    token=\"wrong\"\n" +
    "    click=true\n" +
    "    hover=true>\n" +
    "  </span>\n" +
    "  <span margin=\"0 .3rem\">↛</span>\n" +
    "  <span\n" +
    "    class=\"success-message-dark\"\n" +
    "    token=\"right\"\n" +
    "    click=true\n" +
    "    hover=true>\n" +
    "  </span>\n" +
    "</div>\n"
  );


  $templateCache.put('js/arethusa.review/templates/review_element_morphology.html',
    "<div class=\"text\">\n" +
    "  <span class=\"review-el-cat\">{{ cat }}</span>\n" +
    "  <span ng-switch=\"errors.length\">\n" +
    "    <span ng-switch-when=\"1\">\n" +
    "      <span class=\"error-message-dark\">{{ errors[0][0] }}</span>\n" +
    "      <span margin=\"0 .3rem\">↛</span>\n" +
    "      <span class=\"success-message-dark\">{{ errors[0][1] }}</span>\n" +
    "    </span>\n" +
    "    <span ng-switch-when=\"2\">\n" +
    "      <span class=\"error-message-dark\">{{ errors[0][0] }}</span>\n" +
    "      <span margin=\"0 .3rem\">↛</span>\n" +
    "      <span class=\"success-message-dark\">{{ errors[0][1] }}</span>\n" +
    "      <br/>\n" +
    "      <span class=\"review-el-cat\"/>\n" +
    "      <span class=\"error-message-dark\">{{ errors[1][0] }}</span>\n" +
    "      <span margin=\"0 .3rem\">↛</span>\n" +
    "      <span class=\"success-message-dark\">{{ errors[1][1] }}</span>\n" +
    "    </span>\n" +
    "  </span>\n" +
    "</div>\n"
  );


  $templateCache.put('js/arethusa.review/templates/review_element_relation.html',
    "<div class=\"text\">\n" +
    "  <span class=\"review-el-cat\">{{ cat }}</span>\n" +
    "  <span class=\"error-message-dark\">{{ wrong }}</span>\n" +
    "  <span margin=\"0 .3rem\">↛</span>\n" +
    "  <span class=\"success-message-dark\">{{ right }}</span>\n" +
    "</div>\n"
  );


  $templateCache.put('js/arethusa.review/templates/review_linker.html',
    "<span\n" +
    "  class=\"clickable flash-on-hover\"\n" +
    "  ng-click=\"review.link = !review.link\">\n" +
    "  <i class=\"fa fa-{{ icon }}\"></i>\n" +
    "</span>\n"
  );


  $templateCache.put('js/arethusa.review/templates/review_stats.html',
    "<div\n" +
    "  ng-click=\"openStats = !openStats\"\n" +
    "  class=\"small-12 columns text center clickable\"\n" +
    "  style=\"padding: 0.2rem 0; background-color: {{ rgbCode }}\">\n" +
    "  {{ tokens }} tokens and {{ attrs }} attributes with differences\n" +
    "</div>\n" +
    "<div ng-if=\"openStats\" class=\"small-12 columns fade slide-right\">\n" +
    "  <div delimiter/>\n" +
    "  <div review-diff-report/>\n" +
    "</div>\n"
  );

}]);
