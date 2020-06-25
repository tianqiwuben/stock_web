import {SET_CONFIGS, RESET_CONFIGS} from './actionTypes';

export const setConfigs = (configs) => ({
  type: SET_CONFIGS,
  configs,
});

export const resetConfigs = () => ({
  type: RESET_CONFIGS,
});