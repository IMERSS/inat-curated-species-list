import fs from 'fs';
import { downloadDataByPacket, minifySpeciesData, minifiedNewAdditionsData } from './src/shared.js';
import * as C from './src/constants.js';

const logger = {
    current: {
        addLogRow: (msg) => {
            console.log(msg);
        },
        replaceLogRow: (rowId, msg) => {
            console.log(msg);
        }
    }
};

console.log("Pinging iNat for data.");

const cleanUsernames = C.USERS.split(',').map((username) => username.trim());

downloadDataByPacket({
    ident_user_id: C.USERS,
    place_id: C.PLACE_ID, 
    taxon_id: C.TAXON_ID,
    verifiable: 'any',
    taxons: C.VISIBLE_TAXONS
}, cleanUsernames, 1, logger, (curatedSpeciesData, newAdditionsByYear, params) => {
    const minifiedSpeciesData = minifySpeciesData(curatedSpeciesData, params.taxons);
    const minifiedNewAdditionsData = minifyNewAdditionsData(newAdditionsByYear, C.NEW_ADDITIONS_IGNORE_SPECIES_OBSERVED_BY);

    const filename = `${C.GENERATED_FILENAME_FOLDER}/${C.GENERATED_FILENAME}`;
    if (!fs.existsSync(C.GENERATED_FILENAME_FOLDER)) {
        fs.mkdirSync(C.GENERATED_FILENAME_FOLDER);
    }
    if (fs.existsSync(filename)) {
        fs.unlinkSync(filename);
    }
    fs.writeFileSync(filename, JSON.stringify(minifiedSpeciesData));
    console.log("__________________________________________");
    console.log(`Complete. File generated: ${filename}`);
}, (e) => {
    console.error("Error loading data: ", e);
});
