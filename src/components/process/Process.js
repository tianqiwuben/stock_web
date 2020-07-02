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
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import Paper from '@material-ui/core/Paper';
import FormControl from '@material-ui/core/FormControl';
import Grid from '@material-ui/core/Grid';
import Select from '@material-ui/core/Select';
import StrategyDB from '../common/StrategyDB';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import {apiGetProcesses, apiOptimizationProcessAction} from '../../utils/ApiFetch';
import { withSnackbar } from 'notistack';
import {saveProcess} from '../../redux/processActions';

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
      ids: [],
      total_pages: 1,
      current_page: 1,
      errorOpen: false,
      errorTrace: '',
      sym: '',
      strategy: 'all',
      status: 'all',
    }
  }

  componentDidMount() {
    this.onFetch();
  }

  onFetch = (page = 1) => {
    if (page <= 0) {
      return;
    }
    const {
      sym,
      strategy,
      status,
    }  =this.state;
    apiGetProcesses({page, sym, strategy, status}).then(resp => {
      if (resp.data.success) {
        const {dispatchSaveProcess} = this.props;
        const ids = [];
        resp.data.payload.records.forEach(record => {
          ids.push(record.id);
          dispatchSaveProcess(record.id, record);
        })
        this.setState({
          ids,
          total_pages: resp.data.payload.total_pages,
          current_page: page,
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
        const {
          current_page,
        } = this.state;
        this.onFetch(current_page);
      } else {
        enqueueSnackbar(resp.data.error, {variant: 'error'})
      }
    })
  }

  onClickStatus = (id) => {
    const {data} = this.state;
    for (let i in data) {
      if (data[i].id === id) {
        if (data[i].status === 'error') {
          this.setState({
            errorOpen: true,
            errorTrace: data[i].error_msg,
          })
        }
      }
    }
  }

  closeError = () => {
    this.setState({
      errorOpen: false,
    });
  }

  handleChange = (field, e) => {
    this.setState({
      [field]: e.target.value,
    });
  }

  render() {
    const {classes, process} = this.props;
    const {
      ids,
      errorOpen,
      errorTrace,
      sym,
      status,
      strategy,
    } = this.state;
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
              <Button variant="contained" color="primary" onClick={() => this.onFetch()}>
                Fetch
              </Button>
          </Paper>
        </Grid>
        <Grid item xs={12} md={12} lg={12}>
          <TableContainer component={Paper}>
            <Table className={classes.table}>
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
                      <ButtonGroup variant="text">
                        <Button onClick={() => {this.doAction(row.id, 'stop')}}>STOP</Button>
                        <Button onClick={() => {this.doAction(row.id, 'start')}}>RUN</Button>
                        <Button onClick={() => {this.doAction(row.id, 'delete')}}>DEL</Button>
                      </ButtonGroup>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
})


export default compose(
  withStyles(styles),
  connect(mapStateToProps, {
    dispatchSaveProcess: saveProcess,
  }),
  withSnackbar
)(Process);