import {RESET_STORE, SAVE_PROCESS} from '../actionTypes';

export const initialState = {
};

export default (state = initialState, action) => {
  switch (action.type) {
    case RESET_STORE: {
      return initialState;
    }
    case SAVE_PROCESS: {
      return {
        ...state,
        ...action.data,
      };
    }
    default:
      return state;
  }
};
