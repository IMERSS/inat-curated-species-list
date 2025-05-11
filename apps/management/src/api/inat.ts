import throttledQueue from 'throttled-queue';
import { INAT_API_BASE_URL } from '../constants';
import { RegionSpecies } from '../types';

export const getRegionSpecies = async (placeId: number, taxonId: number) => {
  const perPage = 500;
  const url = `${INAT_API_BASE_URL}/observations/species_counts?verifiable=true&spam=false&place_id=${placeId}&taxon_id=${taxonId}&per_page=${perPage}&include_ancestors=true`;

  const throttle = throttledQueue(1, 1050);
  const firstRequest = await throttle(() => requestRegionSpeciesChunk(url));

  const data: RegionSpecies = {};
  appendSpeciesData(data, firstRequest.results);

  let numRequests = 0;
  if (firstRequest.total_results > perPage) {
    numRequests = Math.ceil((firstRequest.total_results - perPage) / perPage);
  }

  for (let index = 0; index < numRequests; index++) {
    const request = await throttle(() => requestRegionSpeciesChunk(url));
    appendSpeciesData(data, request.results);
  }

  return data;
};

export const requestRegionSpeciesChunk = async (url: string) => {
  const resp = await fetch(url);
  return await resp.json();
};

const appendSpeciesData = (targetData: RegionSpecies, speciesData: any) => {
  speciesData.forEach(
    ({ count, taxon: { id, is_active } }: { count: number; taxon: { id: number; is_active: boolean } }) => {
      targetData[id] = {
        isActive: is_active,
        count,
      };
    },
  );
};
