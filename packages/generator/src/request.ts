/**
 * This file contains a various methods for parsing and minify iNat data.
 */
import qs from 'query-string';
import fetch from 'node-fetch';

import { INAT_API_URL, INAT_REQUEST_RESULTS_PER_PAGE } from './constants';

import {
  CuratedSpeciesData,
  DownloadDataPacketArgs,
  GetDataPacketResponse,
  INatTaxonAncestor,
  INatApiObsRequestParams,
  Taxon,
  TaxonomyMap,
} from '../types/generator.types';
import { logPacket } from './logs';
import { Logger } from 'winston';

let lastId: number | null = null;
let curatedSpeciesData: CuratedSpeciesData = {};
let newAdditions = {};
let numResults = 0;
let numRequests = 0;

const getTaxonomy = (ancestors: INatTaxonAncestor[], taxonsToReturn: Taxon[]): TaxonomyMap =>
  ancestors.reduce((acc, curr) => {
    if (taxonsToReturn.indexOf(curr.rank) !== -1) {
      acc[curr.rank] = curr.name;
    }
    return acc;
  }, {} as TaxonomyMap);

// weird...
export const resetData = () => {
  curatedSpeciesData = {};
  newAdditions = {};
  numResults = 0;
};

export type DownloadDataPacketResponse = {
  readonly totalResults: number;
  readonly numRequests: number;
};

/**
 * Simple high-level method that just downloads a chunk of data from iNat and stores the result in a temporary file on disk.
 * Later steps parse, convert and minify the relevant data.
 */
export const downloadDataPacket = async ({
  curators,
  packetNum,
  placeId,
  taxonId,
  tempFolder,
  logger,
}: DownloadDataPacketArgs): Promise<DownloadDataPacketResponse> => {
  let rawResponse;
  try {
    rawResponse = await getDataPacket(placeId, taxonId, curators, logger);
  } catch (e) {
    logger.log('error', e);
  }

  const resp: any = (await rawResponse.json()) as GetDataPacketResponse;
  const totalResults = resp.total_results;

  logger.log('info', 'request successful'); //

  if (totalResults <= 0) {
    return {
      totalResults,
      numRequests,
    };
  } else {
    if (!numResults) {
      numResults = totalResults;
      numRequests = Math.ceil(totalResults / INAT_REQUEST_RESULTS_PER_PAGE);
    }
  }

  // write the entire API response to a file. We'll extract what we need once the data's fully downloaded
  logPacket(packetNum, tempFolder, resp);

  // the iNat API works by passing in a property to return data above a particular ID. This tracks it for subsequent requests
  lastId = resp.results[resp.results.length - 1].id;

  return {
    totalResults,
    numRequests,
  };

  // const maxResultsLimit = Math.min(numResults, debugMaxResults || Infinity);
  // // let maxResultsLimitMsg = '';
  // // if (debugMaxResults) {
  // //   maxResultsLimitMsg =
  // //     debugMaxResults === 'html'
  // //       ? `(Results limited to <b>${debugMaxResults}</b>)`
  // //       : `(Results limited to ${debugMaxResults})`;
  // // }

  // if (packetNum * INAT_REQUEST_RESULTS_PER_PAGE < maxResultsLimit) {
  //   // if (!packetLoggerRowId) {
  //   //   const num = new Intl.NumberFormat('en-US').format(resp.total_results);
  //   //   const msg = logFormat === 'html' ? `<b>${num}</b> observations found.` : `${num} observations found.`;
  //   //   logger.current!.addLogRow(msg, 'info');
  //   //   packetLoggerRowId = logger.current!.addLogRow(
  //   //     `Retrieved ${formatNum(INAT_REQUEST_RESULTS_PER_PAGE)}/${numResultsFormatted} observations. ${maxResultsLimitMsg}`,
  //   //     'info',
  //   //   );
  //   // }
  //   // downloadDataByPacket({ ...args, logger, packetNum: packetNum + 1 });
  // } else {
  //   // logger.current!.replaceLogRow(
  //   //   packetLoggerRowId,
  //   //   `Retrieved ${numResultsFormatted}/${numResultsFormatted} observations. ${maxResultsLimitMsg}`,
  //   //   'info',
  //   // );
  //   // onComplete();
  // }
};

export const getDataPacket = async (placeId: number, taxonId: number, curators: string, logger: Logger) => {
  const apiParams: INatApiObsRequestParams = {
    place_id: placeId,
    taxon_id: taxonId,
    order: 'asc',
    order_by: 'id',
    per_page: INAT_REQUEST_RESULTS_PER_PAGE,
    verifiable: 'any',
    ident_user_id: curators,
  };

  // refactor
  if (numResults && lastId) {
    apiParams.id_above = lastId;
  }

  const paramsStr = qs.stringify(apiParams);
  const apiUrl = `${INAT_API_URL}?${paramsStr}`;

  logger.log('info', `Request: ${apiUrl}`);

  return fetch(apiUrl);
};
