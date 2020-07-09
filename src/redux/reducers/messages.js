import {RESET_STORE, SAVE_MESSAGE, INSERT_MESSAGE} from '../actionTypes';

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
    case INSERT_MESSAGE: {
      return {
        ...state,
        [action.message.id]: action.message,
      }
    }
    default:
      return state;
  }
};
