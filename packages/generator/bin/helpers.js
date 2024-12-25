"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.splitStringByComma = exports.getShortestUniqueKey = exports.capitalizeFirstLetter = exports.formatNum = exports.invertObj = void 0;
var nanoid_1 = require("nanoid");
var invertObj = function (data) { return Object.fromEntries(Object.entries(data).map(function (_a) {
    var key = _a[0], value = _a[1];
    return [value, key];
})); };
exports.invertObj = invertObj;
var formatNum = function (num) { return new Intl.NumberFormat('en-US').format(num); };
exports.formatNum = formatNum;
var capitalizeFirstLetter = function (str) { return str.charAt(0).toUpperCase() + str.slice(1); };
exports.capitalizeFirstLetter = capitalizeFirstLetter;
var generatedKeys = {};
var currKeyLength = 1;
/**
 * Helper method used for data minimization. It returns a unique key of the shortest length available.
 *
 * This method could be improved.
 */
var getShortestUniqueKey = function () {
    var key = '';
    for (var i = 0; i < 20; i++) {
        var currKey = (0, nanoid_1.nanoid)(currKeyLength);
        if (!generatedKeys[currKey]) {
            key = currKey;
            generatedKeys[currKey] = true;
            break;
        }
    }
    if (key) {
        return key;
    }
    currKeyLength++;
    return (0, exports.getShortestUniqueKey)();
};
exports.getShortestUniqueKey = getShortestUniqueKey;
var splitStringByComma = function (fullStr) { return fullStr.split(',').map(function (str) { return str.trim(); }); };
exports.splitStringByComma = splitStringByComma;
