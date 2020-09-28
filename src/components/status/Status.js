import React from 'react';
import compose from 'recompose/compose';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';

import {connect} from 'react-redux';
import SettingsIcon from '@material-ui/icons/Settings';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import Table from '@material-ui/core/Table';
import moment from 'moment';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import SymStatus from './SymStatus';
import TextField from '@material-ui/core/TextField';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Divider from '@material-ui/core/Divider';
import {registerComponent, getComponent} from '../common/Constants';
import HighlightOffIcon from '@material-ui/icons/HighlightOff';
import Tooltip from '@material-ui/core/Tooltip';
import RemoveCircleOutlineIcon from '@material-ui/icons/RemoveCircleOutline';
import {apiResolverStatus, apiResolverCommand} from '../../utils/ApiFetch';
import { withSnackbar } from 'notistack';
import LiveChart from '../common/LiveChart';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import {
  Link,
} from "react-router-dom";

const secName = [
  'Technology',
  'Consumer',
  'Industrials',
  'Financial',
  'Health',
  'Materials',
  'Communication',
  'Energy',
  'Utilities',
  'R_Estate',
  'Defensive',
]

const styles = theme => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 60,
  },
  row: {
    '& > *': {
      margin: theme.spacing(1),
    },
  },
  actionIcon: {
    marginRight: theme.spacing(1),
    cursor: 'pointer',
  },
});

