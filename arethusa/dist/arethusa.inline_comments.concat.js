'use strict';
angular.module('arethusa.inlineComments', []);
"use strict";

angular.module('arethusa.inlineComments').directive('inlineComment', [
    'state',
    function(state) {
        return {
            restrict: 'A',
            scope: {
                token:"=commentToken"
            },
            link: function(scope, element, attrs) {
                scope.comment = scope.token.comment? scope.token.comment : '';

                function undoFn(tkn, cmt) {
                    var token = tkn;
                    var comment = cmt;
                    return function() {
                        scope.comment = comment;
                        state.change(token,'comment',comment);
                    };
                }

                function preExecFn(cmt) {
                    var comment = cmt;
                    return function() {
                        scope.comment = comment;
                    };
                }

                scope.updateState = function() {
                    if (scope.comment!=scope.token.comment) {
                        state.change(scope.token,'comment',scope.comment,undoFn(scope.token,scope.token.comment),preExecFn(scope.comment));
                    }
                };
            },
            templateUrl: 'js/arethusa.inline_comments/templates/inline_comment.html'
        };
    }
]);

'use strict';
angular.module('arethusa.inlineComments').service('inlineComments', [
    'state',
    'configurator',
    'userPreferences',
    function (state, configurator, userPreferences) {
        var self = this;
        this.name = "inlineComments";

        var props = [
        ];

        function configure() {
            configurator.getConfAndDelegate(self, props);
        }

        this.init = function() {
            configure();
        };
    }
]);
angular.module('arethusa.inlineComments').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('js/arethusa.inline_comments/templates/inline_comment.html',
    "<input type=\"text\" ng-model=\"comment\" ng-blur=\"updateState()\" class=\"no-margin\"/>"
  );

}]);
