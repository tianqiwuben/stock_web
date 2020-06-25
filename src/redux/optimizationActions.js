import {SAVE_OPTIMIZATIONS} from './actionTypes';

export const saveOptimizations = optimizations => ({
  type: SAVE_OPTIMIZATIONS,
  optimizations,
});