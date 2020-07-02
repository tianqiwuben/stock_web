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

import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import {StrategyDB, SymList} from '../common/Constants';

import {apiBulkOptimizations} from '../../utils/ApiFetch';

const useStyles = theme => ({
});

class BulkOptimization extends React.Component {
  constructor(props) {
    super(props);
    this.state = ({
      list: 'OPTION_LIST',
      strategy: 'one_stage_long_trailing',
      new_only: true,
      startCount: null,
    })
  }

  handleChange = (field, e) => {
    this.setState({[field]: e.target.value});
  }

  onStart = () => {
    const {list, strategy, new_only} = this.state;
    const payload = {list, strategy, new_only};
    this.setState({startCount: null});
    apiBulkOptimizations(payload).then(resp => {
      const {enqueueSnackbar} = this.props;
      if (resp.data.success) {
        this.setState({
          startCount: resp.data.payload.start_count,
        })
      } else {
        enqueueSnackbar(`Bulk optimization ERROR: ${resp.data.error}`, {variant: 'error'});
      }
    });
  }

  render() {
    const {
      list,
      strategy,
      new_only,
      startCount,
    } = this.state;
    return (
      <Grid item sm={12} md={6} lg={4}>
        <Paper>
            <List subheader={<ListSubheader>Optimizations</ListSubheader>}>
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
                {startCount}
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
)(BulkOptimization);