/**
 * This file contains a bunch of code to parse out the necessary iNat data. We found it can get pretty bit - 900KB
 * for around 2800 species for our BC Leps site - so I've added a few minification steps to the data. This helps
 * when you're using the standalone file that loads the generated json file containing the data. Note: a bigger
 * improvement would be to reduce all the unnecessary taxon info needed.
 */
import qs from 'query-string';
import path from 'path';
import { nanoid } from 'nanoid';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { ENABLE_DATA_BACKUP, LOAD_DATA_FROM_LOCAL_FILES } from './constants.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const formatNum = (num) => new Intl.NumberFormat('en-US').format(num);
export const capitalizeFirstLetter = (string) => string.charAt(0).toUpperCase() + string.slice(1);

export const baseApiUrl = 'https://api.inaturalist.org/v1/observations';
const perPage = 200;

let packetLoggerRowId;
let lastId = null;
let curatedSpeciesData = {};
let newAdditions = {};
let numResults = 0;

const taxonsToMinify = {
    kingdom: true,
    phylum: true,
    subphylum: true,
    "class": true,
    subclass: true,
    order: true,
    superfamily: true,
    family: true,
    subfamily: true,
    section: true,
    tribe: true,
    genus: true
};

const invertObj = (data) => Object.fromEntries(Object.entries(data).map(([key, value]) => [value, key]));

const getTaxonomy = (ancestors, taxonsToReturn) => ancestors.reduce((acc, curr) => {
    if (taxonsToReturn.indexOf(curr.rank) !== -1) {
        acc[curr.rank] = curr.name;
    }
    return acc;
}, {});

