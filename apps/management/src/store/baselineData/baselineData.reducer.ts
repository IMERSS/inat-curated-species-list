import * as actions from './baselineData.actions';
import * as mainActions from '../main/main.actions';
import { BaselineDataObj, SortCol, SortDir } from '../../components/baseline/BaselineData.types';
import { BaselineSpeciesInatData, MessageType } from '../../types';

export type BaselineDataState = {
  data: BaselineDataObj;
  sortCol: SortCol;
  sortDir: SortDir;
  sortedTaxonIds: number[];
  isLoading: boolean;
  isLoaded: boolean;
  validationDate: string | null;
  lastMessage: null;
  messageType: MessageType | null;
};

const initialState: BaselineDataState = {
  data: {},
  sortCol: 'name',
  sortDir: 'asc',
  sortedTaxonIds: [],
  isLoading: false,
  isLoaded: false,
  validationDate: null,
  lastMessage: null,
  messageType: null,
};

const baselineDataReducer = (state = initialState, action: any) => {
  switch (action.type) {
    case mainActions.PURGE_STATE:
      return initialState;

    case actions.BASELINE_DATA_LOAD:
      return {
        ...state,
        isLoading: true,
      };

    case actions.BASELINE_DATA_LOADED:
      const dataObj: BaselineDataObj = {};
      (action.payload.data as BaselineSpeciesInatData[]).forEach(({ id, ...other }) => (dataObj[id] = other));
      return {
        ...state,
        isLoading: false,
        isLoaded: true,
        data: dataObj,
      };

    default:
      return state;
  }
};

export default baselineDataReducer;
