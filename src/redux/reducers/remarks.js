import {RESET_STORE, SAVE_REMARKS, UPDATE_REMARK} from '../actionTypes';

export const initialState = {
};

export default (state = initialState, action) => {
  switch (action.type) {
    case RESET_STORE: {
      return initialState;
    }
    case SAVE_REMARKS: {
      return {
        ...state,
        [action.sym]: action.remarks,
      };
    }
    case UPDATE_REMARK: {
      const newSym = {...state[action.sym]};
      newSym[action.key] = action.body;
      return {
        ...state,
        [action.sym]: newSym,
      }
    }
    default:
      return state;
  }
};
