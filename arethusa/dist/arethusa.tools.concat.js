angular.module('arethusa.tools', []);

"use strict";

angular.module('arethusa.tools').controller('MorphToolsCtrl', [
  '$scope',
  'plugins',
  'latinAttrs',
  'greekAttrs',
  'configurator',
  'MORPH_IMPORTS',
  '$http',
  '$injector',
  '$q',
  'fileHandler',
  '_',
  function(
    $scope,
    plugins,
    latinAttrs,
    greekAttrs,
    configurator,
    MORPH_IMPORTS,
    $http,
    $injector,
    $q,
    fileHandler,
    _
  ) {
    var EXPORT_FORMS_NAME     = 'arethusa_morph_forms.json';
    var EXPORT_FREQUENCY_NAME = 'arethusa_morph_frequency.json';
    var EXPORT_FILE_ENDING = 'application/json';

    var ATTRS = {
      lat: latinAttrs.data,
      grc: greekAttrs.data
    };

    var USER_ROUTE_PARAMS = {
      headers: {
        'Accept': 'application/json'
      }
    };

    var morph, localStorage, userCache = {};

    var config = configurator.configuration;

    //$scope.files = MORPH_IMPORTS; // online import currently disabled
    $scope.loadCsvFile = loadCsvFile;

    $scope.importFile = importFile;
    $scope.exportFile = exportFile;

    $scope.importFrequencyFile = importFrequencyFile;
    $scope.exportFrequencyFile = exportFrequencyFile;

    init();

    function useLanguage(attr) {
      config.plugins.morph = ATTRS[attr];
      $scope.usedLanguage = attr;
    }

    function init() {
      // Use a starting value so the morph service can load properly
      useLanguage('lat');

      plugins.start(['morph']).then(function() {
        morph = plugins.get('morph');
        localStorage = $injector.get('morphLocalStorage');
        $scope.ready = true;
      });
    }


    function parseOrigin(form, userRoute) {
      var deferred = $q.defer();
      var userName = userCache[userRoute];
      if (userName) {
        deferred.resolve(userName);
      } else {
        $http.get(userRoute, USER_ROUTE_PARAMS).then(function(res) {
          var userName = res.data.name;
          userCache[userRoute] = userName;
          deferred.resolve(userName);
        });
      }
      return deferred.promise;
    }

    function loadFormsFromCsv(data, filter) {
      resetStatus();
      var lines = data.split('\n');
      angular.forEach(lines, function(line, key) {
        // Fields are organized like
        // Form       - Lemma   - Postag   - User
        // Caesaris   - Caesar  - .......  - ....
        var fields = line.split(',');
        var str = fields[0];
        var form = {
          lemma: fields[1],
          postag: fields[2]
        };

        parseOrigin(form, fields[3]).then(function(userName) {
          form.origin = userName;
          morph.postagToAttributes(form);
          if (formNotDuplicate(str, form)) {
            morph.addToLocalStorage(fields[0], form);
            $scope.status.count += 1;
          }
        });
      });
    }

    function formNotDuplicate(str, form) {
      var forms;
      localStorage.retriever.getData(str, function(f) { forms = f; });
      if (forms) {
        return !aU.find(forms, function(otherForm) {
          return localStorage.comparator(form, otherForm);
        });
      }
      return true;
    }

    function resetStatus() {
      var fields = [
        'importForms',
        'exportForms',
        'importFrequency',
        'exportFrequency'
      ];

      $scope.status = _.inject(fields, function(memo, field) {
        memo[field] = { count: null };
        return memo;
      }, {});
    }

    function loadCsvFile(fileObj) {
      $scope.importStarted = true;
      $http.get(fileObj.route).then(function(res) {
        useLanguage(fileObj.language);
        loadFormsFromCsv(res.data);
        $scope.importStarted = false;
      });
    }

    function doImport(setter, cb) {
      resetStatus();
      var imported = 0;
      fileHandler.upload(function(data) {
        _.forEach(data, function(datum, str) {
          imported += localStorage[setter](str, datum);
        });
        cb(data,imported);
        $scope.$digest(); // so that the count can update
      });

    }

    function doExport(fileName, getter, cb) {
      resetStatus();
      var forms = localStorage[getter]();
      fileHandler.download(
        fileName,
        JSON.stringify(forms, null, 2),
        EXPORT_FILE_ENDING
      );

      cb(forms);
    }

    function importFile() {
      doImport('addForms', setFormImportCount);
    }

    function exportFile() {
      doExport(EXPORT_FORMS_NAME, 'getForms', setFormExportCount);
    }

    function exportFrequencyFile() {
      doExport(EXPORT_FREQUENCY_NAME, 'getPreferences', setFrequencyExportCount);
    }

    function importFrequencyFile() {
      doImport('addPreferences', setFrequencyImportCount);

    }

    function setFormExportCount(forms) {
      setCount('exportForms', countForms(forms));
    }

    function setFormImportCount(forms,imported) {
      setCount('importForms', countForms(forms),imported);
    }

    function setFrequencyExportCount(data) {
      setCount('exportFrequency', countFrequencyForms(data));
    }

    function setFrequencyImportCount(data,imported) {
      setCount('importFrequency', countFrequencyForms(data),imported);
    }

    function setCount(type, expected, actual) {
      $scope.status[type].count = actual !== null ? actual : expected;
    }

    function countForms(forms) {
      return _.inject(forms, function(memo, f) {
        memo += f.length;
        return memo;
      }, 0);
    }

    function countFrequencyForms(data) {
      return _.inject(data, function(memo, v, _) {
        memo += v.split(localStorage.delimiters.preference).length;
        return memo;
      }, 0);
    }
  }
]);

