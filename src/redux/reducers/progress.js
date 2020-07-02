import {RESET_STORE, UPDATE_PROGRESS} from '../actionTypes';

export const initialState = {
};

export default (state = initialState, action) => {
  switch (action.type) {
    case RESET_STORE: {
      return initialState;
    }
    case UPDATE_PROGRESS: {
      return {
        ...state,
        [action.key]: action.data,
      };
    }
    default:
      return state;
  }
};
