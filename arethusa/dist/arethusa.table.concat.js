angular.module('arethusa.table', []);
'use strict';
angular.module('arethusa.table').directive('morphSelector',[
    'state',
    'morph',
    function (state, morph) {
        return {
            restrict: 'A',
            scope: {
                token: "=morphToken"
            },
            link: function(scope, element, attrs) {
                scope.analyses = morph.analyses[scope.token.id].forms;
                scope.form = scope.token.morphology;

                scope.longForm = function(form) {
                    var longPostag = morph.concatenatedAttributes(form);/*Object.keys(form.attributes).filter(function(k) {
                        return /[A-Za-z0-9]/.test(form.attributes[k]);
                    }).map(function(k) {
                        return morph.longAttributeValue(k,form.attributes[k]);
                    }).join('-');*/
                    var lemma = form.lemma;
                    return lemma + ':' + longPostag;
                };

                function undoFn(tkn, frm) {
                    var token = tkn;
                    var form = frm;
                    return function() {
                        scope.form = form;
                        state.change(token.id,'morphology',form);
                    };
                }

                function preExecFn(frm) {
                    var form = frm;
                    return function() {
                        scope.form = form;
                    };
                }
                
                scope.onChange = function() {
                    state.change(scope.token.id, 'morphology', scope.form, undoFn(scope.token,scope.token.morphology), preExecFn(scope.form));
                };

            },
            template: '<select class="no-margin compact" ng-model="form" ng-options="analysis as longForm(analysis) for analysis in analyses" ng-change="onChange()"></select>'
        };
}]);

'use strict';
angular.module('arethusa.table').service('table', [
    '$rootScope',
    '$modal',
    'state',
    'configurator',
    'navigator',
    'keyCapture',
    'commons',
    'userPreferences',
    'morph',
    function ($rootScope, $modal, state, configurator, navigator, keyCapture, commons, userPreferences, morph) {
        var self = this;
        this.name = "table";

        var props = [
        ];

        function configure() {
            configurator.getConfAndDelegate(self, props);
        }

        this.getTokens = function() {
            return state.tokens;
        };

        this.getAnalyses = function(id) {
            return morph.analyses[id];
        };

        this.openCreate = function(id) {
            $rootScope.morphcreateform = {id:id,token:self.getAnalyses(id)};
            $modal.open({
                template: "<morph-form-create morph-token='$root.morphcreateform.token' morph-id='$root.morphcreateform.id'></morph-form-create>"
            });
        };

        this.init = function() {
            configure();
        };
    }
]);

angular.module('arethusa.table').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('js/arethusa.table/templates/table.html',
    "<table lang-specific>\n" +
    "    <tr>\n" +
    "        <th translate=\"table.id\"></th>\n" +
    "        <th translate=\"table.word\"/>\n" +
    "        <th translate=\"table.head\"/>\n" +
    "        <th translate=\"table.relation\"/>\n" +
    "        <th translate=\"table.morph\"/>\n" +
    "        <th translate=\"table.new\"/>\n" +
    "        <th translate=\"table.comment\"/>\n" +
    "    </tr>\n" +
    "  <tr ng-repeat=\"token in plugin.getTokens()\">\n" +
    "      <td>{{token.id}}</td>\n" +
    "      <td>\n" +
    "        <span\n" +
    "            token=\"token\"\n" +
    "            colorize=\"true\"\n" +
    "            click=\"true\"\n" +
    "            hover=\"true\"\n" +
    "            highlight=\"true\">\n" +
    "        </span>\n" +
    "      </td>\n" +
    "      <td>{{token.head.id}}</td>\n" +
    "      <td><div label-selector obj=\"token.relation\"/></td>\n" +
    "      <td>\n" +
    "          <div morph-selector morph-token=\"token\"></div>\n" +
    "      </td>\n" +
    "      <td>\n" +
    "          <button ng-click=\"plugin.openCreate(token.id)\" class=\"tiny no-margin\" translate=\"table.add\"></button>\n" +
    "          <!--morph-form-create morph-token=\"plugin.getAnalyses(token.id)\" morph-id=\"token.id\"></morph-form-create-->\n" +
    "      </td>\n" +
    "      <td>\n" +
    "          <div inline-comment comment-token=\"token\"></div>\n" +
    "      </td>\n" +
    "  </tr>\n" +
    "</table>"
  );

}]);
