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

import LinearProgress from '@material-ui/core/LinearProgress';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListSubheader from '@material-ui/core/ListSubheader';
import Slider from '@material-ui/core/Slider';

import VolTwoStage from './VolTwoStage';

import {
  apiGetConfig,
  apiPostConfig,
} from '../../utils/ApiFetch';

const useStyles = theme => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  slider: {
    width: 200,
  },
  error: {
    margin: theme.spacing(1),
    color: 'red',
    paddingBottom: theme.spacing(2),
    display: 'inline',
  },
});

let symStore = 'SPY';

class Configs extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sym: symStore,
      last_c: 0,
      last_v: 0,
      slider: 0.2,
    }
    this.registeredModules = {};
  }

  componentDidMount() {
    this.onFetch();
  }

  componentWillUnmount() {
    const {sym} = this.state;
    symStore = sym;
  }

  onFetch = () => {
    const {sym} = this.state;
    apiGetConfig(sym).then(rest => {
      if (rest.data.success) {
        this.setState(rest.data.payload);
        for(let name in this.registeredModules) {
          this.registeredModules[name].updateData(rest.data.payload);
        }
      }
    })
  }

  handleChange = (field, e) => {
    this.setState({
      [field]: e.target.value,
    });
    if (field === 'sym') {
      for(let name in this.registeredModules) {
        this.registeredModules[name].updateData({});
      }
    }
  }

  numberWithCommas = (x) => {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  registerModule = (name, inst) => {
    this.registeredModules[name] = inst;
  }

  onChangeSlider = (e, v) => {
    this.setState({slider: v});
  }

  onChangeConfig = (payload) => {
    const {sym} = this.state;
    apiPostConfig(sym, {configs: payload}).then(rest => {
      if (rest.data.success) {
        this.setState(rest.data.payload);
        for(let name in this.registeredModules) {
          this.registeredModules[name].updateData(rest.data.payload);
        }
      }
    })
  }

  render() {
    const {
      sym,
      last_c,
      last_v,
      slider,
    } = this.state;
    const {classes} = this.props;
    return (
      <Grid container spacing={3}>
        <Grid item xs={6} md={4} lg={4}>
          <Paper>
            <List subheader={<ListSubheader>OverView</ListSubheader>}>
              <ListItem>
                <ListItemText>Symbol</ListItemText>
                <ListItemSecondaryAction>
                  <TextField
                    value={sym}
                    onChange={e => this.handleChange('sym', e)}
                    inputProps={{
                      style: { textAlign: "right" }
                    }}
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
                <ListItemText>{`Price x ${slider}%`}</ListItemText>
                <ListItemSecondaryAction>{`${(last_c * slider / 100).toFixed(3)}`}</ListItemSecondaryAction>
              </ListItem>
              <ListItem>
                <ListItemText>Price %</ListItemText>
                <ListItemSecondaryAction>
                  <div className={classes.slider}>
                    <Slider
                      defaultValue={0.2}
                      step={0.02}
                      min={0.02}
                      max={1}
                      onChange={this.onChangeSlider}
                    />
                  </div>
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem>
                <ListItemText>
                  <Button color="primary" onClick={this.onFetch}>
                    Fetch
                  </Button>
                </ListItemText>
              </ListItem>
            </List>
          </Paper>
        </Grid>
        <VolTwoStage
          registerModule={this.registerModule}
          doFetch={this.onFetch}
          onChangeConfig={this.onChangeConfig}
        />
        <VolTwoStage
          isTest={true}
          registerModule={this.registerModule}
          doFetch={this.onFetch}
          onChangeConfig={this.onChangeConfig}
        />
      </Grid>
    );
  }
}


export default compose(
  withStyles(useStyles),
)(Configs);