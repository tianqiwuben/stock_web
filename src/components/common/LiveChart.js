import React from 'react';
import compose from 'recompose/compose';
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import {getComponent} from './Constants';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import moment from 'moment';
import {apiLiveBars} from '../../utils/ApiFetch';
import CircularProgress from '@material-ui/core/CircularProgress';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';


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
  acceptFeeding: {
    marginLeft: theme.spacing(2),
  },
});

const drawV = (u) => {
  let [iMin, iMax] = u.series[0].idxs;
  let vol0AsY = u.valToPos(0, "v", true);
  for (let i = iMin; i <= iMax; i++) {
    let vol = u.data[1][i];
    let timeAsX = u.valToPos(i,  "x", true);
    let columnWidth  = u.bbox.width / (iMax - iMin);
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
      prevMin: '15',
      nextMin: '15',
      loading: false,
      acceptFeeding: props.page === 'transactions' ? false : true,
      frame: 'minute',
    }
    let now = Math.floor(new Date() / 1e3);
    this.bars = [
      [now, now + 60],
      [0,0],
      [0,0],
    ]
    this.prevTipIdx = 0;
    this.srLevels = [];
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
      this.highlightIdx.forEach(hl => {
        if (hl[0] >= 0) {
          const centerX = u.valToPos(hl[0], 'x', true);
          const c = u.data[2][hl[0]];
          const centerY = u.valToPos(c, '$', true);
          u.ctx.beginPath();
          if (hl[1]) {
            u.ctx.moveTo(centerX, centerY);
            u.ctx.lineTo(centerX - 10, centerY + 12);
            u.ctx.lineTo(centerX + 10, centerY + 12);
            u.ctx.fillStyle = "#05f29b";
            u.ctx.fill();
          } else {
            u.ctx.moveTo(centerX, centerY);
            u.ctx.lineTo(centerX - 10, centerY - 12);
            u.ctx.lineTo(centerX + 10, centerY - 12);
            u.ctx.fillStyle = "#ff7777";
            u.ctx.fill();
          }
        }
      })
    }
    if (this.srLevels.length > 0) {
      let [iMin, iMax] = u.series[0].idxs;
      const x0 = u.valToPos(iMin, 'x', true);
      const x1 = u.valToPos(iMax, 'x', true);
      this.srLevels.forEach(level => {
        u.ctx.beginPath();
        const y = u.valToPos(level, '$', true);
        u.ctx.moveTo(x0, y);
        u.ctx.lineTo(x1, y);
        u.ctx.strokeStyle = "orange";
        u.ctx.lineWidth = 1;
        u.ctx.stroke();
      })
    } 
  }

  componentDidMount() {
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
            draw: this.drawHighlight,
          },
        },
      ],
    }
    this.u = new uPlot(opt, this.bars, this.chartEl);
    const {setRef} = this.props;
    setRef && setRef(this);
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

  onFetchChart = (newSym = null, ts_lte = null, ts_start = null, strategy = null) => {
    const {
      sym,
      frame,
    } = this.state;
    const {enqueueSnackbar, env} = this.props;
    this.setState({
      loading: true,
    })
    const s = newSym || sym;
    const query = {
      sym: s,
      env,
      frame,
    }
    console.log('onFetchChart', ts_lte);
    if (ts_lte) {
      query['ts_lte'] = ts_lte;
    }
    if (ts_start) {
      query['ts_start'] = ts_start;
    }
    if (strategy) {
      query.strategy = strategy;
    }
    apiLiveBars(query).then(resp => {
      if (resp && resp.data.success && resp.data.payload) {
        this.setState({
          sym: s,
          loading: false,
        });
        this.bars = resp.data.payload.data;
        this.highlightIdx = resp.data.payload.highlight_idx;
        this.srLevels = resp.data.payload.sr_levels;
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

  onPrevFrame = () => {
    const {prevMin} = this.state;
    const ts = this.bars[0][0];
    this.onFetchChart(null, null, ts - parseInt(prevMin) * 60);
  }

  onNextFrame = () => {
    const {nextMin} = this.state;
    const ts = this.bars[0][0];
    this.onFetchChart(null, null, ts + parseInt(nextMin) * 60);
  }

  handleChange = (field, e) => {
    this.setState({[field]: e.target.value});
  }

  changeFrame = (e, frame) => {
    if (frame) {
      this.setState({frame}, this.onFetchChart);
    }
  }

  onTimeChange = () => {
    const {startTime} = this.state;
    const t = moment(startTime).unix();
    this.onFetchChart(null, null, t);
  }

  changeAcceptFeed = () => {
    const {acceptFeeding} = this.state;
    this.setState({acceptFeeding: !acceptFeeding});
  }

  onFeedBar = (bar) => {
    const {sym, acceptFeeding} = this.state;
    if (acceptFeeding && bar.sym === sym) {
      this.bars[0].shift();
      this.bars[1].shift();
      this.bars[2].shift();
      this.bars[0].push(bar.ts);
      this.bars[1].push(bar.v);
      this.bars[2].push(bar.c);
      if (this.highlightIdx) {
        this.highlightIdx.forEach(hl => {
          hl[0] -= 1;
        });
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
      startTime,
      loading,
      prevMin,
      nextMin,
      acceptFeeding,
      frame,
    } = this.state;
    return (
      <Paper className={classes.container} ref={el => this.container = el}>
        <Box className={classes.title} display="flex" flexDirection="row" alignItems="center" justifyContent="space-between">
          <Button onClick={this.onPrevFrame}>{'<<'}</Button>
          <TextField
            value={prevMin}
            style={{width: 20}}
            onChange={e => this.handleChange('prevMin', e)}
          />
          <Button onClick={() => this.onFetchChart()}>{'NOW'}</Button>
          <TextField
            value={nextMin}
            style={{width: 20}}
            onChange={e => this.handleChange('nextMin', e)}
          />
          <Button onClick={this.onNextFrame}>{'>>'}</Button>
          <TextField
            type="datetime-local"
            value={startTime}
            onChange={e => this.handleChange('startTime', e)}
            onBlur={e => this.onTimeChange()}
          />
          <FormGroup row className={classes.acceptFeeding}>
            <FormControlLabel
              control={<Switch checked={acceptFeeding} color="primary" onChange={this.changeAcceptFeed}/>}
              label="Accept Feeding"
            />
          </FormGroup>

          <ToggleButtonGroup
            size="small"
            value={frame}
            exclusive
            onChange={this.changeFrame}
          >
            <ToggleButton value="second">
              SECOND
            </ToggleButton>
            <ToggleButton value="minute">
              MINUTE
            </ToggleButton>
          </ToggleButtonGroup>
          {loading && <CircularProgress style={{marginLeft: 16}} size={20}/>}
          <Typography variant="h6" style={{flexGrow: 1}} align="right">{`${sym} delay ${timeDelay}ms $${latestC}`}</Typography>
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