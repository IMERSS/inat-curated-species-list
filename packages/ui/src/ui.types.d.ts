import { NewAddition } from '@imerss/inat-curated-species-list-tools';

export type CuratedSpeciesTableProps = {
  readonly placeId: number;
  readonly taxonId: number;
  readonly curatorUsernames: string[];
  readonly dataUrl: string;
  readonly showSpeciesList: boolean;
  readonly showNewAdditions: boolean;
};

export type NewAdditionsByYear = {
  [year: string]: NewAddition[];
};
