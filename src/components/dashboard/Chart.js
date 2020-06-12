import React from 'react';
import compose from 'recompose/compose';
import { withStyles } from '@material-ui/core/styles';
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
import Title from './Title';
import {apiBars} from '../../utils/ApiFetch';

const styles = theme => ({
  chartFixedHeight: {
    height: '80vh',
  },
  oneChart: {
    height: '40vh',
  }
});

const dotStyles = {
  maxDot: {
    stroke: 'green',
  },
  minDot: {
    stroke: 'red',
  },
  strategy: {
    stroke: 'blue',
  },
}

class Chart extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
    }
  }

  componentDidMount() {
    apiBars({sym: 'SPY', frame: 'min1'}).then(resp => {
      if (resp.data.payload.bars && resp.data.payload.bars.length > 0) {
        this.setState({data: resp.data.payload.bars});
      }
    })
  }

  render() {
    const {data} = this.state;
    const {classes} = this.props;
    return (
      <Paper className={classes.chartFixedHeight}>
        <div className={classes.oneChart}>
          <ResponsiveContainer>
            <LineChart
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
              <YAxis yAxisId="left" domain={['dataMin', 'dataMax']} />
              <Tooltip />
              <Line yAxisId="left" isAnimationActive={false} type="linear" stroke="blue" dataKey="c" dot={false} />
              <Line yAxisId="left" isAnimationActive={false} type="linear" stroke="red" dataKey="put_strike" dot={false} />
              <Line yAxisId="left" isAnimationActive={false} type="linear" stroke="green" dataKey="call_strike" dot={false} />
              {data.length > 0 && <Brush dataKey="ts" startIndex={0}/>}
            </LineChart>
          </ResponsiveContainer>
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
              <YAxis yAxisId="r" domain={['dataMin', 'dataMax']} orientation="right"/>
              <Tooltip />
              <Bar yAxisId="l" dataKey="v" isAnimationActive={false}/>
              <Bar yAxisId="r" isAnimationActive={false} type="linear" stroke="red" dataKey="put_v" dot={false} />
              <Bar yAxisId="r" isAnimationActive={false} type="linear" stroke="green" dataKey="call_v" dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </Paper>
    );
  }
}


export default compose(
  withStyles(styles),
)(Chart);