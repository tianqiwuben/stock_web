import React from 'react';
import compose from 'recompose/compose';
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import {connect} from 'react-redux';
import {StrategyDB, getComponent} from '../common/Constants';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { withSnackbar } from 'notistack';
import Remark from '../common/Remark';
import FormControl from '@material-ui/core/FormControl';
import Box from '@material-ui/core/Box';
import TextField from '@material-ui/core/TextField';
import ProgressWithLabel from '../common/ProgressWithLabel';

import {
  Link,
} from "react-router-dom";

import {apiOptimizationApply} from '../../utils/ApiFetch';

const useStyles = theme => ({
  wrapper: {
    position: 'relative',
    display: 'inline',
  },
  buttonProgress: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12,
  },
  formControl: {
    margin: theme.spacing(1),
    width: '360px',
  },
});

class StrategyTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      openDialog: false,
      dialogInput: '',
      editStrategy: '',
    }
  }

  saveConfig = (id, env) => {
    apiOptimizationApply(id, {button_action: env}).then(resp => {
      if(resp.data.success) {
        const {onFetchConfigs} = this.props;
        onFetchConfigs();
      }
    });
  }

  prepareData = () => {
    const {allConfigs, displayEnv} = this.props;
    const data = [];
    for(let key in StrategyDB) {
      const item = {key, prod: '-', test: '-', pl: '', hold: ''};
      if (allConfigs[key] && allConfigs[key].enabled === 1 && typeof allConfigs[key].priority === 'number') {
        item.prod = allConfigs[key].priority;
      }
      if (allConfigs[key + '_test'] && allConfigs[key + '_test'].enabled === 1 && typeof allConfigs[key + '_test'].priority === 'number') {
        item.test = allConfigs[key + '_test'].priority;
      }
      if (allConfigs[key + '_optimization']) {
        const profit = allConfigs[key + '_optimization'].priority;
        if (profit) {
          item.pl = profit.toFixed(3) + '%';
        }
        const hold = allConfigs[key + '_optimization'].enabled;
        if (hold) {
          item.hold = (hold / 60).toFixed(1);
        }
      }
      data.push(item);
    }
    data.sort((a, b) => {
      let aP = a.test;
      let bP = b.test;
      if (displayEnv === 'prod') {
        aP = a.prod;
        bP = b.prod;
      }
      if (aP === '-' && bP === '-') {
        return 0;
      }
      if (aP === '-') {
        return 1;
      }
      if (bP === '-') {
        return -1;
      }
      return aP - bP;
    })
    return data;
  }

  onChangePriority = (key) => {
    const {enqueueSnackbar, allConfigs} = this.props;
    if (!allConfigs[key]) {
      enqueueSnackbar(`No ${key} found, please save one first`, {variant: 'error'});
      return;
    }
    this.setState({
      dialogInput: allConfigs[key].priority,
      openDialog: true,
      editStrategy: key,
    })
  }

  closeDialog = () => {
    this.setState({openDialog: false});
  }

  onChangeDialogInput = (e) => {
    this.setState({dialogInput: e.target.value})
  }

  saveDialog = () => {
    const {editStrategy, dialogInput} = this.state;
    const {onChangeConfig, allConfigs} = this.props;
    const payload = {
      configs: {
        [editStrategy]: {
          enabled: 1,
          priority: dialogInput,
          attrs: allConfigs[editStrategy].attrs,
        }
      }
    };
    onChangeConfig(payload);
    this.setState({
      openDialog: false,
    })
  }

  disablePriority = () => {
    const {editStrategy} = this.state;
    const {onChangeConfig, allConfigs} = this.props;
    const payload = {
      configs: {
        [editStrategy]: {
          enabled: 0,
          priority: allConfigs[editStrategy].priority,
          attrs: allConfigs[editStrategy].attrs,
        }
      }
    };
    onChangeConfig(payload);
    this.setState({
      openDialog: false,
    })
  }

  onSimulate = () => {
    const tp = getComponent('testPanel');
    if (tp) {
      const {sym} = this.props;
      tp.popWithOptions({
        sym,
        mode: 'simulate',
      })
    }
  }

  render() {
    const {
      classes,
      changeStrategy,
      strategy,
      sym,
      progress,
    } = this.props;
    const {
      openDialog,
      dialogInput,
      editStrategy,
    } = this.state;
    const data = this.prepareData();
    const progressValue = progress[`test_${sym}_`];

    return (
      <Grid item sm={12} md={6} lg={6}>
        <TableContainer component={Paper}>
          <Table className={classes.table} size="small">
            <TableHead>
              <TableRow>
                <TableCell>Strategy</TableCell>
                <TableCell>Prod Priority</TableCell>
                <TableCell>Test Priority</TableCell>
                <TableCell>P/L %</TableCell>
                <TableCell>Hold Min</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {
                data.map(row => (
                  <TableRow key={row.key} selected={strategy===row.key}>
                    <TableCell>
                      <span onClick={() => changeStrategy(row.key)}>{row.key}</span>
                    </TableCell>
                    <TableCell>
                      <span onClick={() => this.onChangePriority(row.key)}>{row.prod}</span>
                    </TableCell>
                    <TableCell>
                      <span onClick={() => this.onChangePriority(row.key + '_test')}>{row.test}</span>
                    </TableCell>
                    <TableCell>{row.pl}</TableCell>
                    <TableCell>{row.hold}</TableCell>
                  </TableRow>
                ))
              }
            </TableBody>
          </Table>
          <Box display="flex" flexDirection="row" alignItems="flex-start" justifyContent="space-between">
            <FormControl className={classes.formControl}>
              <Remark sym={sym} remarkKey="strategyTable" />
            </FormControl>
            <Box display="flex" flexDirection="row" alignItems="center" style={{margin: 10}} justifyContent="flex-end">
              {progressValue && <ProgressWithLabel value={progressValue} />}
              <Button color="primary" onClick={this.onSimulate}>
                Simulate
              </Button>
              <Link to={`/transactions?sym=${sym}&strategy=all&trade_env=test`} >
                <Button>
                  Trans
                </Button>
              </Link>
            </Box>
          </Box>
        </TableContainer>
        <Dialog open={openDialog} onClose={this.closeDialog}>
          <DialogTitle >{editStrategy}</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              label="Priority (0 means highest)"
              fullWidth
              value={dialogInput}
              onChange={this.onChangeDialogInput}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={this.disablePriority} color="secondary">
              DISABLE
            </Button>
            <Button onClick={this.closeDialog} color="primary">
              Cancel
            </Button>
            <Button onClick={this.saveDialog} color="primary">
              SAVE
            </Button>
          </DialogActions>
        </Dialog>
      </Grid>
    );
  }
}

const mapStateToProps = state => ({
  sym: state.configs.sym,
  strategy: state.configs.strategy,
  displayEnv: state.configs.displayEnv,
  allConfigs: state.configs,
  progress: state.progress,
})

export default compose(
  withStyles(useStyles),
  connect(mapStateToProps),
  withSnackbar,
)(StrategyTable);