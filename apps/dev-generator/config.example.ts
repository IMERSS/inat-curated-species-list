import type { GeneratorConfig } from '@imerss/inat-curated-species-list-tools';

const config: GeneratorConfig = {
  curators: [],
  taxonId: 1,
  placeId: 1,
  speciesDataFilename: 'species-data.json',
  trackNewAdditions: true,
  newAdditionsFilename: 'new-additions-data.json',
  newAdditionsStartDate: '2024-01-01',
  showLastGeneratedDate: true,
};

export default config;
