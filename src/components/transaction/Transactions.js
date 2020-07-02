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
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import {apiGetTransactions, apiBars} from '../../utils/ApiFetch';
import { withSnackbar } from 'notistack';
import querystring from 'querystring';
import FormControl from '@material-ui/core/FormControl';
import Checkbox from '@material-ui/core/Checkbox';
import {connect} from 'react-redux';

import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import {StrategyDB, getStrategyColor} from '../common/Constants';
import {saveSideChart} from '../../redux/sideChartActions';


import {
  Link,
} from "react-router-dom";

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
});


class Transactions extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sym: '',
      strategy: 'all',
      isTest: true,
      summary: [],
      records: [],
    }
  }

  componentDidMount() {
    const {location} = this.props;
    if (location && location.search) {
      const query = querystring.decode(location.search.substring(1));
      if (query.sym) {
        if (query.isTest === '1') {
          query.isTest = true;
        } else if (query.isTest === '0') {
          query.isTest = false;
        }
        this.setState(query, this.onFetch)
      }
    }
  }

  onFetch = () => {
    const {sym, strategy, isTest} = this.state;
    const query = {
      sym,
      strategy,
      is_test: isTest ? 1 : 0,
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

  onChangeTest = () => {
    this.setState({isTest: !this.state.isTest});
  }

  onShowChart = (trans_id) => {
    const {strategy} = this.state;
    const query = {
      trans_id,
      strategy,
    };
    apiBars(query).then(resp => {
      if (resp && resp.data.success && resp.data.payload.bars && resp.data.payload.bars.length > 0) {
        const {dispatchSaveSideChart} = this.props;
        dispatchSaveSideChart(resp.data.payload.bars);
      }
    })
  }

  render() {
    const {classes} = this.props;
    const {
      summary,
      records,
      isTest,
      sym,
      strategy,
    } = this.state;
    return (
      <Grid container spacing={3}>
        <Grid item xs={12} md={12} lg={12}>
          <Paper className={classes.row}>
              <FormControl className={classes.formControl}>
                <TextField
                  label="Symbol"
                  value={sym}
                  onChange={e => this.handleChange('sym', e)}
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
                <FormControlLabel
                  control={
                    <Checkbox checked={isTest} onChange={this.onChangeTest} />
                  }
                  label="Testing"
                />
              </FormControl>
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
                      <span style={{color: getStrategyColor(row.strategy)}}>
                        {row.strategy}
                      </span>
                    </TableCell>
                    <TableCell>{row.action_name}</TableCell>
                    <TableCell>{row.price}</TableCell>
                    <TableCell>{row.count}</TableCell>
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
                    <IconButton color="primary" onClick={() => this.onShowChart(row.id)}>
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
    );
  }
}


export default compose(
  withStyles(styles),
  connect(null, {
    dispatchSaveSideChart: saveSideChart,
  }),
  withSnackbar,
)(Transactions);