"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractSpecies = exports.getDataPacket = exports.downloadDataByPacket = exports.resetData = void 0;
/**
 * This file contains a various methods for parsing and minify iNat data.
 */
var query_string_1 = __importDefault(require("query-string"));
var constants_1 = require("./constants");
var helpers_1 = require("./helpers");
var packetLoggerRowId;
var lastId = null;
var curatedSpeciesData = {};
var newAdditions = {};
var numResults = 0;
var getTaxonomy = function (ancestors, taxonsToReturn) {
    return ancestors.reduce(function (acc, curr) {
        if (taxonsToReturn.indexOf(curr.rank) !== -1) {
            acc[curr.rank] = curr.name;
        }
        return acc;
    }, {});
};
var resetData = function () {
    curatedSpeciesData = {};
    newAdditions = {};
    numResults = 0;
};
exports.resetData = resetData;
var downloadDataByPacket = function (args) {
    var curators = args.curators, visibleTaxons = args.visibleTaxons, packetNum = args.packetNum, placeId = args.placeId, taxonId = args.taxonId, logger = args.logger, maxResults = args.maxResults, onSuccess = args.onSuccess, onError = args.onError;
    (0, exports.getDataPacket)(packetNum, placeId, taxonId, curators)
        .then(function (resp) {
        // generate the files as backup so we don't have to ping iNat all the time while testing
        // if (ENABLE_DATA_BACKUP) {
        //   fs.writeFileSync(
        //     path.resolve(__dirname, `../dist/packet-${packetNum}.json`),
        //     JSON.stringify(resp, null, '\t'),
        //     'utf-8',
        //   );
        // }
        if (resp.total_results <= 0) {
            logger.current.addLogRow("No observations found.", 'info');
            onSuccess(curatedSpeciesData, newAdditions);
            return;
        }
        else {
            // only the first request has the correct number of total results
            if (!numResults) {
                numResults = resp.total_results;
            }
        }
        // the data returned by iNat is enormous. I found on my server, loading everything into memory caused
        // memory issues (hard-disk space, I think). So instead, here we extract the necessary information right away
        (0, exports.extractSpecies)(resp, curators, visibleTaxons);
        lastId = resp.results[resp.results.length - 1].id;
        var numResultsFormatted = (0, helpers_1.formatNum)(numResults);
        var maxResultsLimit = Math.min(numResults, maxResults || Infinity);
        var maxResultsLimitMsg = '';
        if (maxResults) {
            maxResultsLimitMsg =
                logFormat === 'html' ? "(Results limited to <b>".concat(maxResults, "</b>)") : "(Results limited to ".concat(maxResults, ")");
        }
        if (packetNum * constants_1.INAT_REQUEST_RESULTS_PER_PAGE < maxResultsLimit) {
            if (!packetLoggerRowId) {
                var num = new Intl.NumberFormat('en-US').format(resp.total_results);
                var msg = logFormat === 'html' ? "<b>".concat(num, "</b> observations found.") : "".concat(num, " observations found.");
                logger.current.addLogRow(msg, 'info');
                packetLoggerRowId = logger.current.addLogRow("Retrieved ".concat((0, helpers_1.formatNum)(constants_1.INAT_REQUEST_RESULTS_PER_PAGE), "/").concat(numResultsFormatted, " observations. ").concat(maxResultsLimitMsg), 'info');
            }
            else {
                logger.current.replaceLogRow(packetLoggerRowId, "Retrieved ".concat((0, helpers_1.formatNum)(constants_1.INAT_REQUEST_RESULTS_PER_PAGE * packetNum), "/").concat(numResultsFormatted, " observations. ").concat(maxResultsLimitMsg), 'info');
            }
            (0, exports.downloadDataByPacket)(__assign(__assign({}, args), { logger: logger, packetNum: packetNum + 1 }));
        }
        else {
            logger.current.replaceLogRow(packetLoggerRowId, "Retrieved ".concat(numResultsFormatted, "/").concat(numResultsFormatted, " observations. ").concat(maxResultsLimitMsg), 'info');
            onSuccess(curatedSpeciesData, newAdditions);
        }
    })
        .catch(onError);
};
exports.downloadDataByPacket = downloadDataByPacket;
var getDataPacket = function (packetNum, placeId, taxonId, curators) {
    // if (LOAD_DATA_FROM_LOCAL_FILES) {
    //   return new Promise((resolve) => {
    //     const fileContent = fs.readFileSync(path.resolve(__dirname, `../dist/packet-${packetNum}.json`), 'utf-8');
    //     resolve(JSON.parse(fileContent.toString()));
    //   });
    // }
    var apiParams = {
        place_id: placeId,
        taxon_id: taxonId,
        order: 'asc',
        order_by: 'id',
        per_page: constants_1.INAT_REQUEST_RESULTS_PER_PAGE,
        verifiable: 'any',
        ident_user_id: curators,
    };
    if (numResults && lastId) {
        apiParams.id_above = lastId;
    }
    var paramsStr = query_string_1.default.stringify(apiParams);
    var apiUrl = "".concat(constants_1.INAT_API_URL, "?").concat(paramsStr);
    return fetch(apiUrl).then(function (resp) { return resp.json(); });
};
exports.getDataPacket = getDataPacket;
// export const removeExistingNewAddition = (taxonId: number, data) => {
//   Object.keys(data).forEach((year) => {
//     if (data[year][taxonId]) {
//       delete data[year][taxonId];
//     }
//   });
// };
var extractSpecies = function (rawData, curators, taxonsToReturn) {
    var curatorArray = (0, helpers_1.splitStringByComma)(curators);
    rawData.results.forEach(function (obs) {
        obs.identifications.forEach(function (ident) {
            if (curatorArray.indexOf(ident.user.login) === -1) {
                return;
            }
            if (!ident.current) {
                return;
            }
            // ignore anything that isn't a species. Currently we're ignoring subspecies data and anything in a more general
            // rank isn't of use
            if (ident.taxon.rank !== 'species') {
                return;
            }
            // the data from the server is sorted by ID - oldest to newest - so here we've found the first *observation* of a species
            // that meets our curated reviewer requirements. This tracks when the species was *first confirmed* by a curated reviewer,
            // which might be vastly different from when the sighting was actually made
            if (!curatedSpeciesData[ident.taxon_id]) {
                var taxonomy = getTaxonomy(ident.taxon.ancestors, taxonsToReturn);
                taxonomy.species = ident.taxon.name;
                curatedSpeciesData[ident.taxon_id] = { data: taxonomy, count: 1 };
                // note: count just tracks how many observations have been reviewed and confirmed by our curators, not by anyone
            }
            else {
                curatedSpeciesData[ident.taxon_id].count++;
            }
            // now onto the New Additions section
            // track the earliest confirmation of a species by any user on the ignore list. Once all the data is gathered up, we:
            //    (a) ignore any records earlier than the earliest confirmation
            //    (b)
            // if (!newAdditions[ident.taxon.id] || newAdditions[ident.taxon.id].curatorConfirmationDate < ident.created_at) {
            //   const taxonomy = getTaxonomy(ident.taxon.ancestors, taxonsToReturn);
            //   newAdditions[ident.taxon.id] = {
            //     taxonomy,
            //     species: ident.taxon.name,
            //     observerUsername: obs.user.login,
            //     observerName: obs.user.name,
            //     obsDate: ident.created_at,
            //     // obsId: ident.taxon_id,
            //     obsPhoto: obs.photos && obs.photos.length > 0 ? obs.photos[0].url : null,
            //     url: obs.uri,
            //     curatorConfirmationDate: ident.created_at,
            //   };
            // }
        });
    });
};
exports.extractSpecies = extractSpecies;
