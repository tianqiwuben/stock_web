import React from 'react';
import compose from 'recompose/compose';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import Switch from '@material-ui/core/Switch';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Dialog from '@material-ui/core/Dialog';

import Divider from '@material-ui/core/Divider';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import { withSnackbar } from 'notistack';
import {connect} from 'react-redux';
import Select from '@material-ui/core/Select';
import {StrategyDB} from '../common/Constants';
import MenuItem from '@material-ui/core/MenuItem';
import {
  apiGetStrategy,
  apiGenerateStrategy,
  apiSaveStrategy,
  apiCopyStrategy2Prod,
  apiGetStrategyHis,
  apiGetHisRecord,
} from '../../utils/ApiFetch';

import uPlot from "uplot";

const styles = theme => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
});


const plotOptions = {
  width: 800,
  height: window.innerHeight * 0.6,
  legend: {
    show: true,
  },
  scales: {
    "x": {
      time: false,
    }
  },
  series: [
    {},
    {
      scale: 'l',
      stroke: '#eee',
      width: 2,
      ticks: {
        show: false,
      },
      points: {
        show: false,
      },
    },
    {
      scale: 'r',
      label: 'pl',
      stroke: '#00FFFF',
      width: 4,
      ticks: {
        show: false,
      },
      points: {
        show: false,
      },
    },
    {
      scale: 'avg',
      label: 'left_avg',
      stroke: 'orange',
      ticks: {
        show: false,
      },
      points: {
        show: false,
      },
    },
    {
      scale: 'avg',
      label: 'right_avg',
      stroke: 'pink',
      ticks: {
        show: false,
      },
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
      scale: 'l',
      stroke: '#eee',
      side: 3,
      ticks: {
        show: false,
      },
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
    },
    {
      scale: 'avg',
      show: false,
      side: 3,
      ticks: {
        show: false,
      },
    },
  ],
}


