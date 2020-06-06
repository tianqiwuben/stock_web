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

import Box from '@material-ui/core/Box';
import LinearProgress from '@material-ui/core/LinearProgress';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListSubheader from '@material-ui/core/ListSubheader';

import Filters from '../common/Filters';

import {
  apiGetAgg,
  apiPostAgg,
  apiAggProgress,
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
      progress: 0,
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

  startProgress = () => {
    if (!this.interval) {
      this.interval = window.setInterval(() => {
        apiAggProgress({page: 'agg'}).then(resp => {
          if (resp.data.success) {
            if (resp.data.payload === 0) {
              this.setState({
                progress: 0,
              });
              clearInterval(this.interval);
              this.interval = null;
            } else {
              this.setState({
                progress: resp.data.payload,
              });
            }
          }
        })
      }, 1000);
    }
  }

  onGenerate = () => {
    const {progress} = this.state;
    if (progress > 0 && progress < 100) {
      return;
    }
    const query = this.getQuery();
    apiPostAgg(query).then(resp => {
      if (resp.data.success) {
        this.setState({
          progress: 10,
        })
        this.startProgress();
      }
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
      progress,
    } = this.state;
    const {classes} = this.props;
    const results = data && data.results;
    return (
      <Grid container spacing={3}>
        <Grid item xs={12} md={12} lg={12}>
          <Paper>
            <Filters
              dayFrame={dayFrame}
              sym={sym}
              price_d={price_d}
              volumn_d={volumn_d}
              hourFrame={hourFrame}
              isShort={isShort}
              handleChange={this.handleChange}
            />
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
          progress > 0 &&
          <Grid item xs={12} md={12} lg={12}>
            <Box display="flex" alignItems="center">
              <Box width="100%" mr={1}>
                <LinearProgress variant="determinate" value={progress} />
              </Box>
              <Box minWidth={35}>
                <Typography variant="body2" color="textSecondary">{`${progress}%`}</Typography>
              </Box>
            </Box>
          </Grid>
        }
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
                  <ListItemText>Start price</ListItemText>
                  <ListItemSecondaryAction>{results.start_day_c}</ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemText>End Price</ListItemText>
                  <ListItemSecondaryAction>{results.end_day_c}</ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemText>Hold P/L</ListItemText>
                  <ListItemSecondaryAction>{results.hold_pl}</ListItemSecondaryAction>
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