import React from 'react';
import compose from 'recompose/compose';
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import Grid from '@material-ui/core/Grid';
import {connect} from 'react-redux';
import querystring from 'querystring';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListSubheader from '@material-ui/core/ListSubheader';
import OptimizationResults from './OptimizationResults';
import Switch from '@material-ui/core/Switch';
import {StrategyDB} from '../common/Constants';
import StrategyTable from './StrategyTable';
import { withSnackbar } from 'notistack';
import Remark from '../common/Remark';
import {
  Link,
} from "react-router-dom";

import {
  saveRemarks,
} from '../../redux/remarkActions';

import {
  setConfigs,
  resetConfigs,
} from '../../redux/configActions';

import StrategyPanel from './StrategyPanel';

import {
  apiGetConfig,
  apiPostConfig,
  apiGetRemarks,
} from '../../utils/ApiFetch';

const useStyles = theme => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  error: {
    margin: theme.spacing(1),
    color: 'red',
    paddingBottom: theme.spacing(2),
    display: 'inline',
  },
});

class Configs extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sym: props.sym,
    }
  }

  componentDidMount() {
    const {
      sym,
    } = this.state;
    const {
      match,
      location,
      strategy,
      dispatchSetConfigs,
    } = this.props;
    const st = {sym};
    if (match.params.id && match.params.id !== sym) {
      st.sym = match.params.id;
    }
    if (location && location.search) {
      const query = querystring.decode(location.search.substring(1))
      if (query.strategy && query.strategy !== strategy && StrategyDB[query.strategy]) {
        dispatchSetConfigs({strategy: query.strategy});
      }
    }
    this.setState(st, () => {
      this.fetchRemarks();
      this.onFetch();
    });
  }

  fetchRemarks = () => {
    const {enqueueSnackbar, dispatchSaveRemarks} = this.props;
    const {sym} = this.state;
    apiGetRemarks({sym}).then(resp => {
      if (resp.data.success) {
        dispatchSaveRemarks(sym, resp.data.payload);
      } else {
        enqueueSnackbar(`GetRemarks Error: ${resp.data.error}`, {variant: 'error'});
      }
    })
  }

  onFetch = () => {
    const {sym} = this.state;
    const {dispatchSetConfigs, dispatchResetConfigs, strategy} = this.props;
    apiGetConfig(sym).then(rest => {
      if (rest.data.success) {
        dispatchResetConfigs();
        this.setState({sym: rest.data.payload.sym});
        if (strategy.length === 0) {
          rest.data.payload.strategy = rest.data.payload.current_strategy;
        }
        dispatchSetConfigs(rest.data.payload);
      }
    })
  }

  handleChange = (field, e) => {
    this.setState({
      [field]: e.target.value,
    });
  }

  numberWithCommas = (x) => {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }


  onTogglePercent = () => {
    const {isPercent, dispatchSetConfigs} = this.props;
    dispatchSetConfigs({isPercent: !isPercent});
  }

  onChangeConfig = (payload) => {
    const {sym} = this.state;
    apiPostConfig(sym, payload).then(rest => {
      if (rest.data.success) {
        this.setState(rest.data.payload);
        const {dispatchSetConfigs} = this.props;
        dispatchSetConfigs(rest.data.payload);
      } else {
        const {enqueueSnackbar} = this.props;
        enqueueSnackbar(rest.data.error, {variant: 'error'});
      }
    })
  }

  changeStrategy = (newStra) => {
    const {dispatchSetConfigs, strategy} = this.props;
    if (strategy !== newStra) {
      dispatchSetConfigs({strategy: newStra});
    }
  }

  changeSortBy = (e, v) => {
    if (v) {
      const {dispatchSetConfigs} = this.props;
      dispatchSetConfigs({displayEnv: v});
    }
  }

  onChangeQuota = (field, e) => {
    const {dispatchSetConfigs, allConfigs, displayEnv} = this.props;
    const quotaKey = displayEnv === 'prod' ? 'quota' : 'quota_test';
    const conf = allConfigs[quotaKey];
    const newConf = {...conf};
    if (field === 'quota') {
      newConf.vi = e.target.value;
    } else if (field === 'priority') {
      newConf.vf = e.target.value;
    }
    dispatchSetConfigs({
      [quotaKey]: newConf,
    });
  }

  onCompleteQuota = () => {
    const {allConfigs, displayEnv} = this.props;
    const quotaKey = displayEnv === 'prod' ? 'quota' : 'quota_test';
    if (allConfigs[quotaKey]) {
      const payload = {
        configs: {
          [quotaKey]: allConfigs[quotaKey],
        }
      }
      this.onChangeConfig(payload);
    }
  }

  onChangeTrend = (e) => {
    const {dispatchSetConfigs, allConfigs, displayEnv} = this.props;
    const trendKey = displayEnv === 'prod' ? 'trend' : 'trend_test';
    const conf = allConfigs[trendKey];
    const newConf = {...conf};
    newConf.vf = e.target.value;
    dispatchSetConfigs({
      [trendKey]: newConf,
    });
  }

  onCompleteTrend = () => {
    const {allConfigs, displayEnv} = this.props;
    const trendKey = displayEnv === 'prod' ? 'trend' : 'trend_test';
    if (allConfigs[trendKey]) {
      const payload = {
        configs: {
          [trendKey]: allConfigs[trendKey],
        }
      }
      this.onChangeConfig(payload);
    }
  }

  render() {
    const {
      sym,
    } = this.state;
    const {
      last_c,
      last_v,
      isPercent,
      strategy,
      displayEnv,
      allConfigs,
    } = this.props;
    const quotaKey = displayEnv === 'prod' ? 'quota' : 'quota_test';
    const quota = allConfigs[quotaKey] ? allConfigs[quotaKey].vi : '';
    const priority = allConfigs[quotaKey] ? allConfigs[quotaKey].vf : '';
    const trendKey = displayEnv === 'prod' ? 'trend' : 'trend_test';
    const trend = allConfigs[trendKey] ? allConfigs[trendKey].vf : 0;
    return (
      <React.Fragment>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6} lg={4}>
            <Paper>
              <List subheader={<ListSubheader>OverView</ListSubheader>}>
                <ListItem>
                  <ListItemText>Symbol</ListItemText>
                  <ListItemSecondaryAction>
                    <Button color="primary" onClick={this.onFetch}>
                      Fetch
                    </Button>
                    <TextField
                      value={sym}
                      onChange={e => this.handleChange('sym', e)}
                      inputProps={{
                        style: { textAlign: "right" }
                      }}
                      style = {{width: 80}}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemText>{'Quota & Priority'}</ListItemText>
                  <ListItemSecondaryAction>
                    <TextField
                      value={quota}
                      onChange={e => this.onChangeQuota('quota', e)}
                      onBlur={this.onCompleteQuota}
                      inputProps={{
                        style: { textAlign: "right" }
                      }}
                      style = {{width: 80, marginRight: 12}}
                    />
                    <TextField
                      value={priority}
                      onChange={e => this.onChangeQuota('priority', e)}
                      onBlur={this.onCompleteQuota}
                      inputProps={{
                        style: { textAlign: "right" }
                      }}
                      style = {{width: 80}}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <Link to={`/trend?sym=${sym}&trade_env=${displayEnv}`}>
                    <ListItemText>
                      {`Trend Threshould % $${(last_c * trend / 100).toFixed(2)}`}
                    </ListItemText>
                  </Link>
                  <ListItemSecondaryAction>
                    <TextField
                      value={trend}
                      onChange={this.onChangeTrend}
                      onBlur={this.onCompleteTrend}
                      inputProps={{
                        style: { textAlign: "right" }
                      }}
                      style = {{width: 80}}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemText>Latest Price</ListItemText>
                  <ListItemSecondaryAction>{`$${last_c}`}</ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemText>Daily Vol</ListItemText>
                  <ListItemSecondaryAction>{`${this.numberWithCommas(last_v)}`}</ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemText>
                    Display Env
                  </ListItemText>
                  <ListItemSecondaryAction>
                    <ToggleButtonGroup
                      size="small"
                      value={displayEnv}
                      exclusive
                      onChange={this.changeSortBy}
                    >
                      <ToggleButton value="prod">
                        PROD
                      </ToggleButton>
                      <ToggleButton value="test">
                        TEST
                      </ToggleButton>
                    </ToggleButtonGroup>
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemText>Absolute / Percent</ListItemText>
                  <ListItemSecondaryAction>
                    <Switch
                      color="primary"
                      checked={isPercent}
                      onChange={this.onTogglePercent}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <Remark
                    sym={this.props.sym}
                    remarkKey={this.props.sym}
                  />
                </ListItem>
              </List>
            </Paper>
          </Grid>
          {
            strategy.length > 0 &&
            <StrategyTable
              changeStrategy={this.changeStrategy}
              onChangeConfig={this.onChangeConfig}
            />
          }
        </Grid>
        {
          strategy.length > 0 &&
          <StrategyPanel
            onChangeConfig={this.onChangeConfig}
          />
        }
        {
          strategy.length > 0 &&
          <OptimizationResults onFetchConfigs={this.onFetch}/>
        }
      </React.Fragment>
    );
  }
}

const mapStateToProps = state => ({
  last_c: state.configs.last_c,
  last_v: state.configs.last_v,
  isPercent: state.configs.isPercent,
  sym: state.configs.sym,
  strategy: state.configs.strategy,
  displayEnv: state.configs.displayEnv,
  allConfigs: state.configs,
})

export default compose(
  withStyles(useStyles),
  connect(mapStateToProps, {
    dispatchSetConfigs: setConfigs,
    dispatchResetConfigs: resetConfigs,
    dispatchSaveRemarks: saveRemarks,
  }),
  withSnackbar,
)(Configs);