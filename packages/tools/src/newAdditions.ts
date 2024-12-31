import fs from 'fs';
import path from 'path';
import { GetDataPacketResponse } from '../types/generator.types';
import { Taxon } from '@imerss/inat-curated-species-list-common';
import { getTaxonomy } from './helpers';

const parseDataFile = (file: string, curators: string[], taxonsToReturn: Taxon[], processedData) => {
  const content: GetDataPacketResponse = JSON.parse(fs.readFileSync(file, 'utf-8'));

  content.results.forEach((obs) => {
    const { id: taxonId } = obs.taxon;
    if (!processedData[taxonId]) {
      processedData[taxonId] = {
        species: '',
        observations: [],
        taxonomy: null,
      };
    }

    processedData[taxonId].observations.push();

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

      processedData[taxonId].species = obs.taxon.name;
      processedData[taxonId].observations.push({
        timeObserved: obs.observed_on_details ? obs.observed_on_details.date : null,
        createdAt: obs.created_at_details.date,
        confirmationDate: obs.identifications[i].created_at,
        confirmationDateUnix: new Date(obs.identifications[i].created_at).getTime(),
      });

      // only bother storing the taxonomy for this taxon once
      if (!processedData[taxonId].taxonomy) {
        processedData[taxonId].taxonomy = getTaxonomy(obs.identifications[i].taxon.ancestors, taxonsToReturn);
      }

      // we ignore any later identifications; we're only interested in the earliest one that met our curator requirement
      break;
    }
  });
};

const parseDataFiles = (numFiles: number, curators: string[], taxon: Taxon[]) => {
  const processedData = {};

  for (let i = 1; i <= numFiles; i++) {
    parseDataFile(path.resolve(`./temp/packet-${i}.json`), curators, taxon, processedData);
  }

  return processedData;
};

const sortByConfirmationDate = (a, b) => {
  if (a.confirmationDateUnix < b.confirmationDateUnix) {
    return 1;
  } else if (a.confirmationDateUnix > b.confirmationDateUnix) {
    return -1;
  }
  return 0;
};

// temporary
(async () => {
  // first extract the info we want
  const processedData = parseDataFiles(
    161,
    ['oneofthedavesiknow', 'gpohl', 'crispinguppy'],
    ['superfamily', 'family', 'subfamily', 'tribe', 'genus', 'species'],
  );

  // now whittle down the identification to the earliest record on the species
  const dataArray = [];
  Object.keys(processedData).forEach((taxonId) => {
    processedData[taxonId].observations.sort(sortByConfirmationDate);

    // strip out observations before the specified start date

    processedData[taxonId].observations = [processedData[taxonId].observations[0]];

    dataArray.push({
      taxonId,
      species: processedData[taxonId].species,
      ...processedData[taxonId].observations[0],
      taxonomy: processedData[taxonId].taxonomy,
    });
  });

  // convert data structure to an array, sorted by reverse confirmation date
  dataArray.sort(sortByConfirmationDate);

  // filter out any that were made before the start cutoff date
  const newAdditionsFile = path.resolve('./temp/new-additions-data.json');
  fs.writeFileSync(newAdditionsFile, JSON.stringify(dataArray), 'utf-8');
})();
