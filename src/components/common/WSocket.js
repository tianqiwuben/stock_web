import React from 'react';
import compose from 'recompose/compose';
import { withSnackbar } from 'notistack';
import {connect} from 'react-redux';
import {updateProgress} from '../../redux/progressActions';
import {saveProcess} from '../../redux/processActions';
import {insertMessage} from '../../redux/messagesActions';
import {registerComponent, getComponent} from '../common/Constants';
class WSocket extends React.Component {
  componentDidMount() {
    this.connectWs();
    registerComponent('websocket', this);
  }

  componentWillUnmount() {
    registerComponent('websocket', null);
  }

  subscribeStock = (sym) => {
    const msg = {type: 'listen', sym};
    this.subStock = sym;
    this.ws.send(JSON.stringify(msg));
  }

  subscribePrices = list => {
    const msg = {type: 'subPrices', list};
    this.subPrices = list;
    this.ws.send(JSON.stringify(msg));
  }

  connectWs = () => {
    this.ws = new WebSocket('ws://192.168.86.101:3002');
    this.ws.onopen = () => {
      if (this.interval) {
        clearInterval(this.interval);
        this.interval = null;
      }
      this.ws.onclose = (e) => {
        this.interval = setInterval(this.connectWs, 10000);
      }
      if (this.subStock) {
        this.subscribeStock(this.subStock);
      }
      if (this.subPrices) {
        this.subscribePrices(this.subPrices);
      }
    }
    this.ws.onmessage = (e) => {
      const {
        dispatchUpdateProgress,
        dispatchSaveProcess,
        enqueueSnackbar,
        dispatchInsertMessage,
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
        case 'message': {
          const message = msg.msg;
          dispatchInsertMessage(message);
          enqueueSnackbar(message.message, {
            variant: message.variant_str,
            anchorOrigin: {horizontal: 'right', vertical: 'top'},
          });
          break;
        }
        case 'stock': {
          const sg = getComponent('liveChart');
          if (sg) {
            sg.onFeedBar(msg);
          }
          break;
        }
        case 'prices': {
          const cp = getComponent('status');
          if (cp) {
            cp.onPricePush(msg);
          }
          break;
        }
        case 'suggestion': {
          const sg = getComponent('suggestions');
          if (sg) {
            sg.onFeedSuggestion(msg.data);
          }
          enqueueSnackbar(`Suggestion: ${msg.data.action_str} ${msg.data.sym}`, {variant: 'info'});
          break;
        }
        case 'steven': {
          const cp = getComponent('steven');
          if (cp) {
            cp.updatePositions(msg.data);
          }
          break;
        }
        case 'sym_status': {
          const cp = getComponent('SymStatus');
          if (cp) {
            cp.onStatusPush(msg.data);
          }
          break;
        }
        case 'pm_status': {
          const cp = getComponent('status');
          if (cp) {
            cp.onStatusPush(msg.env, msg.data);
          }
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

const mapStateToProps = state => ({
  messagesPage: state.messagesPage,
})

export default compose(
  connect(mapStateToProps, {
    dispatchUpdateProgress: updateProgress,
    dispatchSaveProcess: saveProcess,
    dispatchInsertMessage: insertMessage,
  }),
  withSnackbar,
)(WSocket);