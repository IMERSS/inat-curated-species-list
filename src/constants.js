/**
 * These are the default values that appear in the interface after running `npm run start`. They're also used by the
 * script to generate the static results, when running `node generate.js`.
 */
export const USERS = 'gpohl,crispinguppy,oneofthedavesiknow'; // TODO use array for consistency
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

// used for the new additions feature. If your data input process involved defining initial stub iNat observations for species known to be in the 
// region, but haven't been actually observed yet, this option filters those results out. So any species added by this inat username will be omitted 
// from the "New Additions" section, and only more recent confirmations by the curators will be listed
// export const NEW_ADDITIONS_IGNORE_SPECIES_OBSERVED_BY = ['cfs-nfrc'];


// DEV / DEBUGGING SETTINGS

// when this is enabled, it generates a copy of the raw responses from iNat into the dist/ folder, one for each package. 
// This spares the iNat servers being unnecessarily pinged. After the files are generated, disable this again and set
// LOAD_DATA_FROM_LOCAL_FILES to true to load the data locally
export const ENABLE_DATA_BACKUP = false; 
export const LOAD_DATA_FROM_LOCAL_FILES = true;
