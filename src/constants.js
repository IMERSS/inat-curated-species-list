/**
 * These are the default values that appear in the interface after running `npm run start`. They're also used by the
 * script to generate the static results, when running `node generate.js`.
 */
export const USERS = 'gpohl,oneofthedavesiknow,gpohl,crispinguppy';
export const TAXON_ID = '47157';
export const PLACE_ID = '7085';
export const GENERATED_FILENAME_FOLDER = './dist';
export const GENERATED_FILENAME = 'data9.json';

export const DATA_URL = 'https://sisyphean.ca/inat/curated-bc-leps-list2.json'; // enter URL of generated data source here (for standalone version)
export const VISIBLE_TAXONS = ['superfamily', 'family', 'subfamily', 'tribe', 'genus', 'species'];
export const ALL_TAXONS = [
    'kingdom', 'phylum', 'subphylum', 'class', 'subclass', 'order', 'superfamily', 'family', 'subfamily', 'tribe',
    'subtribe', 'genus', 'subgenus', 'species'
];

// used for the new additions feature, this filters out any observations made by these users
export const NEW_ADDITIONS_USER_IGNORE_LIST = ['cfs-nfrc'];