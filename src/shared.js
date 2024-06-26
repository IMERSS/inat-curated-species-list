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
let newAdditionsByYear = {};
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
    parsedData = {};
    newAdditionsByYear = {};
    numResults = 0;
}

export const downloadDataByPacket = (params, cleanUsernames, packetNum, logger, onSuccess, onError) => {
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
                onSuccess(parsedData, params);
                return;
            } else {
                // only the first request has the correct number of total results
                if (!numResults) {
                    numResults = resp.total_results;
                }
            }

            console.log('Ben 1', params.taxons);

            // the data returned by iNat is enormous. I found on my server, loading everything into memory caused
            // memory issues (hard-disk space, I think). So instead, here we extract the necessary information right away
            extractSpecies(resp, cleanUsernames, params.taxons);

            console.log('Ben 2', newAdditionsByYear);
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
                onSuccess(parsedData, params);
            }
        }).catch(onError);
};


export const extractSpecies = (rawData, curators, taxonsToReturn) => {
    rawData.results.forEach((obs) => {
        obs.identifications.forEach((ident) => {
            if (curators.indexOf(ident.user.login) === -1) {
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
                // add ancestor taxons
                const taxonomy = ident.taxon.ancestors.reduce((acc, curr) => {
                    if (taxonsToReturn.indexOf(curr.rank) !== -1) {
                        acc[curr.rank] = curr.name;
                    }
                    return acc;
                }, {});

                taxonomy.species = ident.taxon.name;
                parsedData[ident.taxon_id] = { data: taxonomy, count: 1 };

                const confirmationDate = new Date(ident.created_at);
                const confirmationYear = confirmationDate.getFullYear();

                // TODO once it's all working, add a param to control where users want to start looking at additions + nothing before

                if (!newAdditionsByYear[confirmationYear]) {
                    newAdditionsByYear[confirmationYear] = [];
                }

                // TODO add original observer + image URL
                newAdditionsByYear[confirmationYear].push({
                    taxonomy,
                    dateAdded: confirmationDate
                });
            } else {
                parsedData[ident.taxon_id].count++;
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
}
