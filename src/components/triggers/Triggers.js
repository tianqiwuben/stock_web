import React from 'react';
import compose from 'recompose/compose';
import { withStyles } from '@material-ui/core/styles';
import FormControl from '@material-ui/core/FormControl';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import querystring from 'querystring';
import CircularProgress from '@material-ui/core/CircularProgress';

import {
  Brush,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import Paper from '@material-ui/core/Paper';
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


class Triggers extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      ma_v_data: [],
      //c_diff_data: [],
      sym: 'SPY',
      aggs_seconds: 1,
      updated_at: '',
      generate: false,
      //c_dis_count: 0,
      v_dis_count: 0,
      start_time: '',
      end_time: '',
      loading: false,
      minute: false,
    };
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

  handleChange = (field, e) => {
    this.setState({
      [field]: e.target.value,
    });
  }

  onFetch = () => {
    const {
      sym,
      aggs_seconds,
      generate,
      minute,
    } = this.state;
    const query = {
      sym,
      aggs_seconds,
      generate: generate ? 1 : 0,
      minute: minute ? 1 : 0,
    };
    this.setState({
      loading: true,
    })
    apiGetTriggers(query).then(resp => {
      if (resp && resp.data.success) {
        this.setState({
          //c_diff_data: resp.data.payload.c_diff_data,
          ma_v_data: resp.data.payload.ma_v_data,
          updated_at: resp.data.payload.updated_at,
          //c_dis_count: resp.data.payload.c_dis_count,
          v_dis_count: resp.data.payload.v_dis_count,
          start_time: resp.data.payload.start_time,
          end_time: resp.data.payload.end_time,
          loading: false,
        });
      }
    })
  }


  onChangeGenerate = () => {
    this.setState({
      generate: !this.state.generate,
    })
  }


  onChangeMinute = () => {
    this.setState({
      minute: !this.state.minute,
    })
  }

  render() {
    const {
      //c_diff_data,
      ma_v_data,
      sym,
      aggs_seconds,
      generate,
      updated_at,
      //c_dis_count,
      v_dis_count,
      start_time,
      end_time,
      loading,
      minute,
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
              value={aggs_seconds}
              onChange={e => this.handleChange('aggs_seconds', e)}
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
          <FormControl className={classes.formControl}>
            <FormControlLabel
              control={
                <Checkbox checked={minute} onChange={this.onChangeMinute} />
              }
              label="Minute"
            />
          </FormControl>
          <Button variant="contained" color="primary" onClick={this.onFetch}>
            Fetch
          </Button>
          {
            loading && <CircularProgress size={20}/>
          }
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
              <Tooltip contentStyle={{background: '#222'}}/>
              <Line yAxisId="l" isAnimationActive={false} type="linear" stroke="#eee" dataKey="d" dot={false} />
              {ma_v_data.length > 0 && <Brush dataKey="p" startIndex={0}/>}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        {
          /*
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
          */
        }
      </Paper>
    );
  }
}


export default compose(
  withStyles(styles),
)(Triggers);