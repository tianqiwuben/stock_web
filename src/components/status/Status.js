import React from 'react';
import compose from 'recompose/compose';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';

import {connect} from 'react-redux';

import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import Paper from '@material-ui/core/Paper';
import FormControl from '@material-ui/core/FormControl';
import Grid from '@material-ui/core/Grid';
import Select from '@material-ui/core/Select';
import {StrategyDB} from '../common/Constants';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import IconButton from '@material-ui/core/IconButton';
import PlayCircleOutlineIcon from '@material-ui/icons/PlayCircleOutline';
import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline';
import PauseCircleOutlineIcon from '@material-ui/icons/PauseCircleOutline';
import Typography from '@material-ui/core/Typography';
import SymStatus from './SymStatus';
import Box from '@material-ui/core/Box';

import {apiResolverStatus, apiResolverCommand} from '../../utils/ApiFetch';
import { withSnackbar } from 'notistack';
import {saveProcess, resetProcessPage, updateProcessPage} from '../../redux/processActions';

import {
  Link,
} from "react-router-dom";

const styles = theme => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 60,
  },
  row: {
    '& > *': {
      margin: theme.spacing(1),
    },
  },
});


class Status extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      env: 'prod',
      bp: 0,
      aq: 0,
      pm: [],
      wk: [],
    }
  }

  componentDidMount() {
    this.onFetch();
  }

  onFetch = () => {
    const {enqueueSnackbar} = this.props;
    const {env} = this.state;
    apiResolverStatus({env}).then(resp => {
      if (resp.data.success) {
        if (resp.data.payload) {
          this.setState(resp.data.payload);
        }
      } else {
        enqueueSnackbar(resp.data.error, {variant: 'error'})
      }
    })
  }

  changeEnv = (e, env) => {
    this.setState({env}, this.onFetch);
  }

  render() {
    const {classes} = this.props;
    const {
      env,
      bp,
      aq,
      pm,
      wk,
    } = this.state;
    return (
      <Grid container spacing={3}>
        <Grid item xs={12} md={12} lg={12}>
          <Paper>
            <Box display="flex" flexDirection="row" alignItems="center" justifyContent="space-between">
              <ToggleButtonGroup
                size="small"
                value={env}
                exclusive
                onChange={this.changeEnv}
              >
                <ToggleButton value="prod">
                  PROD
                </ToggleButton>
                <ToggleButton value="paper">
                  PAPER
                </ToggleButton>
                <ToggleButton value="notifier">
                  NOTIFIER
                </ToggleButton>
                <ToggleButton value="test">
                  TEST
                </ToggleButton>
                <ToggleButton value="notifier_test">
                  NOTIFIER_TEST
                </ToggleButton>
              </ToggleButtonGroup>
              <Typography variant="body">
                {`buying_power: $${bp.toFixed(2)}`}
              </Typography>
              <Typography variant="body">
                {`available_quota: ${aq}`}
              </Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={12} lg={12}>
          <TableContainer component={Paper}>
            <Table className={classes.table} size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Sym</TableCell>
                  <TableCell>Strategy</TableCell>
                  <TableCell>Acc-Sym-Shares</TableCell>
                  <TableCell>Side</TableCell>
                  <TableCell>Action Ts</TableCell>
                  <TableCell>Cost</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {
                  pm.map(pos => (
                    <TableRow key={`${pos.sym}${pos.strategy}`}>
                      <TableCell>{pos.sym}</TableCell>
                      <TableCell>{pos.strategy}</TableCell>
                      <TableCell>{`${pos.acc_quota}-${pos.sym_quota}-${pos.shares}`}</TableCell>
                      <TableCell>{pos.action_str}</TableCell>
                      <TableCell>{pos.action_ts_str}</TableCell>
                      <TableCell>{pos.trade_price}</TableCell>
                    </TableRow>
                  ))
                }
                
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
        <SymStatus env={env}/>
      </Grid>
    );
  }
}

const mapStateToProps = state => ({
  process: state.process,
  processPage: state.processPage,
})


export default compose(
  withStyles(styles),
  connect(mapStateToProps, {
    dispatchSaveProcess: saveProcess,
    dispatchResetProcessPage: resetProcessPage,
    dispatchUpdateProcessPage: updateProcessPage
  }),
  withSnackbar
)(Status);