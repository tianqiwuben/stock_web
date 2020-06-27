import React from 'react';
import compose from 'recompose/compose';
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import FormControl from '@material-ui/core/FormControl';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListSubheader from '@material-ui/core/ListSubheader';
import { withSnackbar } from 'notistack';
import {connect} from 'react-redux';
import ButtonGroup from '@material-ui/core/ButtonGroup';

import {setConfigs} from '../../redux/configActions';
import {apiOptimizationProcessAction} from '../../utils/ApiFetch';
import StrategyDB from '../common/StrategyDB';

const useStyles = theme => ({
  formControl: {
    margin: theme.spacing(1),
  },
});


class StrategyOptimization extends React.Component {

  onLoadDefault = () => {
    const {
      dispatchSetConfigs,
      strategy,
    } = this.props;
    const newConf = {};
    const newVs = {};
    StrategyDB[strategy].fields.forEach(field => {
      if (field.optimization_type === 'range') {
        for (let t in field.optimization_default) {
          newVs[`${field.key}_${t}`] = field.optimization_default[t];
        }
      } else {
        newVs[field.key] = field.optimization_default;
      }
    })
    newConf[`${strategy}_optimization`] = {
      vs: JSON.stringify(newVs),
    }
    dispatchSetConfigs(newConf);
  }

  handleChange = (field, e) => {
    const {
      all_configs,
      strategy,
      dispatchSetConfigs,
    } = this.props;
    const newConf = {};
    const optimization = all_configs[`${strategy}_optimization`];
    const newVs = (optimization && optimization.vs) ? JSON.parse(optimization.vs) : {};
    newVs[field] = e.target.value;
    newConf[`${strategy}_optimization`] = {
      ...optimization,
      vs: JSON.stringify(newVs),
    }
    dispatchSetConfigs(newConf);
  }

  onRun = () => {
    const {
      all_configs,
      strategy,
      enqueueSnackbar,
    } = this.props;
    const optimization = all_configs[`${strategy}_optimization`];
    const payload = {
      sym_config_id: optimization.id,
      process_action: 'start',
    }
    apiOptimizationProcessAction(payload).then(resp => {
      if (resp.data.success) {
        enqueueSnackbar('Optimization Process Started')
      } else {
        enqueueSnackbar(resp.data.error, {variant: 'error'})
      }
    })
  }

  onStop = () => {
    const {
      all_configs,
      strategy,
      enqueueSnackbar,
    } = this.props;
    const optimization = all_configs[`${strategy}_optimization`];
    const payload = {
      sym_config_id: optimization.id,
      process_action: 'stop',
    }
    apiOptimizationProcessAction(payload).then(resp => {
      if (resp.data.success) {
        enqueueSnackbar('Stopped')
      } else {
        enqueueSnackbar(resp.data.error, {variant: 'error'})
      }
    })
  }

  onSave = () => {
    const {
      strategy,
      all_configs,
    } = this.props;
    const conf_name = `${strategy}_optimization`;
    const payload = {
      configs: {
        [conf_name]: all_configs[conf_name],
      },
    };
    const {onChangeConfig} = this.props;
    onChangeConfig(payload);
  }
  
  render() {
    const {
      classes,
      all_configs,
      strategy,
    } = this.props;
    const optimization = all_configs[`${strategy}_optimization`];
    const configs = (optimization && optimization.vs) ? JSON.parse(optimization.vs) : {};
    
    let progressStr = '-';
    if (optimization && optimization.optimization_process) {
      progressStr = `${optimization.optimization_process.status} ${optimization.optimization_process.completed_percent}% ${optimization.optimization_process.expected_finish_time_str}`;
    }
    return (
      <Grid item sm={12} md={6} lg={5}>
        <Paper>
            <List subheader={<ListSubheader>Optimization Min Max Step</ListSubheader>}>
            {
              StrategyDB[strategy].fields.map(field => {
                return (
                  <ListItem key={field.key}>
                    <ListItemText>{field.optimization_name}
                    </ListItemText>
                    <ListItemSecondaryAction>
                      {
                        field.optimization_type === 'split'
                        &&
                        <FormControl className={classes.formControl}>
                          <TextField
                            value={configs[field.key] || ''}
                            onChange={e => this.handleChange(field.key, e)}
                            inputProps={{
                              style: { textAlign: "center" }
                            }}
                          />
                        </FormControl>
                      }
                      {
                        field.optimization_type === 'range'
                        &&
                        <React.Fragment>
                          <FormControl className={classes.formControl}>
                            <TextField
                              value={configs[`${field.key}_min`] || ''}
                              onChange={e => this.handleChange(`${field.key}_min`, e)}
                              style = {{width: 60}}
                              inputProps={{
                                style: { textAlign: "center" }
                              }}
                            />
                          </FormControl>
                          <FormControl className={classes.formControl}>
                            <TextField
                              value={configs[`${field.key}_max`] || ''}
                              onChange={e => this.handleChange(`${field.key}_max`, e)}
                              style = {{width: 60}}
                              inputProps={{
                                style: { textAlign: "center" }
                              }}
                            />
                          </FormControl>
                          <FormControl className={classes.formControl}>
                            <TextField
                              value={configs[`${field.key}_step`] || ''}
                              onChange={e => this.handleChange(`${field.key}_step`, e)}
                              style = {{width: 60}}
                              inputProps={{
                                style: { textAlign: "center" }
                              }}
                            />
                          </FormControl>
                        </React.Fragment>
                      }
                    </ListItemSecondaryAction>
                  </ListItem>
                )
              })
            }
            <ListItem>
              <ListItemText>
                <ButtonGroup color="primary" variant="text">
                  <Button onClick={this.onSave}>
                    Save
                  </Button>
                  <Button onClick={this.onLoadDefault}>
                    Default
                  </Button>
                  <Button onClick={this.onRun}>
                    Run
                  </Button>
                  <Button onClick={this.onStop}>
                    Stop
                  </Button>
                </ButtonGroup>
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
  all_configs: state.configs,
  sym: state.configs.sym,
  strategy: state.configs.strategy,
})

export default compose(
  withStyles(useStyles),
  connect(mapStateToProps, {
    dispatchSetConfigs: setConfigs,
  }),
  withSnackbar,
)(StrategyOptimization);