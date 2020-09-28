import React from 'react';
import compose from 'recompose/compose';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';

import {connect} from 'react-redux';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Paper from '@material-ui/core/Paper';
import FormControl from '@material-ui/core/FormControl';
import Grid from '@material-ui/core/Grid';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import {apiGetList, apiUpdateList, apiStreamingListAction} from '../../utils/ApiFetch';
import ListSubheader from '@material-ui/core/ListSubheader';
import { withSnackbar } from 'notistack';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
const styles = theme => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 60,
  },
});

class StreamList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sym: '',
      data: [],
    }
  }

  handleChange = (e) => {
    this.setState({
      sym: e.target.value.toUpperCase(),
    })
  }

  componentDidMount() {
    this.onFetch();
  }

  onFetch = () => {
    const {list_name} = this.props;
    apiGetList({list_name}).then(resp => {
      const {enqueueSnackbar} = this.props;
      if (resp.data.success) {
        this.setState({data: resp.data.payload});
      } else {
        enqueueSnackbar(`Load ${list_name} ERROR: ${resp.data.error}`, {variant: 'error'});
      }
    })
  }

  onUpdateList = (action, newSym = null) => {
    const {list_name} = this.props;
    const {sym} = this.state;
    const payload = {
      list_name,
      sym: action === 'add' ? sym : newSym,
      list_action: action,
    }
    apiUpdateList(payload).then(resp => {
      const {enqueueSnackbar} = this.props;
      if (resp.data.success) {
        this.setState({data: resp.data.payload});
        enqueueSnackbar(`${action} Success`, {variant: 'success'});
      } else {
        enqueueSnackbar(`ERROR: ${resp.data.error}`, {variant: 'error'});
      }
    })
  }

  saveToRedis = () => {
    const payload = {
      perform_action: 'save_to_redis',
    };
    apiStreamingListAction(payload).then(resp => {
      const {enqueueSnackbar} = this.props;
      if (resp.data.success) {
        enqueueSnackbar(`save_to_redis Success`, {variant: 'success'});
      } else {
        enqueueSnackbar(`ERROR: ${resp.data.error}`, {variant: 'error'});
      }
    })
  }

  render() {
    const {classes, list_name} = this.props;
    const {
      sym,
      data,
    } = this.state;
    const displayData = [];
    let matchCount = 0;
    for (let i in data) {
      const row = data[i];
      if (sym.length === 0 || row.startsWith(sym)) {
        if (displayData.length < 8) {
          displayData.push(row);
        }
        matchCount += 1;
      }
    }
    return (
      <Grid item xs={12} md={6} lg={4}>
        <Paper>
          <List subheader={<ListSubheader>{list_name}</ListSubheader>}>
            <ListItem>
              <ListItemText primary="Symbol" />
              <ListItemSecondaryAction>
                <Button onClick={() => this.onUpdateList('add')} color="primary">ADD</Button>
                <FormControl className={classes.formControl}>
                  <TextField
                    value={sym}
                    onChange={this.handleChange}
                  />
                </FormControl>
              </ListItemSecondaryAction>
            </ListItem>
            {
              displayData.map(row => (
                <ListItem key={row}>
                  <ListItemText primary={row} />
                  <ListItemSecondaryAction>
                    <IconButton onClick={() => this.onUpdateList('delete', row)}>
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))
            }
            <ListItem>
              <ListItemText primary={`Total ${matchCount}`} />
              <ListItemSecondaryAction>
                <Button onClick={this.saveToRedis}>SAVE REDIS</Button>
              </ListItemSecondaryAction>
            </ListItem>
          </List>
        </Paper>
      </Grid>
    );
  }
}

const mapStateToProps = state => ({
})


export default compose(
  withStyles(styles),
  connect(mapStateToProps),
  withSnackbar
)(StreamList);