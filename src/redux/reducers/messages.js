import {RESET_STORE, SAVE_MESSAGE} from '../actionTypes';

export const initialState = {
};

export default (state = initialState, action) => {
  switch (action.type) {
    case RESET_STORE: {
      return initialState;
    }
    case SAVE_MESSAGE: {
      return {
        ...state,
        ...action.data,
      };
    }
    default:
      return state;
  }
};
