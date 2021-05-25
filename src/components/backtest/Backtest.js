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
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import ToggleButton from '@material-ui/lab/ToggleButton';
import moment from 'moment';
import querystring from 'querystring';

import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import { withSnackbar } from 'notistack';
import {connect} from 'react-redux';
import Select from '@material-ui/core/Select';
import {StrategyDB} from '../common/Constants';
import MenuItem from '@material-ui/core/MenuItem';
import {
  apiGetBacktestCase,
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
    top: window.innerHeight * 0.45,
    visibility: 'hidden',
    padding: "4px 4px",
    background: '#333',
    pointerEvents: 'none',
  },
  rsiTag: {
    position: 'absolute',
    right: 24,
    bottom: window.innerHeight * 0.15 - 4,
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
  srLabel: {
    position: 'absolute',
    bottom: 32,
    right: 12,
  }
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

const drawRsiBound = u => {
  u.ctx.lineWidth = 1;
  let top = u.valToPos(70, "r", true);
  let bottom = u.valToPos(30, "r", true);
  const [iMin, iMax] = u.series[0].idxs;
  let left = u.valToPos(iMin, "x", true);
  let right = u.valToPos(iMax, "x", true);

  u.ctx.beginPath();
  u.ctx.strokeStyle = "#eee";
  u.ctx.moveTo(left, top);
  u.ctx.lineTo(right, top);
  u.ctx.stroke();

  u.ctx.beginPath();
  u.ctx.strokeStyle = "#eee";
  u.ctx.moveTo(left, bottom);
  u.ctx.lineTo(right, bottom);
  u.ctx.stroke();
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

const rsiOptions = {
  width: 800,
  height: window.innerHeight * 0.15,
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
      scale: 'r',
      label: 'rsi',
      points: {
        show: false,
      },
      stroke: '#eee',
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
      scale: 'r',
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
  height: window.innerHeight * 0.45,
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
      scale: '$',
      label: 'VWAP_UP', // 'SEC',
      stroke: '#eee',
      side: 0,
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
      label: 'VWAP_DOWN', // 'SPY',
      stroke: '#eee',
      side: 0,
      size: 32,
      ticks: {
        show: false,
      },
      points: {
        show: false,
      },
    },
    // {
    //   scale: 'v',
    //   label: 'VOL_OSC',
    //   stroke: '#eee',
    //   side: 0,
    //   size: 32,
    //   ticks: {
    //     show: false,
    //   },
    //   points: {
    //     show: false,
    //   },
    // },
    {
      scale: '$',
      label: 'MIN_ATR_UP',
      stroke: 'orange',
      side: 0,
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
      label: 'MIN_ATR_DOWN',
      stroke: 'orange',
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
    },
  ],
}


