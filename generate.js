import { downloadPacket, extractSpecies } from './src/shared.js';
import fs from 'fs';
import * as C from './constants.js';

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
downloadPacket({
    ident_user_id: C.USERS,
    place_id: C.PLACE_ID,
    taxon_id: C.TAXON_ID,
    verifiable: 'any'
}, 1, logger,() => {
    const cleanUsernames = C.USERS.split(',').map((username) => username.trim());
    data = extractSpecies(cleanUsernames, logger);

    const filename = `./dist/${C.GENERATED_FILENAME}`;
    if (!fs.existsSync('./dist')) {
        fs.mkdirSync('./dist');
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
