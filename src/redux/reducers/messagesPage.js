import {RESET_STORE, UPDATE_MESSAGE_PAGE, INSERT_MESSAGE} from '../actionTypes';

export const initialState = {
  total_entries: 0,
  total_unread: 0,
  page: 1,
  ids: [],
  barIds: [],
  variant: 'all',
  unread_status: 'all',
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
    case INSERT_MESSAGE: {
      const newSt = {...state};
      newSt.total_entries += 1;
      newSt.total_unread += 1;
      newSt.ids.unshift(action.message.id);
      if (newSt.ids.length > 25) {
        newSt.ids.pop();
      }
      newSt.barIds.unshift(action.message.id);
      if (newSt.barIds.length > 5) {
        newSt.barIds.pop();
      }
      return newSt;
    }
    default:
      return state;
  }
};
