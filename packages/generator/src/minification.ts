/**
 * The data needed for this package is very large, after extracting only what we need from the iNat requests. This file
 * contains some helpers to minimize and expand the raw data so requests to the data source are kept as small as possible.
 */
import { CuratedSpeciesData, Taxon } from '../types/generator.types';
import { getShortestUniqueKey } from './helpers';

export type TaxonsToMinifyMap = Partial<Record<Taxon, boolean>>;
export type TaxonMinificationDataMap = Partial<Record<string, string>>;

const taxonsToMinify: TaxonsToMinifyMap = {
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

type MinifiedData = {
  taxonMap: TaxonMinificationDataMap;
  taxonData: {
    [taxonName: string]: string;
  };
};

export const minifySpeciesData = (data: CuratedSpeciesData, targetTaxons: Taxon[]) => {
  const minifiedData: MinifiedData = {
    taxonMap: {},
    taxonData: {},
  };

  Object.keys(data).forEach((taxonId) => {
    // keyed by rank
    const rowData: Partial<Record<Taxon, string>> = {};

    // replace all non-species taxon strings (Pterygota, or whatever) with a short code in taxonMap
    (Object.keys(data[taxonId].data) as Taxon[]).forEach((taxonRank) => {
      const taxonName = data[taxonId].data[taxonRank];

      if (taxonsToMinify[taxonRank]) {
        // if we've already minified this particular taxon name (note: no reason this might be a totally
        // different rank from the original minification - it doesn't matter - point is that the STRING is identical)
        if (minifiedData.taxonMap[taxonName]) {
          rowData[taxonRank] = minifiedData.taxonMap[taxonName];
        } else {
          const key = getShortestUniqueKey();
          minifiedData.taxonMap[taxonName] = key;
          rowData[taxonRank] = key;
        }
      } else {
        rowData[taxonRank] = taxonName;
      }
    });

    const row = targetTaxons.map((t) => (rowData[t] ? rowData[t] : '')).join('|');
    minifiedData.taxonData[taxonId] = `${row}|${data[taxonId].count}`;
  });

  return minifiedData;
};

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