class TuneConfig extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      doFilter: true,
      strategy: 'open_breakout',
      fields: {},
      selectedField: 'sector',
      configs: {},
      viewSelection: {},
      env: 'test',
      list: [],
      stats: {},
      minAttr: '',
      maxAttr: '',
      backup: '',
      backupList: [],
      showBackup: false,
    }
    this.data = null;
    this.resultList = [];
    this.booleanTable = {};
  }

  componentDidMount() {
    const {width} = this.container.getBoundingClientRect();
    const opt = {
      ...plotOptions,
      width: width - 32,
    }
    this.u = new uPlot(opt, this.data, this.chartEl);
    this.fetch();
  }

  componentWillUnmount() {
    if (this.u) {
      this.u.destroy();
      this.u = null;
    }
  }

  fetch = () => {
    const {enqueueSnackbar} = this.props;
    const {
      strategy,
      viewSelection,
      env,
    } = this.state;
    const payload = {env}
    if (strategy === 'open_breakout') {
      payload.spy_category = viewSelection.spy_category || '0';
      payload.sym_category = viewSelection.sym_category || '0';
    }
    apiGetStrategy(strategy, payload).then(resp => {
      if (resp.data.success) {
        this.setState(resp.data.payload, this.assignData);
      } else {
        enqueueSnackbar(resp.data.error, {variant: 'error'})
      }
    })
  }

  onSave = (backup = null) => {
    const {enqueueSnackbar} = this.props;
    const {
      strategy,
      configs,
      env,
      viewSelection,
    } = this.state;
    const payload = {
      env,
      configs,
      strategy,
      backup,
    }
    if (strategy === 'open_breakout') {
      payload.spy_category = viewSelection.spy_category || '0';
      payload.sym_category = viewSelection.sym_category || '0';
    }
    apiSaveStrategy(payload).then(resp => {
      if (resp.data.success) {
        enqueueSnackbar('Save success', {variant: 'success'})
      } else {
        enqueueSnackbar(resp.data.error, {variant: 'error'})
      }
    })
  }

  copy2prod = () => {
    const {enqueueSnackbar} = this.props;
    const {
      strategy,
    } = this.state;
    const payload = {
      strategy,
    }
    apiCopyStrategy2Prod(payload).then(resp => {
      if (resp.data.success) {
        enqueueSnackbar('Copy success', {variant: 'success'})
      } else {
        enqueueSnackbar(resp.data.error, {variant: 'error'})
      }
    })
    
  }

  assignData = () => {
    const {list, header, configs, fields, doFilter} = this.state;
    this.resultList = [];
    for (let row of list) {
      let rowPass = true;
      if (doFilter) {
        for (let field in configs) {
          const column = header.indexOf(field);
          if (column >= 0) {
            const value = row[column];
            if (fields[field].type === 'boolean') {
              if (configs[field].indexOf(value) !== -1) {
                rowPass = false;
                break;
              }
            } else if (fields[field].type === 'range') {
              if (configs[field].max && value > configs[field].max) {
                rowPass = false;
                break;
              }
              if (configs[field].min && value < configs[field].min) {
                rowPass = false;
                break;
              }
            }
          }
        }
      }
      if (rowPass) {
        this.resultList.push(row);
      }
    }
    this.sortShowData();
  }

  sortShowData = () => {
    const {enqueueSnackbar} = this.props;
    if (this.resultList.length < 2) {
      enqueueSnackbar('No records found', {variant: 'error'});
      return;
    }
    const {selectedField, header, fields} = this.state;
    const column = header.indexOf(selectedField);
    this.resultList.sort((a,b) => (a[column] - b[column]));
    if (fields[selectedField].type === 'boolean') {
      this.booleanTable = {};
      fields[selectedField].options.forEach(option => {
        this.booleanTable[option] = {
          w: 0,
          l: 0,
          pl: 0,
          avgPl: 0,
          wRate: 0,
        }
      })
    }
    this.data = [[],[],[],[],[]]
    let idx = 0;
    let aggPl = 0;
    let win = 0;
    let loss = 0;
    let minPl = null;
    let maxPl = null;
    let minId = null;
    let maxId = null;
    let rid = 0;
    this.resultList.forEach(row => {
      this.data[0].push(idx);
      const pl = row[row.length - 1];
      idx += 1;
      this.data[1].push(row[column]);
      aggPl += pl;
      this.data[2].push(aggPl);
      this.data[3].push(aggPl / idx);
      if (pl > 0) {
        win += 1;
      } else {
        loss += 1;
      }
      if (fields[selectedField].type === 'boolean') {
        const tbl = this.booleanTable[row[column]];
        if (tbl) {
          if (pl > 0) {
            tbl.w += 1;
          } else {
            tbl.l += 1;
          }
          tbl.pl += pl;
        }
      }
      if (minPl === null || minPl > aggPl) {
        minPl = aggPl;
        minId = rid;
      }
      if (maxPl === null || maxPl < aggPl) {
        maxPl = aggPl;
        maxId = rid;
      }
      rid += 1;
    })
    if (fields[selectedField].type === 'boolean') {
      fields[selectedField].options.forEach(option => {
        if (this.booleanTable[option].w + this.booleanTable[option].l > 0) {
          this.booleanTable[option].avgPl = (this.booleanTable[option].pl / (this.booleanTable[option].w + this.booleanTable[option].l)).toFixed(2);
          this.booleanTable[option].wRate = (this.booleanTable[option].w / (this.booleanTable[option].w + this.booleanTable[option].l) * 100).toFixed(2);
          this.booleanTable[option].pl = this.booleanTable[option].pl.toFixed(2);
        }
      })
    }
    let rightAgg = 0;
    for(let i = idx - 1; i >= 0 ; i --) {
      const row = this.resultList[i];
      rightAgg += row[row.length - 1];
      this.data[4].unshift(rightAgg / (idx - i));
    }
    this.u.setData(this.data);
    this.setState({
      minAttr: minId === 0 ? null : this.resultList[minId][column],
      maxAttr: maxId === this.resultList.length - 1 ? null : this.resultList[maxId][column],
      stats: {
        aggPl: aggPl.toFixed(2),
        avgPl: (aggPl / idx).toFixed(2),
        win,
        loss,
        winRate: (win / (win + loss) * 100).toFixed(2),
      }
    })
  }

  onGenerate = () => {
    const {enqueueSnackbar} = this.props;
    const {
      strategy,
      viewSelection,
    } = this.state;
    const payload = {strategy}
    if (strategy === 'open_breakout') {
      payload.spy_category = viewSelection.spy_category || '0';
      payload.sym_category = viewSelection.sym_category || '0';
    }
    apiGenerateStrategy(payload).then(resp => {
      if (resp.data.success) {
        enqueueSnackbar('Generation Complete', {variant: 'success'})
        this.fetch();
      } else {
        enqueueSnackbar(resp.data.error, {variant: 'error'})
      }
    })
  }

  onSelectField = (field) => {
    this.setState({selectedField: field}, this.sortShowData);
  }

  handleChange = (field, e) => {
    this.setState({
      [field]: e.target.value,
    });
  }

  handleViewSelection = (field, v) => {
    const {viewSelection} = this.state;
    const newViewSelection = {...viewSelection, [field]: v};
    this.setState({viewSelection: newViewSelection});
  }

  onChangeBoolean = (field, key) => {
    const {configs} = this.state;
    const newConfig = {...configs};
    if (!newConfig[field]) {
      newConfig[field] = [];
    }
    const index = newConfig[field].indexOf(key);
    if (index === -1) {
      newConfig[field].push(key);
    } else {
      newConfig[field].splice(index, 1);
    }
    newConfig[field].sort();
    if (newConfig[field].length === 0) {
      delete newConfig[field];
    }
    this.setState({configs: newConfig}, this.assignData);
  }

  onChangeRange = (field, type, value) => {
    const {configs} = this.state;
    const newConfig = {...configs};
    if(newConfig[field]) {
      newConfig[field][type] = value;
    } else {
      newConfig[field] = {[type]: value};
    }
    this.setState({configs: newConfig});
  }

  onApplyRange = () => {
    const {configs, selectedField} = this.state;
    const newConfig = {...configs};
    if (newConfig[selectedField]) {
      if (newConfig[selectedField].max) {
        newConfig[selectedField].max = parseFloat(newConfig[selectedField].max);
      }
      if (newConfig[selectedField].min) {
        newConfig[selectedField].min = parseFloat(newConfig[selectedField].min);
      }
    }
    this.setState({configs: newConfig}, this.assignData);
  }

  onResetAll = () => {
    this.setState({configs: {}}, this.assignData);
  }

  onAutoAll = () => {
    const {fields, configs, header} = this.state;
    const newConfigs = {...configs};
    let doAuto = true;
    let loopCount = 0;
    while(doAuto) {
      doAuto = false;
      loopCount +=1 ;
      for(let field in fields) {
        if (fields[field].type === 'range' && !fields[field].disable_auto) {
          const column = header.indexOf(field);
          this.resultList.sort((a,b) => (a[column] - b[column]));
          let minPl = null;
          let maxPl = null;
          let aggPl = 0;
          let minId = null;
          let maxId = null;
          let rid = 0;
          this.resultList.forEach(row => {
            aggPl += row[row.length - 1];
            if (minPl === null || minPl > aggPl) {
              minPl = aggPl;
              minId = rid;
            }
            if (maxPl === null || maxPl < aggPl) {
              maxPl = aggPl;
              maxId = rid;
            }
            rid += 1;
          })
          const minAttr = minId === 0 ? null : this.resultList[minId][column];
          const maxAttr = maxId === this.resultList.length - 1 ? null : this.resultList[maxId][column];
          if (minAttr || maxAttr) {
            if (loopCount < 5) {
              doAuto = true;
            }
            if(!newConfigs[field]) {
              newConfigs[field] = {};
            }
            if (minAttr) {
              newConfigs[field].min = minAttr;
            }
            if (maxAttr) {
              newConfigs[field].max = maxAttr;
            }
            const newList = [];
            for (let row of this.resultList) {
              let rowPass = true;
              const value = row[column];
              if (newConfigs[field].max && value > newConfigs[field].max) {
                rowPass = false;
              }
              if (newConfigs[field].min && value < newConfigs[field].min) {
                rowPass = false;
              }
              if (rowPass) {
                newList.push(row);
              }
            }
            this.resultList = newList;
          }
        }
      }
    }
    this.setState({configs: newConfigs}, this.assignData);
  }

  onResetRange = () => {
    const {configs, selectedField} = this.state;
    const newConfig = {...configs};
    delete newConfig[selectedField];
    this.setState({configs: newConfig}, this.assignData);
  }

  onUseCalc = () => {
    const {configs, selectedField, minAttr, maxAttr} = this.state;
    const newConfig = {...configs};
    if (!newConfig[selectedField] ) {
      newConfig[selectedField] = {};
    }
    if (minAttr) {
      newConfig[selectedField].min = minAttr;
    }
    if (maxAttr) {
      newConfig[selectedField].max = maxAttr;
    }
    this.setState({configs: newConfig}, this.assignData);
  }

  getBooleanValue = (field, key) => {    
    const {configs} = this.state;
    const newConfig = {...configs};
    if (newConfig[field] && newConfig[field].indexOf(key) !== -1) {
      return false;
    }
    return true;
  }

  changeEnv = (e, v) => {
    this.setState({env: v});
  }

  changeFilter = (e, v) => {
    this.setState({doFilter: v}, this.assignData);
  }

  onSelectBackup = (id) => {
    const {enqueueSnackbar} = this.props;
    const {
      strategy,
      viewSelection,
      env,
    } = this.state;
    const payload = {env, strategy, id};
    if (strategy === 'open_breakout') {
      payload.spy_category = viewSelection.spy_category || '0';
      payload.sym_category = viewSelection.sym_category || '0';
    }
    apiGetHisRecord(payload).then(resp => {
      if (resp.data.success) {
        this.setState({showBackup: false, ...resp.data.payload}, this.assignData);
      } else {
        enqueueSnackbar(resp.data.error, {variant: 'error'})
      }
    })
  }

  onLoadBackup = () => {
    const {enqueueSnackbar} = this.props;
    const {
      strategy,
    } = this.state;
    const payload = {strategy};
    apiGetStrategyHis(payload).then(resp => {
      if (resp.data.success) {
        this.setState({backupList: resp.data.payload, showBackup: true});
      } else {
        enqueueSnackbar(resp.data.error, {variant: 'error'})
      }
    })
  }

  render() {
    const {classes} = this.props;
    const {
      doFilter,
      strategy,
      fields,
      selectedField,
      configs,
      viewSelection,
      env,
      list,
      stats,
      minAttr,
      maxAttr,
      backup,
      showBackup,
      backupList,
    } = this.state;
    const fieldConfig = fields[selectedField];
    return (
      <Grid container spacing={3}>
        <Grid item xs={2} md={2} lg={2}>
          <List component={Paper}>
            <ListItem>
              <ListItemText>Strategy</ListItemText>
              <ListItemSecondaryAction>
                <Select
                  value={strategy}
                  onChange={e => this.handleChange('strategy', e)}
                  autoWidth
                >
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
                <ToggleButtonGroup
                  value={env}
                  size="small"
                  exclusive
                  onChange={this.changeEnv}
                >
                  <ToggleButton value={'prod'}>PROD</ToggleButton>
                  <ToggleButton value={'test'}>TEST</ToggleButton>
                </ToggleButtonGroup>
              </ListItemText>
              <ListItemSecondaryAction>
                <ToggleButtonGroup
                  value={doFilter}
                  size="small"
                  exclusive
                  onChange={this.changeFilter}
                >
                  <ToggleButton value={true}>FILTERED</ToggleButton>
                  <ToggleButton value={false}>ORIGIN</ToggleButton>
                </ToggleButtonGroup>
              </ListItemSecondaryAction>
            </ListItem>
            <Divider />
            {
              Object.keys(fields).map(field => (
                <ListItem
                  button
                  key={field}
                  selected={selectedField === field}
                  onClick={() => this.onSelectField(field)}
                >
                  <ListItemText>
                    {field}
                  </ListItemText>
                  <ListItemSecondaryAction>
                    {configs[field] && JSON.stringify(configs[field]).substring(0,16)}
                    {viewSelection[field]}
                  </ListItemSecondaryAction>
                </ListItem>
              ))
            }
          </List>
        </Grid>
        <Grid item xs={10} md={10} lg={10}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={12} lg={12}>
              <Paper ref={el => this.container = el}>
                <div className={classes.oneChart} ref={el => this.chartEl = el} />
              </Paper>
            </Grid>
            {
              fieldConfig && fieldConfig.type === 'boolean' &&
                <Grid item xs={6} md={6} lg={6}>
                  <TableContainer component={Paper}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>{selectedField}</TableCell>
                          <TableCell>PL</TableCell>
                          <TableCell>AvgPl</TableCell>
                          <TableCell>W/L</TableCell>
                          <TableCell>W rate</TableCell>
                          <TableCell>Action</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {fieldConfig.options.map(key => (
                          <TableRow key={key}>
                            <TableCell>{key}</TableCell>
                            <TableCell>{this.booleanTable[key] && this.booleanTable[key].pl}</TableCell>
                            <TableCell>{this.booleanTable[key] && this.booleanTable[key].avgPl}</TableCell>
                            <TableCell>{this.booleanTable[key] && `${this.booleanTable[key].w}/${this.booleanTable[key].l}`}</TableCell>
                            <TableCell>{this.booleanTable[key] && this.booleanTable[key].wRate}%</TableCell>
                            <TableCell>
                              <Switch
                                checked={this.getBooleanValue(selectedField, key)}
                                color="primary"
                                onChange={() => {
                                  this.onChangeBoolean(selectedField, key);
                                }}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
            }
            {
              fieldConfig && fieldConfig.type === 'category' &&
                <Grid item xs={4} md={4} lg={4}>
                  <List component={Paper}>
                    <ListItem>
                      <ListItemText>
                        {selectedField}
                      </ListItemText>
                      <ListItemSecondaryAction>
                        <ToggleButtonGroup
                          value={viewSelection[selectedField]}
                          exclusive
                          onChange={(e, v) => this.handleViewSelection(selectedField, v)}
                        >
                          {
                            fieldConfig.options.map(key => (
                              <ToggleButton key={key} value={key}>{key}</ToggleButton>
                            ))
                          }
                        </ToggleButtonGroup>
                      </ListItemSecondaryAction>
                    </ListItem>
                    <ListItem>
                      <ListItemText>
                        <Button onClick={() => this.fetch()}>FETCH</Button>
                        <Button onClick={this.onGenerate}>Generate</Button>
                      </ListItemText>
                      <ListItemSecondaryAction>
                        <Button onClick={this.onResetAll}>RESET</Button>
                        <Button onClick={this.onAutoAll}>AUTO</Button>
                      </ListItemSecondaryAction>
                    </ListItem>
                    <ListItem>
                      <ListItemText>
                        <Button onClick={this.onLoadBackup}>LOAD</Button>
                        <Button onClick={() => this.onSave(backup)}>BACKUP</Button>
                        <ListItemSecondaryAction>
                          <TextField
                            value={backup}
                            onChange={(e) => this.handleChange('backup', e)}
                          />
                        </ListItemSecondaryAction>
                      </ListItemText>
                    </ListItem>
                  </List>
                </Grid>
            }
            {
              fieldConfig && fieldConfig.type === 'range' &&
                <Grid item xs={4} md={4} lg={4}>
                  <List component={Paper}>
                    <ListItem>
                      <ListItemText>
                        Min {typeof minAttr == 'number' ? minAttr.toFixed(6) : minAttr}
                      </ListItemText>
                      <ListItemSecondaryAction>
                        <TextField
                          value={(configs[selectedField] && configs[selectedField].min) || ''}
                          onChange={(e) => this.onChangeRange(selectedField, 'min', e.target.value)}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                    <ListItem>
                      <ListItemText>
                        Max {typeof maxAttr == 'number' ? maxAttr.toFixed(6) : maxAttr}
                      </ListItemText>
                      <ListItemSecondaryAction>
                        <TextField
                          value={(configs[selectedField] && configs[selectedField].max) || ''}
                          onChange={(e) => this.onChangeRange(selectedField, 'max', e.target.value)}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                    <ListItem>
                      <ListItemText>
                        <Button color="primary" onClick={this.onUseCalc}>USE</Button>
                        <Button color="primary" onClick={this.onApplyRange}>MODIFY</Button>
                        <Button onClick={this.onResetRange}>RESET</Button>
                      </ListItemText>
                    </ListItem>
                  </List>
                </Grid>
            }
            <Grid item xs={4} md={4} lg={4}>
              <List component={Paper}>
                <ListItem>
                  <ListItemText>
                    Count
                  </ListItemText>
                  <ListItemSecondaryAction>
                    {`${this.resultList.length} / ${list.length} (${(this.resultList.length / list.length * 100).toFixed(2)}%)`}
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemText>
                    PL agg/avg
                  </ListItemText>
                  <ListItemSecondaryAction>
                    {`$${stats.aggPl} / $${stats.avgPl}`}
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemText>
                    Win / Loss
                  </ListItemText>
                  <ListItemSecondaryAction>
                    {`${stats.win} / ${stats.loss} (${stats.winRate}%)`}
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemText>
                    <Button color="primary" onClick={() => this.onSave()}>SAVE</Button>
                  </ListItemText>
                  <ListItemSecondaryAction>
                    <Button color="primary" onClick={this.copy2prod}>COPY 2 PROD</Button>
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
            </Grid>
          </Grid>
        </Grid>

        <Dialog open={showBackup} onClose={() => {this.setState({showBackup: false})}}>
          <List style={{width: 600}}>
            {
              backupList.map((back) => (
                <ListItem
                  key={back.id} 
                  button
                  onClick={() => this.onSelectBackup(back.id)}
                >
                  <ListItemText>
                    {back.memo}
                  </ListItemText>
                  <ListItemSecondaryAction>
                    {back.createdAt}
                  </ListItemSecondaryAction>
                </ListItem>
              ))
            }
          </List>
        </Dialog>
      </Grid>
    );
  }
}


export default compose(
  withStyles(styles),
  connect(null),
  withSnackbar,
)(TuneConfig);