import type { GeneratorConfig } from '@imerss/inat-curated-species-list-tools';

const config: GeneratorConfig = {
  curators: ['oneofthedavesiknow', 'gpohl', 'crispinguppy'],
  taxonId: 47157,
  placeId: 7085,
  speciesDataFilename: 'species-data.json',
  newAdditionsFilename: 'new-additions-data.json',
  trackNewAdditions: true,
  newAdditionsStartDate: '2024-01-01',
  showLastGeneratedDate: true,
};

export default config;
