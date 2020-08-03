import React from 'react';
import {registerComponent} from '../common/Constants';

import {
  Bar,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

class LiveChart extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
    }
  }

  componentDidMount() {
    registerComponent('liveChart', this);
  }

  componentWillUnmount() {
    registerComponent('liveChart', null);
  }

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
            >
              <XAxis dataKey="ts"/>
              <YAxis yAxisId="l" domain={['dataMin', 'dataMax']} hide/>
              <YAxis yAxisId="r" orientation="right" domain={['dataMin', 'dataMax']} hide/>
              <Tooltip />
              <Bar yAxisId="r" dataKey="v" isAnimationActive={false} stroke="lightgrey"/>
              <Line yAxisId="l" isAnimationActive={false} type="linear" stroke="blue" dataKey="c" dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
    );
  }
}


export default LiveChart;