import fs from 'fs';
import path from 'path';
import { GetDataPacketResponse } from '../types/generator.types';
import { Taxon } from '@imerss/inat-curated-species-list-common';
import { getTaxonomy, getUniqueItems, getConfirmationDateAccountingForTaxonChanges } from './helpers';

// TODO problem: taxon ID "227436" shouldn't show up in the final list
// https://www.inaturalist.org/observations?place_id=7085&taxon_id=227436&verifiable=any
// the issue is that a curator has approved a higher-level taxon, but not the same as the original observation.
const parseDataFile = (
  file: string,
  curators: string[],
  taxonsToReturn: Taxon[],
  processedData,
  taxonsToRemove: number[],
) => {
  const content: GetDataPacketResponse = JSON.parse(fs.readFileSync(file, 'utf-8'));

  content.results.forEach((obs) => {
    const { id: taxonId } = obs.taxon;
    if (!processedData[taxonId]) {
      processedData[taxonId] = {
        species: '',
        id: obs.id,
        observations: [],
        user: {
          username: '',
          name: '',
          id: null,
        },
        taxonomy: null,
      };
    }

    // now loop through all identifications on this observation and log the first one that was confirmed or added by
    // one of our curators
    // *** assumption: the array is ordered oldest to newest
    for (let i = 0; i < obs.identifications.length; i++) {
      if (!obs.identifications[i].current) {
        continue;
      }

      if (!curators.includes(obs.identifications[i].user.login)) {
        continue;
      }

      if (obs.identifications[i].taxon.rank !== 'species') {
        continue;
      }

      const { oldTaxonIds, originalConfirmationDate } = getConfirmationDateAccountingForTaxonChanges(i, obs);
      taxonsToRemove.push(...oldTaxonIds);

      processedData[taxonId].species = obs.taxon.name;
      processedData[taxonId].user = {
        username: obs.user.login,
        name: obs.user.name,
        id: obs.user.id,
      };
      processedData[taxonId].observations.push({
        timeObserved: obs.observed_on_details ? obs.observed_on_details.date : null,
        createdAt: obs.created_at_details.date,
        confirmationDate: originalConfirmationDate,
        confirmationDateUnix: new Date(originalConfirmationDate).getTime(),
      });

      // only bother storing the taxonomy for this taxon once
      if (!processedData[taxonId].taxonomy) {
        processedData[taxonId].taxonomy = getTaxonomy(obs.identifications[i].taxon.ancestors, taxonsToReturn);
      }

      // we ignore any later identifications; we're only interested in the earliest one that met our curator requirement
      break;
    }

    // if there aren't any identifications added, delete the taxon - it will get automatically added later if there
    // are other records with valid observations. (This can happen when ???)
    if (!processedData[taxonId].observations.length) {
      delete processedData[taxonId];
    }
  });
};

const parseDataFiles = (numFiles: number, curators: string[], taxon: Taxon[]) => {
  const processedData = {};
  const taxonsToRemove: number[] = [];

  for (let i = 1; i <= numFiles; i++) {
    parseDataFile(path.resolve(`./temp/packet-${i}.json`), curators, taxon, processedData, taxonsToRemove);
  }

  const items = getUniqueItems(taxonsToRemove);
  items.forEach((taxonId) => {
    delete processedData[taxonId];
  });

  return processedData;
};

const sortByConfirmationDate = (a, b) => {
  if (a.confirmationDateUnix < b.confirmationDateUnix) {
    return -1;
  } else if (a.confirmationDateUnix > b.confirmationDateUnix) {
    return 1;
  }
  return 0;
};

// temporary. Args to be passed via config
(async () => {
  const curatorUsernames = ['oneofthedavesiknow', 'gpohl', 'crispinguppy'];
  const taxons: Taxon[] = ['superfamily', 'family', 'subfamily', 'tribe', 'genus', 'species'];
  const newAdditionsStartDate = '2023-01-01';

  // -----------------------

  // first extract the info we want
  const processedData = parseDataFiles(161, curatorUsernames, taxons);

  // console.log(processedData['1373714']);
  // return;

  const dataArray = [];
  Object.keys(processedData).forEach((taxonId) => {
    processedData[taxonId].observations.sort(sortByConfirmationDate);

    // if there are observations prior to the newAdditionsStartDate, ignore the taxon
    if (processedData[taxonId].observations[0].confirmationDate < newAdditionsStartDate) {
      return;
    }

    dataArray.push({
      id: processedData[taxonId].id,
      taxonId,
      species: processedData[taxonId].species,
      ...processedData[taxonId].observations[0],
      user: processedData[taxonId].user,
      taxonomy: processedData[taxonId].taxonomy,
    });
  });

  // sort remaining data
  dataArray.sort(sortByConfirmationDate);

  // filter out any that were made before the start cutoff date
  const newAdditionsFile = path.resolve('./temp/new-additions-data.json');
  fs.writeFileSync(newAdditionsFile, JSON.stringify(dataArray), 'utf-8');
})();
