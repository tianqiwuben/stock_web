import React from 'react';
import compose from 'recompose/compose';
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import moment from 'moment-timezone';
import uPlot from "uplot";

const styles = theme => ({
  container: {
    position: 'relative',
  },
  oneChart: {
    height: '33vh',
  },
});

const plotOptions = {
  width: 800,
  height: window.innerHeight * 0.33,
  legend: {
    show: false,
  },
  scales: {
    v: {
      range: (up, imin, imax, sk) => [imin, imax * 2],
    },
  },
  series: [
    {},
    {
      scale: 'v',
      paths: () => null,
      points: {
        show: false,
      },
      stroke: 'transaparent',
    },
    {
      stroke: '#00E5FF',
      width: 2,
      scale: '$',
      points: {
        show: false,
      },
    },
  ],
  axes: [
    {
      stroke: '#eee',
      grid: {
        stroke: '#aaa',
        dash: [1, 8],
      },
    },
    {
      scale: 'v',
      grid: {show: false},
      stroke: '#eee',
      ticks: {
        show: false,
      },
    },
    {
      scale: '$',
      side: 1,
      stroke: '#eee',
      grid: {
        stroke: '#aaa',
        dash: [1, 8],
      },
      size: 32,
      ticks: {
        show: false,
      },
    }
  ],
}
class TrendChart extends React.Component {
  constructor(props) {
    super(props);
    let now = Math.floor(new Date() / 1e3);
    this.bars = [
      [now, now + 60],
      [0,0],
      [0,0],
    ]
  }

  drawTrend = (trend) => {
    if (trend.bar_min && Object.keys(trend.bar_min).length > 1) {
      this.bars = trend.bar_min;
      this.trend = trend;
      if (this.u) {
        this.u.setData(this.bars);
      }
    }
  }

  drawV = (u) => {
    let [iMin, iMax] = u.series[0].idxs;
    let vol0AsY = u.valToPos(0, "v", true);
    for (let i = iMin; i <= iMax; i++) {
      let vol = u.data[1][i];
      let timeAsX = u.valToPos(this.bars[0][i], "x", true);
      let columnWidth = u.bbox.width / (iMax - iMin);
      let bodyX = i === iMin ? timeAsX : timeAsX - (columnWidth / 2);
      let volAsY = u.valToPos(vol, "v", true);
      u.ctx.fillStyle = "#eee"
      u.ctx.fillRect(
        Math.round(bodyX),
        Math.round(volAsY),
        Math.round(i === iMax ? columnWidth / 2 : columnWidth),
        Math.round(vol0AsY - volAsY),
      );
    }
  }
  
  drawOneLine = (u, data, color, lWidth) => {
    u.ctx.beginPath();
    let moved = false;
    for (let td of data.his) {
      if (td.ts_i >= this.bars[0][0]) {
        const x = u.valToPos(td.ts_i, 'x', true);
        const y = u.valToPos(td.c, '$', true);
        if (moved) {
          u.ctx.lineTo(x, y);
        } else {
          u.ctx.moveTo(x, y);
          moved = true;
        }
      }
    }
    let prev = data.prev_low;
    if (data.current_trend === "high") {
      prev = data.prev_high;
    }
    const x = u.valToPos(prev.ts_i, 'x', true);
    const y = u.valToPos(prev.c, '$', true);
    u.ctx.lineTo(x, y);
    u.ctx.strokeStyle = color;
    u.ctx.lineWidth = lWidth;
    u.ctx.stroke();
  }

  drawTrendLine = (u) => {
    if (this.trend) {
      if (this.trend.large && this.trend.large.his && this.trend.large.his.length > 0) {
        this.drawOneLine(u, this.trend.large, '#927fbf', 3)
      }
      if (this.trend.small && this.trend.small.his && this.trend.small.his.length > 0) {
        this.drawOneLine(u, this.trend.small, 'orange', 2)
      }
    }
  }

  componentDidMount() {
    const {setRef} = this.props;
    setRef && setRef(this);
    const {width} = this.container.getBoundingClientRect();
    const opt = {
      ...plotOptions,
      width: width - 32,
      plugins: [
        {
          hooks: {
            drawClear: this.drawV,
          },
        },
        {
          hooks: {
            draw: this.drawTrendLine,
          },
        },
      ],
    }
    this.u = new uPlot(opt, this.bars, this.chartEl);
  }

  componentWillUnmount() {
    if (this.u) {
      this.u.destroy();
      this.u = null;
    }
    const {setRef} = this.props;
    setRef && setRef(null);
  }

  render() {
    const {
      classes,
    } = this.props;
    return (
      <Grid item xs={12} md={12} lg={12}>
        <Paper className={classes.container} ref={el => this.container = el}>
          <div className={classes.oneChart} ref={el => this.chartEl = el} />
        </Paper>
      </Grid>
    );
  }
}


export default compose(
  withStyles(styles),
)(TrendChart);