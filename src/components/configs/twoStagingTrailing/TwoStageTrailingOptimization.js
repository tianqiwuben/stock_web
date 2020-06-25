import React from 'react';
import compose from 'recompose/compose';
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import FormControl from '@material-ui/core/FormControl';
import moment from 'moment';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListSubheader from '@material-ui/core/ListSubheader';
import {connect} from 'react-redux';

import {setConfigs} from '../../../redux/configActions';
import {apiConfigsOptimization} from '../../../utils/ApiFetch';

const useStyles = theme => ({
  formControl: {
    margin: theme.spacing(1),
  },
});

const FIELD_MAP = {
  ma_v_threshould: 'Distribution Top %',
  c_diff_threshould: 'Distribution Top %',
  stop_trailing_diff: 'Relative to c_diff_threshould',
  half_target: 'Relatively to c_diff_threshould',
}

const DEFAULT_VALUES = {
  ma_v_threshould: {min: '99', max: '99.9', step: '0.1'},
  c_diff_threshould: {min: '99', max: '99.9', step: '0.1'},
  stop_trailing_diff: {min: '0.2', max: '2', step: '0.1'},
  half_target: {min: '0.2', max: '2', step: '0.1'},
}

class TwoStageTrailingOptimization extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      loading: false,
    }
  }

  onLoadDefault = () => {
    const {
      dispatchSetConfigs,
    } = this.props;
    const newConf = {};
    const newVs = {aggs_seconds: '10,30,60'};
    for (let k in DEFAULT_VALUES) {
      const h = DEFAULT_VALUES[k];
      for (let t in h) {
        newVs[`${k}_${t}`] = h[t];
      }
    }
    newConf['two_stage_trailing_optimization'] = {
      vs: JSON.stringify(newVs),
    }
    dispatchSetConfigs(newConf);
  }

  handleChange = (field, e) => {
    const {
      two_stage_trailing_optimization,
      dispatchSetConfigs,
    } = this.props;
    const newConf = {};
    const newVs = (two_stage_trailing_optimization && two_stage_trailing_optimization.vs) ? JSON.parse(two_stage_trailing_optimization.vs) : {};
    newVs[field] = e.target.value;
    newConf['two_stage_trailing_optimization'] = {
      ...two_stage_trailing_optimization,
      vs: JSON.stringify(newVs),
    }
    dispatchSetConfigs(newConf);
  }

  onRun = () => {
    const {
      sym,
    } = this.props;
    const query = {
      strategy: 'two_stage_trailing',
    }
    apiConfigsOptimization(sym, query).then(resp => {
      if (resp.data.success) {
        this.setState({loading: true});
      }
    })
  }

  onStop = () => {
    const {
      sym,
    } = this.props;
    const query = {
      strategy: 'two_stage_trailing',
      stop_running: true,
    }
    apiConfigsOptimization(sym, query).then(resp => {
      if (resp.data.success) {
      }
    })
  }

  onSave = () => {
    const {
      two_stage_trailing_optimization,
    } = this.props;
    const payload = {
      configs: {
        two_stage_trailing_optimization,
      },
    };
    const {onChangeConfig} = this.props;
    onChangeConfig(payload);
  }
  
  render() {
    const {
      classes,
      two_stage_trailing_optimization,
    } = this.props;
    const {
      loading,
    } = this.state;
    const configs = (two_stage_trailing_optimization && two_stage_trailing_optimization.vs) ? JSON.parse(two_stage_trailing_optimization.vs) : {};
    let progressStr = loading ? 'Started' : '-';
    if (two_stage_trailing_optimization && two_stage_trailing_optimization.vf) {
      if (two_stage_trailing_optimization.vf > 1) {
        progressStr = `Processing Time too long (${two_stage_trailing_optimization.vf.toFixed(1)}h)`;
      } else if (two_stage_trailing_optimization.vi > 0) {
        const ts = moment(two_stage_trailing_optimization.vi * 1000).format('lll');
        progressStr = `${(two_stage_trailing_optimization.vf * 100).toFixed(1)}% ${ts}`;
      } else if (two_stage_trailing_optimization.vi < 0) {
        progressStr = 'Stopped';
      }
    }
    return (
      <Grid item sm={12} md={6} lg={5}>
        <Paper>
            <List subheader={<ListSubheader>Optimization Min Max Step</ListSubheader>}>
            <ListItem>
              <ListItemText>split(,)</ListItemText>
              <ListItemSecondaryAction>
                <Button color="primary" onClick={this.onLoadDefault}>
                  Load Default
                </Button>
                <FormControl className={classes.formControl}>
                  <TextField
                    value={configs.aggs_seconds || ''}
                    onChange={e => this.handleChange('aggs_seconds', e)}
                    inputProps={{
                      style: { textAlign: "center" }
                    }}
                  />
                </FormControl>
              </ListItemSecondaryAction>
            </ListItem>
            {
              Object.keys(FIELD_MAP).map(field => {
                return (
                  <ListItem key={field}>
                    <ListItemText>{FIELD_MAP[field]}
                    </ListItemText>
                    <ListItemSecondaryAction>
                      <FormControl className={classes.formControl}>
                        <TextField
                          value={configs[`${field}_min`] || ''}
                          onChange={e => this.handleChange(`${field}_min`, e)}
                          style = {{width: 60}}
                          inputProps={{
                            style: { textAlign: "center" }
                          }}
                        />
                      </FormControl>
                      <FormControl className={classes.formControl}>
                        <TextField
                          value={configs[`${field}_max`] || ''}
                          onChange={e => this.handleChange(`${field}_max`, e)}
                          style = {{width: 60}}
                          inputProps={{
                            style: { textAlign: "center" }
                          }}
                        />
                      </FormControl>
                      <FormControl className={classes.formControl}>
                        <TextField
                          value={configs[`${field}_step`] || ''}
                          onChange={e => this.handleChange(`${field}_step`, e)}
                          style = {{width: 60}}
                          inputProps={{
                            style: { textAlign: "center" }
                          }}
                        />
                      </FormControl>
                    </ListItemSecondaryAction>
                  </ListItem>
                )
              })
            }
            <ListItem>
              <ListItemText>
                <Button color="primary" onClick={this.onSave}>
                  Save
                </Button>
                <Button onClick={this.onRun}>
                  Run
                </Button>
                <Button color="secondary" onClick={this.onStop}>
                  Stop
                </Button>
              </ListItemText>
              <ListItemSecondaryAction>
                {progressStr}
              </ListItemSecondaryAction>
            </ListItem>
          </List>
        </Paper>
      </Grid>
    );
  }
}

const mapStateToProps = state => ({
  two_stage_trailing_optimization: state.configs.two_stage_trailing_optimization,
  sym: state.configs.sym,
})

export default compose(
  withStyles(useStyles),
  connect(mapStateToProps, {
    dispatchSetConfigs: setConfigs,
  }),
)(TwoStageTrailingOptimization);