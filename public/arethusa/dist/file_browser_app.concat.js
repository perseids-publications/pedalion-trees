'use strict';

angular.module('fileBrowserApp', [
  'ngRoute',
  'jsTree.directive'
])
.config([
  '$routeProvider',
  function($routeProvider) {
    $routeProvider.
    when('/', {
      templateUrl: '/server/browser/templates/home.html',
      controller: 'BrowserController'
    }).
    otherwise({
      redirectTo: '/'
    });
  }
]);


'use strict';

angular.module('fileBrowserApp').controller('BrowserController', [
  '$scope',
  'FetchFileFactory',
  function($scope, FetchFileFactory) {
    function isTreebank(node) {
      return node.id.match(/examples\/data\/treebanks\/.*\.xml$/);
    }

    function generateTreebankLink(node) {
      var base = '../app/#/staging?doc=';
      var docId = node.id.match(/treebanks\/(.*)\.xml/)[1];

      $scope.arethusaHref = base + docId;
    }

    function unsetTreebankLink() {
      $scope.arethusaHref = undefined;
    }

    var placeholder = 'Please select a file to view its contents';

    function toggleHighlighting(bool) {
      $scope.syntaxHighlighting = bool;
    }

    function checkHighlighting(file) {
      if (file.length < 50000) {
        toggleHighlighting(true);
      } else {
        toggleHighlighting(false);
      }
    }

    function checkForTreebankLink(node) {
      if (isTreebank(node)) {
        generateTreebankLink(node);
      } else {
        unsetTreebankLink();
      }
    }

    function fetchFile(file) {
      FetchFileFactory.fetchFile(file).then(function(data) {
        var _d = data.data;
        if (typeof _d == 'object') {
          //http://stackoverflow.com/a/7220510/1015046//
          _d = JSON.stringify(_d, undefined, 2);
        }
        $scope.fileViewer = _d;
        checkHighlighting(_d);
      });
    }

    function fetchStats(file) {
      FetchFileFactory.fetchStats(file).then(function(res) {
        $scope.fileStats = res.data;
      });
    }

    $scope.fileViewer = placeholder;

    $scope.nodeSelected = function(e, data) {
      var node = data.node;
      var _l = node.li_attr;

      if (_l.isLeaf) {
        fetchFile(_l.base);
        checkForTreebankLink(node);
      } else {
        //http://jimhoskins.com/2012/12/17/angularjs-and-apply.html//
        $scope.$apply(function() {
          toggleHighlighting(false);
          $scope.fileViewer = placeholder;
        });
      }
      fetchStats(_l.base);
    };
  }
]);

'use strict';

angular.module('fileBrowserApp').filter('bytes', [
  function () {
    return function(bytes, precision) {
      if (bytes === 0) {
        return '0 B';
      }

      if (isNaN(parseFloat(bytes)) || !isFinite(bytes)) {
        return '-';
      }

      var isNegative = bytes < 0;
      if (isNegative) {
        bytes = -bytes;
      }

      if (typeof precision === 'undefined') {
        precision = 1;
      }

      var units = ['B', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
      var exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
      var number = (bytes / Math.pow(1024, Math.floor(exponent))).toFixed(precision);

      return (isNegative ? '-' : '') +  number +  ' ' + units[exponent];
    };
  }
]);

'use strict';

angular.module('fileBrowserApp').factory('FetchFileFactory', ['$http',
  function($http) {
    var _factory = {};

    var apiPath = '/browse/api';

    function getResource(path, file) {
      return $http.get(apiPath + '/' + path + '?resource=' + encodeURIComponent(file));
    }

    _factory.fetchFile = function(file) {
      return getResource('resource', file);
    };

    _factory.fetchStats = function(file) {
      return getResource('stats', file);
    };

    _factory.moveFile = function(oldName, newName) {
      return $http.post(apiPath + '/' + 'move', {
        old: oldName,
        new: newName
      });
    };

    return _factory;
  }
]);

'use strict';

angular.module('fileBrowserApp').directive('fileStats', [
  function() {
    return {
      restrict: 'A',
      scope: {
        stats: '=fileStats'
      },
      template: '' +
        '<span ng-if="stats">' +
          '{{ stats.size | bytes }}, last modified at {{ stats.mtime | date: "medium" }}' +
        '</span>'
    };
  }
]);

'use strict';

/* global prettyPrint */

angular.module('fileBrowserApp').directive('prettyPrint', [
  '$timeout',
  '$compile',
  function($timeout, $compile) {
    return {
      restrict: 'A',
      scope: {
        on: '=prettyPrint',
        content: '='
      },
      link: function(scope, element, attrs) {
        var template = '<code ng-class="{ prettyprint: on }">{{ content }}</code>';

        function update(newVal, oldVal) {
          if (newVal !== oldVal) {
            element.empty();
            element.append($compile(template)(scope));
            if (scope.on) $timeout(prettyPrint);
          }
        }

        scope.$watch('content', update);
        scope.$watch('on', update);

        update(true, false); // run once on init
      }
    };
  }
]);
