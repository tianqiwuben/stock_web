import {RESET_STORE} from '../actionTypes';

export const initialState = {};

export default (state = initialState, action) => {
  switch (action.type) {
    case RESET_STORE: {
      return initialState;
    }
    default:
      return state;
  }
};
