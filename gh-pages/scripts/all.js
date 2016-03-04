(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * Created by k_zenchyk on 2/28/16.
 */
'use strict';

angular.module('gmapApp', ['leaflet-directive']);

},{}],2:[function(require,module,exports){
/**
 * Created by k_zenchyk on 2/28/16.
 */

angular.module('gmapApp').controller('gmapController', ['$scope', 'gmapService', function ($scope, gmapService) {
    var vm = this;
    vm.markers = [];
    $scope.markers = [];

    vm.params = {
        items_on_page: 100,
        only_with_salary: true,
        area: 1002,
        isMap: true,
        bottom_left_lat: 53.885532714289496,
        bottom_left_lng: 27.294241465367065,
        top_right_lat: 53.9153377954745,
        top_right_lng: 27.73369459036706
    };

    $scope.expSelected = {
        name: "Not selected"
    };
    $scope.emplSelected = {
        name: "Not selected"
    };
    $scope.shSelected = {
        name: "Not selected"
    };
    $scope.currSelected = {
        name: "Not selected"
    };

    setMap();

    gmapService.getSearchParam().then(callbackDict, error);

    function success(response) {
        vm.vac = response.data.items;
        console.log('vac', vm.vac);
        return vm.vac;
    }
    function error(response) {
        console.log("Error: " + response.status + " " + response.statusText);
    }

    function getVacancyWithAddress(arr) {
        vm.res = arr.filter(function (item) {
            if (item.address) {
                return item;
            }
        });
        console.log('with address', vm.res);
        return vm.res;
    }

    function goodLatLng(arr) {
        vm.good = arr.filter(function (item) {
            if (!!item.address.lat && !!item.address.lng) {
                return item;
            }
        });
        console.log('good', vm.good);
        return vm.good;
    }

    function getMarkers(arr) {
        $scope.markers = arr.map(function (item) {
            if (item.salary.from) {
                vm.message = item.name + '<br>' + item.employer.name + '<br>' + item.salary.from + item.salary.currency;
            }
            vm.a = {
                layer: 'realworld',
                lat: item.address.lat,
                lng: item.address.lng,
                message: vm.message
            };
            return vm.a;
        });
        console.log('markers', $scope.markers);
        return $scope.markers;
    }

    function callbackDict(response) {

        $scope.expItems = response.data.experience;
        $scope.expItems.push($scope.expSelected);

        $scope.emplItems = response.data.employment;
        $scope.emplItems.push($scope.emplSelected);

        $scope.scheduleItems = response.data.schedule;
        $scope.scheduleItems.push($scope.shSelected);

        $scope.currItems = response.data.currency;
        $scope.currItems.push($scope.currSelected);
    }

    function setMap() {
        gmapService.getVac(vm.params).then(success, error).then(getVacancyWithAddress).then(goodLatLng).then(getMarkers);
    };

    $scope.updateCriteria = function () {
        vm.params.text = $scope.text;
        vm.params.experience = $scope.expSelected.id;
        vm.params.employment = $scope.emplSelected.id;
        vm.params.schedule = $scope.shSelected.id;
        vm.params.currency = $scope.currSelected.code;

        setMap();
    };

    angular.extend($scope, {
        minsk: {
            lat: 53.89422375647324,
            lng: 27.558517456054688,
            zoom: 11
        },
        layers: {
            baselayers: {
                osm: {
                    name: 'OpenStreetMap',
                    type: 'xyz',
                    url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                }
            },
            overlays: {
                realworld: {
                    name: "Real world data",
                    type: "markercluster",
                    visible: true
                }
            }
        }
    });
}]);

},{}],3:[function(require,module,exports){
/**
 * Created by k_zenchyk on 2/28/16.
 */
const qs = require('qs');

angular.module('gmapApp').service('gmapService', ['$http', function ($http) {

    var baseUrl = 'https://api.hh.ru/vacancies?';

    this.getVac = function (partUrlDict) {
        var partUrl = qs.stringify(partUrlDict, { indices: false });
        console.log("URL", baseUrl + partUrl);
        return $http.get(baseUrl + partUrl);
    };

    var searchingParamCache;
    this.getSearchParam = function () {
        if (!searchingParamCache) {
            searchingParamCache = $http.get('https://api.hh.ru/dictionaries');
        }
        return searchingParamCache;
    };
}]);

},{"qs":5}],4:[function(require,module,exports){
/**
 * Created by k_zenchyk on 2/28/16.
 */

require('./app.module.js');
require('./vmap/vmap.service.js');
require('./vmap/vmap.controller.js');

},{"./app.module.js":1,"./vmap/vmap.controller.js":2,"./vmap/vmap.service.js":3}],5:[function(require,module,exports){
'use strict';

var Stringify = require('./stringify');
var Parse = require('./parse');

module.exports = {
    stringify: Stringify,
    parse: Parse
};

},{"./parse":6,"./stringify":7}],6:[function(require,module,exports){
'use strict';

var Utils = require('./utils');

var internals = {
    delimiter: '&',
    depth: 5,
    arrayLimit: 20,
    parameterLimit: 1000,
    strictNullHandling: false,
    plainObjects: false,
    allowPrototypes: false,
    allowDots: false
};

internals.parseValues = function (str, options) {
    var obj = {};
    var parts = str.split(options.delimiter, options.parameterLimit === Infinity ? undefined : options.parameterLimit);

    for (var i = 0; i < parts.length; ++i) {
        var part = parts[i];
        var pos = part.indexOf(']=') === -1 ? part.indexOf('=') : part.indexOf(']=') + 1;

        if (pos === -1) {
            obj[Utils.decode(part)] = '';

            if (options.strictNullHandling) {
                obj[Utils.decode(part)] = null;
            }
        } else {
            var key = Utils.decode(part.slice(0, pos));
            var val = Utils.decode(part.slice(pos + 1));

            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                obj[key] = [].concat(obj[key]).concat(val);
            } else {
                obj[key] = val;
            }
        }
    }

    return obj;
};

internals.parseObject = function (chain, val, options) {
    if (!chain.length) {
        return val;
    }

    var root = chain.shift();

    var obj;
    if (root === '[]') {
        obj = [];
        obj = obj.concat(internals.parseObject(chain, val, options));
    } else {
        obj = options.plainObjects ? Object.create(null) : {};
        var cleanRoot = root[0] === '[' && root[root.length - 1] === ']' ? root.slice(1, root.length - 1) : root;
        var index = parseInt(cleanRoot, 10);
        if (
            !isNaN(index) &&
            root !== cleanRoot &&
            String(index) === cleanRoot &&
            index >= 0 &&
            (options.parseArrays && index <= options.arrayLimit)
        ) {
            obj = [];
            obj[index] = internals.parseObject(chain, val, options);
        } else {
            obj[cleanRoot] = internals.parseObject(chain, val, options);
        }
    }

    return obj;
};

internals.parseKeys = function (givenKey, val, options) {
    if (!givenKey) {
        return;
    }

    // Transform dot notation to bracket notation
    var key = options.allowDots ? givenKey.replace(/\.([^\.\[]+)/g, '[$1]') : givenKey;

    // The regex chunks

    var parent = /^([^\[\]]*)/;
    var child = /(\[[^\[\]]*\])/g;

    // Get the parent

    var segment = parent.exec(key);

    // Stash the parent if it exists

    var keys = [];
    if (segment[1]) {
        // If we aren't using plain objects, optionally prefix keys
        // that would overwrite object prototype properties
        if (!options.plainObjects && Object.prototype.hasOwnProperty(segment[1])) {
            if (!options.allowPrototypes) {
                return;
            }
        }

        keys.push(segment[1]);
    }

    // Loop through children appending to the array until we hit depth

    var i = 0;
    while ((segment = child.exec(key)) !== null && i < options.depth) {
        i += 1;
        if (!options.plainObjects && Object.prototype.hasOwnProperty(segment[1].replace(/\[|\]/g, ''))) {
            if (!options.allowPrototypes) {
                continue;
            }
        }
        keys.push(segment[1]);
    }

    // If there's a remainder, just add whatever is left

    if (segment) {
        keys.push('[' + key.slice(segment.index) + ']');
    }

    return internals.parseObject(keys, val, options);
};

module.exports = function (str, opts) {
    var options = opts || {};
    options.delimiter = typeof options.delimiter === 'string' || Utils.isRegExp(options.delimiter) ? options.delimiter : internals.delimiter;
    options.depth = typeof options.depth === 'number' ? options.depth : internals.depth;
    options.arrayLimit = typeof options.arrayLimit === 'number' ? options.arrayLimit : internals.arrayLimit;
    options.parseArrays = options.parseArrays !== false;
    options.allowDots = typeof options.allowDots === 'boolean' ? options.allowDots : internals.allowDots;
    options.plainObjects = typeof options.plainObjects === 'boolean' ? options.plainObjects : internals.plainObjects;
    options.allowPrototypes = typeof options.allowPrototypes === 'boolean' ? options.allowPrototypes : internals.allowPrototypes;
    options.parameterLimit = typeof options.parameterLimit === 'number' ? options.parameterLimit : internals.parameterLimit;
    options.strictNullHandling = typeof options.strictNullHandling === 'boolean' ? options.strictNullHandling : internals.strictNullHandling;

    if (
        str === '' ||
        str === null ||
        typeof str === 'undefined'
    ) {
        return options.plainObjects ? Object.create(null) : {};
    }

    var tempObj = typeof str === 'string' ? internals.parseValues(str, options) : str;
    var obj = options.plainObjects ? Object.create(null) : {};

    // Iterate over the keys and setup the new object

    var keys = Object.keys(tempObj);
    for (var i = 0; i < keys.length; ++i) {
        var key = keys[i];
        var newObj = internals.parseKeys(key, tempObj[key], options);
        obj = Utils.merge(obj, newObj, options);
    }

    return Utils.compact(obj);
};

},{"./utils":8}],7:[function(require,module,exports){
'use strict';

var Utils = require('./utils');

var internals = {
    delimiter: '&',
    arrayPrefixGenerators: {
        brackets: function (prefix) {
            return prefix + '[]';
        },
        indices: function (prefix, key) {
            return prefix + '[' + key + ']';
        },
        repeat: function (prefix) {
            return prefix;
        }
    },
    strictNullHandling: false,
    skipNulls: false,
    encode: true
};

internals.stringify = function (object, prefix, generateArrayPrefix, strictNullHandling, skipNulls, encode, filter, sort, allowDots) {
    var obj = object;
    if (typeof filter === 'function') {
        obj = filter(prefix, obj);
    } else if (Utils.isBuffer(obj)) {
        obj = String(obj);
    } else if (obj instanceof Date) {
        obj = obj.toISOString();
    } else if (obj === null) {
        if (strictNullHandling) {
            return encode ? Utils.encode(prefix) : prefix;
        }

        obj = '';
    }

    if (typeof obj === 'string' || typeof obj === 'number' || typeof obj === 'boolean') {
        if (encode) {
            return [Utils.encode(prefix) + '=' + Utils.encode(obj)];
        }
        return [prefix + '=' + obj];
    }

    var values = [];

    if (typeof obj === 'undefined') {
        return values;
    }

    var objKeys;
    if (Array.isArray(filter)) {
        objKeys = filter;
    } else {
        var keys = Object.keys(obj);
        objKeys = sort ? keys.sort(sort) : keys;
    }

    for (var i = 0; i < objKeys.length; ++i) {
        var key = objKeys[i];

        if (skipNulls && obj[key] === null) {
            continue;
        }

        if (Array.isArray(obj)) {
            values = values.concat(internals.stringify(obj[key], generateArrayPrefix(prefix, key), generateArrayPrefix, strictNullHandling, skipNulls, encode, filter, sort, allowDots));
        } else {
            values = values.concat(internals.stringify(obj[key], prefix + (allowDots ? '.' + key : '[' + key + ']'), generateArrayPrefix, strictNullHandling, skipNulls, encode, filter, sort, allowDots));
        }
    }

    return values;
};

module.exports = function (object, opts) {
    var obj = object;
    var options = opts || {};
    var delimiter = typeof options.delimiter === 'undefined' ? internals.delimiter : options.delimiter;
    var strictNullHandling = typeof options.strictNullHandling === 'boolean' ? options.strictNullHandling : internals.strictNullHandling;
    var skipNulls = typeof options.skipNulls === 'boolean' ? options.skipNulls : internals.skipNulls;
    var encode = typeof options.encode === 'boolean' ? options.encode : internals.encode;
    var sort = typeof options.sort === 'function' ? options.sort : null;
    var allowDots = typeof options.allowDots === 'undefined' ? false : options.allowDots;
    var objKeys;
    var filter;
    if (typeof options.filter === 'function') {
        filter = options.filter;
        obj = filter('', obj);
    } else if (Array.isArray(options.filter)) {
        objKeys = filter = options.filter;
    }

    var keys = [];

    if (typeof obj !== 'object' || obj === null) {
        return '';
    }

    var arrayFormat;
    if (options.arrayFormat in internals.arrayPrefixGenerators) {
        arrayFormat = options.arrayFormat;
    } else if ('indices' in options) {
        arrayFormat = options.indices ? 'indices' : 'repeat';
    } else {
        arrayFormat = 'indices';
    }

    var generateArrayPrefix = internals.arrayPrefixGenerators[arrayFormat];

    if (!objKeys) {
        objKeys = Object.keys(obj);
    }

    if (sort) {
        objKeys.sort(sort);
    }

    for (var i = 0; i < objKeys.length; ++i) {
        var key = objKeys[i];

        if (skipNulls && obj[key] === null) {
            continue;
        }

        keys = keys.concat(internals.stringify(obj[key], key, generateArrayPrefix, strictNullHandling, skipNulls, encode, filter, sort, allowDots));
    }

    return keys.join(delimiter);
};

},{"./utils":8}],8:[function(require,module,exports){
'use strict';

var hexTable = (function () {
    var array = new Array(256);
    for (var i = 0; i < 256; ++i) {
        array[i] = '%' + ((i < 16 ? '0' : '') + i.toString(16)).toUpperCase();
    }

    return array;
}());

exports.arrayToObject = function (source, options) {
    var obj = options.plainObjects ? Object.create(null) : {};
    for (var i = 0; i < source.length; ++i) {
        if (typeof source[i] !== 'undefined') {
            obj[i] = source[i];
        }
    }

    return obj;
};

exports.merge = function (target, source, options) {
    if (!source) {
        return target;
    }

    if (typeof source !== 'object') {
        if (Array.isArray(target)) {
            target.push(source);
        } else if (typeof target === 'object') {
            target[source] = true;
        } else {
            return [target, source];
        }

        return target;
    }

    if (typeof target !== 'object') {
        return [target].concat(source);
    }

    var mergeTarget = target;
    if (Array.isArray(target) && !Array.isArray(source)) {
        mergeTarget = exports.arrayToObject(target, options);
    }

	return Object.keys(source).reduce(function (acc, key) {
        var value = source[key];

        if (Object.prototype.hasOwnProperty.call(acc, key)) {
            acc[key] = exports.merge(acc[key], value, options);
        } else {
            acc[key] = value;
        }
		return acc;
    }, mergeTarget);
};

exports.decode = function (str) {
    try {
        return decodeURIComponent(str.replace(/\+/g, ' '));
    } catch (e) {
        return str;
    }
};

exports.encode = function (str) {
    // This code was originally written by Brian White (mscdex) for the io.js core querystring library.
    // It has been adapted here for stricter adherence to RFC 3986
    if (str.length === 0) {
        return str;
    }

    var string = typeof str === 'string' ? str : String(str);

    var out = '';
    for (var i = 0; i < string.length; ++i) {
        var c = string.charCodeAt(i);

        if (
            c === 0x2D || // -
            c === 0x2E || // .
            c === 0x5F || // _
            c === 0x7E || // ~
            (c >= 0x30 && c <= 0x39) || // 0-9
            (c >= 0x41 && c <= 0x5A) || // a-z
            (c >= 0x61 && c <= 0x7A) // A-Z
        ) {
            out += string.charAt(i);
            continue;
        }

        if (c < 0x80) {
            out = out + hexTable[c];
            continue;
        }

        if (c < 0x800) {
            out = out + (hexTable[0xC0 | (c >> 6)] + hexTable[0x80 | (c & 0x3F)]);
            continue;
        }

        if (c < 0xD800 || c >= 0xE000) {
            out = out + (hexTable[0xE0 | (c >> 12)] + hexTable[0x80 | ((c >> 6) & 0x3F)] + hexTable[0x80 | (c & 0x3F)]);
            continue;
        }

        i += 1;
        c = 0x10000 + (((c & 0x3FF) << 10) | (string.charCodeAt(i) & 0x3FF));
        out += (hexTable[0xF0 | (c >> 18)] + hexTable[0x80 | ((c >> 12) & 0x3F)] + hexTable[0x80 | ((c >> 6) & 0x3F)] + hexTable[0x80 | (c & 0x3F)]);
    }

    return out;
};

exports.compact = function (obj, references) {
    if (typeof obj !== 'object' || obj === null) {
        return obj;
    }

    var refs = references || [];
    var lookup = refs.indexOf(obj);
    if (lookup !== -1) {
        return refs[lookup];
    }

    refs.push(obj);

    if (Array.isArray(obj)) {
        var compacted = [];

        for (var i = 0; i < obj.length; ++i) {
            if (typeof obj[i] !== 'undefined') {
                compacted.push(obj[i]);
            }
        }

        return compacted;
    }

    var keys = Object.keys(obj);
    for (var j = 0; j < keys.length; ++j) {
        var key = keys[j];
        obj[key] = exports.compact(obj[key], refs);
    }

    return obj;
};

exports.isRegExp = function (obj) {
    return Object.prototype.toString.call(obj) === '[object RegExp]';
};

exports.isBuffer = function (obj) {
    if (obj === null || typeof obj === 'undefined') {
        return false;
    }

    return !!(obj.constructor && obj.constructor.isBuffer && obj.constructor.isBuffer(obj));
};

},{}]},{},[4])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhcHAvYXBwLm1vZHVsZS5qcyIsImFwcC92bWFwL3ZtYXAuY29udHJvbGxlci5qcyIsImFwcC92bWFwL3ZtYXAuc2VydmljZS5qcyIsImluZGV4LmpzIiwibm9kZV9tb2R1bGVzL3FzL2xpYi9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9xcy9saWIvcGFyc2UuanMiLCJub2RlX21vZHVsZXMvcXMvbGliL3N0cmluZ2lmeS5qcyIsIm5vZGVfbW9kdWxlcy9xcy9saWIvdXRpbHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7QUNHQTs7QUFFQSxRQUNLLE1BREwsQ0FDWSxTQURaLEVBQ3VCLENBQUMsbUJBQUQsQ0FEdkI7Ozs7Ozs7QUNBQSxRQUFRLE1BQVIsQ0FBZSxTQUFmLEVBQ0ssVUFETCxDQUNnQixnQkFEaEIsRUFDa0MsQ0FBQyxRQUFELEVBQVcsYUFBWCxFQUEwQixVQUFTLE1BQVQsRUFBaUIsV0FBakIsRUFBNkI7QUFDakYsUUFBSSxLQUFLLElBQUwsQ0FENkU7QUFFakYsT0FBRyxPQUFILEdBQWEsRUFBYixDQUZpRjtBQUdqRixXQUFPLE9BQVAsR0FBaUIsRUFBakIsQ0FIaUY7O0FBS2pGLE9BQUcsTUFBSCxHQUFZO0FBQ1IsdUJBQWUsR0FBZjtBQUNBLDBCQUFrQixJQUFsQjtBQUNBLGNBQU0sSUFBTjtBQUNBLGVBQU8sSUFBUDtBQUNBLHlCQUFpQixrQkFBakI7QUFDQSx5QkFBaUIsa0JBQWpCO0FBQ0EsdUJBQWUsZ0JBQWY7QUFDQSx1QkFBZSxpQkFBZjtLQVJKLENBTGlGOztBQWdCakYsV0FBTyxXQUFQLEdBQXFCO0FBQ2pCLGNBQU0sY0FBTjtLQURKLENBaEJpRjtBQW1CakYsV0FBTyxZQUFQLEdBQXNCO0FBQ2xCLGNBQU0sY0FBTjtLQURKLENBbkJpRjtBQXNCakYsV0FBTyxVQUFQLEdBQW9CO0FBQ2hCLGNB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QTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbklBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qKlxuICogQ3JlYXRlZCBieSBrX3plbmNoeWsgb24gMi8yOC8xNi5cbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG5hbmd1bGFyXG4gICAgLm1vZHVsZSgnZ21hcEFwcCcsIFsnbGVhZmxldC1kaXJlY3RpdmUnXSk7XG5cbiIsIi8qKlxuICogQ3JlYXRlZCBieSBrX3plbmNoeWsgb24gMi8yOC8xNi5cbiAqL1xuXG5cbmFuZ3VsYXIubW9kdWxlKCdnbWFwQXBwJylcbiAgICAuY29udHJvbGxlcignZ21hcENvbnRyb2xsZXInLCBbJyRzY29wZScsICdnbWFwU2VydmljZScsIGZ1bmN0aW9uKCRzY29wZSwgZ21hcFNlcnZpY2Upe1xuICAgICAgICB2YXIgdm0gPSB0aGlzO1xuICAgICAgICB2bS5tYXJrZXJzID0gW107XG4gICAgICAgICRzY29wZS5tYXJrZXJzID0gW107XG5cbiAgICAgICAgdm0ucGFyYW1zID0ge1xuICAgICAgICAgICAgaXRlbXNfb25fcGFnZTogMTAwLFxuICAgICAgICAgICAgb25seV93aXRoX3NhbGFyeTogdHJ1ZSxcbiAgICAgICAgICAgIGFyZWE6IDEwMDIsXG4gICAgICAgICAgICBpc01hcDogdHJ1ZSxcbiAgICAgICAgICAgIGJvdHRvbV9sZWZ0X2xhdDogNTMuODg1NTMyNzE0Mjg5NDk2LFxuICAgICAgICAgICAgYm90dG9tX2xlZnRfbG5nOiAyNy4yOTQyNDE0NjUzNjcwNjUsXG4gICAgICAgICAgICB0b3BfcmlnaHRfbGF0OiA1My45MTUzMzc3OTU0NzQ1LFxuICAgICAgICAgICAgdG9wX3JpZ2h0X2xuZzogMjcuNzMzNjk0NTkwMzY3MDZcbiAgICAgICAgfTtcblxuICAgICAgICAkc2NvcGUuZXhwU2VsZWN0ZWQgPSB7XG4gICAgICAgICAgICBuYW1lOiBcIk5vdCBzZWxlY3RlZFwiXG4gICAgICAgIH07XG4gICAgICAgICRzY29wZS5lbXBsU2VsZWN0ZWQgPSB7XG4gICAgICAgICAgICBuYW1lOiBcIk5vdCBzZWxlY3RlZFwiXG4gICAgICAgIH07XG4gICAgICAgICRzY29wZS5zaFNlbGVjdGVkID0ge1xuICAgICAgICAgICAgbmFtZTogXCJOb3Qgc2VsZWN0ZWRcIlxuICAgICAgICB9O1xuICAgICAgICAkc2NvcGUuY3VyclNlbGVjdGVkID0ge1xuICAgICAgICAgICAgbmFtZTogXCJOb3Qgc2VsZWN0ZWRcIlxuICAgICAgICB9O1xuXG5cbiAgICAgICAgc2V0TWFwKCk7XG5cbiAgICAgICAgZ21hcFNlcnZpY2UuZ2V0U2VhcmNoUGFyYW0oKVxuICAgICAgICAgICAgLnRoZW4oY2FsbGJhY2tEaWN0LCBlcnJvcik7XG5cbiAgICAgICAgZnVuY3Rpb24gc3VjY2VzcyhyZXNwb25zZSl7XG4gICAgICAgICAgICB2bS52YWMgPSByZXNwb25zZS5kYXRhLml0ZW1zO1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ3ZhYycsIHZtLnZhYyk7XG4gICAgICAgICAgICByZXR1cm4gdm0udmFjO1xuICAgICAgICB9XG4gICAgICAgIGZ1bmN0aW9uIGVycm9yKHJlc3BvbnNlKXtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiRXJyb3I6IFwiICsgcmVzcG9uc2Uuc3RhdHVzICsgXCIgXCIgKyByZXNwb25zZS5zdGF0dXNUZXh0KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIGdldFZhY2FuY3lXaXRoQWRkcmVzcyhhcnIpe1xuICAgICAgICAgICAgdm0ucmVzID0gYXJyLmZpbHRlcihmdW5jdGlvbihpdGVtKXtcbiAgICAgICAgICAgICAgICBpZihpdGVtLmFkZHJlc3MpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGl0ZW1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCd3aXRoIGFkZHJlc3MnLCB2bS5yZXMpO1xuICAgICAgICAgICAgcmV0dXJuIHZtLnJlc1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gZ29vZExhdExuZyhhcnIpe1xuICAgICAgICAgICAgdm0uZ29vZCA9IGFyci5maWx0ZXIoZnVuY3Rpb24oaXRlbSl7XG4gICAgICAgICAgICAgICAgaWYoISFpdGVtLmFkZHJlc3MubGF0ICYmICEhaXRlbS5hZGRyZXNzLmxuZyl7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBpdGVtXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnZ29vZCcsIHZtLmdvb2QpO1xuICAgICAgICAgICAgcmV0dXJuIHZtLmdvb2RcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIGdldE1hcmtlcnMoYXJyKXtcbiAgICAgICAgICAgICRzY29wZS5tYXJrZXJzID0gYXJyLm1hcChmdW5jdGlvbihpdGVtKXtcbiAgICAgICAgICAgICAgICBpZihpdGVtLnNhbGFyeS5mcm9tKSB7XG4gICAgICAgICAgICAgICAgICAgIHZtLm1lc3NhZ2UgPSBpdGVtLm5hbWUgKyAnPGJyPidcbiAgICAgICAgICAgICAgICAgICAgICAgICsgaXRlbS5lbXBsb3llci5uYW1lICsgJzxicj4nXG4gICAgICAgICAgICAgICAgICAgICAgICArIGl0ZW0uc2FsYXJ5LmZyb20gKyBpdGVtLnNhbGFyeS5jdXJyZW5jeTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdm0uYSA9IHtcbiAgICAgICAgICAgICAgICAgICAgbGF5ZXI6ICdyZWFsd29ybGQnLFxuICAgICAgICAgICAgICAgICAgICBsYXQ6IGl0ZW0uYWRkcmVzcy5sYXQsXG4gICAgICAgICAgICAgICAgICAgIGxuZzogaXRlbS5hZGRyZXNzLmxuZyxcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogdm0ubWVzc2FnZVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZtLmE7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdtYXJrZXJzJywgJHNjb3BlLm1hcmtlcnMpO1xuICAgICAgICAgICAgcmV0dXJuICRzY29wZS5tYXJrZXJzXG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBjYWxsYmFja0RpY3QocmVzcG9uc2Upe1xuXG4gICAgICAgICAgICAkc2NvcGUuZXhwSXRlbXMgPSByZXNwb25zZS5kYXRhLmV4cGVyaWVuY2U7XG4gICAgICAgICAgICAkc2NvcGUuZXhwSXRlbXMucHVzaCgkc2NvcGUuZXhwU2VsZWN0ZWQpO1xuXG4gICAgICAgICAgICAkc2NvcGUuZW1wbEl0ZW1zID0gcmVzcG9uc2UuZGF0YS5lbXBsb3ltZW50O1xuICAgICAgICAgICAgJHNjb3BlLmVtcGxJdGVtcy5wdXNoKCRzY29wZS5lbXBsU2VsZWN0ZWQpO1xuXG4gICAgICAgICAgICAkc2NvcGUuc2NoZWR1bGVJdGVtcyA9IHJlc3BvbnNlLmRhdGEuc2NoZWR1bGU7XG4gICAgICAgICAgICAkc2NvcGUuc2NoZWR1bGVJdGVtcy5wdXNoKCRzY29wZS5zaFNlbGVjdGVkKTtcblxuICAgICAgICAgICAgJHNjb3BlLmN1cnJJdGVtcyA9IHJlc3BvbnNlLmRhdGEuY3VycmVuY3k7XG4gICAgICAgICAgICAkc2NvcGUuY3Vyckl0ZW1zLnB1c2goJHNjb3BlLmN1cnJTZWxlY3RlZCk7XG4gICAgICAgIH1cblxuICAgICAgICAgZnVuY3Rpb24gc2V0TWFwKCl7XG4gICAgICAgICAgICBnbWFwU2VydmljZS5nZXRWYWModm0ucGFyYW1zKVxuICAgICAgICAgICAgLnRoZW4oc3VjY2VzcywgZXJyb3IpXG4gICAgICAgICAgICAudGhlbihnZXRWYWNhbmN5V2l0aEFkZHJlc3MpXG4gICAgICAgICAgICAudGhlbihnb29kTGF0TG5nKVxuICAgICAgICAgICAgLnRoZW4oZ2V0TWFya2Vycyk7XG4gICAgICAgIH07XG5cbiAgICAgICAgJHNjb3BlLnVwZGF0ZUNyaXRlcmlhID0gZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIHZtLnBhcmFtcy50ZXh0ID0gJHNjb3BlLnRleHQ7XG4gICAgICAgICAgICB2bS5wYXJhbXMuZXhwZXJpZW5jZSA9ICRzY29wZS5leHBTZWxlY3RlZC5pZDtcbiAgICAgICAgICAgIHZtLnBhcmFtcy5lbXBsb3ltZW50ID0gJHNjb3BlLmVtcGxTZWxlY3RlZC5pZDtcbiAgICAgICAgICAgIHZtLnBhcmFtcy5zY2hlZHVsZSA9ICRzY29wZS5zaFNlbGVjdGVkLmlkO1xuICAgICAgICAgICAgdm0ucGFyYW1zLmN1cnJlbmN5ID0gJHNjb3BlLmN1cnJTZWxlY3RlZC5jb2RlO1xuXG4gICAgICAgICAgICBzZXRNYXAoKTtcblxuICAgICAgICB9O1xuXG4gICAgICAgIGFuZ3VsYXIuZXh0ZW5kKCRzY29wZSwge1xuICAgICAgICAgICAgbWluc2s6IHtcbiAgICAgICAgICAgICAgICBsYXQ6IDUzLjg5NDIyMzc1NjQ3MzI0LFxuICAgICAgICAgICAgICAgIGxuZzogMjcuNTU4NTE3NDU2MDU0Njg4LFxuICAgICAgICAgICAgICAgIHpvb206IDExXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgbGF5ZXJzOiB7XG4gICAgICAgICAgICAgICAgYmFzZWxheWVyczoge1xuICAgICAgICAgICAgICAgICAgICBvc206IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6ICdPcGVuU3RyZWV0TWFwJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICd4eXonLFxuICAgICAgICAgICAgICAgICAgICAgICAgdXJsOiAnaHR0cDovL3tzfS50aWxlLm9wZW5zdHJlZXRtYXAub3JnL3t6fS97eH0ve3l9LnBuZydcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgb3ZlcmxheXM6IHtcbiAgICAgICAgICAgICAgICAgICAgcmVhbHdvcmxkOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBcIlJlYWwgd29ybGQgZGF0YVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogXCJtYXJrZXJjbHVzdGVyXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICB2aXNpYmxlOiB0cnVlXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICB9XSk7IiwiLyoqXG4gKiBDcmVhdGVkIGJ5IGtfemVuY2h5ayBvbiAyLzI4LzE2LlxuICovXG5jb25zdCBxcyA9IHJlcXVpcmUoJ3FzJyk7XG5cbmFuZ3VsYXIubW9kdWxlKCdnbWFwQXBwJylcbiAgICAuc2VydmljZSgnZ21hcFNlcnZpY2UnLCBbICckaHR0cCcsIGZ1bmN0aW9uKCRodHRwKXtcblxuICAgICAgICB2YXIgYmFzZVVybCA9ICdodHRwczovL2FwaS5oaC5ydS92YWNhbmNpZXM/JztcblxuICAgICAgICB0aGlzLmdldFZhYyA9IGZ1bmN0aW9uKHBhcnRVcmxEaWN0KXtcbiAgICAgICAgICAgIHZhciBwYXJ0VXJsID0gcXMuc3RyaW5naWZ5KHBhcnRVcmxEaWN0LCB7IGluZGljZXM6IGZhbHNlIH0pO1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJVUkxcIiwgYmFzZVVybCtwYXJ0VXJsKVxuICAgICAgICAgICAgcmV0dXJuICRodHRwLmdldChiYXNlVXJsK3BhcnRVcmwpO1xuICAgICAgICB9O1xuXG4gICAgICAgIHZhciBzZWFyY2hpbmdQYXJhbUNhY2hlO1xuICAgICAgICB0aGlzLmdldFNlYXJjaFBhcmFtID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYoIXNlYXJjaGluZ1BhcmFtQ2FjaGUpe1xuICAgICAgICAgICAgICAgIHNlYXJjaGluZ1BhcmFtQ2FjaGUgPSAkaHR0cC5nZXQoJ2h0dHBzOi8vYXBpLmhoLnJ1L2RpY3Rpb25hcmllcycpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHNlYXJjaGluZ1BhcmFtQ2FjaGU7XG4gICAgICAgIH1cblxuICAgIH1dKTsiLCIvKipcbiAqIENyZWF0ZWQgYnkga196ZW5jaHlrIG9uIDIvMjgvMTYuXG4gKi9cblxucmVxdWlyZSgnLi9hcHAubW9kdWxlLmpzJyk7XG5yZXF1aXJlKCcuL3ZtYXAvdm1hcC5zZXJ2aWNlLmpzJyk7XG5yZXF1aXJlKCcuL3ZtYXAvdm1hcC5jb250cm9sbGVyLmpzJyk7IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgU3RyaW5naWZ5ID0gcmVxdWlyZSgnLi9zdHJpbmdpZnknKTtcbnZhciBQYXJzZSA9IHJlcXVpcmUoJy4vcGFyc2UnKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgc3RyaW5naWZ5OiBTdHJpbmdpZnksXG4gICAgcGFyc2U6IFBhcnNlXG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgVXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJyk7XG5cbnZhciBpbnRlcm5hbHMgPSB7XG4gICAgZGVsaW1pdGVyOiAnJicsXG4gICAgZGVwdGg6IDUsXG4gICAgYXJyYXlMaW1pdDogMjAsXG4gICAgcGFyYW1ldGVyTGltaXQ6IDEwMDAsXG4gICAgc3RyaWN0TnVsbEhhbmRsaW5nOiBmYWxzZSxcbiAgICBwbGFpbk9iamVjdHM6IGZhbHNlLFxuICAgIGFsbG93UHJvdG90eXBlczogZmFsc2UsXG4gICAgYWxsb3dEb3RzOiBmYWxzZVxufTtcblxuaW50ZXJuYWxzLnBhcnNlVmFsdWVzID0gZnVuY3Rpb24gKHN0ciwgb3B0aW9ucykge1xuICAgIHZhciBvYmogPSB7fTtcbiAgICB2YXIgcGFydHMgPSBzdHIuc3BsaXQob3B0aW9ucy5kZWxpbWl0ZXIsIG9wdGlvbnMucGFyYW1ldGVyTGltaXQgPT09IEluZmluaXR5ID8gdW5kZWZpbmVkIDogb3B0aW9ucy5wYXJhbWV0ZXJMaW1pdCk7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBhcnRzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgIHZhciBwYXJ0ID0gcGFydHNbaV07XG4gICAgICAgIHZhciBwb3MgPSBwYXJ0LmluZGV4T2YoJ109JykgPT09IC0xID8gcGFydC5pbmRleE9mKCc9JykgOiBwYXJ0LmluZGV4T2YoJ109JykgKyAxO1xuXG4gICAgICAgIGlmIChwb3MgPT09IC0xKSB7XG4gICAgICAgICAgICBvYmpbVXRpbHMuZGVjb2RlKHBhcnQpXSA9ICcnO1xuXG4gICAgICAgICAgICBpZiAob3B0aW9ucy5zdHJpY3ROdWxsSGFuZGxpbmcpIHtcbiAgICAgICAgICAgICAgICBvYmpbVXRpbHMuZGVjb2RlKHBhcnQpXSA9IG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB2YXIga2V5ID0gVXRpbHMuZGVjb2RlKHBhcnQuc2xpY2UoMCwgcG9zKSk7XG4gICAgICAgICAgICB2YXIgdmFsID0gVXRpbHMuZGVjb2RlKHBhcnQuc2xpY2UocG9zICsgMSkpO1xuXG4gICAgICAgICAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwga2V5KSkge1xuICAgICAgICAgICAgICAgIG9ialtrZXldID0gW10uY29uY2F0KG9ialtrZXldKS5jb25jYXQodmFsKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgb2JqW2tleV0gPSB2YWw7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gb2JqO1xufTtcblxuaW50ZXJuYWxzLnBhcnNlT2JqZWN0ID0gZnVuY3Rpb24gKGNoYWluLCB2YWwsIG9wdGlvbnMpIHtcbiAgICBpZiAoIWNoYWluLmxlbmd0aCkge1xuICAgICAgICByZXR1cm4gdmFsO1xuICAgIH1cblxuICAgIHZhciByb290ID0gY2hhaW4uc2hpZnQoKTtcblxuICAgIHZhciBvYmo7XG4gICAgaWYgKHJvb3QgPT09ICdbXScpIHtcbiAgICAgICAgb2JqID0gW107XG4gICAgICAgIG9iaiA9IG9iai5jb25jYXQoaW50ZXJuYWxzLnBhcnNlT2JqZWN0KGNoYWluLCB2YWwsIG9wdGlvbnMpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBvYmogPSBvcHRpb25zLnBsYWluT2JqZWN0cyA/IE9iamVjdC5jcmVhdGUobnVsbCkgOiB7fTtcbiAgICAgICAgdmFyIGNsZWFuUm9vdCA9IHJvb3RbMF0gPT09ICdbJyAmJiByb290W3Jvb3QubGVuZ3RoIC0gMV0gPT09ICddJyA/IHJvb3Quc2xpY2UoMSwgcm9vdC5sZW5ndGggLSAxKSA6IHJvb3Q7XG4gICAgICAgIHZhciBpbmRleCA9IHBhcnNlSW50KGNsZWFuUm9vdCwgMTApO1xuICAgICAgICBpZiAoXG4gICAgICAgICAgICAhaXNOYU4oaW5kZXgpICYmXG4gICAgICAgICAgICByb290ICE9PSBjbGVhblJvb3QgJiZcbiAgICAgICAgICAgIFN0cmluZyhpbmRleCkgPT09IGNsZWFuUm9vdCAmJlxuICAgICAgICAgICAgaW5kZXggPj0gMCAmJlxuICAgICAgICAgICAgKG9wdGlvbnMucGFyc2VBcnJheXMgJiYgaW5kZXggPD0gb3B0aW9ucy5hcnJheUxpbWl0KVxuICAgICAgICApIHtcbiAgICAgICAgICAgIG9iaiA9IFtdO1xuICAgICAgICAgICAgb2JqW2luZGV4XSA9IGludGVybmFscy5wYXJzZU9iamVjdChjaGFpbiwgdmFsLCBvcHRpb25zKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG9ialtjbGVhblJvb3RdID0gaW50ZXJuYWxzLnBhcnNlT2JqZWN0KGNoYWluLCB2YWwsIG9wdGlvbnMpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG9iajtcbn07XG5cbmludGVybmFscy5wYXJzZUtleXMgPSBmdW5jdGlvbiAoZ2l2ZW5LZXksIHZhbCwgb3B0aW9ucykge1xuICAgIGlmICghZ2l2ZW5LZXkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFRyYW5zZm9ybSBkb3Qgbm90YXRpb24gdG8gYnJhY2tldCBub3RhdGlvblxuICAgIHZhciBrZXkgPSBvcHRpb25zLmFsbG93RG90cyA/IGdpdmVuS2V5LnJlcGxhY2UoL1xcLihbXlxcLlxcW10rKS9nLCAnWyQxXScpIDogZ2l2ZW5LZXk7XG5cbiAgICAvLyBUaGUgcmVnZXggY2h1bmtzXG5cbiAgICB2YXIgcGFyZW50ID0gL14oW15cXFtcXF1dKikvO1xuICAgIHZhciBjaGlsZCA9IC8oXFxbW15cXFtcXF1dKlxcXSkvZztcblxuICAgIC8vIEdldCB0aGUgcGFyZW50XG5cbiAgICB2YXIgc2VnbWVudCA9IHBhcmVudC5leGVjKGtleSk7XG5cbiAgICAvLyBTdGFzaCB0aGUgcGFyZW50IGlmIGl0IGV4aXN0c1xuXG4gICAgdmFyIGtleXMgPSBbXTtcbiAgICBpZiAoc2VnbWVudFsxXSkge1xuICAgICAgICAvLyBJZiB3ZSBhcmVuJ3QgdXNpbmcgcGxhaW4gb2JqZWN0cywgb3B0aW9uYWxseSBwcmVmaXgga2V5c1xuICAgICAgICAvLyB0aGF0IHdvdWxkIG92ZXJ3cml0ZSBvYmplY3QgcHJvdG90eXBlIHByb3BlcnRpZXNcbiAgICAgICAgaWYgKCFvcHRpb25zLnBsYWluT2JqZWN0cyAmJiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5KHNlZ21lbnRbMV0pKSB7XG4gICAgICAgICAgICBpZiAoIW9wdGlvbnMuYWxsb3dQcm90b3R5cGVzKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAga2V5cy5wdXNoKHNlZ21lbnRbMV0pO1xuICAgIH1cblxuICAgIC8vIExvb3AgdGhyb3VnaCBjaGlsZHJlbiBhcHBlbmRpbmcgdG8gdGhlIGFycmF5IHVudGlsIHdlIGhpdCBkZXB0aFxuXG4gICAgdmFyIGkgPSAwO1xuICAgIHdoaWxlICgoc2VnbWVudCA9IGNoaWxkLmV4ZWMoa2V5KSkgIT09IG51bGwgJiYgaSA8IG9wdGlvbnMuZGVwdGgpIHtcbiAgICAgICAgaSArPSAxO1xuICAgICAgICBpZiAoIW9wdGlvbnMucGxhaW5PYmplY3RzICYmIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkoc2VnbWVudFsxXS5yZXBsYWNlKC9cXFt8XFxdL2csICcnKSkpIHtcbiAgICAgICAgICAgIGlmICghb3B0aW9ucy5hbGxvd1Byb3RvdHlwZXMpIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBrZXlzLnB1c2goc2VnbWVudFsxXSk7XG4gICAgfVxuXG4gICAgLy8gSWYgdGhlcmUncyBhIHJlbWFpbmRlciwganVzdCBhZGQgd2hhdGV2ZXIgaXMgbGVmdFxuXG4gICAgaWYgKHNlZ21lbnQpIHtcbiAgICAgICAga2V5cy5wdXNoKCdbJyArIGtleS5zbGljZShzZWdtZW50LmluZGV4KSArICddJyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGludGVybmFscy5wYXJzZU9iamVjdChrZXlzLCB2YWwsIG9wdGlvbnMpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoc3RyLCBvcHRzKSB7XG4gICAgdmFyIG9wdGlvbnMgPSBvcHRzIHx8IHt9O1xuICAgIG9wdGlvbnMuZGVsaW1pdGVyID0gdHlwZW9mIG9wdGlvbnMuZGVsaW1pdGVyID09PSAnc3RyaW5nJyB8fCBVdGlscy5pc1JlZ0V4cChvcHRpb25zLmRlbGltaXRlcikgPyBvcHRpb25zLmRlbGltaXRlciA6IGludGVybmFscy5kZWxpbWl0ZXI7XG4gICAgb3B0aW9ucy5kZXB0aCA9IHR5cGVvZiBvcHRpb25zLmRlcHRoID09PSAnbnVtYmVyJyA/IG9wdGlvbnMuZGVwdGggOiBpbnRlcm5hbHMuZGVwdGg7XG4gICAgb3B0aW9ucy5hcnJheUxpbWl0ID0gdHlwZW9mIG9wdGlvbnMuYXJyYXlMaW1pdCA9PT0gJ251bWJlcicgPyBvcHRpb25zLmFycmF5TGltaXQgOiBpbnRlcm5hbHMuYXJyYXlMaW1pdDtcbiAgICBvcHRpb25zLnBhcnNlQXJyYXlzID0gb3B0aW9ucy5wYXJzZUFycmF5cyAhPT0gZmFsc2U7XG4gICAgb3B0aW9ucy5hbGxvd0RvdHMgPSB0eXBlb2Ygb3B0aW9ucy5hbGxvd0RvdHMgPT09ICdib29sZWFuJyA/IG9wdGlvbnMuYWxsb3dEb3RzIDogaW50ZXJuYWxzLmFsbG93RG90cztcbiAgICBvcHRpb25zLnBsYWluT2JqZWN0cyA9IHR5cGVvZiBvcHRpb25zLnBsYWluT2JqZWN0cyA9PT0gJ2Jvb2xlYW4nID8gb3B0aW9ucy5wbGFpbk9iamVjdHMgOiBpbnRlcm5hbHMucGxhaW5PYmplY3RzO1xuICAgIG9wdGlvbnMuYWxsb3dQcm90b3R5cGVzID0gdHlwZW9mIG9wdGlvbnMuYWxsb3dQcm90b3R5cGVzID09PSAnYm9vbGVhbicgPyBvcHRpb25zLmFsbG93UHJvdG90eXBlcyA6IGludGVybmFscy5hbGxvd1Byb3RvdHlwZXM7XG4gICAgb3B0aW9ucy5wYXJhbWV0ZXJMaW1pdCA9IHR5cGVvZiBvcHRpb25zLnBhcmFtZXRlckxpbWl0ID09PSAnbnVtYmVyJyA/IG9wdGlvbnMucGFyYW1ldGVyTGltaXQgOiBpbnRlcm5hbHMucGFyYW1ldGVyTGltaXQ7XG4gICAgb3B0aW9ucy5zdHJpY3ROdWxsSGFuZGxpbmcgPSB0eXBlb2Ygb3B0aW9ucy5zdHJpY3ROdWxsSGFuZGxpbmcgPT09ICdib29sZWFuJyA/IG9wdGlvbnMuc3RyaWN0TnVsbEhhbmRsaW5nIDogaW50ZXJuYWxzLnN0cmljdE51bGxIYW5kbGluZztcblxuICAgIGlmIChcbiAgICAgICAgc3RyID09PSAnJyB8fFxuICAgICAgICBzdHIgPT09IG51bGwgfHxcbiAgICAgICAgdHlwZW9mIHN0ciA9PT0gJ3VuZGVmaW5lZCdcbiAgICApIHtcbiAgICAgICAgcmV0dXJuIG9wdGlvbnMucGxhaW5PYmplY3RzID8gT2JqZWN0LmNyZWF0ZShudWxsKSA6IHt9O1xuICAgIH1cblxuICAgIHZhciB0ZW1wT2JqID0gdHlwZW9mIHN0ciA9PT0gJ3N0cmluZycgPyBpbnRlcm5hbHMucGFyc2VWYWx1ZXMoc3RyLCBvcHRpb25zKSA6IHN0cjtcbiAgICB2YXIgb2JqID0gb3B0aW9ucy5wbGFpbk9iamVjdHMgPyBPYmplY3QuY3JlYXRlKG51bGwpIDoge307XG5cbiAgICAvLyBJdGVyYXRlIG92ZXIgdGhlIGtleXMgYW5kIHNldHVwIHRoZSBuZXcgb2JqZWN0XG5cbiAgICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKHRlbXBPYmopO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7ICsraSkge1xuICAgICAgICB2YXIga2V5ID0ga2V5c1tpXTtcbiAgICAgICAgdmFyIG5ld09iaiA9IGludGVybmFscy5wYXJzZUtleXMoa2V5LCB0ZW1wT2JqW2tleV0sIG9wdGlvbnMpO1xuICAgICAgICBvYmogPSBVdGlscy5tZXJnZShvYmosIG5ld09iaiwgb3B0aW9ucyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIFV0aWxzLmNvbXBhY3Qob2JqKTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBVdGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKTtcblxudmFyIGludGVybmFscyA9IHtcbiAgICBkZWxpbWl0ZXI6ICcmJyxcbiAgICBhcnJheVByZWZpeEdlbmVyYXRvcnM6IHtcbiAgICAgICAgYnJhY2tldHM6IGZ1bmN0aW9uIChwcmVmaXgpIHtcbiAgICAgICAgICAgIHJldHVybiBwcmVmaXggKyAnW10nO1xuICAgICAgICB9LFxuICAgICAgICBpbmRpY2VzOiBmdW5jdGlvbiAocHJlZml4LCBrZXkpIHtcbiAgICAgICAgICAgIHJldHVybiBwcmVmaXggKyAnWycgKyBrZXkgKyAnXSc7XG4gICAgICAgIH0sXG4gICAgICAgIHJlcGVhdDogZnVuY3Rpb24gKHByZWZpeCkge1xuICAgICAgICAgICAgcmV0dXJuIHByZWZpeDtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgc3RyaWN0TnVsbEhhbmRsaW5nOiBmYWxzZSxcbiAgICBza2lwTnVsbHM6IGZhbHNlLFxuICAgIGVuY29kZTogdHJ1ZVxufTtcblxuaW50ZXJuYWxzLnN0cmluZ2lmeSA9IGZ1bmN0aW9uIChvYmplY3QsIHByZWZpeCwgZ2VuZXJhdGVBcnJheVByZWZpeCwgc3RyaWN0TnVsbEhhbmRsaW5nLCBza2lwTnVsbHMsIGVuY29kZSwgZmlsdGVyLCBzb3J0LCBhbGxvd0RvdHMpIHtcbiAgICB2YXIgb2JqID0gb2JqZWN0O1xuICAgIGlmICh0eXBlb2YgZmlsdGVyID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIG9iaiA9IGZpbHRlcihwcmVmaXgsIG9iaik7XG4gICAgfSBlbHNlIGlmIChVdGlscy5pc0J1ZmZlcihvYmopKSB7XG4gICAgICAgIG9iaiA9IFN0cmluZyhvYmopO1xuICAgIH0gZWxzZSBpZiAob2JqIGluc3RhbmNlb2YgRGF0ZSkge1xuICAgICAgICBvYmogPSBvYmoudG9JU09TdHJpbmcoKTtcbiAgICB9IGVsc2UgaWYgKG9iaiA9PT0gbnVsbCkge1xuICAgICAgICBpZiAoc3RyaWN0TnVsbEhhbmRsaW5nKSB7XG4gICAgICAgICAgICByZXR1cm4gZW5jb2RlID8gVXRpbHMuZW5jb2RlKHByZWZpeCkgOiBwcmVmaXg7XG4gICAgICAgIH1cblxuICAgICAgICBvYmogPSAnJztcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIG9iaiA9PT0gJ3N0cmluZycgfHwgdHlwZW9mIG9iaiA9PT0gJ251bWJlcicgfHwgdHlwZW9mIG9iaiA9PT0gJ2Jvb2xlYW4nKSB7XG4gICAgICAgIGlmIChlbmNvZGUpIHtcbiAgICAgICAgICAgIHJldHVybiBbVXRpbHMuZW5jb2RlKHByZWZpeCkgKyAnPScgKyBVdGlscy5lbmNvZGUob2JqKV07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIFtwcmVmaXggKyAnPScgKyBvYmpdO1xuICAgIH1cblxuICAgIHZhciB2YWx1ZXMgPSBbXTtcblxuICAgIGlmICh0eXBlb2Ygb2JqID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICByZXR1cm4gdmFsdWVzO1xuICAgIH1cblxuICAgIHZhciBvYmpLZXlzO1xuICAgIGlmIChBcnJheS5pc0FycmF5KGZpbHRlcikpIHtcbiAgICAgICAgb2JqS2V5cyA9IGZpbHRlcjtcbiAgICB9IGVsc2Uge1xuICAgICAgICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKG9iaik7XG4gICAgICAgIG9iaktleXMgPSBzb3J0ID8ga2V5cy5zb3J0KHNvcnQpIDoga2V5cztcbiAgICB9XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IG9iaktleXMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgdmFyIGtleSA9IG9iaktleXNbaV07XG5cbiAgICAgICAgaWYgKHNraXBOdWxscyAmJiBvYmpba2V5XSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShvYmopKSB7XG4gICAgICAgICAgICB2YWx1ZXMgPSB2YWx1ZXMuY29uY2F0KGludGVybmFscy5zdHJpbmdpZnkob2JqW2tleV0sIGdlbmVyYXRlQXJyYXlQcmVmaXgocHJlZml4LCBrZXkpLCBnZW5lcmF0ZUFycmF5UHJlZml4LCBzdHJpY3ROdWxsSGFuZGxpbmcsIHNraXBOdWxscywgZW5jb2RlLCBmaWx0ZXIsIHNvcnQsIGFsbG93RG90cykpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdmFsdWVzID0gdmFsdWVzLmNvbmNhdChpbnRlcm5hbHMuc3RyaW5naWZ5KG9ialtrZXldLCBwcmVmaXggKyAoYWxsb3dEb3RzID8gJy4nICsga2V5IDogJ1snICsga2V5ICsgJ10nKSwgZ2VuZXJhdGVBcnJheVByZWZpeCwgc3RyaWN0TnVsbEhhbmRsaW5nLCBza2lwTnVsbHMsIGVuY29kZSwgZmlsdGVyLCBzb3J0LCBhbGxvd0RvdHMpKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB2YWx1ZXM7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChvYmplY3QsIG9wdHMpIHtcbiAgICB2YXIgb2JqID0gb2JqZWN0O1xuICAgIHZhciBvcHRpb25zID0gb3B0cyB8fCB7fTtcbiAgICB2YXIgZGVsaW1pdGVyID0gdHlwZW9mIG9wdGlvbnMuZGVsaW1pdGVyID09PSAndW5kZWZpbmVkJyA/IGludGVybmFscy5kZWxpbWl0ZXIgOiBvcHRpb25zLmRlbGltaXRlcjtcbiAgICB2YXIgc3RyaWN0TnVsbEhhbmRsaW5nID0gdHlwZW9mIG9wdGlvbnMuc3RyaWN0TnVsbEhhbmRsaW5nID09PSAnYm9vbGVhbicgPyBvcHRpb25zLnN0cmljdE51bGxIYW5kbGluZyA6IGludGVybmFscy5zdHJpY3ROdWxsSGFuZGxpbmc7XG4gICAgdmFyIHNraXBOdWxscyA9IHR5cGVvZiBvcHRpb25zLnNraXBOdWxscyA9PT0gJ2Jvb2xlYW4nID8gb3B0aW9ucy5za2lwTnVsbHMgOiBpbnRlcm5hbHMuc2tpcE51bGxzO1xuICAgIHZhciBlbmNvZGUgPSB0eXBlb2Ygb3B0aW9ucy5lbmNvZGUgPT09ICdib29sZWFuJyA/IG9wdGlvbnMuZW5jb2RlIDogaW50ZXJuYWxzLmVuY29kZTtcbiAgICB2YXIgc29ydCA9IHR5cGVvZiBvcHRpb25zLnNvcnQgPT09ICdmdW5jdGlvbicgPyBvcHRpb25zLnNvcnQgOiBudWxsO1xuICAgIHZhciBhbGxvd0RvdHMgPSB0eXBlb2Ygb3B0aW9ucy5hbGxvd0RvdHMgPT09ICd1bmRlZmluZWQnID8gZmFsc2UgOiBvcHRpb25zLmFsbG93RG90cztcbiAgICB2YXIgb2JqS2V5cztcbiAgICB2YXIgZmlsdGVyO1xuICAgIGlmICh0eXBlb2Ygb3B0aW9ucy5maWx0ZXIgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgZmlsdGVyID0gb3B0aW9ucy5maWx0ZXI7XG4gICAgICAgIG9iaiA9IGZpbHRlcignJywgb2JqKTtcbiAgICB9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkob3B0aW9ucy5maWx0ZXIpKSB7XG4gICAgICAgIG9iaktleXMgPSBmaWx0ZXIgPSBvcHRpb25zLmZpbHRlcjtcbiAgICB9XG5cbiAgICB2YXIga2V5cyA9IFtdO1xuXG4gICAgaWYgKHR5cGVvZiBvYmogIT09ICdvYmplY3QnIHx8IG9iaiA9PT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gJyc7XG4gICAgfVxuXG4gICAgdmFyIGFycmF5Rm9ybWF0O1xuICAgIGlmIChvcHRpb25zLmFycmF5Rm9ybWF0IGluIGludGVybmFscy5hcnJheVByZWZpeEdlbmVyYXRvcnMpIHtcbiAgICAgICAgYXJyYXlGb3JtYXQgPSBvcHRpb25zLmFycmF5Rm9ybWF0O1xuICAgIH0gZWxzZSBpZiAoJ2luZGljZXMnIGluIG9wdGlvbnMpIHtcbiAgICAgICAgYXJyYXlGb3JtYXQgPSBvcHRpb25zLmluZGljZXMgPyAnaW5kaWNlcycgOiAncmVwZWF0JztcbiAgICB9IGVsc2Uge1xuICAgICAgICBhcnJheUZvcm1hdCA9ICdpbmRpY2VzJztcbiAgICB9XG5cbiAgICB2YXIgZ2VuZXJhdGVBcnJheVByZWZpeCA9IGludGVybmFscy5hcnJheVByZWZpeEdlbmVyYXRvcnNbYXJyYXlGb3JtYXRdO1xuXG4gICAgaWYgKCFvYmpLZXlzKSB7XG4gICAgICAgIG9iaktleXMgPSBPYmplY3Qua2V5cyhvYmopO1xuICAgIH1cblxuICAgIGlmIChzb3J0KSB7XG4gICAgICAgIG9iaktleXMuc29ydChzb3J0KTtcbiAgICB9XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IG9iaktleXMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgdmFyIGtleSA9IG9iaktleXNbaV07XG5cbiAgICAgICAgaWYgKHNraXBOdWxscyAmJiBvYmpba2V5XSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICBrZXlzID0ga2V5cy5jb25jYXQoaW50ZXJuYWxzLnN0cmluZ2lmeShvYmpba2V5XSwga2V5LCBnZW5lcmF0ZUFycmF5UHJlZml4LCBzdHJpY3ROdWxsSGFuZGxpbmcsIHNraXBOdWxscywgZW5jb2RlLCBmaWx0ZXIsIHNvcnQsIGFsbG93RG90cykpO1xuICAgIH1cblxuICAgIHJldHVybiBrZXlzLmpvaW4oZGVsaW1pdGVyKTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBoZXhUYWJsZSA9IChmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGFycmF5ID0gbmV3IEFycmF5KDI1Nik7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCAyNTY7ICsraSkge1xuICAgICAgICBhcnJheVtpXSA9ICclJyArICgoaSA8IDE2ID8gJzAnIDogJycpICsgaS50b1N0cmluZygxNikpLnRvVXBwZXJDYXNlKCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGFycmF5O1xufSgpKTtcblxuZXhwb3J0cy5hcnJheVRvT2JqZWN0ID0gZnVuY3Rpb24gKHNvdXJjZSwgb3B0aW9ucykge1xuICAgIHZhciBvYmogPSBvcHRpb25zLnBsYWluT2JqZWN0cyA/IE9iamVjdC5jcmVhdGUobnVsbCkgOiB7fTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNvdXJjZS5sZW5ndGg7ICsraSkge1xuICAgICAgICBpZiAodHlwZW9mIHNvdXJjZVtpXSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIG9ialtpXSA9IHNvdXJjZVtpXTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBvYmo7XG59O1xuXG5leHBvcnRzLm1lcmdlID0gZnVuY3Rpb24gKHRhcmdldCwgc291cmNlLCBvcHRpb25zKSB7XG4gICAgaWYgKCFzb3VyY2UpIHtcbiAgICAgICAgcmV0dXJuIHRhcmdldDtcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIHNvdXJjZSAhPT0gJ29iamVjdCcpIHtcbiAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkodGFyZ2V0KSkge1xuICAgICAgICAgICAgdGFyZ2V0LnB1c2goc291cmNlKTtcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdGFyZ2V0ID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgdGFyZ2V0W3NvdXJjZV0gPSB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIFt0YXJnZXQsIHNvdXJjZV07XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGFyZ2V0O1xuICAgIH1cblxuICAgIGlmICh0eXBlb2YgdGFyZ2V0ICE9PSAnb2JqZWN0Jykge1xuICAgICAgICByZXR1cm4gW3RhcmdldF0uY29uY2F0KHNvdXJjZSk7XG4gICAgfVxuXG4gICAgdmFyIG1lcmdlVGFyZ2V0ID0gdGFyZ2V0O1xuICAgIGlmIChBcnJheS5pc0FycmF5KHRhcmdldCkgJiYgIUFycmF5LmlzQXJyYXkoc291cmNlKSkge1xuICAgICAgICBtZXJnZVRhcmdldCA9IGV4cG9ydHMuYXJyYXlUb09iamVjdCh0YXJnZXQsIG9wdGlvbnMpO1xuICAgIH1cblxuXHRyZXR1cm4gT2JqZWN0LmtleXMoc291cmNlKS5yZWR1Y2UoZnVuY3Rpb24gKGFjYywga2V5KSB7XG4gICAgICAgIHZhciB2YWx1ZSA9IHNvdXJjZVtrZXldO1xuXG4gICAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoYWNjLCBrZXkpKSB7XG4gICAgICAgICAgICBhY2Nba2V5XSA9IGV4cG9ydHMubWVyZ2UoYWNjW2tleV0sIHZhbHVlLCBvcHRpb25zKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGFjY1trZXldID0gdmFsdWU7XG4gICAgICAgIH1cblx0XHRyZXR1cm4gYWNjO1xuICAgIH0sIG1lcmdlVGFyZ2V0KTtcbn07XG5cbmV4cG9ydHMuZGVjb2RlID0gZnVuY3Rpb24gKHN0cikge1xuICAgIHRyeSB7XG4gICAgICAgIHJldHVybiBkZWNvZGVVUklDb21wb25lbnQoc3RyLnJlcGxhY2UoL1xcKy9nLCAnICcpKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIHJldHVybiBzdHI7XG4gICAgfVxufTtcblxuZXhwb3J0cy5lbmNvZGUgPSBmdW5jdGlvbiAoc3RyKSB7XG4gICAgLy8gVGhpcyBjb2RlIHdhcyBvcmlnaW5hbGx5IHdyaXR0ZW4gYnkgQnJpYW4gV2hpdGUgKG1zY2RleCkgZm9yIHRoZSBpby5qcyBjb3JlIHF1ZXJ5c3RyaW5nIGxpYnJhcnkuXG4gICAgLy8gSXQgaGFzIGJlZW4gYWRhcHRlZCBoZXJlIGZvciBzdHJpY3RlciBhZGhlcmVuY2UgdG8gUkZDIDM5ODZcbiAgICBpZiAoc3RyLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZXR1cm4gc3RyO1xuICAgIH1cblxuICAgIHZhciBzdHJpbmcgPSB0eXBlb2Ygc3RyID09PSAnc3RyaW5nJyA/IHN0ciA6IFN0cmluZyhzdHIpO1xuXG4gICAgdmFyIG91dCA9ICcnO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc3RyaW5nLmxlbmd0aDsgKytpKSB7XG4gICAgICAgIHZhciBjID0gc3RyaW5nLmNoYXJDb2RlQXQoaSk7XG5cbiAgICAgICAgaWYgKFxuICAgICAgICAgICAgYyA9PT0gMHgyRCB8fCAvLyAtXG4gICAgICAgICAgICBjID09PSAweDJFIHx8IC8vIC5cbiAgICAgICAgICAgIGMgPT09IDB4NUYgfHwgLy8gX1xuICAgICAgICAgICAgYyA9PT0gMHg3RSB8fCAvLyB+XG4gICAgICAgICAgICAoYyA+PSAweDMwICYmIGMgPD0gMHgzOSkgfHwgLy8gMC05XG4gICAgICAgICAgICAoYyA+PSAweDQxICYmIGMgPD0gMHg1QSkgfHwgLy8gYS16XG4gICAgICAgICAgICAoYyA+PSAweDYxICYmIGMgPD0gMHg3QSkgLy8gQS1aXG4gICAgICAgICkge1xuICAgICAgICAgICAgb3V0ICs9IHN0cmluZy5jaGFyQXQoaSk7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChjIDwgMHg4MCkge1xuICAgICAgICAgICAgb3V0ID0gb3V0ICsgaGV4VGFibGVbY107XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChjIDwgMHg4MDApIHtcbiAgICAgICAgICAgIG91dCA9IG91dCArIChoZXhUYWJsZVsweEMwIHwgKGMgPj4gNildICsgaGV4VGFibGVbMHg4MCB8IChjICYgMHgzRildKTtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGMgPCAweEQ4MDAgfHwgYyA+PSAweEUwMDApIHtcbiAgICAgICAgICAgIG91dCA9IG91dCArIChoZXhUYWJsZVsweEUwIHwgKGMgPj4gMTIpXSArIGhleFRhYmxlWzB4ODAgfCAoKGMgPj4gNikgJiAweDNGKV0gKyBoZXhUYWJsZVsweDgwIHwgKGMgJiAweDNGKV0pO1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICBpICs9IDE7XG4gICAgICAgIGMgPSAweDEwMDAwICsgKCgoYyAmIDB4M0ZGKSA8PCAxMCkgfCAoc3RyaW5nLmNoYXJDb2RlQXQoaSkgJiAweDNGRikpO1xuICAgICAgICBvdXQgKz0gKGhleFRhYmxlWzB4RjAgfCAoYyA+PiAxOCldICsgaGV4VGFibGVbMHg4MCB8ICgoYyA+PiAxMikgJiAweDNGKV0gKyBoZXhUYWJsZVsweDgwIHwgKChjID4+IDYpICYgMHgzRildICsgaGV4VGFibGVbMHg4MCB8IChjICYgMHgzRildKTtcbiAgICB9XG5cbiAgICByZXR1cm4gb3V0O1xufTtcblxuZXhwb3J0cy5jb21wYWN0ID0gZnVuY3Rpb24gKG9iaiwgcmVmZXJlbmNlcykge1xuICAgIGlmICh0eXBlb2Ygb2JqICE9PSAnb2JqZWN0JyB8fCBvYmogPT09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIG9iajtcbiAgICB9XG5cbiAgICB2YXIgcmVmcyA9IHJlZmVyZW5jZXMgfHwgW107XG4gICAgdmFyIGxvb2t1cCA9IHJlZnMuaW5kZXhPZihvYmopO1xuICAgIGlmIChsb29rdXAgIT09IC0xKSB7XG4gICAgICAgIHJldHVybiByZWZzW2xvb2t1cF07XG4gICAgfVxuXG4gICAgcmVmcy5wdXNoKG9iaik7XG5cbiAgICBpZiAoQXJyYXkuaXNBcnJheShvYmopKSB7XG4gICAgICAgIHZhciBjb21wYWN0ZWQgPSBbXTtcblxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG9iai5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBvYmpbaV0gIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgY29tcGFjdGVkLnB1c2gob2JqW2ldKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBjb21wYWN0ZWQ7XG4gICAgfVxuXG4gICAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhvYmopO1xuICAgIGZvciAodmFyIGogPSAwOyBqIDwga2V5cy5sZW5ndGg7ICsraikge1xuICAgICAgICB2YXIga2V5ID0ga2V5c1tqXTtcbiAgICAgICAgb2JqW2tleV0gPSBleHBvcnRzLmNvbXBhY3Qob2JqW2tleV0sIHJlZnMpO1xuICAgIH1cblxuICAgIHJldHVybiBvYmo7XG59O1xuXG5leHBvcnRzLmlzUmVnRXhwID0gZnVuY3Rpb24gKG9iaikge1xuICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwob2JqKSA9PT0gJ1tvYmplY3QgUmVnRXhwXSc7XG59O1xuXG5leHBvcnRzLmlzQnVmZmVyID0gZnVuY3Rpb24gKG9iaikge1xuICAgIGlmIChvYmogPT09IG51bGwgfHwgdHlwZW9mIG9iaiA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHJldHVybiAhIShvYmouY29uc3RydWN0b3IgJiYgb2JqLmNvbnN0cnVjdG9yLmlzQnVmZmVyICYmIG9iai5jb25zdHJ1Y3Rvci5pc0J1ZmZlcihvYmopKTtcbn07XG4iXX0=
