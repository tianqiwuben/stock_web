import React from 'react';
import compose from 'recompose/compose';
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Grid from '@material-ui/core/Grid';

import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListSubheader from '@material-ui/core/ListSubheader';

import {
  apiGetAgg,
  apiPostAgg,
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

class Aggregates extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      status: 'idle',
      process: 0,
      error: '',
      dayFrame: 'd1901_2012',
      sym: 'SPY',
      price_d: '0.97',
      volumn_d: '0.97',
      hourFrame: 'all',
      isShort: 'all',
      calcStrategy: false,
      data: null,
    }
  }

  componentDidMount() {
    this.onShow();
  }

  getQuery = () => {
    const {
      sym,
      dayFrame,
      price_d,
      volumn_d,
      hourFrame,
      isShort,
      calcStrategy,
    } = this.state;
    const query = {
      sym,
      day_frame: dayFrame,
      price_d,
      volumn_d,
      hour_frame: hourFrame,
      is_short: isShort,
      calc_strategy: calcStrategy,
    }
    return query;
  }

  onGenerate = () => {
    const {process} = this.state;
    if (process > 0 && process < 100) {
      return;
    }
    const query = this.getQuery();
    apiPostAgg(query).then(resp => {
      console.log(resp.data);
    })
  }

  onShow = () => {
    const {status} = this.state;
    if (status !== 'idle') {
      return;
    }
    this.setState({
      status: 'loading',
      error: '',
    });
    const query = this.getQuery();
    apiGetAgg(query).then(resp => {
      if (resp.data.success) {
        if (!resp.data.payload) {
          this.setState({
            status: 'idle',
            error: 'Not found'
          });
        } else {
          this.setState({
            data: resp.data.payload,
            status: 'idle',
          })
        }
      }
    });
  }

  handleChange = (field, e) => {
    this.setState({
      [field]: e.target.value,
    });
  }

  onChangeStrategy = () => {
    this.setState({
      calcStrategy: !this.state.calcStrategy,
    })
  }

  render() {
    const {
      error,
      dayFrame,
      sym,
      price_d,
      volumn_d,
      hourFrame,
      isShort,
      calcStrategy,
      data,
    } = this.state;
    const {classes} = this.props;
    const results = data && data.results;
    return (
      <Grid container spacing={3}>
        <Grid item xs={12} md={12} lg={12}>
          <Paper>
            <FormControl className={classes.formControl}>
              <TextField
                label="Symbol"
                value={sym}
                onChange={e => this.handleChange('sym', e)}
              />
            </FormControl>
            <FormControl className={classes.formControl}>
              <InputLabel>Day Frame</InputLabel>
              <Select
                value={dayFrame}
                onChange={e => this.handleChange('dayFrame', e)}
              >
                <MenuItem value={'d1901_2002'}>2019/01-2020/02</MenuItem>
                <MenuItem value={'d2002_2003'}>2020/02-2020/03</MenuItem>
                <MenuItem value={'d2003_2012'}>2020/03-2020/12</MenuItem>
                <MenuItem value={'d1901_2012'}>2019/01-2020/12</MenuItem>
              </Select>
            </FormControl>
            <FormControl className={classes.formControl}>
              <TextField
                label="Price D"
                value={price_d}
                onChange={e => this.handleChange('price_d', e)}
              />
            </FormControl>
            <FormControl className={classes.formControl}>
              <TextField
                label="Vol D"
                value={volumn_d}
                onChange={e => this.handleChange('volumn_d', e)}
              />
            </FormControl>
            <FormControl className={classes.formControl}>
              <InputLabel>Hour Frame</InputLabel>
              <Select
                value={hourFrame}
                onChange={e => this.handleChange('hourFrame', e)}
              >
                <MenuItem value={'no_ext'}>No Ext</MenuItem>
                <MenuItem value={'ext_only'}>Ext only</MenuItem>
                <MenuItem value={'all'}>All</MenuItem>
              </Select>
            </FormControl>
            <FormControl className={classes.formControl}>
              <InputLabel>Is Short</InputLabel>
              <Select
                value={isShort}
                onChange={e => this.handleChange('isShort', e)}
              >
                <MenuItem value={'long_only'}>Long Only</MenuItem>
                <MenuItem value={'short_only'}>Short Only</MenuItem>
                <MenuItem value={'all'}>All</MenuItem>
              </Select>
            </FormControl>

            <div className={classes.row}>
              <FormControl className={classes.formControl}>
                <FormControlLabel
                  control={
                    <Checkbox checked={calcStrategy} onChange={this.onChangeStrategy} />
                  }
                  label="Calc Strategy"
                />
              </FormControl>

              <Button variant="contained" color="default" onClick={this.onGenerate}>
                Generate
              </Button>
              <Button variant="contained" color="primary" onClick={this.onShow}>
                Show
              </Button>
              {
                error !== '' &&
                <Typography variant="h6" className={classes.error}>
                  {error}
                </Typography>
              }
            </div>
          </Paper>
        </Grid>
        {
          data &&
          <Grid item xs={12} md={5} lg={5}>
            <Paper>
              <List subheader={<ListSubheader>Summary</ListSubheader>}>
                <ListItem>
                  <ListItemText>Total Trans</ListItemText>
                  <ListItemSecondaryAction>{results.total_trans}</ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemText>Trans per Day</ListItemText>
                  <ListItemSecondaryAction>{results.trans_per_day}</ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemText>Muti Total P/L</ListItemText>
                  <ListItemSecondaryAction>{results.pl}</ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemText>Muti Daily P/L</ListItemText>
                  <ListItemSecondaryAction>{results.pl_per_day}</ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemText>Avg Total P/L</ListItemText>
                  <ListItemSecondaryAction>{results.pl_linear}</ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemText>Avg Daily P/L</ListItemText>
                  <ListItemSecondaryAction>{results.pl_linear_per_day}</ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemText>Updated At</ListItemText>
                  <ListItemSecondaryAction>{data.updated_at}</ListItemSecondaryAction>
                </ListItem>
              </List>
            </Paper>
          </Grid>
        }
        {
          data &&
          <Grid item xs={12} md={3} lg={3}>
            <Paper>
              <List subheader={<ListSubheader>Compound</ListSubheader>}>
                {
                  Object.keys(results.multis).map(k => (
                    <ListItem key={k}>
                      <ListItemText>{k}</ListItemText>
                      <ListItemSecondaryAction>{results.multis[k]}</ListItemSecondaryAction>
                    </ListItem>
                  ))
                }
              </List>
            </Paper>
          </Grid>
        }
        {
          data &&
          <Grid item xs={12} md={3} lg={3}>
            <Paper>
              <List subheader={<ListSubheader>Simple</ListSubheader>}>
                {
                  Object.keys(results.averages).map(k => (
                    <ListItem key={k}>
                      <ListItemText>{k}</ListItemText>
                      <ListItemSecondaryAction>{results.averages[k]}</ListItemSecondaryAction>
                    </ListItem>
                  ))
                }
              </List>
            </Paper>
          </Grid>
        }
      </Grid>
    );
  }
}


export default compose(
  withStyles(useStyles),
)(Aggregates);