export type BaselineDataObj = {
  [taxonId: string]: {
    readonly name: number;
    readonly isActive: boolean;
    readonly researchGradeReviewCount?: number;
    readonly curatorReviewCount?: number;
  };
};

export type SortCol = 'id' | 'name';
export type SortDir = 'asc' | 'desc';
