import React from 'react';
import compose from 'recompose/compose';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';
import ShowChartIcon from '@material-ui/icons/ShowChart';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import {apiGetSuggestions, apiUpdateList} from '../../utils/ApiFetch';
import { withSnackbar } from 'notistack';
import moment from 'moment';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import {registerComponent} from '../common/Constants';
import AlertMp3 from '../../alert.mp3';
import LiveChart from './LiveChart';

const styles = theme => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
});


class Suggestions extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      trade_env: 'notifier',
      suggestions: [],
      loading: false,
      watchList: [],
    }
  }

  componentDidMount() {
    registerComponent('suggestions', this);
    this.fetchSuggestions();
    this.autoRefresh();
  }

  componentWillUnmount() {
    registerComponent('suggestions', null);
    clearInterval(this.interval);
  }

  changeTradeEnv = () => {
    const {trade_env} = this.state;
    this.setState({
      trade_env: trade_env === 'notifier' ? 'notifier_test' : 'notifier',
    }, () => {
      this.fetchSuggestions();
    })
  }

  onFeedSuggestion = (suggestion) => {
    const {
      suggestions,
      trade_env,
    } = this.state;
    const envEncode = {
      notifier: 3,
      notifier_test: 4,
    }
    if (trade_env === 'notifier'){
      new Audio(AlertMp3).play();
    }
    if (suggestion.trade_env === envEncode[trade_env]) {
      const newS = [...suggestions];
      if (newS.length > 50) {
        newS.pop();
      }
      newS.unshift(suggestion);
      this.setState({suggestions: newS});
    }
  }

  autoRefresh = () => {
    this.interval = setInterval(() => {
      const ts = Date.now()
      if (this.lastRefresh < ts - 950) {
        this.forceUpdate();
      }
    }, 1000);
  }

  fetchSuggestions = () => {
    const {trade_env, sym} = this.state;
    const {enqueueSnackbar} = this.props;
    apiGetSuggestions({trade_env}).then(resp => {
      if (resp && resp.data.success) {
        let newSym = sym;
        if (resp.data.payload.suggestions.length > 0) {
          newSym = resp.data.payload.suggestions[0].sym;
        }
        this.setState({
          sym: newSym,
          suggestions: resp.data.payload.suggestions,
          watchList: resp.data.payload.watch_list,
        });
        this.onFetchChart(newSym);
      } else {
        enqueueSnackbar(resp.data.error, {variant: 'error'});
      }
    })
  }

  addToWatch = (suggestion) => {
    const {watchList} = this.state;
    const wl = watchList.filter(s => s.id !== suggestion.id);
    wl.unshift(suggestion);
    this.setState({
      watchList: wl,
    });
    this.updateList(suggestion, 'add');
  }

  removeFromWatch = (suggestion) => {
    const {watchList} = this.state;
    const wl = watchList.filter(s => s.id !== suggestion.id);
    this.setState({watchList: wl});
    this.updateList(suggestion, 'delete');
  }

  updateList = (suggestion, action) => {
    const {trade_env} = this.state;
    const payload = {
      list_name: trade_env === 'notifier' ? 'suggestions_watch_list' : 'suggestions_test_watch_list',
      sym: suggestion.id,
      list_action: action,
    }
    apiUpdateList(payload).then(resp => {
      const {enqueueSnackbar} = this.props;
      if (resp.data.success) {
        enqueueSnackbar(`${action} Success`, {variant: 'success'});
      } else {
        enqueueSnackbar(`ERROR: ${resp.data.error}`, {variant: 'error'});
      }
    })
  }

  onClickSuggestion = (suggestion) => {
    this.onFetchChart(suggestion.sym, suggestion.ts_i / 1000);
  }

  onClickSpy = () => {
    this.onFetchChart('SPY');
  }

  onFetchChart = (sym = null, ts_lte = null) => {
    if (this.liveChart) {
      this.liveChart.onFetchChart(sym, ts_lte);
    }
  }

  setLiveChart = (ref) => {
    this.liveChart = ref;
  }

  render() {
    const {
      trade_env,
      suggestions,
      watchList,
    } = this.state;
    this.lastRefresh = Date.now();
    return (
      <Grid container spacing={3}>
        <LiveChart setRef={this.setLiveChart}/>
        <Grid item xs={12} md={5} lg={5}>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>SYM</TableCell>
                  <TableCell>TS</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {
                  suggestions.map(sug => {
                    const diff = Date.now() - sug.ts_i;
                    const mm = moment.utc(diff).format('HH:mm:ss');
                    return(
                      <TableRow
                        key={sug.id}
                        selected={diff < 60000}
                      >
                        <TableCell>
                          {sug.sym}
                        </TableCell>
                        <TableCell>
                          {mm}
                          <br />
                          {sug.ts}
                        </TableCell>
                        <TableCell>
                          {sug.action_str === 'buy_long' ? '+' : '-'}{sug.shares}
                          <br />
                          ${sug.c}
                        </TableCell>
                        <TableCell>
                          <IconButton size="small" onClick={() => this.onClickSuggestion(sug)}>
                            <ShowChartIcon />
                          </IconButton>
                          <IconButton size="small" onClick={() => this.addToWatch(sug)}>
                            <AddIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    )
                  })
                }
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>

        <Grid item xs={12} md={7} lg={7}>
          <Paper style={{marginBottom: 16}}>
            <ToggleButtonGroup
              size="small"
              value={trade_env}
              exclusive
              onChange={this.changeTradeEnv}
            >
              <ToggleButton value="notifier">
                PROD
              </ToggleButton>
              <ToggleButton value="notifier_test">
                TEST
              </ToggleButton>
            </ToggleButtonGroup>
            <Button onClick={this.onClickSpy}>
              SPY
            </Button>
          </Paper>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>SYM</TableCell>
                  <TableCell>TS</TableCell>
                  <TableCell>Strategy</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {
                  watchList.map(sug => {
                    const mm = moment.utc(Date.now() - sug.ts_i).format('HH:mm:ss');
                    return(
                      <TableRow
                        key={sug.id}
                      >
                        <TableCell>
                          {sug.sym}
                        </TableCell>
                        <TableCell>
                          {mm}
                          <br />
                          {sug.ts}
                        </TableCell>
                        <TableCell>
                          {sug.strategy}
                          <br />
                          {sug.action_str}
                        </TableCell>
                        <TableCell>
                          ${sug.c}
                        </TableCell>
                        <TableCell>
                          <IconButton size="small" onClick={() => this.onClickSuggestion(sug)}>
                            <ShowChartIcon />
                          </IconButton>
                          <IconButton size="small" onClick={() => this.removeFromWatch(sug)}>
                            <RemoveIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    )
                  })
                }


              </TableBody>
            </Table>
          </TableContainer>

        </Grid>

      </Grid>
    );
  }
}


export default compose(
  withStyles(styles),
  withSnackbar,
)(Suggestions);