import { CuratedSpeciesData, CuratedSpeciesDataMinified } from './types';

export const invertObj = (data: object) => Object.fromEntries(Object.entries(data).map(([key, value]) => [value, key]));

export const unminifySpeciesData = (data: CuratedSpeciesDataMinified): CuratedSpeciesData => {
  const taxons = data.taxons;
  const map = invertObj(data.taxonMap);

  const fullData: CuratedSpeciesData = {};
  Object.keys(data.taxonData).forEach((taxonId) => {
    // Assumes that this is now an ordered array of the taxons specified in visibleTaxons. The user should
    // have supplied the same list of taxons used in creating the minified file
    const rowData: string[] = data.taxonData[taxonId]!.split('|');
    const expandedTaxonData: any = {}; // find out what this is

    for (let i = 0; i < taxons.length; i++) {
      const visibleTaxon = taxons[i];

      if (!visibleTaxon) {
        continue;
      }

      // only the species row isn't minified. Everything else is found in the map
      if (visibleTaxon === 'species') {
        expandedTaxonData[visibleTaxon] = rowData[i];
      } else {
        // not every taxon will be filled for each row
        if (rowData[i] && !map[rowData[i]!]) {
          console.log('missing', i, rowData);
        }
        expandedTaxonData[visibleTaxon] = rowData[i] ? map[rowData[i]!] : '';
      }
    }

    fullData[taxonId] = {
      data: expandedTaxonData,
      count: rowData[rowData.length - 1] as unknown as number,
    };
  });

  return fullData;
};
