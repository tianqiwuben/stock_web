import React from 'react';
import compose from 'recompose/compose';
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import CircularProgress from '@material-ui/core/CircularProgress';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListSubheader from '@material-ui/core/ListSubheader';
import {connect} from 'react-redux';
import { withSnackbar } from 'notistack';
import {apiTestConfig} from '../../utils/ApiFetch';
import ButtonGroup from '@material-ui/core/ButtonGroup';

import {setConfigs} from '../../redux/configActions';

import StrategyDB from '../common/StrategyDB';

import {
  Link,
} from "react-router-dom";

const useStyles = theme => ({
});


class StrategyValues extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      testLoading: false,
    }
  }

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
    const {
      sym,
      strategy,
      enqueueSnackbar,
    } = this.props;
    const payload = {
      strategy: strategy,
    }
    this.setState({testLoading: true});
    apiTestConfig(sym, payload).then(resp => {
      this.setState({testLoading: false});
      if(resp.data && resp.data.success) {
        enqueueSnackbar(`${sym} Test Complete`, {variant: 'success'})
      } else {
        enqueueSnackbar(resp.data.error, {variant: 'error'})
      }
    })
  }

  render() {
    const {
      last_c,
      isTest,
      all_configs,
      strategy,
      isPercent,
      sym,
    } = this.props;
    const {
      testLoading,
    } = this.state;
    const sc = isTest ? all_configs[`${strategy}_test`] : all_configs[strategy];
    const configs = (sc && sc.vs) ? JSON.parse(sc.vs) : {};
    const title = isTest ? 'Test' : strategy;
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
                      Test
                    </Button>
                    :
                    <Link to={`/triggers?sym=${sym}&aggs_seconds=${configs.aggs_seconds}`} >
                      <Button>
                        Triggers
                      </Button>
                    </Link>
                  }
                  <Link to={`/charts?sym=${sym}&frame=second&strategy=${strategy}&isTest=${isTest ? 1 : 0}`} >
                    <Button>
                      Charts
                    </Button>
                  </Link>
                </ButtonGroup>
              </ListItemText>
              <ListItemSecondaryAction>
                {testLoading && <CircularProgress size={24} />}
              </ListItemSecondaryAction>
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
})

export default compose(
  withStyles(useStyles),
  connect(mapStateToProps, {
    dispatchSetConfigs: setConfigs,
  }),
  withSnackbar,
)(StrategyValues);