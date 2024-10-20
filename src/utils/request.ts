/**
 * This file contains a various methods for parsing and minify iNat data.
 */
import qs from 'query-string';
import path from 'path';
import fs from 'fs';
import {
  ENABLE_DATA_BACKUP,
  LOAD_DATA_FROM_LOCAL_FILES,
  INAT_API_URL,
  INAT_REQUEST_RESULTS_PER_PAGE,
} from '../constants';
import { formatNum } from './helpers';
import {
  CuratedSpeciesData,
  INatTaxonAncestor,
  INatApiObsRequestParams,
  LoggerHandle,
  Taxon,
  TaxonomyMap,
} from '../types';

let packetLoggerRowId: number;
let lastId: number | null = null;

let curatedSpeciesData: CuratedSpeciesData = {};
let newAdditions = {};
let numResults = 0;

const getTaxonomy = (ancestors: INatTaxonAncestor[], taxonsToReturn: Taxon[]): TaxonomyMap =>
  ancestors.reduce((acc, curr) => {
    if (taxonsToReturn.indexOf(curr.rank) !== -1) {
      acc[curr.rank] = curr.name;
    }
    return acc;
  }, {} as TaxonomyMap);

export const resetData = () => {
  curatedSpeciesData = {};
  newAdditions = {};
  numResults = 0;
};

type GetDataPacketParams = {
  readonly curators: string;
  readonly placeId: number;
  readonly taxonId: number;
  readonly visibleTaxons: Taxon[];
};

type GetDataPacketResponse = {
  readonly total_results: number;
  readonly results: [
    {
      id: number;

      // user info about who made the observation
      user: {
        login: string;
      };

      // the full taxonomy of the observation. This looks like it's the latest best reflection of the identifications made on the osb
      taxon: {
        rank: Taxon;
      };

      // an array of identifications made on this observation
      identifications: [
        {
          taxon_id: string;
          user: {
            login: string;
          };

          // this seems to indicate whether the user has overwritten it with a newer one, or maybe removed. Regardless: it's
          // needed to filter out dud identifications
          current: boolean;
          taxon: {
            name: string;
            rank: Taxon;
            ancestors: [];
          };
        },
      ];
    },
  ];
};

interface DownloadDataByPacket {
  (
    params: GetDataPacketParams,
    cleanUsernames: string[],
    packageNum: number,
    logger: LoggerHandle,
    onSuccess: (data: CuratedSpeciesData, newAdditions: any, params: GetDataPacketParams) => void,
    onError: () => void,
  ): void;
}

export const downloadDataByPacket: DownloadDataByPacket = (
  params,
  cleanUsernames,
  packetNum,
  logger,
  onSuccess,
  onError,
) => {
  getDataPacket(packetNum, params)
    .then((resp) => {
      // generate the files as backup so we don't have to ping iNat all the time while testing
      if (ENABLE_DATA_BACKUP) {
        fs.writeFileSync(
          path.resolve(__dirname, `../dist/packet-${packetNum}.json`),
          JSON.stringify(resp, null, '\t'),
          'utf-8',
        );
      }

      if (resp.total_results <= 0) {
        logger.addLogRow(`No observations found.`, 'info');
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
      extractSpecies(resp, cleanUsernames, params.visibleTaxons);

      lastId = resp.results[resp.results.length - 1].id;

      const numResultsFormatted = formatNum(numResults);
      if (packetNum * INAT_REQUEST_RESULTS_PER_PAGE < numResults) {
        if (!packetLoggerRowId) {
          logger.addLogRow(
            `<b>${new Intl.NumberFormat('en-US').format(resp.total_results)}</b> observations found.`,
            'info',
          );
          packetLoggerRowId = logger.addLogRow(
            `Retrieved ${formatNum(INAT_REQUEST_RESULTS_PER_PAGE)}/${numResultsFormatted} observations.`,
            'info',
          );
        } else {
          logger.replaceLogRow(
            packetLoggerRowId,
            `Retrieved ${formatNum(INAT_REQUEST_RESULTS_PER_PAGE * packetNum)}/${numResultsFormatted} observations.`,
            'info',
          );
        }
        downloadDataByPacket(params, cleanUsernames, packetNum + 1, logger, onSuccess, onError);
      } else {
        logger.replaceLogRow(
          packetLoggerRowId,
          `Retrieved ${numResultsFormatted}/${numResultsFormatted} observations.`,
          'info',
        );
        onSuccess(curatedSpeciesData, newAdditions, params);
      }
    })
    .catch(onError);
};

export const getDataPacket = (packetNum: number, params: GetDataPacketParams): Promise<GetDataPacketResponse> => {
  if (LOAD_DATA_FROM_LOCAL_FILES) {
    return new Promise((resolve) => {
      const fileContent = fs.readFileSync(path.resolve(__dirname, `../dist/packet-${packetNum}.json`), 'utf-8');
      resolve(JSON.parse(fileContent.toString()));
    });
  }

  const apiParams: INatApiObsRequestParams = {
    place_id: params.placeId,
    taxon_id: params.taxonId,
    order: 'asc',
    order_by: 'id',
    per_page: INAT_REQUEST_RESULTS_PER_PAGE,
    verifiable: 'any',
  };

  if (numResults && lastId) {
    apiParams.id_above = lastId;
  }

  const paramsStr = qs.stringify(apiParams);
  const apiUrl = `${INAT_API_URL}?${paramsStr}`;

  return fetch(apiUrl).then((resp) => resp.json());
};

// export const removeExistingNewAddition = (taxonId: number, data) => {
//   Object.keys(data).forEach((year) => {
//     if (data[year][taxonId]) {
//       delete data[year][taxonId];
//     }
//   });
// };

export const extractSpecies = (rawData: GetDataPacketResponse, curators: string[], taxonsToReturn: Taxon[]) => {
  rawData.results.forEach((obs) => {
    obs.identifications.forEach((ident) => {
      if (curators.indexOf(ident.user.login) === -1) {
        return;
      }

      if (!ident.current) {
        return;
      }

      // ignore anything that isn't a species. Currently we're ignoring subspecies data and anything in a more general
      // rank isn't of use
      if (ident.taxon.rank !== 'species') {
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

      // if (!newAdditions[ident.taxon.id] || newAdditions[ident.taxon.id].curatorConfirmationDate < ident.created_at) {
      //   const taxonomy = getTaxonomy(ident.taxon.ancestors, taxonsToReturn);

      //   newAdditions[ident.taxon.id] = {
      //     taxonomy,
      //     species: ident.taxon.name,
      //     observerUsername: obs.user.login,
      //     observerName: obs.user.name,
      //     obsDate: ident.created_at,
      //     // obsId: ident.taxon_id,
      //     obsPhoto: obs.photos && obs.photos.length > 0 ? obs.photos[0].url : null,
      //     url: obs.uri,
      //     curatorConfirmationDate: ident.created_at,
      //   };
      // }
    });
  });
};
