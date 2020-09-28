import React from 'react';
import compose from 'recompose/compose';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';

import {connect} from 'react-redux';

import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import {registerComponent} from '../common/Constants';

import {apiResolverCommand} from '../../utils/ApiFetch';
import { withSnackbar } from 'notistack';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import TrendChart from './TrendChart';

const styles = theme => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 60,
  },
  row: {
    '& > *': {
      margin: theme.spacing(1),
    },
  },
});


class SymStatus extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sym: '',
      last_bar: null,
      strategies: [],
      sym_props: null,
      trend: null,
      tradePrice: null,
    }
  }

  handleChange = e => {
    this.setState({sym: e.target.value.toUpperCase(), tradePrice: null});
  }

  componentDidMount(){
    const {setRef} = this.props;
    setRef(this);
    registerComponent('SymStatus', this);
  }

  componentWillUnmount(){
    const {setRef} = this.props;
    setRef(null);
    registerComponent('SymStatus', null);
  }

  onSelectSym = (sym, tradePrice = null) => {
    this.setState({sym, tradePrice}, this.onFetch);
  }

  onFetch = () => {
    const {enqueueSnackbar, liveChartSetSym} = this.props;
    const {env} = this.props;
    const {sym, tradePrice} = this.state;
    if (tradePrice === null) {
      liveChartSetSym(sym);
    }
    const payload = {
      env,
      command: {
        cmd: 'sym_status',
        sym,
      }
    }
    apiResolverCommand(payload).then(resp => {
      if (!resp.data.success) {
        enqueueSnackbar(resp.data.error, {variant: 'error'})
      }
    })
  }

  onStatusPush = (payload) => {
    const {env} = this.props;
    const {sym} = this.state;
    if (env === payload.env && sym === payload.sym) {
      this.setState(payload);
      if (this.trendChart) {
        this.trendChart.drawTrend(payload.trend);
      }
    }
  }

  render() {
    const {
      sym,
      strategies,
      trend,
    } = this.state;
    return (
      <React.Fragment>
        <TrendChart setRef={ref => this.trendChart = ref}/>
        <Grid item xs={12} md={4} lg={4}>
          <Paper>
            <List>
              <ListItem>
                <ListItemText>Symbol</ListItemText>
                <ListItemSecondaryAction>
                  <Button color="primary" onClick={this.onFetch}>
                    Fetch
                  </Button>
                  <TextField
                    value={sym}
                    onChange={this.handleChange}
                    inputProps={{
                      style: { textAlign: "right" }
                    }}
                    style = {{width: 80}}
                    onKeyPress={(ev) => {
                      if (ev.key === 'Enter') {
                        this.onFetch();
                        ev.preventDefault();
                      }
                    }}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              {
                trend &&
                <React.Fragment>
                  <ListItem>
                    <ListItemText>open_c</ListItemText>
                    <ListItemSecondaryAction>
                      {trend.open_c}
                    </ListItemSecondaryAction>
                  </ListItem>
                  <ListItem>
                    <ListItemText>delta_open</ListItemText>
                    <ListItemSecondaryAction>
                      {`${(trend.delta_open * 100).toFixed(2)}%`}
                    </ListItemSecondaryAction>
                  </ListItem>
                  <ListItem>
                    <ListItemText>Current Trend</ListItemText>
                    <ListItemSecondaryAction>
                      {`Large: ${trend.large.current_trend} Small: ${trend.small.current_trend}`}
                    </ListItemSecondaryAction>
                  </ListItem>
                </React.Fragment>
              }
            </List>
          </Paper>
        </Grid>
        {
          strategies.map(stra => (
            <Grid item xs={12} md={4} lg={4} key={stra.name}>
              <Paper>
                <List>
                  <ListItem>
                    <ListItemText>Strategy Name</ListItemText>
                    <ListItemSecondaryAction>
                      {stra.name}
                    </ListItemSecondaryAction>
                  </ListItem>
                  <ListItem>
                    <ListItemText>Status</ListItemText>
                    <ListItemSecondaryAction>
                      {stra.status}
                    </ListItemSecondaryAction>
                  </ListItem>
                  <ListItem>
                    <ListItemText>Priority</ListItemText>
                    <ListItemSecondaryAction>
                      {stra.priority}
                    </ListItemSecondaryAction>
                  </ListItem>
                  {
                    Object.keys(stra.store).map(k => (
                      <ListItem key={k}>
                        <ListItemText>{k}</ListItemText>
                        <ListItemSecondaryAction>
                          {JSON.stringify(stra.store[k]).substring(0, 32)}
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))
                  }
                </List>
              </Paper>
            </Grid>
          ))
        }
      </React.Fragment>
    );
  }
}

const mapStateToProps = state => ({
  process: state.process,
  processPage: state.processPage,
})


export default compose(
  withStyles(styles),
  connect(mapStateToProps, {
  }),
  withSnackbar
)(SymStatus);