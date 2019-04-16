/**
 * @ngdoc overview
 * @name arethusa.util
 *
 * @description
 * Module of Arethusa's utility services
 */
angular.module('arethusa.util', []);

'use strict';
// Provides the global arethusaUtil object which comes with several
// utility functions
var arethusaUtil = {
    formatNumber: function (number, length) {
      // check if number is valid, otherwise return
      var parsed = parseInt(number, 10);
      if (isNaN(parsed)) {
        return number;
      } else {
        // coerce a fixnum to a string
        var n = '' + parsed;
        while (n.length < length) {
          n = '0' + n;
        }
        return n;
      }
    },

    formatKeyHint: function(mapping) {
      return mapping ? '(' + mapping +')' : '';
    },

    map: function (container, fn, args) {
      if (typeof fn === 'object') {
        var obj = fn;
        fn = function(el) { return obj[el]; };
      }

      if (typeof fn === 'string') {
        var str = fn;
        fn = function(el) { return el[str]; };
      }
      var result = [];
      container.forEach(function (e) {
        if (args) {
          var myArgs = [e];
          myArgs.push(args.slice(0));
          result.push(fn.apply(null,myArgs));
        } else {
          result.push(fn(e));
        }
      });
      return result;
    },

    inject: function (memo, container, fn) {
      if (arethusaUtil.isArray(container)) {
        container.forEach(function (el) {
          fn(memo, el);
        });
      } else {
        for (var key in container) {
          fn(memo, key, container[key]);
        }
      }
      return memo;
    },

    flatten: function(arr) {
      var res = [];
      for (var i = 0; i < arr.length; i ++) {
        var el = arr[i];
        if (el || el === false) res.push(el);
      }
      return res;
    },

    pushAll: function (target, pusher) {
      target.push.apply(target, pusher);
      return target;
    },

    findObj: function (object, fn) {
      for (var key in object) {
        if (object.hasOwnProperty(key)) {
          var val = object[key];
          if (fn(val)) {
            return val;
          }
        }
      }
    },

    findNestedProperties: function (nestedObj, properties) {
      var props = arethusaUtil.toAry(properties);
      return arethusaUtil.inject({}, props, function (memo, targetKey) {
        var fn = function (obj, key) {
          var res = [];
          if (obj.hasOwnProperty(key)) {
            res.push(obj);
          }
          for (var k in obj) {
            var v = obj[k];
            if (typeof v == 'object' && (v = fn(v, key))) {
              arethusaUtil.pushAll(res, v);
            }
          }
          return res;
        };
        memo[targetKey] = fn(nestedObj, targetKey);
      });
    },

    isArray: function (obj) {
      return Object.prototype.toString.call(obj) === '[object Array]';
    },

    toAry: function (el) {
      if (!el) return [];

      if (arethusaUtil.isArray(el)) {
        return el;
      } else {
        return [el];
      }
    },

    intersect: function(a, b) {
      var t; // temp
      if (a.length < b.length) {
        t = b;
        b = a;
        a = t;
      }
      function isIncluded(el) { return arethusaUtil.isIncluded(b, el); }
      return a.filter(isIncluded);
    },

    isIncluded: function(arr, el) {
      return arr.indexOf(el) !== -1;
    },

    empty: function(obj) {
      if (arethusaUtil.isArray(obj)) {

        obj.splice(0, obj.length);
      } else {
        for (var key in obj) {
          if (obj.hasOwnProperty(key)) {
            delete obj[key];
          }
        }
      }
    },

    last: function(arr) {
      return arr[arr.length - 1];
    },

    replaceAt: function (str, i, replacement) {
      return str.substring(0, i) + replacement + str.substring(i + 1);
    },

    isTerminatingPunctuation: function (str) {
      return str.match(/^[\.;:]$/);
    },

    /* global X2JS */
    xmlParser: new X2JS(),

    xml2json: function (xml) {
      return arethusaUtil.xmlParser.xml_str2json(xml);
    },

    json2xml: function(json) {
      return arethusaUtil.xmlParser.json2xml_str(json);
    },

    // Taken from https://gist.github.com/sente/1083506
    formatXml: function (xml) {
      var formatted = '';
      var lastNode = '';
      var appendedToLastNode;
      var reg = /(>)(<)(\/*)/g;
      xml = xml.toString().replace(reg, '$1\r\n$2$3');
      var pad = 0;
      var nodes = xml.split('\r\n');
      for(var n in nodes) {
        var node = nodes[n];
        var indent = 0;
        if (node.match(/.+<\/\w[^>]*>$/)) {
          indent = 0;
        } else if (node.match(/^<\/\w/)) {
          if (pad !== 0) {
            pad -= 1;
          }
        } else if (node.match(/^<\w[^>]*[^\/]>.*$/)) {
          indent = 1;
        } else {
          indent = 0;
        }

        var padding = '';
        for (var i = 0; i < pad; i++) {
          padding += '  ';
        }

        appendedToLastNode = false;
        var closingTag = node.match(/<\/(\w*)>/, '$1');
        if (closingTag) {
          var tag = closingTag[1];
          var regexp = new RegExp('<' + tag);
          if (lastNode.match(regexp)) {
            formatted = formatted.substring(0, formatted.length - 3) + '/>\r\n';
            appendedToLastNode = true;
          }
        }

        if (!appendedToLastNode) {
          formatted += padding + node + '\r\n';
        }

        lastNode = node;
        pad += indent;
      }
      return formatted;
    },

    getProperty: function(obj, getter) {
      var props = getter.split('.');
      for (var i = 0; i  < props.length; i ++) {
        obj = obj[props[i]];
        if (!obj) break;
      }
      return obj;
    },

    setProperty: function(obj, propertyPath, value) {
      var props = propertyPath.split('.');
      var lastProp = props.pop();
      for (var i = 0; i  < props.length; i ++) {
        var prop = props[i];
        var next = obj[prop];
        if (next) {
          obj = next;
        } else {
          obj = obj[prop] = {};
        }
      }
      obj[lastProp] = value;
    },

    copySelection: function(obj, getters){
      var newVal;
      return arethusaUtil.inject({}, getters, function(memo, el) {
        newVal = arethusaUtil.getProperty(obj, el);
        if (angular.isObject(newVal)) newVal = angular.copy(newVal);
        arethusaUtil.setProperty(memo, el, newVal);
      });
    },

    percentToRgb: function(percent, saturation) {
      var h = Math.floor((100 - percent) * 120/ 100);
      var s = saturation || 1, v = 1;

      var rgb, i, data = [];
      h = h / 60;
      i = Math.floor(h);
      data = [v*(1-s), v*(1-s*(h-i)), v*(1-s*(1-(h-i)))];
      switch(i) {
        case 0:
          rgb = [v, data[2], data[0]]; break;
        case 1:
          rgb = [data[1], v, data[0]]; break;
        case 2:
          rgb = [data[0], v, data[2]]; break;
        case 3:
          rgb = [data[0], data[1], v]; break;
        case 4:
          rgb = [data[2], data[0], v]; break;
        default:
          rgb = [v, data[0], data[1]]; break;
      }

      return '#' + rgb.map(function(x){
        return ("0" + Math.round(x*255).toString(16)).slice(-2);
      }).join('');
    },

    toPercent: function(total, part){
      return (part / total) * 100;
    },

    resolveFn: function(deferred) {
      return function() { deferred.resolve(); };
    },

    rejectFn: function(deferred) {
      return function() { deferred.reject(); };
    },

    isArethusaMainApplication: function() {
      var ngApp = document.querySelector('html').attributes['ng-app'];
      return ngApp && ngApp.value == 'arethusa';
    },

    isUrl: function(str) {
      return str.match(/^https?:\/\//);
    },

    capitalize: function(str) {
      return str[0].toUpperCase() + str.slice(1);
    },

    find: function(arr, fn) {
      var res;
      for (var i=0; i < arr.length; i++) {
        var el = arr[i];
        if (fn(el)) {
          res = el;
          break;
        }
      }
      return res;
    },

    unique: function(arr, fn) {
      var unique = [];
      for (var i = 0; i  < arr.length; i ++) {
        var el = arr[i];
        var isUnique = true;
        for (var oI = arr.length - 1; oI >= i + 1; oI--){
          var otherEl = arr[oI];
          if (fn(el, otherEl)) {
            isUnique = false;
            break;
          }
        }
        if (isUnique) unique.push(el);
      }
      return unique;
    }
  };

  var aU = arethusaUtil;

"use strict";

/**
 * @ngdoc service
 * @name arethusa.util.commons
 *
 * @description
 * Provides several constructors for commonly used classes in Arethusa.
 *
 */

angular.module('arethusa.util').service('commons', [
  function ArethusaClasses() {
    // Used to define plugin settings
    function Setting(label, model, changeOrDirective) {
      this.label = label;
      this.model = model;
      if (angular.isFunction(changeOrDirective)) {
        this.change = changeOrDirective;
      } else {
        // comment from @balmas: I'm not sure but I think this 
        // leverages the {@link arethusa.core.directives#dynamicDirective}
        // functionality to create a dumb directive which just sets the 
        // new value on the model.
        this.directive = changeOrDirective;
      }
    }


    /**
     * @ngdoc function
     * @name arethusa.util.commons#setting
     * @methodOf arethusa.util.commons
     *
     * @description
     * Creates a new {@link arethusa.util.commons.Setting} object
     *
     * @param {String} l the name of the seeting
     * @param {String} m the name of the model object
     * @param {Function} c optional callback function to be called when 
     *   the setting is changed.
     */
    this.setting = function(l, m, c) { return new Setting(l, m, c); };


    function Doc(xml, json, conf) {
      this.xml = xml;
      this.json = json;
      this.conf = conf;
    }

    /**
     * @ngdoc function
     * @name arethusa.util.commons#doc
     * @methodOf arethusa.util.commons
     *
     * @description
     * Returns a new Arethusa document.
     *
     * Retrievers should use this constructor for all documents they want to
     * save inside the {@link arethusa.core.documentStore documentStore}.
     *
     * Either `xml` or `json` are mandatory, but both can be present.
     *
     * @param {String} xml XML representation of a document.
     * @param {Object} json JSON represenation of a document.
     * @param {Object} conf Additional configuration files specified in the document.
     *   Should contain configuration names as keys and paths to the files as values.
     *
     */
    this.doc = function(x, j, c) { return new Doc(x, j, c); };

    // Used by retrievers to define sentences
    function Sentence(tokens, cite) {
      var self = this;

      this.tokens = tokens;
      this.cite = cite || '';

      this.toString = function() {
        return arethusaUtil.inject([], self.tokens, function(memo, id, token) {
          memo.push(token.string);
        }).join(' ');
      };
    }

    /**
     * @ngdoc function
     * @name arethusa.util.commons#doc
     * @methodOf arethusa.util.commons
     *
     * @description
     * TODO
     *
     */
    this.sentence = function(t, cite) { return new Sentence(t, cite); };

    // Used by retrievers to define constituents
    function Constituent(cl, role, id, sentenceId, parentId) { // might want to add more here
      this.class = cl;
      this.role = role;
      this.id = id;
      this.sentenceId = sentenceId;
      this.parent = parentId;

      this.isConstituent = true;
    }

    /**
     * @ngdoc function
     * @name arethusa.util.commons#constituent
     * @methodOf arethusa.util.commons
     *
     * @description
     * TODO
     *
     */
    this.constituent = function(c, r, i, sId, h) { return new Constituent(c, r, i, sId, h); };

    /**
     * @ngdoc function
     * @name arethusa.util.commons#token
     * @methodOf arethusa.util.commons
     *
     * @description
     * TODO
     *
     */
    function Token(string, sentenceId) {
      this.string = string;
      this.sentenceId = sentenceId;

      this.isToken = true;
    }

    this.token = function (s, sentenceId) { return new Token(s, sentenceId); };
  }
]);

"use strict";

// Generators for Arethusa code for things such as
// - useful directives

angular.module('arethusa.util').service('generator', [
  function ArethusaGenerator() {
    this.panelTrigger = function (conf) {
      return {
        restrict: 'A',
        compile: function(element) {
          var hint;

          function updateTitle(translation) {
            var title = translation();
            if (hint) title += ' (' + hint + ')';
            element.attr('title', title);
          }

          return function link(scope, element, attrs) {
            function executeToggle() {
              element.toggleClass('on');
              conf.service.toggle();
            }

            function toggle() {
              // Need to check for a running digest. When we trigger this
              // function through a hotkey, the keyCapture service will
              // have launched a digest already.
              if (scope.$$phase) {
                executeToggle();
              } else {
                scope.$apply(executeToggle);
              }
            }

            conf.trsl(conf.trslKey, updateTitle);

            element.bind('click', toggle);

            if (conf.kC) {
              var keys = conf.kC.initCaptures(function(kC) {
                var mapping = {};
                mapping[conf.mapping.name] = [
                  kC.create('toggle', function() { toggle(); }, conf.mapping.key)
                ];
                return mapping;
              });

              hint = keys[conf.mapping.name].toggle;
            }
          };
        },
        template: conf.template
      };
    };

    this.historyTrigger = function (history, translator, type, icon) {
      // type is either undo or redo
      icon = icon || type;
      return {
        restrict: 'A',
        scope: {},
        link: function(scope, element, attrs) {
          scope.history = history;

          scope.$watch('history.mode', function(newVal, oldVal) {
            if (newVal === 'editor') {
              element.show();
            } else {
              element.hide();
            }
          });

          scope.$watch('history.can' + aU.capitalize(type), function(newVal, oldVal) {
            if (newVal) {
              element.removeClass('disabled');
            } else {
              element.addClass('disabled');
            }
          });

          element.bind('click', function() {
            scope.$apply(history[type]());
          });


          var trsl, hint;

          scope.$watch('history.activeKeys.' + type, function(key) {
            if (key) {
              hint = aU.formatKeyHint(key);
              setTitle();
            }
          });

          translator('history.' + type, function(translation) {
            trsl = translation();
            setTitle();
          });

          function setTitle() {
            element.attr('title', trsl + ' ' + hint);
          }
        },
        template: '<i class="fa fa-' + icon + '"/>'
      };
    };
  }
]);


'use strict';
/* global console */

/**
 * @ngdoc service
 * @name arethusa.util.logger
 *
 * @description
 * Simple logging wrapper.
 *
 */
angular.module('arethusa.util').service('logger', [
  function() {
    /**
     * @ngdoc function
     * @name arethusa.util.logger#log
     * @methodOf arethusa.util.logger
     *
     * @description
     * Wrapper around `console.log`
     *
     * @param {String} msg Message to log
     *
     */
    this.log = function(msg) {
      console.log(msg);
    };
  }
]);
