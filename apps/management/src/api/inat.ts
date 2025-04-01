import throttledQueue from 'throttled-queue';
import { INAT_API_BASE_URL } from '../constants';
import { chunk } from '../utils';
import { BaselineSpeciesInatData } from '../types';

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

  console.log(
    `${INAT_API_BASE_URL}/taxa?taxon_id=${taxonIds}&order=desc&rank=species&order_by=observations_count`,
    json,
  );

  return json.results.map(({ id, name, is_active }) => ({
    id,
    name,
    is_active,
  }));
};

/*
{
  "total_results": 2,
  "page": 1,
  "per_page": 30,
  "results": [
    {
      "id": 233010,
      "rank": "species",
      "rank_level": 10,
      "iconic_taxon_id": 47158,
      "ancestor_ids": [
        48460,
        1,
        47120,
        372739,
        47158,
        184884,
        47157,
        49531,
        49530,
        123032,
        1518738,
        178719,
        233010
      ],
      "is_active": true,
      "name": "Triphosa haesitata",
      "parent_id": 178719,
      "ancestry": "48460/1/47120/372739/47158/184884/47157/49531/49530/123032/1518738/178719",
      "extinct": false,
      "default_photo": {
        "id": 624764,
        "license_code": "cc-by-nc-sa",
        "attribution": "(c) Dick, some rights reserved (CC BY-NC-SA)",
        "url": "https://inaturalist-open-data.s3.amazonaws.com/photos/624764/square.jpg",
        "original_dimensions": {
          "height": 910,
          "width": 1600
        },
        "flags": [],
        "square_url": "https://inaturalist-open-data.s3.amazonaws.com/photos/624764/square.jpg",
        "medium_url": "https://inaturalist-open-data.s3.amazonaws.com/photos/624764/medium.jpg"
      },
      "taxon_changes_count": 0,
      "taxon_schemes_count": 2,
      "observations_count": 3136,
      "flag_counts": {
        "resolved": 0,
        "unresolved": 0
      },
      "current_synonymous_taxon_ids": null,
      "atlas_id": 52152,
      "complete_species_count": null,
      "wikipedia_url": "http://en.wikipedia.org/wiki/Triphosa_haesitata",
      "iconic_taxon_name": "Insecta",
      "preferred_common_name": "Tissue Moth"
    },
    {
      "id": 212342,
      "rank": "species",
      "rank_level": 10,
      "iconic_taxon_id": 47158,
      "ancestor_ids": [
        48460,
        1,
        47120,
        372739,
        47158,
        184884,
        47157,
        47156,
        47155,
        124615,
        199539,
        124620,
        212342
      ],
      "is_active": true,
      "name": "Acleris maximana",
      "parent_id": 124620,
      "ancestry": "48460/1/47120/372739/47158/184884/47157/47156/47155/124615/199539/124620",
      "extinct": false,
      "default_photo": {
        "id": 3212945,
        "license_code": "cc-by-nc",
        "attribution": "(c) Scott Gilmore, some rights reserved (CC BY-NC), uploaded by Scott Gilmore",
        "url": "https://inaturalist-open-data.s3.amazonaws.com/photos/3212945/square.jpg",
        "original_dimensions": {
          "height": 981,
          "width": 709
        },
        "flags": [],
        "square_url": "https://inaturalist-open-data.s3.amazonaws.com/photos/3212945/square.jpg",
        "medium_url": "https://inaturalist-open-data.s3.amazonaws.com/photos/3212945/medium.jpg"
      },
      "taxon_changes_count": 0,
      "taxon_schemes_count": 2,
      "observations_count": 243,
      "flag_counts": {
        "resolved": 0,
        "unresolved": 0
      },
      "current_synonymous_taxon_ids": null,
      "atlas_id": null,
      "complete_species_count": null,
      "wikipedia_url": "http://en.wikipedia.org/wiki/Acleris_maximana",
      "iconic_taxon_name": "Insecta"
    }
  ]
}*/
