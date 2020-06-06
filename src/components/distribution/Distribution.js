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

import Box from '@material-ui/core/Box';
import LinearProgress from '@material-ui/core/LinearProgress';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListSubheader from '@material-ui/core/ListSubheader';

import {
  Brush,
  Bar,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  LineChart,
} from 'recharts';

import Filters from '../common/Filters';

import {
  apiGetDistribution,
  apiPostDistribution,
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
  oneChart: {
    marginTop: '12px',
    width: '100%',
    height: '150px',
  },
});

const barFields = {
  c1: 1,
  c2: 2,
  c3: 3,
  p1: 4,
  p2: 5,
  p3: 10,
  s1: 15,
  s2: 20,
  s3: 30,
};

class Distribution extends React.Component {
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
    } = this.state;
    const query = {
      sym,
      day_frame: dayFrame,
      price_d,
      volumn_d,
      hour_frame: hourFrame,
      is_short: isShort,
    }
    return query;
  }

  startProgress = () => {
    if (!this.interval) {
      this.interval = window.setInterval(() => {
        apiAggProgress({page: 'distribution'}).then(resp => {
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
    apiPostDistribution(query).then(resp => {
      if (resp.data.success) {
        this.setState({
          progress: 10,
        })
        this.startProgress();
      }
    })
  }

  onShow = () => {
    const query = this.getQuery();
    apiGetDistribution(query).then(resp => {
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
          Object.keys(barFields).map(field =>
            <Grid item xs={12} md={4} lg={4} key={field}>
              <div className={classes.oneChart}>
                <Typography variant="body1">
                  {`${barFields[field]} min: win ${data.win_rate[field]}%`}
                </Typography>
                <ResponsiveContainer>
                  <ComposedChart data={data[field]}>
                    <XAxis dataKey="k" />
                    <YAxis yAxisId="l" domain={['dataMin', 'dataMax']}/>
                    <YAxis yAxisId="r" orientation="right" domain={['dataMin', 'dataMax']} hide/>
                    <Tooltip />
                    <Bar
                      yAxisId="l"
                      dataKey="v"
                      isAnimationActive={false}
                      fill="#8884d8"
                    />
                    <Line
                      yAxisId="r"
                      dataKey="p"
                      isAnimationActive={false}
                      stroke="none"
                      dot={{stroke: 'green'}}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </Grid>
          )
        }
        
      </Grid>
    );
  }
}


export default compose(
  withStyles(useStyles),
)(Distribution);