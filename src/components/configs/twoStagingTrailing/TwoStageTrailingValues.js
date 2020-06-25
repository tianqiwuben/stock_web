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

import {apiTestConfig} from '../../../utils/ApiFetch';

import {setConfigs} from '../../../redux/configActions';

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


const FIELD_MAP = {
  aggs_seconds: 'Aggregation seconds',
  ma_v_threshould: 'MA Vol Trigger',
  c_diff_threshould: 'Price Diff Trigger %',
  stop_trailing_diff: 'Stop Trailing %',
  half_target: 'Half Target %',
}

class TwoStageTrailingValues extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      testLoading: false,
    }
  }

  handleChange = (field, e) => {
    const {
      two_stage_trailing_test,
      two_stage_trailing,
      isTest,
      dispatchSetConfigs,
    } = this.props;
    const newConf = {};
    if (isTest) {
      const newVs = (two_stage_trailing_test && two_stage_trailing_test.vs) ? JSON.parse(two_stage_trailing_test.vs) : {};
      newVs[field] = e.target.value;
      newConf['two_stage_trailing_test'] = {
        ...two_stage_trailing_test,
        vs: JSON.stringify(newVs),
      }
    } else {
      const newVs = (two_stage_trailing && two_stage_trailing.vs) ? JSON.parse(two_stage_trailing.vs) : {};
      newVs[field] = e.target.value;
      newConf['two_stage_trailing'] = {
        ...two_stage_trailing,
        vs: JSON.stringify(newVs),
      }
    }
    dispatchSetConfigs(newConf);
  }

  onSave = () => {
    const {
      two_stage_trailing_test,
      two_stage_trailing,
      isTest,
    } = this.props;
    const k = isTest ? 'two_stage_trailing_test' : 'two_stage_trailing';
    const payload = {
      configs: {
        [k]: isTest ? two_stage_trailing_test : two_stage_trailing,
      },
    };
    const {onChangeConfig} = this.props;
    onChangeConfig(payload);
  }

  onTest = () => {
    const {
      sym
    } = this.props;
    const payload = {
      strategy: 'two_stage_trailing',
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
      two_stage_trailing_test,
      two_stage_trailing,
      isPercent,
    } = this.props;
    const {
      testLoading,
    } = this.state;
    const sc = isTest ? two_stage_trailing_test : two_stage_trailing;
    const configs = (sc && sc.vs) ? JSON.parse(sc.vs) : {};
    const title = isTest ? 'Test' : 'Vol Triggers - Two Stage Trailing';
    return (
      <Grid item sm={12} md={6} lg={isTest ? 3 : 4}>
        <Paper>
            <List subheader={<ListSubheader>{title}</ListSubheader>}>
            {
              Object.keys(FIELD_MAP).map(field => {
                let title = isTest ? field : FIELD_MAP[field];
                if (FIELD_MAP[field].substr(-1) === '%') {
                  title += ` $${(last_c * configs[field] / 100).toFixed(3)}`;
                }
                const pctField = `${field}${isPercent ? '_pct' : ''}`;
                return (
                  <ListItem key={field}>
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
  two_stage_trailing: state.configs.two_stage_trailing,
  two_stage_trailing_test: state.configs.two_stage_trailing_test,
  last_c: state.configs.last_c,
  sym: state.configs.sym,
  isPercent: state.configs.isPercent,
})

export default compose(
  withStyles(useStyles),
  connect(mapStateToProps, {
    dispatchSetConfigs: setConfigs,
  }),
)(TwoStageTrailingValues);