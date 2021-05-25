import React from 'react';
import compose from 'recompose/compose';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Switch from '@material-ui/core/Switch';
import List from '@material-ui/core/List';
import ListSubheader from '@material-ui/core/ListSubheader';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Pagination from '@material-ui/lab/Pagination';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import CloseIcon from '@material-ui/icons/Close';
import IconButton from '@material-ui/core/IconButton';
import Box from '@material-ui/core/Box';

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
  apiFetchTopPlayers,
  apiTopPlayerBars,
  apiPostTopPlayer,
  apiGetTopPlayerSR,
} from '../../utils/ApiFetch';

import BarChart from '../common/BarChart';

const styles = theme => ({
});

class TopPlayer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      allSyms: [['loading', []]],
      currentDateIdx: 0,
      listIdx: 0,
      chartSym: null,
      timeframe: 2,
      showToday: 'always',
      cursorType: '-',
      anchorPrice: null,
      priceLabel: "",
      levels: [],
      configs: {enabled: false, srs: []},
      preMkt: "",
      manualSR: "",
    }
    this.currentPrice = null;
    this.minData = {};
  }

  componentDidMount() {
    apiFetchTopPlayers().then(resp => {
      this.setState({
        allSyms: resp.data.payload,
        currentDateIdx: 0,
      }, () => {
        this.onSelectSym(resp.data.payload[0][1][0][0]);
      });
    })
  }

  onFetchMin = () => {
    const {chartSym, currentDateIdx, allSyms, timeframe} = this.state;
    apiTopPlayerBars({
      sym: chartSym,
      date: allSyms[currentDateIdx][0],
      agg: timeframe,
    }).then(resp => {
      this.minData = resp.data.payload;
      this.setState({
        preMkt: this.minData.prev_mkt_price_vol,
      })
      this.assignMin();
    });
    this.currentPrice = null;
  }

  assignMin = () => {
    const {showToday, levels} = this.state;
    if (showToday !== 'no' || !this.minData.today_start) {
      this.barChart.assignBars({
        bars: this.minData.bars,
        lines: {vwap: '#FF66FF'},
        ext_times: this.minData.ext_times,
        levels,
      });
    } else {
      const bars = [];
      for (let i = 0 ; i < this.minData.bars.length; i++) {
        if (i < this.minData.today_start) {
          bars.push(this.minData.bars[i])
        }
      }
      this.barChart.assignBars({
        bars: bars,
        lines: {vwap: '#FF66FF'},
        ext_times: this.minData.ext_times,
        levels,
      });
    }
  }

  onSelectSym = (sym) => {
    const {currentDateIdx, allSyms, showToday} = this.state;
    this.setState({
      chartSym: sym,
      showToday: showToday === 'always' ? 'always' : 'no',
    });
    const date = allSyms[currentDateIdx][0];
    apiGetTopPlayerSR({
      sym,
      date,
    }).then(resp => {
      this.setState({
        configs: JSON.parse(resp.data.payload.configs),
        levels: resp.data.payload.levels,
      })
      this.onFetchMin();
      apiTopPlayerBars({
        sym: sym,
        date,
        agg: 'day',
      }).then(resp => {
        const {levels} = this.state;
        this.dayChart.assignBars({
          bars: resp.data.payload.bars,
          levels,
        });
      });
    })
  }

  onChangeDate = (e, page) => {
    this.setState({
      currentDateIdx: page - 1,
    })
  }

  onChangeTimeFrame = (e,v) => {
    if (v) {
      this.setState({
        timeframe: v,
      }, this.onFetchMin);
    }
  }

  onPriceChange = (price) => {
    if (price) {
      this.currentPrice = price;
      const {cursorType, anchorPrice} = this.state;
      if (cursorType === '%') {
        if (anchorPrice) {
          const pct = (price - anchorPrice) / anchorPrice * 100;
          this.setState({
            priceLabel: `${anchorPrice.toFixed(3)} - ${price.toFixed(2)} (${pct.toFixed(2)}%)`
          })
        }
      }
    }
  }

  onClickChart = () => {
    const {cursorType, anchorPrice} = this.state;
    if (cursorType === '%') {
      if (anchorPrice) {
        this.setState({anchorPrice: null});
      } else {
        this.setState({anchorPrice: this.currentPrice});
      }
    } else if (cursorType === '$') {
      const {configs} = this.state;
      configs.srs.push({
        p: Math.round(this.currentPrice * 1000) / 1000,
      });
      configs.srs.sort((a,b) => a.p - b.p);
      this.postTopPlayer(configs);
    }
  }

  onAddManualSR = () => {
    const {manualSR,configs} = this.state;
    configs.srs.push({
      p: parseFloat(manualSR),
    });
    configs.srs.sort((a,b) => a.p - b.p);
    this.postTopPlayer(configs);
    this.setState({manualSR: ""})
  }

  onRemoveSR = (sr) => {
    const {configs} = this.state;
    const index = configs.srs.indexOf(sr);
    if (index !== -1) {
      configs.srs.splice(index, 1);
    }
    this.postTopPlayer(configs);
    
  }

  onChangeToday = (e, v) => {
    if (v) {
      this.setState({
        showToday: v,
      }, this.assignMin);
    }
  }

  onChangeCursor = (e, v) => {
    if (v) {
      this.setState({
        cursorType: v,
      });
    }
  }

  onChangeConfig = (field, v) => {
    const {configs} = this.state;
    if (field === 'enabled') {
      configs.enabled = !configs.enabled;
    }
    this.postTopPlayer(configs);
  }

  postTopPlayer = configs => {
    const {chartSym, allSyms, currentDateIdx} = this.state;
    const query = {
      sym: chartSym,
      date: allSyms[currentDateIdx][0],
      configs,
    }
    apiPostTopPlayer(query).then(resp => {
      this.setState({
        configs: JSON.parse(resp.data.payload.configs),
        levels: resp.data.payload.levels,
      });
      this.barChart.assignLevels(resp.data.payload.levels);
      this.dayChart.assignLevels(resp.data.payload.levels);

    })
  }

  render() {
    const {classes} = this.props;
    const {
      allSyms,
      currentDateIdx,
      chartSym,
      timeframe,
      showToday,
      cursorType,
      priceLabel,
      configs,
      preMkt,
      manualSR,
    } = this.state;
    const dateInfo = allSyms[currentDateIdx];
    return (
      <Grid container spacing={3}>
        <Grid item xs={10} >
          <Grid container>
            <Grid item xs={12}  component={Paper} style={{background: '#1E1E1E'}}>
              <div style={{height: '45vh'}} onClick={this.onClickChart}>
                <BarChart ref={r => this.barChart = r} onPriceChange={this.onPriceChange}/>
              </div>
            </Grid>
            <Grid item xs={8} component={Paper} style={{background: '#1E1E1E'}}>
              <div style={{height: '30vh'}} onClick={this.onClickChart}>
                <BarChart ref={r => this.dayChart = r} onPriceChange={this.onPriceChange}/>
              </div>
            </Grid>
            <Grid item xs={4} component={Paper}>
              <List>
                <ListItem>
                  <ListItemText primary="Time Frame" />
                  <ListItemSecondaryAction>
                    <ToggleButtonGroup
                      value={timeframe}
                      exclusive
                      size="small"
                      onChange={this.onChangeTimeFrame}
                    >
                      <ToggleButton value={1}>1</ToggleButton>
                      <ToggleButton value={2}>2</ToggleButton>
                      <ToggleButton value={5}>5</ToggleButton>
                      <ToggleButton value={15}>15</ToggleButton>
                    </ToggleButtonGroup>
                  </ListItemSecondaryAction>
                </ListItem>

                <ListItem>
                  <ListItemText primary="Show Today" />
                  <ListItemSecondaryAction>
                    <ToggleButtonGroup
                      value={showToday}
                      exclusive
                      onChange={this.onChangeToday}
                      size="small"
                    >
                      <ToggleButton value="yes">YES</ToggleButton>
                      <ToggleButton value="no">NO</ToggleButton>
                      <ToggleButton value="always">ALWAYS</ToggleButton>
                    </ToggleButtonGroup>
                  </ListItemSecondaryAction>
                </ListItem>

                <ListItem>
                  <ListItemText primary="Cursor Type" />
                  <ListItemSecondaryAction>
                    {priceLabel}
                    &nbsp;
                    <ToggleButtonGroup
                      value={cursorType}
                      exclusive
                      onChange={this.onChangeCursor}
                      size="small"
                    >
                      <ToggleButton value="-">&nbsp;-&nbsp;</ToggleButton>
                      <ToggleButton value="%">&nbsp;%&nbsp;</ToggleButton>
                      <ToggleButton value="$">&nbsp;$&nbsp;</ToggleButton>
                    </ToggleButtonGroup>
                  </ListItemSecondaryAction>
                </ListItem>

                <ListItem>
                  <ListItemText primary="Enable" />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={configs.enabled}
                      onChange={e => this.onChangeConfig('enabled')}
                    />
                  </ListItemSecondaryAction>
                </ListItem>

                <ListItem>
                  <ListItemText primary="Support Resist" />
                  <ListItemSecondaryAction>
                    <TextField
                      value={manualSR}
                      onChange={e => this.setState({manualSR: e.target.value})}
                      onKeyPress={(ev) => {
                        if (ev.key === 'Enter') {
                          this.onAddManualSR();
                          ev.preventDefault();
                        }
                      }}
                    />
                  </ListItemSecondaryAction>
                </ListItem>

              </List>
              <GridList cellHeight={48}>
                {
                  configs.srs.map(sr => (
                    <GridListTile key={sr.p}>
                      <Box display="flex" justifyContent="space-around" alignItems="center">
                        <Typography variant="body1">{sr.p}</Typography>
                        <IconButton onClick={() => this.onRemoveSR(sr)}>
                          <CloseIcon />
                        </IconButton>
                      </Box>
                    </GridListTile>
                  ))
                }
              </GridList>

            </Grid>
          </Grid>
          <Grid item xs={8} component={Paper}>
            <GridList cellHeight={48} cols={4}>
              <GridListTile>
                <Box display="flex" justifyContent="space-around" alignItems="center" paddingTop="12px">
                  <Typography variant="body1">PRE MKT</Typography>
                  <Typography variant="body1">{preMkt}</Typography>
                </Box>
              </GridListTile>
            </GridList>
          </Grid>
        </Grid>
        <Grid item xs={2}>
          <List dense component={Paper}>
            <ListSubheader>
              {dateInfo[0]}
            </ListSubheader>
            {
              dateInfo[1].map(item => (
                <ListItem
                  key={item[0]}
                  onClick={() => this.onSelectSym(item[0])}
                  selected={chartSym===item[0]}
                >
                  <ListItemText primary={item[0]} />
                  <ListItemSecondaryAction>{item[1]}%</ListItemSecondaryAction>
                </ListItem>
              ))
            }
            <Pagination
              size="small"
              count={allSyms.length}
              page={currentDateIdx + 1}
              onChange={this.onChangeDate}
            />
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
)(TopPlayer);