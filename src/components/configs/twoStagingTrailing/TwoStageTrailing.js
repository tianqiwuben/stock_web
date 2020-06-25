import React from 'react';
import compose from 'recompose/compose';
import {connect} from 'react-redux';
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
import TwoStageTrailingValues from './TwoStageTrailingValues';
import TwoStageTrailingOptimization from './TwoStageTrailingOptimization';

import {
  Link,
} from "react-router-dom";

const useStyles = theme => ({

});


const FIELD_MAP = {
  ma_v_seconds: 'MA Vol seconds',
  c_diff_seconds: 'Price Diff seconds',
  ma_v_threshould: 'MA Vol Trigger',
  c_diff_threshould: 'Price Diff Trigger %',
  stop_trailing_diff: 'Stop Trailing %',
  half_target: 'Half Target %',
}

class TwoStageTrailing extends React.Component {
  constructor(props) {
    super(props);
    this.sym = '';
  }


  updateData = (data) => {
    this.sym = data.sym;
  }

  render() {
    const {classes, onChangeConfig} = this.props;
    return (
      <Grid container spacing={3}>
        <TwoStageTrailingValues
          onChangeConfig={onChangeConfig}
        />
        <TwoStageTrailingValues
          isTest={true}
          onChangeConfig={onChangeConfig}
        />
        <TwoStageTrailingOptimization 
          onChangeConfig={onChangeConfig}
        />
      </Grid>
    );
  }
}

const mapStateToProps = state => ({
})

export default compose(
  withStyles(useStyles),
  connect(mapStateToProps),
)(TwoStageTrailing);