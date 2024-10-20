/**
 * Package exports:
 *
 * import { App, generateDataFiles } from '@imerss/inat-curated-species-list';
 *
 * - `App`:               the top-level app. This outputs two tabs, one for the full species list table and another
 *                        showing new additions to the list.
 * - `generateDataFiles`: the script command used for generating the data files.
 */

export type AppProps = {
  readonly placeId: number;
  readonly taxonId: number;
  readonly curatorUsernames: string[];
  readonly dataUrl: string;
  readonly showSpeciesList: boolean;
  readonly showNewAdditions: boolean;
};

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
  | 'species';
