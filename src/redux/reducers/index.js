import {combineReducers} from 'redux';
import configs from './configs';
import remarks from './remarks';
import progress from './progress';
import process from './process';
import processPage from './processPage';
import messages from './messages';
import messagesPage from './messagesPage';

export default combineReducers({
  configs,
  remarks,
  progress,
  process,
  processPage,
  messages,
  messagesPage
});
