import { GeneratorConfig, GetDataPacketResponse } from '../types/generator.types';
import { CuratedSpeciesData, Taxon } from '@imerss/inat-curated-species-list-common';
import { getTaxonomy } from './helpers';
import path from 'path';
import fs from 'fs';

export const extractSpeciesList = (config: GeneratorConfig, tempFolder: string, numRequests: number) => {
  const curatedSpeciesData: CuratedSpeciesData = {};

  for (let packetNum = 1; packetNum <= numRequests; packetNum++) {
    const rawData: GetDataPacketResponse = JSON.parse(
      fs.readFileSync(path.resolve(tempFolder, `packet-${packetNum}.json`), 'utf-8'),
    );
    appendSpeciesFromPacket(rawData, config.curators, config.taxons, curatedSpeciesData);
  }

  return curatedSpeciesData;
};

export const appendSpeciesFromPacket = (
  rawData: GetDataPacketResponse,
  curators: string[],
  taxonsToReturn: Taxon[],
  curatedSpeciesData: CuratedSpeciesData,
) => {
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

        // note: `count` just tracks how many observations have been reviewed and confirmed by our curators, not by anyone
      } else {
        curatedSpeciesData[ident.taxon_id].count++;
      }
    });
  });
};
