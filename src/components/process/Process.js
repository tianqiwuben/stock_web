import React from 'react';
import compose from 'recompose/compose';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';

import {connect} from 'react-redux';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TablePagination from '@material-ui/core/TablePagination';
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

import {apiGetProcesses, apiOptimizationProcessAction} from '../../utils/ApiFetch';
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

const COLOR = {
  ready_to_run: 'green',
  running: 'green',
  stopping: 'red',
  stopped: 'red',
  error: 'red',
  finished: '',
}

const STATUS = [
  "running",
  "ready_to_run",
  "error",
  "stopping",
  "stopped",
  "finished",
]

class Process extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      errorOpen: false,
      errorTrace: '',
    }
  }

  componentDidMount() {
    this.onFetch();
  }

  onFetch = (newPage = null) => {
    if (typeof newPage == Number && newPage <= 0) {
      return;
    }
    const {processPage, dispatchUpdateProcessPage} = this.props;
    const {
      sym,
      strategy,
      status,
      page,
    } = processPage;
    const fetchPage = newPage || page;
    apiGetProcesses({page: fetchPage, sym, strategy, status}).then(resp => {
      if (resp.data.success) {
        const {dispatchSaveProcess} = this.props;
        const ids = [];
        const processPayload = {};
        resp.data.payload.records.forEach(record => {
          ids.push(record.id);
          processPayload[record.id] = record;
        })
        dispatchSaveProcess(processPayload);
        dispatchUpdateProcessPage({
          ids,
          page: fetchPage,
          totalPage: resp.data.payload.total_pages,
          totalEntries: resp.data.payload.total_entries,
        })
      } else {
        const {enqueueSnackbar} = this.props;
        enqueueSnackbar(resp.data.error, {variant: 'error'})
      }
    })
  }

  doAction = (id, process_action) => {
    const {enqueueSnackbar} = this.props;
    const payload = {
      id,
      process_action,
    };
    apiOptimizationProcessAction(payload).then(resp => {
      if (resp.data.success) {
        enqueueSnackbar('Success')
        this.onFetch();
      } else {
        enqueueSnackbar(resp.data.error, {variant: 'error'})
      }
    })
  }

  onClickStatus = (id) => {
    const {process} = this.props;
    if (process[id].status === 'error') {
      this.setState({
        errorOpen: true,
        errorTrace: process[id].error_msg,
      })
    }
  }

  closeError = () => {
    this.setState({
      errorOpen: false,
    });
  }

  handleChange = (field, e) => {
    const {dispatchUpdateProcessPage} = this.props;
    dispatchUpdateProcessPage({[field]: e.target.value});
  }

  onReset = () => {
    const {dispatchResetProcessPage} = this.props;
    dispatchResetProcessPage();
  }

  handleChangePage = (e, p) => {
    console.log('wqt handleChangePage', p);
    this.onFetch(p + 1);
    
  }

  render() {
    const {classes, process, processPage} = this.props;
    const {
      errorOpen,
      errorTrace,
    } = this.state;
    const {
      ids,
      sym,
      status,
      strategy,
      page,
      totalEntries,
    } = processPage;
    const data = ids.map((id) => process[id]);
    return (
      <Grid container spacing={3}>
        <Grid item xs={12} md={12} lg={12}>
          <Paper className={classes.row}>
              <FormControl className={classes.formControl}>
                <TextField
                  label="Symbol"
                  value={sym}
                  onChange={e => this.handleChange('sym', e)}
                />
              </FormControl>
              <FormControl className={classes.formControl}>
                <InputLabel>Strategy</InputLabel>
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
              </FormControl>
              <FormControl className={classes.formControl}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={status}
                  onChange={e => this.handleChange('status', e)}
                  autoWidth
                >
                  <MenuItem value="all">All</MenuItem>
                  {
                    STATUS.map(key => (
                      <MenuItem key={key} value={key}>{key}</MenuItem>
                    ))
                  }
                </Select>
              </FormControl>
              <Button variant="contained" color="primary" onClick={() => this.onFetch(1)}>
                Fetch
              </Button>
              <Button variant="contained" onClick={() => this.onReset()}>
                Reset
              </Button>
          </Paper>
        </Grid>
        <Grid item xs={12} md={12} lg={12}>
          <TableContainer component={Paper}>
            <Table className={classes.table} size="small">
              <TableHead>
                <TableRow>
                  <TableCell>{'Sym & Strategy'}</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>{'PL & Hold'}</TableCell>
                  <TableCell>Progress</TableCell>
                  <TableCell>Heartbeat</TableCell>
                  <TableCell>StartedAt</TableCell>
                  <TableCell>FinishAt</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      <Link to={`/configs/${row.sym}?strategy=${row.strategy}`}>
                        {row.sym}
                        <br/>
                        {row.strategy}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <span style={{color: COLOR[row.status]}} onClick={() => {this.onClickStatus(row.id)}}>
                        {row.status}
                      </span>
                    </TableCell>
                    <TableCell>{row.max_profit}<br/>{row.hold_minutes}</TableCell>
                    <TableCell>
                      {`${row.completed_percent}%`}<br/>
                      {`${row.completed_iterations}/${row.total_iterations}`}
                    </TableCell>
                    <TableCell>{row.heartbeat_str}<br/>{row.heartbeat}</TableCell>
                    <TableCell>{row.started_at_str}<br/>{row.started_at}</TableCell>
                    <TableCell>{row.expected_finish_time_str}<br/>{row.expected_finish_time}</TableCell>
                    <TableCell>
                      <IconButton onClick={() => {this.doAction(row.id, 'stop')}}><PauseCircleOutlineIcon /></IconButton>
                      <IconButton onClick={() => {this.doAction(row.id, 'start')}}><PlayCircleOutlineIcon /></IconButton>
                      <IconButton onClick={() => {this.doAction(row.id, 'delete')}}><DeleteOutlineIcon /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[12]}
              count={totalEntries}
              rowsPerPage={12}
              page={page - 1}
              onChangePage={this.handleChangePage}
            />
          </TableContainer>
          <Dialog
            open={errorOpen}
            onClose={this.closeError}
            fullWidth
            maxWidth="lg"
          >
            <DialogContent>
              <TextField
                multiline
                value={errorTrace}
                fullWidth
              />
            </DialogContent>
          </Dialog>
        </Grid>
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
)(Process);