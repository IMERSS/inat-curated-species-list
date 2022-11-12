import qs from "query-string";

export const formatNum = (num) => new Intl.NumberFormat('en-US').format(num);
export const capitalizeFirstLetter = (string) => string.charAt(0).toUpperCase() + string.slice(1);

export const baseApiUrl = 'https://api.inaturalist.org/v1/observations';
const perPage = 200;

let packetLoggerRowId;
let lastId = null;
let rawData = [];
let numResults = 0;

export const resetData = () => {
    rawData = [];
    numResults = 0;
}

export const downloadPacket = (params, packetNum, logger, onSuccess, onError) => {
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
                    logger.current.replaceLogRow(packetLoggerRowId, `Retrieved ${formatNum(perPage*packetNum)}/${numResultsFormatted} observations.`, 'info');
                }
                downloadPacket(params, packetNum+1, logger, onSuccess, onError);
            } else {
                logger.current.replaceLogRow(packetLoggerRowId,`Retrieved ${numResultsFormatted}/${numResultsFormatted} observations.`, 'info');
                onSuccess();
            }
        }).catch(onError);
};


// loop through the raw observation data and extract the unique species
export const extractSpecies = (observers, logger) => {
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
