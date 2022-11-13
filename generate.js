import fs from 'fs';
import { downloadPacket, extractSpecies } from './src/shared.js';
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

let data = [];
const cleanUsernames = C.USERS.split(',').map((username) => username.trim());

downloadPacket({
    ident_user_id: C.USERS,
    place_id: C.PLACE_ID,
    taxon_id: C.TAXON_ID,
    verifiable: 'any'
}, cleanUsernames,1, logger,(speciesData) => {
    data = extractSpecies(speciesData, logger);

    const filename = `${C.GENERATED_FILENAME_FOLDER}/${C.GENERATED_FILENAME}`;
    if (!fs.existsSync(C.GENERATED_FILENAME_FOLDER)) {
        fs.mkdirSync(C.GENERATED_FILENAME_FOLDER);
    }
    if (fs.existsSync(filename)) {
        fs.unlinkSync(filename);
    }
    fs.writeFileSync(filename, JSON.stringify(data));
    console.log("__________________________________________");
    console.log(`Complete. File generated: ${filename}`);
}, (e) => {
    console.error("Error loading data: ", e);
});
