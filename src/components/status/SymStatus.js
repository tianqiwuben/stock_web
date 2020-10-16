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
    const showRank = sym.substring(0, 4) === 'SEC_';
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
                    <ListItemText>Current Trend</ListItemText>
                    <ListItemSecondaryAction>
                      {`Large: ${trend.large.current_trend} Small: ${trend.small.current_trend}`}
                    </ListItemSecondaryAction>
                  </ListItem>
                  <ListItem>
                    <ListItemText>open_c</ListItemText>
                    <ListItemSecondaryAction>
                      {trend.open_c}
                    </ListItemSecondaryAction>
                  </ListItem>
                  <ListItem>
                    <ListItemText>open strength</ListItemText>
                    <ListItemSecondaryAction>
                      {`${trend.strength.open && (trend.strength.open * 100).toFixed(2)}%`}
                      {showRank && ` / #${trend.strength.rank_open}`}
                    </ListItemSecondaryAction>
                  </ListItem>
                  <ListItem>
                    <ListItemText>large strength</ListItemText>
                    <ListItemSecondaryAction>
                      {`${trend.strength.large && (trend.strength.large * 100).toFixed(2)}% / ${trend.strength.large_mtc}`}
                      {showRank && ` / #${trend.strength.rank_large}`}
                    </ListItemSecondaryAction>
                  </ListItem>
                  <ListItem>
                    <ListItemText>small strength</ListItemText>
                    <ListItemSecondaryAction>
                      {`${trend.strength.small && (trend.strength.small * 100).toFixed(2)}% / ${trend.strength.small_mtc}`}
                      {showRank && ` / #${trend.strength.rank_small}`}
                    </ListItemSecondaryAction>
                  </ListItem>
                  <ListItem>
                    <ListItemText>last_5 strength</ListItemText>
                    <ListItemSecondaryAction>
                      {`${trend.strength.last_5 && (trend.strength.last_5 * 100).toFixed(2)}%`}
                      {showRank && ` / #${trend.strength.rank_last_5}`}
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
                    <ListItemText>Stage</ListItemText>
                    <ListItemSecondaryAction>
                      {stra.stage}
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