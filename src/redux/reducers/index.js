import {combineReducers} from 'redux';
import sideChart from './sideChart';
import configs from './configs';
import remarks from './remarks';
import progress from './progress';
import process from './process';

export default combineReducers({
  sideChart,
  configs,
  remarks,
  progress,
  process,
});
