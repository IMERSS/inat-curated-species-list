import { Logger } from 'winston';
import { Taxon } from '@imerss/inat-curated-species-list-types';

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
   * The name of the generated data file for the species data.
   */
  readonly speciesDataFilename: string;

  /**
   * The name of the generated data file for the new additions data.
   */
  readonly newAdditionsFilename: string;

  /**
   * If enabled, generates a separate data file containing the list of "new additions". The idea is to be able to show newly
   * confirmed species that have been added to the curated list, so you can see how the list is growing over time.
   *
   * A species is first added to the curated list when one of the curators first approves or adds the species identification.
   * The very first observation to have been confirmed by a curator is the one that'll be shown up: NOT the first *observed*
   * species.
   */
  readonly trackNewAdditions?: boolean;

  readonly newAdditionsStartDate?: string;

  /**
   * The iNat data contains the (vast!) full taxonomy for all observations. You won't be interested in displaying all that
   * info. This setting controls which taxons will be retrieved and stored in the data file for display in your table.
   *
   * Default: ['superfamily', 'family', 'subfamily', 'tribe', 'genus', 'species']
   */
  readonly taxons?: Taxon[];

  /**
   * The name of a temporary folder where all the data will be generated.
   */
  readonly tempFolder?: string;
};

export type GetDataPacketResponse = {
  readonly total_results: number;
  readonly results: [
    {
      id: number;
      observed_on_details: {
        date: string;
      };
      created_at_details: {
        date: string;
      };

      // user info about who made the observation
      user: {
        login: string;
      };

      // the full taxonomy of the observation. This looks like it's the latest best reflection of the identifications made
      taxon: {
        id: number;
        rank: Taxon;
        name: string;
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
          created_at: string;
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
