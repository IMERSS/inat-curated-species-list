import { APP_STATE_VERSION } from '../../constants';

export type MainState = {
  appStateVersion: number;
};

const initialState: MainState = {
  appStateVersion: APP_STATE_VERSION,
};

const mainReducer = (state = initialState, action: any) => {
  switch (action.type) {
    default:
      return state;
  }
};

export default mainReducer;
