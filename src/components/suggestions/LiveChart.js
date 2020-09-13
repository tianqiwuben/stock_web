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
import "../../../node_modules/uplot/dist/uPlot.min.css";
import { withSnackbar } from 'notistack';

import uPlot from "uplot";

const styles = theme => ({
  container: {
    position: 'relative',
  },
  oneChart: {
    height: '35vh',
  },
  title: {
    padding: '4px 16px 0 16px',
  },
  toolTip: {
    position: 'absolute',
    visibility: 'hidden',
    left: -20,
    top: 64,
    width: 150,
    padding: theme.spacing(1),
    background: '#222',
    pointerEvents: 'none',
  },
});

const drawV = (u) => {
  let [iMin, iMax] = u.series[0].idxs;
  let vol0AsY = u.valToPos(0, "v", true);
  for (let i = iMin; i <= iMax; i++) {
    let vol = u.data[1][i];
    let timeAsX = u.valToPos(i,  "x", true);
    let columnWidth  = u.bbox.width / (iMax - iMin);
    let bodyX = timeAsX - (columnWidth / 2);
    let volAsY = u.valToPos(vol, "v", true);
    u.ctx.fillStyle = "#eee"
    u.ctx.fillRect(
      Math.round(bodyX),
      Math.round(volAsY),
      Math.round(columnWidth),
      Math.round(vol0AsY - volAsY),
    );
  }
}

const plotOptions = {
  width: 800,
  height: window.innerHeight * 0.35,
  legend: {
    show: false,
  },
  scales: {
    x: {
      distr: 2,
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
      incrs: [1, 60],
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

class LiveChart extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sym: 'SPY',
      latestC: 0,
      startTime: '',
      timeDelay: 0,
    }
    let now = Math.floor(new Date() / 1e3);
    this.bars = [
      [now, now + 60],
      [0,0],
      [0,0],
    ]
    this.prevTipIdx = 0;
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

  drawHighlight = (u) => {
    if (this.highlightIdx) {
      const centerX = u.valToPos(this.highlightIdx, 'x', true);
      const c = u.data[2][this.highlightIdx];
      const centerY = u.valToPos(c, '$', true);
      u.ctx.beginPath();
      u.ctx.strokeStyle = "red";
      u.ctx.arc(centerX, centerY, 4, 0, 2 * Math.PI);
      u.ctx.fillStyle = "white";
      u.ctx.fill();
      u.ctx.stroke();
    }
  }

  componentDidMount() {
    const opt = {
      ...plotOptions,
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
            draw: this.drawHighlight,
          },
        },
      ],
    }
    this.u = new uPlot(opt, this.bars, this.chartEl);
    const {setRef} = this.props;
    setRef(this);
    const ws = getComponent('websocket');
    this.chartID = ws.registerChart(this);
  }

  componentWillUnmount() {
    if (this.u) {
      this.u.destroy();
      this.u = null;
    }
    const {setRef} = this.props;
    setRef(null);
    const ws = getComponent('websocket');
    ws.removeChart(this.chartID);
  }

  setWidth = (width) => {
    if (this.u) {
      this.u.setSize({width, height: window.innerHeight * 0.35});
    }
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
      if (resp && resp.data.success && resp.data.payload) {
        this.setState({
          sym: s,
          loading: false,
        });
        this.bars = resp.data.payload.data;
        this.highlightIdx = resp.data.payload.highlight_idx;
        if (this.u) {
          this.u.setData(this.bars);
        }
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
    const ts = this.bars[0][0];
    this.onFetchChart(null, null, ts - 15 * 60);
  }

  onNext15 = () => {
    const ts = this.bars[0][0];
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
    const {sym} = this.state;
    if (bar.sym === sym) {
      this.bars[0].shift();
      this.bars[1].shift();
      this.bars[2].shift();
      this.bars[0].push(bar.ts);
      this.bars[1].push(bar.v);
      this.bars[2].push(bar.c);
      if (this.highlightIdx) {
        this.highlightIdx -= 1;
        if (this.highlightIdx < 0) {
          this.highlightIdx = null;
        }
      }
      if (this.u) {
        this.u.setData(this.bars);
      }
      const timeDelay = Date.now() - bar.ts * 1000 - 1000;
      this.setState({
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
      sym,
      latestC,
      timeDelay,
      startTime
    } = this.state;
    return (
      <Paper className={classes.container}>
        <Box className={classes.title} display="flex" flexDirection="row" alignItems="flex-start" justifyContent="space-between">
          <Button onClick={this.onPrev15}>{'<<'}</Button>
          <Button onClick={() => this.onFetchChart()}>{'NOW'}</Button>
          <Button onClick={this.onNext15}>{'>>'}</Button>
          <TextField
            type="datetime-local"
            value={startTime}
            InputLabelProps={{
              shrink: true,
            }}
            onChange={e => this.handleChange('startTime', e)}
            onBlur={e => this.onTimeChange()}
          />
          <Typography variant="h6" style={{flexGrow: 1}} align="center">{`${sym} delay ${timeDelay}ms`}</Typography>
          <Typography variant="h6">{`$${latestC}`}</Typography>
        </Box>
        <div className={classes.oneChart} ref={el => this.chartEl = el} />
        <div className={classes.toolTip} ref={el => this.toolTip = el}>
          <Typography variant="body" style={{color: 'orange'}} ref={el => this.tpTs = el}>
            MM/DD HH:MM:SS
          </Typography>
          <br />
          <Typography variant="body" style={{color: 'orange'}} ref={el => this.tpCV = el}>
            $ccc.cc vvvv
          </Typography>
        </div>
      </Paper>
    );
  }
}


export default compose(
  withStyles(styles),
  withSnackbar,
)(LiveChart);