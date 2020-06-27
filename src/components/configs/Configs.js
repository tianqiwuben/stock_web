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
import querystring from 'querystring';
import LinearProgress from '@material-ui/core/LinearProgress';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListSubheader from '@material-ui/core/ListSubheader';
import OptimizationResults from './OptimizationResults';
import Switch from '@material-ui/core/Switch';
import StrategyDB from '../common/StrategyDB';


import {
  setConfigs,
  resetConfigs,
} from '../../redux/configActions';


import StrategyPanel from './StrategyPanel';

import {
  apiGetConfig,
  apiPostConfig,
} from '../../utils/ApiFetch';

const useStyles = theme => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
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
    }
  }

  componentDidMount() {
    const {
      sym,
    } = this.state;
    const {
      match,
      location,
      strategy,
      dispatchSetConfigs,
    } = this.props;
    const st = {sym};
    if (match.params.id && match.params.id !== sym) {
      st.sym = match.params.id;
    }
    if (location && location.search) {
      const query = querystring.decode(location.search.substring(1))
      if (query.strategy && query.strategy !== strategy && StrategyDB[query.strategy]) {
        dispatchSetConfigs({strategy: query.strategy});
      }
    }
    this.setState(st, this.onFetch);
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
    }
  }

  onSaveStrategy = () => {
    const {strategy} = this.props;
    const payload = {
      configs: {
        current_strategy: {
          vs: strategy,
        }
      }
    }
    this.onChangeConfig(payload);
  }

  render() {
    const {
      sym,
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
                      {
                        Object.keys(StrategyDB).map(key => (
                          <MenuItem key={key} value={key}>{key}</MenuItem>
                        ))
                      }
                    </Select>
                  </ListItemText>
                  <ListItemSecondaryAction>
                    <Button color="primary" onClick={this.onSaveStrategy}>
                      Save
                    </Button>
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
            </Paper>
          </Grid>
        </Grid>
        {
          strategy.length > 0 &&
          <StrategyPanel
            onChangeConfig={this.onChangeConfig}
          />
        }
        {
          strategy.length > 0 &&
          <OptimizationResults onFetchConfigs={this.onFetch}/>
        }
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
  }),
)(Configs);