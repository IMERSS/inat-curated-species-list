import { useRef, useState } from "react";
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import LoadingButton from '@mui/lab/LoadingButton';
import * as C from './constants';
import { resetData, downloadPacket, extractSpecies } from './shared';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import styles from './App.module.css';
import Logger from './Logger.component';
import DataTable from './DataTable.component';

const App = () => {
    const [usernames, setUsernames] = useState(C.USERS);
    const [placeId, setPlaceId] = useState(C.PLACE_ID);
    const [taxonId, setTaxonId] = useState(C.TAXON_ID);
    const [loading, setLoading] = useState(false);
    const [dataLoaded, setDataLoaded] = useState(false);
    const [data, setData] = useState(null);
    const loggerRef = useRef();

    const onStart = () => {
        setLoading(true);
        resetData();

        loggerRef.current.clear();
        loggerRef.current.addLogRow('Pinging iNat for observation data.', 'info');

        downloadPacket({
            ident_user_id: usernames,
            place_id: placeId,
            taxon_id: taxonId,
            verifiable: 'any'
        }, 1, loggerRef,() => {
            setLoading(false);
            setDataLoaded(true);

            loggerRef.current.addLogRows([
                ['Observation data all returned.', 'info'],
                ['Parsing data.', 'info']
            ]);
            const cleanUsernames = usernames.split(',').map((username) => username.trim());
            setData(extractSpecies(cleanUsernames, loggerRef));

        }, (e) => {
            loggerRef.current.addLogRow('Error pinging the iNat API.', 'error');
            setLoading(false);
        });
    };

    return (
        <div className={styles.app}>
            <h1>iNat: Curated Species List</h1>

            <p style={{ marginBottom: 30 }}>
                This tool queries iNat for all observations made by one or more users in a specific taxon and place.
                It derives a curated list of all <i>unique species/subspecies</i> and displays it along with the option
                to download the data.
            </p>
            <Box className={styles.fieldsRow}>
                <TextField
                    label="iNat usernames (comma-delimited)"
                    variant="outlined"
                    className={styles.usernames}
                    value={usernames}
                    disabled={loading}
                    onChange={(e) => setUsernames(e.target.value)}
                />
                <TextField
                    label="Place ID"
                    variant="outlined"
                    value={placeId}
                    disabled={loading}
                    onChange={(e) => setPlaceId(e.target.value)}
                />
                <TextField
                    label="Taxon ID"
                    variant="outlined"
                    value={taxonId}
                    disabled={loading}
                    onChange={(e) => setTaxonId(e.target.value)}
                />
                <LoadingButton
                    variant="contained" disabled={!usernames || !placeId || !taxonId}
                    onClick={onStart}
                    loading={loading}
                >
                    Start
                </LoadingButton>
            </Box>

            <Box sx={{ display: 'flex', visibility: loading || dataLoaded ? 'visible' : 'hidden', height: loading || dataLoaded ? 'auto' : 0 }}>
                <Logger ref={loggerRef} />
            </Box>
            <DataTable data={data} usernames={usernames} placeId={placeId} />
        </div>
    );
}

export default App;
