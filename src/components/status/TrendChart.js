import React from 'react';
import compose from 'recompose/compose';
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import moment from 'moment-timezone';
import Typography from '@material-ui/core/Typography';
import uPlot from "uplot";

const styles = theme => ({
  container: {
    position: 'relative',
  },
  oneChart: {
    height: '33vh',
  },
  toolTip: {
    position: 'absolute',
    visibility: 'hidden',
    left: -20,
    top: 24,
    width: 150,
    padding: theme.spacing(1),
    background: '#222',
    pointerEvents: 'none',
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
      range: (up, imin, imax, sk) => [0, imax * 2],
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


const drawV = (u) => {
  let [iMin, iMax] = u.series[0].idxs;
  let vol0AsY = u.valToPos(0, "v", true);
  for (let i = iMin; i <= iMax; i++) {
    let vol = u.data[1][i];
    let timeAsX = u.valToPos(u.data[0][i], "x", true);
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

  onCursorMove = (u, l, t) => {
    if (this.toolTip) {
      this.toolTip.style.transform = `translate(${l}px, ${t}px)`;
    }
    if (l > 0 && t > 0) {
      this.toolTip.style.visibility = 'visible';
    } else {
      this.toolTip.style.visibility = 'hidden';
    }
    return [l,t];
  }

  onCursorIdx = (u, sId, idx) => {
    if (idx !== this.prevTipIdx) {
      this.prevTipIdx = idx;
      const ts = moment.unix(this.bars[0][idx]);
      this.tpTs.innerHTML = ts.format('MM/DD LTS');
      this.tpCV.innerHTML = `$${this.bars[2][idx]} (${this.bars[1][idx]})`;
    }
    return(idx);
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
        this.drawOneLine(u, this.trend.large, '#927fbf', 6)
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
      cursor: {
        move: this.onCursorMove,
        dataIdx: this.onCursorIdx,
      },
      plugins: [
        {
          hooks: {
            drawClear: drawV,
          },
        },
        {
          hooks: {
            drawClear: this.drawTrendLine,
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
          <div className={classes.toolTip} ref={el => this.toolTip = el}>
            <Typography style={{color: 'orange'}} ref={el => this.tpTs = el}>
              MM/DD HH:MM:SS
            </Typography>
            <br />
            <Typography style={{color: 'orange'}} ref={el => this.tpCV = el}>
              $ccc.cc vvvv
            </Typography>
          </div>
        </Paper>
      </Grid>
    );
  }
}


export default compose(
  withStyles(styles),
)(TrendChart);