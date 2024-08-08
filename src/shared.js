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
let curatedSpeciesData = {};
let newAdditionsByYear = {};
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
    newAdditionsByYear = {};
    newAdditions = {};
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
                onSuccess(curatedSpeciesData, newAdditionsByYear, params);
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
                onSuccess(curatedSpeciesData, newAdditionsByYear, params);
            }
        }).catch(onError);
};


export const extractSpecies = (rawData, curators, taxonsToReturn) => {
    rawData.results.forEach((obs) => {
        // obs                - the full observation data
        // obs.user           - user info about who made the observation
        // obs.taxon          - the full taxonomy of the observation. This looks like it's the latest best reflection of the identifications made on the osb
        // obs.identification - an array of identifications made on this observation

        // console.log('Ben ---->', obs);

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

            // TODO here! To track new additions, we need different logic. Right now it could return a 20 year old observation that was
            // reviewed last week. That's unlikely to be a new addition. Instead:
            //    - check this `if` check to compare the curated identification date against the last tracked curated identification date
            //      for this species. If it's earlier, update it. 
            const curatorConfirmationDate = new Date(ident.created_at);
            const curatorConfirmationYear = curatorConfirmationDate.getFullYear();

            // this logic is still incorrect. We neefd to remove older observations from other years

            if (!newAdditions[ident.taxon.id] || newAdditionsByYear[curatorConfirmationYear][ident.taxon.id].curatorConfirmationDate > ident.created_at) {
                if (newAdditions[ident.taxon.id] ) {
                    console.log("earlier record found for ", ident.taxon.id, ident.created_at);
                }

                if (!newAdditionsByYear[curatorConfirmationYear]) {
                    newAdditionsByYear[curatorConfirmationYear] = {};
                }

                const taxonomy = getTaxonomy(ident.taxon.ancestors, taxonsToReturn);

                newAdditionsByYear[curatorConfirmationYear][ident.taxon.id] = {
                    taxonomy,
                    species: ident.taxon.name,
                    observerUsername: obs.user.login,
                    observerName: obs.user.name,
                    obsDate: ident.created_at,
                    obsId: ident.taxon_id, // TODO also looks wrong
                    obsPhoto: obs.photos && obs.photos.length > 0 ? obs.photos[0].url : null,
                    url: obs.uri,
                    curatorConfirmationDate: ident.created_at,
                };

                newAdditions[ident.taxon_id] = true;
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

export const minifyNewAdditionsData = (newAdditionsByYear, newAdditionsIgnoreSpeciesObservedBy) => {
    const years = Object.keys(newAdditionsByYear);

    // ignore any first observations of a species made by any usernames in the ignore list. This allows people
    // to initially input a curated list of species in a fake account with stub observations - regardless of the reality 
    // of what's actually been logged on iNat. But for a "new additions" section, that information isn't useful: so 
    // we strip it out here. 
    const trimmedAdditionsByYear = {};
    years.forEach((year) => {
        Object.keys(newAdditionsByYear[year]).forEach((taxonId) => {
            if (!trimmedAdditionsByYear[year]) {
                trimmedAdditionsByYear[year] = [];
            }
            if (newAdditionsIgnoreSpeciesObservedBy.indexOf(newAdditionsByYear[year][taxonId].observerUsername) === -1) {
                trimmedAdditionsByYear[year].push(newAdditionsByYear[year][taxonId]);
            }
        });
    });

    console.log({ before: newAdditionsByYear, after: trimmedAdditionsByYear })

    return trimmedAdditionsByYear;
};