"use strict";

angular.module('arethusa.tools').constant('MORPH_IMPORTS', [
  {
    name: 'Latin Morphology',
    language: 'lat',
    route: '...'
  },
  {
    name: 'Greek Morphology',
    language: 'grc',
    route: '...'
  },
  {
    name: 'Test Data from Vanessa',
    language: 'grc',
    route: 'http://www.perseids.org/morph/masterlocal.csv'
  }
]);

angular.module('arethusa.tools').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('js/arethusa.tools/templates/morph_tools.html',
    "<div class=\"row\">\n" +
    "  <h3>Arethusa Morph Tools</h3>\n" +
    "\n" +
    "  <div class=\"morph-tools-form-import\">\n" +
    "    <div class=\"fade\" ng-if=\"ready\">\n" +
    "      <ul>\n" +
    "        <li ng-repeat=\"file in files\">\n" +
    "          <a ng-click=\"loadCsvFile(file)\">{{ file.name }}</a>\n" +
    "        </li>\n" +
    "      </ul>\n" +
    "    </div>\n" +
    "\n" +
    "    <div>\n" +
    "      <button class=\"small rounded\" ng-click=\"importFile()\">\n" +
    "        Import forms from file\n" +
    "      </button>\n" +
    "      <button class=\"small rounded\" ng-click=\"exportFile()\">\n" +
    "        Export forms to file\n" +
    "      </button>\n" +
    "    </div>\n" +
    "\n" +
    "    <div ng-if=\"status.importForms.count != null\">\n" +
    "      {{ status.importForms.count}} forms successfully imported!\n" +
    "    </div>\n" +
    "\n" +
    "    <div ng-if=\"status.exportForms.count\">\n" +
    "      {{ status.exportForms.count}} forms successfully exported!\n" +
    "    </div>\n" +
    "\n" +
    "    <div ng-if=\"importStarted\" style=\"color: green\">\n" +
    "      Processing import...\n" +
    "    </div>\n" +
    "  </div>\n" +
    "\n" +
    "  <div class=\"morph-tools-frequency-import\">\n" +
    "    <div>\n" +
    "      <button class=\"small rounded\" ng-click=\"importFrequencyFile()\">\n" +
    "        Import frequency data from file\n" +
    "      </button>\n" +
    "      <button class=\"small rounded\" ng-click=\"exportFrequencyFile()\">\n" +
    "        Export frequency data to file\n" +
    "      </button>\n" +
    "    </div>\n" +
    "\n" +
    "    <div ng-if=\"status.importFrequency.count != null\">\n" +
    "      {{ status.importFrequency.count}} forms successfully imported!\n" +
    "    </div>\n" +
    "\n" +
    "    <div ng-if=\"status.exportFrequency.count\">\n" +
    "      {{ status.exportFrequency.count}} forms successfully exported!\n" +
    "    </div>\n" +
    "\n" +
    "  </div>\n" +
    "</div>\n"
  );

}]);
