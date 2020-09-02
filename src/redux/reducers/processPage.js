import {RESET_STORE, RESET_PROCESS_PAGE, UPDATE_PROCESS_PAGE} from '../actionTypes';

export const initialState = {
  totalPage: 1,
  totalEntries: 0,
  page: 1,
  ids: [],
  sym: '',
  strategy: 'all',
  status: 'all',
};

export default (state = initialState, action) => {
  switch (action.type) {
    case RESET_STORE:
    case RESET_PROCESS_PAGE: {
      return initialState;
    }
    case UPDATE_PROCESS_PAGE: {
      return {
        ...state,
        ...action.data,
      };
    }
    default:
      return state;
  }
};