const generatedKeys = {};
let currKeyLength = 1;
const getNextKey = () => {
    let key = '';
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

export const resetData = () => {
    curatedSpeciesData = {};
    newAdditions = {};
    numResults = 0;
}

export const downloadDataByPacket = (params, cleanUsernames, packetNum, logger, onSuccess, onError) => {
    getPacket(packetNum, params)
        .then((resp) => {

            // generate the files as backup so we don't have to ping iNat all the time while testing
            if (ENABLE_DATA_BACKUP) {
                fs.writeFileSync(path.resolve(__dirname, `../dist/packet-${packetNum}.json`), JSON.stringify(resp, null, '\t'), 'utf-8');
            }

            if (resp.total_results <= 0) {
                logger.current.addLogRow(`No observations found.`, 'info');
                onSuccess(curatedSpeciesData, newAdditions, params);
                return;
            } else {
                // only the first request has the correct number of total results
                if (!numResults) {
                    numResults = resp.total_results;
                }
            }

            // the data returned by iNat is enormous. I found on my server, loading everything into memory caused
            // memory issues (hard-disk space, I think). So instead, here we extract the necessary information right away
            extractSpecies(resp, cleanUsernames, params.taxons);

            lastId = resp.results[resp.results.length - 1].id;

            const numResultsFormatted = formatNum(numResults);
            if (packetNum * perPage < numResults) {
                if (!packetLoggerRowId) {
                    logger.current.addLogRow(`<b>${new Intl.NumberFormat('en-US').format(resp.total_results)}</b> observations found.`, 'info');
                    packetLoggerRowId = logger.current.addLogRow(`Retrieved ${formatNum(perPage)}/${numResultsFormatted} observations.`, 'info');
                } else {
                    logger.current.replaceLogRow(packetLoggerRowId, `Retrieved ${formatNum(perPage*packetNum)}/${numResultsFormatted} observations.`, 'info');
                }
                downloadDataByPacket(params, cleanUsernames, packetNum+1, logger, onSuccess, onError);
                
            } else {
                logger.current.replaceLogRow(packetLoggerRowId,`Retrieved ${numResultsFormatted}/${numResultsFormatted} observations.`, 'info');
                onSuccess(curatedSpeciesData, newAdditions, params);
            }
        }).catch(onError);
};


export const getPacket = (packetNum, params) => {
    if (LOAD_DATA_FROM_LOCAL_FILES) {
        return new Promise((resolve, reject) => {
            const fileContent = fs.readFileSync(path.resolve(__dirname, `../dist/packet-${packetNum}.json`), 'utf-8');
            resolve(JSON.parse(fileContent.toString()));    
        });
    }

    params.order = 'asc';
    params.order_by = 'id';
    params.per_page = perPage;

    if (numResults) {
        params.id_above = lastId;
    }
    const paramsStr = qs.stringify(params);
    const apiUrl = `${baseApiUrl}?${paramsStr}`;

    return fetch(apiUrl).then((resp) => resp.json())
};


export const removeExistingNewAddition = (taxonId, data) => {
    Object.keys(data).forEach((year) => {
        if (data[year][taxonId]) {
            delete data[year][taxonId];
        }
    });
}

export const extractSpecies = (rawData, curators, taxonsToReturn) => {
    rawData.results.forEach((obs) => {
        // obs                - the full observation data
        // obs.user           - user info about who made the observation
        // obs.taxon          - the full taxonomy of the observation. This looks like it's the latest best reflection of the identifications made on the osb
        // obs.identification - an array of identifications made on this observation
        obs.identifications.forEach((ident) => {
            if (curators.indexOf(ident.user.login) === -1) {
                return;
            }

            // `current` seems to indicate whether the user has overwritten it with a newer one
            if (!ident.current) {
                return;
            }

            // ignore anything that isn't a species. Currently we're ignoring subspecies data and anything in a more general
            // rank isn't of use
            if (ident.taxon.rank !== "species") {
                return;
            }

            // the data from the server is sorted by ID - oldest to newest - so here we've found the first *observation* of a species 
            // that meets our curated reviewer requirements. This tracks when the species was *first confirmed* by a curated reviewer, 
            // which might be vastly different from when the sighting was actually made
            if (!curatedSpeciesData[ident.taxon_id]) {
                const taxonomy = getTaxonomy(ident.taxon.ancestors, taxonsToReturn);
                taxonomy.species = ident.taxon.name;
                curatedSpeciesData[ident.taxon_id] = { data: taxonomy, count: 1 };

            // note: count just tracks how many observations have been reviewed and confirmed by our curators, not by anyone
            } else {
                curatedSpeciesData[ident.taxon_id].count++;
            }

            // now onto the New Additions section

            // track the earliest confirmation of a species by any user on the ignore list. Once all the data is gathered up, we:
            //    (a) ignore any records earlier than the earliest confirmation 
            //    (b) 

            if (!newAdditions[ident.taxon.id] || newAdditions[ident.taxon.id].curatorConfirmationDate < ident.created_at) {
                const taxonomy = getTaxonomy(ident.taxon.ancestors, taxonsToReturn);

                newAdditions[ident.taxon.id] = {
                    taxonomy,
                    species: ident.taxon.name,
                    observerUsername: obs.user.login,
                    observerName: obs.user.name,
                    obsDate: ident.created_at,
                    // obsId: ident.taxon_id,
                    obsPhoto: obs.photos && obs.photos.length > 0 ? obs.photos[0].url : null,
                    url: obs.uri,
                    curatorConfirmationDate: ident.created_at,
                };
            }
        });
    });
};

export const minifySpeciesData = (data, targetTaxons) => {
    const minifiedData = {
        taxonMap: {},
        taxonData: {}
    };

    Object.keys(data).forEach((taxonId) => {

        // keyed by rank
        const rowData = {};

        // replace all non-species taxon strings (Pterygota, or whatever) with a short code in taxonMap
        Object.keys(data[taxonId].data).forEach((taxonRank) => {
            const taxonName = data[taxonId].data[taxonRank];

            if (taxonsToMinify[taxonRank]) {
                // if we've already minified this particular taxon name (note: no reason this might be a totally
                // different rank from the original minification - it doesn't matter - point is that the STRING is identical)
                if (minifiedData.taxonMap[taxonName]) {
                    rowData[taxonRank] = minifiedData.taxonMap[taxonName];
                } else {
                    const key = getNextKey();
                    minifiedData.taxonMap[taxonName] = key;
                    rowData[taxonRank] = key;
                }
            } else {
                rowData[taxonRank] = taxonName;
            }
        });

        const row = targetTaxons.map((t) => rowData[t] ? rowData[t] : '').join('|');
        minifiedData.taxonData[taxonId] = `${row}|${data[taxonId].count}`;
    });

    return minifiedData;
}

export const unminifySpeciesData = (data, visibleTaxons) => {
    const map = invertObj(data.taxonMap);

    const fullData = {};
    Object.keys(data.taxonData).forEach((taxonId) => {
        // Assumes that this is now an ordered array of the taxons specified in visibleTaxons. The user should
        // have supplied the same list of taxons used in creating the minified file
        const rowData = data.taxonData[taxonId].split('|');
        const expandedTaxonData = {};

        for (let i=0; i<visibleTaxons.length; i++) {
            const visibleTaxon = visibleTaxons[i];
            // only the species row isn't minified. Everything else is found in the map
            if (visibleTaxon === 'species') {
                expandedTaxonData[visibleTaxon] = rowData[i];
            } else {
                // not every taxon will be filled for each row
                if (rowData[i] && !map[rowData[i]]) {
                    console.log("missing", i, rowData);
                }
                expandedTaxonData[visibleTaxon] = rowData[i] ? map[rowData[i]] : '';
            }
        }

        fullData[taxonId] = {
            data: expandedTaxonData,
            count: rowData[rowData.length-1]
        };
    });

    return fullData;
};

export const minifyNewAdditionsData = (newAdditions) => {
    const newAdditionsByYear = {};
    Object.keys(newAdditions).forEach((taxonId) => {
        const row = newAdditions[taxonId];
        const curatorConfirmationDate = new Date(row.curatorConfirmationDate);
        const year = curatorConfirmationDate.getFullYear();

        if (!newAdditionsByYear[year]) {
            newAdditionsByYear[year] = [];
        }

        newAdditionsByYear[year].push(newAdditions[taxonId]);
    });

    console.log({ before: newAdditions, newAdditionsByYear })

    return newAdditions;
};