class Status extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      env: 'prod',
      bp: 0,
      aq: 0,
      pm: [],
      pl: '',
      pl_pct: '',
      autoShow: true,
      sector: '0',
    }
    this.prices = {};
    this.chartSym = null;
  }

  componentDidMount() {
    registerComponent('status', this);
    this.onFetch();
    this.refreshInterval = setInterval(this.refreshPrices, 3000);
    const {width} = this.chartEl.getBoundingClientRect();
    this.liveChart.setWidth(width - 32)
  }

  componentWillMount() {
    registerComponent('status', null);
    clearInterval(this.refreshInterval);
  }

  onStatusPush = (data_env, payload) => {
    const {env, autoShow} = this.state;
    if (data_env === env) {
      this.setState(payload, this.subscribePrice);
      if (env !== 'test' && autoShow && payload.pm.length > 0) {
        const lastPos = payload.pm[payload.pm.length - 1];
        if (this.chartSym !== lastPos.sym) {
          this.onSelectPos(lastPos);
        }
      }
    }
  }

  onFetch = () => {
    const {enqueueSnackbar} = this.props;
    const {env} = this.state;
    apiResolverStatus({env}).then(resp => {
      if (resp.data.success) {
        if (resp.data.payload) {
          this.setState(resp.data.payload, this.subscribePrice);
        }
      } else {
        enqueueSnackbar(resp.data.error, {variant: 'error'})
      }
    })
  }

  refreshPrices = () => {
    if(Object.keys(this.prices).length > 0) {
      this.forceUpdate();
    }
  }

  subscribePrice = () => {
    const {pm} = this.state;
    const list = pm.map(pos => pos.sym);
    const ws = getComponent('websocket');
    if (ws) {
      ws.subscribePrices(list);
    }
  }

  onPricePush = (msg) => {
    this.prices[msg.sym] = msg.price;
  }

  changeEnv = (e, env) => {
    if (env) {
      this.setState({env}, this.onFetch);
    }
  }

  onSelectPos = (pos) => {
    if (this.symStatus) {
      this.symStatus.onSelectSym(pos.sym, pos.trade_price);
    }
    if (this.liveChart) {
      this.liveChart.onFetchChart(pos.sym, pos.action_ts)
      this.chartSym = pos.sym;
    }
  }


  onSelectSym = (sym) => {
    if (this.symStatus) {
      this.symStatus.onSelectSym(sym);
    }
    if (this.liveChart) {
      this.liveChart.onFetchChart(sym)
      this.chartSym = sym;
    }
  }

  liveChartSetSym = (sym) => {
    if (this.liveChart) {
      this.liveChart.onFetchChart(sym);
    }
  }

  setSymStatusRef = (ref) => {
    this.symStatus = ref;
  }

  setLiveChart = (ref) => {
    this.liveChart = ref;
    if (ref) {
      ref.onFetchChart('SPY');
    }
  }

  flattenExist = () => {
    const {pm} = this.state;
    pm.forEach(pos => {
      if (pos.strategy === 'prev_exist') {
        this.onFlatten(pos);
      }
    })
  }

  flattenAll = () => {
    const {pm} = this.state;
    pm.forEach(pos => {
      this.onFlatten(pos);
    })
  }

  onFlatten = (pos, isHalf = false) => {
    const {enqueueSnackbar} = this.props;
    const {env} = this.state;
    const payload = {
      env,
      command: {
        cmd: 'manual_action',
        action_type: 'flatten',
        sym: pos.sym,
        strategy: pos.strategy,
        sym_quota: isHalf ? Math.floor(pos.sym_quota / 2) : pos.sym_quota,
      }
    }
    apiResolverCommand(payload).then(resp => {
      if (!resp.data.success) {
        enqueueSnackbar(resp.data.error, {variant: 'error'})
      }
    })
  }

  handleChange = (field, e) => {
    this.setState({
      [field]: e.target.value,
    });
  }

  changeAutoShow = () => {
    const {autoShow} = this.state;
    this.setState({autoShow: !autoShow});
  }

  render() {
    const {classes} = this.props;
    const {
      env,
      bp,
      aq,
      pm,
      pl,
      pl_pct,
      autoShow,
      sector,
    } = this.state;
    let secB = 'SHOW ';
    if (parseInt(sector) <= 10) {
      secB += secName[parseInt(sector)];
    } else {
      secB += 'SEC';
    }
    return (
      <Grid container spacing={2}>
        <Grid container spacing={2} item xs={10}>
          <Grid item xs={12} md={12} lg={12} ref={el => this.chartEl = el}>
            <LiveChart setRef={this.setLiveChart} env={env}/>
          </Grid>
          <Grid item xs={12} md={12} lg={12}>
            <TableContainer component={Paper}>
              <Table className={classes.table} size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Sym</TableCell>
                    <TableCell>Strategy</TableCell>
                    <TableCell>Acc / Sym / Shares</TableCell>
                    <TableCell>Entry Ts</TableCell>
                    <TableCell>Cost / Now</TableCell>
                    <TableCell>PL</TableCell>
                    <TableCell width="15%">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {
                    pm.map(pos => {
                      const mm = moment.utc(Date.now() - pos.action_ts * 1000).format('mm:ss');
                      const priceDiff = this.prices[pos.sym] && (this.prices[pos.sym] - pos.trade_price) * (pos.action_str === 'buy_short' ? -1 : 1);
                      return(
                        <TableRow key={`${pos.sym}${pos.strategy}`} onClick={() => this.onSelectPos(pos)}>
                          <TableCell>{pos.sym}</TableCell>
                          <TableCell>{pos.strategy}</TableCell>
                          <TableCell>{`${pos.acc_quota} / ${pos.sym_quota} / ${pos.shares} (${pos.action_str === 'buy_short' ? '-' : '+'})`}</TableCell>
                          <TableCell>{`${pos.action_ts_str} (${mm})`}</TableCell>
                          <TableCell>
                            {`${pos.trade_price} / ${this.prices[pos.sym] || ''}`}
                          </TableCell>
                          <TableCell>
                            {
                              this.prices[pos.sym] &&
                              `${(priceDiff / pos.trade_price * 100).toFixed(3)}% $${(priceDiff * pos.shares).toFixed(2)}`
                            }
                          </TableCell>
                          <TableCell>
                            <Link className={classes.actionIcon} to={`/configs/${pos.sym}`} target="_blank">
                              <SettingsIcon />
                            </Link>
                            <Tooltip title="Flatten">
                              <span className={classes.actionIcon} onClick={(e) => {
                                this.onFlatten(pos);
                                e.stopPropagation();
                              }}>
                                <HighlightOffIcon />
                              </span>
                            </Tooltip>
                            <Tooltip title="Flatten Half">
                              <span className={classes.actionIcon} onClick={(e) => {
                                this.onFlatten(pos, true)
                                e.stopPropagation();
                              }}>
                                <RemoveCircleOutlineIcon />
                              </span>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  }
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
          <SymStatus env={env} setRef={this.setSymStatusRef} liveChartSetSym={this.liveChartSetSym}/>
        </Grid>
        <Grid item xs={2}>
          <List component={Paper}>
            <ListItem>
              <ListItemText>
                <ToggleButtonGroup
                  size="small"
                  value={env}
                  exclusive
                  onChange={this.changeEnv}
                >
                  <ToggleButton value="prod">
                    PROD
                  </ToggleButton>
                  <ToggleButton value="paper">
                    PAPER
                  </ToggleButton>
                  <ToggleButton value="test">
                    TEST
                  </ToggleButton>
                </ToggleButtonGroup>
              </ListItemText>
            </ListItem>
            <ListItem>
              <ListItemText>
                {`$${pl} (${pl_pct}%)`}
              </ListItemText>
              <ListItemSecondaryAction>Profit</ListItemSecondaryAction>
            </ListItem>
            <ListItem>
              <ListItemText>
                {`$${bp.toFixed(2)}`}
              </ListItemText>
              <ListItemSecondaryAction>buying_power</ListItemSecondaryAction>
            </ListItem>
            <ListItem>
              <ListItemText>
                {aq}
              </ListItemText>
              <ListItemSecondaryAction>available_quota</ListItemSecondaryAction>
            </ListItem>
            <ListItem>
              <ListItemText>
                <FormGroup row>
                  <FormControlLabel
                    control={<Switch checked={autoShow} color="primary" onChange={this.changeAutoShow}/>}
                    labelPlacement="start"
                    label="AutoShowChart"
                  />
                </FormGroup>
              </ListItemText>
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemText>
                <Button onClick={() => this.onSelectSym('SPY')}>SHOW SPY</Button>
                <Button onClick={() => this.onSelectSym('QQQ')}>SHOW QQQ</Button>
              </ListItemText>
            </ListItem>
            <ListItem>
              <ListItemText>
                <Button onClick={() => this.onSelectSym(`SEC_${sector}`)}>{secB}</Button>
              </ListItemText>
              <ListItemSecondaryAction>
                <TextField
                  value={sector}
                  onChange={e => this.handleChange('sector', e)}
                  inputProps={{
                    style: { textAlign: "right" }
                  }}
                  style = {{width: 80}}
                  onKeyPress={(ev) => {
                    if (ev.key === 'Enter') {
                      this.onSelectSym(`SEC_${sector}`)
                      ev.preventDefault();
                    }
                  }}
                />
              </ListItemSecondaryAction>
            </ListItem>
            {
              (env === 'prod' || env === 'paper') &&
              <ListItem>
                <ListItemText>
                  <Button onClick={this.flattenAll}>FLAT ALL</Button>
                  <Button onClick={this.flattenExist}>FLAT PREVS</Button>
                </ListItemText>
              </ListItem>
            }
            <Divider />
          </List>
        </Grid>
      </Grid>
    );
  }
}

const mapStateToProps = state => ({
  process: state.process,
  processPage: state.processPage,
})


export default compose(
  withStyles(styles),
  connect(mapStateToProps, {
  }),
  withSnackbar
)(Status);