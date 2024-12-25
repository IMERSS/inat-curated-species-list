"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.minifySpeciesData = void 0;
var helpers_1 = require("./helpers");
var taxonsToMinify = {
    kingdom: true,
    phylum: true,
    subphylum: true,
    class: true,
    subclass: true,
    order: true,
    superfamily: true,
    family: true,
    subfamily: true,
    tribe: true,
    genus: true,
    section: true,
};
var minifySpeciesData = function (data, targetTaxons) {
    var minifiedData = {
        taxonMap: {},
        taxonData: {},
    };
    Object.keys(data).forEach(function (taxonId) {
        // keyed by rank
        var rowData = {};
        // replace all non-species taxon strings (Pterygota, or whatever) with a short code in taxonMap
        Object.keys(data[taxonId].data).forEach(function (taxonRank) {
            var taxonName = data[taxonId].data[taxonRank];
            if (taxonsToMinify[taxonRank]) {
                // if we've already minified this particular taxon name (note: no reason this might be a totally
                // different rank from the original minification - it doesn't matter - point is that the STRING is identical)
                if (minifiedData.taxonMap[taxonName]) {
                    rowData[taxonRank] = minifiedData.taxonMap[taxonName];
                }
                else {
                    var key = (0, helpers_1.getShortestUniqueKey)();
                    minifiedData.taxonMap[taxonName] = key;
                    rowData[taxonRank] = key;
                }
            }
            else {
                rowData[taxonRank] = taxonName;
            }
        });
        var row = targetTaxons.map(function (t) { return (rowData[t] ? rowData[t] : ''); }).join('|');
        minifiedData.taxonData[taxonId] = "".concat(row, "|").concat(data[taxonId].count);
    });
    return minifiedData;
};
exports.minifySpeciesData = minifySpeciesData;
// export const unminifySpeciesData = (data: CuratedSpeciesData, visibleTaxons: Taxon[]) => {
//   const map = invertObj(data.taxonMap);
//   const fullData: CuratedSpeciesData = {};
//   Object.keys(data.taxonData).forEach((taxonId) => {
//     // Assumes that this is now an ordered array of the taxons specified in visibleTaxons. The user should
//     // have supplied the same list of taxons used in creating the minified file
//     const rowData: string[] = data.taxonData[taxonId].split('|');
//     const expandedTaxonData: TaxonMinificationDataMap = {};
//     for (let i = 0; i < visibleTaxons.length; i++) {
//       const visibleTaxon = visibleTaxons[i];
//       // only the species row isn't minified. Everything else is found in the map
//       if (visibleTaxon === 'species') {
//         expandedTaxonData[visibleTaxon] = rowData[i];
//       } else {
//         // not every taxon will be filled for each row
//         if (rowData[i] && !map[rowData[i]]) {
//           console.log('missing', i, rowData);
//         }
//         expandedTaxonData[visibleTaxon] = rowData[i] ? map[rowData[i]] : '';
//       }
//     }
//     fullData[taxonId] = {
//       data: expandedTaxonData,
//       count: rowData[rowData.length - 1],
//     };
//   });
//   return fullData;
// };
// export const minifyNewAdditionsData = (newAdditions) => {
//   const newAdditionsByYear = {};
//   Object.keys(newAdditions).forEach((taxonId) => {
//     const row = newAdditions[taxonId];
//     const curatorConfirmationDate = new Date(row.curatorConfirmationDate);
//     const year = curatorConfirmationDate.getFullYear();
//     // if (!newAdditionsByYear[year]) {
//     //   newAdditionsByYear[year] = [];
//     // }
//     // newAdditionsByYear[year].push(newAdditions[taxonId]);
//   });
//   console.log({ before: newAdditions, newAdditionsByYear });
//   return newAdditions;
// };
