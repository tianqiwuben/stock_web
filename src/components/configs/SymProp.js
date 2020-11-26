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
import {apiUpdateSymProp} from '../../utils/ApiFetch';
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
    const sp = props.sym_prop;
    this.state = {
      quota: sp.quota,
      priority: sp.priority,
    }
  }

  updateRecord = (sp) => {
    this.setState({
      quota: sp.quota,
      priority: sp.priority,
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
    } = this.state;
    const {sym_prop} = this.props;
    const payload = {sym: sym_prop.sym, quota, priority};
    const resp = await apiUpdateSymProp(payload);
    const {enqueueSnackbar} = this.props;
    if (resp.data.success) {
      enqueueSnackbar(`Save Success`, {variant: 'success'});
    } else {
      enqueueSnackbar(`ERROR: ${resp.data.error}`, {variant: 'error'});
    }
  }

  render() {
    const {classes, last_c, support_resist, sym_prop} = this.props;
    const {
      quota,
      priority,
    } = this.state;
    return (
      <Grid item xs={12} md={6} lg={3}>
        <Paper>
          <List subheader={<ListSubheader>{`Support Resist & Sym Prop (${support_resist.date})`}</ListSubheader>}>
            <ListItem>
              <ListItemText primary="second_bar_density" />
              <ListItemSecondaryAction>
                {support_resist.second_bar_density}%
              </ListItemSecondaryAction>
            </ListItem>
            <ListItem>
              <ListItemText primary="Average True Range" />
              <ListItemSecondaryAction>
                {support_resist.ema_true_range ? (support_resist.ema_true_range * 100).toFixed(2) : '-'}%
              </ListItemSecondaryAction>
            </ListItem>
            <ListItem>
              <ListItemText>
                {`Trend Small % $${(last_c * support_resist.trend_amp_small).toFixed(2)}`}
              </ListItemText>
              <ListItemSecondaryAction>
                {support_resist.trend_amp_small ? `${(support_resist.trend_amp_small * 100).toFixed(2)}%` : ''}
              </ListItemSecondaryAction>
            </ListItem>
            <ListItem>
              <ListItemText>
                {`Trend Large % $${(last_c * support_resist.trend_amp_large).toFixed(2)}`}
              </ListItemText>
              <ListItemSecondaryAction>
              {support_resist.trend_amp_large ? `${(support_resist.trend_amp_large * 100).toFixed(2)}%` : ''}
              </ListItemSecondaryAction>
            </ListItem>
            <ListItem>
              <ListItemText primary="ema_daily_price_vol" />
              <ListItemSecondaryAction>
                ${support_resist.ema_daily_price_vol_human}
              </ListItemSecondaryAction>
            </ListItem>
            <ListItem>
              <ListItemText primary="sector" />
              <ListItemSecondaryAction>
                {sym_prop.sector}
              </ListItemSecondaryAction>
            </ListItem>
            <ListItem>
              <ListItemText primary="sector_weight" />
              <ListItemSecondaryAction>
                {sym_prop.sector_weight}
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
              <ListItemText primary="Last Updated" />
              <ListItemSecondaryAction>
                {sym_prop.updated_at_str}
              </ListItemSecondaryAction>
            </ListItem>
            <ListItem>
              <ListItemText>
                <Button color="primary" onClick={this.onSave}>
                  SAVE
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