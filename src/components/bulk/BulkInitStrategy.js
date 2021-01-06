import React from 'react';
import compose from 'recompose/compose';
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListSubheader from '@material-ui/core/ListSubheader';
import {connect} from 'react-redux';
import { withSnackbar } from 'notistack';
import TextField from '@material-ui/core/TextField';


import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import {StrategyDB, SymList} from '../common/Constants';

import {apiBulkInitStrategy} from '../../utils/ApiFetch';

const useStyles = theme => ({
});

class BulkInitStrategy extends React.Component {
  constructor(props) {
    super(props);
    this.state = ({
      list: 'ALL_SYMBOLS',
      strategy: 'momentum',
      priority: '100',
      enabled: true,
      new_only: true,
      update_count: null,
      is_prod: false,
      cap_size: null,
    })
  }

  handleChange = (field, e) => {
    this.setState({[field]: e.target.value});
  }

  onStart = () => {
    const {list, strategy, priority, enabled, is_prod, new_only, cap_size} = this.state;
    const payload = {list, strategy, new_only, priority, enabled, is_prod, cap_size};
    this.setState({update_count: null});
    apiBulkInitStrategy(payload).then(resp => {
      const {enqueueSnackbar} = this.props;
      if (resp.data.success) {
        this.setState({
          update_count: resp.data.payload.update_count,
        })
      } else {
        enqueueSnackbar(`BulkInitStrategy ERROR: ${resp.data.error}`, {variant: 'error'});
      }
    });
  }

  render() {
    const {
      list,
      strategy,
      new_only,
      update_count,
      is_prod,
      priority,
      enabled,
      cap_size,
    } = this.state;
    return (
      <Grid item sm={12} md={6} lg={4}>
        <Paper>
            <List subheader={<ListSubheader>Config Strategy Priority</ListSubheader>}>
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
                Strategy
              </ListItemText>
              <ListItemSecondaryAction>
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
                Enabled
              </ListItemText>
              <ListItemSecondaryAction>
                <Select
                  value={enabled}
                  onChange={e => this.handleChange('enabled', e)}
                  autoWidth
                >
                  <MenuItem value={true}>YES</MenuItem>
                  <MenuItem value={false}>NO</MenuItem>
                </Select>
              </ListItemSecondaryAction>
            </ListItem>
            <ListItem>
              <ListItemText>
                CAP size
              </ListItemText>
              <ListItemSecondaryAction>
                <Select
                  value={cap_size}
                  onChange={e => this.handleChange('cap_size', e)}
                  autoWidth
                >
                  <MenuItem value={'large'}>LARGE</MenuItem>
                  <MenuItem value={'mid'}>MID</MenuItem>
                  <MenuItem value={'small'}>SMALL</MenuItem>
                </Select>
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
                <Button onClick={this.onStart} color="primary">
                  Start
                </Button>
              </ListItemText>
              <ListItemSecondaryAction>
                {update_count}
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
)(BulkInitStrategy);