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
import SymProp from './SymProp';

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
  apiResolverCommand,
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
        if(this.symProp) {
          this.symProp.updateRecord(rest.data.payload.sym_prop);
        }
      }
    })
  }

  handleChange = (field, e) => {
    this.setState({
      [field]: e.target.value,
    });
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

  switchEnable = (disabled) => {
    const {
      sym,
    } = this.state;
    const {enqueueSnackbar, displayEnv} = this.props;
    const payload = {
      env: displayEnv,
      command: {
        cmd: 'config_sym',
        sym: sym,
        config: {
          disabled: disabled,
        }
      },
    }
    apiResolverCommand(payload).then(resp => {
      if (resp.data.success) {
        enqueueSnackbar(`${sym} Disabled ${disabled} (${displayEnv})`);
      } else {
        enqueueSnackbar(resp.data.error, {variant: 'error'})
      }
    })
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
      last_v_per_second,
      allConfigs,
      daily_price_vol,
    } = this.props;
    return (
      <React.Fragment>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6} lg={3}>
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
                      onKeyPress={(ev) => {
                        if (ev.key === 'Enter') {
                          this.onFetch();
                          ev.preventDefault();
                        }
                      }}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemText primary="last_c x last_v" />
                  <ListItemSecondaryAction>
                    ${last_c} x {last_v}
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemText primary="daily_price_vol" />
                  <ListItemSecondaryAction>
                    ${daily_price_vol}
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemText primary="last_v_per_second" />
                  <ListItemSecondaryAction>
                    {last_v_per_second}
                  </ListItemSecondaryAction>
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
                <ListItem>
                  <ListItemText>
                    <Button onClick={() => this.switchEnable(false)}>
                      ENABLE
                    </Button>
                    <Button color="secondary" onClick={() => this.switchEnable(true)}>
                      DISABLE TRADING
                    </Button>
                  </ListItemText>
                </ListItem>
              </List>
            </Paper>
          </Grid>
          <SymProp
            setRef={el => this.symProp = el}
            record={allConfigs.sym_prop}
            last_c={last_c}
          />
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
  last_v_per_second: state.configs.last_v_per_second,
  daily_price_vol: state.configs.daily_price_vol,
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