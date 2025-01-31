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
  readonly speciesDataFilename?: string;

  /**
   * If enabled, generates a separate data file containing the list of "new additions". The idea is to be able to show newly
   * confirmed species that have been added to the curated list, so you can see how the list is growing over time.
   *
   * A species is first added to the curated list when one of the curators first approves or adds the species identification.
   * The very first observation to have been confirmed by a curator is the one that'll be shown up: NOT the first *observed*
   * species.
   */
  readonly trackNewAdditions: boolean;

  /**
   * The name of the generated data file for the new additions data.
   */
  readonly newAdditionsFilename?: string;

  /**
   * Shows the date of when the data was last generated.
   */
  readonly showLastGeneratedDate: boolean;

  /**
   * If you're using the new additions or taxon changes feature, this has to be set to specify the date at which the
   * baseline data is considered to already be in iNaturalist. In other words, any identifications by curators made for
   * species after this date will cause the species to get listed in the New Additions sections, plus it'll track taxon
   * changes made after the same date.
   * Format: YYYY-MM-DD
   */
  readonly baselineEndDate?: string;

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

  // incomplete. I found the taxon change information very confusing to present. Sometimes users would do a taxon change then
  // reverse it (see changes on this observation, for example: https://www.inaturalist.org/observations/32189129). Perhaps
  // we could look for circular taxon changes and only present the latest change, but I think that would be incorrect in some
  // cases: there are probably legitimate scenarios where a taxon is changed then changed back.
  //
  readonly trackTaxonChanges?: boolean;

  readonly taxonChangesFilename?: string;

  /**
   * Used for debugging the generation script. This can be used after the raw packet-X.json files are generated on disk,
   * housing the response from the iNat API. Each setting lets you regenerate the corresponding data file
   */
  readonly debug?: {
    /**
     * This has to be set to true to use this feature.
     */
    enabled?: boolean;

    /**
     * When true, will regenerate the species-data.json file.
     */
    species: boolean;

    /**
     * When true, will regenerate the new-additions-data.json file.
     */
    newAdditions: boolean;

    /**
     * When true, will regenerate the taxon-changes-data.json file.
     */
    taxonChanges: boolean;
  };
};

export type NewAddition = {
  readonly observationId: number;
  readonly speciesName: string;
  readonly taxonId: number; // TODO this is a string right now
  readonly confirmationDate: string;
  readonly curator: string;
  readonly dateObserved: string;
  readonly observer: {
    id: number;
    name: string;
    username: string;
  };
};

export type TaxonAncestor = {
  readonly id: number;
  readonly rank: Taxon;
  readonly name: string;
};

export type TaxonChangeType = 'TaxonSwap' | 'TaxonSplit' | 'TaxonMerge';

export type Identification = {
  taxon_id: number;
  user: {
    login: string;
  };

  // this seems to indicate whether the user has overwritten it with a newer one, or maybe removed. Regardless: it's
  // needed to filter out dud identifications
  current: boolean;
  created_at: string;
  taxon: {
    id: number;
    name: string;
    rank: Taxon;
    ancestors: TaxonAncestor[];
  };

  taxon_change?: {
    id: number;
    type: TaxonChangeType;
  };

  previous_observation_taxon: {
    id: number;
    name: string;
    rank: Taxon;
  };
};

export type Observation = {
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
    name: string;
    id: number;
  };

  // the full, current taxon info of the observation as according to identifications made. However, note:
  // 1. curators may have approved genus or higher, but not species, so this information may be a species that hasn't been corroborated
  //    by one of our curators, and
  // 2. it may even contain different info than we care about. A curator may have asserted an observation is something quite different
  //    than what was originally asserted
  taxon: {
    id: number;
    rank: Taxon;
    name: string;
    is_active: boolean; // false when there's been a taxon swap (and perhaps newly extinct)
  };

  // an array of identifications made on this observation
  identifications: Identification[];
};

export type GetDataPacketResponse = {
  readonly total_results: number;
  readonly results: Observation[];
};

export type DownloadDataPacketResponse = {
  readonly totalResults: number;
  readonly numRequests: number;
};

export type TaxonChangeData = {
  readonly observationId: number;
  readonly previousSpeciesName: string;
  readonly newSpeciesName: string;
  readonly newSpeciesTaxonId: number;
  readonly taxonChangeObsCreatedAt: string;
  readonly taxonChangeId: number;
  readonly taxonChangeType: TaxonChangeType;
};
