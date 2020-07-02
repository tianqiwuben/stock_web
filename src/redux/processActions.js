import {SAVE_PROCESS} from './actionTypes';

export const saveProcess = (id, data) => ({
  type: SAVE_PROCESS,
  id,
  data,
});
