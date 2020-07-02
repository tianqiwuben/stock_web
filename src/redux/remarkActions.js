import {SAVE_REMARKS, UPDATE_REMARK} from './actionTypes';

export const saveRemarks = (sym, remarks) => ({
  type: SAVE_REMARKS,
  sym,
  remarks,
});


export const updateRemark = (sym, key, body) => ({
  type: UPDATE_REMARK,
  sym,
  key,
  body,
})