import throttledQueue from 'throttled-queue';
import { INAT_API_BASE_URL } from '../constants';
import { chunk } from '../utils';
import { BaselineSpeciesInatData, RegionSpecies } from '../types';

export const getInatBaselineSpeciesData = async (ids: string): Promise<BaselineSpeciesInatData[]> => {
  const idArray = ids
    .trim()
    .split(',')
    .map((id) => id.trim());

  const chunks = chunk(idArray, 25);
  const throttle = throttledQueue(1, 1050);

  const data: BaselineSpeciesInatData[] = [];
  for (let index = 0; index < chunks.length; index++) {
    const chunkData = await throttle(() => requestSpeciesData(chunks[index]));
    data.push(...chunkData);
  }

  return data;
};

export const requestSpeciesData = async (ids: number[]) => {
  const taxonIds = ids.join(',');
  const resp = await fetch(
    `${INAT_API_BASE_URL}/taxa?taxon_id=${taxonIds}&order=desc&rank=species&order_by=observations_count`,
  );
  const json = await resp.json();

  return json.results.map(({ id, name, is_active }) => ({
    id,
    name,
    isActive: is_active,
  }));
};

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
