import React from 'react';
import compose from 'recompose/compose';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';

import ButtonGroup from '@material-ui/core/ButtonGroup';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import {apiGetProcesses, apiOptimizationProcessAction} from '../../utils/ApiFetch';
import { withSnackbar } from 'notistack';

import {
  Link,
} from "react-router-dom";

const styles = theme => ({
  
});

const COLOR = {
  ready_to_run: 'green',
  running: 'green',
  stopping: 'red',
  stopped: 'red',
  finished: '',
}

class Process extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      total_pages: 1,
      current_page: 1,
    }
  }

  componentDidMount() {
    this.onFetch();
  }

  onFetch = (page = 1) => {
    if (page <= 0) {
      return;
    }
    apiGetProcesses({page}).then(resp => {
      if (resp.data.success) {
        this.setState({
          total_pages: resp.data.payload.total_pages,
          data: resp.data.payload.records,
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

  render() {
    const {classes} = this.props;
    const {
      data,
      total_pages,
      current_page,
    } = this.state;
    return (
      <TableContainer component={Paper}>
        <Table className={classes.table}>
          <TableHead>
            <TableRow>
              <TableCell>Sym</TableCell>
              <TableCell>Strategy</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Max PL</TableCell>
              <TableCell>Hold</TableCell>
              <TableCell>Progress</TableCell>
              <TableCell>HeartbeAt</TableCell>
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
                  </Link>
                </TableCell>
                <TableCell>{row.strategy}</TableCell>
                <TableCell>
                  <span style={{color: COLOR[row.status]}}>{row.status}</span>
                </TableCell>
                <TableCell>{row.max_profit}</TableCell>
                <TableCell>{row.hold_minutes}</TableCell>
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
    );
  }
}


export default compose(
  withStyles(styles),
  withSnackbar
)(Process);