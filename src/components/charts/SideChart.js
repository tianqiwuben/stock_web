import React from 'react';
import compose from 'recompose/compose';
import { withStyles } from '@material-ui/core/styles';
import {connect} from 'react-redux';
import {getStrategyColor} from '../common/StrategyDB';

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

const useStyles = theme => ({
  oneChart: {
    height: '30vh',
  },
});

const LABEL = {
  buy_long: 'BL',
  buy_short: 'BS',
  sell_long: 'SL',
  sell_short: 'SS',
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
  const color = getStrategyColor(payload.strategy);
  return (
    <text key={payload.ts} x={cx} y={cy} dy={-6}
      fontSize={payload.highlight ? 16 : 10}
      textAnchor="middle"
      stroke={color}
    >
      {st}
    </text>
  );
};

class SideChart extends React.Component {
  render() {
    const {
      classes,
      data,
    } = this.props;
    if (!(data && data.length > 0)) {
      return null;
    }
    return (
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
              <XAxis dataKey="ts"/>
              <YAxis yAxisId="l" domain={['dataMin', 'dataMax']} hide/>
              <YAxis yAxisId="r" orientation="right" domain={['dataMin', 'dataMax']} hide/>
              <Tooltip />
              <Bar yAxisId="l" dataKey="v" isAnimationActive={false} stroke="lightgrey"/>
              <Line yAxisId="r" isAnimationActive={false} type="linear" stroke="blue" dataKey="c" dot={false} />
              <Line yAxisId="r" isAnimationActive={false} type="linear" stroke="none"
                dataKey="action_price"
                dot={CustomizedDot}
              />
              <Line yAxisId="r" isAnimationActive={false} type="linear" stroke="none" dataKey="strategy" dot={false} />
              {data.length > 0 && <Brush dataKey="ts" startIndex={0}/>}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
    );
  }
}

const mapStateToProps = state => ({
  data: state.sideChart,
})

export default compose(
  withStyles(useStyles),
  connect(mapStateToProps),
)(SideChart);