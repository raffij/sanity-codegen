(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('regenerator-runtime/runtime')) :
  typeof define === 'function' && define.amd ? define(['exports', 'regenerator-runtime/runtime'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.SanityCodegen = {}));
}(this, (function (exports) { 'use strict';

  function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
    try {
      var info = gen[key](arg);
      var value = info.value;
    } catch (error) {
      reject(error);
      return;
    }

    if (info.done) {
      resolve(value);
    } else {
      Promise.resolve(value).then(_next, _throw);
    }
  }

  function _asyncToGenerator(fn) {
    return function () {
      var self = this,
          args = arguments;
      return new Promise(function (resolve, reject) {
        var gen = fn.apply(self, args);

        function _next(value) {
          asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
        }

        function _throw(err) {
          asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
        }

        _next(undefined);
      });
    };
  }

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);

    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);
      if (enumerableOnly) symbols = symbols.filter(function (sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      });
      keys.push.apply(keys, symbols);
    }

    return keys;
  }

  function _objectSpread2(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i] != null ? arguments[i] : {};

      if (i % 2) {
        ownKeys(Object(source), true).forEach(function (key) {
          _defineProperty(target, key, source[key]);
        });
      } else if (Object.getOwnPropertyDescriptors) {
        Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
      } else {
        ownKeys(Object(source)).forEach(function (key) {
          Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
        });
      }
    }

    return target;
  }

  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
  }

  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }

  function _iterableToArrayLimit(arr, i) {
    if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return;
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"] != null) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }

  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;

    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

    return arr2;
  }

  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  function _createForOfIteratorHelper(o, allowArrayLike) {
    var it;

    if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) {
      if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") {
        if (it) o = it;
        var i = 0;

        var F = function () {};

        return {
          s: F,
          n: function () {
            if (i >= o.length) return {
              done: true
            };
            return {
              done: false,
              value: o[i++]
            };
          },
          e: function (e) {
            throw e;
          },
          f: F
        };
      }

      throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
    }

    var normalCompletion = true,
        didErr = false,
        err;
    return {
      s: function () {
        it = o[Symbol.iterator]();
      },
      n: function () {
        var step = it.next();
        normalCompletion = step.done;
        return step;
      },
      e: function (e) {
        didErr = true;
        err = e;
      },
      f: function () {
        try {
          if (!normalCompletion && it.return != null) it.return();
        } finally {
          if (didErr) throw err;
        }
      }
    };
  }

  function createClient(_ref) {
    var dataset = _ref.dataset,
        projectId = _ref.projectId,
        token = _ref.token,
        _ref$previewMode = _ref.previewMode,
        _previewMode = _ref$previewMode === void 0 ? false : _ref$previewMode,
        fetch = _ref.fetch,
        disabledCache = _ref.disabledCache,
        useCdn = _ref.useCdn;

    var cache = {};
    var previewModeRef = {
      current: _previewMode
    };

    function jsonFetch(_x, _x2) {
      return _jsonFetch.apply(this, arguments);
    }
    /**
     * Given a type string and a document ID, this function returns a typed
     * version of that document.
     *
     * If previewMode is true and a token is provided, then the client will prefer
     * drafts over the published version.
     */


    function _jsonFetch() {
      _jsonFetch = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(url, options) {
        var response;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return fetch(url, _objectSpread2(_objectSpread2({}, options), {}, {
                  headers: _objectSpread2({
                    Accept: 'application/json'
                  }, options === null || options === void 0 ? void 0 : options.headers)
                }));

              case 2:
                response = _context.sent;
                _context.next = 5;
                return response.json();

              case 5:
                return _context.abrupt("return", _context.sent);

              case 6:
              case "end":
                return _context.stop();
            }
          }
        }, _callee);
      }));
      return _jsonFetch.apply(this, arguments);
    }

    function get(_x3, _x4) {
      return _get.apply(this, arguments);
    }
    /**
     * Gets all the documents of a particular type. In preview mode, if a document
     * has a draft, that will be returned instead.
     */


    function _get() {
      _get = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2( // NOTE: type is exclusively for typescript, it's not actually used in code
      _type, id) {
        var preview, previewClause, _yield$query, _yield$query2, result;

        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                if (!(cache[id] && !disabledCache)) {
                  _context2.next = 2;
                  break;
                }

                return _context2.abrupt("return", cache[id]);

              case 2:
                preview = previewModeRef.current && !!token;
                previewClause = preview ? // sanity creates a new document with an _id prefix of `drafts.`
                // for when a document is edited without being published
                "|| _id==\"drafts.".concat(id, "\"") : '';
                _context2.next = 6;
                return query("* [_id == \"".concat(id, "\" ").concat(previewClause, "]"));

              case 6:
                _yield$query = _context2.sent;
                _yield$query2 = _slicedToArray(_yield$query, 1);
                result = _yield$query2[0];

                if (!disabledCache) {
                  cache[id] = result;
                }

                return _context2.abrupt("return", result);

              case 11:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2);
      }));
      return _get.apply(this, arguments);
    }

    function getAll(_x5, _x6) {
      return _getAll.apply(this, arguments);
    }
    /**
     * If a sanity document refers to another sanity document, then you can use this
     * function to expand that document, preserving the type
     */


    function _getAll() {
      _getAll = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(type, filterClause) {
        var ids, idsToFetch, newDocumentList, _iterator, _step, doc;

        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                if (!disabledCache) {
                  _context3.next = 4;
                  break;
                }

                _context3.next = 3;
                return query("* [_type == \"".concat(type, "\"").concat(filterClause ? " && ".concat(filterClause) : '', "]"));

              case 3:
                return _context3.abrupt("return", _context3.sent);

              case 4:
                _context3.next = 6;
                return query("* [_type == \"".concat(type, "\"").concat(filterClause ? " && ".concat(filterClause) : '', "] { _id }"));

              case 6:
                ids = _context3.sent;
                idsToFetch = ids.filter(function (_ref2) {
                  var _id = _ref2._id;
                  return !cache[_id];
                });
                _context3.next = 10;
                return query("* [_id in [".concat(idsToFetch.map(function (_ref3) {
                  var _id = _ref3._id;
                  return "'".concat(_id, "'");
                }).join(', '), "]]"));

              case 10:
                newDocumentList = _context3.sent;
                _iterator = _createForOfIteratorHelper(newDocumentList);

                try {
                  for (_iterator.s(); !(_step = _iterator.n()).done;) {
                    doc = _step.value;
                    cache[doc._id] = doc;
                  }
                } catch (err) {
                  _iterator.e(err);
                } finally {
                  _iterator.f();
                }

                return _context3.abrupt("return", ids.map(function (_ref4) {
                  var _id = _ref4._id;
                  return cache[_id];
                }));

              case 14:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3);
      }));
      return _getAll.apply(this, arguments);
    }

    function expand(_x7) {
      return _expand.apply(this, arguments);
    }
    /**
     * Passes a query along to sanity. If preview mode is active and a token is
     * present, it will prefer drafts over the published versions.
     */


    function _expand() {
      _expand = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(ref) {
        var response;
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _context4.next = 2;
                return get(null, ref._ref);

              case 2:
                response = _context4.sent;
                return _context4.abrupt("return", response);

              case 4:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4);
      }));
      return _expand.apply(this, arguments);
    }

    function query(_x8) {
      return _query.apply(this, arguments);
    }
    /**
     * Clears the in-memory cache. The cache can also be disabled when creating
     * the client
     */


    function _query() {
      _query = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(query) {
        var searchParams, preview, response, prefix, removeDraftPrefix, draftDocs, finalAcc;
        return regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                searchParams = new URLSearchParams();
                preview = previewModeRef.current && !!token;
                searchParams.set('query', query);
                _context5.next = 5;
                return jsonFetch("https://".concat(projectId, ".").concat(useCdn ? 'apicdn' : 'api', ".sanity.io/v1/data/query/").concat(dataset, "?").concat(searchParams.toString()), _objectSpread2({}, preview && {
                  headers: {
                    Authorization: "Bearer ".concat(token)
                  }
                }));

              case 5:
                response = _context5.sent;
                prefix = 'drafts.';

                if (preview) {
                  _context5.next = 9;
                  break;
                }

                return _context5.abrupt("return", response.result.filter(function (doc) {
                  return !doc._id.startsWith(prefix);
                }));

              case 9:
                removeDraftPrefix = function removeDraftPrefix(_id) {
                  return _id.startsWith(prefix) ? _id.substring(prefix.length) : _id;
                }; // create a lookup of only draft docs


                draftDocs = response.result.filter(function (doc) {
                  return doc._id.startsWith('drafts.');
                }).reduce(function (acc, next) {
                  acc[removeDraftPrefix(next._id)] = next;
                  return acc;
                }, {}); // in this dictionary, if there is draft doc, that will be preferred,
                // otherwise it'll use the published version

                finalAcc = response.result.reduce(function (acc, next) {
                  var id = removeDraftPrefix(next._id);
                  acc[id] = draftDocs[id] || next;
                  return acc;
                }, {});
                return _context5.abrupt("return", Object.values(finalAcc));

              case 13:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5);
      }));
      return _query.apply(this, arguments);
    }

    function clearCache() {
      var keys = Object.keys(cache);

      for (var _i = 0, _keys = keys; _i < _keys.length; _i++) {
        var _key = _keys[_i];
        delete cache[_key];
      }
    }
    /**
     * Flip whether or not this client is using preview mode or not. Useful for
     * preview mode within next.js.
     */


    function setPreviewMode(previewMode) {
      previewModeRef.current = previewMode;
    }

    return {
      get: get,
      getAll: getAll,
      expand: expand,
      query: query,
      clearCache: clearCache,
      setPreviewMode: setPreviewMode
    };
  }

  exports.createClient = createClient;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=index.js.map
