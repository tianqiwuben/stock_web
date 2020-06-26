import React from 'react';
import compose from 'recompose/compose';
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import FormControl from '@material-ui/core/FormControl';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Grid from '@material-ui/core/Grid';
import CircularProgress from '@material-ui/core/CircularProgress';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListSubheader from '@material-ui/core/ListSubheader';
import {connect} from 'react-redux';

import {apiTestConfig} from '../../utils/ApiFetch';

import {setConfigs} from '../../redux/configActions';

import StrategyDB from '../common/StrategyDB';

import {
  Link,
} from "react-router-dom";

const useStyles = theme => ({
  wrapper: {
    position: 'relative',
    display: 'inline',
  },
  buttonProgress: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12,
  },
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
    } = this.props;
    const payload = {
      strategy: strategy,
    }
    this.setState({testLoading: true});
    apiTestConfig(sym, payload).then(resp => {
      if(resp.data && resp.data.success) {
        this.setState({testLoading: false});
      }
    })
  }

  render() {
    const {
      classes,
      last_c,
      isTest,
      all_configs,
      strategy,
      isPercent,
    } = this.props;
    const {
      testLoading,
    } = this.state;
    const sc = isTest ? all_configs[`${strategy}_test`] : all_configs[strategy];
    const configs = (sc && sc.vs) ? JSON.parse(sc.vs) : {};
    const title = isTest ? 'Test' : StrategyDB[strategy].name;
    return (
      <Grid item sm={12} md={6} lg={isTest ? 3 : 4}>
        <Paper>
            <List subheader={<ListSubheader>{title}</ListSubheader>}>
            {
              StrategyDB[strategy].fields.map(field => {
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
                <Button color="primary" onClick={this.onSave}>
                  Save
                </Button>
                {
                  isTest ?
                  <div className={classes.wrapper}>
                    <Button onClick={this.onTest}>
                      Test
                    </Button>
                    {testLoading && <CircularProgress size={24} className={classes.buttonProgress} />}
                  </div>
                  :
                  <Link to={`/triggers?sym=${this.sym}&aggs_seconds=${configs.aggs_seconds}`} >
                    <Button>
                      Triggers
                    </Button>
                  </Link>
                }
                <Link to={`/charts?sym=${this.sym}&frame=seconds&strategy=vol_two_stage_trailing${isTest ? '_test' : ''}`} >
                  <Button>
                    Charts
                  </Button>
                </Link>
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
})

export default compose(
  withStyles(useStyles),
  connect(mapStateToProps, {
    dispatchSetConfigs: setConfigs,
  }),
)(StrategyValues);