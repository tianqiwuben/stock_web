import React from 'react';
import compose from 'recompose/compose';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import ShowChartIcon from '@material-ui/icons/ShowChart';
import IconButton from '@material-ui/core/IconButton';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import {apiGetTransactions} from '../../utils/ApiFetch';
import { withSnackbar } from 'notistack';
import querystring from 'querystring';
import FormControl from '@material-ui/core/FormControl';
import {connect} from 'react-redux';
import LiveChart from '../common/LiveChart';

import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import {StrategyDB, getStrategyColor} from '../common/Constants';

import {
  Link,
} from "react-router-dom";

const styles = theme => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  row: {
    '& > *': {
      margin: theme.spacing(1),
    },
  },
});


class Transactions extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sym: '',
      strategy: 'all',
      trade_env: 'test',
      startTime: '',
      summary: [],
      records: [],
    }
  }

  componentDidMount() {
    const {location} = this.props;
    if (location && location.search) {
      const query = querystring.decode(location.search.substring(1));
      if (query.sym) {
        this.setState(query, this.onFetch)
      }
    }
  }

  onFetch = () => {
    const {sym, strategy, trade_env, startTime} = this.state;
    const query = {
      sym,
      strategy,
      trade_env,
      startTime,
    }
    apiGetTransactions(query).then(resp => {
      if (resp.data.success) {
        this.setState({
          summary: resp.data.payload.summary,
          records: resp.data.payload.records,
        })
      } else {
        const {enqueueSnackbar} = this.props;
        enqueueSnackbar(resp.data.error, {variant: 'error'})
      }
    })
  }

  handleChange = (field, e) => {
    this.setState({
      [field]: e.target.value,
    });
  }

  onShowChart = (row) => {
    if (this.liveChart) {
      this.liveChart.onFetchChart(row.sym, row.action_ts_i);
    }
  }

  render() {
    const {classes} = this.props;
    const {
      summary,
      records,
      trade_env,
      sym,
      strategy,
      startTime,
    } = this.state;
    return (
      <div>
        <Paper>
            <LiveChart setRef={el => this.liveChart = el} env={trade_env}/>
        </Paper>
        <Grid container spacing={3} style={{overflow: 'auto', maxHeight: '47vh', marginTop: 12}}>
          <Grid item xs={12} md={12} lg={12}>
            <Paper className={classes.row}>
                <FormControl className={classes.formControl}>
                  <TextField
                    label="Symbol"
                    value={sym}
                    onChange={e => this.handleChange('sym', e)}
                    onKeyPress={(ev) => {
                      if (ev.key === 'Enter') {
                        this.onFetch();
                        ev.preventDefault();
                      }
                    }}
                  />
                </FormControl>
                <FormControl className={classes.formControl}>
                  <InputLabel>Strategy</InputLabel>
                  <Select
                    value={strategy}
                    onChange={e => this.handleChange('strategy', e)}
                    autoWidth
                  >
                    <MenuItem value="all">All</MenuItem>
                    {
                      Object.keys(StrategyDB).map(key => (
                        <MenuItem key={key} value={key}>{key}</MenuItem>
                      ))
                    }
                  </Select>
                </FormControl>
                <FormControl className={classes.formControl}>
                  <InputLabel>Trade Env</InputLabel>
                  <Select
                    value={trade_env}
                    onChange={e => this.handleChange('trade_env', e)}
                    autoWidth
                  >
                    <MenuItem value="test">Test</MenuItem>
                    <MenuItem value="paper">Paper</MenuItem>
                    <MenuItem value="prod">Prod</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  label="Start Time"
                  type="datetime-local"
                  value={startTime}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  onChange={e => this.handleChange('startTime', e)}
                />
                <Button variant="contained" color="primary" onClick={this.onFetch}>
                  Fetch
                </Button>
            </Paper>
          </Grid>
          <Grid item xs={12} md={12} lg={12}>
            <TableContainer component={Paper}>
              <Table className={classes.table}>
                <TableHead>
                  <TableRow>
                    <TableCell>Strategy</TableCell>
                    <TableCell>P/L %</TableCell>
                    <TableCell>Hold Min</TableCell>
                    <TableCell>Trans Count</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {summary.map((row) => (
                    <TableRow key={row.strategy}>
                      <TableCell>
                        <Link to={`/configs/${sym}?strategy=${row.strategy === 'all' ? '' : row.strategy}`}>
                          {row.strategy}
                        </Link>
                      </TableCell>
                      <TableCell>
                        {`${row.pl.toFixed(3)} (${(row.pl / row.count).toFixed(3)})`}
                      </TableCell>
                      <TableCell>
                        {`${(row.hold_seconds / 60).toFixed(1)} (${(row.hold_seconds / row.count / 60).toFixed(1)})`}
                      </TableCell>
                      <TableCell>{row.count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>

          <Grid item xs={12} md={12} lg={12}>
            <TableContainer component={Paper}>
              <Table className={classes.table} size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Sym</TableCell>
                    <TableCell>Strategy</TableCell>
                    <TableCell>Action</TableCell>
                    <TableCell>Price</TableCell>
                    <TableCell>Quota</TableCell>
                    <TableCell>Action Time</TableCell>
                    <TableCell>P/L (Agg)%</TableCell>
                    <TableCell>Hold Min</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {records.map((row) => (
                    <TableRow key={row.id} selected={row.overwrite}>
                      <TableCell>
                        <Link to={`/configs/${row.sym}`} target="_blank">
                          {row.sym}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <span style={{color: getStrategyColor(row.strategy)}}>
                          {row.strategy}
                        </span>
                      </TableCell>
                      <TableCell>{row.action_name}</TableCell>
                      <TableCell>{row.price}</TableCell>
                      <TableCell>{`${row.acc_quota} / ${row.sym_quota} / ${row.shares}`}</TableCell>
                      <TableCell>{row.action_time}</TableCell>
                      <TableCell>
                        {
                          (typeof row.profit_percent == 'number' && row.profit_percent !== 0) &&
                          <span>
                            <span style={{color: row.profit_percent > 0 ? 'green' : (row.profit_percent < 0 ? 'red' : 'inherit')}}>
                              {`${row.profit_percent.toFixed(3)}`}
                            </span>
                            <br />
                            {`(${row.agg_pl.toFixed(3)}, ${row.agg_all.toFixed(3)})`}
                          </span>
                        }
                      </TableCell>
                      <TableCell>
                        {row.hold_seconds > 0 ? (row.hold_seconds / 60).toFixed(1) : null}
                      </TableCell>
                      <TableCell>
                      <IconButton color="primary" onClick={() => this.onShowChart(row)}>
                        <ShowChartIcon />
                      </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>
      </div>
    );
  }
}


export default compose(
  withStyles(styles),
  connect(null),
  withSnackbar,
)(Transactions);