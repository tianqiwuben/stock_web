import {RESET_STORE, SAVE_OPTIMIZATIONS} from '../actionTypes';

export const initialState = {
};

export default (state = initialState, action) => {
  switch (action.type) {
    case RESET_STORE: {
      return initialState;
    }
    case SAVE_OPTIMIZATIONS: {
      return {
        ...state,
        [action.strategy]: action.optimizations,
      }
    }
    default:
      return state;
  }
};
