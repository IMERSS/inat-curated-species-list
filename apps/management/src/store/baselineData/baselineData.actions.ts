import { getBaselineSpecies } from '../../api/api';

export const BASELINE_DATA_LOAD = 'BASELINE_DATA_LOAD';
export const BASELINE_DATA_LOADED = 'BASELINE_DATA_LOADED';
export const loadBaselineData = () => async (dispatch: any) => {
  dispatch({ type: BASELINE_DATA_LOAD });

  const resp = await getBaselineSpecies();
  const { validationDate, data } = await resp.json();

  dispatch({
    type: BASELINE_DATA_LOADED,
    payload: {
      validationDate,
      data,
    },
  });
};

export const BASELINE_DATA_SAVE = 'BASELINE_DATA_SAVE';
export const BASELINE_DATA_SAVED = 'BASELINE_DATA_SAVED';
export const saveBaselineData = (data) => {};
