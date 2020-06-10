import React from 'react';
import compose from 'recompose/compose';
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import FormControl from '@material-ui/core/FormControl';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import LinearProgress from '@material-ui/core/LinearProgress';

import {
  Bar,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

import Filters from '../common/Filters';
import TimeFilter from '../common/TimeFilter';

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

const dataFields = [
  'total_trans',
  'trans_per_day',
  'start_day_c',
  'end_day_c',
  'hold_pl',
  'stop_count',
  'stop_avg',
  'stop_multi',
]

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
      gen_uv: false,
      data: null,
      c1_min: '',
      c1_max: '',
      c2_min: '',
      c2_max: '',
      c3_min: '',
      c3_max: '',
      p1_min: '',
      p1_max: '',
      p2_min: '',
      p2_max: '',
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
      c1_min,
      c1_max,
      c2_min,
      c2_max,
      c3_min,
      c3_max,
      p1_min,
      p1_max,
      p2_min,
      p2_max,
      gen_uv,
    } = this.state;
    const query = {
      sym,
      day_frame: dayFrame,
      price_d,
      volumn_d,
      hour_frame: hourFrame,
      is_short: isShort,
      c1_min,
      c1_max,
      c2_min,
      c2_max,
      c3_min,
      c3_max,
      p1_min,
      p1_max,
      p2_min,
      p2_max,
      gen_uv,
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

  onChangeUV = () => {
    this.setState({
      gen_uv: !this.state.gen_uv,
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
      gen_uv,
      data,
      progress,
      c1_min,
      c1_max,
      c2_min,
      c2_max,
      c3_min,
      c3_max,
      p1_min,
      p1_max,
      p2_min,
      p2_max,
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
            <TimeFilter
              handleChange={this.handleChange}
              c1_min={c1_min}
              c1_max={c1_max}
              c2_min={c2_min}
              c2_max={c2_max}
              c3_min={c3_min}
              c3_max={c3_max}
              p1_min={p1_min}
              p1_max={p1_max}
              p2_min={p2_min}
              p2_max={p2_max}
            />
            <div className={classes.row}>
              <FormControl className={classes.formControl}>
                <FormControlLabel
                  control={
                    <Checkbox checked={gen_uv} onChange={this.onChangeUV} />
                  }
                  label="Create UV"
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
        <Grid container xs={12} md={12} lg={12}>
          {
            data &&
            dataFields.map(field =>
              <Grid key={field} item xs={12} md={4} lg={3}>
                <Typography variant="body1">
                    {`${field}: ${data[field]}`}
                  </Typography>
              </Grid>
            )
          }
        </Grid>
        {
          data &&
          Object.keys(barFields).map(field =>
            <Grid item xs={12} md={6} lg={4} key={field}>
              <div className={classes.oneChart}>
                <Typography variant="body1">
                  {`${barFields[field]}m w ${data.win_rate[field]}% sim ${data.avgs[field]}(${data.avgs_adj[field]}) com ${data.multis[field]}(${data.multis_adj[field]})`}
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