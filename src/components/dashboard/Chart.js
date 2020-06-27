import React from 'react';
import compose from 'recompose/compose';
import { withStyles } from '@material-ui/core/styles';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import querystring from 'querystring';

import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import StrategyDB from '../common/StrategyDB';

import {
  Brush,
  Bar,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import Paper from '@material-ui/core/Paper';
import {apiBars} from '../../utils/ApiFetch';

const LABEL = {
  buy_long: 'BL',
  buy_short: 'BS',
  sell_long: 'SL',
  sell_short: 'SS',
}

const styles = theme => ({
  chartFixedHeight: {
    height: '90vh',
  },
  oneChart: {
    height: '40vh',
  },
  halfChart: {
    height: '20vh',
  },
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

const dotStyles = {
  actionDot: {
    stroke: 'green',
    strokeWidth: 2,
  },
  minDot: {
    stroke: 'red',
  },
  strategy: {
    stroke: 'blue',
  },
}

const CustomizedDot = (props) => {
  const {
    payload,
    cx,
    cy,
  } = props;
  const st = LABEL[payload.action];
  if (!st) {
    return null;
  }
  return (
    <text key={payload.ts} x={cx} y={cy} dy={-6} fontSize={10} textAnchor="middle">{st}</text>
  );
};

class Chart extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      trans: [],
      sym: 'SPY',
      startDate: '',
      frame: 'second',
      strategy: 'two_stage_trailing',
      isTest: false,
      nextTrans: null,
      agg_seconds: 5,
    };
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
        this.setState(query, () => this.onFetch())
      }
    }
  }

  handleChange = (field, e) => {
    this.setState({
      [field]: e.target.value,
    });
  }

  onFetch = (findNextTrans = 0) => {
    const {
      sym,
      frame,
      startDate,
      nextTrans,
      isTest,
      strategy,
      agg_seconds,
    } = this.state;
    const query = {
      sym,
      frame,
      strategy,
      start_time: startDate,
      next_trans: nextTrans,
      find_next_trans: findNextTrans,
      agg_seconds,
      is_test: isTest ? 1 : 0,
    };
    apiBars(query).then(resp => {
      if (resp && resp.data.success && resp.data.payload.bars && resp.data.payload.bars.length > 0) {
        this.setState({
          data: resp.data.payload.bars,
          trans: resp.data.payload.trans,
          startDate: resp.data.payload.start_ts,
          nextTrans: resp.data.payload.next_trans_id,
        });
      }
    })
  }

  onNextTrans = () => {
    this.onFetch(1);
  }

  onChangeTest = () => {
    this.setState({
      isTest: !this.state.isTest,
    })
  }

  render() {
    const {
      data,
      sym,
      startDate,
      frame,
      isTest,
      strategy,
      agg_seconds,
    } = this.state;
    const {classes} = this.props;
    return (
      <Paper className={classes.chartFixedHeight}>
        <div className={classes.row}>
          <FormControl className={classes.formControl}>
            <TextField
              label="Symbol"
              value={sym}
              onChange={e => this.handleChange('sym', e)}
            />
          </FormControl>
          <FormControl className={classes.formControl}>
            <TextField
              label="Aggs Seconds"
              value={agg_seconds}
              onChange={e => this.handleChange('agg_seconds', e)}
            />
          </FormControl>
          <FormControl className={classes.formControl}>
            <InputLabel>Frame</InputLabel>
            <Select
              value={frame}
              onChange={e => this.handleChange('frame', e)}
            >
              <MenuItem value={'second'}>Second</MenuItem>
              <MenuItem value={'minute'}>Minute</MenuItem>
              <MenuItem value={'day'}>Day</MenuItem>
            </Select>
          </FormControl>
          <FormControl className={classes.formControl}>
            <TextField
              label="Start Time"
              type="datetime-local"
              value={startDate}
              InputLabelProps={{
                shrink: true,
              }}
              onChange={e => this.handleChange('startDate', e)}
            />
          </FormControl>
          <FormControl className={classes.formControl}>
            <InputLabel>Strategy</InputLabel>
            <Select
              value={strategy}
              onChange={e => this.handleChange('strategy', e)}
              autoWidth
            >
              {
                Object.keys(StrategyDB).map(key => (
                  <MenuItem key={key} value={key}>{key}</MenuItem>
                ))
              }
            </Select>
          </FormControl>
        </div>
        <div className={classes.row}>
          <FormControl className={classes.formControl}>
            <FormControlLabel
              control={
                <Checkbox checked={isTest} onChange={this.onChangeTest} />
              }
              label="Testing"
            />
          </FormControl>
          <Button variant="contained" color="primary" onClick={() => this.onFetch()}>
            Fetch
          </Button>
          <Button variant="contained" color="default" onClick={this.onNextTrans}>
            Next Trans
          </Button>
        </div>
        <div className={classes.oneChart}>
          <ResponsiveContainer>
            <ComposedChart
              data={data}
              margin={{
                top: 16,
                right: 16,
                bottom: 0,
                left: 24,
              }}
              syncId="foo"
            >
              <XAxis dataKey="ts" />
              <YAxis yAxisId="l" domain={['dataMin', 'dataMax']} />
              <YAxis yAxisId="r" orientation="right" domain={['dataMin', 'dataMax']} />
              <Tooltip />
              <Line yAxisId="l" isAnimationActive={false} type="linear" stroke="blue" dataKey="c" dot={false} />
              <Line yAxisId="r" isAnimationActive={false} type="linear" stroke="orange" dataKey="c_diff" dot={false} />
              <Line yAxisId="l" isAnimationActive={false} type="linear" stroke="none"
                dataKey="action_price"
                dot={CustomizedDot}
              />
              {data.length > 0 && <Brush dataKey="ts" startIndex={0}/>}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <div className={classes.halfChart}>
          <ResponsiveContainer>
            <ComposedChart
              data={data}
              margin={{
                top: 16,
                right: 16,
                bottom: 0,
                left: 24,
              }}
              syncId="foo"
            >
              <XAxis dataKey="ts" />
              <YAxis yAxisId="l" domain={['dataMin', 'dataMax']} />
              <YAxis yAxisId="r" orientation="right" domain={['dataMin', 'dataMax']} />
              <Tooltip />
              <Bar yAxisId="l" dataKey="v" isAnimationActive={false} stroke="grey"/>
              <Line yAxisId="r" isAnimationActive={false} type="linear" stroke="purple" dataKey="ma_v" dot={false} />
              {/*<Line yAxisId="r" isAnimationActive={false} type="linear" stroke="blue" dataKey="v_agg" dot={false} />*/}
            </ComposedChart>
          </ResponsiveContainer>
          {
            /*
          <ResponsiveContainer>
            <ComposedChart
              data={data}
              margin={{
                top: 16,
                right: 16,
                bottom: 0,
                left: 24,
              }}
              syncId="foo"
            >
              <XAxis dataKey="ts" />
              <YAxis yAxisId="l" domain={['dataMin', 'dataMax']} />
              <Tooltip />
              <Line yAxisId="l" isAnimationActive={false} type="linear" stroke="red" dataKey="put_v" dot={false} />
              <Line yAxisId="l" isAnimationActive={false} type="linear" stroke="green" dataKey="call_v" dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
            */
            }
        </div>
      </Paper>
    );
  }
}


export default compose(
  withStyles(styles),
)(Chart);