class Backtest extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      symLineNum: 0,
      allLineNum: 0,
      strategy: 'vwap_reversal',
      sym: 'SPY',
      plFilter: 'all',
      stepSize: 1,
      showRsi: false,
      showMacd: false,
      dateStr: '',
      selectMin: null,
      selectMax: null,
    }
    this.bars = null;
    this.macdData = null;
    this.rsiData = null;
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
      hooks: {
        setSelect: [
          this.onSelectDateRange,
        ]
      },
      plugins: [
        {
          hooks: {
            drawClear: this.drawV,
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
    const rsiOpt = {
      ...rsiOptions,
      width: width - 32,
      cursor: {
        move: this.onRsiCursorMove,
        sync: {key: 'foo'},
      },
      plugins: [
        {
          hooks: {
            drawClear: drawRsiBound,
          },
        },
      ],
    }
    this.rsiU = new uPlot(rsiOpt, this.rsiData, this.rsiEl);
    const {location} = this.props;
    let hasParam = false;
    if (location && !!location.search) {
      const query = querystring.decode(location.search.substring(1));
      if (query.sym && query.date) {
        hasParam = true;
        this.setState({
          sym: query.sym,
          dateStr: query.date
        }, () => {
          this.fetch('all', 0, true)
        });
      }
    }
    if (!hasParam) {
      this.fetch('all');
    }
  }

  componentWillUnmount() {
    if (this.u) {
      this.u.destroy();
      this.u = null;
    }
    if (this.macdU) {
      this.macdU.destroy();
      this.macdU = null;
    }
  }


  onSelectDateRange = (u) => {
    let min = u.posToVal(u.select.left, 'x');
		let max = u.posToVal(u.select.left + u.select.width, 'x');
    this.setState({
      selectMin: this.bars[0][Math.round(min)],
      selectMax: this.bars[0][Math.round(max)]
    })
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

  onRsiCursorMove =  (u, l, t) => {
    if (this.rsiTag) {
      this.rsiTag.style.transform = `translate(0px, ${t}px)`;
    }
    if (l > 0 && t > 0) {
      this.rsiTag.style.visibility = 'visible';
      const rsi = u.posToVal(t, 'r');
      this.rsiTagValue.innerHTML = rsi.toFixed(2);
    } else {
      this.rsiTag.style.visibility = 'hidden';
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
      const {support_resists} = this.state;
      if (support_resists && Object.keys(support_resists).length > 0) {
        let pickedName = null;
        let minDiff = null;
        for(let sr in support_resists) {
          const diff  = Math.abs(support_resists[sr] - val);
          if (minDiff === null || diff < minDiff) {
            minDiff = diff;
            pickedName = sr;
          }
        }
        this.srLevelEl.innerHTML = `${pickedName} ${support_resists[pickedName]}`;
      }
    } else {
      this.priceTag.style.visibility = 'hidden';
    }
    return [l,t];
  }

  onCursorIdx = (u, sId, idx) => {
    const {bars} = this.state;
    const bar = bars[idx];
    if (idx !== this.prevTipIdx) {
      this.prevTipIdx = idx;
      const ts = moment.unix(this.bars[0][idx]);
      let innerHtml = [
        ts.format('MM/DD LTS'),
        `O: ${bar.o}`,
        `H: ${bar.h}`,
        `L: ${bar.l}`,
        `C: ${bar.c}`,
        `V: ${bar.v}`,
        // `V_OSC: ${bar.vol_osc.toFixed(3)}`,
        `VWAP: ${bar.vwap.toFixed(3)}`,
        `EMA: ${bar.ema && bar.ema.toFixed(3)}`,
        `MACD_DIFF: ${bar.macd_diff.toFixed(5)}`,
        `RSI: ${bar.rsi.toFixed(5)}`,
        `MIN_ATR: ${bar.min_atr.toFixed(4)}`,
        `SDEV: ${bar.vwap_sdev.toFixed(4)}`,
        // `SEC: ${bar.sec}`,
        // `SPY: ${bar.spy}`,
      ].join('</span><span>');
      this.legendEl.innerHTML = '<span>' + innerHtml + '</span>';
    }
    return(idx);
  }

  drawV = (u) => {
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
    // const osc = (- this.minOsc) / (this.maxOsc - this.minOsc) * (this.maxV - this.minV);
    // const oscY = u.valToPos(osc, "v", true);
    // const start0 = u.valToPos(iMin,  "x", true);
    // const end0 = u.valToPos(iMax,  "x", true);
    // u.ctx.strokeStyle = "#eee"
    // u.ctx.beginPath();
    // u.ctx.moveTo(start0, oscY);
    // u.ctx.lineTo(end0, oscY);
    // u.ctx.stroke();
  }
  
  drawMarkers = (u) => {
    const {
      init_c,
      break_even_price,
      entry_idx,
      exit_idx,
      stop_price,
      target_price,
      support_resists,
    } = this.state;
    if (entry_idx) {
      const [iMin, iMax] = u.series[0].idxs;
      const leftX = u.valToPos(iMin, 'x', true);
      const rightX = u.valToPos(iMax, 'x', true);
      if (support_resists && Object.keys(support_resists).length > 0) {
        u.ctx.strokeStyle = "red"
        u.ctx.beginPath();
        for (let levelName in support_resists) {
          const yPos = u.valToPos(support_resists[levelName], '$', true);
          u.ctx.moveTo(leftX, yPos);
          u.ctx.lineTo(rightX, yPos);
          u.ctx.stroke();
        }
      }
      const columnWidth = Math.round(u.bbox.width / (iMax - iMin) * 0.8);
      const centerX = u.valToPos(Math.floor(entry_idx), 'x', true) + columnWidth * (entry_idx % 1 - 0.5);
      u.ctx.fillStyle = "#eee"
      let exitX = u.valToPos(Math.floor(exit_idx), 'x', true) + columnWidth * (exit_idx % 1 - 0.5);
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
      u.ctx.fillStyle = "#eee"
      const botV = u.valToPos(0, "v", true) + 4;
      u.ctx.moveTo(centerX, botV);
      u.ctx.lineTo(centerX - 6, botV + 8);
      u.ctx.lineTo(centerX + 6, botV + 8);
      u.ctx.fill();
    }
  }

  fetch = (tgt = 'sym', step = 0, goDate = false) => {
    const {enqueueSnackbar} = this.props;
    const {allLineNum, symLineNum, strategy, sym, plFilter, dateStr} = this.state;
    const payload = {
      strategy,
      sym,
      plFilter,
      step,
    }
    if(goDate) {
      payload.goDate = dateStr;
    }
    if (tgt === 'sym') {
      payload.symLineNum = parseInt(symLineNum);
    } else {
      payload.allLineNum = parseInt(allLineNum);
    }
    apiGetBacktestCase(payload).then(resp => {
      if (resp.data.success) {
        const newStates = {
          ...resp.data.payload,
        }
        this.setState(newStates, this.assignBars);
      } else {
        enqueueSnackbar(resp.data.error, {variant: 'error'})
      }
    })
  }

  onSymPrev = () => {
    this.fetch('sym', -1);
  }

  onSymNext = () => {
    this.fetch('sym', 1);
  }

  mapSpy = (c) => {
    return (c - this.spyL) / (this.spyH - this.spyL) * (this.maxH - this.minL) + this.minL - this.spyShift;
  }

  mapSec = (c) => {
    return (c - this.secL) / (this.secH - this.secL) * (this.maxH - this.minL) + this.minL - this.secShift;
  }

  assignBars = () => {
    const {
      bars,
      entry_idx,
      begin_day_idx,
      strategy,
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
      [],    // vwap_up_boundary sec
      [],    // vwap_lower_boundary spy
      [],    // vwap_up_min
      [],    // vwap_down_min
      //[], // vol osc
    ]
    this.macdData = [
      [], //ts
      [], //macd
      [], //ema_9
      [], //diff
    ]
    this.rsiData = [
      [],
      [],
    ]
    // this.minL = null;
    // this.maxH = null;
    // this.spyL = null;
    // this.spyH = null;
    // this.secL = null;
    // this.secH = null;
    // this.maxV = bars[0].v;
    // this.minV = bars[0].v;
    // this.maxOsc = bars[0].vol_osc;
    // this.minOsc = bars[0].vol_osc;
    for(let idx in bars) {
      const bar = bars[idx];
      this.bars[0].push(bar.ts);
      this.bars[1].push(bar.v);
      this.bars[2].push(bar.o);
      this.bars[3].push(bar.h);
      this.bars[4].push(bar.l);
      this.bars[5].push(bar.c);
      this.bars[6].push(bar.vwap);
      this.bars[7].push(bar.ema);
      this.bars[8].push(bar.vwap + bar.vwap_sdev * 0.5);
      this.bars[9].push(bar.vwap - bar.vwap_sdev * 0.5);
      // this.bars[8].push(bar.vwap + bar.vwap_sdev * 0.5);
      // this.bars[9].push(bar.vwap - bar.vwap_sdev * 0.5);
      this.bars[10].push(bar.vwap + bar.min_atr);
      this.bars[11].push(bar.vwap - bar.min_atr);
      this.macdData[0].push(bar.ts);
      this.macdData[1].push(bar.macd);
      this.macdData[2].push(bar.macd_ema);
      this.macdData[3].push(bar.macd_diff);
      this.rsiData[0].push(bar.ts);
      this.rsiData[1].push(bar.rsi);
      // if (idx >= begin_day_idx && (idx < entry_idx || strategy === 'open_breakout')) {
      //   if (this.minL === null || this.minL > bar.l) {
      //     this.minL = bar.l;
      //   }
      //   if (this.maxH === null || this.maxH < bar.h) {
      //     this.maxH = bar.h;
      //   }
      //   if (this.spyL === null || this.spyL > bar.spy) {
      //     this.spyL = bar.spy;
      //   }
      //   if (this.spyH === null || this.spyH < bar.spy) {
      //     this.spyH = bar.spy;
      //   }
      //   if (this.secL === null || this.secL > bar.sec) {
      //     this.secL = bar.sec;
      //   }
      //   if (this.secH === null || this.secH < bar.sec) {
      //     this.secH = bar.sec;
      //   }
      // }
      // if (bar.v > this.maxV) {
      //   this.maxV = bar.v;
      // }
      // if (bar.v < this.minV) {
      //   this.minV = bar.v;
      // }
      // if (bar.vol_osc > this.maxOsc) {
      //   this.maxOsc = bar.vol_osc;
      // }
      // if (bar.vol_osc < this.minOsc) {
      //   this.minOsc = bar.vol_osc;
      // }
    }
    // this.spyShift = (bars[begin_day_idx].spy - this.spyL) / (this.spyH - this.spyL) * (this.maxH - this.minL) + this.minL - bars[begin_day_idx].o;
    // this.secShift = (bars[begin_day_idx].sec - this.secL) / (this.secH - this.secL) * (this.maxH - this.minL) + this.minL - bars[begin_day_idx].o;
    // for(let idx in bars) {
    //   const bar = bars[idx];
    //   let secV = this.mapSec(bar.sec);
    //   this.bars[8].push(secV);
    //   let spyV = this.mapSpy(bar.spy);
    //   this.bars[9].push(spyV);
      // const osc = (bar.vol_osc - this.minOsc) / (this.maxOsc - this.minOsc) * (this.maxV - this.minV);
      // this.bars[10].push(osc);
    //}

    if (this.u) {
      this.u.setData(this.bars);
    }
    if (this.macdU) {
      this.macdU.setData(this.macdData);
    }
    if (this.rsiU) {
      this.rsiU.setData(this.rsiData);
    }
    this.legendEl.innerHTML = '-';
  }

  handleChange = (field, e) => {
    this.setState({
      [field]: e.target.value,
    });
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
        this.setState({symLineNum: 0, allLineNum: 0});
      } else {
        enqueueSnackbar(resp.data.error, {variant: 'error'})
      }
    })
  }

  render() {
    const {classes} = this.props;
    const {
      symLineNum,
      allLineNum,
      time_frame,
      pl,
      sym,
      action,
      attrs,
      init_c,
      ema_true_range,
      sector,
      second_bar_density,
      strategy,
      stepSize,
      plFilter,
      showRsi,
      showMacd,
      dateStr,
      stop_price,
      selectMax,
      selectMin,
    } = this.state;
    return (
      <Grid container spacing={3}>
        <Grid item xs={12} md={12} lg={12}>
          <Paper ref={el => this.container = el} style={{position: 'relative', background: '#1E1E1E'}}>
            <div className={classes.oneChart} ref={el => this.chartEl = el} />
            <div className={classes.macdChart} style={{display: showMacd ? 'block' : 'none'}} ref={el => this.macdEl = el} />
            <div className={classes.rsiChart} style={{display: showRsi ? 'block' : 'none'}} ref={el => this.rsiEl = el} />
            <Typography variant="body2" className={classes.legendLabel} ref={el => this.legendEl = el}>
                MM/DD HH:MM:SS O: oo.oo H: hh.hh L: ll.ll C: cc.cc V: vvvvvv VWAP: cc.cc EMA cc.cc MACD_DIFF: cc.cc MACD_EMA9: cc.cc MACD: cc.cc
            </Typography>
            <Typography variant="body2" className={classes.srLabel} ref={el => this.srLevelEl = el}>
              sr_level
            </Typography>
            <div className={classes.priceTag} ref={el => this.priceTag = el}>
              <Typography style={{color: 'orange'}} ref={el => this.priceTagValue = el}>
                cc.cc
              </Typography>
            </div>
            <div className={classes.macdTag} style={{display: showMacd ? 'block' : 'none'}} ref={el => this.macdTag = el}>
              <Typography style={{color: 'orange'}} ref={el => this.macdTagValue = el}>
                cc.cc
              </Typography>
            </div>
            <div className={classes.rsiTag} style={{display: showRsi ? 'block' : 'none'}} ref={el => this.rsiTag = el}>
              <Typography style={{color: 'orange'}} ref={el => this.rsiTagValue = el}>
                cc.cc
              </Typography>
            </div>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3} lg={3}>
          <List component={Paper}>
            <ListItem>
              <ListItemText>
                <Button onClick={this.onResetNum}>RESTET NUM</Button>
                <Button onClick={this.onSymPrev}>{'< PREV'}</Button>
                <Button onClick={this.onSymNext}>{'NEXT >'}</Button>
              </ListItemText>
            </ListItem>
            <ListItem>
              <ListItemText>
                Line Number
              </ListItemText>
              <ListItemSecondaryAction>
                <TextField
                  value={symLineNum}
                  onChange={e => this.handleChange('symLineNum', e)}
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
              <ListItemText>Strategy</ListItemText>
              <ListItemSecondaryAction>
              <Select
                  value={strategy}
                  onChange={e => this.handleChange('strategy', e)}
                  autoWidth
                >
                  <MenuItem value="all">All</MenuItem>
                  {
                    Object.keys(StrategyDB).map(key => (
                      <MenuItem key={key} value={key}>{key}</MenuItem>
                    ))
                  }
                </Select>
              </ListItemSecondaryAction>
            </ListItem>
            <ListItem>
              <ListItemText>
                <Button onClick={() => this.fetch('all', 0, true)}>GOTO</Button>
              </ListItemText>
              <ListItemSecondaryAction>
                <TextField
                  type="date"
                  value={dateStr}
                  onChange={e => this.handleChange('dateStr', e)}
                />
              </ListItemSecondaryAction>
            </ListItem>
            <ListItem>
              <ListItemText>
                <Button href={`/second_pull_back?sym=${sym}&start_ts=${selectMin}&end_ts=${selectMax}`} target="_blank">SECOND BARS</Button>
              </ListItemText>
            </ListItem>
          </List>
        </Grid>
        <Grid item xs={12} md={3} lg={3}>
          <List component={Paper}>
            <ListItem>
              <ListItemText>
                <Button href={`/backtest?sym=${sector}&date=${dateStr}`} target="_blank">SECTOR</Button>
                <Button href={`/backtest?sym=SPY&date=${dateStr}`} target="_blank">SPY</Button>
              </ListItemText>
              <ListItemSecondaryAction>
                {sector}
              </ListItemSecondaryAction>
            </ListItem>
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
                stop_range
              </ListItemText>
              <ListItemSecondaryAction>
                {stop_price && (((stop_price - init_c) / init_c) * 100).toFixed(5)}%
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
                ema_true_range / 10
              </ListItemText>
              <ListItemSecondaryAction>
                {ema_true_range && ema_true_range.toFixed(6)}% {init_c && (init_c * ema_true_range * 0.01).toFixed(3)}
              </ListItemSecondaryAction>
            </ListItem>
            <ListItem>
              <ListItemText>
                second_bar_density
              </ListItemText>
              <ListItemSecondaryAction>
                {second_bar_density}
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
                    {`${attrs[k]}`}
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
                <Button onClick={() => this.fetch('all', -stepSize)}>PREV</Button>
                <Button onClick={() => this.fetch('all', stepSize)}>NEXT</Button>
              </ListItemText>
              <ListItemSecondaryAction>
                <TextField
                  value={allLineNum}
                  onChange={e => this.handleChange('allLineNum', e)}
                  inputProps={{
                    style: { textAlign: "right" }
                  }}
                  style = {{width: 80}}
                  onKeyPress={(ev) => {
                    if (ev.key === 'Enter') {
                      this.fetch('all')
                      ev.preventDefault();
                    }
                  }}
                />
              </ListItemSecondaryAction>
            </ListItem>
            <ListItem>
              <ListItemText>
                <ToggleButtonGroup
                    value={stepSize}
                    size="small"
                    exclusive
                    onChange={(e,v) => this.setState({stepSize: v})}
                  >
                    <ToggleButton value={1}>1</ToggleButton>
                    <ToggleButton value={10}>10</ToggleButton>
                    <ToggleButton value={25}>25</ToggleButton>
                    <ToggleButton value={100}>100</ToggleButton>
                  </ToggleButtonGroup>
              </ListItemText>
              <ListItemSecondaryAction>
                <ToggleButtonGroup
                  value={plFilter}
                  size="small"
                  exclusive
                  onChange={(e,v) => this.setState({plFilter: v})}
                >
                  <ToggleButton value="all">ALL</ToggleButton>
                  <ToggleButton value="win">WIN</ToggleButton>
                  <ToggleButton value="loss">LOSE</ToggleButton>
                </ToggleButtonGroup>
              </ListItemSecondaryAction>
            </ListItem>
            <ListItem>
              <ListItemText>
                PL
              </ListItemText>
              <ListItemSecondaryAction>
                {pl}
              </ListItemSecondaryAction>
            </ListItem>
            <ListItem>
              <ListItemText>
                <Button onClick={() => this.setState({showRsi: !showRsi})}>TOGGLE RSI</Button>
                <Button onClick={() => this.setState({showMacd: !showMacd})}>TOGGLE MACD</Button>
              </ListItemText>
            </ListItem>
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