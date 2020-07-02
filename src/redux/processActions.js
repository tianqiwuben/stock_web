import {SAVE_PROCESS, RESET_PROCESS_PAGE, UPDATE_PROCESS_PAGE} from './actionTypes';

export const saveProcess = (data) => ({
  type: SAVE_PROCESS,
  data,
});


export const resetProcessPage = () => ({
  type: RESET_PROCESS_PAGE,
});



export const updateProcessPage = (data) => ({
  type: UPDATE_PROCESS_PAGE,
  data,
});



