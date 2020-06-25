import {SAVE_OPTIMIZATIONS} from './actionTypes';

export const saveOptimizations = (strategy, optimizations) => ({
  type: SAVE_OPTIMIZATIONS,
  optimizations,
  strategy,
});