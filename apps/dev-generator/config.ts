import type { GeneratorConfig } from '@imerss/inat-curated-species-list-tools';

const config: GeneratorConfig = {
  curators: ['oneofthedavesiknow', 'gpohl', 'crispinguppy'],
  taxonId: 47157,
  placeId: 7085,
  speciesDataFilename: 'species-data.json', // TODO make these required
  showLastGeneratedDate: true,
  baselineEndDate: '2024-01-01',
  trackNewAdditions: true,
  trackTaxonChanges: true,
  newAdditionsFilename: 'new-additions-data.json',
  taxonChangesFilename: 'taxon-changes-data.json',
  omitTaxonChangeIds: [136709],
  tempFolder: './temp',

  // TODO rename this or fix the generator logic
  debug: {
    enabled: true,
    species: false,
    newAdditions: false,
    taxonChanges: true,
  },
};

export default config;
