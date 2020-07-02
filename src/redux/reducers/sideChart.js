import {RESET_STORE, SAVE_SIDE_CHART} from '../actionTypes';

export const initialState = {};

export default (state = initialState, action) => {
  switch (action.type) {
    case RESET_STORE: {
      return initialState;
    }
    case SAVE_SIDE_CHART: {
      return action.data;
    }
    default:
      return state;
  }
};
