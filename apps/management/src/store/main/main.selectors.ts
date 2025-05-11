import { ReduxState } from '../types';

export const getAppStateVersion = (state: ReduxState) => state.main.appStateVersion;
export const getPlaceId = (state: ReduxState) => state.main.placeId;
export const getTaxonId = (state: ReduxState) => state.main.taxonId;
export const getCurators = (state: ReduxState) => state.main.curators;
export const isInatObsDataRequestActive = (state: ReduxState) => state.main.inatObsData.isActive;
