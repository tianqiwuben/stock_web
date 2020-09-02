import React from 'react';
import compose from 'recompose/compose';
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import moment from 'moment-timezone';

import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  CartesianGrid,
} from 'recharts';

const styles = theme => ({
  oneChart: {
    height: '30vh',
  },
});

class TrendChart extends React.Component {
  constructData = () => {
    const {data} = this.props;
    const list = [];
    const daySeperator = [];
    let pret = null;
    let anchor = 0;
    let smallIdx = 0;
    let largeIdx = 0;
    if (data && data.small && data.small.his && data.large && data.large.his) {
      const smallHis = [...data.small.his];
      const largeHis = [...data.large.his];
      if (data.small.current_trend === 'low') {
        smallHis.push(data.small.prev_low);
      } else {
        smallHis.push(data.small.prev_high);
      }
      if (data.large.current_trend === 'low') {
        largeHis.push(data.large.prev_low);
      } else {
        largeHis.push(data.large.prev_high);
      }
      while(true) {
        let smallB = null;
        let largeB = null;
        let b = null;
        let useB = 'n';
        if (smallIdx < smallHis.length) {
          smallB = smallHis[smallIdx];
        }
        if (largeIdx < largeHis.length) {
          largeB = largeHis[largeIdx];
        }
        if (largeB && smallB) {
          let l_ts = moment(largeB.ts).unix();
          let s_ts = moment(smallB.ts).unix();
          if (l_ts < s_ts) {
            b = largeB;
            useB = 'l';
          } else if (l_ts > s_ts) {
            b = smallB;
            useB = 's';
          } else {
            useB = 'b';
            b = smallB;
          }
        } else if (largeB) {
          b = largeB;
          useB = 'b';
        } else if (smallB) {
          useB = 's';
          b = smallB;
        }
        if (!b) {
          break;
        }
        const ts = moment(b.ts).tz("America/Los_Angeles");
        if (pret) {
          if (!ts.isSame(pret, 'date')) {
            const df = ts.diff(pret, 'days');
            anchor += (df - 1) * 86400 + (86400 - 390 * 60 - 7200);
            pret = ts;
            daySeperator.push(ts.unix() - anchor - 3600);
          }
        } else {
          pret = ts;
          anchor = ts.unix();
        }
        const item = {
          tsx: ts.unix() - anchor,
          ts: ts.format('L LT'),
        }
        switch(useB) {
          case 'l': {
            item.large = b.c;
            largeIdx += 1;
            break;
          }
          case 's': {
            item.small = b.c;
            smallIdx += 1;
            break;
          }
          case 'b': {
            item.large = b.c;
            item.small = b.c;
            largeIdx += 1;
            smallIdx += 1;
            break;
          }
          default:
        }
        list.push(item);
      }
    }
    return {list, daySeperator};
  }

  render() {
    const {
      classes,
      data,
      tradePrice,
    } = this.props;
    const {list, daySeperator} = this.constructData();
    const smallTrend = data && data.small && data.small.current_trend;
    const largeTrend = data && data.large && data.large.current_trend;
    return (
      <Grid item xs={12} md={12} lg={12}>
        <Paper>
          <Typography variant="subtitle1">{`small: ${smallTrend} large: ${largeTrend}`}</Typography>
          <div className={classes.oneChart}>
              <ResponsiveContainer>
                <ComposedChart
                  data={list}
                  margin={{
                    top: 16,
                    right: 16,
                    bottom: 0,
                    left: 24,
                  }}
                >
                  <XAxis dataKey="tsx" type="number" hide/>
                  <CartesianGrid strokeDasharray="1 8"/>
                  <YAxis yAxisId="r" domain={['auto', 'auto']} orientation="right" />
                  <YAxis yAxisId="l" hide />
                  <Tooltip cursor={false} isAnimationActive={false} contentStyle={{background: '#222222'}}/>
                  <Line yAxisId="l" isAnimationActive={false} type="linear" stroke="none" dataKey="ts" dot={false} />
                  <Line yAxisId="r" isAnimationActive={false} type="linear" dataKey="large" dot={false} connectNulls/>
                  <Line yAxisId="r" isAnimationActive={false} type="linear" dataKey="small" stroke="orange" dot={false} connectNulls/>
                  {
                    daySeperator.map(ds => (
                      <ReferenceLine yAxisId="r" x={ds} key={ds} />
                    ))
                  }
                  { tradePrice &&
                    <ReferenceLine yAxisId="r" y={tradePrice} />
                  }
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
)(TrendChart);