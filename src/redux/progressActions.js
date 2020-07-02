import {UPDATE_PROGRESS} from './actionTypes';

export const updateProgress = (key, data) => ({
  type: UPDATE_PROGRESS,
  key,
  data,
});

