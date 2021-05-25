import React from 'react';
import compose from 'recompose/compose';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import moment from 'moment';

import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

import {registerComponent} from '../common/Constants';

const styles = theme => ({
});

const status2color = {
  unknown: 'inherit',
  offline: 'secondary',
  ok: 'primary',
}

const subsysInstances = [
  'account_streaming',
  'aggs_bar',
  'second_bar_streaming', 
//  'option_streaming',
  'strategy_resolver_prod',
  'strategy_resolver_paper',
  'strategy_resolver_test',
];


class StatusBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dropDownOpen: false,
      subsys: {},
      checkTs: 0,
      status: 'unknown',
    }
  }

  componentDidMount() {
    registerComponent('statusBar', this);
  }

  componentWillUnmount() {
    registerComponent('statusBar', null);
  }

  onSubSysStatus = (data) => {
    const newStatus = [];
    let status = 'ok';
    subsysInstances.forEach(instName => {
      if (data[instName]) {
        newStatus[instName] = data[instName];
        if (data[instName].status !== 'ok' && !instName.includes('strategy_resolver')) {
          status = data[instName].status;
        }
      } else {
        if (!instName.includes('strategy_resolver')) {
          newStatus[instName] = {status: 'offline'};
          status = 'offline';
        }
      }
    });
    this.setState({
      subsys: newStatus,
      checkTs: Date.now() - data.checkTs,
      status,
    });
  }

  onClickIcon = (e) => {
    this.setState({dropDownOpen: true, anchorEl: e.currentTarget});
  }

  handleClose = () => {
    this.setState({dropDownOpen: false});
  }

  render() {
    const {
      dropDownOpen,
      anchorEl,
      subsys,
      status,
      checkTs,
    } = this.state;
    return (
      <div>
        <Button onClick={this.onClickIcon}
          startIcon={<FiberManualRecordIcon color={status2color[status]}/>}
        >
          STATUS
        </Button>
        <Menu
          anchorEl={anchorEl}
          open={dropDownOpen || status === 'error'}
          onClose={this.handleClose}
        >
          <MenuItem>
            <ListItemIcon>
              <FiberManualRecordIcon color={status2color[status]}/>
            </ListItemIcon>
            <ListItemText
              primary={`Last check: ${checkTs}ms ago`}
            />
          </MenuItem>
          {
            subsysInstances.map(instName => {
              const row = subsys[instName];
              const st = row ? row.status : 'unknown';
              let secondTxt = '';
              if (instName === 'aggs_bar' && row && row.insertCount) {
                secondTxt = `Inserted ${(row.insertCount / 1000).toFixed(0)}k`;
              }
              if (row && row.status !== 'ok' && row.seqId) {
                const ts = moment.unix(row.seqId / 1000);
                secondTxt = `Last check: ${ts.format('L LTS')}`;
              }
              return (
                <MenuItem key={instName}>
                  <ListItemIcon>
                    <FiberManualRecordIcon color={status2color[st]}/>
                  </ListItemIcon>
                  <ListItemText
                    primary={instName}
                    secondary={secondTxt}
                  />
                </MenuItem>
              )
            })
          }
        </Menu>
      </div>
    );
  }
}

export default compose(
  withStyles(styles),
)(StatusBar);