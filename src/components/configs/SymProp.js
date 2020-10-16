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
import {apiUpdateSymProp, apiRecalcSymProp} from '../../utils/ApiFetch';
import ListSubheader from '@material-ui/core/ListSubheader';
import { withSnackbar } from 'notistack';

import {
  setConfigs,
} from '../../redux/configActions';

const styles = theme => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 60,
  },
});

class SymProp extends React.Component {
  constructor(props) {
    super(props);
    const r = props.record;
    this.state = {
      trend_amp_large: r.trend_amp_large ? r.trend_amp_large * 100 : '',
      trend_amp_small: r.trend_amp_small ? r.trend_amp_small * 100 : '',
      quota: r.quota,
      priority: r.priority,
    }
  }

  updateRecord = r => {
    this.setState({
      trend_amp_large: r.trend_amp_large ? r.trend_amp_large * 100 : '',
      trend_amp_small: r.trend_amp_small ? r.trend_amp_small * 100 : '',
      quota: r.quota,
      priority: r.priority,
    })
  }

  componentDidMount() {
    const {setRef} = this.props;
    setRef && setRef(this);
  }

  componentWillMount() {
    const {setRef} = this.props;
    setRef && setRef(null);
  }

  handleChange = (field, e) => {
    this.setState({
      [field]: e.target.value,
    })
  }

  onSave = async () => {
    const {
      quota,
      priority,
      trend_amp_large,
      trend_amp_small,
    } = this.state;
    const {record} = this.props;
    const payload = {sym: record.sym, quota, priority, trend_amp_large, trend_amp_small};
    const resp = await apiUpdateSymProp(payload);
    const {enqueueSnackbar} = this.props;
    if (resp.data.success) {
      enqueueSnackbar(`Save Success`, {variant: 'success'});
    } else {
      enqueueSnackbar(`ERROR: ${resp.data.error}`, {variant: 'error'});
    }
  }

  onRecalc = () => {
    const {record, enqueueSnackbar, dispatchSetConfigs} = this.props;
    apiRecalcSymProp(record.sym).then(resp => {
      if (resp.data.success) {
        dispatchSetConfigs({sym_prop: resp.data.payload});
        this.updateRecord(resp.data.payload);
        enqueueSnackbar(`Save Success`, {variant: 'success'});
      } else {
        enqueueSnackbar(`ERROR: ${resp.data.error}`, {variant: 'error'});
      }
    })

  }

  render() {
    const {classes, last_c, record} = this.props;
    const {
      trend_amp_large,
      trend_amp_small,
      quota,
      priority,
    } = this.state;
    return (
      <Grid item xs={12} md={6} lg={3}>
        <Paper>
          <List subheader={<ListSubheader>Sym Prop</ListSubheader>}>
            <ListItem>
              <ListItemText primary="second_bar_density" />
              <ListItemSecondaryAction>
                {record.second_bar_density}%
              </ListItemSecondaryAction>
            </ListItem>
            <ListItem>
              <ListItemText primary="Average True Range" />
              <ListItemSecondaryAction>
                {record.ema_true_range ? (record.ema_true_range * 100).toFixed(2) : '-'}%
              </ListItemSecondaryAction>
            </ListItem>
            <ListItem>
              <ListItemText primary="ema_daily_price_vol" />
              <ListItemSecondaryAction>
                ${record.ema_daily_price_vol_human}
              </ListItemSecondaryAction>
            </ListItem>
            <ListItem>
              <ListItemText primary="sector" />
              <ListItemSecondaryAction>
                {record.sector}
              </ListItemSecondaryAction>
            </ListItem>
            <ListItem>
              <ListItemText primary="sector_weight" />
              <ListItemSecondaryAction>
                {record.sector_weight}
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
                    style = {{width: 120}}
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
                    style = {{width: 120}}
                  />
                </FormControl>
              </ListItemSecondaryAction>
            </ListItem>
            <ListItem>
              <ListItemText>
                {`Trend Small % $${(last_c * trend_amp_small / 100).toFixed(2)}`}
              </ListItemText>
              <ListItemSecondaryAction>
                <FormControl className={classes.formControl}>
                  <TextField
                    value={trend_amp_small}
                    onChange={e => this.handleChange('trend_amp_small', e)}
                    inputProps={{
                      style: { textAlign: "right" }
                    }}
                    style = {{width: 120}}
                  />
                </FormControl>
              </ListItemSecondaryAction>
            </ListItem>
            <ListItem>
              <ListItemText>
                {`Trend Large % $${(last_c * trend_amp_large / 100).toFixed(2)}`}
              </ListItemText>
              <ListItemSecondaryAction>
                <FormControl className={classes.formControl}>
                  <TextField
                    value={trend_amp_large}
                    onChange={e => this.handleChange('trend_amp_large', e)}
                    inputProps={{
                      style: { textAlign: "right" }
                    }}
                    style = {{width: 120}}
                  />
                </FormControl>
              </ListItemSecondaryAction>
            </ListItem>
            <ListItem>
              <ListItemText primary="Last Updated" />
              <ListItemSecondaryAction>
                {record.updated_at_str}
              </ListItemSecondaryAction>
            </ListItem>
            <ListItem>
              <ListItemText>
                <Button color="primary" onClick={this.onSave}>
                  SAVE
                </Button>
                <Button onClick={this.onRecalc}>
                  RECALC
                </Button>
              </ListItemText>
            </ListItem>
          </List>
        </Paper>
      </Grid>
    );
  }
}

export default compose(
  withStyles(styles),
  connect(null, {
    dispatchSetConfigs: setConfigs,
  }),
  withSnackbar
)(SymProp);