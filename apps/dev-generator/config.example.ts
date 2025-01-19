import type { GeneratorConfig } from '@imerss/inat-curated-species-list-tools';

const config: GeneratorConfig = {
  curators: [],
  taxonId: 1,
  placeId: 1,
  speciesDataFilename: 'species-data.json',
  showLastGeneratedDate: true,
  baselineEndDate: '2024-01-01',
  trackNewAdditions: true,
  newAdditionsFilename: 'new-additions-data.json',
  trackTaxonChanges: true,
  taxonChangesFilename: 'taxon-changes-data.json',
};

export default config;
