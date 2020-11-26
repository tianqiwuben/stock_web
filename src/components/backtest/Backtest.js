import React from 'react';
import compose from 'recompose/compose';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Typography from '@material-ui/core/Typography';
import moment from 'moment';

import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import { withSnackbar } from 'notistack';
import FormControl from '@material-ui/core/FormControl';
import {connect} from 'react-redux';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import {
  apiGetBacktestCase,
  apiPostBacktestCase,
  apiBacktestCmd,
} from '../../utils/ApiFetch';

import uPlot from "uplot";

const styles = theme => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  row: {
    '& > *': {
      margin: theme.spacing(1),
    },
  },
  priceTag: {
    position: 'absolute',
    right: 24,
    top: 0,
    visibility: 'hidden',
    padding: "4px 4px",
    background: '#333',
    pointerEvents: 'none',
  },
  macdTag: {
    position: 'absolute',
    right: 24,
    bottom: window.innerHeight * 0.2 - 4,
    visibility: 'hidden',
    padding: "4px 4px",
    background: '#333',
    pointerEvents: 'none',
  },
  legendLabel: {
    width: '100%',
    padding: '4px 8px',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

const drawMacdDiff = u => {
  const [iMin, iMax] = u.series[0].idxs;
  const columnWidth  = Math.round(u.bbox.width / (iMax - iMin) * 0.9);
  let diff0AsY = u.valToPos(0, "$", true);
  for (let i = iMin; i <= iMax; i++) {
    let diff = u.data[3][i];
    let timeAsX = u.valToPos(i,  "x", true);
    let bodyX = i === iMin ? timeAsX : timeAsX - (columnWidth / 2);
    let volAsY = u.valToPos(diff, "$", true);
    u.ctx.fillStyle = diff > 0 ? "#00ec3a" : "#ff5f5f";
    u.ctx.fillRect(
      Math.round(bodyX),
      Math.round(volAsY),
      Math.round(i === iMax ? columnWidth / 2 : columnWidth),
      Math.round(diff0AsY - volAsY),
    );
  }
}

const drawV = (u) => {
  const [iMin, iMax] = u.series[0].idxs;
  const columnWidth  = Math.round(u.bbox.width / (iMax - iMin) * 0.9);
  let vol0AsY = u.valToPos(0, "v", true);
  for (let i = iMin; i <= iMax; i++) {
    let vol = u.data[1][i];
    let timeAsX = u.valToPos(i,  "x", true);
    let bodyX = i === iMin ? timeAsX : timeAsX - (columnWidth / 2);
    let volAsY = u.valToPos(vol, "v", true);
    u.ctx.fillStyle = "#15618E"
    u.ctx.fillRect(
      Math.round(bodyX),
      Math.round(volAsY),
      Math.round(i === iMax ? columnWidth / 2 : columnWidth),
      Math.round(vol0AsY - volAsY),
    );
  }
}

const drawBar = (u) => {
  const [iMin, iMax] = u.series[0].idxs;
  const columnWidth = Math.round(u.bbox.width / (iMax - iMin) * 0.8);
  for (let i = iMin; i <= iMax; i++) {
    let o = u.data[2][i];
    let h = u.data[3][i];
    let l = u.data[4][i];
    let c = u.data[5][i];
    let timeAsX = u.valToPos(i, "x", true);
    let bodyX = i === iMin ? timeAsX : timeAsX - (columnWidth / 2);
    let oPos = u.valToPos(o, "$", true);
    let hPos = u.valToPos(h, "$", true);
    let lPos = u.valToPos(l, "$", true);
    let cPos = u.valToPos(c, "$", true);
    if (c > o) {
      u.ctx.fillStyle = "#00ec3a";
      u.ctx.strokeStyle = "#00ec3a";
      u.ctx.fillRect(
        Math.round(bodyX),
        Math.round(cPos),
        Math.round(i === iMax ? columnWidth / 2 : columnWidth),
        Math.round(oPos - cPos),
      );
    } else if (c < o){
      u.ctx.fillStyle = "#ff5f5f";
      u.ctx.strokeStyle = "#ff5f5f";
      u.ctx.fillRect(
        Math.round(bodyX),
        Math.round(oPos),
        Math.round(i === iMax ? columnWidth / 2 : columnWidth),
        Math.round(cPos - oPos),
      );
    } else {
      u.ctx.fillStyle = "#eee";
      u.ctx.strokeStyle = "#eee";
      u.ctx.fillRect(
        Math.round(bodyX),
        Math.round(oPos),
        Math.round(i === iMax ? columnWidth / 2 : columnWidth),
        2,
      );
    }
    u.ctx.beginPath();
    u.ctx.lineWidth = 2;
    u.ctx.moveTo(timeAsX, lPos);
    u.ctx.lineTo(timeAsX, hPos);
    u.ctx.stroke();
  }
}

const macdOptions = {
  width: 800,
  height: window.innerHeight * 0.2,
  scales: {
    x: {
      distr: 2,
    },
  },
  legend: {
    show: false,
  },
  series: [
    {},
    {
      scale: '$',
      label: 'macd',
      points: {
        show: false,
      },
      stroke: '#00FFFF',
    },
    {
      label: 'ema_9',
      scale: '$',
      points: {
        show: false,
      },
      stroke: 'yellow',
    },
    {
      paths: () => null,
      label: 'diff',
      scale: '$',
      points: {
        show: false,
      },
      stroke: 'transaparent',
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



const plotOptions = {
  width: 800,
  height: window.innerHeight * 0.4,
  scales: {
    x: {
      distr: 2,
    },
    v: {
      range: (up, imin, imax, sk) => [0, imax * 2],
    },
  },
  legend: {
    show: false,
  },
  series: [
    {},
    {
      scale: 'v',
      label: 'V',
      paths: () => null,
      points: {
        show: false,
      },
      stroke: 'transaparent',
    },
    {
      paths: () => null,
      label: 'O',
      scale: '$',
      points: {
        show: false,
      },
      stroke: 'transaparent',
    },
    {
      paths: () => null,
      label: 'H',
      scale: '$',
      points: {
        show: false,
      },
      stroke: 'transaparent',
    },
    {
      paths: () => null,
      label: 'L',
      scale: '$',
      points: {
        show: false,
      },
      stroke: 'transaparent',
    },
    {
      paths: () => null,
      label: 'C',
      scale: '$',
      points: {
        show: false,
      },
      grid: {
        stroke: '#aaa',
        dash: [1, 8],
      },
      stroke: 'transaparent',
    },
    {
      scale: '$',
      label: 'VWAP',
      side: 1,
      stroke: '#FF66FF',
      size: 32,
      ticks: {
        show: false,
      },
      points: {
        show: false,
      },
    },
    {
      scale: '$',
      label: 'EMA',
      side: 1,
      stroke: '#00FFFF',
      size: 32,
      ticks: {
        show: false,
      },
      points: {
        show: false,
      },
    },
    {
      scale: 'spy',
      label: 'SPY',
      stroke: 'yellow',
      side: 0,
      size: 32,
      ticks: {
        show: false,
      },
      points: {
        show: false,
      },
    }
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


class Backtest extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      lineNum: 0,
      showExit: true,
      strategy: 'long_break',
      sym: 'SPY',
    }
    this.bars = null;
    this.macdData = null;
  }

  componentDidMount() {
    const {width} = this.container.getBoundingClientRect();
    const opt = {
      ...plotOptions,
      width: width - 32,
      cursor: {
        move: this.onCursorMove,
        dataIdx: this.onCursorIdx,
        sync: {key: 'foo'},
      },
      plugins: [
        {
          hooks: {
            drawClear: drawV,
          },
        },
        {
          hooks: {
            drawClear: this.drawMarkers,
          },
        },
        {
          hooks: {
            drawClear: drawBar,
          },
        },
      ],
    }
    this.u = new uPlot(opt, this.bars, this.chartEl);
    const macdOpt = {
      ...macdOptions,
      width: width - 32,
      cursor: {
        move: this.onMacdCursorMove,
        sync: {key: 'foo'},
      },
      plugins: [
        {
          hooks: {
            drawClear: drawMacdDiff,
          },
        },
      ],
    }
    this.macdU = new uPlot(macdOpt, this.macdData, this.macdEl);
    this.fetch(1);
  }

  componentWillUnmount() {
    if (this.u) {
      this.u.destroy();
      this.u = null;
    }
  }

  onMacdCursorMove = (u, l, t) => {
    if (this.macdTag) {
      this.macdTag.style.transform = `translate(0px, ${t}px)`;
    }
    if (l > 0 && t > 0) {
      this.macdTag.style.visibility = 'visible';
      const macd = u.posToVal(t, '$');
      this.macdTagValue.innerHTML = macd.toFixed(3);
    } else {
      this.macdTag.style.visibility = 'hidden';
    }
    return [l,t];
  }

  onCursorMove = (u, l, t) => {
    if (this.priceTag) {
      this.priceTag.style.transform = `translate(0px, ${t}px)`;
    }
    if (l > 0 && t > 0) {
      this.priceTag.style.visibility = 'visible';
      const val = u.posToVal(t, '$');
      this.priceTagValue.innerHTML = val.toFixed(2);
    } else {
      this.priceTag.style.visibility = 'hidden';
    }
    return [l,t];
  }

  onCursorIdx = (u, sId, idx) => {
    if (idx !== this.prevTipIdx) {
      this.prevTipIdx = idx;
      const ts = moment.unix(this.bars[0][idx]);
      let innerHtml = [
        ts.format('MM/DD LTS'),
        `O: ${this.bars[2][idx]}`,
        `H: ${this.bars[3][idx]}`,
        `L: ${this.bars[4][idx]}`,
        `C: ${this.bars[5][idx]}`,
        `V: ${this.bars[1][idx]}`,
        `VWAP: ${this.bars[6][idx].toFixed(3)}`,
        `EMA: ${this.bars[7][idx].toFixed(3)}`,
        `MACD_DIFF: ${this.macdData[3][idx].toFixed(5)}`,
        `MACD: ${this.macdData[1][idx].toFixed(5)}`,
        `MACD_EMA9: ${this.macdData[2][idx].toFixed(5)}`,
        `SPY: ${this.bars[8][idx]}`,
      ].join('</span><span>');
      this.legendEl.innerHTML = '<span>' + innerHtml + '</span>';
    }
    return(idx);
  }

  drawMarkers = (u) => {
    const {
      init_c,
      break_even_price,
      entry_idx,
      exit_idx,
      stop_price,
      target_price,
      showExit,
      trend_amp_small,
      entry_vwap,
    } = this.state;
    if (entry_idx) {
      const centerX = u.valToPos(entry_idx, 'x', true);
      u.ctx.strokeStyle = "orange";
      u.ctx.lineWidth = 2;
      u.ctx.beginPath();
      let ampPrice = entry_vwap * (1 - trend_amp_small * 0.01);
      let ampY =  u.valToPos(ampPrice, '$', true);
      u.ctx.moveTo(centerX, ampY);
      u.ctx.lineTo(centerX - 100, ampY);
      u.ctx.stroke();
      ampPrice = entry_vwap * (1 - trend_amp_small * 0.01618);
      ampY = u.valToPos(ampPrice, '$', true);
      u.ctx.moveTo(centerX, ampY);
      u.ctx.lineTo(centerX - 100, ampY);
      u.ctx.stroke();
      ampPrice = entry_vwap * (1 + trend_amp_small * 0.01);
      ampY =  u.valToPos(ampPrice, '$', true);
      u.ctx.moveTo(centerX, ampY);
      u.ctx.lineTo(centerX - 100, ampY);
      u.ctx.stroke();
      ampPrice = entry_vwap * (1 + trend_amp_small * 0.01618);
      ampY =  u.valToPos(ampPrice, '$', true);
      u.ctx.moveTo(centerX, ampY);
      u.ctx.lineTo(centerX - 100, ampY);
      u.ctx.stroke();

      u.ctx.fillStyle = "#eee"
      if (showExit) {
        let exitX = u.valToPos(exit_idx, 'x', true);
        const targetY = u.valToPos(target_price, '$', true);
        const evenY = u.valToPos(break_even_price, '$', true);
        const centerY = u.valToPos(init_c, '$', true);
        const stopY = u.valToPos(stop_price, '$', true);
        u.ctx.fillStyle = "#0a700e"
        u.ctx.fillRect(
          centerX,
          targetY,
          exitX - centerX,
          centerY - targetY,
        )
        u.ctx.fillStyle = "#15ab1a"
        u.ctx.fillRect(
          centerX,
          evenY,
          exitX - centerX,
          centerY - evenY,
        )
        u.ctx.fillStyle = "#911414"
        u.ctx.fillRect(
          centerX,
          centerY,
          exitX - centerX,
          stopY - centerY,
        )
      }
    }
  }

  fetch = (next = 0) => {
    const {enqueueSnackbar} = this.props;
    const {lineNum, strategy, sym} = this.state;
    const payload = {
      lineNum,
      strategy,
      next,
      sym,
    }
    apiGetBacktestCase(payload).then(resp => {
      if (resp.data.success) {
        const newStates = {
          ...resp.data.payload,
          //showExit: false,
        }
        this.setState(newStates, this.assignBars);
      } else {
        enqueueSnackbar(resp.data.error, {variant: 'error'})
      }
    })
  }

  assignBars = () => {
    const {
      bars,
      showExit,
      entry_idx,
      exit_idx,
    } = this.state;
    this.bars = [
      [],  //ts
      [],    // v
      [],    // o
      [],    // h
      [],    // l
      [],    // c
      [],    // vwap
      [],    // ema
      [],    // spy
    ]
    this.macdData = [
      [], //ts
      [], //macd
      [], //ema_9
      [], //diff
    ]
    for(let idx in bars) {
      if (!showExit && idx >= entry_idx) {
        break;
      }
      if (idx > exit_idx + 60) {
        break;
      }
      const bar = bars[idx];
      this.bars[0].push(bar.ts);
      this.bars[1].push(bar.v);
      this.bars[2].push(bar.o);
      this.bars[3].push(bar.h);
      this.bars[4].push(bar.l);
      this.bars[5].push(bar.c);
      this.bars[6].push(bar.vwap);
      this.bars[7].push(bar.ema);
      this.bars[8].push(bar.spy);
      this.macdData[0].push(bar.ts);
      this.macdData[1].push(bar.macd);
      this.macdData[2].push(bar.macd_ema);
      this.macdData[3].push(bar.macd_diff);
    };
    if (this.u) {
      this.u.setData(this.bars);
    }
    if (this.macdU) {
      this.macdU.setData(this.macdData);
    }
  }

  handleChange = (field, e) => {
    this.setState({
      [field]: e.target.value,
    });
  }

  onAction = (trade) => {
    const {enqueueSnackbar} = this.props;
    const {lineNum, strategy, pl} = this.state;
    const payload = {
      lineNum,
      strategy,
      trade,
      pl,
    }
    apiPostBacktestCase(payload).then(resp => {
      if (!resp.data.success) {
        enqueueSnackbar(resp.data.error, {variant: 'error'})
      }
    })
    this.setState({
      showExit: true,
    }, this.assignBars)
  }

  onHide = () => {
    this.setState({
      showExit: false,
    }, this.assignBars)
  }

  onResetNum = () => {
    const {enqueueSnackbar} = this.props;
    const {strategy, sym} = this.state;
    const payload = {
      strategy,
      cmd: 'reset_line_num',
      sym,
    }
    apiBacktestCmd(payload).then(resp => {
      if (resp.data.success) {
        this.setState({lineNum: 0});
      } else {
        enqueueSnackbar(resp.data.error, {variant: 'error'})
      }
    })
  }

  onShuffle = () => {
    const {enqueueSnackbar} = this.props;
    const {strategy} = this.state;
    const payload = {
      strategy,
      cmd: 'shuffle',
    }
    apiBacktestCmd(payload).then(resp => {
      if (resp.data.success) {
        this.setState({lineNum: 0});
        enqueueSnackbar(`Shuffle done count: ${resp.data.payload.matching_count}`, {variant: 'success'})
      } else {
        enqueueSnackbar(resp.data.error, {variant: 'error'})
      }
    })
  }

  render() {
    const {classes} = this.props;
    const {
      lineNum,
      time_frame,
      showExit,
      pl,
      sym,
      action,
      attrs,
      init_c,
      trend_amp_small,
    } = this.state;
    return (
      <Grid container spacing={3}>
        <Grid item xs={12} md={12} lg={12}>
          <Paper ref={el => this.container = el} style={{position: 'relative', background: '#1E1E1E'}}>
            <div className={classes.oneChart} ref={el => this.chartEl = el} />
            <div className={classes.macdChart} ref={el => this.macdEl = el} />
            <Typography variant="body2" className={classes.legendLabel} ref={el => this.legendEl = el}>
                MM/DD HH:MM:SS O: oo.oo H: hh.hh L: ll.ll C: cc.cc V: vvvvvv VWAP: cc.cc EMA cc.cc MACD_DIFF: cc.cc MACD_EMA9: cc.cc MACD: cc.cc
            </Typography>
            <div className={classes.priceTag} ref={el => this.priceTag = el}>
              <Typography style={{color: 'orange'}} ref={el => this.priceTagValue = el}>
                cc.cc
              </Typography>
            </div>
            <div className={classes.macdTag} ref={el => this.macdTag = el}>
              <Typography style={{color: 'orange'}} ref={el => this.macdTagValue = el}>
                cc.cc
              </Typography>
            </div>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3} lg={3}>
          <List component={Paper}>
            <ListItem>
              <ListItemText>
                Line Number
              </ListItemText>
              <ListItemSecondaryAction>
                <TextField
                  value={lineNum}
                  onChange={e => this.handleChange('lineNum', e)}
                  inputProps={{
                    style: { textAlign: "right" }
                  }}
                  style = {{width: 80}}
                  onKeyPress={(ev) => {
                    if (ev.key === 'Enter') {
                      this.fetch()
                      ev.preventDefault();
                    }
                  }}
                />
              </ListItemSecondaryAction>
            </ListItem>
            <ListItem>
              <ListItemText>
                SYM
              </ListItemText>
              <ListItemSecondaryAction>
                <TextField
                  value={sym}
                  onChange={e => this.handleChange('sym', e)}
                  inputProps={{
                    style: { textAlign: "right" }
                  }}
                  style = {{width: 80}}
                  onKeyPress={(ev) => {
                    if (ev.key === 'Enter') {
                      this.fetch()
                      ev.preventDefault();
                    }
                  }}
                />
              </ListItemSecondaryAction>
            </ListItem>
            <ListItem>
              <ListItemText>
                <Button onClick={this.onResetNum}>RESTET NUM</Button>
                <Button onClick={this.onShuffle}>SHUFFLE</Button>
              </ListItemText>
            </ListItem>
          </List>
        </Grid>
        <Grid item xs={12} md={3} lg={3}>
          <List component={Paper}>
            <ListItem>
              <ListItemText>
                action
              </ListItemText>
              <ListItemSecondaryAction>
                {action}
              </ListItemSecondaryAction>
            </ListItem>
            <ListItem>
              <ListItemText>
                time_frame
              </ListItemText>
              <ListItemSecondaryAction>
                {time_frame}
              </ListItemSecondaryAction>
            </ListItem>
            <ListItem>
              <ListItemText>
                init_c
              </ListItemText>
              <ListItemSecondaryAction>
                {init_c}
              </ListItemSecondaryAction>
            </ListItem>
            <ListItem>
              <ListItemText>
                trend_amp_small
              </ListItemText>
              <ListItemSecondaryAction>
                {trend_amp_small}%
              </ListItemSecondaryAction>
            </ListItem>
          </List>
        </Grid>
        <Grid item xs={12} md={3} lg={3}>
          <List component={Paper}>
            {
              attrs && Object.keys(attrs).map(k => (
                <ListItem key={k}>
                  <ListItemText>
                    {k}
                  </ListItemText>
                  <ListItemSecondaryAction>
                    {attrs[k]}
                  </ListItemSecondaryAction>
                </ListItem>
              ))
            }
          </List>
        </Grid>
        <Grid item xs={12} md={3} lg={3}>
          <List component={Paper}>
            <ListItem>
              <ListItemText>
                <Button onClick={() => this.fetch(-1)}>PREV</Button>
                <Button onClick={() => this.fetch(1)}>NEXT</Button>
                <Button onClick={() => this.onAction(true)} color="primary">TRADE</Button>
                <Button onClick={() => this.onAction(false)}>SKIP</Button>
                <Button onClick={this.onHide}>HIDE</Button>
              </ListItemText>
            </ListItem>
            {
              showExit &&
              <React.Fragment>
                <ListItem>
                  <ListItemText>
                    PL
                  </ListItemText>
                  <ListItemSecondaryAction>
                    {pl}%
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemText>
                    SYM
                  </ListItemText>
                  <ListItemSecondaryAction>
                    {sym}
                  </ListItemSecondaryAction>
                </ListItem>
              </React.Fragment>
            }
          </List>
        </Grid>
      </Grid>
    );
  }
}


export default compose(
  withStyles(styles),
  connect(null),
  withSnackbar,
)(Backtest);