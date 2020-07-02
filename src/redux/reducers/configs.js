import {RESET_STORE, SET_CONFIGS, RESET_CONFIGS} from '../actionTypes';

export const initialState = {
  last_c: 0,
  last_v: 0,
  sym: 'SPY',
  strategy: '',
  isPercent: true,
  displayEnv: 'prod',
};

export default (state = initialState, action) => {
  switch (action.type) {
    case RESET_STORE: {
      return initialState;
    }
    case RESET_CONFIGS: {
      return {
        ...initialState,
        sym: state.sym,
        isPercent: state.isPercent,
        strategy: state.strategy,
        displayEnv: state.displayEnv,
      };
    }
    case SET_CONFIGS: {
      return {
        ...state,
        ...action.configs,
      }
    }
    default:
      return state;
  }
};
