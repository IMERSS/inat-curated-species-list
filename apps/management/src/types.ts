export type BaselineSpeciesInatData = {
  readonly id: number;
  readonly name: number;
  readonly isActive: boolean;
  readonly researchGradeReviewCount?: number;
  readonly curatorReviewCount?: number;
};

export type MainSettings = {
  readonly curators: string;
  readonly taxonId?: number | null;
  readonly placeId?: number | null;
};

export type RegionSpecies = {
  [taxonId: string]: {
    count: number;
    isActive: boolean;
  };
};
