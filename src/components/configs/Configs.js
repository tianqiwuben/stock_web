import React from 'react';
import compose from 'recompose/compose';
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import FormControl from '@material-ui/core/FormControl';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Checkbox from '@material-ui/core/Checkbox';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Grid from '@material-ui/core/Grid';
import {connect} from 'react-redux';

import LinearProgress from '@material-ui/core/LinearProgress';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListSubheader from '@material-ui/core/ListSubheader';
import Slider from '@material-ui/core/Slider';
import OptimizationResults from './OptimizationResults';
import Switch from '@material-ui/core/Switch';

import {
  setConfigs,
  resetConfigs,
} from '../../redux/configActions';

import {
  saveOptimizations,
} from '../../redux/optimizationActions';

import TwoStageTrailing from './twoStagingTrailing/TwoStageTrailing';

import {
  apiGetConfig,
  apiPostConfig,
  apiGetOptimizationResult,
} from '../../utils/ApiFetch';

const useStyles = theme => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  slider: {
    width: '100%',
  },
  error: {
    margin: theme.spacing(1),
    color: 'red',
    paddingBottom: theme.spacing(2),
    display: 'inline',
  },
});

class Configs extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sym: props.sym,
      slider: 0.2,
    }
  }

  onFetch = () => {
    const {sym} = this.state;
    const {dispatchSetConfigs, dispatchResetConfigs, strategy} = this.props;
    dispatchResetConfigs();
    apiGetConfig(sym).then(rest => {
      if (rest.data.success) {
        this.setState({sym: rest.data.payload.sym});
        if (strategy.length === 0) {
          rest.data.payload.strategy = rest.data.payload.current_strategy.vs;
        }
        dispatchSetConfigs(rest.data.payload);
        this.onFetchOptimization(rest.data.payload.current_strategy.vs);
      }
    })
  }

  onFetchOptimization = (strategy) => {
    const {sym} = this.props;
    const query = {
      strategy,
    }
    apiGetOptimizationResult(sym, query).then(resp => {
      if (resp.data && resp.data.success) {
        const {dispatchSaveOptimization} = this.props;
        dispatchSaveOptimization(strategy, resp.data.payload);
      }
    })
  }

  handleChange = (field, e) => {
    this.setState({
      [field]: e.target.value,
    });
  }

  numberWithCommas = (x) => {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  onChangeSlider = (e, v) => {
    this.setState({slider: v});
  }

  onTogglePercent = () => {
    const {isPercent, dispatchSetConfigs} = this.props;
    dispatchSetConfigs({isPercent: !isPercent});
  }

  onChangeConfig = (payload) => {
    const {sym} = this.state;
    apiPostConfig(sym, payload).then(rest => {
      if (rest.data.success) {
        this.setState(rest.data.payload);
        const {dispatchSetConfigs} = this.props;
        dispatchSetConfigs(rest.data.payload);
      }
    })
  }

  changeStrategy = (e) => {
    const {dispatchSetConfigs, strategy} = this.props;
    const newStra = e.target.value;
    if (strategy !== newStra) {
      dispatchSetConfigs({strategy: newStra});
      this.onFetchOptimization(newStra);
    }
  }

  render() {
    const {
      sym,
      slider,
    } = this.state;
    const {
      classes,
      last_c,
      last_v,
      isPercent,
      strategy,
    } = this.props;
    return (
      <React.Fragment>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6} lg={4}>
            <Paper>
              <List subheader={<ListSubheader>OverView</ListSubheader>}>
                <ListItem>
                  <ListItemText>Symbol</ListItemText>
                  <ListItemSecondaryAction>
                    <Button color="primary" onClick={this.onFetch}>
                      Fetch
                    </Button>
                    <TextField
                      value={sym}
                      onChange={e => this.handleChange('sym', e)}
                      inputProps={{
                        style: { textAlign: "right" }
                      }}
                      style = {{width: 80}}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemText>Latest Price</ListItemText>
                  <ListItemSecondaryAction>{`$${last_c}`}</ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemText>Daily Vol</ListItemText>
                  <ListItemSecondaryAction>{`${this.numberWithCommas(last_v)}`}</ListItemSecondaryAction>
                </ListItem>
              </List>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <Paper>
              <List subheader={<ListSubheader>OverView</ListSubheader>}>
                <ListItem>
                  <ListItemText>Absolute / Percent</ListItemText>
                  <ListItemSecondaryAction>
                    <Switch
                      color="primary"
                      checked={isPercent}
                      onChange={this.onTogglePercent}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemText>{`Price x ${slider}%`}</ListItemText>
                  <ListItemSecondaryAction>{`${(last_c * slider / 100).toFixed(3)}`}</ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemText>
                    <div className={classes.slider}>
                      <Slider
                        defaultValue={0.2}
                        step={0.02}
                        min={0.02}
                        max={1}
                        onChange={this.onChangeSlider}
                      />
                    </div>
                  </ListItemText>
                </ListItem>
              </List>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6} lg={5}>
            <Paper>
              <List subheader={<ListSubheader>Strategy</ListSubheader>}>
                <ListItem>
                  <ListItemText>
                    <Select
                      value={strategy}
                      onChange={this.changeStrategy}
                      autoWidth
                    >
                      <MenuItem value={'two_stage_trailing'}>two_stage_trailing</MenuItem>
                      <MenuItem value={'one_stage_long_limit'}>one_stage_long_limit</MenuItem>
                    </Select>
                  </ListItemText>
                  <ListItemSecondaryAction>
                    <Button color="primary" onClick={this.onFetch}>
                      Save
                    </Button>
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
            </Paper>
          </Grid>
        </Grid>
        <TwoStageTrailing
          onChangeConfig={this.onChangeConfig}
        />
        <OptimizationResults onFetchConfigs={this.onFetch}/>
      </React.Fragment>
    );
  }
}

const mapStateToProps = state => ({
  last_c: state.configs.last_c,
  last_v: state.configs.last_v,
  isPercent: state.configs.isPercent || false,
  sym: state.configs.sym,
  strategy: state.configs.strategy,
})

export default compose(
  withStyles(useStyles),
  connect(mapStateToProps, {
    dispatchSetConfigs: setConfigs,
    dispatchResetConfigs: resetConfigs,
    dispatchSaveOptimization: saveOptimizations,
  }),
)(Configs);