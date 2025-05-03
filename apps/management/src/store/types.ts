import type { MainState } from './main/main.reducer';
import type { BaselineDataState } from './baselineData/baselineData.reducer';

export type ReduxState = {
  main: MainState;
  baselineData: BaselineDataState;
};
