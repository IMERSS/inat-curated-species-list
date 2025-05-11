import { APP_STATE_VERSION } from '../../constants';

export type MainState = {
  appStateVersion: number;
  placeId: number;
  taxonId: number;
  curators: string[];

  inatObsData: {
    isActive: boolean;
  };
};

const initialState: MainState = {
  appStateVersion: APP_STATE_VERSION,

  // these'll be populated on login. They're so fundamental.
  placeId: 7085,
  taxonId: 47157,
  curators: ['oneofthedavesiknow', 'gpohl', 'crispinguppy'],

  inatObsData: {
    isActive: false,
  },
};

const mainReducer = (state = initialState, action: any) => {
  switch (action.type) {
    default:
      return state;
  }
};

export default mainReducer;
