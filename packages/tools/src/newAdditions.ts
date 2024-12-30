import fs from 'fs';
import path from 'path';
import { GetDataPacketResponse } from '../types/generator.types';
import { Taxon } from '@imerss/inat-curated-species-list-common';
import { getTaxonomy } from './helpers';

const processedData = {};
const parseDataFile = (file: string, curators: string[], taxonsToReturn: Taxon[]) => {
  const content: GetDataPacketResponse = JSON.parse(fs.readFileSync(file, 'utf-8'));

  content.results.forEach((obs) => {
    const { id: taxonId } = obs.taxon;
    if (!processedData[taxonId]) {
      processedData[taxonId] = {
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

      processedData[taxonId].observations.push({
        timeObserved: obs.time_observed_at,
        createdAt: obs.created_at_details,
        confirmationDate: obs.identifications[i].created_at,
      });

      // only bother storing the taxonomy for this taxon once
      if (!processedData[taxonId].taxonomy) {
        processedData[taxonId].taxonomy = getTaxonomy(obs.identifications[i].taxon.ancestors, taxonsToReturn);
      }

      // we ignore any later identifications; we're only interested in the earliest one
      break;
    }
  });
};

const parseDataFiles = (numFiles: number, curators: string[], taxon: Taxon[]) => {
  for (let i = 1; i <= numFiles; i++) {
    parseDataFile(path.resolve(`./temp/packet-${i}.json`), curators, taxon);
  }
};

// temporary
(async () => {
  parseDataFiles(
    161,
    ['oneofthedavesiknow', 'gpohl', 'crispinguppy'],
    ['superfamily', 'family', 'subfamily', 'tribe', 'genus', 'species'],
  );

  console.log(processedData);
})();
