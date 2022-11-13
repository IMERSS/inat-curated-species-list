import qs from "query-string";

export const formatNum = (num) => new Intl.NumberFormat('en-US').format(num);
export const capitalizeFirstLetter = (string) => string.charAt(0).toUpperCase() + string.slice(1);

export const baseApiUrl = 'https://api.inaturalist.org/v1/observations';
const perPage = 200;

let packetLoggerRowId;
let lastId = null;
let parsedData = {};
let numResults = 0;

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
            // memory issues (harddisk space, I think). So instead, here we extract the necessary information right away
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

            // weird, but category was null in one place: https://www.inaturalist.org/observations/22763866
            // if (!ident.category) {
            //     console.log(obs);
            // }

            if (ident.taxon.rank !== "species" && ident.taxon.rank !== "subspecies") {
                return;
            }
            if (!parsedData[ident.taxon_id]) {
                // add ancestors
                const taxonomy = ident.taxon.ancestors.reduce((acc, curr) => {
                    acc[curr.rank] = curr.name;
                    return acc;
                }, {});
                // add current taxon
                taxonomy[ident.taxon.rank] = ident.taxon.name;
                parsedData[ident.taxon_id] = { data: taxonomy, count: 1 };
            } else {
                parsedData[ident.taxon_id].count++;
            }
        });
    });
};
