import fs from 'fs';
import path from 'path';
import { GeneratorConfig, GetDataPacketResponse, NewAdditions } from '../types/generator.types';
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
    // now loop through all identifications on this observation and log the first one that was confirmed or added by
    // one of our curators
    // *** assumption: the array is ordered oldest to newest
    let curatorTaxonId: number | null = null;
    for (let i = 0; i < obs.identifications.length; i++) {
      if (!obs.identifications[i].current) {
        continue;
      }

      if (!curators.includes(obs.identifications[i].user.login)) {
        continue;
      }

      if (obs.identifications[i].taxon.rank !== 'species' && obs.identifications[i].taxon.rank !== 'subspecies') {
        continue;
      }

      const isSubspeciesIdent = obs.identifications[i].taxon.rank === 'subspecies';

      // we're not currently interested in subspecies, but need to factor in confirmed subspecies observations.
      let speciesName: string;
      if (isSubspeciesIdent) {
        const speciesAncestor =
          obs.identifications[i].taxon.ancestors[obs.identifications[i].taxon.ancestors.length - 1];
        curatorTaxonId = speciesAncestor.id;
        speciesName = speciesAncestor.name;
      } else {
        curatorTaxonId = obs.identifications[i].taxon.id;
        speciesName = obs.identifications[i].taxon.name;
      }

      // as noted, group all species + subspecies under the species taxon ID.
      if (!processedData[curatorTaxonId]) {
        processedData[curatorTaxonId] = {
          speciesName: null,
          observations: [],
          taxonomy: null,
        };
      }

      const { deprecatedTaxonIds, originalConfirmationDate } = getConfirmationDateAccountingForTaxonChanges(i, obs);
      taxonsToRemove.push(...deprecatedTaxonIds);

      processedData[curatorTaxonId].speciesName = speciesName;
      processedData[curatorTaxonId].observations.push({
        observationId: obs.id,
        dateObserved: obs.observed_on_details ? obs.observed_on_details.date : null,
        observationCreatedAt: obs.created_at_details.date,
        confirmationDate: originalConfirmationDate,
        confirmationDateUnix: new Date(originalConfirmationDate).getTime(),
        curator: obs.identifications[i].user.login,
        observer: {
          username: obs.user.login,
          name: obs.user.name,
          id: obs.user.id,
        },
      });

      // only bother calculating the taxonomy for this taxon once
      if (!processedData[curatorTaxonId].taxonomy) {
        processedData[curatorTaxonId].taxonomy = getTaxonomy(obs.identifications[i].taxon.ancestors, taxonsToReturn);
      }

      // we ignore any later identifications; we're only interested in the earliest one that met our curator requirement
      break;
    }

    // if there aren't any identifications added, delete the taxon - it will get automatically added later if there
    // are other records with valid observations. (This can happen when ???)
    if (curatorTaxonId && !processedData[curatorTaxonId].observations.length) {
      delete processedData[curatorTaxonId];
    }
  });
};

const parseDataFiles = (numFiles: number, curators: string[], taxon: Taxon[], tempFolder: string) => {
  const processedData = {};
  const taxonsToRemove: number[] = [];

  for (let i = 1; i <= numFiles; i++) {
    parseDataFile(path.resolve(`${tempFolder}/packet-${i}.json`), curators, taxon, processedData, taxonsToRemove);
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

export const generateNewAdditionsDataFile = (config: GeneratorConfig, numDataFiles: number, tempFolder: string) => {
  const { curators, taxons, newAdditionsFilename, newAdditionsStartDate } = config;
  const processedData = parseDataFiles(numDataFiles, curators, taxons, tempFolder);

  const dataArray: NewAdditions[] = [];
  Object.keys(processedData).forEach((taxonId) => {
    processedData[taxonId].observations.sort(sortByConfirmationDate);

    // ignore any taxons that have confirmed observations prior to `newAdditionsStartDate`
    if (processedData[taxonId].observations[0].confirmationDate < newAdditionsStartDate) {
      return;
    }

    dataArray.push({
      ...processedData[taxonId].observations[0],
      taxonId,
      speciesName: processedData[taxonId].speciesName,
      user: processedData[taxonId].observations[0].user,
      taxonomy: processedData[taxonId].taxonomy,
    });
  });

  // sort remaining data
  dataArray.sort(sortByConfirmationDate);

  // filter out any that were made before the start cutoff date
  const newAdditionsFile = path.resolve(`${tempFolder}/${newAdditionsFilename}`);
  fs.writeFileSync(newAdditionsFile, JSON.stringify(dataArray), 'utf-8');

  return newAdditionsFile;
};
