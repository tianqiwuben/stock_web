import React from 'react';
import compose from 'recompose/compose';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';

import {connect} from 'react-redux';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Paper from '@material-ui/core/Paper';
import FormControl from '@material-ui/core/FormControl';
import Grid from '@material-ui/core/Grid';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import {apiGetTrendConfig, apiUpdateTrendConfig} from '../../utils/ApiFetch';
import ListSubheader from '@material-ui/core/ListSubheader';
import CircularProgress from '@material-ui/core/CircularProgress';
import { withSnackbar } from 'notistack';

const styles = theme => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 60,
  },
});

class TrendAmp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sym: 'SPY',
      last_c: '',
      last_v: '',
      daily_price_vol: '',
      minute_price_vol: '',
      second_density: 0,
      trend_large: '',
      trend_small: '',
      quota: '',
      priority: '',
      loading: true,
    }
  }

  handleChange = (field, e) => {
    this.setState({
      [field]: e.target.value,
    })
  }

  componentDidMount() {
    const {
      match,
    } = this.props;
    const {
      sym,
    } = this.state;
    const st = {sym};
    if (match.params.id) {
      st.sym = match.params.id;
    }
    this.setState(st, () => {
      this.onFetch();
    });
  }

  onFetch = (action = null) => {
    const {sym} = this.state;
    const query = {};
    if (action) {
      query.navigate = action;
    } else {
      query.sym = sym;
    }
    this.setState({loading: true});
    apiGetTrendConfig(query).then(resp => {
      const {enqueueSnackbar} = this.props;
      if (resp.data.success) {
        this.setState(resp.data.payload);
      } else {
        enqueueSnackbar(`Load ${sym} ERROR: ${resp.data.error}`, {variant: 'error'});
      }
      this.setState({loading: false});
    })
  }

  onSaveNext = async () => {
    await this.onSave();
    this.onNext();
  }

  onSave = async () => {
    const {
      sym,
      quota,
      priority,
      trend_large,
      trend_small,
    } = this.state;
    const payload = {sym, quota, priority, trend_large, trend_small};
    const resp = await apiUpdateTrendConfig(payload);
    const {enqueueSnackbar} = this.props;
    if (resp.data.success) {
      enqueueSnackbar(`Save Success`, {variant: 'success'});
    } else {
      enqueueSnackbar(`ERROR: ${resp.data.error}`, {variant: 'error'});
    }
  }

  onPrev = () => {
    this.onFetch('prev')
  }

  onNext = () => {
    this.onFetch('next')
  }


  render() {
    const {classes} = this.props;
    const {
      sym,
      last_c,
      last_v,
      daily_price_vol,
      minute_price_vol,
      second_density,
      quota,
      priority,
      trend_large,
      trend_small,
      loading,
    } = this.state;
    return (
      <Grid container spacing={3}>
        <Grid item xs={12} md={6} lg={4}>
          <Paper>
            <List subheader={<ListSubheader>Update Trending Amp</ListSubheader>}>
              <ListItem>
                <ListItemText primary="Symbol" />
                <ListItemSecondaryAction>
                  <Button onClick={() => this.onFetch()} color="primary">GET</Button>
                  <FormControl className={classes.formControl}>
                    <TextField
                      value={sym}
                      onChange={e => this.handleChange('sym', e)}
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
                  </FormControl>
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem>
                <ListItemText primary="last_c x last_v" />
                <ListItemSecondaryAction>
                  ${last_c} * {last_v}
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem>
                <ListItemText primary="daily_price_vol" />
                <ListItemSecondaryAction>
                  ${daily_price_vol}
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem>
                <ListItemText primary="minute_price_vol" />
                <ListItemSecondaryAction>
                  ${minute_price_vol}
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem>
                <ListItemText primary="second_density" />
                <ListItemSecondaryAction>
                  {second_density}%
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem>
                <ListItemText>
                  {`Quota ${quota / 100}%`}
                </ListItemText>
                <ListItemSecondaryAction>
                  <FormControl className={classes.formControl}>
                    <TextField
                      value={quota}
                      onChange={e => this.handleChange('quota', e)}
                      inputProps={{
                        style: { textAlign: "right" }
                      }}
                      style = {{width: 80}}
                    />
                  </FormControl>
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem>
                <ListItemText primary="Priority"/>
                <ListItemSecondaryAction>
                  <FormControl className={classes.formControl}>
                    <TextField
                      value={priority}
                      onChange={e => this.handleChange('priority', e)}
                      inputProps={{
                        style: { textAlign: "right" }
                      }}
                      style = {{width: 80}}
                    />
                  </FormControl>
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem>
                <ListItemText>
                  {`Trend Small % $${(last_c * trend_small / 100).toFixed(2)}`}
                </ListItemText>
                <ListItemSecondaryAction>
                  <FormControl className={classes.formControl}>
                    <TextField
                      value={trend_small}
                      onChange={e => this.handleChange('trend_small', e)}
                      inputProps={{
                        style: { textAlign: "right" }
                      }}
                      style = {{width: 80}}
                    />
                  </FormControl>
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem>
                <ListItemText>
                  {`Trend Large % $${(last_c * trend_large / 100).toFixed(2)}`}
                </ListItemText>
                <ListItemSecondaryAction>
                  <FormControl className={classes.formControl}>
                    <TextField
                      value={trend_large}
                      onChange={e => this.handleChange('trend_large', e)}
                      inputProps={{
                        style: { textAlign: "right" }
                      }}
                      style = {{width: 80}}
                    />
                  </FormControl>
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem>
                <ListItemText>
                  <Button color="primary" onClick={this.onSaveNext}>
                    {"SAVE & NEXT"}
                  </Button>
                  <Button color="primary" onClick={this.onSave}>
                    {"SAVE"}
                  </Button>
                  <Button color="primary" onClick={this.onPrev}>
                    {"PREV"}
                  </Button>
                  <Button color="primary" onClick={this.onNext}>
                    {"NEXT"}
                  </Button>
                  {loading && <CircularProgress size={24}/>}
                </ListItemText>
              </ListItem>
            </List>
          </Paper>
        </Grid>
      </Grid>
    );
  }
}

const mapStateToProps = state => ({
})


export default compose(
  withStyles(styles),
  connect(mapStateToProps),
  withSnackbar
)(TrendAmp);