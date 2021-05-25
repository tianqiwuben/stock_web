import React from 'react';
import compose from 'recompose/compose';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

import "../../../node_modules/uplot/dist/uPlot.min.css";

import uPlot from "uplot";


const plotOptions = {
  width: 800,
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

const drawBar = (u) => {
  const [iMin, iMax] = u.series[0].idxs;
  const columnWidth = Math.round(u.bbox.width / (iMax - iMin) * 0.8);
  for (let i = iMin; i <= iMax; i++) {
    let o = u.data[2][i];
    let h = u.data[3][i];
    let l = u.data[4][i];
    let c = u.data[5][i];
    let timeAsX = u.valToPos(i, "x", true);
    let bodyX = timeAsX - (columnWidth / 2);
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
        Math.round(columnWidth),
        Math.round(oPos - cPos),
      );
    } else if (c < o){
      u.ctx.fillStyle = "#ff5f5f";
      u.ctx.strokeStyle = "#ff5f5f";
      u.ctx.fillRect(
        Math.round(bodyX),
        Math.round(oPos),
        Math.round(columnWidth),
        Math.round(cPos - oPos),
      );
    } else {
      u.ctx.fillStyle = "#eee";
      u.ctx.strokeStyle = "#eee";
      u.ctx.fillRect(
        Math.round(bodyX),
        Math.round(oPos),
        Math.round(columnWidth),
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



const styles = theme => ({
  container: {
    position: 'relative',
    width: '100%',
    height: '100%',
  },
  priceTag: {
    position: 'absolute',
    right: 0,
    top: 0,
    visibility: 'hidden',
    padding: "4px 4px",
    background: '#333',
    pointerEvents: 'none',
  },
  
});


class BarChart extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    }
    this.bars = null;
    this.seriesCount = 6;
    this.levels = [];
    this.ext_times = [];
  }

  drawV = (u) => {
    const [iMin, iMax] = u.series[0].idxs;
    const columnWidth  = Math.round(u.bbox.width / (iMax - iMin) * 0.9);
    let vol0AsY = u.valToPos(0, "v", true);
    for (let i = iMin; i <= iMax; i++) {
      let vol = u.data[1][i];    
      let timeAsX = u.valToPos(i,  "x", true);
      let bodyX = timeAsX - (columnWidth / 2);
      let volAsY = u.valToPos(vol, "v", true);
      u.ctx.fillStyle = "#15618E"
      u.ctx.fillRect(
        Math.round(bodyX),
        Math.round(volAsY),
        Math.round(columnWidth),
        Math.round(vol0AsY - volAsY),
      );
    }
  }
  
  drawMarkers = (u) => {
    const [iMin, iMax] = u.series[0].idxs;
    if (this.ext_times && this.ext_times.length > 0) {
      const b = u.valToPos(0, "v", true);
      const columnWidth  = Math.round(u.bbox.width / (iMax - iMin)) / 2;
      for (let i = 0; i < this.ext_times.length; i += 2) {
        const l = u.valToPos(this.ext_times[i], 'x', true) - columnWidth;
        const r = u.valToPos(this.ext_times[i + 1], 'x', true) + columnWidth;
        u.ctx.fillStyle = "#444"
        u.ctx.fillRect(
          Math.round(l),
          Math.round(0),
          Math.round(r - l),
          Math.round(b),
        );
      }
    }
    const leftX = u.valToPos(iMin, 'x', true);
    const rightX = u.valToPos(iMax, 'x', true);
    if (this.levels && this.levels.length > 0) {
      u.ctx.setLineDash([]);
      for (let pair of this.levels) {
        u.ctx.strokeStyle = pair[2]
        u.ctx.beginPath();
        const yPos = u.valToPos(pair[1], '$', true);
        u.ctx.moveTo(leftX, yPos);
        u.ctx.lineTo(rightX, yPos);
        u.ctx.stroke();
      }
    }
  }


  componentDidMount() {
    const {width, height} = this.container.getBoundingClientRect();
    const opt = {
      ...plotOptions,
      width: width - 32,
      height: height - 48,
      cursor: {
        move: this.onCursorMove,
        // dataIdx: this.onCursorIdx,
      },
      hooks: {
        setSelect: [
          // this.onSelectDateRange,
        ]
      },
      plugins: [
        {
          hooks: {
            drawClear: this.drawMarkers,
          },
        },
        {
          hooks: {
            drawClear: this.drawV,
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
  }

  assignLevels = levels => {
    this.levels = levels;
    this.u.redraw();
  }
  
  assignBars = ({bars, lines, levels, ext_times}) => {
    if (this.seriesCount > 6) {
      for (let i = 6; i < this.seriesCount; i++) {
        this.u.delSeries(i);
      }
    }
    this.bars = [
      [],  //ts
      [],    // v
      [],    // o
      [],    // h
      [],    // l
      [],    // c
    ]
    if (lines) {
      for (const lineName in lines) {
        this.bars.push([]);
        this.u.addSeries(
          {
            scale: '$',
            label: lineName,
            side: 1,
            stroke: lines[lineName],
            size: 32,
            ticks: {
              show: false,
            },
            points: {
              show: false,
            },
          },
        )
      }
      this.seriesCount = 6 + Object.keys(lines).length;
    } else {
      this.seriesCount = 6;
    }
    for(let idx in bars) {
      const bar = bars[idx];
      this.bars[0].push(bar.ts);
      this.bars[1].push(bar.v);
      this.bars[2].push(bar.o);
      this.bars[3].push(bar.h);
      this.bars[4].push(bar.l);
      this.bars[5].push(bar.c);
      if (lines) {
        let sidx = 6;
        for (const lineName in lines) {
          this.bars[sidx].push(bar[lineName]);
          sidx += 1;
        }
      }
    }
    this.levels = levels;
    this.ext_times = ext_times;
    if (this.u) {
      this.u.setData(this.bars);
    }
  }
  

  onCursorMove = (u, l, t) => {
    if (this.priceTag) {
      this.priceTag.style.transform = `translate(0px, ${t}px)`;
    }
    if (l > 0 && t > 0) {
      this.priceTag.style.visibility = 'visible';
      const val = u.posToVal(t, '$');
      this.priceTagValue.innerHTML = val.toFixed(2);
      const {onPriceChange} = this.props;
      onPriceChange && onPriceChange(val);
    } else {
      this.priceTag.style.visibility = 'hidden';
    }
    return [l,t];
  }

  render() {
    const {
      classes,
    } = this.props;
    return (
      <div className={classes.container} ref={el => this.container = el}>
        <div className={classes.oneChart} ref={el => this.chartEl = el}/>
        <div className={classes.priceTag} ref={el => this.priceTag = el}>
          <Typography style={{color: 'orange'}} ref={el => this.priceTagValue = el}>
            cc.cc
          </Typography>
        </div>
      </div>
    );
  }
}


export default compose(
  withStyles(styles),
)(BarChart);