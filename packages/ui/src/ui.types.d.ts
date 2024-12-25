export type AppProps = {
  readonly placeId: number;
  readonly taxonId: number;
  readonly curatorUsernames: string[];
  readonly dataUrl: string;
  readonly showSpeciesList: boolean;
  readonly showNewAdditions: boolean;
};

export type TaxonomyMap = {
  [rank in Taxon]: string;
};

export type LogType = 'info' | 'error' | 'success';
export type LogRow = [string, string];
export type LoggerHandle = {
  addLogRow: (str: string, logType: LogType) => number;
  addLogRows: (arr: LogRow[]) => void;
  replaceLogRow: (rowId: number, str: string, logType: LogType) => void;
  clear: () => void;
};

export type CuratedSpeciesData = {
  [taxonId: string]: {
    data: TaxonomyMap;
    count: number;
  };
};

export type CuratedSpeciesTaxon = {
  data: TaxonomyMap;
  count: number;
  taxonId: string;
};
