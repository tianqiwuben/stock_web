import React from 'react';
import compose from 'recompose/compose';
import { withSnackbar } from 'notistack';
import {connect} from 'react-redux';
import {updateProgress} from '../../redux/progressActions';
import {saveProcess} from '../../redux/processActions';

class WSocket extends React.Component {
  componentDidMount() {
    this.connectWs();
  }

  connectWs = () => {
    this.ws = new WebSocket('ws://localhost:3002');
    this.ws.onopen = () => {
      if (this.interval) {
        clearInterval(this.interval);
        this.interval = null;
      }
      this.ws.onclose = (e) => {
        this.interval = setInterval(this.connectWs, 10000);
      }
    }
    this.ws.onmessage = (e) => {
      const {
        dispatchUpdateProgress,
        dispatchSaveProcess,
        enqueueSnackbar,
      } = this.props;
      const msg = JSON.parse(e.data);
      switch(msg.type) {
        case 'progress': {
          dispatchUpdateProgress(msg.key, msg.data);
          break;
        }
        case 'process': {
          dispatchSaveProcess({[msg.id]: msg.data});
          break;
        }
        case 'notification': {
          enqueueSnackbar(msg.msg, msg.options);
          break;
        }
        default:
      }
    };
  }

  render() {
    return null;
  }
}

export default compose(
  connect(null, {
    dispatchUpdateProgress: updateProgress,
    dispatchSaveProcess: saveProcess,
  }),
  withSnackbar,
)(WSocket);