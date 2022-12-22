/**
 * This file contains a bunch of code to parse out the necessary iNat data. We found it can get pretty bit - 900KB
 * for around 2800 species for our BC Leps site - so I've added a few minification steps to the data. This helps
 * when you're using the standalone file that loads the generated json file containing the data. Note: a bigger
 * improvement would be to reduce all the unnecessary taxon info needed.
 */
import qs from 'query-string';
import { nanoid } from 'nanoid'

export const formatNum = (num) => new Intl.NumberFormat('en-US').format(num);
export const capitalizeFirstLetter = (string) => string.charAt(0).toUpperCase() + string.slice(1);

export const baseApiUrl = 'https://api.inaturalist.org/v1/observations';
const perPage = 200;

let packetLoggerRowId;
let lastId = null;
let parsedData = {};
let numResults = 0;

// used to reduce the size of the data structure
export const taxonAbbreviationMap = {
    kingdom: 'k',
    phylum: 'p',
    subphylum: 'h',
    "class": 'c',
    subclass: 'b',
    order: 'o',
    superfamily: 'u',
    family: 'f',
    subfamily: 'm',
    section: 'r',
    complex: 'q',
    tribe: 't',
    subtribe: 'j',
    genus: 'g',
    subgenus: 'v',
    species: 's'
};

const taxons = {
    kingdom: { map: {}, count: 0 },
    phylum: { map: {}, count: 0 },
    subphylum: { map: {}, count: 0 },
    "class": { map: {}, count: 0 },
    subclass: { map: {}, count: 0 },
    order: { map: {}, count: 0 }
};

const generatedKeys = {};
let currKeyLength = 1;
const getNextKey = () => {
    let key = '';

    // try to get a unique key at the current length 10 times. If it fails, increase the length
    for (let i=0; i<20; i++) {
        let currKey = nanoid(currKeyLength);

        if (!generatedKeys[currKey]) {
            key = currKey;
            generatedKeys[currKey] = true;
            break;
        }
    }

    if (key) {
        return key;
    }

    currKeyLength++;
    return getNextKey();
};

const invertObj = (data) => Object.fromEntries(Object.entries(data).map(([key, value]) => [value, key]));

export const resetData = () => {
    parsedData = {};
    numResults = 0;
}

export const downloadPacket = (params, cleanUsernames, packetNum, logger, onSuccess, onError) => {
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
                onSuccess(parsedData);
                return;
            } else {
                // only the first request has the correct number of total results
                if (!numResults) {
                    numResults = resp.total_results;
                }
            }

            // the data returned by iNat is enormous. I found on my server, loading everything into memory caused
            // memory issues (hard-disk space, I think). So instead, here we extract the necessary information right away
            extractSpecies(resp, cleanUsernames);

            lastId = resp.results[resp.results.length - 1].id;

            const numResultsFormatted = formatNum(numResults);
            if (packetNum * perPage < numResults) {
                if (!packetLoggerRowId) {
                    logger.current.addLogRow(`<b>${new Intl.NumberFormat('en-US').format(resp.total_results)}</b> observations found.`, 'info');
                    packetLoggerRowId = logger.current.addLogRow(`Retrieved ${formatNum(perPage)}/${numResultsFormatted} observations.`, 'info');
                } else {
                    logger.current.replaceLogRow(packetLoggerRowId, `Retrieved ${formatNum(perPage*packetNum)}/${numResultsFormatted} observations.`, 'info');
                }
                downloadPacket(params, cleanUsernames, packetNum+1, logger, onSuccess, onError);
            } else {
                logger.current.replaceLogRow(packetLoggerRowId,`Retrieved ${numResultsFormatted}/${numResultsFormatted} observations.`, 'info');
                onSuccess(parsedData);
            }
        }).catch(onError);
};


export const extractSpecies = (rawData, observers) => {
    rawData.results.forEach((obs) => {
        obs.identifications.forEach((ident) => {
            if (observers.indexOf(ident.user.login) === -1) {
                return;
            }

            // `current` seems to indicate whether the user has overwritten it with a newer one
            if (!ident.current) {
                return;
            }

            if (ident.taxon.rank !== "species") {
                return;
            }

            if (!parsedData[ident.taxon_id]) {
                // add ancestors
                const taxonomy = ident.taxon.ancestors.reduce((acc, curr) => {
                    acc[curr.rank] = curr.name;
                    return acc;
                }, {});

                taxonomy[ident.taxon.rank] = ident.taxon.name;
                parsedData[ident.taxon_id] = { data: taxonomy, count: 1 };
            } else {
                parsedData[ident.taxon_id].count++;
            }
        });
    });
};

// this
export const minifyData = (data) => {
    const minifiedData = {
        taxonMap: {},
        data: {}
    };

    Object.keys(data).forEach((taxonId) => {

    });

    /*
        // add current taxon
        if (!taxonAbbreviationMap[curr.rank]) {
            console.log("Missing: ", curr.rank);
            return;
        }
        const key = taxonAbbreviationMap[curr.rank];
    */
    // const key = taxonAbbreviationMap[];
}

export const unminifyData = (data) => {
    const map = invertObj(taxonAbbreviationMap);

    const newData = {};
    Object.keys(data).forEach((taxon) => {
        const newTaxonData = {};
        Object.keys(data[taxon].data).forEach((minKey) => {
            newTaxonData[map[minKey]] = data[taxon].data[minKey];
        })
        newData[taxon] = {
            data: newTaxonData,
            count: data[taxon].count
        }
    });
    return newData;
}
