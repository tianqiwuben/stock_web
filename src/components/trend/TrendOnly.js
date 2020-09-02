import React from 'react';
import compose from 'recompose/compose';
import { withStyles } from '@material-ui/core/styles';
import FormControl from '@material-ui/core/FormControl';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import querystring from 'querystring';
import { withSnackbar } from 'notistack';
import CircularProgress from '@material-ui/core/CircularProgress';
import Box from '@material-ui/core/Box';

import {
  Brush,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import Paper from '@material-ui/core/Paper';
import {apiGetTrend} from '../../utils/ApiFetch';

const styles = theme => ({
  chartFixedHeight: {
    height: '90vh',
  },
  oneChart: {
    height: '60vh',
  },
  halfChart: {
    height: '20vh',
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  row: {
    '& > *': {
      margin: theme.spacing(1),
    },
  },
});



class TrendOnly extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      sym: 'AMD',
      loading: false,
    };
  }

  componentDidMount() {
    const {location} = this.props;
    if (location && location.search) {
      const query = querystring.decode(location.search.substring(1));
      if (query.sym) {
        this.setState(query, () => this.onFetch())
      }
    }
  }

  handleChange = (field, e) => {
    this.setState({
      [field]: e.target.value,
    });
  }

  onFetch = () => {
    const {
      sym,
    } = this.state;
    const query = {
      sym,
    };
    this.setState({
      loading: true,
    });
    const {enqueueSnackbar} = this.props;
    apiGetTrend(query).then(resp => {
      if (resp && resp.data.success && resp.data.payload.length > 0) {
        this.setState({
          data: resp.data.payload,
          loading: false,
        });
      } else {
        enqueueSnackbar("No bars loaded", {variant: 'error'});
        this.setState({loading: false});
      }
    })
  }

  render() {
    const {
      data,
      sym,
      loading,
    } = this.state;
    const {classes} = this.props;
    return (
      <Paper className={classes.chartFixedHeight}>
          
        <Box className={classes.row} display="flex" flexDirection="row" alignItems="center">
          <FormControl className={classes.formControl}>
            <TextField
              label="Symbol"
              value={sym}
              onChange={e => this.handleChange('sym', e)}
            />
          </FormControl>
          <Button variant="contained" color="primary" onClick={() => this.onFetch()}>
            Fetch
          </Button>
          {loading && <CircularProgress size={24}/>}
        </Box>
        <div className={classes.oneChart}>
          <ResponsiveContainer>
            <ComposedChart
              data={data}
              margin={{
                top: 16,
                right: 16,
                bottom: 0,
                left: 24,
              }}
            >
              <XAxis dataKey="ts"/>
              <YAxis yAxisId="l" domain={['dataMin', 'dataMax']} />
              <YAxis yAxisId="r" orientation="right" domain={['dataMin', 'dataMax']} hide />
              <Tooltip />
              <Bar yAxisId="r" isAnimationActive={false} stroke="light_grey" dataKey="day_seperator"/>
              <Line yAxisId="l" isAnimationActive={false} type="linear" stroke="blue" dataKey="c" dot={false} />
              {data.length > 0 && <Brush dataKey="ts" startIndex={0}/>}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </Paper>
    );
  }
}


export default compose(
  withStyles(styles),
  withSnackbar,
)(TrendOnly);