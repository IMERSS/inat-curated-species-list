import { Taxon } from '@imerss/inat-curated-species-list-types';

export const INAT_API_URL = 'https://api.inaturalist.org/v1/observations';
export const INAT_REQUEST_RESULTS_PER_PAGE = 200;
export const DEFAULT_TAXONS: Taxon[] = ['superfamily', 'family', 'subfamily', 'tribe', 'genus', 'species'];
