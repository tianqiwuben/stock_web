import React from 'react';
import compose from 'recompose/compose';
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListSubheader from '@material-ui/core/ListSubheader';
import {connect} from 'react-redux';
import { withSnackbar } from 'notistack';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import ProgressWithLabel from '../common/ProgressWithLabel';
import Remark from '../common/Remark';
import {setConfigs} from '../../redux/configActions';

import {StrategyDB, getComponent} from '../common/Constants';

import {
  Link,
} from "react-router-dom";

const useStyles = theme => ({
});


class StrategyValues extends React.Component {

  handleChange = (field, e) => {
    const {
      isTest,
      dispatchSetConfigs,
      strategy,
      all_configs,
    } = this.props;
    const newConf = {};
    const strategyName = `${strategy}${isTest ? '_test' : ''}`;
    const conf = all_configs[strategyName];
    const newVs = (conf && conf.vs) ? JSON.parse(conf.vs) : {};
    newVs[field] = e.target.value;
    newConf[strategyName] = {
      ...conf,
      vs: JSON.stringify(newVs),
    }
    dispatchSetConfigs(newConf);
  }

  onSave = () => {
    const {
      strategy,
      all_configs,
      isTest,
    } = this.props;
    const strategyName = `${strategy}${isTest ? '_test' : ''}`;
    const payload = {
      configs: {
        [strategyName]: all_configs[strategyName],
      },
    };
    const {onChangeConfig} = this.props;
    onChangeConfig(payload);
  }

  onTest = () => {
    const tp = getComponent('testPanel');
    if (tp) {
      const {sym, strategy} = this.props;
      tp.popWithOptions({
        sym,
        strategy,
        mode: 'test',
      })
    }
  }

  render() {
    const {
      last_c,
      isTest,
      all_configs,
      strategy,
      isPercent,
      sym,
      progress,
    } = this.props;
    const strategyKey = isTest ? `${strategy}_test` : strategy;
    const sc = all_configs[strategyKey];
    const configs = (sc && sc.vs) ? JSON.parse(sc.vs) : {};
    const title = isTest ? 'Test' : strategy;
    const progressValue = isTest ? progress[`test_${sym}_${strategy}`] : null;
    return (
      <Grid item sm={12} md={6} lg={isTest ? 3 : 4}>
        <Paper>
            <List subheader={<ListSubheader>{title}</ListSubheader>}>
            {
              StrategyDB[strategy].map(field => {
                let title = isTest ? field.key : field.name;
                if (field.name.substr(-1) === '%') {
                  title += ` $${(last_c * configs[field.key] / 100).toFixed(3)}`;
                }
                const pctField = `${field.key}${isPercent ? '_pct' : ''}`;
                return (
                  <ListItem key={field.key}>
                    <ListItemText>{title}</ListItemText>
                    <ListItemSecondaryAction>
                      <TextField
                        value={configs[pctField] || ''}
                        onChange={e => this.handleChange(pctField, e)}
                        inputProps={{
                          style: { textAlign: "right" }
                        }}
                        style = {{width: 60}}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                )
              })
            }
            <ListItem>
              <ListItemText>
                <ButtonGroup variant="text" color="primary" >
                  <Button onClick={this.onSave}>
                    Save
                  </Button>
                  {
                    isTest ?
                    <Button onClick={this.onTest}>
                      Run
                    </Button>
                    :
                    <Link to={`/triggers?sym=${sym}&aggs_seconds=${configs.aggs_seconds}`} >
                      <Button>
                        Triggers
                      </Button>
                    </Link>
                  }
                  <Link to={`/transactions?sym=${sym}&strategy=${strategy}&trade_env=${isTest ? 'test' : 'paper'}`} >
                    <Button>
                      Trans
                    </Button>
                  </Link>
                </ButtonGroup>
              </ListItemText>
              <ListItemSecondaryAction>
                {progressValue && <ProgressWithLabel value={progressValue} />}
              </ListItemSecondaryAction>
            </ListItem>
            <ListItem>
              <ListItemText>
                <Remark sym={sym} remarkKey={strategyKey} />
              </ListItemText>
            </ListItem>
          </List>
        </Paper>
      </Grid>
    );
  }
}

const mapStateToProps = state => ({
  last_c: state.configs.last_c,
  sym: state.configs.sym,
  isPercent: state.configs.isPercent,
  strategy: state.configs.strategy,
  all_configs: state.configs,
  progress: state.progress,
})

export default compose(
  withStyles(useStyles),
  connect(mapStateToProps, {
    dispatchSetConfigs: setConfigs,
  }),
  withSnackbar,
)(StrategyValues);