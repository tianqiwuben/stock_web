import React from 'react';
import compose from 'recompose/compose';
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListSubheader from '@material-ui/core/ListSubheader';
import {connect} from 'react-redux';
import { withSnackbar } from 'notistack';
import {SymList} from '../common/Constants';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

import {apiBulkAssignQuota} from '../../utils/ApiFetch';

const useStyles = theme => ({
});

class BulkAssignQuota extends React.Component {
  constructor(props) {
    super(props);
    this.state = ({
      list: 'OPTION_LIST',
      new_only: true,
      priority: '100',
      quota: '1000',
      updateCount: null,
      is_prod: false,
    })
  }

  handleChange = (field, e) => {
    this.setState({[field]: e.target.value});
  }

  onUpdate = () => {
    const {list, priority, quota, new_only, is_prod} = this.state;
    const payload = {list, quota, priority, new_only, is_prod};
    this.setState({
      updateCount: null,
    })
    apiBulkAssignQuota(payload).then(resp => {
      const {enqueueSnackbar} = this.props;
      if (resp.data.success) {
        this.setState({
          updateCount: resp.data.payload.update_count,
        })
      } else {
        enqueueSnackbar(`Bulk assign result ERROR: ${resp.data.error}`, {variant: 'error'});
      }
    });
  }

  render() {
    const {
      list,
      quota,
      priority,
      new_only,
      updateCount,
      is_prod,
    } = this.state;
    return (
      <Grid item sm={12} md={6} lg={4}>
        <Paper>
            <List subheader={<ListSubheader>Assign Quota (paper only)</ListSubheader>}>
            <ListItem>
              <ListItemText>
                List
              </ListItemText>
              <ListItemSecondaryAction>
                <Select
                  value={list}
                  onChange={e => this.handleChange('list', e)}
                  autoWidth
                >
                  {
                    SymList.map(key => (
                      <MenuItem key={key} value={key}>{key}</MenuItem>
                    ))
                  }
                </Select>
              </ListItemSecondaryAction>
            </ListItem>
            <ListItem>
              <ListItemText>
                Quota
              </ListItemText>
              <ListItemSecondaryAction>
                <TextField
                  value={quota}
                  onChange={e => this.handleChange('quota', e)}
                  inputProps={{
                    style: { textAlign: "right" }
                  }}
                  style = {{width: 80}}
                />
              </ListItemSecondaryAction>
            </ListItem>
            <ListItem>
              <ListItemText>
                Priority
              </ListItemText>
              <ListItemSecondaryAction>
                <TextField
                  value={priority}
                  onChange={e => this.handleChange('priority', e)}
                  inputProps={{
                    style: { textAlign: "right" }
                  }}
                  style = {{width: 80}}
                />
              </ListItemSecondaryAction>
            </ListItem>
            <ListItem>
              <ListItemText>
                New Only
              </ListItemText>
              <ListItemSecondaryAction>
                <Select
                  value={new_only}
                  onChange={e => this.handleChange('new_only', e)}
                  autoWidth
                >
                  <MenuItem value={true}>YES</MenuItem>
                  <MenuItem value={false}>NO</MenuItem>
                </Select>
              </ListItemSecondaryAction>
            </ListItem>
            <ListItem>
              <ListItemText>
                Production
              </ListItemText>
              <ListItemSecondaryAction>
                <Select
                  value={is_prod}
                  onChange={e => this.handleChange('is_prod', e)}
                  autoWidth
                >
                  <MenuItem value={true}>TRUE</MenuItem>
                  <MenuItem value={false}>FALSE</MenuItem>
                </Select>
              </ListItemSecondaryAction>
            </ListItem>
            <ListItem>
              <ListItemText>
                <Button onClick={this.onUpdate} color="primary">
                  Update
                </Button>
              </ListItemText>
              <ListItemSecondaryAction>
                {updateCount}
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
  withStyles(useStyles),
  connect(mapStateToProps, {
  }),
  withSnackbar,
)(BulkAssignQuota);