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

import {
  Brush,
  Bar,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  LineChart,
} from 'recharts';
import Paper from '@material-ui/core/Paper';
import Title from '../dashboard/Title';
import {apiGetTriggers} from '../../utils/ApiFetch';
import { Typography } from '@material-ui/core';


const styles = theme => ({
  chartFixedHeight: {
    height: '90vh',
    padding: theme.spacing(2),
  },
  oneChart: {
    height: '35vh',
    marginTop: theme.spacing(2),
  },
  row: {
    '& > *': {
      margin: theme.spacing(1),
    },
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  updatedAt: {
    display: 'inline',
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

const initState = {
  ma_v_data: [],
  c_diff_data: [],
  sym: 'SPY',
  ma_v_t: 5,
  c_diff_t: 5,
  updated_at: '',
  generate: false,
  c_dis_count: 0,
  v_dis_count: 0,
  start_time: '',
  end_time: '',
}


let stateStore = initState;

class Triggers extends React.Component {
  constructor(props) {
    super(props);
    let st = {
      ...stateStore,
    }
    if (props.location && props.location.search) {
      const query = querystring.decode(props.location.search.substring(1))
      if (query.sym) {
        st = {...initState, ...query};
      }
    }
    this.state = st;
  }

  componentDidMount() {
    this.onFetch();
  }

  componentWillUnmount() {
    for(let k in initState) {
      stateStore[k] = this.state[k];
    }
  }

  updateQueryParam = () => {
    const {
      sym,
      c_diff_t,
      ma_v_t,
    } = this.state;
    const query = querystring.encode({
      sym,
      c_diff_t,
      ma_v_t,
    });
    const {history, location} = this.props;
    history.push({
      pathname: location.pathname,
      search: '?' + query,
    });
  }

  handleChange = (field, e) => {
    this.setState({
      [field]: e.target.value,
    });
  }

  onFetch = () => {
    const {
      sym,
      c_diff_t,
      ma_v_t,
      generate,
    } = this.state;
    const query = {
      c_diff_t,
      ma_v_t,
      generate: generate ? 1 : 0,
    };
    this.updateQueryParam();
    apiGetTriggers(sym, query).then(resp => {
      if (resp && resp.data.success) {
        this.setState({
          c_diff_data: resp.data.payload.c_diff_data,
          ma_v_data: resp.data.payload.ma_v_data,
          updated_at: resp.data.payload.updated_at,
          c_dis_count: resp.data.payload.c_dis_count,
          v_dis_count: resp.data.payload.v_dis_count,
          start_time: resp.data.payload.start_time,
          end_time: resp.data.payload.end_time,
        });
      }
    })
  }


  onChangeGenerate = () => {
    this.setState({
      generate: !this.state.generate,
    })
  }

  render() {
    const {
      c_diff_data,
      ma_v_data,
      sym,
      ma_v_t,
      c_diff_t,
      generate,
      updated_at,
      c_dis_count,
      v_dis_count,
      start_time,
      end_time,
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
              label="MA V Seconds"
              value={ma_v_t}
              onChange={e => this.handleChange('ma_v_t', e)}
            />
          </FormControl>
          <FormControl className={classes.formControl}>
            <TextField
              label="C diff Seconds"
              value={c_diff_t}
              onChange={e => this.handleChange('c_diff_t', e)}
            />
          </FormControl>
          <FormControl className={classes.formControl}>
            <FormControlLabel
              control={
                <Checkbox checked={generate} onChange={this.onChangeGenerate} />
              }
              label="Generate"
            />
          </FormControl>
          <Button variant="contained" color="primary" onClick={this.onFetch}>
            Fetch
          </Button>
          <Typography variant="subtitle1" className={classes.updatedAt}>{`Updated at: ${updated_at}`}</Typography>
        </div>
        <div className={classes.oneChart}>
          <Typography variant="subtitle1" align="center">{`MA Vol Distribution (${v_dis_count} ${start_time} - ${end_time})`}</Typography>
          <ResponsiveContainer>
            <ComposedChart
              data={ma_v_data}
            >
              <XAxis dataKey="p" />
              <YAxis yAxisId="l" domain={['dataMin', 'dataMax']} scale="log" />
              <Tooltip />
              <Line yAxisId="l" isAnimationActive={false} type="linear" stroke="blue" dataKey="d" dot={false} />
              {ma_v_data.length > 0 && <Brush dataKey="p" startIndex={0}/>}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <div className={classes.oneChart}>
          <Typography variant="subtitle1" align="center">{`Price Diff Distribution ${c_dis_count}`}</Typography>
          <ResponsiveContainer>
            <ComposedChart
              data={c_diff_data}
            >
              <XAxis dataKey="p" />
              <YAxis yAxisId="l" domain={['dataMin', 'dataMax']} />
              <Tooltip />
              <Line yAxisId="l" isAnimationActive={false} type="linear" stroke="blue" dataKey="d" dot={false} />
              {c_diff_data.length > 0 && <Brush dataKey="p" startIndex={0}/>}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </Paper>
    );
  }
}


export default compose(
  withStyles(styles),
)(Triggers);