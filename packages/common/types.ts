export type Taxon =
  | 'kingdom'
  | 'phylum'
  | 'subphylum'
  | 'class'
  | 'subclass'
  | 'order'
  | 'superfamily'
  | 'family'
  | 'subfamily'
  | 'tribe'
  | 'subtribe'
  | 'genus'
  | 'subgenus'
  | 'section'
  | 'species';

export type CuratedSpeciesData = {
  [taxonId: string]: {
    data: TaxonomyMap;
    count: number;
  };
};

export type TaxonomyMap = {
  [rank in Taxon]: string;
};
