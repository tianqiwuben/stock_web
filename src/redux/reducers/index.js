import {combineReducers} from 'redux';
import charts from './charts';
import configs from './configs';
import optimizations from './optimizations';

export default combineReducers({
  charts,
  configs,
  optimizations,
});
