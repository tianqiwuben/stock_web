import React from 'react';
import compose from 'recompose/compose';
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import {getComponent, registerComponent} from '../common/Constants';
import Typography from '@material-ui/core/Typography';
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
});

class LiveChart extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      bars: [],
      sym: 'SPY',
      latestC: 0,
      timeDelay: 0,
    }
  }

  componentDidMount() {
    const {setRef} = this.props;
    setRef(this);
    registerComponent('liveChart', this);
  }

  componentWillUnmount() {
    const {setRef} = this.props;
    setRef(null);
    registerComponent('liveChart', null);
  }

  onFetchChart = (newSym = null, ts_lte = null) => {
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
    apiLiveBars(query).then(resp => {
      if (resp && resp.data.success && resp.data.payload && resp.data.payload.length > 0) {
        this.setState({
          bars: resp.data.payload,
          sym: s,
          loading: false,
        });
        const ws = getComponent('websocket');
        if (ws) {
          ws.subscribeStock(s);
        }
      } else {
        enqueueSnackbar("No bars loaded", {variant: 'error'});
        this.setState({loading: false});
      }
    })
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
    } = this.state;
    return (
      <Grid item xs={12} md={12} lg={12}>
        <Paper>
          <Typography variant="h6">{`${sym} $${latestC} delay ${timeDelay}ms`}</Typography>
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
        </Grid>
    );
  }
}


export default compose(
  withStyles(styles),
  withSnackbar,
)(LiveChart);