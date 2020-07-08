import {RESET_STORE, UPDATE_MESSAGE_PAGE} from '../actionTypes';

export const initialState = {
  total_entries: 0,
  total_unread: 0,
  page: 1,
  ids: [],
  barIds: [],
};

export default (state = initialState, action) => {
  switch (action.type) {
    case RESET_STORE: {
      return initialState;
    }
    case UPDATE_MESSAGE_PAGE: {
      return {
        ...state,
        ...action.data,
      };
    }
    default:
      return state;
  }
};
