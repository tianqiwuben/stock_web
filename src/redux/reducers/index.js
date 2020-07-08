import {combineReducers} from 'redux';
import sideChart from './sideChart';
import configs from './configs';
import remarks from './remarks';
import progress from './progress';
import process from './process';
import processPage from './processPage';
import messages from './messages';
import messagesPage from './messagesPage';

export default combineReducers({
  sideChart,
  configs,
  remarks,
  progress,
  process,
  processPage,
  messages,
  messagesPage
});
