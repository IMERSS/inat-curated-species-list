import type { Taxon } from './internal';

/**
 * This defines the structure of the Extraction config file. Users define a file containing the following settings before
 * running the extraction script. That then pings iNat's API to retrieve the information they want and generate a file on
 * disk for use by the script. For the run-time visualization of the data, see the `VisualizationConfig` type below.
 */
export type ExtractDataConfig = {
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
  readonly retrieveTaxons?: Taxon[];

  /**
   * The data set can typically get very large. In all cases the data in the file will be minified (a map of taxon strings is generated and
   * internally referenced) but this setting controls whether all whitespace and indention is removed.
   *
   * Default: true
   */
  readonly minifyData?: boolean;
};

export type VisualizationConfig = {
  readonly dataFileUrl: string;

  // don't both adding a `visibleTaxons` setting here. Just load what's from the data file.

  readonly showRowNumbers: boolean;
  readonly showLinkToINat: boolean;
  readonly showFilterResultsField: boolean;
  readonly allowDownload: boolean;
  readonly showLatestAdditions: boolean;

  // these three are only needed if `showLinkToINat` is enabled. These values are used to construct the links
  readonly curators?: string[];
  readonly placeId?: number;
  readonly taxonId?: number;
};
