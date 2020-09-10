import React from 'react';
import compose from 'recompose/compose';
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import {getComponent} from '../common/Constants';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import moment from 'moment';
import {apiLiveBars} from '../../utils/ApiFetch';
import { withSnackbar } from 'notistack';

import {
  Bar,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

const styles = theme => ({
  oneChart: {
    height: '35vh',
  },
  title: {
    padding: '4px 16px 0 16px',
  }
});

class LiveChart extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      bars: [],
      sym: 'SPY',
      latestC: 0,
      startTime: '',
      timeDelay: 0,
    }
  }

  componentDidMount() {
    const {setRef} = this.props;
    setRef(this);
    const ws = getComponent('websocket');
    this.chartID = ws.registerChart(this);
  }

  componentWillUnmount() {
    const {setRef} = this.props;
    setRef(null);
    const ws = getComponent('websocket');
    ws.removeChart(this.chartID);
  }

  onFetchChart = (newSym = null, ts_lte = null, ts_start = null) => {
    const {
      sym,
    } = this.state;
    const {enqueueSnackbar} = this.props;
    this.setState({
      loading: true,
    })
    const s = newSym || sym;
    const query = {
      sym: s,
    }
    if (ts_lte) {
      query['ts_lte'] = ts_lte;
    }
    if (ts_start) {
      query['ts_start'] = ts_start;
    }
    apiLiveBars(query).then(resp => {
      if (resp && resp.data.success && resp.data.payload && resp.data.payload.length > 0) {
        this.setState({
          bars: resp.data.payload,
          sym: s,
          loading: false,
        });
        const ws = getComponent('websocket');
        if (ws) {
          ws.subscribeStock(this.chartID, s);
        }
      } else {
        enqueueSnackbar("No bars loaded", {variant: 'error'});
        this.setState({loading: false});
      }
    })
  }

  onPrev15 = () => {
    const {bars} = this.state;
    const ts = bars[0].ts_i;
    this.onFetchChart(null, null, ts - 15 * 60);
  }

  onNext15 = () => {
    const {bars} = this.state;
    const ts = bars[0].ts_i;
    this.onFetchChart(null, null, ts + 15 * 60);
  }

  handleChange = (field, e) => {
    this.setState({[field]: e.target.value});
  }

  onTimeChange = () => {
    const {startTime} = this.state;
    const t = moment(startTime).unix();
    this.onFetchChart(null, null, t);
  }

  onFeedBar = (bar) => {
    const {sym, bars} = this.state;
    if (bar.sym === sym) {
      const ts = moment(bar.ts * 1000).format('HH:mm:ss')
      const newBar = {
        c: bar.c,
        v: bar.v,
        ts,
      }
      const newBars = [...bars];
      newBars.shift();
      newBars.push(newBar);
      const timeDelay = Date.now() - bar.ts * 1000 - 1000;
      this.setState({
        bars: newBars,
        timeDelay,
        latestC: bar.c,
      })
    }
  }

  render() {
    const {
      classes,
    } = this.props;
    const {
      bars,
      sym,
      latestC,
      timeDelay,
      startTime
    } = this.state;
    return (
      <Paper>
        <Box className={classes.title} display="flex" flexDirection="row" alignItems="flex-start" justifyContent="space-between">
          <Typography variant="h6" style={{flexGrow: 1}}>{`${sym} $${latestC} delay ${timeDelay}ms`}</Typography>
          <TextField
            type="datetime-local"
            value={startTime}
            InputLabelProps={{
              shrink: true,
            }}
            onChange={e => this.handleChange('startTime', e)}
            onBlur={e => this.onTimeChange()}
          />
          <Button onClick={this.onPrev15}>{'<<'}</Button>
          <Button onClick={() => this.onFetchChart()}>{'NOW'}</Button>
          <Button onClick={this.onNext15}>{'>>'}</Button>
        </Box>
        <div className={classes.oneChart}>
          <ResponsiveContainer>
            <ComposedChart
              data={bars}
              margin={{
                top: 16,
                right: 16,
                bottom: 0,
                left: 24,
              }}
            >
              <CartesianGrid strokeDasharray="1 8"/>
              <XAxis dataKey="ts"/>
              <YAxis yAxisId="l" domain={['auto', 'auto']}/>
              <YAxis
                yAxisId="r"
                orientation="right"
                domain={['auto', 'auto']}
              />
              <Tooltip isAnimationActive={false} contentStyle={{background: '#222222'}} itemStyle={{color: 'orange'}}/>
              <Bar yAxisId="l" dataKey="v" isAnimationActive={false} stroke="lightgrey"/>
              <Line yAxisId="r" isAnimationActive={false} strokeWidth={2} type="linear" dataKey="c" dot={false} />
              <Line yAxisId="r" isAnimationActive={false} type="linear" stroke="none" dataKey="highlight_ts" dot={{ stroke: 'red', strokeWidth: 2 }}/>
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </Paper>
    );
  }
}


export default compose(
  withStyles(styles),
  withSnackbar,
)(LiveChart);