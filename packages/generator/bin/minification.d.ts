/**
 * The data needed for this package is very large, after extracting only what we need from the iNat requests. This file
 * contains some helpers to minimize and expand the raw data so requests to the data source are kept as small as possible.
 */
import { CuratedSpeciesData, Taxon } from '../../types/internal';
export type TaxonsToMinifyMap = Partial<Record<Taxon, boolean>>;
export type TaxonMinificationDataMap = Partial<Record<string, string>>;
type MinifiedData = {
    taxonMap: TaxonMinificationDataMap;
    taxonData: {
        [taxonName: string]: string;
    };
};
export declare const minifySpeciesData: (data: CuratedSpeciesData, targetTaxons: Taxon[]) => MinifiedData;
export {};
//# sourceMappingURL=minification.d.ts.map