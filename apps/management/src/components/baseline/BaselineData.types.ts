export type BaselineDataObj = {
  [taxonId: string]: {
    readonly name: string;
    readonly isActive: boolean;
    readonly researchGradeReviewCount?: number;
    readonly curatorReviewCount?: number;
  };
};

export type SortCol = 'id' | 'name' | 'researchGradeReviewCount' | 'curatorReviewCount';
export type SortDir = 'asc' | 'desc';
