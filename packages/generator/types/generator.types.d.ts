import { Logger } from 'winston';

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

export type INatApiObsRequestParams = {
  readonly place_id: number;
  readonly taxon_id: number;
  readonly order: string;
  readonly per_page: number;
  readonly order_by: 'id';
  readonly verifiable: 'any';
  readonly ident_user_id: string;
  id_above?: number;
};

export type TaxonomyMap = {
  [rank in Taxon]: string;
};

export type DownloadDataPacketArgs = {
  readonly curators: string;
  readonly placeId: number;
  readonly taxonId: number;
  readonly packetNum: number;
  readonly tempFolder: string;
  readonly logger: Logger;
};

// not exhaustive. Just contains a couple of things we use from their data model
export type INatTaxonAncestor = {
  readonly rank: Taxon;
  readonly name: string;
};

/**
 * This defines the structure of the Extraction config file. Users define a file containing the following settings before
 * running the extraction script. That then pings iNat's API to retrieve the information they want and generate a file on
 * disk for use by the script. For the run-time visualization of the data, see the `VisualizationConfig` type below.
 */
export type GeneratorConfig = {
  /**
   * An array of iNat usernames for your curators. The script will request all observations in the
   * taxon and place of your choosing that have been reviewed by the users here.
   */
  readonly curators: string[];

  /**
   * The taxon ID of whatever you're interested in.
   */
  readonly taxonId: number;

  /**
   * The place ID of your region.
   */
  readonly placeId: number;

  /**
   * The iNat data contains the (vast!) full taxonomy of all observations. You won't be interested in displaying all that
   * info. This setting controls which taxons will be retrieved and stored in the data file for display.
   *
   * Default: ['superfamily', 'family', 'subfamily', 'tribe', 'genus', 'species']
   */
  readonly taxons?: Taxon[];

  /**
   * The name of the generated data file.
   */
  readonly dataFilename: string;

  /**
   * The data set can typically get very large. In all cases the data in the file will be minified (a map of taxon strings is generated and
   * internally referenced) but this setting controls whether all whitespace and indention is removed.
   *
   * Default: true
   */
  readonly minifyData?: boolean;

  /**
   * The name of the logfile. Path is relative to where you ran the generation command. This file will be generated/overwritten.
   * Defaults to `log.txt`
   */
  readonly logFile?: string;

  /**
   * The name of a temporary folder where the raw data from iNat will be stored. Defaults to './temp
   */
  readonly tempFolder?: string;
};

export type GetDataPacketResponse = {
  readonly total_results: number;
  readonly results: [
    {
      id: number;

      // user info about who made the observation
      user: {
        login: string;
      };

      // the full taxonomy of the observation. This looks like it's the latest best reflection of the identifications made on the osb
      taxon: {
        rank: Taxon;
      };

      // an array of identifications made on this observation
      identifications: [
        {
          taxon_id: string;
          user: {
            login: string;
          };

          // this seems to indicate whether the user has overwritten it with a newer one, or maybe removed. Regardless: it's
          // needed to filter out dud identifications
          current: boolean;
          taxon: {
            name: string;
            rank: Taxon;
            ancestors: [];
          };
        },
      ];
    },
  ];
};

export type DownloadDataPacketResponse = {
  readonly totalResults: number;
  readonly numRequests: number;
};
