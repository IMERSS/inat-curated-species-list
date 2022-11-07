import { useRef, useState } from "react";
import qs from 'query-string';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import LoadingButton from '@mui/lab/LoadingButton';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import styles from './App.module.css';
import Logger from './Logger.component';
import DataTable from './DataTable.component';
import { formatNum } from './shared';

let rawData = [];
let numResults = 0;
let packetLoggerRowId;
let dataLoaded = false;
let lastId = null;
const perPage = 200;
const resetData = () => {
    rawData = [];
    numResults = 0;
    dataLoaded = false;
}

const baseApiUrl = 'https://api.inaturalist.org/v1/observations';

const downloadPacket = (params, packetNum, logger, onSuccess, onError) => {
    params.order = 'asc';
    params.order_by = 'id';
    params.per_page = perPage;

    if (numResults) {
        params.id_above = lastId;
    }
    const paramsStr = qs.stringify(params);
    const apiUrl = `${baseApiUrl}?${paramsStr}`;

    fetch(apiUrl)
        .then((resp) => resp.json())
        .then((resp) => {
            if (resp.total_results <= 0) {
                logger.current.addLogRow(`No observations found.`, 'info');
                onSuccess();
                return;
            } else {
                // only the first request has the correct number of total results
                if (!numResults) {
                    numResults = resp.total_results;
                }
            }

            rawData.push(resp);
            lastId = resp.results[resp.results.length - 1].id;

            const numResultsFormatted = formatNum(numResults);
            if (packetNum * perPage < numResults) {
                if (!packetLoggerRowId) {
                    logger.current.addLogRow(`<b>${new Intl.NumberFormat('en-US').format(resp.total_results)}</b> observations found.`, 'info');
                    packetLoggerRowId = logger.current.addLogRow(`Retrieved ${formatNum(perPage)}/${numResultsFormatted} observations.`, 'info');
                } else {
                    logger.current.replaceLogRow(packetLoggerRowId,`Retrieved ${formatNum(perPage*packetNum)}/${numResultsFormatted} observations.`, 'info');
                }
                downloadPacket(params, packetNum+1, logger, onSuccess, onError);
            } else {
                logger.current.replaceLogRow(packetLoggerRowId,`Retrieved ${numResultsFormatted}/${numResultsFormatted} observations.`, 'info');
                onSuccess();
            }
        }).catch(onError);
};


// loop through the raw observation data and extract the unique species
const extractSpecies = (observers, logger) => {
    const resultsGroupedByTaxonId = {};

    rawData.forEach((data) => {
        data.results.forEach((obs) => {
            obs.identifications.forEach((ident) => {
                if (observers.indexOf(ident.user.login) === -1) {
                    return;
                }

                // `current` seems to indicate whether the user has overwritten it with a newer one
                if (!ident.current) {
                    return;
                }

                // weird, but category was null in one place: https://www.inaturalist.org/observations/22763866
                // if (!ident.category) {
                //     console.log(obs);
                // }

                if (ident.taxon.rank !== "species" && ident.taxon.rank !== "subspecies") {
                    return;
                }
                if (!resultsGroupedByTaxonId[ident.taxon_id]) {
                    // add ancestors
                    const taxonomy = ident.taxon.ancestors.reduce((acc, curr) => {
                        acc[curr.rank] = curr.name;
                        return acc;
                    }, {});
                    // add current taxon
                    taxonomy[ident.taxon.rank] = ident.taxon.name;
                    resultsGroupedByTaxonId[ident.taxon_id] = { data: taxonomy, count: 1 };
                } else {
                    resultsGroupedByTaxonId[ident.taxon_id].count++;
                }
            });
        });
    });

    const numSpecies = Object.keys(resultsGroupedByTaxonId).length;
    logger.current.addLogRow(`Found <b>${numSpecies}</b> unique species in observation results.`, 'success');

    return resultsGroupedByTaxonId;
};


const App = () => {
    const [usernames, setUsernames] = useState('dave328,gpohl,mothmaniac');
    const [placeId, setPlaceId] = useState('7085');
    const [taxonId, setTaxonId] = useState('47157');
    const [loading, setLoading] = useState(false);
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
            dataLoaded = true;

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
