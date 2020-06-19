import React from 'react';
import compose from 'recompose/compose';
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import FormControl from '@material-ui/core/FormControl';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Grid from '@material-ui/core/Grid';

import LinearProgress from '@material-ui/core/LinearProgress';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListSubheader from '@material-ui/core/ListSubheader';

import {
  apiGetConfig,
} from '../../utils/ApiFetch';

const useStyles = theme => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  row: {
    '& > *': {
      margin: theme.spacing(1),
    },
  },
  error: {
    margin: theme.spacing(1),
    color: 'red',
    paddingBottom: theme.spacing(2),
    display: 'inline',
  },
});

class Configs extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sym: 'spy',
    }
  }

  onFetch = () => {
    const {sym} = this.state;
    apiGetConfig(sym).then(rest => {
      console.log(rest.data);
    })
  }

  handleChange = (field, e) => {
    this.setState({
      [field]: e.target.value,
    });
  }

  render() {
    const {
      sym,
    } = this.state;
    const {classes} = this.props;
    return (
      <Grid container spacing={3}>
        <Grid item xs={6} md={3} lg={3}>
          <Paper>
            <FormControl className={classes.formControl}>
              <TextField
                label="Symbol"
                value={sym}
                onChange={e => this.handleChange('sym', e)}
              />
            </FormControl>
            <div>
              <Button color="primary" onClick={this.onFetch}>
                Fetch
              </Button>
            </div>
          </Paper>
        </Grid>
        <Grid item xs={6} md={3} lg={3}>
          <Paper>
            <FormControl className={classes.formControl}>
              <TextField
                label="Symbol"
                value={sym}
                onChange={e => this.handleChange('sym', e)}
              />
            </FormControl>
            <div>
              <Button color="primary" onClick={this.onFetch}>
                Fetch
              </Button>
            </div>
          </Paper>
        </Grid>
      </Grid>
    );
  }
}


export default compose(
  withStyles(useStyles),
)(Configs);