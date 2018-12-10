'use strict';

// This whole plugin is currently unused and out of date

angular.module('arethusa.exercise', [
  'arethusa.morph'
]);

'use strict';
angular.module('arethusa.exercise').directive('fillInTheBlankForm', function () {
  return {
    restrict: 'A',
    scope: true,
    link: function (scope, element, attrs) {
      scope.validatedClass = function () {
        var rep = scope.plugin.report;
        if (rep) {
          if (rep.tokens[scope.id].correct) {
            return 'right-answer';
          } else {
            return 'wrong-answer';
          }
        }
      };
    },
    templateUrl: 'js/arethusa.exercise/templates/fill_in_the_blank_form.html'
  };
});
'use strict';
angular.module('arethusa.exercise').service('fillInTheBlank', [
  'configurator',
  'morph',
  'state',
  function (configurator, morph, state) {
    var self = this;
    function configure() {
      configurator.getConfAndDelegate('fillInTheBlank', self);
      self.started = false;
      self.answers = {};
    }
    configure();
    function createExercise() {
      return arethusaUtil.inject({}, state.tokens, function (memo, id, token) {
        var morph = token.morphology.attributes;
        if (morph && morph.pos == 'verb' && morph.mood) {
          var lemma = token.morphology.lemma.replace(/\d/g, '');
          memo[id] = {
            hint: lemma,
            answer: token.string,
            token: token
          };
        }
      });
    }
    this.hintFor = function (id) {
      return self.exercises[id].hint;
    };
    this.isExerciseTarget = function (id) {
      return id in self.exercises;
    };
    this.validate = function () {
      var result = {
          tokens: {},
          correct: 0,
          wrong: 0
        };
      angular.forEach(self.exercises, function (ex, id) {
        var obj = {};
        var answer = ex.answer;
        var input = self.answers[id];
        if (answer == input) {
          result.correct++;
          obj.correct = true;
        } else {
          result.wrong++;
          obj.correct = false;
          obj.answer = answer;
          obj.input = input ? input : 'nothing';
        }
        result.tokens[id] = obj;
      });
      self.report = result;
      return result;
    };
    this.init = function () {
      configure();
      delete self.report;
      self.exercises = createExercise();
    };
  }
]);

'use strict';
angular.module('arethusa.exercise').service('instructor', [
  'fillInTheBlank',
  'configurator',
  function (fillInTheBlank, configurator) {
    var self = this;
    function configure() {
      configurator.getConfAndDelegate('instructor', self);
    }
    configure();
    this.start = function () {
      self.startedAt = new Date();
      fillInTheBlank.started = true;
      self.started = true;
    };
    this.stop = function () {
      self.stoppedAt = new Date();
      self.started = false;
      self.report = fillInTheBlank.validate();
      self.time = self.timeElapsedFormatted();
      self.done = true;
    };
    this.timeElapsed = function () {
      return Math.round(self.stoppedAt - self.startedAt);
    };
    var aU = arethusaUtil;
    this.timeElapsedFormatted = function () {
      var t = Math.round(self.timeElapsed() / 1000);
      var minutes = t / 60;
      var seconds = t % minutes;
      return aU.formatNumber(minutes, 2) + ':' + aU.formatNumber(seconds, 2);
    };
    function reset() {
      self.done = false;
      self.startedAt = false;
      self.stoppedAt = false;
      self.report = {};
    }
    this.init = function () {
      configure();
      reset();
    };
  }
]);
angular.module('arethusa.exercise').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('js/arethusa.exercise/templates/fill_in_the_blank.html',
    "<div class=\"small-12 columns small-text-center\" ng-hide=\"plugin.started\">\n" +
    "  <em>Read the instructions and hit start when you're ready</em>\n" +
    "</div>\n" +
    "\n" +
    "<div class=\"small-12 columns\" ng-show=\"plugin.started\">\n" +
    "  <p class=\"text-justify\">\n" +
    "  <span ng-repeat=\"(id, token) in state.tokens\">\n" +
    "    <span ng-if=\"plugin.isExerciseTarget(id)\">\n" +
    "      <span fill-in-the-blank-form></span>\n" +
    "      <span class=\"note\"><em>({{ plugin.hintFor(id) }})</em></span>\n" +
    "    </span>\n" +
    "    <span ng-if=\"! plugin.isExerciseTarget(id)\"\n" +
    "      hover=\"true\"\n" +
    "      token=\"token\">\n" +
    "    </span>\n" +
    "    <br ng-if=\"aU.isTerminatingPunctuation(token.string)\"/>\n" +
    "  </span>\n" +
    "  </p>\n" +
    "</div>\n"
  );


  $templateCache.put('js/arethusa.exercise/templates/fill_in_the_blank_form.html',
    "<input\n" +
    "  class=\"inline-form\"\n" +
    "  ng-class=\"validatedClass()\"\n" +
    "  type=\"text\"\n" +
    "  ng-model=\"plugin.answers[id]\">\n" +
    "</input>\n"
  );


  $templateCache.put('js/arethusa.exercise/templates/instructor.html',
    "<div class=\"small-text-center\">\n" +
    "  <em>Fill in the blanks!</em>\n" +
    "</div>\n" +
    "\n" +
    "<div style=\"margin-top: 2em\" class=\"small-text-center\">\n" +
    "  <button class=\"tiny radius\" ng-click=\"plugin.start()\" ng-show=\"! plugin.started\">Start</button>\n" +
    "  <button class=\"tiny radius\" ng-click=\"plugin.stop()\" ng-show=\"plugin.started\">Stop</button>\n" +
    "</div>\n" +
    "\n" +
    "\n" +
    "<div style=\"margin-top: 2em\" class=\"small-text-center\" ng-if=\"plugin.done\">\n" +
    "  <div class=\"small-12 columns\">\n" +
    "    <span class=\"small-3 columns note\">\n" +
    "      <span class=\"right\">Time elapsed</span>\n" +
    "    </span>\n" +
    "    <span class=\"small-9 columns end\">\n" +
    "      <span class=\"left\">{{ plugin.time }}</span>\n" +
    "    </span>\n" +
    "  </div>\n" +
    "</div>\n" +
    "\n" +
    "<div class=\"small-text-center\" style=\"margin-top: 20px\" ng-if=\"plugin.done\">\n" +
    "  <div style=\"margin-top: 20px\" class=\"small-12 columns\">\n" +
    "    <span class=\"small-3 columns note\">\n" +
    "      <span class=\"right right-answer\">Right answers</span>\n" +
    "    </span>\n" +
    "    <span class=\"small-9 columns end\">\n" +
    "      <span class=\"left\">{{ plugin.report.correct }}</span>\n" +
    "    </span>\n" +
    "  </div>\n" +
    "  <div class=\"small-12 columns\">\n" +
    "    <span class=\"small-3 columns note\">\n" +
    "      <span class=\"right wrong-answer\">Wrong answers</span>\n" +
    "    </span>\n" +
    "    <span class=\"small-9 columns end\">\n" +
    "      <span class=\"left\">{{ plugin.report.wrong }}</span>\n" +
    "    </span>\n" +
    "  </div>\n" +
    "</div>\n" +
    "<div style=\"margin-top: 30px\" class=\"small-12 columns\">\n" +
    "  <ul>\n" +
    "    <li ng-repeat=\"token in plugin.report.tokens\" ng-if=\"! token.correct\">\n" +
    "      Right answer is {{ token.answer }}, you had {{ token.input }}\n" +
    "    </li>\n" +
    "  </ul>\n" +
    "</div>\n"
  );

}]);
