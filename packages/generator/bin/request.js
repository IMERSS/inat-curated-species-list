"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDataPacket = exports.downloadDataPacket = exports.resetData = void 0;
/**
 * This file contains a various methods for parsing and minify iNat data.
 */
var query_string_1 = __importDefault(require("query-string"));
var node_fetch_1 = __importDefault(require("node-fetch"));
var constants_1 = require("./constants");
var logs_1 = require("./logs");
var lastId = null;
var curatedSpeciesData = {};
var newAdditions = {};
var numResults = 0;
var numRequests = 0;
var getTaxonomy = function (ancestors, taxonsToReturn) {
    return ancestors.reduce(function (acc, curr) {
        if (taxonsToReturn.indexOf(curr.rank) !== -1) {
            acc[curr.rank] = curr.name;
        }
        return acc;
    }, {});
};
// weird...
var resetData = function () {
    curatedSpeciesData = {};
    newAdditions = {};
    numResults = 0;
};
exports.resetData = resetData;
/**
 * Simple high-level method that just downloads a chunk of data from iNat and stores the result in a temporary file on disk.
 * Later steps parse, convert and minify the relevant data.
 */
var downloadDataPacket = function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
    var rawResponse, e_1, resp, totalResults;
    var curators = _b.curators, packetNum = _b.packetNum, placeId = _b.placeId, taxonId = _b.taxonId, tempFolder = _b.tempFolder, logger = _b.logger;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 2, , 3]);
                return [4 /*yield*/, (0, exports.getDataPacket)(placeId, taxonId, curators, logger)];
            case 1:
                rawResponse = _c.sent();
                return [3 /*break*/, 3];
            case 2:
                e_1 = _c.sent();
                logger.log('error', e_1);
                return [3 /*break*/, 3];
            case 3: return [4 /*yield*/, rawResponse.json()];
            case 4:
                resp = (_c.sent());
                totalResults = resp.total_results;
                logger.log('info', 'request successful'); //
                if (totalResults <= 0) {
                    return [2 /*return*/, {
                            totalResults: totalResults,
                            numRequests: numRequests,
                        }];
                }
                else {
                    if (!numResults) {
                        numResults = totalResults;
                        numRequests = Math.ceil(totalResults / constants_1.INAT_REQUEST_RESULTS_PER_PAGE);
                    }
                }
                // write the entire API response to a file. We'll extract what we need once the data's fully downloaded
                (0, logs_1.logPacket)(packetNum, tempFolder, resp);
                // the iNat API works by passing in a property to return data above a particular ID. This tracks it for subsequent requests
                lastId = resp.results[resp.results.length - 1].id;
                return [2 /*return*/, {
                        totalResults: totalResults,
                        numRequests: numRequests,
                    }];
        }
    });
}); };
exports.downloadDataPacket = downloadDataPacket;
var getDataPacket = function (placeId, taxonId, curators, logger) { return __awaiter(void 0, void 0, void 0, function () {
    var apiParams, paramsStr, apiUrl;
    return __generator(this, function (_a) {
        apiParams = {
            place_id: placeId,
            taxon_id: taxonId,
            order: 'asc',
            order_by: 'id',
            per_page: constants_1.INAT_REQUEST_RESULTS_PER_PAGE,
            verifiable: 'any',
            ident_user_id: curators,
        };
        // refactor
        if (numResults && lastId) {
            apiParams.id_above = lastId;
        }
        paramsStr = query_string_1.default.stringify(apiParams);
        apiUrl = "".concat(constants_1.INAT_API_URL, "?").concat(paramsStr);
        logger.log('info', "Request: ".concat(apiUrl));
        return [2 /*return*/, (0, node_fetch_1.default)(apiUrl)];
    });
}); };
exports.getDataPacket = getDataPacket;
