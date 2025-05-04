import { createSelector } from 'reselect';
import { ReduxState } from '../types';

export const getBaselineData = (state: ReduxState) => state.baselineData.data;
export const getSortCol = (state: ReduxState) => state.baselineData.sortCol;
export const getSortDir = (state: ReduxState) => state.baselineData.sortDir;
export const getSortedTaxonIds = (state: ReduxState) => state.baselineData.sortedTaxonIds;
export const isLoading = (state: ReduxState) => state.baselineData.isLoading;
export const isLoaded = (state: ReduxState) => state.baselineData.isLoaded;
export const getValidationDate = (state: ReduxState) => state.baselineData.validationDate;

export const getSortedBaselineData = createSelector(getBaselineData, getSortedTaxonIds, (data, sortedTaxonIds) => {
  return sortedTaxonIds.length
    ? sortedTaxonIds.map((id) => ({
        id,
        ...data[id],
      }))
    : [];
});
