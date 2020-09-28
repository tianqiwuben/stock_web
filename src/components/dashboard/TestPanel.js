import React from 'react';
import compose from 'recompose/compose';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Select from '@material-ui/core/Select';
import {connect} from 'react-redux';
import moment from 'moment';

import FormControl from '@material-ui/core/FormControl';
import {registerComponent, StrategyDB} from '../common/Constants';
import {updateProgress} from '../../redux/progressActions';

import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import {apiTestConfig} from '../../utils/ApiFetch';
import { withSnackbar } from 'notistack';

const styles = theme => ({
  content: {
    maxWidth: 620,
  },
  formControl: {
    margin: theme.spacing(1),
    width: 170,
  },
  longForm: {
    margin: theme.spacing(1),
    width: 220,
  },
  secondForm: {
    margin: theme.spacing(1),
    width: 70,
  },
  row: {
    '& > *': {
      margin: theme.spacing(1),
    },
  },
});


class TestPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sym: 'ALL_SYMBOLS',
      open: false,
      strategy: 'all',
      startTime: '',
      endTime: '',
      second: '',
    }
  }

  handleChange = (field, e) => {
    this.setState({[field]: e.target.value});
  }

  componentDidMount(){
    registerComponent('testPanel', this);
    this.onToday();
  }

  componentWillUnmount(){
    registerComponent('testPanel', null);
  }

  onClose = () => {
    this.setState({open: false});
  }

  popWithOptions = (options) => {
    this.setState({...options, open: true});
  }

  onStart = () => {
    const {
      sym,
      strategy,
      startTime,
      endTime,
      second,
    } = this.state;
    const {
      enqueueSnackbar,
      dispatchUpdateProgress,
    } = this.props
    const payload = {
      strategy,
      startTime,
      endTime,
      second,
      syms: sym,
    }
    apiTestConfig(payload).then(resp => {
      if(resp.data && resp.data.success) {
        enqueueSnackbar(`${sym.substring(0,14)} Test Start`);
      } else {
        enqueueSnackbar(resp.data.error, {variant: 'error'});
      }
      dispatchUpdateProgress(`test_${sym}_${strategy}`, null);
    })
  }

  onToday = () => {
    const now = moment();
    now.set('hour', 6);
    now.set('minute', 20);
    const st = now.format('YYYY-MM-DDTHH:mm');
    now.set('hour', 13).set('minute', 5);
    const ed = now.format('YYYY-MM-DDTHH:mm');
    this.setState({startTime: st, endTime: ed});
  }

  render() {
    const {classes} = this.props;
    const {
      sym,
      strategy,
      open,
      startTime,
      endTime,
      second,
    } = this.state;
    if (!open) {
      return null;
    }
    return (
      <Dialog open onClose={this.onClose} maxWidth="md">
        <DialogContent className={classes.content}>
          <DialogContentText>Config Test/Simulation</DialogContentText>
          <FormControl className={classes.formControl}>
            <TextField label="Sym" value={sym} onChange={e => this.handleChange('sym', e)} />
          </FormControl>
          <FormControl className={classes.formControl}>
            <InputLabel>Strategy</InputLabel>
            <Select
              value={strategy}
              onChange={e => this.handleChange('strategy', e)}
            >
              <MenuItem value="all">All</MenuItem>
              {
                Object.keys(StrategyDB).map(key => (
                  <MenuItem key={key} value={key}>{key}</MenuItem>
                ))
              }
            </Select>
          </FormControl>
          <FormControl className={classes.longForm}>
            <TextField
              label="Start Time"
              type="datetime-local"
              value={startTime}
              InputLabelProps={{
                shrink: true,
              }}
              onChange={e => this.handleChange('startTime', e)}
            />
          </FormControl>
          <FormControl className={classes.longForm}>
            <TextField
              label="End Time"
              type="datetime-local"
              value={endTime}
              InputLabelProps={{
                shrink: true,
              }}
              onChange={e => this.handleChange('endTime', e)}
            />
          </FormControl>
          <FormControl className={classes.secondForm}>
            <TextField
              label="Second"
              value={second}
              onChange={e => this.handleChange('second', e)}
            />
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={this.onToday}>
            Today
          </Button>
          <Button onClick={this.onClose} color="secondary">
            Cancel
          </Button>
          <Button onClick={this.onStart} color="primary">
            Start
          </Button>
        </DialogActions>
      </Dialog>
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
    dispatchUpdateProgress: updateProgress,
  }),
  withSnackbar
)(TestPanel);