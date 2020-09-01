import React from 'react';
import compose from 'recompose/compose';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';

import {connect} from 'react-redux';

import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import {registerComponent} from '../common/Constants';

import {apiResolverCommand} from '../../utils/ApiFetch';
import { withSnackbar } from 'notistack';
import {saveProcess, resetProcessPage, updateProcessPage} from '../../redux/processActions';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';


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


class SymStatus extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sym: '',
      last_bar: null,
      strategies: [],
      sym_props: null,
    }
  }

  handleChange = e => {
    this.setState({sym: e.target.value.toUpperCase()});
  }

  componentDidMount(){
    const {setRef} = this.props;
    setRef(this);
    registerComponent('SymStatus', this);
  }

  componentWillUnmount(){
    const {setRef} = this.props;
    setRef(null);
    registerComponent('SymStatus', null);
  }

  onSelectSym = (sym) => {
    this.setState({sym}, this.onFetch);
  }

  onFetch = () => {
    const {enqueueSnackbar} = this.props;
    const {env} = this.props;
    const {sym} = this.state;
    const payload = {
      env,
      command: {
        cmd: 'sym_status',
        sym,
      }
    }
    apiResolverCommand(payload).then(resp => {
      if (!resp.data.success) {
        enqueueSnackbar(resp.data.error, {variant: 'error'})
      }
    })
  }

  onStatusPush = (payload) => {
    const {env} = this.props;
    const {sym} = this.state;
    if (env === payload.env && sym === payload.sym) {
      this.setState(payload);
    }
  }

  render() {
    const {classes} = this.props;
    const {
      sym,
      strategies,
    } = this.state;
    return (
      <React.Fragment>
        <Grid item xs={12} md={4} lg={4}>
          <Paper>
            <List>
              <ListItem>
                <ListItemText>Symbol</ListItemText>
                <ListItemSecondaryAction>
                  <Button color="primary" onClick={this.onFetch}>
                    Fetch
                  </Button>
                  <TextField
                    value={sym}
                    onChange={this.handleChange}
                    inputProps={{
                      style: { textAlign: "right" }
                    }}
                    style = {{width: 80}}
                    onKeyPress={(ev) => {
                      if (ev.key === 'Enter') {
                        this.onFetch();
                        ev.preventDefault();
                      }
                    }}
                  />
                </ListItemSecondaryAction>
              </ListItem>
            </List>
          </Paper>
        </Grid>
        {
          strategies.map(stra => (
            <Grid item xs={12} md={4} lg={4} key={stra.name}>
              <Paper>
                <List>
                  <ListItem>
                    <ListItemText>Strategy Name</ListItemText>
                    <ListItemSecondaryAction>
                      {stra.name}
                    </ListItemSecondaryAction>
                  </ListItem>
                  <ListItem>
                    <ListItemText>Status</ListItemText>
                    <ListItemSecondaryAction>
                      {stra.status}
                    </ListItemSecondaryAction>
                  </ListItem>
                  <ListItem>
                    <ListItemText>Priority</ListItemText>
                    <ListItemSecondaryAction>
                      {stra.priority}
                    </ListItemSecondaryAction>
                  </ListItem>
                  {
                    Object.keys(stra.store).map(k => (
                      <ListItem key={k}>
                        <ListItemText>{k}</ListItemText>
                        <ListItemSecondaryAction>
                          {JSON.stringify(stra.store[k]).substring(0, 32)}
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))
                  }
                </List>
              </Paper>
            </Grid>
          ))
        }
      </React.Fragment>
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
)(SymStatus);