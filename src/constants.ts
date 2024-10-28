import { Taxon } from './types';

// for the DemoTable settings
export const DEMO_DEFAULT_CURATOR_INAT_USERNAMES = ['gpohl', 'crispinguppy', 'oneofthedavesiknow'];
export const DEMO_DEFAULT_TAXON_ID = 47157;
export const DEMO_DEFAULT_PLACE_ID = 7085;
export const DEMO_MAX_OBSERVATIONS = 1000;

// nope! Drop these
export const GENERATED_FILENAME_FOLDER = './dist';
export const GENERATED_FILENAME = 'data9.json';

export const INAT_BASE_URL = 'https://www.inaturalist.org/observations';
export const INAT_API_URL = 'https://api.inaturalist.org/v1/observations';

// enter URL of generated data source here (for standalone version)
export const DATA_URL = 'https://sisyphean.ca/inat/curated-bc-leps-list2.json';
export const VISIBLE_TAXONS: Taxon[] = ['superfamily', 'family', 'subfamily', 'tribe', 'genus', 'species'];
export const ALL_TAXONS = [
  'kingdom',
  'phylum',
  'subphylum',
  'class',
  'subclass',
  'order',
  'superfamily',
  'family',
  'subfamily',
  'tribe',
  'subtribe',
  'genus',
  'subgenus',
  'species',
];
export const INAT_REQUEST_RESULTS_PER_PAGE = 200;

// ------------------------------------------------------------------------------------------------------------

// DEV / DEBUGGING SETTINGS

// when this is enabled, it generates a copy of the raw responses from iNat into the dist/ folder, one for each package.
// This spares the iNat servers being unnecessarily pinged. After the files are generated, disable this again and set
// LOAD_DATA_FROM_LOCAL_FILES to true to load the data locally
export const ENABLE_DATA_BACKUP = false;
export const LOAD_DATA_FROM_LOCAL_FILES = false;
